# TC-XXXX-NN — <One-line scenario title>

> **How to use:** copy this file, rename it `TC-<MODULE>-<NN>.md` (e.g. `TC-CART-05.md`), and fill in every section. Delete this banner before committing. Then add a row to [`documents/manual-testcases/README.md`](./README.md).

## Metadata

| Field | Value |
| --- | --- |
| **TC ID** | TC-XXXX-NN |
| **Title** | <Concise scenario name — matches the `test(...)` title once automated> |
| **Module** | Cart \| Checkout \| Register \| Profile \| Address Book \| Wishlist \| Compare \| Product \| Home \| API-Cart \| … |
| **Feature** | <Specific feature inside the module> |
| **Type** | UI \| API \| Hybrid |
| **Priority** | High \| Medium \| Low |
| **Severity** | Critical \| Major \| Minor |
| **Test Type** | Functional \| Negative \| Boundary \| Edge \| Permission \| UI \| Integration \| Regression \| Security |
| **Tags (target)** | `@smoke` \| `@regression` \| _none_ |
| **Automation Candidate** | Yes \| No |
| **Requirement Reference** | <Jira/Confluence link or `—`> |
| **Status** | ⏳ Draft |
| **Author** | <name> |
| **Created** | YYYY-MM-DD |

## Preconditions

- <e.g. A registered user exists (handled by the suite-level `beforeEach`)>
- <e.g. Product `HP LP3065` is available in the catalog>
- <e.g. User is logged in>

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| User | Generated per test | `data/user-data.ts` → `generateUserProfileData()` |
| Product | `HP LP3065` (qty 1, $122) | `data/products.json` → `getEnvProduct()` |
| Messages | `Messages.<KEY>` | `data/messages-data.ts` |

## Test Steps

1. <Step 1 — concrete user/system action>
2. <Step 2 — …>
3. <Step 3 — …>
4. <Step 4 — assertion / verification>

## Expected Result

- <Observable UI / API outcome 1 — must be specific and measurable>
- <Observable outcome 2>
- <Observable outcome 3>

> Avoid: "works correctly", "successfully", "as expected". Always describe a UI text, URL, DOM presence, API status code, or state change.

## Negative / Edge Variants (optional)

- **Variant A — <name>:** <how the inputs change and what the expected result becomes>
- **Variant B — <name>:** …

## Notes & Risks

- <Cross-module impact, regression areas, known flakiness, dependencies>

## Automation Hints (optional, for `generate-testcase`)

- **Suggested spec file:** `tests/<ui|api>/test-<feature>.spec.ts`
- **Reusable POMs:** `<pages/ui/...>`, `<pages/api/...>`
- **Reusable factories:** `<data/...>`
- **New POM/locator additions needed?** Yes / No (if Yes, list them)
- **Knowledge base file to update:** `knowledge-base/<ui|api>/<feature>.md`
