# TC-CART-08 — Add product to cart via homepage hover-toast

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-08 |
| **Spec ID** | TC_CART_03 |
| **Title** | Add product to cart from homepage (hover quick-action) |
| **Module** | Cart |
| **Feature** | Homepage product card — quick add-to-cart toast |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | `@regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is logged in (suite `beforeEach`).
- Browser navigates to `Constants.BASE_URL`.

## Test Data

| Key | Value |
| --- | --- |
| Product | env-specific (`getEnvProduct()`) |

## Test Steps

1. From the homepage, hover over the product card.
2. Click the **Add to Cart** quick-action button revealed on hover (does **not** open the PDP).
3. In the toast `#notification-box-top`, verify it contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
4. Click the **View Cart** link inside the toast.

## Expected Result

- The cart contains one row for the product with quantity 1 and total = `product.price`.

## Notes & Risks

- Critical caveat: this flow's success toast is in `#notification-box-top` (NOT the PDP's `role="alert"` banner). Mixing `homePage` and `productPage` POMs here makes the test flaky — verifications and the **View Cart** click must come from `homePage`. See the inline comment in the spec for details.

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:98`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
