# Locators — `locators/`

The `locators/` folder is the **single source of truth for UI selectors**. Page objects, specs, and assertions never touch raw selectors directly — they go through a locator class.

**Goals**

- One place to fix a broken selector when the DOM changes.
- Page objects stay focused on behavior, not selectors.
- Consistent naming so a new contributor can predict what `lblErrorEmail` or `btnContinue` means before opening the file.

---

## Folder Layout

```
locators/
├── common-locators.ts        Base class: shared elements + helper methods (role/text/label/iframe)
├── login-locators.ts         per-page locator class extending CommonLocators
├── register-locators.ts
├── home-locators.ts
├── product-locators.ts
├── cart-locators.ts
├── checkout-locators.ts
├── address-book-locators.ts
├── compare-products-locators.ts
├── my-orders-locators.ts
├── profile-locators.ts
└── wish-list-locators.ts
```

Import with the path alias `@locators/...`:

```typescript
import { LoginLocators } from '@locators/login-locators';
import { CommonLocators } from '@locators/common-locators';
```

---

## 1. Class Structure

Every page locator class follows the same shape:

```typescript
import { Locator, Page } from '@playwright/test';
import { CommonLocators } from '@locators/common-locators';

export class LoginLocators extends CommonLocators {
  inputEmail!: Locator;
  inputPassword!: Locator;
  flashMessage!: Locator;

  constructor(page: Page) {
    super(page);
    this.locatorInitialization();
  }

  locatorInitialization(): void {
    super.locatorInitialization();
    this.inputEmail = this.page.locator('//input[@name="email"]');
    this.inputPassword = this.page.locator('//input[@name="password"]');
    this.btnSubmit = this.page.locator('//input[@type="submit"]');
    this.flashMessage = this.page.locator('//div[@id="flash"]');
  }
}
```

Mandatory pattern:

| Step | Why |
|---|---|
| `extends CommonLocators` | Inherit shared elements + role/text/label helper methods |
| Declare each `Locator` with `!:` | Definite-assignment assertion — initialized inside `locatorInitialization()` |
| `constructor(page: Page)` calls `super(page)` and then `this.locatorInitialization()` | Ensures parent locators initialize first |
| Override `locatorInitialization()` and call `super.locatorInitialization()` | Inherit and extend, never replace |

> Note: the override hook is **`locatorInitialization()`** (single word `Initialization`). Do not invent variants like `initializeLocators()`.

---

## 2. Locator Priority (Strict)

Use the **first** strategy that resolves uniquely:

1. `getByRole(role, { name })` — semantic, i18n-friendly via `TRANSLATIONS`
2. `getByLabel()` — for form fields with labels
3. `getByPlaceholder()` — when label is missing
4. `getByTestId()` — only when devs add stable `data-testid`
5. `getByText(exact)` — text wrapped in `TRANSLATIONS`, never hardcoded
6. `locator('[stable-attr="..."]')` — `id`, `name`, `data-*`
7. CSS combinators with structural anchors
8. XPath — last resort, must be commented

Forbidden:

- `nth-child` / `nth-of-type` on lists whose order changes
- Generated class names (`css-1abc23`, `_xy_z`)
- Hardcoded UI text (route through `TRANSLATIONS`)
- Inline locators in `pages/` or `tests/`

See `prompts/advanced/selector-healing.md` for the full triage workflow when a selector breaks.

---

## 3. Naming Conventions

Locator names use a **prefix that signals the element type** so consumers can predict behavior at the call site.

| Prefix | Element | Example |
|---|---|---|
| `btn` | button | `btnSave`, `btnSubmit`, `btnConfirmDelete` |
| `input` | text input | `inputEmail`, `inputPassword`, `inputFirstName` |
| `lbl` | label / read-only text | `lblErrorEmail`, `lblSuccessMessage` |
| `ddl` | dropdown / listbox | `ddlOption`, `ddlOptionItem` |
| `chk` | checkbox | `chkPrivacyPolicy`, `chkAgreeTerms` |
| `radio` | radio button | `radioNewsletterYes`, `radioNewsletterNo` |
| `lnk` / `link` | link / anchor | `linkText`, `lnkRegister` |
| `tab` | tab control | `tabAccount`, `tabOrders` |
| `tbl` | table | `tblOrders` |
| `row` | table row | `rowOrder` |
| `cell` | table cell | `cellOrderId` |
| `Iframe` | frame locator | `Iframe1`, `Iframe2` |

Rules:

- **camelCase** after the prefix.
- Names describe **what the user sees**, not the CSS structure (`btnSave`, not `btnGreenLeft`).
- Error labels follow the field they validate: `lblErrorEmail`, `lblErrorPassword`.
- Boolean-derived locators stay neutral: `chkPrivacyPolicy`, not `chkAgreedToPrivacy`.

---

## 4. Using `TRANSLATIONS` (Preferred for User-Facing Text)

When a locator depends on visible UI text, **never hardcode the string**:

```typescript
// preferred
import { TRANSLATIONS } from '@translations/translations';
import { Constants } from '@utilities/constants';

this.btnLogin = this.roleButtonName(
  TRANSLATIONS.labels[Constants.LANGUAGE].lblLogin,
);
```

```typescript
// avoid — locks the locator to one language and breaks on copy changes
this.btnLogin = this.page.getByRole('button', { name: 'Login' });
```

Adding a new translation key is part of locator work — see `documents/automation-framework/translations.md` (when written) or update `translations/translations.ts` directly.

---

## 5. Helper Methods on `CommonLocators`

`CommonLocators` exposes role/text/label helpers so subclasses do not repeat `getByRole/getByText/getByLabel` boilerplate.

| Helper | Returns | Use for |
|---|---|---|
| `roleButtonName(name, exact?)` | `Locator` | `<button>`, `role="button"` |
| `roleLinkName(name, exact?)` | `Locator` | `<a>`, `role="link"` |
| `roleTextboxName(name, exact?)` | `Locator` | text inputs by accessible name |
| `roleTextareaName(name)` | `Locator` | `<textarea name="...">` |
| `roleOptionName(name, exact?)` | `Locator` | `role="option"` (combobox items) |
| `roleRadioName(name, exact?)` | `Locator` | radio buttons |
| `roleTabName(tab, exact?)` | `Locator` | tab controls |
| `text(text, exact?)` | `Locator` | visible text node |
| `label(label, exact?)` | `Locator` | element by label |
| `title(text, exact?)` | `Locator` | element by `title` attribute |
| `altText(text, exact?)` | `Locator` | image by `alt` |
| `locatorByXpath(xpath)` | `Locator` | escape hatch for XPath |
| `locatorById(id)` | `Locator` | partial id match (`contains(@id,...)`) |
| `locatorByText(text)` | `Locator` | partial text match |

**Iframe variants** are provided for every helper that may resolve inside an iframe:

| Helper | Use for |
|---|---|
| `iframe(iframe)` | get a `FrameLocator` by selector |
| `roleLinkNameIframe(iframe, name, exact?)` | role + name within an iframe |
| `roleButtonNameIframe(iframe, name, exact?)` | role + name within an iframe |
| `labelIframe(iframe, label, exact?)` | label within an iframe |
| `textIframe(iframe, text, exact?)` | text within an iframe |
| `locatorIframe(iframe, element)` | raw selector within an iframe |
| `locatorIframeIframe(iframe1, iframe2, element)` | nested iframes |

Prefer the helpers over raw `this.page.getByRole(...)` so the call site reads the same regardless of where the element lives.

---

## 6. Parameterized Locators (Functions)

When a locator depends on runtime data (a row name, an option text), expose it as a **function property** instead of fixing it at init time:

```typescript
// in CommonLocators
ddlOptionItem!: (option: string) => Locator;
linkText!: (name: string) => Locator;

locatorInitialization(): void {
  this.linkText = (name: string): Locator =>
    this.page.locator(`xpath=//a[@id and text()="${name}"]`);

  this.ddlOptionItem = (optionName: string): Locator =>
    this.page.locator(`xpath=//ul/li[text()="${optionName}"]`);
}
```

```typescript
// at the call site
await commonPage.click(loginLocators.linkText('Forgot password?'));
await commonPage.click(homeLocators.ddlOptionItem('US Dollar'));
```

Rules:

- Declare the property with the function signature (`(option: string) => Locator`).
- Initialize it inside `locatorInitialization()`.
- Keep the parameter list **minimal and typed** — never `(...args: any[])`.
- For multi-criterion lookups (row by id + column), name the parameters: `cellInOrderRow(orderId: string, column: string)`.

---

## 7. Iframe Support

`CommonLocators` already exposes four common frames (`Iframe1`–`Iframe4`) by `name="RadWindow1..4"`. For ad-hoc frames:

```typescript
// inside a page locator class
btnConfirmInModal!: Locator;

locatorInitialization(): void {
  super.locatorInitialization();
  this.btnConfirmInModal = this.roleButtonNameIframe(this.iframe1, 'Confirm');
}
```

When elements are nested inside iframes inside iframes, use `locatorIframeIframe(outer, inner, element)` — never chain `frameLocator()` calls inline in a page object.

---

## 8. Connecting Locators to the Rest of the Framework

### In `pages/ui/` — page objects extend the locator class

```typescript
// pages/ui/login-page.ts
import { Page } from '@playwright/test';
import { LoginLocators } from '@locators/login-locators';
import { CommonPage } from '@common-page';
import { step } from '@utilities/logging';
import { User } from '@models/user';

export class LoginPage extends LoginLocators {
  commonPage: CommonPage;

  constructor(page: Page) {
    super(page);
    this.commonPage = new CommonPage(page);
  }

  @step('Login with username and password')
  async login(user: User): Promise<void> {
    await this.commonPage.fill(this.inputEmail, user.username);
    await this.commonPage.fill(this.inputPassword, user.password);
    await this.commonPage.click(this.btnSubmit);
  }
}
```

The page object **never** redefines a selector. If a locator is missing, add it to the locator class first, then use it.

### In `tests/` — locators stay invisible

Specs talk to page objects only. They reference locators just to assert visibility/text:

```typescript
await assertHelper.toBeVisible(loginPage.flashMessage);
```

---

## 9. Anti-patterns (Do Not)

- **No selectors inline in page objects or specs.** They belong in the locator class.
- **No hardcoded UI text** in role/text helpers — route through `TRANSLATIONS`.
- **No `nth-child` / `nth-of-type`** on dynamic lists — use stable anchors.
- **No `string` for parameters that have a closed set of values** — define a `models/` union (e.g. `DefaultAddressOption`).
- **No new helper added to `CommonLocators` for a single page** — keep `CommonLocators` minimal; put one-off locators in the page's own class.
- **No skipping `super.locatorInitialization()`** — common elements would silently disappear.
- **No XPath when `getByRole` works** — XPath is the last resort, must be justified by a comment.
- **No `(...args: any[])`** in parameterized locators — type every argument.

---

## 10. Quick Reference — Choosing the Right Strategy

```
Element has an accessible role + visible name?      → roleButtonName / roleLinkName / roleTextboxName
Form field has a <label>?                           → label(...) or roleTextboxName
Image without alt text?                             → title(...) or altText(...)
Custom widget with stable data-testid?              → page.getByTestId(...)
Element identified by visible text only?            → text(TRANSLATIONS...) — never raw string
Element by stable id/name attribute?                → page.locator('[id="..."]') / locatorById(...)
Inside an iframe?                                   → roleButtonNameIframe / locatorIframe / textIframe
Inside two iframes?                                 → locatorIframeIframe(outer, inner, element)
Depends on runtime data (row name, option text)?    → declare a parameterized locator function
Nothing else works?                                 → locatorByXpath('...') with a comment explaining why
```
