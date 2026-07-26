import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests drive the real, built app in a real browser — no
 * mocked services. By default they run against the CRA dev server
 * (`npm start`), which Playwright will boot automatically if nothing is
 * already listening on port 3000.
 *
 * These tests exercise pages that call the real backend API
 * (examService, testService, etc.) via axios. For the fullest coverage,
 * also run the backend (see the backend's own e2e docs) so pages like
 * /tests and the live test-taking flow have real data to render. Pages
 * that don't depend on the backend (Test History, which is entirely
 * localStorage-backed) work standalone.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
