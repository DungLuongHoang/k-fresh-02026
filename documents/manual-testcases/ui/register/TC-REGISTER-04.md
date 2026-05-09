# TC-REGISTER-04 — Register with password mismatch

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-REGISTER-04 |
| **Spec ID** | TC-004 |
| **Title** | Register with password mismatch |
| **Module** | Register |
| **Feature** | Password / confirm-password match validation |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.REGISTER_URL`.
- A fresh `UserProfile` is generated.

## Test Data

| Key | Value |
| --- | --- |
| `confirmPassword` override | `mismatchpassword123` (differs from `password`) |

## Test Steps

1. Navigate to the register page.
2. Fill the form with the generated user, then overwrite `confirmPassword` = `mismatchpassword123`.
3. Tick the **Privacy Policy** checkbox.
4. Click **Continue**.

## Expected Result

- The confirm-password error label (`lblErrorConfirmPassword`) text equals `Messages.REGISTER_ERROR_PASSWORD_CONFIRM` (e.g. _"Password confirmation does not match password!"_).
- Account is NOT created.

## Notes & Risks

- The assertion uses `.trim()` on `textContent()` because the error label has trailing whitespace in the markup.

## Automation

- **Spec:** [`tests/ui/test-register.spec.ts:63`](../../../../tests/ui/test-register.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/register.md`](../../../../knowledge-base/ui/register.md)
