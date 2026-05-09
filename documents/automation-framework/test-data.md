# Test Data — `data/`

The `data/` folder is the **single source of test inputs and expected strings** — fixed catalogues, generated random data, environment-aware loaders, and shared constants like server messages. Specs and page objects must not embed fixture data inline.

**Goals**

- Reuse fixtures across specs without copy-paste.
- Keep environment-specific data behind a single loader so a `qa` → `prod` swap is one env-var flip.
- Catch fixture/model drift at compile time — every export here is typed against `models/`.

---

## Folder Layout

```
data/
├── address-data.ts     generateAddressData() → Address (random, faker)
├── checkout-data.ts    payment + shipping fixtures for checkout flows
├── data-loader.ts      getEnvProduct(env) — env-aware Product loader (alias of product-helper)
├── login-data.ts       static login credentials (email + password)
├── login.data.ts       legacy filename — keep until callers migrate
├── messages-data.ts    Messages class — every server-facing string used by assertions
├── product-data.ts     hand-curated single product (legacy)
├── product-helper.ts   getEnvProduct(env) — preferred entrypoint to env-keyed product fixtures
├── products-data.ts    products: { htcTouch, canon, palmTreo, nikon, ipod } — typed catalogue
├── products.json       env-keyed JSON (qa/prod/staging/dev → Product) loaded by helpers
├── search-data.ts      query strings for search tests
├── user-data.ts        generateUserProfileData() + login fixtures
├── user-helper.ts      createRegisterData / createAddressData / createStrongPassword / getLoginCredentials
└── users.json          env-keyed JSON for static User fixtures
```

Import via the path alias `@data/...`:

```typescript
import { products } from '@data/products-data';
import { getEnvProduct } from '@data/product-helper';
import { generateUserProfileData } from '@data/user-data';
import { Messages } from '@data/messages-data';
```

---

## 1. Three flavors of test data

### 1a. Static catalogues — `products-data.ts`

Hand-curated, deterministic. Keys are statically typed so callers get autocomplete and no `Product | undefined`:

```typescript
export const products = {
  htcTouch: { id: '28', name: 'HTC Touch HD', price: 146.00, /* ... */ },
  canon:    { id: '30', name: 'Canon EOS 5D', price: 134.00, /* ... */ },
  // ...
} satisfies Record<string, Product>;
```

Then in a spec:

```typescript
import { products } from '@data/products-data';

await productPage.addProductsToCompare([products.htcTouch, products.canon]);
```

> Use `satisfies Record<string, Product>` — not `: Record<string, Product>`. `satisfies` keeps the **literal** key set in the inferred type so `products.canon` is `Product`, never `Product | undefined`. See `documents/automation-framework/interfaces.md` §6 for the full pattern.

### 1b. Random generators — `*-helper.ts`

Faker-driven, used when each test needs a fresh user / address. Always typed against a `models/` interface:

```typescript
// data/user-helper.ts
export function createRegisterData(): UserProfile {
  const uniqueId = faker.string.alphanumeric(10).toLowerCase();
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `qa.auto.${uniqueId}@example.com`,
    telephone: faker.string.numeric(10),
    password: createStrongPassword(),
  };
}
```

### 1c. Env-aware loaders — `data-loader.ts` / `product-helper.ts`

Reach into `products.json` / `users.json` keyed by `process.env.ENV`. Falls back to `production` so the test can still run in any env, with an explicit error if even the fallback is missing:

```typescript
// data/product-helper.ts
export function getEnvProduct(
  env: string = (process.env['ENV'] as ENV) ?? 'production',
): Product {
  const product = productsByEnv[env] ?? productsByEnv['production'];
  if (!product) {
    throw new Error(`No product data for env "${env}" and no "production" fallback`);
  }
  return product;
}
```

Use the helper, never read the JSON directly:

```typescript
import { getEnvProduct } from '@data/product-helper';
const product: Product = getEnvProduct();   // resolves against current ENV
```

---

## 2. `Messages` — strings the app shows users

`messages-data.ts` is the **only** place server-facing strings live. Specs and page objects assert against `Messages.X`, never against a hard-coded string:

```typescript
import { Messages } from '@data/messages-data';

await productPage.verifyAddToCartSuccessMessage(Messages.ADD_TO_CART_SUCCESS_MESSAGE);
await assertHelper.assertElementContainsText(banner, Messages.REGISTER_SUCCESS_MESSAGE);
```

When the app changes a string, you change it once here — every assertion updates automatically. Group related messages with comments:

```typescript
export class Messages {
  static readonly ADD_TO_CART_SUCCESS_MESSAGE = 'Success: You have added';

  // Register errors
  static readonly REGISTER_ERROR_EMAIL = 'E-Mail Address does not appear to be valid!';
  static readonly REGISTER_ERROR_PASSWORD = 'Password must be between 4 and 20 characters!';
}
```

> Do **not** reach for `messages-data.ts` for **locator-text** strings (e.g. button labels). Those go through `TRANSLATIONS` — see [`locators.md` §4](./locators.md).

---

## 3. Naming conventions

| Element | Convention | Example |
|---|---|---|
| File name | kebab-case, suffix that hints the role | `user-data.ts`, `product-helper.ts`, `data-loader.ts` |
| Static fixture export | camelCase noun | `products`, `validUser`, `defaultAddress` |
| Generator function | `create<Entity>Data()` / `generate<Entity>Data()` | `createRegisterData()`, `generateAddressData()` |
| Env-aware loader | `get<Entity>(env?)` | `getEnvProduct(env)`, `getLoginCredentials()` |
| Constants class | PascalCase, `Messages`-style | `Messages`, `Constants` |
| JSON file | kebab-case, suffix `.json` | `products.json`, `users.json` |

---

## 4. Connecting `data/` to the rest of the framework

```
models/          →  describe the SHAPE
data/            →  provide concrete instances of those shapes
pages/           →  consume those instances as method parameters
tests/           →  pull from `data/`, never inline values
```

In a spec:

```typescript
import { test } from '@pages/base-page';
import { generateUserProfileData } from '@data/user-data';
import { Messages } from '@data/messages-data';

test('registers a new user', async ({ registerPage, profilePage, assertHelper }) => {
  const profile = generateUserProfileData();              // fresh user per test
  await registerPage.fillRegistrationForm(profile);
  await registerPage.submitRegistrationForm();
  await assertHelper.assertElementContainsText(
    profilePage.lblSuccessMessage,
    Messages.REGISTER_SUCCESS_MESSAGE,
  );
});
```

---

## 5. Anti-patterns (Do Not)

- **No inline fixtures** in specs (`{ email: 'foo@x.test', password: 'p' }`) — put them in `data/`.
- **No hardcoded server messages** in assertions — go through `Messages.X`.
- **No `Record<string, T>`** for static catalogues — use `satisfies Record<string, T>` to keep the literal key set.
- **No `any`** in `data/` exports — type everything against a `models/` interface.
- **No mutation of shared fixtures** in a test — use `Readonly<T>` (see [`interfaces.md` §6](./interfaces.md)) or clone with `{ ...fixture }`.
- **No JSON file read inside a spec** — go through `data-loader.ts` / `product-helper.ts`.
- **No two filenames pointing at the same data** — `login-data.ts` is canonical, `login.data.ts` is legacy and should not be added to.
- **No `process.env.X`** with dot-access — strict tsconfig forbids it. Use `process.env['X']`.

---

## 6. Quick reference — Picking the right shape

```
Need a deterministic fixture (same every run)?           → static export in `<entity>-data.ts`, `satisfies Record<string, T>`
Need a fresh, randomized fixture per test?               → generator in `<entity>-helper.ts`, faker-backed, typed
Need data that depends on env (qa vs prod)?              → JSON file + helper (see product-helper.ts pattern)
Need an expected server-facing string?                   → add a constant to `Messages` in `messages-data.ts`
Need a UI label / button text?                           → NOT here — use TRANSLATIONS via locators
Need a single set of credentials?                        → user-helper.ts `getLoginCredentials()` (reads env vars)
Need to reuse a fixture across specs without mutation?   → export as `Readonly<T>`
```
