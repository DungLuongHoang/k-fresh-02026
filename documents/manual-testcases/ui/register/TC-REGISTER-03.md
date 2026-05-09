# TC-REGISTER-03 — Register with invalid email format

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-REGISTER-03 |
| **Spec ID** | TC-003 |
| **Title** | Register with invalid email format |
| **Module** | Register |
| **Feature** | Email format validation (HTML5) |
| **Type** | UI / Cross-browser |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative / Boundary |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.REGISTER_URL`.
- A fresh `UserProfile` is generated.

## Test Data

| Key | Value |
| --- | --- |
| Email override | `invalid-email-format` |

## Test Steps

1. Navigate to the register page.
2. Fill the form with the generated user, then overwrite `email` = `invalid-email-format`.
3. Tick the **Privacy Policy** checkbox.
4. Click **Continue**.

## Expected Result

- The browser blocks submission via the native HTML5 email-validation popup.
- URL is still `Constants.REGISTER_URL` (no navigation occurred).
- The validation message returned by `inputEmail.validationMessage` matches the per-browser expected text:

| Browser | Expected validation message |
| --- | --- |
| Chromium | `Please include an '@' in the email address. 'invalid-email-format' is missing an '@'.` |
| Firefox | `Please enter an email address.` |
| WebKit | `Enter an email address` |

## Notes & Risks

- These strings are **browser-controlled** — a browser update could break the assertion. Consider snapshotting and re-baselining when CI fails after a Playwright/browser bump.

## Automation

- **Spec:** [`tests/ui/test-register.spec.ts:43`](../../../../tests/ui/test-register.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/register.md`](../../../../knowledge-base/ui/register.md)
