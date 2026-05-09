# TC-CART-API-03 — Remove product from cart (API)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-API-03 |
| **Spec ID** | TC03 (api) |
| **Title** | POST `checkout/cart/remove` — remove cart line |
| **Module** | Cart API |
| **Feature** | Remove from cart endpoint |
| **Type** | API + DOM verification |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional / Performance / Schema |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-CART-API-02` (cart pre-seeded by setup add).

## Test Data

| Key | Value |
| --- | --- |
| Setup endpoint | `POST checkout/cart/add` |
| Lookup endpoint | `GET common/cart/info` → extract `cartItemKey` |
| Remove endpoint | `POST checkout/cart/remove` |
| Form body | `{ key: <cartItemKey> }` |
| Expected message | `UPDATE_CART_SUCCESS_MESSAGE` |

## Test Steps

1. Add the product via `POST checkout/cart/add`.
2. Fetch `GET common/cart/info` and read the `cartItemKey` for the product.
3. Send `POST checkout/cart/remove` with the key.
4. Re-fetch `GET common/cart/info`.

## Expected Result

| # | Assertion |
| --- | --- |
| 1 | Status code = `200`. |
| 2 | Response time `<` 2000 ms. |
| 3 | Response body length `>` 0 bytes. |
| 4 | Response JSON conforms to schema `{ success: string, total: string }`. |
| 5 | `body.success` contains `Messages.UPDATE_CART_SUCCESS_MESSAGE`. |
| 6 | Side-effect: the product row no longer appears in the re-fetched cart info HTML (`verifyProductRemovedFromCart`). |

## Automation

- **Spec:** [`tests/api/test-cart.spec.ts:99`](../../../../tests/api/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/api/cart.md`](../../../../knowledge-base/api/cart.md)
