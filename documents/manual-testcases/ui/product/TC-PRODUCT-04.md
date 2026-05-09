# TC-PRODUCT-04 — Pop-up functionality

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PRODUCT-04 |
| **Spec ID** | TC04 |
| **Title** | Verify PDP pop-up (zoom / image preview) functionality |
| **Module** | Product |
| **Feature** | PDP — image / preview pop-up |
| **Type** | UI |
| **Priority** | Low |
| **Severity** | Minor |
| **Test Type** | Functional / UI |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.BASE_URL`.

## Test Steps

1. Navigate to the PDP for `productData.productName`.
2. Trigger the pop-up (`checkPopupFunctionality()`).

## Expected Result

- The pop-up opens, displays expected content, and closes correctly as encoded in `productPage.checkPopupFunctionality`.

## Automation

- **Spec:** [`tests/ui/test-product.spec.ts:29`](../../../../tests/ui/test-product.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/product.md`](../../../../knowledge-base/ui/product.md)
