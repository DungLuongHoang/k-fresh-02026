# Tests — `tests/`

The `tests/` folder is the **only place specs live**. Specs are thin orchestration scripts — they pull fixtures from `pages/base-page.ts`, call business actions on page objects, and verify outcomes through `verify…` / `expect…` methods.

**Goals**

- A spec reads top-to-bottom as a description of the user journey (no selectors, no `expect(locator)`, no inline data).
- The same spec runs in `qa`, `staging`, `prod` by toggling `ENV` — never by editing the file.
- CI can run any subset by tag (`@smoke`, `@regression`, `@cart`, …) without re-organizing files.

---

## Folder Layout

```
tests/
├── api/                    request-context tests (no browser launched)
│   ├── test-cart.spec.ts
│   └── test-cart-ui-api.spec.ts   hybrid: UI action verified via API
├── db/                     reserved for direct DB checks (currently empty)
└── ui/                     full browser specs
    ├── test-login.spec.ts (when added)
    ├── test-register.spec.ts
    ├── test-cart.spec.ts
    ├── test-checkout.spec.ts
    ├── test-product.spec.ts
    ├── test-profile.spec.ts
    ├── test-home.spec.ts
    ├── test-wish-list.spec.ts
    ├── test-compare-products.spec.ts
    ├── test-address-book.spec.ts
    └── test-e2e.spec.ts             end-to-end happy paths spanning many pages
```

Naming:

- File: `test-<feature>.spec.ts` — `test-` prefix matches the project's `--grep` shortcuts and is enforced by the [`pre-push` hook](../husky-guidelines.md).
- Suite: `test.describe('<Feature> Tests', …)`.
- Test: `'<TC_ID> - Observable outcome'` (e.g. `'TC02 - Add Product to Cart'`).

---

## 1. Anatomy of a spec

```typescript
import { test } from '@pages/base-page';                      // 1. fixtures
import { Constants } from '@utilities/constants';             // 2. URLs
import { Messages } from '@data/messages-data';               // 3. expected strings
import { generateUserProfileData } from '@data/user-data';    // 4. typed test data
import { getEnvProduct } from '@data/product-helper';         // 5. env-aware fixture
import { Product } from '@models/product';
import { UserProfile } from '@models/user';

const product: Product = getEnvProduct();
let userProfile: UserProfile;

test.describe('Cart Tests', () => {

  test.beforeEach(async ({ commonPage, registerPage }) => {
    userProfile = generateUserProfileData();
    await commonPage.goto(Constants.REGISTER_URL);
    await registerPage.fillRegistrationForm(userProfile);
    await registerPage.clickAgreeTermsCheckbox();
    await registerPage.submitRegistrationForm();
  });

  test('TC02 - Add Product to Cart',
    { tag: ['@smoke', '@regression'] },
    async ({ productPage, cartPage }) => {
      await productPage.commonPage.goto(Constants.BASE_URL);
      await productPage.searchAndSelectProduct(product);
      await productPage.clickAddToCart();
      await productPage.verifyAddToCartSuccessMessage(Messages.ADD_TO_CART_SUCCESS_MESSAGE);
      await productPage.clickViewCartLink();
      await cartPage.verifyProductAddedToCart(product);
    },
  );
});
```

Mandatory pieces:

| Piece | Rule |
|---|---|
| `import { test } from '@pages/base-page'` | Always pull `test` from this file — never from `@playwright/test` |
| `test.describe(...)` | One per spec file, sentence-cased title |
| `test('<TC_ID> - <observable outcome>', { tag: [...] }, async ({ ... }) => { ... })` | Tag every test (see §3) |
| Fixtures via destructuring | `async ({ productPage, cartPage }) => …` — never `new ProductPage(page)` |
| Constants / Messages / typed data | All referenced by import — no inline strings, no `any` data |
| Page-object methods only | Specs never call `page.click(...)`, `expect(locator)…`, etc. |

---

## 2. Hooks

| Hook | Use for | Caveat |
|---|---|---|
| `test.beforeAll` | One-time setup that survives across tests in the file (e.g. log in once when the test does not require fresh state) | Shared state increases coupling — prefer `beforeEach` |
| `test.beforeEach` | Per-test arrange phase: register a fresh user, navigate to a starting page, etc. | Keep it ≤ 5 lines — anything longer is a setup helper in the page object |
| `test.afterEach` | Cleanup that the test cannot finish on its own (e.g. delete server-side data when the UI lacks the affordance) | Avoid swallowing errors — let the test fail loudly |
| `test.afterAll` | One-time teardown (close shared resources) | Rarely needed in this codebase |

If a hook starts to look like a separate scenario, promote it into a real test.

---

## 3. Tag taxonomy

Defined in [`coverage-requirements.md` §2](./coverage-requirements.md). Quick recap:

| Tag | When to apply |
|---|---|
| `@smoke` | Critical happy path — runs on every PR |
| `@regression` | Full regression suite — runs nightly + before release |
| `@boundary` | Edge case (max length, off-by-one, empty input) |
| `@auth` | Login / role / permission |
| `@<module>` | Per-module slice (`@cart`, `@checkout`, `@profile`) — additive |

```typescript
test('TC_REG_03 - Register fails with mismatched password',
  { tag: ['@regression', '@auth'] },
  async ({ registerPage }) => { … });
```

Rule: **every** test must carry at least one of `@smoke` or `@regression`. Untagged tests get skipped by the CI tag selectors.

---

## 4. UI tests vs API tests

| Concern | `tests/ui/` | `tests/api/` |
|---|---|---|
| Fixture | `page` (browser) + page-object fixtures | `apiPage` + `request` context |
| Speed | seconds-to-tens-of-seconds per test | milliseconds-to-seconds |
| What it verifies | The user can complete the journey end-to-end | The server accepts the request and returns the right shape |
| When to use | One per critical UI journey | One per state-changing endpoint, plus sad paths |
| Hybrid (`tests/api/test-*-ui-api.spec.ts`) | UI triggers an action, the spec verifies the **server side effect** via API — see `test-cart-ui-api.spec.ts` |

For state-changing flows, prefer **dual coverage** (one fast API test + one UI test). See [`coverage-requirements.md` §3](./coverage-requirements.md).

---

## 5. Side-effect verification

Whenever a test changes server state (POSTs, PATCHes, DELETEs) and the UI shows only a generic "Success" toast, **also** verify the side effect via API. Without this, a silently-no-op'd endpoint still passes:

```typescript
// 1. UI action
await cartPage.updateProductQuantity({ ...product, quantity: 3 });
await cartPage.verifyCartModifiedSuccessMessage(Messages.UPDATE_CART_SUCCESS_MESSAGE);

// 2. Side-effect probe — refetch and assert
const verifyResponse = await apiPage.apiGetRequest('index.php?route=common/cart/info');
await cartPage.page.setContent(await verifyResponse.text());
await cartPage.verifyUpdatedProductQuantity({ ...product, quantity: 3 });
```

This pattern is documented per-test in `knowledge-base/api/cart.md`.

---

## 6. Adding a new spec

1. **Pick the layer**: state-changing API call → `tests/api/`; user-visible flow → `tests/ui/`; both → ship the API test first, then the UI test.
2. **File**: `tests/<layer>/test-<feature>.spec.ts`.
3. **Suite**: `test.describe('<Feature> Tests', () => { … })`.
4. **Tags**: at least one of `@smoke` / `@regression`, plus the relevant `@<module>` tag.
5. **Page objects**: if a button has no method, add it to the page object first ([`pages.md` §6](./pages.md)).
6. **Test data**: if a fixture is missing, add it to `data/` (or generate it via a `*-helper.ts`) — see [`test-data.md`](./test-data.md).
7. **Assertions**: every test ends with a `verify…` / `expect…` page method using `AssertHelper` (see [`assert-helper.md`](./assert-helper.md)).
8. **Knowledge base**: create or update `knowledge-base/<layer>/<feature>.md` with TC ID, tags, fixtures, steps, and expected outcome.
9. **Local gate**: run `npm run check:all` and the relevant tag (`npx playwright test --grep @cart`) before pushing.

---

## 7. Connecting `tests/` to the rest of the framework

```
locators/        →  describe WHERE elements live
models/          →  describe data SHAPES
data/            →  provide concrete inputs (fixtures, generators, expected strings)
pages/           →  describe HOW the user acts on the UI / API
tests/           →  describe WHICH journeys we verify, using fixtures + page methods
```

A reader of a spec must be able to understand the journey **without opening any page object**. If they have to, the test is doing too much mechanics.

---

## 8. Anti-patterns (Do Not)

- **No `import { test } from '@playwright/test'`** — always import from `@pages/base-page`.
- **No inline data**: `await loginPage.login({ email: 'foo@x.test', password: 'p' })` — pull from `data/`.
- **No raw `page.click(...)` / `page.fill(...)` / `expect(locator)…`** — go through page objects + `assertHelper`.
- **No untagged tests** — they're invisible to CI.
- **No `test.only`** — pre-push hook will reject the push.
- **No `test.skip` / `test.fixme` without a comment** explaining why.
- **No `try/catch` to ignore an assertion failure** — it defeats the soft-assert design.
- **No `waitForTimeout(...)` / `Utility.delay(...)`** — use Playwright auto-retry; if you really need a wait, use `assertElementVisible` (auto-retries) or `waitFor({ state })`.
- **No setup logic that exceeds the test it's setting up** — refactor into a helper or extract into a smaller spec.

---

## 9. Quick reference — Authoring a new test

```
Setup is ≤ 5 lines and per-test?                        → `test.beforeEach`
Setup is heavy and same for every test in the file?     → `test.beforeAll` (sparingly)
Test verifies a user-visible journey?                   → tests/ui/, with page-object methods
Test verifies a server endpoint contract?               → tests/api/, with apiPage fixture
Test triggers a UI action that mutates server state?    → also re-fetch via API to verify the side effect
Test asserts a specific text?                           → use Messages.X (data/messages-data.ts)
Test compares two values?                               → Assertions.<assertEqual / assertObjectIsSubset / …>
Test asserts an element is visible / has text?          → AssertHelper.<assertElementVisible / …>
Test depends on env-keyed fixture?                      → getEnvProduct() / getLoginCredentials()
Test must run on every PR?                              → tag with @smoke (and @regression)
```
