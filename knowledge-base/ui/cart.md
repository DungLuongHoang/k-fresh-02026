# Cart (UI)

End-to-end UI flows for the shopping cart: empty state, add (PDP & homepage), update quantity, remove, multi-quantity add, and the "set qty to 0 = remove" edge case.

- **Spec file:** `tests/ui/test-cart.spec.ts`
- **Suite:** `Cart Tests`
- **Tests:** 9
- **Page objects:** `CartPage`, `ProductPage`, `HomePage`, `RegisterPage`, `CommonPage`
- **Data:** `getEnvProduct()` (env-aware product), `generateUserProfileData()`, `Messages.*`, `Constants.BASE_URL`

## Suite-level setup (`beforeEach`)

1. Generate a fresh `UserProfile`.
2. Register the user.

> The product fixture (`product`) is shared across the suite and resolved once at module load.

---

## TC01 — Verify Empty Cart

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:23` |

**Steps**

1. Navigate to the homepage.
2. Open the cart from the header.
3. Click "Edit Cart".
4. Remove all products.

**Expected result**

- The main cart page shows the empty-cart message (`Messages.EMPTY_CART_MESSAGE`).

---

## TC02 — Add Product to Cart

| Field | Value |
| --- | --- |
| Tags | `@smoke` `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:31` |

**Steps**

1. Navigate to the homepage.
2. Search and open the test product.
3. Increase its quantity (per-product step in `ProductPage`).
4. Click "Add to Cart".
5. Verify add-to-cart success message.
6. Click "View Cart" link in the alert.

**Expected result**

- Add-to-cart message: `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
- The cart page shows the product with its expected quantity (`cartPage.verifyProductAddedToCart`).

---

## TC03 — Remove Product from Cart

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:41` |

**Steps**

1. Add the product to the cart via the PDP.
2. Open the cart.
3. Remove all products.

**Expected result**

- The cart no longer contains the product (`cartPage.verifyProductRemovedFromCart`).

---

## TC04 — Update Product Quantity

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:51` |

**Steps**

1. Add the product to the cart.
2. Open the cart.
3. Update quantity using `cartPage.updateProductQuantity(product)` (uses `product.quantity`).

**Expected result**

- Cart-modified message equals `Messages.UPDATE_CART_SUCCESS_MESSAGE`.
- The line item reflects the updated quantity.

---

## TC05 — Update Product Quantity to 0 (Remove via Quantity)

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:64` |

**Test data:** `{ ...product, quantity: 0 }`.

**Steps**

1. Add the product to the cart.
2. Update its quantity to **0**.

**Expected result**

- The product is removed from the cart (`verifyProductRemovedFromCart`).

---

## TC_CART_01 — Add product to cart (homepage → PDP path)

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:76` |

**Steps**

1. Open the homepage.
2. Click the product card to open the PDP.
3. Click "Add to Cart" on the PDP.
4. Verify the PDP success banner.
5. Click "View Cart" from the cart sidebar.

**Expected result**

- Success message equals `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
- The cart page shows the product.

---

## TC_CART_02 — Add product with multiple quantity successfully

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:85` |

**Test data:** Quantity = **3**.

**Steps**

1. Open the homepage → open the PDP.
2. `setQuantity(3)` on the PDP.
3. Click "Add to Cart".
4. Verify the success banner.
5. Click "View Cart".

**Expected result**

- Cart shows the product with quantity 3 (`verifyUpdatedProductQuantity({ ...product, quantity: 3 })`).

---

## TC_CART_03 — Add product to cart from homepage (toast flow)

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:95` |

> **Important:** the homepage hover-and-add flow shows a toast in `#notification-box-top`, **not** the PDP's `role="alert"` banner. The verification + the "View Cart" link must therefore come from `homePage`, not `productPage`. Mixing them is what made this test flaky historically — see comment in the spec.

**Steps**

1. Open the homepage.
2. Hover the product card and click its "Add to Cart" icon.
3. Verify the homepage toast.
4. Click "View Cart" inside the toast.

**Expected result**

- Toast text equals `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
- Cart page shows the product (`verifyProductAddedToCart`).

---

## TC_CART_04 — Update product quantity in cart successfully

| Field | Value |
| --- | --- |
| Tags | `@regression` |
| Type | UI |
| Source | `tests/ui/test-cart.spec.ts:107` |

**Test data:** Updated quantity = **2**.

**Steps**

1. Open the homepage → open the PDP via card click.
2. Add to cart from the PDP.
3. Open the cart.
4. Set quantity to 2 in the row, click "Update".

**Expected result**

- Cart-modified message equals `Messages.UPDATE_CART_SUCCESS_MESSAGE`.
- The line item shows quantity 2.
