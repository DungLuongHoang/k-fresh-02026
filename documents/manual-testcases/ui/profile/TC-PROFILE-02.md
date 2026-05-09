# TC-PROFILE-02 — Update account information

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PROFILE-02 |
| **Spec ID** | TC002 |
| **Title** | Update Account Information |
| **Module** | My Account / Profile |
| **Feature** | Edit account form |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **My Account** dashboard.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Updated profile | First name / last name / email / telephone | `data/user-helper.ts` → `createUpdateProfileData()` |

## Test Steps

1. Click the **Edit your account information** shortcut.
2. Replace each field with the updated profile values.
3. Submit the form.
4. After redirect, re-open the **Edit Account** page.

## Expected Result

- A success banner is displayed after submit (`expectAccountUpdateSuccessMessage()`).
- User is redirected back to the **My Account** dashboard (`verifyMyAccountPage()`).
- Re-opening the Edit page shows the previously submitted updated values (round-trip persistence).

## Notes & Risks

- The round-trip read after submit is the strongest assertion — without it, a silent backend no-op would still appear to pass.

## Automation

- **Spec:** [`tests/ui/test-profile.spec.ts:34`](../../../../tests/ui/test-profile.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/profile.md`](../../../../knowledge-base/ui/profile.md)
