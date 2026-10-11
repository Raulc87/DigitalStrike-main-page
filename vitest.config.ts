import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: false,
        test: {
          name: 'unit',
          // Node by default; a test that needs DOM APIs opts in with `// @vitest-environment jsdom`
          // (jsdom is pre-installed for the form client and Calendly loader tests).
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: false,
        test: {
          name: 'apps-script',
          environment: 'node',
          include: ['apps-script/tests/**/*.test.{ts,js}'],
        },
      },
    ],
  },
});
