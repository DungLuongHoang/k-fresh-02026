# Page Objects — `pages/`

The `pages/` folder is the **only place that turns selectors into business actions**. Specs never call `click()`, `fill()`, or `expect()` directly — they call high-level methods like `loginPage.login(user)` or `registerPage.fillRegistrationForm(profile)`.

**Goals**

- Specs read like a functional description of the test (intent, not mechanics).
- Selector changes do not ripple into specs.
- Common interactions (waiting, scrolling, retrying clicks, handling dialogs) are written **once** in `CommonPage` and reused everywhere.

---

## Folder Layout

```
pages/
├── base-page.ts        Playwright `test.extend(...)` — registers every page as a fixture
├── common-page.ts      CommonPage: action toolkit (click, fill, navigate, waits, …)
├── api/                API-side page objects (request fixture)
│   └── api-page.ts
└── ui/                 Browser-facing page objects (one per logical screen)
    ├── home-page.ts
    ├── login-page.ts
    ├── register-page.ts
    ├── product-page.ts
    ├── cart-page.ts
    ├── checkout-page.ts
    ├── address-book-page.ts
    ├── compare-products-page.ts
    ├── my-orders-page.ts
    ├── profile-page.ts
    └── wish-list-page.ts
```

> `AssertHelper` is **not** a page object — it lives in `utilities/assert-helper.ts` and is registered as a fixture in `base-page.ts`. See [`assert-helper.md`](./assert-helper.md) for the full surface.

Import via the path alias `@pages/...` (and `@utilities/...` for the helper):

```typescript
import { test } from '@pages/base-page';
import { CommonPage } from '@pages/common-page';
import { AssertHelper } from '@utilities/assert-helper';
```

---

## 1. The Three Roles

### `base-page.ts` — fixtures only

Extends Playwright's `test` and exposes every page object as a typed fixture. Specs use these fixtures directly:

```typescript
export const test = baseTest.extend<{
  loginPage: LoginPage;
  registerPage: RegisterPage;
  commonPage: CommonPage;
  assertHelper: AssertHelper;
  // ...one per page
}>({
  loginPage: async ({ page, context }, use) => {
    const instance = new LoginPage(page);
    context.on('page', (newPage: Page) => instance.setPage(newPage));
    await use(instance);
  },
  // ...
});
```

Two important rules:

- Every page fixture **listens to `context.on('page', ...)`** so it follows popups and reuses the same instance after a new tab opens.
- `assertHelper` and stateless helpers receive only what they need (`async ({ }, use) => ...`).

When you add a new page, you must register it here (see "Adding a new page" below).

### `common-page.ts` — the action toolkit

`CommonPage` extends `CommonLocators` and exposes the verbs your business actions are built from:

| Category | Methods |
|---|---|
| Navigation | `goto`, `navigate`, `openPage`, `reload`, `reloadPage`, `goBackPage`, `goForwardPage` |
| Click / type | `click`, `dblclick`, `press`, `pressKeyboard`, `type`, `fill`, `pressSequentially`, `clear`, `hover`, `selectOption` |
| Dropdowns | `selectOptionDropdown`, `selectOptionDropdownByIndex`, `getAllOptionDropdown`, `clickToHyperlink` |
| State checks | `isVisible`, `isEnabled`, `isEditable`, `isChecked`, `isAttributeExist`, `count` |
| Waits | `waitForVisible`, `waitForAttached`, `waitForDetached`, `waitForHidden`, `waitForDisabled`, `waitForPageLoad`, `waitForElementToDisappear`, `waitFor`, `waitForMillis`, `waitUntilContainsText` |
| Read | `textContent`, `innerText`, `getAttribute`, `getAllTextContents`, `getColor`, `getCurrentUrl` |
| Files / dates | `uploadFile`, `fillDate` |
| Dialogs | `dialogAccept`, `dialogMessage` |
| Scroll | `scrollIntoView`, `scrollTo`, `scrollUntilVisible` |
| Ant Design | `confirmAntPopconfirmAndWaitForSuccess`, `confirmAntModalAndWaitForSuccess`, `confirmAntPopupOrModalAndWaitForSuccess` |
| API tap-in | `getAPIResponse` |
| Misc | `verifyPageLoaded`, `validateOption`, `clickContinue` |

Feature page objects **do not duplicate these primitives** — they call `this.commonPage.<method>(...)`.

### Feature page objects — business actions

Each feature page extends its own locator class and holds a `CommonPage` instance:

```typescript
import test, { Page } from '@playwright/test';
import { LoginLocators } from '@locators/login-locators';
import { CommonPage } from '@pages/common-page';
import { AssertHelper } from '@utilities/assert-helper';
import { step } from '@utilities/logging';
import { UserProfile } from '@models/user';
import { Constants } from '@utilities/constants';
import { Messages } from '@data/messages.data';

export class LoginPage extends LoginLocators {
  commonPage: CommonPage;
  assertHelper: AssertHelper;

  constructor(page: Page) {
    super(page);
    this.commonPage = new CommonPage(page);
    this.assertHelper = new AssertHelper();
  }

  @step('Navigating to Login page')
  async goto(url: string = Constants.LOGIN_URL): Promise<void> {
    await this.commonPage.goto(url);
  }

  @step('Log in with user credentials')
  async login(user: UserProfile): Promise<void> {
    await test.step(`Log in with username: ${user.email}`, async () => {
      await this.commonPage.goto(Constants.LOGIN_URL);
      await this.commonPage.fill(this.inputEmail, user.email);
      await this.commonPage.fill(this.inputPassword, user.password);
      await this.commonPage.click(this.btnSubmit);
    });
  }

  @step('Assert successful login')
  async expectSuccessfulLogin(): Promise<void> {
    await this.assertHelper.assertElementContainsText(
      this.flashMessage,
      Messages.SUCCESS_MESSAGE,
      'Login success banner',
    );
  }
}
```

---

## 2. Class Structure Pattern

| Element | Rule |
|---|---|
| Class name | `<Feature>Page`, PascalCase |
| Extends | the matching `<Feature>Locators` class — never extends another page |
| Properties | `commonPage: CommonPage`, optional `assertHelper: AssertHelper` |
| Constructor | `super(page)` then `new CommonPage(page)` (and `new AssertHelper()` if used) |
| Public methods | every public method has a `@step('...')` decorator |
| Method parameters | typed against `models/` interfaces — never raw objects, never `any` |
| URLs / messages | pulled from `Constants` and `Messages` (`@data/messages.data`), never hardcoded |
| Inside the method | call `this.commonPage.<verb>(this.<locator>, ...)` — no `this.page.click(...)` |

---

## 3. The `@step` Decorator

Every public method must be decorated. The label is what shows up in:

- Playwright's HTML report ("Action" tree)
- The trace viewer
- CI logs (`utilities/logging.ts`)

```typescript
@step('Fill Registration Form')
async fillRegistrationForm(userProfile: UserProfile): Promise<void> {
  // ...
}
```

Rules:

- Use **action-oriented labels**: `'Fill Registration Form'`, not `'fillRegistrationForm'` and not `'Step 1'`.
- For methods that vary at runtime, wrap the dynamic part in an inner `test.step(...)`:

```typescript
@step('Log in with user credentials')
async login(user: UserProfile): Promise<void> {
  await test.step(`Log in with username: ${user.email}`, async () => {
    // ...
  });
}
```

This gives a stable outer label for filtering, plus a per-call inner label for debugging.

---

## 4. Method Categories (Naming)

A page object typically grows three kinds of methods. Name them consistently so consumers know which to call.

| Category | Prefix | Example | Returns |
|---|---|---|---|
| Action | imperative verb | `login`, `addToCart`, `placeOrder`, `submitRegistrationForm` | `Promise<void>` |
| Read / getter | `get<X>` | `getSuccessMessageText`, `getInputValidationMessage` | `Promise<T>` (string, number, boolean, model) |
| Verify / expect | `expect<X>` or `verify<X>` | `expectSuccessfulLogin`, `verifyRequiredFieldsErrorMessages` | `Promise<void>`, throws on failure |
| Predicate | `is<X>` / `has<X>` | `isLoggedIn`, `hasFlashMessage` | `Promise<boolean>` |

Rules:

- A single method does **one** thing. If `login()` also asserts the result, split into `login()` + `expectSuccessfulLogin()`.
- `expect…` / `verify…` methods are the only place assertions go. Action methods stay action-only.
- A predicate (`is…`) returns `boolean`; never let it throw.

---

## 5. Assertions: prefer `AssertHelper` (fixture)

There are two assertion entry points in the codebase:

- `AssertHelper` — instance class, available as the `assertHelper` fixture (preferred)
- `Assertions` — static class in `utilities/assertions.ts`

**Use `AssertHelper` whenever possible.** It produces named, role-aware messages that read well in reports:

```typescript
await this.assertHelper.assertElementContainsText(
  this.flashMessage,
  Messages.SUCCESS_MESSAGE,
  'Login success banner',
);
```

The static `Assertions` class is acceptable for plain value comparisons inside a `verify…` method but should not be the default for element checks.

---

## 6. Adding a New Page Object

Follow this order — out-of-order steps cause TS or runtime errors.

1. **Locator class** — `locators/<feature>-locators.ts` (extend `CommonLocators`).
2. **Model** — `models/<entity>.ts` (only if a new entity is needed).
3. **Page class** — `pages/ui/<feature>-page.ts` (or `pages/api/<feature>-page.ts` for API-only):
   - extend `<Feature>Locators`
   - constructor: `super(page)` + `new CommonPage(page)` (+ `AssertHelper` if needed)
   - one `@step`-decorated method per business action
4. **Register fixture** — add to `pages/base-page.ts`:

```typescript
// 1. import (path is relative to base-page.ts)
import { OrderHistoryPage } from './ui/order-history-page';

// 2. add to fixture type
export const test = baseTest.extend<{
  // ...existing
  orderHistoryPage: OrderHistoryPage;
}>({
  // ...existing
  orderHistoryPage: async ({ page, context }, use) => {
    const instance = new OrderHistoryPage(page);
    context.on('page', (newPage: Page) => instance.setPage(newPage));
    await use(instance);
  },
});
```

5. **Test data** (if needed) — `data/<entity>-data.ts`, typed against the model.
6. **Constants / Messages** (if needed) — add URL to `utilities/constants.ts` and any expected text to `data/messages.data.ts`.

---

## 7. Connecting Pages to the Rest of the Framework

```
locators/        →  describe WHERE elements are
models/          →  describe WHAT data shapes look like
data/            →  provide concrete instances of those shapes
pages/           →  describe HOW the user acts on those elements with that data
tests/           →  describe WHICH user journeys we verify, using the page fixtures
```

A spec consuming the fixtures looks like this:

```typescript
import { test } from '@pages/base-page';
import { validUser } from '@data/user-data';

test.describe('Login', () => {
  test('logs in with valid credentials',
    { tag: ['@smoke', '@auth'] },
    async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(validUser);
      await loginPage.expectSuccessfulLogin();
    },
  );
});
```

The spec never imports `LoginLocators`, `CommonPage`, or `AssertHelper` directly — everything flows through the page object.

---

## 8. Anti-patterns (Do Not)

- **No raw `this.page.click(...)` / `this.page.fill(...)`** in a feature page — go through `this.commonPage`.
- **No locators inside a page method** — they belong in the locator class.
- **No `expect(...)` calls inside a feature page** outside of `expect…` / `verify…` methods.
- **No URLs or message strings hardcoded** — use `Constants` and `Messages`.
- **No `any` parameter** — type against a `models/` interface.
- **No new top-level page next to `base-page.ts` / `common-page.ts`** — feature pages belong in `pages/ui/`, API page objects in `pages/api/`.
- **No method without `@step`** on the public surface.
- **No assertions inside an action method** (`login` shouldn't assert; `expectSuccessfulLogin` does).
- **No `console.log`** — use `Logger` from `@utilities/logger`.
- **No skipping the fixture registration** in `base-page.ts` — a page that isn't a fixture leaks `Page` lifecycle bugs.

---

## 9. Quick Reference — Choosing the Right Tool

```
User-facing business flow (login, addToCart, checkout)?       → action method on the page,  @step
Need to read text/value from the DOM?                         → getter `get<X>`,  Promise<string|number>
Need to assert post-condition?                                → `expect<X>` or `verify<X>` using AssertHelper
Need to know yes/no?                                          → predicate `is<X>` / `has<X>`,  Promise<boolean>
Re-usable across many pages (waits, clicks, dialogs)?         → add it to CommonPage, not to a feature page
Same flow on multiple pages with small variation?             → parameterize the action; do not copy paste
Test wants to navigate forward / back / reload?               → CommonPage's navigation helpers
Need to read an API response triggered by a UI action?        → CommonPage.getAPIResponse(...)
Tabs / new windows?                                            → already handled by `context.on('page', ...)` in the fixture
```
