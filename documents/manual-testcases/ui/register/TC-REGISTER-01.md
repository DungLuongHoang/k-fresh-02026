# TC-REGISTER-01 — Register with valid data

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-REGISTER-01 |
| **Spec ID** | TC-001 |
| **Title** | Register with valid data — success |
| **Module** | Register |
| **Feature** | Account creation — happy path |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Critical |
| **Test Type** | Functional |
| **Tags** | `@smoke @regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.REGISTER_URL`.
- A fresh `UserProfile` is generated via `generateUserProfileData()`.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| User profile | Random first/last/email/telephone/password | `data/user-data.ts` → `generateUserProfileData()` |
| Expected title | `REGISTER_SUCCESS_TITLE` | `data/messages-data.ts` |
| Expected body | `REGISTER_SUCCESS_FULL_MESSAGE` | `data/messages-data.ts` |

## Test Steps

1. Navigate to the register page.
2. Fill all required fields with valid generated data.
3. Untick the **Subscribe to newsletter** option.
4. Tick the **Privacy Policy** checkbox.
5. Click **Continue**.

## Expected Result

- The success heading element (`lblSuccessMessage`) is visible.
- The heading text equals `Messages.REGISTER_SUCCESS_TITLE`.
- The page body contains `Messages.REGISTER_SUCCESS_FULL_MESSAGE`.

## Notes & Risks

- This is the smoke test for the entire account-creation flow; failure blocks every other test that depends on the suite-level `beforeEach` (which registers a user).

## Automation

- **Spec:** [`tests/ui/test-register.spec.ts:19`](../../../../tests/ui/test-register.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/register.md`](../../../../knowledge-base/ui/register.md)
