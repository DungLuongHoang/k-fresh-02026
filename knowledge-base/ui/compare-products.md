# Compare Products

Comparison-table flows: add 2/3 products, remove individual / all entries, navigate back, and de-duplication.

- **Spec file:** `tests/ui/test-compare-products.spec.ts`
- **Suite:** `Compare Products Tests`
- **Tests:** 5
- **Page objects:** `ProductPage`, `CompareProductsPage`, `CommonPage`
- **Data:** `products` from `@data/products-data` (`htcTouch`, `canon`, `palmTreo`, `ipod`)

## Suite-level setup (`beforeEach`)

1. Navigate to `Constants.CATEGORY_URL` (the listing page where the compare buttons are exposed). Guest user — no registration / login.

---

## TC-CP-001 — Add 2 products to Compare and verify compare page

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-compare-products.spec.ts:12` |

**Test data:** `products.htcTouch`, `products.canon`.

**Steps**

1. Add HTC Touch and Canon to compare.
2. Click "Compare" notification → navigate to the comparison page.

**Expected result**

- Page header reads `Product Comparison`.
- Comparison table shows both products with their attributes (`compareProductsPage.verifyProductsDetails`).

---

## TC-CP-002 — Verify all compare table details with 3 products

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-compare-products.spec.ts:21` |

**Test data:** `htcTouch`, `canon`, `palmTreo`.

**Steps**

1. Add the three products to compare.
2. Navigate to the comparison page from the Canon notification.

**Expected result**

- Header reads `Product Comparison`.
- All three products are present with their attributes.

---

## TC-CP-003 — Remove one product from compare and verify table updates

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-compare-products.spec.ts:35` |

**Test data:** `htcTouch`, `canon`, then `ipod` after removal.

**Steps**

1. Add `htcTouch` + `canon`, navigate to compare, verify the two products.
2. Remove `htcTouch`.
3. Go back to the category page.
4. Add `ipod`, navigate back to compare.

**Expected result**

- After step 2, the table updates (covered by the verification before step 3 — the next assertion is on the new state).
- Final state contains `ipod` and `canon` only.

---

## TC-CP-004 — Remove all products and verify empty state

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-compare-products.spec.ts:52` |

**Test data:** `htcTouch`, `canon`.

**Steps**

1. Add both products, navigate to compare.
2. Remove **both** products from the table.
3. Click the "Continue" button.
4. Open `Constants.COMPARE_URL` directly.

**Expected result**

- After "Continue", the user lands on `Your Store` (homepage).
- Visiting the Compare URL directly shows the empty-state message: `You have not chosen any products to compare.`

---

## TC-CP-005 — Verify duplicate handling with page navigation

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-compare-products.spec.ts:70` |

**Test data:** `htcTouch`, `canon`.

**Steps**

1. Add both products, navigate to compare, verify both present.
2. Go back in browser history.
3. Try to add `canon` **a second time**.
4. Navigate to compare again.

**Expected result**

- The compare table still shows exactly the two original products.
- `compareProductsPage.verifyNoDuplicateProducts()` confirms no duplicate row.
