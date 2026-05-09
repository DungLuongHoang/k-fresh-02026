# TC-PROFILE-01 — My Account dashboard renders correctly

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PROFILE-01 |
| **Spec ID** | TC001 |
| **Title** | My Account Dashboard |
| **Module** | My Account / Profile |
| **Feature** | Dashboard layout & shortcuts |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional / UI |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- A fresh user has been registered via the suite-level `beforeEach` (`registerPage` flow).
- The user has been navigated to the **My Account** page (`profilePage.clickMyAccountBtn()`).

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| User profile | Generated per test | `data/user-data.ts` → `generateUserProfileData()` |

## Test Steps

1. Verify the **My Account** main heading is visible.
2. Verify the right-column navigation panel is visible.
3. Verify the **Edit your account information** shortcut tile is visible.
4. Verify the **Change your password** shortcut tile is visible.
5. Verify the **Modify your address book entries** shortcut tile is visible.

## Expected Result

- All five regions / shortcut tiles are rendered and visible on the dashboard.
- No console errors or broken links.

## Notes & Risks

- This is the smoke test for the My Account page; failure cascades to TC-PROFILE-02..04.

## Automation

- **Spec:** [`tests/ui/test-profile.spec.ts:24`](../../../../tests/ui/test-profile.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/profile.md`](../../../../knowledge-base/ui/profile.md)
