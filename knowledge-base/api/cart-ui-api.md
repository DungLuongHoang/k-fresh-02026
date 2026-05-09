# Cart UI + API Hybrid

Hybrid pattern — drive the UI through the page objects, but **intercept** the underlying API call to assert both the network contract and the rendered UI from a single test.

- **Spec file:** `tests/api/test-cart-ui-api.spec.ts`
- **Suite:** `Cart Tests - UI & API Hybrid`
- **Tests:** 1
- **Page objects:** `productPage`, `commonPage`, `registerPage`
- **Data:** `getEnvProduct()`, `generateUserProfileData()`, `Messages.*`, `Constants.BASE_URL`, `Constants.REGISTER_URL`
- **Key API helper:** `commonPage.getAPIResponse(url, method, status)` returns a promise that resolves with `{ response, body }` once the matching request completes.

## Suite-level setup (`beforeEach`)

1. Generate a fresh `UserProfile`.
2. Register the user.

> Sets up an authenticated guest session that owns its own cart, so the request being intercepted is unambiguous.

---

## TC01 — Add product to cart (UI click + API assertion)

| Field | Value |
| --- | --- |
| Tags | — |
| Type | Hybrid (UI action + API assertion) |
| Source | `tests/api/test-cart-ui-api.spec.ts:23` |

**Steps**

1. Navigate to the homepage.
2. Search and open the product PDP.
3. **Before** clicking, register a listener for `POST /checkout/cart/add` returning 200:

   ```ts
   const addToCartResponsePromise = commonPage.getAPIResponse(
     'index.php?route=checkout/cart/add',
     'POST',
     200,
   );
   ```
4. Click "Add to Cart" on the PDP.
5. Await the API response.
6. Verify the UI success message.

**Expected result**

- The intercepted response is **not null** (i.e. the click really did fire that request).
- Status code = `200`.
- Stringified body contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
- The PDP's success banner text equals `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.

> Why this hybrid pattern matters: pure-UI tests fail with vague messages like "the toast didn't appear" when the underlying request never even fired. Asserting on the network call first gives a sharper diagnostic *before* the UI assertion runs.
