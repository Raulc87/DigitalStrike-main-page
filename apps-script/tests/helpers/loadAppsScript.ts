/**
 * Loads the Apps Script sources into a fresh Node `vm` context, the way Apps Script loads
 * them: every file shares one global scope. Top-level `function` and `var` declarations
 * become properties of the returned context (see apps-script/README.md).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// The Apps Script globals are untyped JavaScript, so tests use them loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppsScriptContext = Record<string, any>;

/** Loads lib/*.js, plus Code.js when `withCode` is true; `globals` provides fakes of Google services. */
export function loadAppsScript(options: { withCode?: boolean; globals?: AppsScriptContext } = {}): AppsScriptContext {
  const context: AppsScriptContext = vm.createContext({ ...(options.globals ?? {}) });
  const libDir = join(root, 'lib');
  const files = readdirSync(libDir)
    .filter((f) => f.endsWith('.js'))
    .sort()
    .map((f) => join(libDir, f));
  if (options.withCode) files.push(join(root, 'Code.js'));
  for (const file of files) {
    vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
  }
  return context;
}
