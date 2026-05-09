# TC-COMPARE-03 — Remove one product, replace with another

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-COMPARE-03 |
| **Spec ID** | TC-CP-003 |
| **Title** | Remove one product from compare and verify table updates |
| **Module** | Compare Products |
| **Feature** | Compare — remove + add round-trip |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.CATEGORY_URL`.

## Test Data

| Key | Value |
| --- | --- |
| Initial products | `htcTouch`, `canon` |
| Replacement | `ipod` |

## Test Steps

1. Add the two initial products to compare.
2. Navigate to the compare page; verify both products appear.
3. Remove `htcTouch` from the compare table.
4. Go back to the category page and add `ipod`.
5. Re-navigate to the compare page.

## Expected Result

- After step 3: only `canon` remains.
- After step 5: the compare table contains `ipod` and `canon` (in that order).

## Automation

- **Spec:** [`tests/ui/test-compare-products.spec.ts:35`](../../../../tests/ui/test-compare-products.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/compare-products.md`](../../../../knowledge-base/ui/compare-products.md)
