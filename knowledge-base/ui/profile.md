# My Account / Profile

Coverage of the post-registration "My Account" dashboard: dashboard widgets, account information update, address-book add, logout, and password change.

- **Spec file:** `tests/ui/test-profile.spec.ts`
- **Suites:** `My Account Tests` (TC001–TC004) and a dedicated `TC005 - Change Password` describe block.
- **Tests:** 5
- **Page objects:** `ProfilePage`, `RegisterPage`, `CommonPage`
- **Data:** `generateUserProfileData()`, `createUpdateProfileData()`, `createAddressData()`, `createRegisterData()`, `createStrongPassword()`

## Suite-level setup (`beforeEach`, `My Account Tests`)

1. Generate a fresh `UserProfile`.
2. Register the user via `registerPage`.
3. Click the "My Account" button to land on the dashboard.

> The `Change Password` describe runs its own self-contained registration flow and does **not** share the suite-level hook.

---

## TC001 — My Account Dashboard

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-profile.spec.ts:24` |

**Steps**

1. Verify the My Account page is loaded.
2. Verify the right-hand sidebar.

**Expected result**

- Edit-account, change-password, and modify-address shortcut tiles are visible (`expectEditAccountShortcuts`, `expectChangePasswordShortcuts`, `expectModifyAddressShortcuts`).

---

## TC002 — Update Account Information

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-profile.spec.ts:34` |

**Test data:** `createUpdateProfileData()` cast to `UserProfile`.

**Steps**

1. Open Edit Account page.
2. Submit updated info.
3. Re-open the Edit Account page.

**Expected result**

- Account-update success message appears.
- Returns to My Account dashboard.
- After re-opening Edit Account, the form values match the data submitted.

---

## TC003 — Add New Address

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-profile.spec.ts:47` |

**Test data:** `createAddressData()`.

**Steps**

1. Open the Add Address page.
2. Submit a new address.

**Expected result**

- Lands on the Address Book page.
- Add-address success message is shown.
- The submitted address is present in the list.

---

## TC004 — Logout

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-profile.spec.ts:58` |

**Steps**

1. Verify on My Account dashboard.
2. Click logout.
3. Click "Continue" on the logout confirmation.

**Expected result**

- Logout-success page is shown.
- After "Continue", the user is redirected to the post-logout page.

---

## TC005 — Change Password (separate `describe` block)

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-profile.spec.ts:69` (suite) / `:70` (test) |
| Fixtures | `commonPage`, `registerPage`, `profilePage`, `loginPage` |

**Test data:** `createRegisterData()` for the user, `createStrongPassword()` for the new password.

**Setup (inline — no shared `beforeEach`):**

1. Navigate to register URL.
2. Register a new user with the generated data.
3. Verify the registration result page.
4. Continue from the registration success page if one is shown.

**Steps**

1. Verify on My Account dashboard.
2. Open Change Password page.
3. Submit the new strong password.
4. Log out (`logout` → `verifyLogoutPage` → `continueAfterLogout` → `verifyLogoutRedirectPage`).
5. Log back in with the **new** password (`loginPage.login({ email, password: changedPassword })`).

**Expected result**

- After step 3: returns to My Account dashboard, change-password success message is shown.
- After step 5: `loginPage.expectSuccessfulLogin()` succeeds — this is what proves the credential actually changed in the backing store, not just that the form was accepted.
