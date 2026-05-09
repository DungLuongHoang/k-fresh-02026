# TC-PROFILE-03 — Add new address from My Account

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PROFILE-03 |
| **Spec ID** | TC003 |
| **Title** | Add New Address |
| **Module** | My Account / Profile |
| **Feature** | Address book — add (entry-point: dashboard shortcut) |
| **Type** | UI |
| **Priority** | High |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Registered user is on the **My Account** dashboard.

## Test Data

| Key | Value | Source |
| --- | --- | --- |
| Address | Random firstName/lastName/company/address1/city/postcode/country/region | `data/address-data.ts` (via `createAddressData()`) |

## Test Steps

1. Click the **Add new address** shortcut on the dashboard.
2. Fill the address form with the generated data.
3. Submit.

## Expected Result

- User is redirected to the **Address Book** page.
- Success banner is displayed (`expectAddAddressSuccessMessage()`).
- The newly added address appears in the address-book list (`expectAddressPresent(addressData)`).

## Notes & Risks

- Different entry-point than `TC-ADDRESS-01` (which enters via the Address Book sidebar). Both should remain since they exercise different UI flows.

## Automation

- **Spec:** [`tests/ui/test-profile.spec.ts:47`](../../../../tests/ui/test-profile.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/profile.md`](../../../../knowledge-base/ui/profile.md)
