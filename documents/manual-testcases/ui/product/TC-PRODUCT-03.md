# TC-PRODUCT-03 — Size chart functionality

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PRODUCT-03 |
| **Spec ID** | TC03 |
| **Title** | Verify size-chart functionality |
| **Module** | Product |
| **Feature** | PDP — size chart modal |
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
2. Trigger the size-chart modal (`checkSizeChartFunctionality()`).

## Expected Result

- The size-chart modal opens, renders chart content, and closes successfully.
- All UI states inside the modal are reachable as encoded in `productPage.checkSizeChartFunctionality`.

## Automation

- **Spec:** [`tests/ui/test-product.spec.ts:23`](../../../../tests/ui/test-product.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/product.md`](../../../../knowledge-base/ui/product.md)
