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

  test("home page keyboard tab flow should keep focus visible and on interactive elements", async ({ page }) => {
    await page.goto("/");

    // Start tabbing from inside the document to avoid browser chrome focus.
    await page.locator("body").click({ position: { x: 10, y: 10 } });

    const focusableCount = await page.locator("a, button, input, select, textarea, [tabindex]").count();
    const stepsToCheck = Math.min(3, Math.max(1, focusableCount));

    for (let step = 0; step < stepsToCheck; step++) {
      await page.keyboard.press("Tab");

      let focusedTag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase() ?? "");
      if (focusedTag === "body") {
        await page.keyboard.press("Tab");
        focusedTag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase() ?? "");
      }

      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element) {
          return null;
        }

        const interactiveTags = ["a", "button", "input", "select", "textarea", "summary"];
        const role = element.getAttribute("role") ?? "";
        const tabIndex = Number(element.getAttribute("tabindex") ?? "-1");
        const tag = element.tagName.toLowerCase();
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        const isInteractive =
          interactiveTags.includes(tag) ||
          role === "button" ||
          role === "link" ||
          role === "menuitem" ||
          tabIndex >= 0;

        const isVisible =
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          rect.width > 0 &&
          rect.height > 0;

        return {
          tag,
          isInteractive,
          isVisible,
          isFocusVisible: element.matches(":focus-visible"),
        };
      });

      expect(focused).not.toBeNull();
      expect(focused?.tag).not.toBe("body");
      expect(focused?.isInteractive).toBe(true);
      expect(focused?.isVisible).toBe(true);
      expect(focused?.isFocusVisible).toBe(true);
    }
  });

  test("dialog should open and close with keyboard when a trigger exists", async ({ page }) => {
    await page.goto("/");

    const potentialTrigger = page
      .locator("button, [role='button'], a[aria-haspopup='dialog'], [data-dialog-trigger]")
      .first();

    const triggerCount = await potentialTrigger.count();
    test.skip(triggerCount === 0, "No dialog trigger found on this page.");

    await potentialTrigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.locator("[role='dialog'], [aria-modal='true']").first();
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
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
