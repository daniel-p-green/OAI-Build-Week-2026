import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  globalSetup: "./tests/visual/global-setup.ts",
  globalTeardown: "./tests/visual/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  use: {
    baseURL: "http://127.0.0.1:3103",
    channel: "chrome",
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/Chicago",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm exec next start -H 127.0.0.1 -p 3103",
    url: "http://127.0.0.1:3103",
    reuseExistingServer: false,
    timeout: 30_000,
    env: { WORKSHOPLM_DATA_ROOT: "../../.workshoplm-visual-test", WORKSHOPLM_NEXT_DIST_DIR: ".next-playwright" },
  },
});
