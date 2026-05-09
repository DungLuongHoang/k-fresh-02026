# AssertHelper — `utilities/assert-helper.ts`

The `AssertHelper` class is the **DOM-and-page assertion toolkit**. It wraps Playwright's web-first assertions (`expect(locator).toBeVisible()`, `toHaveText()`, etc.) so page objects don't repeat boilerplate, and so every assertion failure ends up with a uniform, role-aware label in the report.

> Use `AssertHelper` for **Locators / Pages / API responses / Downloads**. Use [`Assertions`](./assertions.md) for **values, objects, JSON shapes**. Don't mix them.

**Goals**

- Page objects assert on elements through a single, named call (`assertElementVisible(locator, 'Login form')`).
- Assertion failures show meaningful names in the Playwright report and Allure trace, not anonymous selectors.
- Web-first checks always use Playwright's auto-retry — never raw `await expect(locator)` followed by a `waitForTimeout`.

---

## 1. Where it lives + how to use it

`AssertHelper` is registered as a fixture in `pages/base-page.ts` and is the canonical way to call it:

```typescript
// pages/base-page.ts
assertHelper: async ({ }, use) => {
  const instance = new AssertHelper();
  await use(instance);
},
```

Inside a page object:

```typescript
import { AssertHelper } from '@utilities/assert-helper';

export class LoginPage extends LoginLocators {
  assertHelper: AssertHelper;

  constructor(page: Page) {
    super(page);
    this.assertHelper = new AssertHelper();
  }

  @step('Verify login success banner')
  async expectSuccessfulLogin(): Promise<void> {
    await this.assertHelper.assertElementContainsText(
      this.flashMessage,
      Messages.SUCCESS_MESSAGE,
      'Login success banner',
    );
  }
}
```

In a spec:

```typescript
test('shows the cart icon after login', async ({ loginPage, homePage, assertHelper }) => {
  await loginPage.login(validUser);
  await assertHelper.assertElementVisible(homePage.cartIcon, 'Cart icon in header');
});
```

Rules:

- All methods are **instance methods** — never `AssertHelper.assertX(...)`.
- The optional final `message` argument is what shows up in the trace; **always** pass a domain-meaningful name.
- Web-first methods (visibility / text / value) are auto-retrying — do **not** add `waitForTimeout` or `commonPage.waitForVisible` before them.

---

## 2. Method catalogue

### Element presence & state

| Method | Wraps |
|---|---|
| `assertElementAttached(locator, msg?)` | `toBeAttached()` |
| `assertElementNotAttached(locator, msg?)` | `not.toBeAttached()` |
| `assertElementVisible(locator, msg?)` | `toBeVisible()` |
| `assertElementNotVisible(locator, msg?)` | `not.toBeVisible()` |
| `assertElementHidden(locator, msg?)` | `toBeHidden()` |
| `assertElementEnabled(locator, msg?)` | `toBeEnabled()` |
| `assertElementDisabled(locator, msg?)` | `toBeDisabled()` |
| `assertElementEditable(locator, msg?)` | `toBeEditable()` |
| `assertElementEmpty(locator, msg?)` | `toBeEmpty()` |
| `assertElementFocused(locator, msg?)` | `toBeFocused()` |
| `assertElementInViewport(locator, msg?)` | `toBeInViewport()` |
| `assertCheckboxChecked(locator, msg?)` | `toBeChecked()` |
| `assertCheckboxUnchecked(locator, msg?)` | `not.toBeChecked()` |
| `assertElementCount(locator, n, msg?)` | `toHaveCount(n)` |

### Text / value / attributes

| Method | Wraps |
|---|---|
| `assertElementHasText(locator, expected, msg?)` | `toHaveText(expected)` (exact) |
| `assertElementContainsText(locator, expected, msg?)` | `toContainText(expected)` (substring / RegExp) |
| `assertElementHasValue(locator, expected, msg?)` | `toHaveValue(expected)` |
| `assertElementHasValues(locator, expected[], msg?)` | `toHaveValues(expected[])` (multi-select) |
| `assertElementHasAttribute(locator, attr, expected?, msg?)` | `toHaveAttribute(attr, expected)` |
| `assertElementNoAttribute(locator, attr, unexpected?, msg?)` | `not.toHaveAttribute(attr, unexpected)` |
| `assertElementContainClass(locator, className(s), msg?)` | `toHaveClass(...)` (single or list) |
| `assertElementNotContainClass(locator, className(s), msg?)` | `not.toHaveClass(...)` |
| `assertElementHasCSS(locator, prop, value, msg?)` | `toHaveCSS(prop, value)` |

### Page / URL / title

| Method | Wraps |
|---|---|
| `assertPageHasTitle(page, title, msg?)` | `toHaveTitle(title)` |
| `assertPageHasURL(page, url, msg?)` | `toHaveURL(url)` |

### API responses

| Method | Wraps |
|---|---|
| `assertResponseOK(response, msg?)` | `expect(response).toBeOK()` |

> For body-shape checks on the JSON inside that response, use [`Assertions.assertJsonContainsObject` / `assertObjectIsSubset`](./assertions.md).

### Visual regression

| Method | Wraps |
|---|---|
| `assertElementHasScreenshot(locator, name, options?)` | `toHaveScreenshot()` on the element |
| `assertPageHasScreenshot(page, name, options?)` | `toHaveScreenshot()` on the page |

### Downloads

| Method | Use for |
|---|---|
| `assertDownloadFilename(download, expected, msg?)` | `download.suggestedFilename() === expected` |
| `assertDownloadFilenameMatches(download, regex, msg?)` | filename matches a `RegExp` |

### Misc

| Method | Use for |
|---|---|
| `assertNumberGreaterThanOrEqual(actual, min, msg?)` | Inline numeric range check |
| `assertStringMatches(actual, regex, msg?)` | Inline regex check on a string |
| `assertTobeTruthy(actual, msg?)` | Loose truthy check |

---

## 3. Pattern — when an action and a check belong in different methods

Action methods stay action-only:

```typescript
@step('Submit registration form')
async submitRegistrationForm(): Promise<void> {
  await this.commonPage.click(this.btnSubmit);
}
```

The post-condition lives in a separate `verify…` / `expect…` method that uses `AssertHelper`:

```typescript
@step('Verify registration result page')
async verifyRegistrationResultPage(): Promise<void> {
  await this.assertHelper.assertPageHasURL(
    this.page,
    /route=account\/success/,
    'Registration success URL',
  );
  await this.assertHelper.assertElementVisible(
    this.lblSuccessMessage,
    'Registration success banner',
  );
}
```

Specs then read like a story: `register → submit → verify`.

---

## 4. Soft vs hard assertions

Most `AssertHelper` methods use Playwright's web-first `expect.soft(...)` semantics — failures are recorded but don't abort the test. This matches the philosophy in [`assertions.md`](./assertions.md).

For genuinely fatal preconditions (e.g. you can't proceed without an authenticated session), throw an explicit `Error` after the assertion or add a hard `expect(locator).toBeVisible()` directly inside the `verify…` method. Don't sprinkle `expect(...)` into action methods.

---

## 5. Web-first auto-retry — do NOT defeat it

`AssertHelper`'s element checks all rely on Playwright's auto-retry timeout. Two consequences:

- **Never** add `await commonPage.waitForVisible(locator)` before `assertElementVisible(locator)` — it duplicates the wait and causes flakiness when timings drift.
- **Never** add `await Utility.delay(2)` before an assertion to "give the UI time to settle" — increase the assertion timeout instead, and only as a last resort.

The expect timeout is set globally in `playwright.config.ts → expect.timeout`. If a single assertion really needs more time, pass `timeout` via the underlying `expect`:

```typescript
await this.assertHelper.assertElementVisible(this.spinner, 'Spinner gone');
// not: await Utility.delay(5);
```

---

## 6. Connecting AssertHelper to the rest of the framework

```
locators/        →  define WHERE elements live
pages/           →  call AssertHelper inside `verify…` / `expect…` methods
tests/           →  rely on page methods; reach for `assertHelper` fixture only for cross-page checks
utilities/assert-helper.ts → THE library — never duplicate its logic
utilities/assertions.ts    → for VALUE assertions, never element ones
```

---

## 7. Anti-patterns (Do Not)

- **No raw `expect(locator)…`** in pages or specs — go through `AssertHelper`.
- **No `Assertions.assertEqual(actualText, expectedText)`** for DOM text — use `assertElementHasText` / `assertElementContainsText` (auto-retry).
- **No assertions inside an action method** — split into action + `verify…`.
- **No `await commonPage.waitForVisible(...)` immediately before `assertElementVisible(...)`** — redundant.
- **No `setTimeout` / `Utility.delay` before an assertion** — extend the expect timeout, or fix the underlying race.
- **No screenshots as a substitute** for a real assertion when the element has a stable text/value/role.

---

## 8. Quick reference — Picking the right method

```
Element should be on the page?           → assertElementVisible / assertElementAttached
Element should NOT be on the page?       → assertElementNotVisible / assertElementHidden
Element should have specific text?       → assertElementHasText (exact) / assertElementContainsText (substring)
Input should have specific value?        → assertElementHasValue
Multi-select should have multiple values? → assertElementHasValues
Element should be enabled / disabled?    → assertElementEnabled / assertElementDisabled
Checkbox state?                          → assertCheckboxChecked / assertCheckboxUnchecked
Page is on the right URL?                → assertPageHasURL
Page title?                              → assertPageHasTitle
API call returned 2xx?                   → assertResponseOK (use Assertions for body shape)
Pixel snapshot needed?                   → assertElementHasScreenshot / assertPageHasScreenshot
Download fired with expected name?       → assertDownloadFilename / assertDownloadFilenameMatches
```
