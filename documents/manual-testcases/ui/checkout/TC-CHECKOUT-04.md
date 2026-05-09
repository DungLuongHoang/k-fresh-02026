# TC-CHECKOUT-04 — New-user happy path with order comment

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CHECKOUT-04 |
| **Spec ID** | TC_CHK_004 |
| **Title** | New user happy path — complete checkout from scratch with order comment |
| **Module** | Checkout |
| **Feature** | End-to-end happy path with default delivery/payment + order comment |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional / Integration |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-CHECKOUT-01`.

## Test Data

| Key | Value |
| --- | --- |
| Order comment | `This is my first order! Please handle with care.` |

## Test Steps

1. Fill billing details with the buyer profile + address.
2. Verify the **Same as billing address** checkbox is auto-checked (`verifySameAddressIsChecked()`).
3. Verify the default delivery method and payment method are pre-selected (`verifyDefaultDeliveryAndPayment()`).
4. Add the order comment.
5. Tick **Terms & Conditions**.
6. Click **Continue**.
7. Confirm the order.

## Expected Result

- After step 7: the order-success page is displayed (`confirmOrderAndVerifySuccess()`).
- The order summary reflects: billing = shipping (single address), default delivery + payment, the comment text submitted.

## Automation

- **Spec:** [`tests/ui/test-checkout.spec.ts:78`](../../../../tests/ui/test-checkout.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/checkout.md`](../../../../knowledge-base/ui/checkout.md)
