# TC-CART-04 — Update product quantity in cart

## Metadata

| Field | Value |
| --- | --- |
| **TC ID** | TC-CART-04 |
| **Title** | Update product quantity in cart |
| **Module** | Cart |
| **Feature** | Quantity update from main cart page |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags (target)** | `@regression` |
| **Automation Candidate** | Yes |
| **Requirement Reference** | — |
| **Status** | ✅ Automated |
| **Author** | KD |
| **Created** | 2026-05-09 |

## Preconditions

- A freshly registered user exists and is logged in (handled by the `Cart Tests` suite-level `beforeEach` in `tests/ui/test-cart.spec.ts`).
- The catalog contains the env-specific product (`HP LP3065`, $122) returned by `getEnvProduct()`.
- The cart is empty before the test starts.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| User | Generated per test | `data/user-data.ts` → `generateUserProfileData()` |
| Product | `HP LP3065`, qty 1, $122 (env-specific) | `data/products.json` → `getEnvProduct()` |
| Updated quantity | `2` | inline `{ ...product, quantity: 2 }` |
| `ADD_TO_CART_SUCCESS_MESSAGE` | "Success: You have added …" | `data/messages-data.ts` |
| `UPDATE_CART_SUCCESS_MESSAGE` | "Success: You have modified your shopping cart!" | `data/messages-data.ts` |

## Test Steps

1. Navigate to `Constants.BASE_URL` (homepage).
2. From the homepage product grid, click the product card for `HP LP3065` to open the PDP.
3. On the PDP, click **Add to Cart** (default quantity = 1).
4. Verify the PDP toast contains `Messages.ADD_TO_CART_SUCCESS_MESSAGE`.
5. Click **View Cart** in the success alert; the main cart page loads.
6. Verify the product row for `HP LP3065` is visible with quantity `1` and total `$122`.
7. Set the quantity input for `HP LP3065` to `2` and click the row's **Update** button (single combined POM call: `cartPage.updateProductQuantity({ ...product, quantity: 2 })`).
8. Verify the cart-modified success banner contains `Messages.UPDATE_CART_SUCCESS_MESSAGE`.
9. Verify the product row now shows quantity `2` and recomputed total `$244` (`product.price × 2`).

## Expected Result

- After step 4: an alert with text "Success: You have added HP LP3065 to your shopping cart!" is visible on the PDP, and a `View Cart` link is present.
- After step 6: the cart row for `HP LP3065` shows quantity input `1` and the row total cell renders `$122.00` (parsed via `Currency.parseCurrency`).
- After step 8: the cart-modified banner with text containing "Success: You have modified your shopping cart!" is visible.
- After step 9: the cart row for `HP LP3065` shows quantity input `2` and the row total cell renders `$244.00`.
- The cart still contains exactly one row for `HP LP3065` (no duplicate added).

## Negative / Edge Variants

- **Variant A — Update quantity to 0 (covered by `TC05`):** updating the quantity to `0` and clicking Update removes the product entirely; the row disappears and `verifyProductRemovedFromCart` passes.
- **Variant B — Decimal / non-numeric input (not yet automated):** entering `1.5` or `abc` should fall back to the previous valid integer or surface an inline validation error; current site behavior unconfirmed.
- **Variant C — Quantity exceeding stock (not yet automated):** entering a quantity > available stock should display an out-of-stock error.

## Notes & Risks

- The merged TC04 deliberately swallows the previous duplicate `TC_CART_04 - Update product quantity in cart successfully` (removed). Both tested the same flow; this version is the canonical one.
- Default product quantity in `data/products.json` is `1`. If the JSON quantity changes, update the **Test Data** table and the assertion delta accordingly.
- The success banner selector lives in `locators/cart-locators.ts` (`divCartModifiedSuccessMessage`) — flaky if the LambdaTest site redesigns the alert markup.
- Homepage browse path is preferred over search to mirror the more realistic user journey (see `TC_CART_01..03` for variants on the entry path).

## Automation Hints

- **Spec file:** [`tests/ui/test-cart.spec.ts:51`](../../../../tests/ui/test-cart.spec.ts) — implemented as `TC04 - Update product quantity in cart`.
- **POMs used:** `homePage.selectProduct`, `productPage.clickAddToCart`, `productPage.verifyAddToCartSuccessMessage`, `productPage.clickViewCartLink`, `cartPage.verifyProductAddedToCart`, `cartPage.updateProductQuantity`, `cartPage.verifyCartModifiedSuccessMessage`, `cartPage.verifyUpdatedProductQuantity`.
- **Factories:** `getEnvProduct()`, `generateUserProfileData()`.
- **No new POM/locator additions required** — fully reusable from existing layer.
- **Knowledge base file:** [`knowledge-base/ui/cart.md`](../../../../knowledge-base/ui/cart.md).
