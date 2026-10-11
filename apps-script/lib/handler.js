/**
 * The lead request pipeline: contract §5 steps 1–11 and the response bodies of §7.
 *
 * All Google services are injected (`deps`), so the whole flow runs in Node tests:
 *   deps.config   readConfig() result
 *   deps.now()    → Date
 *   deps.random() → number in [0, 1)
 *   deps.lock     { tryLock(ms) → boolean, releaseLock() }            (LockService)
 *   deps.store    { findBySubmissionId(id) → { rowNumber, values } | null,
 *                   readRecentRows(n) → [{ submittedAt, email }],
 *                   appendRow(values) → rowNumber,
 *                   setCell(rowNumber, columnNumber, value) }        (the `leads` sheet)
 *   deps.mailer   { getRemainingDailyQuota() → number, sendEmail(message) }   (MailApp)
 *   deps.composeEmail(kind, lead, context) → MailApp message; kind 'owner' | 'confirmation'
 *   deps.log(entry)  entries hold only event names, lead_id and error codes (NFR-006)
 */

var ERROR_MESSAGES = {
  validation_failed: 'One or more fields are invalid.',
  invalid_json: 'The request body is not a JSON object.',
  payload_too_large: 'The request body is larger than 10 KB.',
  rate_limited: 'Too many submissions; try again later.',
  storage_unavailable: 'The lead could not be stored.',
  internal_error: 'Unexpected error.',
};

function successResponse(leadId) {
  return { ok: true, lead_id: leadId };
}

function errorResponse(errorCode, extra) {
  var body = { ok: false, error_code: errorCode, message: ERROR_MESSAGES[errorCode] };
  Object.keys(extra || {}).forEach(function (key) {
    body[key] = extra[key];
  });
  return body;
}

/**
 * Step 10 for one email. Sends it only while its status is `pending`, then records the outcome.
 * Never throws: a failure is recorded and logged, and never changes the response.
 */
function deliverEmail_(deps, kind, statusColumn, currentStatus, rowNumber, leadId, lead, submittedAt) {
  if (currentStatus !== EMAIL_STATUS.PENDING) {
    return currentStatus;
  }
  var status;
  if (!deps.config.sendEmails) {
    status = EMAIL_STATUS.SKIPPED;
  } else {
    try {
      if (deps.mailer.getRemainingDailyQuota() < 1) {
        status = EMAIL_STATUS.QUOTA_EXCEEDED;
      } else {
        var message = deps.composeEmail(kind, lead, {
          leadId: leadId,
          submittedAt: submittedAt,
          config: deps.config,
        });
        deps.mailer.sendEmail(message);
        status = EMAIL_STATUS.SENT;
      }
    } catch (err) {
      status = EMAIL_STATUS.FAILED;
    }
  }
  try {
    deps.store.setCell(rowNumber, COLUMN[statusColumn], status);
  } catch (err) {
    deps.log({ event: 'email_status_not_recorded', lead_id: leadId, email: kind, status: status });
  }
  deps.log({ event: 'email_' + status, lead_id: leadId, email: kind });
  return status;
}

/** Step 10: owner notification first, then the visitor confirmation. */
function deliverPendingEmails_(deps, rowNumber, leadId, lead, submittedAt, ownerStatus, confirmationStatus) {
  deliverEmail_(deps, 'owner', 'owner_email_status', ownerStatus, rowNumber, leadId, lead, submittedAt);
  deliverEmail_(
    deps,
    'confirmation',
    'confirmation_email_status',
    confirmationStatus,
    rowNumber,
    leadId,
    lead,
    submittedAt
  );
}

/** Steps 7–10, called while holding the script lock. */
function processUnderLock_(deps, lead) {
  // Step 7: idempotency (§5.4), with recovery of emails still `pending`.
  var existing;
  try {
    existing = deps.store.findBySubmissionId(lead.submission_id);
  } catch (err) {
    deps.log({ event: 'storage_read_failed', error_code: 'storage_unavailable' });
    return errorResponse('storage_unavailable');
  }
  if (existing) {
    var stored = leadFromRow(existing.values);
    deps.log({ event: 'duplicate_submission', lead_id: stored.leadId });
    deliverPendingEmails_(
      deps,
      existing.rowNumber,
      stored.leadId,
      stored.lead,
      stored.submittedAt,
      stored.ownerEmailStatus,
      stored.confirmationEmailStatus
    );
    return successResponse(stored.leadId);
  }

  // Step 8: throttles (§5.3), counted from the stored rows.
  var now = deps.now();
  var recentRows;
  try {
    recentRows = deps.store.readRecentRows(throttleRowsToRead(deps.config));
  } catch (err) {
    deps.log({ event: 'storage_read_failed', error_code: 'storage_unavailable' });
    return errorResponse('storage_unavailable');
  }
  var throttle = checkThrottles(recentRows, lead.email, now, deps.config);
  if (throttle.limited) {
    deps.log({ event: 'rate_limited', error_code: 'rate_limited' });
    return errorResponse('rate_limited', { retry_after_seconds: throttle.retryAfterSeconds });
  }

  // Step 9: append the row with both email statuses `pending`.
  var leadId = generateLeadId(now, deps.random);
  var submittedAt = formatCostaRicaDateTime(now);
  var rowNumber;
  try {
    rowNumber = deps.store.appendRow(buildLeadRow(lead, leadId, submittedAt));
  } catch (err) {
    deps.log({ event: 'storage_write_failed', error_code: 'storage_unavailable' });
    return errorResponse('storage_unavailable');
  }
  deps.log({ event: 'lead_stored', lead_id: leadId });

  // Step 10: emails; their outcome never changes the response.
  deliverPendingEmails_(deps, rowNumber, leadId, lead, submittedAt, EMAIL_STATUS.PENDING, EMAIL_STATUS.PENDING);

  // Step 11.
  return successResponse(leadId);
}

/** A decoy success: a random lead_id, nothing stored, nothing sent (§5.1, §5.2). */
function decoyResponse_(deps, reason) {
  deps.log({ event: 'decoy_' + reason });
  return successResponse(generateLeadId(deps.now(), deps.random));
}

/** Contract §5. `rawBody` is the request body string. Returns the §7 response object. */
function handleLeadRequest(rawBody, deps) {
  try {
    // Steps 1–2.
    var parsed = parseRequestBody(rawBody);
    if (!parsed.ok) {
      deps.log({ event: 'rejected', error_code: parsed.errorCode });
      return errorResponse(parsed.errorCode);
    }

    // Step 3: honeypot.
    if (isHoneypotFilled(parsed.body)) {
      return decoyResponse_(deps, 'honeypot');
    }

    // Step 4: validation.
    var validation = validateLead(parsed.body, deps.config.acceptedPrivacyNoticeVersions);
    if (!validation.ok) {
      deps.log({ event: 'rejected', error_code: 'validation_failed', fields: Object.keys(validation.fieldErrors) });
      return errorResponse('validation_failed', { field_errors: validation.fieldErrors });
    }

    // Step 5: minimum fill time.
    if (isTooFast(validation.elapsedMs)) {
      return decoyResponse_(deps, 'too_fast');
    }

    // Step 6: one script lock around steps 7–10.
    var locked;
    try {
      locked = deps.lock.tryLock(LOCK_WAIT_MS);
    } catch (err) {
      locked = false;
    }
    if (!locked) {
      deps.log({ event: 'lock_timeout', error_code: 'storage_unavailable' });
      return errorResponse('storage_unavailable');
    }
    try {
      return processUnderLock_(deps, validation.lead);
    } finally {
      try {
        deps.lock.releaseLock();
      } catch (err) {
        // The lock also expires when the execution ends; the response stands.
        deps.log({ event: 'lock_release_failed' });
      }
    }
  } catch (err) {
    deps.log({ event: 'unexpected_error', error_code: 'internal_error' });
    return errorResponse('internal_error');
  }
}
