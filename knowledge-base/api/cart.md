# Cart API – Comprehensive Testing

Direct API-level coverage of the cart endpoints. These tests bypass the UI entirely (no rendering, no page objects beyond `apiPage`) and assert **status code, response time, payload size, schema, and message content** for every action.

- **Spec file:** `tests/api/test-cart.spec.ts`
- **Suite:** `Cart API Module - Comprehensive Testing`
- **Tests:** 3
- **Page objects:** `apiPage`, `cartPage` (used only to parse server-rendered HTML for `getProductKey`)
- **Data:** `getEnvProduct()`, `Messages.*`
- **No `beforeEach`** — every test sets up its own state inline (TC02 and TC03 add a product first).

## What is asserted on every API call

1. **Status code:** `200`.
2. **Response time:** `< 2000 ms`.
3. **Payload size:** body length `> 0`.
4. **Schema:** `Assertions.assertSchemaByType(...)` — `success` and `total` are strings (where applicable).
5. **Message content:** `Assertions.assertContains(...)` against `Messages.*`.

## Endpoints exercised

| Action | Method | Path |
| --- | --- | --- |
| Add to cart | `POST` | `index.php?route=checkout/cart/add` |
| Read cart | `GET`  | `index.php?route=common/cart/info` |
| Edit (update qty) | `POST` | `index.php?route=checkout/cart/edit` |
| Remove from cart | `POST` | `index.php?route=checkout/cart/remove` |

---

## TC01 — Add product to cart

| Field | Value |
| --- | --- |
| Tags | — |
| Type | API |
| Source | `tests/api/test-cart.spec.ts:11` |

**Test data:**

```ts
form: { product_id: product.id, quantity: product.quantity }
```

**Steps**

1. Send `POST /checkout/cart/add` with the form payload.
2. Measure response time.

**Expected result**

- Status 200, response time < 2000 ms, non-empty body.
- Schema: `{ success: string, total: string }`.
- `body.success` contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
- `body.success` contains the product name.
- `body.total` is non-null (cart total info present).

---

## TC02 — Update product quantity in cart

| Field | Value |
| --- | --- |
| Tags | — |
| Type | API |
| Source | `tests/api/test-cart.spec.ts:54` |

**Setup (inline)**

1. Add product via `POST /checkout/cart/add`.
2. Fetch the cart info HTML via `GET /common/cart/info`.
3. Inject that HTML into a page (`cartPage.page.setContent`) so the page object can extract the cart-item key.
4. `cartItemKey = await cartPage.getProductKey(product.name)`.

**Test data:**

```ts
data: { key: cartItemKey, quantity: 3 }
headers: { 'X-Requested-With': 'XMLHttpRequest' }
```

> Note: this call uses **`data:` (JSON body) + the AJAX header**, not `form:` — the upstream backend differentiates AJAX edits from full-page POSTs.

**Steps**

1. Send `POST /checkout/cart/edit` with the JSON payload + AJAX header.
2. Measure response time.

**Expected result**

- Status 200, response time < 2000 ms, non-empty body.
- **Side effect verified:** `GET /common/cart/info` returns HTML in which the line item for `product` carries `quantity = 3` (`cartPage.verifyUpdatedProductQuantity({...product, quantity: 3})`). This guards against the edit endpoint silently no-op'ing.

---

## TC03 — Remove product from cart

| Field | Value |
| --- | --- |
| Tags | — |
| Type | API |
| Source | `tests/api/test-cart.spec.ts:92` |

**Setup (inline)**

Same as TC02: add product → fetch `/common/cart/info` HTML → derive `cartItemKey`.

**Test data:**

```ts
form: { key: cartItemKey }
```

**Steps**

1. Send `POST /checkout/cart/remove` with the form payload.
2. Measure response time.

**Expected result**

- Status 200, response time < 2000 ms, non-empty body.
- Schema: `{ success: string, total: string }`.
- `body.success` contains `Messages.UPDATE_CART_SUCCESS_MESSAGE`.
- **Side effect verified:** `GET /common/cart/info` returns HTML in which the row for `product` is no longer present (`cartPage.verifyProductRemovedFromCart(product)`). This guards against the remove endpoint silently no-op'ing.
