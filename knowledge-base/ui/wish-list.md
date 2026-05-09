# Wish List

Coverage for managing items already in the wishlist: add to cart, remove, and link to product detail.

- **Spec file:** `tests/ui/test-wish-list.spec.ts`
- **Suite:** `Wish List Tests`
- **Tests:** 3
- **Page objects:** `WishlistPage`, `HomePage`, `RegisterPage`, `CommonPage`
- **Data:** `generateUserProfileData()`

## Suite-level setup (`beforeEach`)

1. Generate a fresh `UserProfile`.
2. Register the user.
3. Navigate to the homepage.
4. Hover the **first** product card (`hoverProductCard(0)`).
5. Click "Add to Wishlist" on that card.
6. Click the wishlist link in the success toast — this lands on the wishlist page with one item.

> Every test in this file therefore starts from a wishlist that already contains exactly one product. The "add to wishlist" path itself is owned by `tests/ui/test-home.spec.ts` (TC-WL-002).

---

## TC-WL-003 — Add product from wishlist to cart

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-wish-list.spec.ts:20` |

**Steps**

1. Verify the wishlist is non-empty.
2. Click "Add to Cart" on the first wishlist product and verify success.

**Expected result**

- The product is added to the cart and the success state is verified by `wishlistPage.addFirstProductToCartAndVerify()`.

---

## TC-WL-004 — Remove product from wishlist

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-wish-list.spec.ts:25` |

**Steps**

1. Verify the wishlist is non-empty.
2. Remove the first product and verify (`wishlistPage.removeFirstProductAndVerify()`).

**Expected result**

- The wishlist becomes empty / the row is gone (encapsulated in the page object).

---

## TC-WL-005 — Link to product detail

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-wish-list.spec.ts:30` |

**Steps**

1. Verify the wishlist is non-empty.
2. Click the first wishlist product and verify the PDP opens for the same product (`wishlistPage.openFirstProductAndVerifyDetail()`).

**Expected result**

- Lands on the correct PDP for the wishlist item.
