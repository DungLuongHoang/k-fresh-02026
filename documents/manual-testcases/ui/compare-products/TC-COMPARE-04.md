# TC-COMPARE-04 — Remove all products, verify empty state

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-COMPARE-04 |
| **Spec ID** | TC-CP-004 |
| **Title** | Remove all products and verify empty state |
| **Module** | Compare Products |
| **Feature** | Compare — empty state + redirect |
| **Type** | UI |
| **Priority** | Low |
| **Severity** | Minor |
| **Test Type** | Functional / UI |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.CATEGORY_URL`.

## Test Data

| Key | Value |
| --- | --- |
| Products | `htcTouch`, `canon` |
| Empty-state message | `You have not chosen any products to compare.` |

## Test Steps

1. Add the two products and navigate to the compare page.
2. Remove both products from the compare table.
3. Click **Continue**.
4. Verify the user is on the **Your Store** (home) page.
5. Navigate directly to `Constants.COMPARE_URL`.

## Expected Result

- After step 4: page is `Your Store`.
- After step 5: the compare page shows `You have not chosen any products to compare.`

## Automation

- **Spec:** [`tests/ui/test-compare-products.spec.ts:52`](../../../../tests/ui/test-compare-products.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/compare-products.md`](../../../../knowledge-base/ui/compare-products.md)
