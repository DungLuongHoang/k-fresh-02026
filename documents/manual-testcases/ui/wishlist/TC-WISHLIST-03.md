# TC-WISHLIST-03 — Wishlist row link navigates to PDP

## Metadata

| Field | Value |
| --- | --- |
| **TC ID (manual)** | TC-WISHLIST-03 |
| **Spec ID** | TC-WL-005 |
| **Title** | Wishlist row → product detail page |
| **Module** | Wishlist |
| **Feature** | Navigation — wishlist row to PDP |
| **Type** | UI |
| **Priority** | Low |
| **Severity** | Minor |
| **Test Type** | Functional / UI |
| **Tags** | _none_ |
| **Automation Candidate** | Yes |
| **Status** | ✅ Automated |

## Preconditions

- Same as `TC-WISHLIST-01` (wishlist seeded with one product).

## Test Steps

1. Verify the wishlist contains at least one item.
2. Click the product title/image on the first wishlist row.

## Expected Result

- The user is navigated to the product detail page for that product, and `openFirstProductAndVerifyDetail()` confirms the PDP renders the matching product.

## Automation

- **Spec:** [`tests/ui/test-wish-list.spec.ts:30`](../../../../tests/ui/test-wish-list.spec.ts)
- **Knowledge base:** [`knowledge-base/ui/wish-list.md`](../../../../knowledge-base/ui/wish-list.md)
