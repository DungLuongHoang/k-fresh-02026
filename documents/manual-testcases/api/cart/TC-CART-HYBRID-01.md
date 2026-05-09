# TC-CART-HYBRID-01 — Add to cart with UI action + API response assertion

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CART-HYBRID-01 |
| **Spec ID** | TC01 (api/test-cart-ui-api) |
| **Title** | Add product to cart — verify both UI toast AND backing API response |
| **Module** | Cart |
| **Feature** | UI-driven + API-asserted hybrid |
| **Type** | Hybrid (UI + API) |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional / Integration |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Suite `beforeEach`: registers a fresh user and lands on the homepage.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Product | env-specific | `getEnvProduct()` |
| API endpoint | `POST index.php?route=checkout/cart/add` | spec |
| Expected message | `ADD_TO_CART_SUCCESS_MESSAGE` | `data/messages-data.ts` |

## Test Steps

1. Navigate to `Constants.BASE_URL`.
2. Search for the product and open its PDP.
3. **Subscribe to the API response** for `POST checkout/cart/add` with status 200 (must be set up _before_ the click).
4. Click **Add to Cart**.
5. Await the captured API response.

## Expected Result

| # | Assertion |
| --- | --- |
| API-1 | Captured response is non-null. |
| API-2 | Response status = `200`. |
| API-3 | Response body (stringified) contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`. |
| UI-1 | The PDP success toast contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE` (`verifyAddToCartSuccessMessage`). |

## Notes & Risks

- The response promise must be created **before** the click — otherwise the network event fires before the listener attaches and the test races.

## Automation

- **Spec:** [`tests/api/test-cart-ui-api.spec.ts:23`](../../../../tests/api/test-cart-ui-api.spec.ts)
- **Knowledge base:** [`knowledge-base/api/cart-ui-api.md`](../../../../knowledge-base/api/cart-ui-api.md)
