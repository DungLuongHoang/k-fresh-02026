# TC-CHECKOUT-02 — Recover from missing shipping by toggling "same address"

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CHECKOUT-02 |
| **Spec ID** | TC_CHK_002 |
| **Title** | Verify checkout recovers when toggling shipping address states |
| **Module** | Checkout |
| **Feature** | Shipping section state toggle / validation recovery |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional / Negative-then-recover |
| **Tags** | `@regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-CHECKOUT-01` (buyer registered, item bought via "Buy Now").

## Test Steps

1. Fill billing details with the buyer profile + address.
2. Verify the shipping section is visible.
3. **Without** filling shipping fields, tick **Terms & Conditions** and click **Continue**.
4. Verify shipping validation errors appear.
5. Toggle the **Same as billing address** checkbox to `true`.
6. Click **Continue** again.
7. Confirm the order.

## Expected Result

- After step 4: validation errors are displayed for the shipping fields (`verifyShippingValidationErrors()`).
- After step 7: the order-success page is displayed (`confirmOrderAndVerifySuccess()`).

## Automation

- **Spec:** [`tests/ui/test-checkout.spec.ts:58`](../../../../tests/ui/test-checkout.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/checkout.md`](../../../../knowledge-base/ui/checkout.md)
