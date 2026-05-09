# TC-CART-03 — Remove product from cart

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-03 |
| **Spec ID** | TC03 |
| **Title** | Remove Product from Cart |
| **Module** | Cart |
| **Feature** | Remove via per-row trash button |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
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
| Product | env-specific | `getEnvProduct()` |

## Test Steps

1. Search for the product and open its PDP.
2. Click **Add to Cart**; verify the success toast.
3. Click **View Cart**.
4. Remove every product row from the cart.

## Expected Result

- The product row no longer appears in the cart (`verifyProductRemovedFromCart`).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:41`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
