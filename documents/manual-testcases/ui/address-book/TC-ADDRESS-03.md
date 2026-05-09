# TC-ADDRESS-03 — Edit existing address

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-ADDRESS-03 |
| **Spec ID** | TC_03 |
| **Title** | Edit existing address successfully |
| **Module** | Address Book |
| **Feature** | Update address |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **Address Book** page.
- Nested `beforeEach` has already added one address (so the list is non-empty).

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Replacement address | Newly generated | `generateAddressData()` |

## Test Steps

1. Click **Edit** on the existing address.
2. Replace all fields with the new generated data.
3. Click **Submit**.

## Expected Result

- A success banner specific to update is displayed (`verifyUpdateSuccess()`).
- The address-book list reflects the updated values.

## Notes

- The nested `beforeEach` ensures a known starting state — without it, this test would silently exercise the wrong row.

## Automation

- **Spec:** [`tests/ui/test-address-book.spec.ts:41`](../../../../tests/ui/test-address-book.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/address-book.md`](../../../../knowledge-base/ui/address-book.md)
