import { test } from "@playwright/test";
import { expectNoA11yViolations } from "../helpers/a11y";

test.describe("Accessibility automation", () => {
  test("home page should have no serious or critical WCAG violations", async ({ page }, testInfo) => {
    await page.goto("/");
    await expectNoA11yViolations(page, testInfo, "serious");
  });

  test("more information page should have no critical WCAG violations", async ({ page }, testInfo) => {
    await page.goto("https://www.iana.org/help/example-domains");
    await expectNoA11yViolations(page, testInfo, "critical");
  });
});
