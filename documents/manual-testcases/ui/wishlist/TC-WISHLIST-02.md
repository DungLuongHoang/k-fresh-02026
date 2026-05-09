# TC-WISHLIST-02 — Remove product from wishlist

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-WISHLIST-02 |
| **Spec ID** | TC-WL-004 |
| **Title** | Remove product from wishlist |
| **Module** | Wishlist |
| **Feature** | Wishlist row — remove |
| **Type** | UI |
| **Priority** | Medium |
| **Severity** | Major |
| **Test Type** | Functional |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-WISHLIST-01` (wishlist seeded with one product by `beforeEach`).

## Test Steps

1. Verify the wishlist contains at least one item.
2. Click the **Remove** action on the first wishlist row.

## Expected Result

- The first row is removed from the wishlist; the empty-or-decremented state is verified by `removeFirstProductAndVerify()`.

## Automation

- **Spec:** [`tests/ui/test-wish-list.spec.ts:25`](../../../../tests/ui/test-wish-list.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/wish-list.md`](../../../../knowledge-base/ui/wish-list.md)
