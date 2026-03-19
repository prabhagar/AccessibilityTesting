import { expect, test } from "@playwright/test";
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

  test("home page should expose one level-1 heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("home page should be keyboard reachable for primary link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName?.toLowerCase() ?? ""
    );

    expect(focusedTag).not.toBe("body");
  });

  test("home page links should have visible text labels", async ({ page }) => {
    await page.goto("/");

    const emptyLabelLinks = await page.locator("a").evaluateAll((links) => {
      return links
        .filter((link) => {
          const text = link.textContent?.trim() ?? "";
          return text.length === 0;
        })
        .map((link) => link.getAttribute("href") ?? "(no href)");
    });

    expect(emptyLabelLinks, `Links without visible text labels: ${emptyLabelLinks.join(", ")}`).toEqual([]);
  });
});
