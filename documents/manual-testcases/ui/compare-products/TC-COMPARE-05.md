# TC-COMPARE-05 — Duplicate product handling

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-COMPARE-05 |
| **Spec ID** | TC-CP-005 |
| **Title** | Verify duplicate handling with page navigation |
| **Module** | Compare Products |
| **Feature** | Compare — deduplication on re-add |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional / Boundary |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.CATEGORY_URL`.

## Test Data

| Key | Value |
| --- | --- |
| Products | `htcTouch`, `canon` |
| Duplicate | `canon` (re-added) |

## Test Steps

1. Add `htcTouch` and `canon` to compare; navigate to compare page; verify both present.
2. Click browser **Back**; from the category page, click **Add to Compare** on `canon` again.
3. Re-navigate to the compare page.

## Expected Result

- Compare table still contains exactly two rows: `canon`, `htcTouch`.
- No duplicate `canon` row is added (`verifyNoDuplicateProducts()`).

## Automation

- **Spec:** [`tests/ui/test-compare-products.spec.ts:70`](../../../../tests/ui/test-compare-products.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/compare-products.md`](../../../../knowledge-base/ui/compare-products.md)
