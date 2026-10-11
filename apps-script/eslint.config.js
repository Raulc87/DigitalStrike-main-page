// ESLint config for the Apps Script sources (ESLint looks up the nearest config per file).
// Apps Script loads every file into one global scope as a classic script: the top-level
// functions and vars of each file are globals for the others, and the entry points
// (doPost, doGet, setupSheet) are called by Google. Tests are TypeScript ES modules.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const root = dirname(fileURLToPath(import.meta.url));
const sources = [
  join(root, 'Code.js'),
  ...readdirSync(join(root, 'lib'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(root, 'lib', f)),
];

// Globals shared between the files: every top-level `function` and `var` declaration.
const sharedGlobals = {};
for (const file of sources) {
  for (const m of readFileSync(file, 'utf8').matchAll(/^(?:function|var)\s+([A-Za-z_$][\w$]*)/gm)) {
    sharedGlobals[m[1]] = 'readonly';
  }
}

const appsScriptServices = Object.fromEntries(
  [
    'ContentService',
    'LockService',
    'MailApp',
    'PropertiesService',
    'SpreadsheetApp',
    'Utilities',
  ].map((name) => [name, 'readonly']),
);

export default [
  { ignores: ['node_modules/'] },
  {
    files: ['Code.js', 'lib/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...appsScriptServices, ...sharedGlobals, console: 'readonly' },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Top-level declarations are used by other files or by Google; check locals only.
      'no-unused-vars': ['error', { vars: 'local', caughtErrors: 'none' }],
      'no-redeclare': ['error', { builtinGlobals: false }],
    },
  },
  {
    // Same rules as the root config's `tseslint.configs.recommended`, taken from the plugin:
    // reading `tseslint.configs` here would register this folder as a second tsconfig root
    // and break typescript-eslint for every file in the repository.
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: { parser: tseslint.parser, sourceType: 'module' },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.plugin.configs['eslint-recommended'].overrides[0].rules,
      ...tseslint.plugin.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.ts', '*.mjs', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
