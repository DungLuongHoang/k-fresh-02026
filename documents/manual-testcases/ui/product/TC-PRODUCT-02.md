# TC-PRODUCT-02 — Add to compare from product card

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PRODUCT-02 |
| **Spec ID** | TC02 |
| **Title** | Verify add-to-compare functionality |
| **Module** | Product |
| **Feature** | Product card → add to compare |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Minor |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.BASE_URL`.

## Test Steps

1. From the homepage, click **Add to Compare** on the `productData.productName` product card.

## Expected Result

- A success notification box (`#notification-box-top`) is displayed indicating the product was added to the comparison list (`expectCompareNotificationBox()`).

## Notes

- This test only proves the toast appears; full comparison-table behaviour is exercised by the `Compare Products` suite (`TC-COMPARE-01..05`).

## Automation

- **Spec:** [`tests/ui/test-product.spec.ts:16`](../../../../tests/ui/test-product.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/product.md`](../../../../knowledge-base/ui/product.md)
