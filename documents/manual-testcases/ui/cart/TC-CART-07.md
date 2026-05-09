# TC-CART-07 — Add product with multi-quantity from PDP

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-07 |
| **Spec ID** | TC_CART_02 |
| **Title** | Add product with multiple quantity successfully |
| **Module** | Cart |
| **Feature** | Multi-quantity add from PDP stepper |
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
| Quantity | `3` |

## Test Steps

1. From the homepage, click the product card to open its PDP.
2. Set the PDP quantity input to `3` (`productPage.setQuantity(3)`).
3. Click **Add to Cart**; verify the success toast.
4. Click **View Cart**.

## Expected Result

- The cart contains one row for the product with quantity `3` and total `product.price × 3` (`verifyUpdatedProductQuantity({ ...product, quantity: 3 })`).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:88`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
