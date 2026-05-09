# Register

User-registration flow validation: success path, required-field validation, email format, password mismatch, and privacy-policy enforcement.

- **Spec file:** `tests/ui/test-register.spec.ts`
- **Suite:** `Register Tests`
- **Tests:** 5
- **Page objects:** `RegisterPage`, `CommonPage`
- **Data:** `generateUserProfileData()` (per-test fresh user), `Messages.*`, `Constants.REGISTER_URL`

## Suite-level setup (`beforeEach`)

1. Navigate to `Constants.REGISTER_URL`.
2. Generate a brand-new `UserProfile` via `generateUserProfileData()`.

> No teardown — test data is intentionally throwaway.

---

## TC-001 — Register with valid data – success

| Field | Value |
| --- | --- |
| Tags | `@smoke` `@regression` |
| Type | UI |
| Source | `tests/ui/test-register.spec.ts:19` |

**Test data:** Auto-generated `UserProfile`.

**Steps**

1. Fill the registration form with the generated profile.
2. Un-tick the newsletter opt-in.
3. Tick the "Agree to Privacy Policy" checkbox.
4. Submit the form.

**Expected result**

- Success label is visible.
- Page heading equals `Messages.REGISTER_SUCCESS_TITLE`.
- Page body contains `Messages.REGISTER_SUCCESS_FULL_MESSAGE`.

---

## TC-002 — Register without filling any required fields

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-register.spec.ts:36` |

**Steps**

1. Submit the empty registration form.

**Expected result**

- Validation messages are shown for every required field (delegated to `registerPage.verifyRequiredFieldsErrorMessages()`).

---

## TC-003 — Register with invalid email format

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-register.spec.ts:43` |

**Test data:** Profile with `email = 'invalid-email-format'`.

**Steps**

1. Fill the form with an invalid email.
2. Tick "Agree to Privacy Policy".
3. Submit.

**Expected result**

- URL stays on `Constants.REGISTER_URL` (registration did not proceed).
- Native HTML5 validation message on the email input matches the **browser-specific expected text**:
  - Chromium: `Please include an '@' in the email address. '<value>' is missing an '@'.`
  - Firefox: `Please enter an email address.`
  - WebKit: `Enter an email address`

> This is one of the few cross-browser branches in the suite — be careful when refactoring.

---

## TC-004 — Register with password mismatch

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-register.spec.ts:63` |

**Test data:** `confirmPassword = 'mismatchpassword123'` (different from `password`).

**Steps**

1. Fill the form with mismatched passwords.
2. Tick "Agree to Privacy Policy".
3. Submit.

**Expected result**

- The confirm-password error label text equals `Messages.REGISTER_ERROR_PASSWORD_CONFIRM`.

---

## TC-005 — Register without agreeing to Privacy Policy

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-register.spec.ts:73` |

**Steps**

1. Fill the form with valid data.
2. Submit **without** ticking the Privacy Policy checkbox.

**Expected result**

- Top-of-page alert text equals `Messages.REGISTER_ERROR_PRIVACY_POLICY`.
