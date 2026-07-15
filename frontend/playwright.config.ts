import { defineConfig, devices } from "@playwright/test";

const FREIGHTER_EXT = "/home/faiz/.config/chromium/Default/Extensions/bcacfldlkkdogcmkkibnjlakofdplcbk/5.43.0_0";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Pro"] },
    },
    {
      name: "freighter",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        launchOptions: {
          args: [
            `--disable-extensions-except=${FREIGHTER_EXT}`,
            `--load-extension=${FREIGHTER_EXT}`,
            "--disable-features=Translate",
          ],
        },
      },
    },
  ],
  webServer: process.env.CI ? {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  } : undefined,
});
