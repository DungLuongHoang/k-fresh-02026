# Test Knowledge Base

Living catalog of every automated test in this project. Each entry is mined directly from the spec files in `tests/` and links back to its source location for traceability.

## How to read an entry

Each test case is documented with:

| Field | Description |
| --- | --- |
| **ID** | The TC identifier in the test title (kept verbatim, even when conventions differ between files). |
| **Title** | The exact `test(...)` title as it appears in the spec. |
| **Tags** | Playwright tags (`@smoke`, `@regression`, …). `—` when none are declared. |
| **Type** | `UI`, `API`, or `Hybrid` (UI flow that asserts on backend responses). |
| **Preconditions** | What the suite-level / nested `beforeEach` hooks set up before the test starts. |
| **Test data** | Fixtures, factories, or environment values used. |
| **Steps** | High-level action flow as expressed by the page-object calls. |
| **Expected result** | What the test asserts (success message, URL, validation, schema, …). |
| **Source** | `path:line` so you can jump to the spec instantly. |

> Steps are intentionally written at the **business-action** level, not the locator level — this knowledge base is meant to onboard new engineers / QA, drive coverage discussions, and feed traceability matrices, not to duplicate the code.

## Suites at a glance

| # | Suite | File | Type | Tests |
| --- | --- | --- | --- | --- |
| 1 | Register | [`ui/register.md`](ui/register.md) | UI | 5 |
| 2 | My Account / Profile | [`ui/profile.md`](ui/profile.md) | UI | 5 |
| 3 | Address Book | [`ui/address-book.md`](ui/address-book.md) | UI | 5 |
| 4 | Home | [`ui/home.md`](ui/home.md) | UI | 2 |
| 5 | Product | [`ui/product.md`](ui/product.md) | UI | 5 |
| 6 | Compare Products | [`ui/compare-products.md`](ui/compare-products.md) | UI | 5 |
| 7 | Cart (UI) | [`ui/cart.md`](ui/cart.md) | UI | 9 |
| 8 | Checkout | [`ui/checkout.md`](ui/checkout.md) | UI | 4 |
| 9 | Wish List | [`ui/wish-list.md`](ui/wish-list.md) | UI | 3 |
| 10 | Cart API – Comprehensive | [`api/cart.md`](api/cart.md) | API | 3 |
| 11 | Cart UI + API Hybrid | [`api/cart-ui-api.md`](api/cart-ui-api.md) | Hybrid | 1 |
| — | E2E (placeholder) | `tests/ui/test-e2e.spec.ts` | UI | 0 (skeleton only) |

**Totals:** 11 active suites · 47 test cases · 12 spec files (1 empty placeholder).

## Tag coverage

| Tag | Count | Where |
| --- | --- | --- |
| `@smoke` | 3 | Register TC-001, Cart TC02, Checkout TC_CHK_001 |
| `@regression` | 11 | Cart TC01–TC05 + TC_CART_01–04, Checkout TC_CHK_001/002/003, Register TC-001 |
| _no tag_ | 33 | All other tests |

> The bulk of the suite has **no tag yet** — pending refactor item **G4** (see project audit / chat history). Use this as your tag-coverage starting point.

## Conventions you will see

- **Setup pattern:** Most suites start by registering a fresh user via `registerPage` + a generated `UserProfile`. This avoids cross-test contamination and removes any reliance on a shared logged-in state.
- **Data factories:** `generateUserProfileData`, `generateAddressData`, `getEnvProduct`, `createRegisterData`, `createUpdateProfileData`, etc. live under `data/` and produce per-test data so tests are independent and parallel-safe.
- **Environment-aware product data:** `getEnvProduct()` returns a different product depending on `Constants.ENV`, so `Cart` tests are environment-portable.
- **Verifications:** Centralized helpers — `Assertions.*` (hard assertions) and `AssertHelper.*` (soft assertions). Page Objects also expose `verifyXxx()` methods that wrap reusable expectations.
- **Messages:** Expected UI/API copy lives in `data/messages-data.ts` (`Messages.*`) — never hard-coded in the spec.

## Maintenance

When you add or change a test:

1. Update the matching feature file in `knowledge-base/ui/` or `knowledge-base/api/`.
2. If you add a brand-new suite, add it to the **Suites at a glance** table above and create a new file under the matching folder.
3. If a test changes tags, update the **Tag coverage** table.
4. Keep the **Source `path:line`** column accurate — that is the contract this knowledge base offers.

> Tip: a spec entry that gets out of date is worse than no entry. If you cannot maintain it, delete it.
