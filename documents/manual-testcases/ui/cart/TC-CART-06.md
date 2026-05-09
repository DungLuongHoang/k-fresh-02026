# TC-CART-06 — Add product to cart (homepage browse flow)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-06 |
| **Spec ID** | TC_CART_01 |
| **Title** | Add product to cart from homepage card click |
| **Module** | Cart |
| **Feature** | Add to cart — homepage entry point |
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

1. From the homepage, click the product card to open its PDP.
2. Click **Add to Cart**; verify the success toast.
3. Click **View Cart**.

## Expected Result

- The cart contains one row for the product with quantity 1 and total = `product.price` (`verifyProductAddedToCart`).

## Notes

- Distinct from `TC-CART-02` (which uses the search flow) and `TC-CART-08` (which uses hover-to-cart from the homepage card without opening the PDP).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:79`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
