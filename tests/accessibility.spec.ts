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

  test("home page links should not use missing or placeholder href values", async ({ page }) => {
    await page.goto("/");

    const invalidHrefLinks = await page.locator("a").evaluateAll((links) => {
      return links
        .map((link) => {
          const href = link.getAttribute("href");
          const normalizedHref = href?.trim().toLowerCase() ?? "";
          const isInvalid =
            normalizedHref.length === 0 ||
            normalizedHref === "#" ||
            normalizedHref === "javascript:void(0)" ||
            normalizedHref === "javascript:;";

          if (!isInvalid) {
            return null;
          }

          const label = link.textContent?.trim() || link.getAttribute("aria-label") || "(no label)";
          return `${label} -> ${href ?? "(no href)"}`;
        })
        .filter((entry): entry is string => entry !== null);
    });

    expect(
      invalidHrefLinks,
      `Links with missing or placeholder href values: ${invalidHrefLinks.join(", ")}`
    ).toEqual([]);
  });

  test("home page links should have accessible names", async ({ page }) => {
    await page.goto("/");

    const links = page.getByRole("link");
    const linkCount = await links.count();

    for (let index = 0; index < linkCount; index++) {
      await expect(links.nth(index)).toHaveAccessibleName(/\S/);
    }
  });
});
