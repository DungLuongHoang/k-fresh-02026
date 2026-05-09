# TC-PROFILE-04 — Logout flow

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PROFILE-04 |
| **Spec ID** | TC004 |
| **Title** | Logout |
| **Module** | My Account / Profile |
| **Feature** | Session termination |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **My Account** dashboard.

## Test Steps

1. Verify the user is on **My Account** (`verifyMyAccountPage()`).
2. Click **Logout**.
3. On the logout confirmation page, verify the page header.
4. Click **Continue**.

## Expected Result

- After step 2: the **Account Logout** confirmation page is displayed (`verifyLogoutPage()`).
- After step 4: the user is redirected to the post-logout landing page (`verifyLogoutRedirectPage()`).
- Authenticated UI elements are no longer accessible.

## Notes & Risks

- Reused as a building block by `TC-PROFILE-05` (change password round-trip).

## Automation

- **Spec:** [`tests/ui/test-profile.spec.ts:58`](../../../../tests/ui/test-profile.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/profile.md`](../../../../knowledge-base/ui/profile.md)
