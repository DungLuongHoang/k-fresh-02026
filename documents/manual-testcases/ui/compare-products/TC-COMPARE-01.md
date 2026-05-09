# TC-COMPARE-01 — Add 2 products and verify compare table

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-COMPARE-01 |
| **Spec ID** | TC-CP-001 |
| **Title** | Add 2 products to Compare and verify compare page |
| **Module** | Compare Products |
| **Feature** | Compare — add 2 |
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

| Key | Value | Source |
| --- | --- | --- |
| Products | `htcTouch`, `canon` | `data/products-data.ts` → `products.*` |

## Test Steps

1. From the category page, add `HTC Touch` and `Canon EOS 5D` to the compare list.
2. Click **Compare this product** on the `Canon` card.
3. Verify the page is **Product Comparison**.

## Expected Result

- The compare table contains exactly the two products in the order: `Canon`, `HTC Touch` (verifyProductsDetails compares names + key fields).

## Automation

- **Spec:** [`tests/ui/test-compare-products.spec.ts:12`](../../../../tests/ui/test-compare-products.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/compare-products.md`](../../../../knowledge-base/ui/compare-products.md)
