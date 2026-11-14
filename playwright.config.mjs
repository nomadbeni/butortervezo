// Böngészős tesztek. Helyben: `npm test`. Ha a Playwright saját Chromiumja nincs telepítve,
// a CHROME_PATH környezeti változóval megadható egy meglévő Chrome/Chromium.
import { defineConfig, devices } from '@playwright/test';

const launchOptions = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 950 }, launchOptions, acceptDownloads: true },
  projects: [{ name: 'chromium' }],
});
