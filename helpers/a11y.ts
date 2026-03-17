import AxeBuilder from "@axe-core/playwright";
import { expect, Page, TestInfo } from "@playwright/test";

export type SeverityThreshold = "critical" | "serious";

export async function expectNoA11yViolations(
  page: Page,
  testInfo: TestInfo,
  threshold: SeverityThreshold = "serious"
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const impacts = threshold === "critical" ? ["critical"] : ["critical", "serious"];

  const violations = results.violations.filter((v) => impacts.includes(v.impact ?? ""));

  if (violations.length > 0) {
    await testInfo.attach("axe-violations.json", {
      body: JSON.stringify(violations, null, 2),
      contentType: "application/json",
    });
  }

  expect(
    violations,
    `Found ${violations.length} accessibility violations at threshold: ${threshold}`
  ).toEqual([]);
}
