# Address Book

CRUD coverage for the Address Book page, including the "cannot delete the only/default address" guard.

- **Spec file:** `tests/ui/test-address-book.spec.ts`
- **Suite:** `Address Book` with a nested describe `When user already has address`.
- **Tests:** 5
- **Page objects:** `AddressBookPage`, `RegisterPage`, `CommonPage`
- **Data:** `generateUserProfileData()`, `generateAddressData()`

## Suite-level setup (`beforeEach`)

1. Generate a fresh `UserProfile`.
2. Register the user.
3. Navigate to the Address Book page (`addressBookPage.goto()`).

## Nested setup — `When user already has address` (`beforeEach`)

After the outer setup, additionally:

1. Click "New Address".
2. Fill the form with `generateAddressData()`.
3. Submit and verify success.

> So tests in the nested describe start with **exactly one** saved address that is also the default.

---

## TC_01 — Add new address successfully

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-address-book.spec.ts:19` |

**Test data:** `generateAddressData()`.

**Steps**

1. Click "New Address".
2. Fill the form.
3. Submit.

**Expected result**

- Add-address success state is verified (`addressBookPage.verifySuccess()`).

---

## TC_02 — Add new address with required fields empty

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-address-book.spec.ts:26` |

**Steps**

1. Click "New Address".
2. Submit the form **without** filling anything.

**Expected result**

- Validation errors are shown for every required field (`addressBookPage.verifyRequiredFieldErrors()`).

---

## TC_03 — Edit existing address successfully

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-address-book.spec.ts:41` (inside nested describe) |

**Test data:** A second `generateAddressData()` payload for the update.

**Steps**

1. Click "Edit" on the existing address.
2. Replace the data with a freshly generated payload.
3. Submit.

**Expected result**

- Update-address success state is verified (`verifyUpdateSuccess()`).

---

## TC_04 — Delete existing address successfully

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-address-book.spec.ts:41` |

**Test data:** A second `generateAddressData()` payload (added inside the test to lift the "must keep one address" guard).

**Steps**

1. Click "New Address", fill the form with a fresh payload, submit, and verify add success.
2. Click "Delete" on the **second** row (`clickDeleteAddressAt(1)`).

**Expected result**

- Delete-address success message is verified (`verifyDeleteSuccess()`).

> Tests the actual success path. The "cannot delete the only address" guard is now covered exclusively by TC_05.

---

## TC_05 — Cannot delete the only remaining address

| Field | Value |
| --- | --- |
| Tags | — |
| Type | UI |
| Source | `tests/ui/test-address-book.spec.ts:57` |

**Steps**

1. Click "Delete" on the single address seeded by the nested `beforeEach`.

**Expected result**

- The site rejects the delete with `Warning: You must have at least one address!` (asserted via `verifyCannotDelete()`).
