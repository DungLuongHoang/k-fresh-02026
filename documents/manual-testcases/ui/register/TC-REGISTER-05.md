# TC-REGISTER-05 — Register without agreeing to Privacy Policy

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-REGISTER-05 |
| **Spec ID** | TC-005 |
| **Title** | Register without agreeing to Privacy Policy |
| **Module** | Register |
| **Feature** | Privacy-policy gate |
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
| Privacy checkbox | **NOT** ticked |

## Test Steps

1. Navigate to the register page.
2. Fill the form with the generated user (all valid).
3. Skip ticking the **Privacy Policy** checkbox.
4. Click **Continue**.

## Expected Result

- The top-of-form alert (`lblErrorAgree`) text equals `Messages.REGISTER_ERROR_PRIVACY_POLICY` (e.g. _"Warning: You must agree to the Privacy Policy!"_).
- Account is NOT created.

## Notes & Risks

- This is a top-of-form Bootstrap alert (`alert-danger`), not a per-field error — the locator differs from the other negative-path tests.

## Automation

- **Spec:** [`tests/ui/test-register.spec.ts:73`](../../../../tests/ui/test-register.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/register.md`](../../../../knowledge-base/ui/register.md)
