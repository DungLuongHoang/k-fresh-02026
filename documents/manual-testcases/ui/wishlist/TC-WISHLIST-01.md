# TC-WISHLIST-01 — Add product from wishlist to cart

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-WISHLIST-01 |
| **Spec ID** | TC-WL-003 |
| **Title** | Add product from wishlist to cart |
| **Module** | Wishlist |
| **Feature** | Wishlist row → add to cart |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Suite `beforeEach`:
  - Registers a fresh user.
  - Adds the first homepage product to the wishlist via hover-and-click.
  - Navigates to the wishlist page.

## Test Steps

1. Verify the wishlist contains at least one item.
2. From the first wishlist row, click **Add to Cart** and verify the action.

## Expected Result

- The product is moved/copied to the cart and the cart-related success state is verified by `addFirstProductToCartAndVerify()`.

## Automation

- **Spec:** [`tests/ui/test-wish-list.spec.ts:20`](../../../../tests/ui/test-wish-list.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/wish-list.md`](../../../../knowledge-base/ui/wish-list.md)
