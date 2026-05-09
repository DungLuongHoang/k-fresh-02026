# TC-PROFILE-05 — Change password round-trip

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PROFILE-05 |
| **Spec ID** | TC005 (sub-test: `should change password from My Account right after register`) |
| **Title** | Change password from My Account, then re-login with the new password |
| **Module** | My Account / Profile |
| **Feature** | Change password — credential round-trip |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional / Integration |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- _Self-contained_: this test does its own registration (does **not** rely on the suite-level `beforeEach`, since it lives in its own `describe`).
- Browser starts at `Constants.REGISTER_URL`.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Register data | First name / last name / email / telephone / strong password | `data/user-helper.ts` → `createRegisterData()` |
| New password | A different strong password | `data/user-helper.ts` → `createStrongPassword()` |

## Test Steps

1. Register a new user with the original strong password.
2. Continue past the registration success screen.
3. Verify on the **My Account** dashboard.
4. Open **Change your password**.
5. Submit the new password (and confirmation).
6. Verify success message + redirect back to **My Account**.
7. Logout completely (logout → continue → redirect).
8. Login again using the **new** password.

## Expected Result

- Step 6: success banner displayed (`expectChangePasswordSuccessMessage()`); user lands back on **My Account** (`verifyMyAccountPage()`).
- Step 7: logout confirmation page → post-logout landing page.
- Step 8: login with the new password succeeds (the credential change actually persisted in the backing store).

## Notes & Risks

- The login step at the end is the **only** assertion that proves the password actually changed; the success message alone proves only that the form was accepted.
- Increases test runtime (~30s+) because of the full register + logout + login round-trip; budget for it in CI sharding.

## Automation

- **Spec:** [`tests/ui/test-profile.spec.ts:70`](../../../../tests/ui/test-profile.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/profile.md`](../../../../knowledge-base/ui/profile.md)
