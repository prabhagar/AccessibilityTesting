import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  reporter: [["html", { open: "never", title: "Accessibility Test Report" }], ["list"]],
  use: {
    baseURL: "https://example.com",
    trace: "on-first-retry",
    screenshot: "on",
    video: "retain-on-failure",
  },
});
