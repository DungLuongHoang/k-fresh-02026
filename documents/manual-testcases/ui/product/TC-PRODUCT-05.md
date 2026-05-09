# TC-PRODUCT-05 — Quantity counter behaviour on PDP

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-PRODUCT-05 |
| **Spec ID** | TC05 |
| **Title** | Verify quantity counter (increment/decrement/direct input) |
| **Module** | Product |
| **Feature** | PDP — quantity stepper |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional / Boundary |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Browser is on `Constants.BASE_URL`.

## Test Data

| Key | Value |
| --- | --- |
| Increment count | `+3` |
| Decrement count | `-2` |
| Direct fill | `10` |

## Test Steps

1. Navigate to the PDP for `productData.productName`.
2. Verify the quantity counter is rendered (initial value).
3. Click the **+** button **3** times.
4. Click the **−** button **2** times.
5. Verify the displayed quantity equals `2` (1 starting + 3 − 2).
6. Type `10` directly into the quantity input.
7. Verify the displayed quantity equals `10`.

## Expected Result

- After step 5: quantity input shows `2`.
- After step 7: quantity input shows `10` (direct override allowed).

## Notes & Risks

- Edge cases not yet covered: negative input (`-1`), zero (`0`), non-numeric (`abc`), exceeding stock — candidates for follow-up TCs.

## Automation

- **Spec:** [`tests/ui/test-product.spec.ts:35`](../../../../tests/ui/test-product.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/product.md`](../../../../knowledge-base/ui/product.md)
