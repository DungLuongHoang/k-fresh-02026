# TC-CHECKOUT-03 — Mandatory Terms & Conditions check

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-CHECKOUT-03 |
| **Spec ID** | TC_CHK_003 |
| **Title** | Verify error when Terms & Conditions are not accepted |
| **Module** | Checkout |
| **Feature** | T&C gate |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Negative |
| **Tags** | `@regression` |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-CHECKOUT-01`.

## Test Steps

1. Fill billing details with the buyer profile + address.
2. Untick (or leave unticked) the **Terms & Conditions** checkbox (`setTermsAndConditions(false)`).
3. Click **Continue**.
4. Verify the warning message regarding terms acceptance is displayed.
5. Tick **Terms & Conditions** and click **Continue** again.

## Expected Result

- After step 4: the terms-warning message is visible (`verifyTermsWarningMessage()`).
- After step 5: the form proceeds to the next checkout step (no terms blocker).

## Automation

- **Spec:** [`tests/ui/test-checkout.spec.ts:69`](../../../../tests/ui/test-checkout.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/checkout.md`](../../../../knowledge-base/ui/checkout.md)
