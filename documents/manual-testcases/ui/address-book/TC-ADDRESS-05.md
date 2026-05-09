# TC-ADDRESS-05 — Cannot delete the only remaining address

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-ADDRESS-05 |
| **Spec ID** | TC_05 |
| **Title** | Cannot delete the only remaining address |
| **Module** | Address Book |
| **Feature** | "At-least-one-address" guard |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **Address Book** page.
- Nested `beforeEach` has added exactly **one** address.

## Test Data

_None — operates on the seeded single address._

## Test Steps

1. Click **Delete** on the only address row.

## Expected Result

- A warning is displayed indicating the user must keep at least one address (`verifyCannotDelete()`).
- The address remains in the list — the delete is rejected by the server.

## Notes & Risks

- Pairs with `TC-ADDRESS-04` to fully cover the success-path and the guard-path.

## Automation

- **Spec:** [`tests/ui/test-address-book.spec.ts:63`](../../../../tests/ui/test-address-book.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/address-book.md`](../../../../knowledge-base/ui/address-book.md)
