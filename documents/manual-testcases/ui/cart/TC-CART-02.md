# TC-CART-02 — Add product to cart (search flow)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-02 |
| **Spec ID** | TC02 |
| **Title** | Add Product to Cart |
| **Module** | Cart |
| **Feature** | Add to cart from PDP via search |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional / Smoke |
| **Tags** | `@smoke @regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is logged in (suite `beforeEach`).
- Browser navigates to `Constants.BASE_URL`.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Product | env-specific (default `HP LP3065`, qty 1, $122) | `data/products.json` → `getEnvProduct()` |

## Test Steps

1. Search for the product by name and open its PDP.
2. Click the **+** button to increase quantity above the default.
3. Click **Add to Cart**.
4. Verify the success toast contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
5. Click **View Cart** in the toast.

## Expected Result

- The cart page shows one row for the product with the increased quantity and the recomputed total (`verifyProductAddedToCart`).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:31`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
