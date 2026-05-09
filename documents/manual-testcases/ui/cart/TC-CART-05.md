# TC-CART-05 — Update product quantity to 0 (remove via quantity)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-05 |
| **Spec ID** | TC05 |
| **Title** | Update Product Quantity to 0 (Remove via Quantity) |
| **Module** | Cart |
| **Feature** | Quantity boundary — 0 removes line |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Boundary / Functional |
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
| Updated quantity | `0` |

## Test Steps

1. Search for the product and open its PDP.
2. Click **Add to Cart**; verify the success toast.
3. Click **View Cart**.
4. Set the line's quantity input to `0` and click **Update**.

## Expected Result

- The product row is removed from the cart (`verifyProductRemovedFromCart`) — setting qty=0 is treated as a deletion, equivalent to clicking the trash button.

## Notes & Risks

- This boundary case sits next to `TC-CART-04` which exercises a positive qty change (1 → 2).

## Automation

- **Spec:** [`tests/ui/test-cart.spec.ts:67`](../../../../tests/ui/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md)
