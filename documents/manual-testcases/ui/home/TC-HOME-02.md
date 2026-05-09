# TC-HOME-02 — Add product to wishlist from homepage

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-HOME-02 |
| **Spec ID** | TC-WL-002 |
| **Title** | Add Product to Wishlist (from homepage hover) |
| **Module** | Home |
| **Feature** | Product card hover actions — add to wishlist |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- A registered user is logged in (suite `beforeEach`).
- Browser navigates to `Constants.BASE_URL`.

## Test Steps

1. Hover over a product card on the homepage.
2. Click the **Add to Wishlist** button revealed on hover.
3. In the resulting toast notification, click the **Wishlist** link.

## Expected Result

- The user is navigated to the wishlist page.
- The wishlist contains at least one product (`verifyWishlistNotEmpty()`).

## Notes & Risks

- The hover action is required to reveal the wishlist button — running this on a touch viewport will need an alternate trigger.

## Automation

- **Spec:** [`tests/ui/test-home.spec.ts:25`](../../../../tests/ui/test-home.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/home.md`](../../../../knowledge-base/ui/home.md)
