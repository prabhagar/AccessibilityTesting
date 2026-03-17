# Playwright Accessibility Automation Starter

This workspace helps you automate accessibility testing with Playwright and axe-core.

## What is included

- Playwright test runner
- axe-core integration via `@axe-core/playwright`
- Reusable helper for severity-threshold validation
- Example accessibility tests
- HTML report output

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
npm install
npx playwright install
```

## Run tests

```bash
npm test
```

Run with visible browser:

```bash
npm run test:headed
```

Open Playwright UI mode:

```bash
npm run test:ui
```

Open last HTML report:

```bash
npm run report
```

## File structure

- `playwright.config.ts`: test runner configuration
- `helpers/a11y.ts`: reusable accessibility assertion helper
- `tests/accessibility.spec.ts`: example accessibility tests

## How to test your own site

1. Open `playwright.config.ts`.
2. Change `baseURL` to your app URL.
3. Add new tests in `tests/accessibility.spec.ts`.
4. Reuse `expectNoA11yViolations(page, testInfo, "serious")`.

## Learning progression (7 days)

1. Day 1: Setup and first scan
2. Day 2: Multi-page scans
3. Day 3: Keyboard-flow checks
4. Day 4: Form and ARIA coverage
5. Day 5: Component-level tests
6. Day 6: CI integration and reporting
7. Day 7: Full flow audit suite

## Notes

- Automation finds many issues, but not all accessibility problems.
- Add manual checks for screen-reader behavior and true keyboard usability.
