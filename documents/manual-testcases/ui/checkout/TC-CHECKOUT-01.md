# TC-CHECKOUT-01 — Checkout with a different shipping address

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CHECKOUT-01 |
| **Spec ID** | TC_CHK_001 |
| **Title** | Verify successful checkout using a different shipping address |
| **Module** | Checkout |
| **Feature** | Billing ≠ Shipping address |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional / Smoke |
| **Tags** | `@smoke @regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Suite `beforeEach`:
  - A new buyer is registered.
  - The product `HP LP3065` has been bought via **Buy Now** (`productPage.buySpecificItemNow`), so the user lands on the checkout page with the item already in the cart.
- Two profiles + addresses have been generated: a `buyer` and a `receiver`.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Buyer profile | Random | `data/checkout-data.ts` → `generateUserProfile()` |
| Buyer address | Random | `data/checkout-data.ts` → `generateAddress()` |
| Receiver profile | Random (independent) | same |
| Receiver address | Random (independent) | same |

## Test Steps

1. Fill billing details with the **buyer** profile + address.
2. Verify the shipping section is visible.
3. Fill shipping details with the **receiver** profile + address (different person).
4. Tick **Terms & Conditions**.
5. Click **Continue**.
6. Confirm the order on the final review step.

## Expected Result

- After step 6: an order-success page is displayed (`confirmOrderAndVerifySuccess()`).
- The order summary shows the buyer's billing address and the receiver's shipping address.

## Automation

- **Spec:** [`tests/ui/test-checkout.spec.ts:49`](../../../../tests/ui/test-checkout.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/checkout.md`](../../../../knowledge-base/ui/checkout.md)
