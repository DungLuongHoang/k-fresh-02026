# TC-CART-API-01 — Add product to cart (API)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-API-01 |
| **Spec ID** | TC01 (api) |
| **Title** | POST `checkout/cart/add` — add product |
| **Module** | Cart API |
| **Feature** | Add to cart endpoint |
| **Type** | API |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional / Performance / Schema |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- A clean Playwright `apiPage` request context (no shared session state required).
- `getEnvProduct()` returns a valid product for the active environment.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Endpoint | `POST index.php?route=checkout/cart/add` | spec |
| Form body | `{ product_id, quantity }` | `getEnvProduct()` |
| Expected message | `ADD_TO_CART_SUCCESS_MESSAGE` | `data/messages-data.ts` |

## Test Steps

1. Send the `POST` request with the form body.
2. Capture status, body, and elapsed response time.

## Expected Result

| # | Assertion |
| --- | --- |
| 1 | Status code = `200`. |
| 2 | Response time `<` 2000 ms. |
| 3 | Response body length `>` 0 bytes. |
| 4 | Response JSON conforms to schema `{ success: string, total: string }` (`assertSchemaByType`). |
| 5 | `body.success` contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`. |
| 6 | `body.success` contains `product.name`. |
| 7 | `body.total` is non-null. |

## Automation

- **Spec:** [`tests/api/test-cart.spec.ts:11`](../../../../tests/api/test-cart.spec.ts)
- **Knowledge base:** [`knowledge-base/api/cart.md`](../../../../knowledge-base/api/cart.md)
