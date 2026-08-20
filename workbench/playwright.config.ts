import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // CI runners — windows-latest especially — starve two parallel Chrome
  // instances of CPU: Playwright's rAF-based actionability ("stable") checks
  // and fullPage screenshots then stall past any per-test budget (observed on
  // windows-latest: 30s timeouts surfacing ~74s late while both first-started
  // workers hung). One worker on CI keeps each test's timing honest, and the
  // larger CI budget is cold-start headroom — every assertion is unchanged.
  workers: process.env.CI ? 1 : undefined,
  timeout: process.env.CI ? 60_000 : 30_000,
  retries: 0,
  reporter: 'line',
  use: {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});
