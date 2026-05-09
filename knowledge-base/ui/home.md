# Home

Lightweight smoke around the homepage interactions that lead to the wishlist.

- **Spec file:** `tests/ui/test-home.spec.ts`
- **Suite:** `Home Tests`
- **Tests:** 2
- **Page objects:** `HomePage`, `CommonPage`, `WishlistPage`, `RegisterPage`
- **Data:** `generateUserProfileData()`

## Suite-level setup (`beforeEach`)

1. Generate a fresh `UserProfile`.
2. Register the user.

> Note: the test then navigates to `Constants.BASE_URL` inside each test (not in the hook).

---

## TC-WL-001 — Access Wishlist page

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-home.spec.ts:17` |

**Steps**

1. Navigate to the homepage.
2. Click the wishlist icon in the header.

**Expected result**

- The browser lands on the wishlist route — asserted by `wishlistPage.verifyOnWishlistPage()`, which checks the URL matches `/route=account\/wishlist/`. This guards against the icon being silently unwired.

---

## TC-WL-002 — Add Product to Wishlist

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-home.spec.ts:22` |

**Steps**

1. Navigate to the homepage.
2. Hover the first product card.
3. Click the "Add to Wishlist" icon revealed on hover.
4. Click the "Wishlist" link inside the success toast.

**Expected result**

- Wishlist page is non-empty (`wishlistPage.verifyWishlistNotEmpty()`).

> Together with `tests/ui/test-wish-list.spec.ts`, this is the only test that drives the **add** action; the wish-list spec re-uses this setup for its three tests.
