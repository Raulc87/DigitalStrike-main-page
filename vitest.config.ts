import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: false,
        test: {
          name: 'unit',
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
