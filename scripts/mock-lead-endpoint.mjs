#!/usr/bin/env node
/**
 * Local mock of the lead endpoint (LEAD_ENDPOINT_CONTRACT v1.0 §9). `npm run mock:lead`.
 *
 * It runs the real endpoint logic from apps-script/lib (validation, honeypot, fill time,
 * throttles, idempotency, response bodies), so the client, the mock and the server agree.
 * Only the Google services are replaced: an in-memory store instead of the sheet, no emails
 * (statuses `skipped`), no lock contention.
 *
 *   POST /exec       the contract endpoint (CORS `*` on the response; always HTTP 200)
 *   OPTIONS          refused (405, no CORS headers), like Apps Script, which cannot answer a
 *                    CORS preflight: only a "simple request" works (contract §2:
 *                    `Content-Type: text/plain;charset=utf-8`, no custom headers), so a client
 *                    that sends `application/json` or a custom header fails here as in production
 *   GET  /exec       health check, like doGet
 *   GET  /__leads    stored rows as JSON objects keyed by column name (for tests)
 *   DELETE /__leads  clears the store (for tests)
 *   Call /__leads from Playwright's `request` fixture or Node fetch, not from page JavaScript:
 *   a cross-origin DELETE needs a preflight, which this mock refuses on purpose.
 *
 * Environment:
 *   MOCK_PORT (default 8787), MOCK_HOST (default 127.0.0.1)
 *   MOCK_FAIL=storage   every request that reaches the append returns storage_unavailable
 *   MOCK_ACCEPTED_PRIVACY_NOTICE_VERSIONS (default 2026-10-14-v1)
 *   MOCK_MAX_LEADS_PER_EMAIL_PER_HOUR / MOCK_MAX_LEADS_PER_HOUR / MOCK_MAX_LEADS_PER_DAY
 *     (defaults 3 / 20 / 40, as contract §8)
 *   MOCK_LOG=1          prints the endpoint's log events (no personal data)
 */
import { createServer } from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const libDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps-script', 'lib');
const MAX_REQUEST_BYTES = 1024 * 1024;

/** Loads apps-script/lib/*.js into one vm context, as Apps Script shares one global scope. */
function loadEndpointLogic() {
  const context = vm.createContext({});
  for (const file of readdirSync(libDir)
    .filter((f) => f.endsWith('.js'))
    .sort()) {
    const path = join(libDir, file);
    vm.runInContext(readFileSync(path, 'utf8'), context, { filename: path });
  }
  return context;
}

/** An in-memory stand-in for the `leads` sheet, with the store interface of lib/sheet.js. */
function createMemoryStore(gs, { failStorage }) {
  const rows = [];
  return {
    rows,
    findBySubmissionId(id) {
      const index = rows.findIndex((r) => r[gs.COLUMN.submission_id - 1] === id);
      return index === -1 ? null : { rowNumber: index + 2, values: rows[index].slice() };
    },
    readRecentRows(count) {
      return rows.slice(-count).map((r) => ({
        submittedAt: r[gs.COLUMN.submitted_at - 1],
        email: r[gs.COLUMN.email - 1],
      }));
    },
    appendRow(values) {
      if (failStorage) throw new Error('MOCK_FAIL=storage');
      // Like Google Sheets, a leading guard apostrophe is not part of the stored value.
      rows.push(values.map((v) => (typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v)));
      return rows.length + 1;
    },
    setCell(rowNumber, columnNumber, value) {
      rows[rowNumber - 2][columnNumber - 1] = value;
    },
  };
}

export function createMockLeadEndpoint(env = process.env) {
  const gs = loadEndpointLogic();
  const config = gs.readConfig({
    ACCEPTED_PRIVACY_NOTICE_VERSIONS: env.MOCK_ACCEPTED_PRIVACY_NOTICE_VERSIONS ?? '2026-10-14-v1',
    SEND_EMAILS: 'false',
    MAX_LEADS_PER_EMAIL_PER_HOUR: env.MOCK_MAX_LEADS_PER_EMAIL_PER_HOUR,
    MAX_LEADS_PER_HOUR: env.MOCK_MAX_LEADS_PER_HOUR,
    MAX_LEADS_PER_DAY: env.MOCK_MAX_LEADS_PER_DAY,
  });
  const store = createMemoryStore(gs, { failStorage: env.MOCK_FAIL === 'storage' });
  const deps = {
    config,
    now: () => new Date(),
    random: Math.random,
    lock: { tryLock: () => true, releaseLock: () => {} },
    store,
    mailer: { getRemainingDailyQuota: () => 0, sendEmail: () => {} },
    composeEmail: () => ({}),
    log: (entry) => {
      if (env.MOCK_LOG === '1') console.log(JSON.stringify(entry));
    },
  };

  // Only the simple-response header, as Apps Script's JSON responses carry.
  const cors = { 'Access-Control-Allow-Origin': '*' };

  function send(res, body, status = 200) {
    res.writeHead(status, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  }

  function leadsAsObjects() {
    return store.rows.map((r) => Object.fromEntries(gs.SHEET_COLUMNS.map((c, i) => [c, r[i]])));
  }

  return createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://localhost').pathname;
    if (req.method === 'OPTIONS') {
      // No CORS headers: the browser's preflight fails, as it does against Apps Script.
      res.writeHead(405, { Allow: 'GET, POST' });
      res.end();
      return;
    }
    if (path === '/exec' && req.method === 'GET') {
      send(res, { ok: true, service: 'ds-lead-endpoint' });
      return;
    }
    if (path === '/__leads' && req.method === 'GET') {
      send(res, { leads: leadsAsObjects() });
      return;
    }
    if (path === '/__leads' && req.method === 'DELETE') {
      store.rows.length = 0;
      send(res, { ok: true });
      return;
    }
    if (path === '/exec' && req.method === 'POST') {
      const chunks = [];
      let size = 0;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size <= MAX_REQUEST_BYTES) chunks.push(chunk);
      });
      req.on('end', () => {
        // Bodies above 1 MB are cut; the endpoint logic answers payload_too_large anyway.
        const raw = Buffer.concat(chunks).toString('utf8');
        send(res, gs.handleLeadRequest(raw, deps));
      });
      return;
    }
    send(res, { ok: false, error: 'not_found' }, 404);
  });
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const host = process.env.MOCK_HOST ?? '127.0.0.1';
  const port = Number(process.env.MOCK_PORT ?? 8787);
  createMockLeadEndpoint().listen(port, host, () => {
    const fail = process.env.MOCK_FAIL === 'storage' ? ' (MOCK_FAIL=storage)' : '';
    console.log(`Mock lead endpoint on http://${host}:${port}/exec${fail}`);
  });
}
