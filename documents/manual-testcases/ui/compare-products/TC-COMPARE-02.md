# TC-COMPARE-02 — Verify compare table with 3 products

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-COMPARE-02 |
| **Spec ID** | TC-CP-002 |
| **Title** | Verify all compare-table details with 3 products |
| **Module** | Compare Products |
| **Feature** | Compare — full attribute table |
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
| Products | `htcTouch`, `canon`, `palmTreo` |

## Test Steps

1. Add the three products to the compare list.
2. Navigate to the compare page.
3. Verify the page header is **Product Comparison**.

## Expected Result

- All three products appear in the compare table.
- Each row's name + attribute fields match the data fixture.

## Automation

- **Spec:** [`tests/ui/test-compare-products.spec.ts:21`](../../../../tests/ui/test-compare-products.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/compare-products.md`](../../../../knowledge-base/ui/compare-products.md)
