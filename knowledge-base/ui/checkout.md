# Checkout

End-to-end checkout flows: split shipping address, validation recovery, mandatory T&C, and the "happy-path new user" scenario.

- **Spec file:** `tests/ui/test-checkout.spec.ts`
- **Suite:** `Checkout Tests`
- **Tests:** 4
- **Suite timeout:** `Constants.TIMEOUTS.DEFAULT` (set via `test.setTimeout`)
- **Page objects:** `CheckoutPage`, `HomePage`, `ProductPage`, `RegisterPage`
- **Data:** `generateUserProfile()`, `generateAddress()` (from `@data/checkout-data`), `targetProduct = 'HP LP3065'`

## Suite-level setup (`beforeEach`)

1. Log a `--- Start Setup Pre-condition (Registration Mode) ---` line for traceability.
2. Generate a buyer profile + address **and** a separate receiver profile + address (used in TC_CHK_001).
3. Navigate to the homepage and go to the registration page.
4. Register the buyer.
5. From the PDP, "Buy Now" the `HP LP3065` product (`productPage.buySpecificItemNow`) — this seeds the cart and lands on the checkout page.

---

## TC_CHK_001 — Verify successful checkout using a different shipping address

| Field | Value |
| --- | --- |
| Tags | `@smoke` `@regression` |
| Type | UI |
| Source | `tests/ui/test-checkout.spec.ts:49` |

**Test data:** `buyerProfile/Address` for billing, `receiverProfile/Address` for shipping.

**Steps**

1. Fill billing details with the buyer.
2. Verify the shipping section is visible.
3. Fill shipping details with the **receiver** (different from billing).
4. Tick T&C.
5. Click "Continue".

**Expected result**

- Order is confirmed and a success page is shown (`confirmOrderAndVerifySuccess`).

---

## TC_CHK_002 — Verify checkout recovers successfully when toggling shipping address states

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-checkout.spec.ts:58` |

**Steps**

1. Fill billing details with the buyer.
2. Verify the shipping section is visible.
3. Tick T&C.
4. Click "Continue" **without** filling shipping → expect validation errors.
5. Toggle "Same as billing address" **on**.
6. Click "Continue" again.

**Expected result**

- Step 4 surfaces shipping validation errors (`verifyShippingValidationErrors`).
- After toggling same-as-billing, the order is confirmed successfully.

---

## TC_CHK_003 — Mandatory Terms Check – Verify error when Terms & Conditions are not accepted

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-checkout.spec.ts:69` |

**Steps**

1. Fill billing details.
2. Explicitly **un-tick** T&C (`setTermsAndConditions(false)`).
3. Click "Continue" → expect the T&C warning.
4. Re-tick T&C.
5. Click "Continue" again.

**Expected result**

- Step 3 surfaces `verifyTermsWarningMessage()`.
- Step 5 proceeds (no extra success assertion in this test — it asserts the **gate**, not the order outcome).

---

## TC_CHK_004 — New User Happy Path – Complete checkout from scratch

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-checkout.spec.ts:78` |

**Steps**

1. Fill billing details.
2. Verify "Same as billing address" is checked **by default**.
3. Verify the default delivery and payment options are pre-selected.
4. Add an order comment: `'This is my first order! Please handle with care.'`.
5. Tick T&C and click "Continue".

**Expected result**

- The order is confirmed and a success page is shown.
