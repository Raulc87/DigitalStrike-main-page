import { defineConfig, devices } from '@playwright/test';

// e2e runs against the built site (astro preview) and, for the lead flow, the local mock
// endpoint (`npm run mock:lead`, owned by Agent 3). PLAYWRIGHT_BASE_URL overrides the target.
const port = Number(process.env.PREVIEW_PORT ?? 4321);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Optional: use a pre-installed Chromium (e.g. /opt/pw-browsers/chromium) instead of the bundled one.
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
          url: `${baseURL}/es/`,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
});
