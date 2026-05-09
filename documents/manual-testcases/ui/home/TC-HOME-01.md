# TC-HOME-01 — Access wishlist via header icon

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-HOME-01 |
| **Spec ID** | TC-WL-001 |
| **Title** | Access Wishlist page |
| **Module** | Home |
| **Feature** | Header navigation — wishlist icon |
| **Type** | UI |
| **Priority** | Low |
| **Severity** | Minor |
| **Test Type** | Functional / UI |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- A registered user is logged in (suite `beforeEach`).
- Browser navigates to `Constants.BASE_URL`.

## Test Steps

1. Navigate to the homepage.
2. Click the **wishlist icon** in the header.

## Expected Result

- The browser navigates to the wishlist route (`wishlistPage.verifyOnWishlistPage()`).
- The wishlist heading is visible.

## Notes & Risks

- Without the post-click navigation assertion, the test would silently pass even if the icon stopped wiring up the link.

## Automation

- **Spec:** [`tests/ui/test-home.spec.ts:17`](../../../../tests/ui/test-home.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/home.md`](../../../../knowledge-base/ui/home.md)
