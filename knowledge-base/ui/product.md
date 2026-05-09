# Product

PDP (Product Detail Page) coverage: navigation, "Add to Compare" notification, size chart, image popup/zoom, and quantity-counter behavior.

- **Spec file:** `tests/ui/test-product.spec.ts`
- **Suite:** `Product Tests`
- **Tests:** 5
- **Page objects:** `ProductPage`, `CommonPage`
- **Data:** `productData` (`@data/product-data`), `Constants.ENV`, `Constants.BASE_URL`

> Each test title embeds `${Constants.ENV}` so the same suite reports correctly when run against different environments.

## Suite-level setup (`beforeEach`)

1. Navigate to `Constants.BASE_URL` (the homepage). No registration / login required — these tests run as a guest.

---

## TC01 — Verify product detail page for `<env>` environment

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-product.spec.ts:10` |

**Test data:** `productData.productName`.

**Steps**

1. Open the product detail page for `productData.productName` (`productPage.openProductDetail`).

**Expected result**

- The PDP opens for the requested product (assertion is delegated to the page object).

---

## TC02 — Verify add to compare functionality for `<env>` environment

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-product.spec.ts:16` |

**Steps**

1. Click the "Add to Compare" button for the test product.

**Expected result**

- The compare-success notification box is shown (`expectCompareNotificationBox()`).

---

## TC03 — Verify size chart functionality for `<env>` environment

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-product.spec.ts:23` |

**Steps**

1. Trigger the size chart from the PDP (`productPage.checkSizeChartFunctionality`).

**Expected result**

- The size chart is shown / dismissed correctly (logic encapsulated in the page object).

---

## TC04 — Verify pop-up functionality for `<env>` environment

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-product.spec.ts:29` |

**Steps**

1. Trigger the image-popup / zoom on the PDP (`productPage.checkPopupFunctionality`).

**Expected result**

- The popup opens and closes as expected (encapsulated in the page object).

---

## TC05 — Verify quantity counter functionality for `<env>` environment

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-product.spec.ts:35` |

**Steps**

1. Open the quantity counter for the test product.
2. Increment by **3**.
3. Decrement by **2**.
4. Verify the resulting quantity.
5. Type `10` directly into the quantity input.
6. Verify the resulting quantity equals `10`.

**Expected result**

- Quantity reflects every increment/decrement.
- Direct typing overwrites the counter and is read back correctly.
