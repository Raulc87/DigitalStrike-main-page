// API client for the lead endpoint, exactly as contract §2, mapping every response of §7.
import { ERROR_CODES, FIELD_ERROR_CODES, isOneOf } from './types';
import type { ErrorCode, FieldErrorCode, LeadPayload } from './types';

/** §2: client timeout. */
export const LEAD_TIMEOUT_MS = 20_000;

/**
 * Outcome of a submission. `internal_error` also covers network failures, timeouts, non-JSON
 * bodies and bodies without a boolean `ok` (§7); `reason` only helps tests and debugging.
 */
export type FailureReason = 'network' | 'timeout' | 'malformed' | 'unknown_code' | 'no_endpoint';

export type SubmitResult =
  | { kind: 'success'; leadId: string }
  | { kind: 'validation_failed'; fieldErrors: Record<string, FieldErrorCode | string> }
  | { kind: 'rate_limited'; retryAfterSeconds: number | null }
  | {
      kind: 'error';
      errorCode: Exclude<ErrorCode, 'validation_failed' | 'rate_limited'>;
      reason?: FailureReason;
    };

export interface SubmitOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const internal = (reason: FailureReason): SubmitResult => ({
  kind: 'error',
  errorCode: 'internal_error',
  reason,
});

/** Maps a parsed response body to a result (§7). */
export function mapResponse(body: unknown): SubmitResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return internal('malformed');
  }
  const data = body as Record<string, unknown>;
  if (typeof data.ok !== 'boolean') return internal('malformed');
  if (data.ok) {
    return { kind: 'success', leadId: typeof data.lead_id === 'string' ? data.lead_id : '' };
  }
  const code = data.error_code;
  if (!isOneOf(ERROR_CODES, code)) return internal('unknown_code');
  if (code === 'validation_failed') {
    const fieldErrors: Record<string, string> = {};
    const raw = data.field_errors;
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      for (const [field, value] of Object.entries(raw)) {
        if (typeof value === 'string') fieldErrors[field] = value;
      }
    }
    return { kind: 'validation_failed', fieldErrors };
  }
  if (code === 'rate_limited') {
    const retry = data.retry_after_seconds;
    return {
      kind: 'rate_limited',
      retryAfterSeconds: typeof retry === 'number' && Number.isFinite(retry) ? retry : null,
    };
  }
  return { kind: 'error', errorCode: code };
}

export function isKnownFieldError(code: string): code is FieldErrorCode {
  return isOneOf(FIELD_ERROR_CODES, code);
}

/**
 * POSTs the lead as a CORS simple request (`text/plain` JSON string, no other headers), following
 * the Apps Script redirect without credentials. Never throws.
 */
export async function submitLead(
  endpoint: string | undefined,
  payload: LeadPayload,
  { fetchImpl = globalThis.fetch, timeoutMs = LEAD_TIMEOUT_MS }: SubmitOptions = {},
): Promise<SubmitResult> {
  if (!endpoint || endpoint.trim() === '') return internal('no_endpoint');

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchImpl(endpoint.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      credentials: 'omit',
      signal: controller.signal,
    });
    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return internal('malformed');
    }
    return mapResponse(body);
  } catch {
    return internal(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}
