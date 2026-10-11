/**
 * DigitalStrike lead endpoint — Apps Script entry points (thin wrappers).
 * Contract: docs/specs/LEAD_ENDPOINT_CONTRACT.md v1.0. Logic lives in lib/*.js.
 */

function jsonOutput_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function scriptConfig_() {
  return readConfig(PropertiesService.getScriptProperties().getProperties());
}

function formatSheetDate_(date) {
  return Utilities.formatDate(date, 'America/Costa_Rica', 'yyyy-MM-dd HH:mm:ss');
}

/** Logs only event names, lead_id and error codes — never personal data (NFR-006). */
function logEvent_(entry) {
  console.log(JSON.stringify(entry));
}

/** Health check (US-010 AC1). */
function doGet() {
  return jsonOutput_({ ok: true, service: 'ds-lead-endpoint' });
}

/** Save Lead (contract §5). Always answers HTTP 200 with the §7 body. */
function doPost(e) {
  var body;
  try {
    var config = scriptConfig_();
    var store = null;
    var lazyStore = function () {
      if (!store) {
        store = createSheetStore(SpreadsheetApp.openById(config.sheetId), formatSheetDate_);
      }
      return store;
    };
    body = handleLeadRequest(e && e.postData ? e.postData.contents : undefined, {
      config: config,
      now: function () {
        return new Date();
      },
      random: Math.random,
      lock: LockService.getScriptLock(),
      // The sheet is opened only once a request reaches step 7.
      store: {
        findBySubmissionId: function (id) {
          return lazyStore().findBySubmissionId(id);
        },
        readRecentRows: function (n) {
          return lazyStore().readRecentRows(n);
        },
        appendRow: function (values) {
          return lazyStore().appendRow(values);
        },
        setCell: function (row, column, value) {
          return lazyStore().setCell(row, column, value);
        },
      },
      mailer: {
        getRemainingDailyQuota: function () {
          return MailApp.getRemainingDailyQuota();
        },
        sendEmail: function (message) {
          MailApp.sendEmail(message);
        },
      },
      composeEmail: function (kind, lead, context) {
        // Templates (CONTENT §14) come with DS-011 (US-011, US-012).
        return composeLeadEmail(kind, lead, context);
      },
      log: logEvent_,
    });
  } catch (err) {
    logEvent_({ event: 'unexpected_error', error_code: 'internal_error' });
    body = errorResponse('internal_error');
  }
  return jsonOutput_(body);
}

/**
 * Run once from the Apps Script editor after setting SHEET_ID (runbook APPS_SCRIPT_SETUP.md).
 * Creates the `leads` header, the `status` dropdown and plain-text columns. Safe to re-run.
 */
function setupSheet() {
  var config = scriptConfig_();
  if (!config.sheetId) {
    throw new Error('Set the SHEET_ID Script Property first.');
  }
  var result = setupLeadsSheet(SpreadsheetApp.openById(config.sheetId), function () {
    return SpreadsheetApp.newDataValidation();
  });
  console.log(JSON.stringify({ event: 'setup_sheet_done', sheet: result.sheetName, columns: result.columns }));
}
