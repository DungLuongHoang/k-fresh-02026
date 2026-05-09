# TC-ADDRESS-02 — Add address with required fields empty

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-ADDRESS-02 |
| **Spec ID** | TC_02 |
| **Title** | Add new address with required fields empty |
| **Module** | Address Book |
| **Feature** | Required-field validation |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **Address Book** page.

## Test Data

_None — form is submitted empty._

## Test Steps

1. Click **New Address**.
2. Click **Submit** without filling any field.

## Expected Result

- Inline validation errors appear for every required field (first name, last name, address, city, postcode, country, region).
- The form is not submitted; the URL stays on the **Add Address** page.

## Automation

- **Spec:** [`tests/ui/test-address-book.spec.ts:26`](../../../../tests/ui/test-address-book.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/address-book.md`](../../../../knowledge-base/ui/address-book.md)
