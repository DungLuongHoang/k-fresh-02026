# TC-ADDRESS-01 — Add new address (happy path)

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-ADDRESS-01 |
| **Spec ID** | TC_01 |
| **Title** | Add new address successfully |
| **Module** | Address Book |
| **Feature** | Create address |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user (suite `beforeEach`) is on the **Address Book** page (`addressBookPage.goto()`).

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Address | Random first/last/company/address1/city/postcode/country/region | `data/address-data.ts` → `generateAddressData()` |

## Test Steps

1. Click **New Address**.
2. Fill the form with the generated address data.
3. Click **Submit**.

## Expected Result

- A success banner is displayed (`verifySuccess()`).
- The new address row appears in the address-book list.

## Automation

- **Spec:** [`tests/ui/test-address-book.spec.ts:19`](../../../../tests/ui/test-address-book.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/address-book.md`](../../../../knowledge-base/ui/address-book.md)
