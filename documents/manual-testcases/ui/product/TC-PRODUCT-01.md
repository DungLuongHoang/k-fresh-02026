# TC-PRODUCT-01 — Open product detail page

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PRODUCT-01 |
| **Spec ID** | TC01 |
| **Title** | Verify product detail page renders for the configured environment |
| **Module** | Product |
| **Feature** | PDP navigation |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional / Smoke |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.BASE_URL`. _No registration required._

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Product name | env-specific | `data/product-data.ts` → `productData.productName` |

## Test Steps

1. Navigate to the homepage.
2. Open the product detail page for `productData.productName`.

## Expected Result

- The PDP loads successfully and the product title matches the requested name (`openProductDetail` includes the verification).

## Automation

- **Spec:** [`tests/ui/test-product.spec.ts:10`](../../../../tests/ui/test-product.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/product.md`](../../../../knowledge-base/ui/product.md)
