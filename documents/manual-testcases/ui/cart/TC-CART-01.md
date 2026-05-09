# TC-CART-01 — Verify empty cart state

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-01 |
| **Spec ID** | TC01 |
| **Title** | Verify Empty Cart |
| **Module** | Cart |
| **Feature** | Empty cart message |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Minor |
| **Test Type** | Functional |
| **Tags** | `@regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is logged in (suite `beforeEach`).
- Browser navigates to `Constants.BASE_URL`.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Empty-cart message | `EMPTY_CART_MESSAGE` | `data/messages-data.ts` |

## Test Steps

1. Navigate to homepage.
2. Click the **Cart** mini-cart button in the header.
3. Click **Edit Cart**.
4. Remove every product currently in the cart.

## Expected Result

- The main cart page displays the message contained in `Messages.EMPTY_CART_MESSAGE` (e.g. _"Your shopping cart is empty!"_).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:23`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
