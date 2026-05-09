# Coverage Requirements

The minimum bar every feature suite must meet before it ships. This document is the **acceptance contract** for new test suites — if a checklist row is missing, the suite is incomplete.

**Goals**

- Catch regressions in production-critical paths (smoke).
- Surface boundary / validation defects before users do.
- Keep the regression suite focused on real risk, not duplicate happy-path coverage.

---

## 1. Per-feature checklist

For every feature you generate, the suite must include **at minimum**:

| Required case | Tag(s) | Why |
|---|---|---|
| 1 happy path | `@smoke`, `@regression` | Proves the primary user journey still works |
| 1 negative / validation case | `@regression` | Catches loosened validation, missing error messages |
| 1 boundary / equivalence-partition case | `@regression`, `@boundary` (optional) | Surfaces off-by-one / max-length / empty-input bugs |
| 1 regression-flagged case beyond smoke | `@regression` | Locks in fixes for previously-broken behavior |
| 1 permission / role check (when applicable) | `@regression`, `@auth` | Prevents privilege escalation regressions |

Suites missing any required row should not be merged.

---

## 2. Tag taxonomy

Tags are how CI selects what to run. Use them consistently.

| Tag | Meaning | Used by CI |
|---|---|---|
| `@smoke` | Critical happy paths only — every PR runs these | PR gate |
| `@regression` | Full regression suite — runs nightly + before release | Nightly |
| `@boundary` | Edge cases, max/min, off-by-one | Nightly |
| `@auth` | Login / role / permissions | Nightly |
| `@<module>` | Per-module slice (`@cart`, `@checkout`, `@profile`) | On-demand |

Rules:

- Every test must carry `@smoke` **or** `@regression` (never neither, often both).
- Module tags (`@cart`, `@auth`, …) are additive — combine freely.
- Do not invent ad-hoc tags (`@flaky-do-not-run`, `@todo`) — fix or `test.fixme`.

```typescript
test('Add product to cart from PDP',
  { tag: ['@smoke', '@regression', '@cart'] },
  async ({ productPage, cartPage }) => {
    // ...
  },
);
```

---

## 3. Layer matrix — UI vs API

For every business-critical flow, prefer **dual coverage**: a fast API test for state changes, and a UI test for the user-visible journey.

| Flow | API test (`tests/api/`) | UI test (`tests/ui/`) |
|---|---|---|
| Add to cart | `POST /cart/add` returns 200 + `cart.info` reflects line item | PDP → click Add → toast → cart shows item |
| Update quantity | `POST /cart/edit` then `cart.info` shows new qty | Cart row +/- buttons → row qty + total update |
| Register | `POST /account/register` 200 + `users` table updated | Form submit → redirect to dashboard |

Do **not** ship UI-only coverage for state-changing flows when an API path exists — the UI test is too expensive to use as the only gate.

---

## 4. Definition of "done" for a coverage PR

A coverage-adding PR is mergeable when:

1. Every checklist row in §1 is satisfied for the feature in scope.
2. Every test carries the right tags from §2.
3. State-changing flows have both API and UI tests (§3).
4. Knowledge base entry exists at `knowledge-base/<area>/<feature>.md`.
5. `npm run check:all` passes (lint + typecheck).
6. The full regression run (`@regression`) is green locally before pushing.

---

## 5. Anti-patterns (Do Not)

- **No "happy path × 5"** with cosmetically-different inputs — those are fixtures, not coverage.
- **No assertion-free tests** — a test that only navigates is observability theater.
- **No untagged tests** — they get skipped in CI selection and rot.
- **No regression coverage hiding behind `test.skip`** — fix it or remove it.
- **No `expect(true).toBe(true)`** — placeholder tests block real failures from showing up.

---

## 6. Quick reference — Did I cover enough?

```
Did I add a happy path?                        → @smoke + @regression
Did I add a validation/negative case?          → @regression
Did I add a boundary case?                     → @regression (+ @boundary)
Does the feature touch auth or permissions?    → add an auth test (@regression + @auth)
Does the flow change server state?             → add an API test under tests/api/
Did I update knowledge-base/<area>/?           → required for every new test
```
