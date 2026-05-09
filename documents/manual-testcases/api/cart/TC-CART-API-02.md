# TC-CART-API-02 — Update product quantity in cart (API)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-API-02 |
| **Spec ID** | TC02 (api) |
| **Title** | POST `checkout/cart/edit` — update quantity |
| **Module** | Cart API |
| **Feature** | Edit cart line endpoint |
| **Type** | API + DOM verification |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional / Performance |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- The same `apiPage` request context is reused — login state implicit in cookies set by add.
- `getEnvProduct()` returns a valid product.

## Test Data

| Key | Value |
| --- | --- |
| Setup endpoint | `POST checkout/cart/add` (with `product_id` + `quantity` from `getEnvProduct()`) |
| Lookup endpoint | `GET common/cart/info` (HTML) — used to extract the line `key` |
| Edit endpoint | `POST checkout/cart/edit` |
| Edit body | **form-urlencoded:** `quantity[<cartItemKey>]=3` |
| Headers | `X-Requested-With: XMLHttpRequest` |
| Verification endpoint | `GET checkout/cart` (the **full cart page**, not the `common/cart/info` mini-cart fragment) |

## Test Steps

1. Add the product via `POST checkout/cart/add`.
2. Fetch `GET common/cart/info`, parse the HTML into `cartPage` to read the line's `cartItemKey` (`getProductKey(product.name)`).
3. Send `POST checkout/cart/edit` with form-urlencoded body `quantity[<cartItemKey>]=3` and the `X-Requested-With: XMLHttpRequest` header.
4. Re-fetch `GET checkout/cart` (full cart page) and re-parse it into `cartPage` for verification.

## Expected Result

| # | Assertion |
| --- | --- |
| 1 | Status code = `200`. |
| 2 | Response time `<` 2000 ms. |
| 3 | Response body length `>` 0 bytes. |
| 6 | Side-effect verification: cart row for `product.name` shows quantity `3` and total = `product.price × 3` (`verifyUpdatedProductQuantity`). |

## Notes & Risks

- The side-effect re-fetch (step 4) is the strongest assertion — without it the test would still pass even if the edit endpoint silently no-op'd. (This is exactly what happened during a regression: a JSON `{ key, quantity }` body was being sent and OpenCart ignored it; the side-effect verify caught it.)
- Two payload-shape pitfalls to avoid:
  - **Don't** use a JSON body (`data: { key, quantity }`) — OpenCart silently ignores it.
  - **Don't** verify with `common/cart/info` — that's the header mini-cart drawer; it lacks the per-row quantity input + total cell that `verifyUpdatedProductQuantity` reads, and the last `<td>` is the remove button (empty currency string → crash).

## Automation

- **Spec:** [`tests/api/test-cart.spec.ts:54`](../../../../tests/api/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/api/cart.md`](../../../../knowledge-base/api/cart.md)
