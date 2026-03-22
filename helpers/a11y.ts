import AxeBuilder from "@axe-core/playwright";
import { expect, Page, TestInfo } from "@playwright/test";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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

    const impactColour: Record<string, string> = {
      critical: "#c0392b",
      serious: "#e67e22",
      moderate: "#f1c40f",
      minor: "#3498db",
    };

    const rows = violations
      .map((v) => {
        const colour = impactColour[v.impact ?? "minor"] ?? "#888";
        const nodes = v.nodes
          .map(
            (n) =>
              `<li style="margin:4px 0"><code style="background:#f4f4f4;padding:2px 4px;border-radius:3px">${escapeHtml(n.target.join(" "))}</code><br><span style="color:#555;font-size:0.85em">${escapeHtml(n.failureSummary ?? "")}</span></li>`
          )
          .join("");

        return `<details style="margin-bottom:12px;border:1px solid #ddd;border-radius:4px;padding:8px">
  <summary style="cursor:pointer;font-weight:600">
    <span style="background:${colour};color:#fff;border-radius:3px;padding:2px 6px;font-size:0.8em;margin-right:6px">${escapeHtml(v.impact?.toUpperCase() ?? "UNKNOWN")}</span>
    ${escapeHtml(v.id)} — ${escapeHtml(v.description)}
  </summary>
  <p style="margin:8px 0 4px"><a href="${escapeHtml(v.helpUrl)}" target="_blank" rel="noopener noreferrer">WCAG guidance ↗</a> &nbsp;|&nbsp; Tags: ${v.tags.join(", ")}</p>
  <ul style="margin:0;padding-left:20px">${nodes}</ul>
</details>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Axe Violations</title></head><body style="font-family:sans-serif;max-width:900px;margin:24px auto;padding:0 16px">
<h1 style="font-size:1.4em">Accessibility Violations <span style="color:#c0392b">(${violations.length})</span></h1>
<p style="color:#555">Threshold: <strong>${threshold}</strong> &nbsp;|&nbsp; Checked tags: wcag2a, wcag2aa</p>
${rows}
</body></html>`;

    await testInfo.attach("axe-violations.html", {
      body: html,
      contentType: "text/html",
    });
  }

  expect(
    violations,
    `Found ${violations.length} accessibility violations at threshold: ${threshold}`
  ).toEqual([]);
}
