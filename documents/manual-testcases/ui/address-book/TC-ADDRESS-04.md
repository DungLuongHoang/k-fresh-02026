# TC-ADDRESS-04 — Delete address (when 2+ exist)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-ADDRESS-04 |
| **Spec ID** | TC_04 |
| **Title** | Delete existing address successfully |
| **Module** | Address Book |
| **Feature** | Delete address — happy path |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **Address Book** page.
- Nested `beforeEach` has added one address; the test then adds a **second** address so deletion is allowed (the system rejects deletes that would leave the user with zero addresses).

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Second address | Newly generated | `generateAddressData()` |

## Test Steps

1. Click **New Address**, fill, submit, verify the second address is added.
2. Click **Delete** on the address at row index `1` (the second address).

## Expected Result

- After step 2: a delete-success banner is displayed (`verifyDeleteSuccess()`).
- The remaining address (the first one, seeded by `beforeEach`) stays in the list.

## Notes & Risks

- Targets row index `1` deliberately to avoid hitting the "must keep one address" guard, which is covered separately by `TC-ADDRESS-05`.

## Automation

- **Spec:** [`tests/ui/test-address-book.spec.ts:48`](../../../../tests/ui/test-address-book.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/address-book.md`](../../../../knowledge-base/ui/address-book.md)
