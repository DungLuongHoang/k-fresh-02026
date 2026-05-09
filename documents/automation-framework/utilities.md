# Utilities — `utilities/`

The `utilities/` folder is the **shared toolbox** consumed by `pages/`, `data/`, and `tests/`. It holds constants, the logger, the `@step` decorator, the random-data generator, JSON I/O, currency math, the `Utility` grab-bag, and the two assertion classes.

**Goals**

- One place to read env vars, time-outs, routes, and feature flags (`Constants`).
- One place to wrap arbitrary methods in a Playwright/Allure-friendly step (`@step`).
- One place to generate random but realistic test data (`Generate` / `faker`).
- Stable, well-named helpers so specs and pages don't reinvent string/date/array utilities.

---

## Folder Layout

```
utilities/
├── assertions.ts       Static value/array/object/JSON/schema assertions (see assertions.md)
├── assert-helper.ts    Instance class for DOM/page/API/download assertions (see assert-helper.md)
├── constants.ts        Constants — env-driven URLs, timeouts, worker counts, login creds
├── currency.ts         Currency formatting / numeric coercion
├── gen.ts              Generate class — faker-backed random data (numbers, strings, dates, MMSI, …)
├── jsonHandling.ts     readJsonFile<T>(path, env?) — typed JSON loader
├── logger.ts           Logger — gated console wrapper (SHOW_LOG env var)
├── logging.ts          @step decorator — wraps methods in test.step for reporters
└── utility.ts          Utility — file ops, random selection, date/string helpers, 2D array helpers
```

Import via the path alias `@utilities/...`:

```typescript
import { Constants } from '@utilities/constants';
import { Logger } from '@utilities/logger';
import { step } from '@utilities/logging';
import { Utility } from '@utilities/utility';
import { Generate } from '@utilities/gen';
import { readJsonFile } from '@utilities/jsonHandling';
```

---

## 1. `Constants` — single source for env-driven values

```typescript
// utilities/constants.ts (excerpt)
export class Constants {
  static readonly TIMEOUTS = { DEFAULT: 60000, WAIT_LOCATOR: 60000, /* … */ };
  static readonly WORKERS = Number(process.env['WORKERS'] ?? 4);
  static readonly LOCAL_WORKERS = Number(process.env['LOCAL_WORKERS'] ?? 10);

  static readonly ENV = process.env['ENV'] ?? 'qa';
  static readonly BASE_URL = process.env['BASE_URL'] ?? 'https://ecommerce-playground.lambdatest.io/';
  static readonly LOGIN_URL = `${Constants.BASE_URL}/index.php?route=account/login`;

  static readonly LOGIN_USERNAME = process.env['LOGIN_USERNAME'] ?? 'tomsmith';
  static readonly LOGIN_PASSWORD = process.env['LOGIN_PASSWORD'] ?? '';
}
```

Rules:

- **Always** access env vars via bracket notation (`process.env['ENV']`) — strict tsconfig (`noPropertyAccessFromIndexSignature`) forbids dot-access.
- Add new constants here when they're shared across two or more files. One-off values stay local.
- Group by category with `static readonly TIMEOUTS = { … }` rather than 12 separate `static readonly XXX_TIMEOUT_MS` constants.
- URL constants compose from `BASE_URL` so an env switch is a single env var.

---

## 2. `Logger` — gated `console`

```typescript
import { Logger } from '@utilities/logger';

Logger.log('Starting login flow');
Logger.warn('Falling back to default user');
Logger.error('Unrecoverable: missing fixture');   // always printed
```

| Method | Gated by `SHOW_LOG=false`? |
|---|---|
| `log`, `info`, `debug`, `warn`, `trace`, `table`, `group`, `groupEnd`, `time`, `timeEnd` | Yes — silent when `SHOW_LOG=false` |
| `error` | **Always prints** — surface real problems even with logs disabled |

Set `SHOW_LOG=false` in your env to silence verbose logs in CI without touching code. Do **not** call `console.log` directly — Logger is the only allowed entry point.

---

## 3. `@step` — uniform reporting

`@step('Label')` wraps a method in `test.step(...)` so it shows up in the Playwright HTML report, Allure trace viewer, and CI logs:

```typescript
import { step } from '@utilities/logging';

export class LoginPage extends LoginLocators {
  @step('Log in with user credentials')
  async login(user: User): Promise<void> {
    await this.commonPage.fill(this.inputEmail, user.username);
    await this.commonPage.fill(this.inputPassword, user.password);
    await this.commonPage.click(this.btnSubmit);
  }
}
```

Conventions:

- Use **action-oriented labels** (`'Fill Registration Form'`), not method names (`'fillRegistrationForm'`).
- Apply to **every public** method on a page object, helper, and assertion class.
- For dynamic labels, wrap the inner work in `await test.step(\`...${user.email}...\`, async () => { ... })` while keeping a stable `@step` outer label — gives a stable filter target plus per-call detail.

See [`pages.md` §3](./pages.md) for the full pattern.

---

## 4. `Utility` — non-domain helpers

`Utility` is a static-method grab-bag for things that don't deserve their own file. Cherry-pick what you need:

| Category | Methods |
|---|---|
| Time | `delay(seconds)` (sparingly — prefer Playwright auto-retry) |
| Strings | `getSubstring`, `getCharAt`, `convertToISO8601`, `nextDayOfFile` |
| Numbers | `roundDown`, `formatPercentage`, `isStringNumber` |
| Arrays | `getRandomElementInArray`, `getRandomItems` (Fisher–Yates), `isSorted`, `arraysEqual`, `indexOfSubArray`, `mapKeys`, `getRowAsColumns` |
| URL | `getDomainFromUrl(url)` |
| Files | (paths/JSON helpers — prefer `jsonHandling.ts`) |

Rules:

- `delay()` is allowed **only** for things Playwright cannot auto-wait (e.g. polling a third-party that doesn't expose a state). For DOM, use `assertElementVisible` (auto-retries) or `waitFor`.
- Whenever you reach for `Utility.X` twice from the same file, hoist a tiny helper instead.

---

## 5. `Generate` — randomized data

`Generate` is a thin wrapper over `faker` plus domain-specific generators. Use it inside `data/*-helper.ts`, never inside a spec or page:

```typescript
import { Generate } from '@utilities/gen';

const gen = new Generate();
const phone = gen.generatePhoneNumber();
const float = gen.generateRandomFloat(0, 100, 2);
const mmsi = gen.generateMMSI();
```

Conventions:

- New generator? Add it to `gen.ts` so every test gets the same shape.
- For domain entities (User, Product), prefer the `data/*-helper.ts` wrappers — they return values typed against `models/`.
- `faker` accesses can return `undefined` for empty inputs; the generator already guards or asserts non-null.

---

## 6. `readJsonFile` — typed JSON loader

```typescript
import { readJsonFile } from '@utilities/jsonHandling';
import { Product } from '@models/product';

const productsByEnv: Record<string, Product> = readJsonFile('./data/products.json');
const userForEnv  = readJsonFile<User>('./data/users.json', 'qa');
```

Always parameterize `<T>` so callers get a typed return. Don't read JSON with `fs.readFileSync` directly — go through this helper.

---

## 7. Currency

`utilities/currency.ts` exposes formatting and numeric coercion for prices. Use it whenever you parse a price-string from the DOM:

```typescript
import { Currency } from '@utilities/currency';

const totalAsNumber = Currency.parse('$199.99');     // 199.99
const formatted     = Currency.format(199.99, 'USD'); // "$199.99"
```

Avoid `Number(text.replace('$', ''))` in specs — that loses locale handling. Currency is the only allowed entry point.

---

## 8. Connecting `utilities/` to the rest of the framework

```
utilities/        →  shared toolbox (constants, logger, decorator, generators, JSON, assertions)
locators/         →  reads Constants for timeouts when needed
data/             →  reads JSON via jsonHandling.ts; uses Generate for randomized fixtures
pages/            →  uses @step on every public method, AssertHelper for DOM assertions, Utility/Currency where needed
tests/            →  reads Constants for URLs, Logger for diagnostics, Assertions/AssertHelper for assertions
```

---

## 9. Anti-patterns (Do Not)

- **No `process.env.X`** with dot-access — strict tsconfig forbids it. Use `process.env['X']`.
- **No `console.log` / `console.warn`** — go through `Logger`. Errors that must always print → `Logger.error`.
- **No method without `@step`** on the public surface of a page object or helper.
- **No `expect(...)` outside `Assertions` / `AssertHelper`** — duplicates message handling.
- **No `setTimeout` / `await new Promise(r => setTimeout(r, 5000))`** in tests — extend the auto-retry timeout instead.
- **No new helper added to `Utility`** for a single caller — keep it where it's used until a second consumer appears.
- **No `Math.random()`** for test data — use `Generate` / `faker` so seeds are reproducible.
- **No `JSON.parse(fs.readFileSync(...))`** — go through `jsonHandling.readJsonFile<T>`.
- **No raw `Number(text.replace('$', ''))`** — use `Currency.parse`.

---

## 10. Quick reference — Picking the right helper

```
Need a URL / timeout / worker count / login credential? → Constants
Need to log progress (gated by SHOW_LOG)?              → Logger.log / .info / .debug / .warn
Need to log a real error (always printed)?             → Logger.error
Need a method to show up in the Playwright report?     → @step('Action label')
Need to read JSON keyed by env?                        → readJsonFile<T>(path, env)
Need a random number, name, address, password?         → Generate / faker via data/*-helper.ts
Need to compare two arrays / objects / values?         → Assertions (utilities/assertions.ts)
Need to assert on a Locator / Page / API response?     → AssertHelper (utilities/assert-helper.ts)
Need to parse "$199.99" → 199.99?                      → Currency.parse
Need a tiny string / array / date helper?              → Utility.<method>; promote to its own file once shared
Need to generate a fresh User / Address / Product?     → data/<entity>-helper.ts (which calls Generate)
```
