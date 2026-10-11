// Temporary local config until the frontend scaffold (DS-001) adds the root Vitest config,
// which already includes apps-script/tests/**. Run: npx vitest run --config apps-script/vitest.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: new URL('.', import.meta.url).pathname,
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
