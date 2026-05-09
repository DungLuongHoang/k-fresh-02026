# TC-REGISTER-02 — Submit empty registration form

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-REGISTER-02 |
| **Spec ID** | TC-002 |
| **Title** | Register without filling any required fields |
| **Module** | Register |
| **Feature** | Required-field validation |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative / Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.REGISTER_URL`.

## Test Data

_None — the form is submitted empty._

## Test Steps

1. Navigate to the register page.
2. Click **Continue** without filling any field.

## Expected Result

- An inline validation/error message is displayed for every required field (first name, last name, email, telephone, password, password confirmation).
- The page does not navigate away from the register URL.

## Notes & Risks

- The site renders these as field-level red-text errors (`text-danger`); the assertion is wrapped inside `registerPage.verifyRequiredFieldsErrorMessages()`.

## Automation

- **Spec:** [`tests/ui/test-register.spec.ts:36`](../../../../tests/ui/test-register.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/register.md`](../../../../knowledge-base/ui/register.md)
