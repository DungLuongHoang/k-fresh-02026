# Manual Test Cases

Source-of-truth folder for manual test cases that feed the `generate-testcase` skill.

> **Direction of travel:** _Manual TC (here)_ → _Automated `.spec.ts` (in `tests/`)_ → _Knowledge base entry (in `knowledge-base/`)_.

## Folder layout

```text
documents/manual-testcases/
├── README.md              # this file (index + conventions)
├── _template.md           # copy this when authoring a new manual TC
├── ui/
│   ├── cart/
│   │   ├── TC-CART-04.md  # one file per manual TC
│   │   └── …
│   ├── checkout/
│   ├── register/
│   └── …
└── api/
    └── cart/
        └── …
```

The folder shape mirrors `knowledge-base/{ui,api}/{feature}/` so the AI can resolve the right domain knowledge automatically.

## File-naming convention

```
TC-<MODULE>-<NN>.md             # TC-CART-04.md, TC-CHECKOUT-12.md
TC-<MODULE>-API-<NN>.md         # TC-CART-API-03.md (API tests)
```

- `<MODULE>` mirrors the spec file's domain (`CART`, `CHECKOUT`, `REGISTER`, `WISHLIST`, `PROFILE`, `ADDRESS`, `COMPARE`, `PRODUCT`, `HOME`).
- `<NN>` is zero-padded sequence within the module (`01`, `02`, …).
- Keep `TC-` prefix uppercase to match the IDs used in spec titles (`test('TC04 - …')`).

## Index — Status & Traceability

> All entries below are mirrored 1:1 with the active Playwright suites under `tests/` (46 cases · 11 suites). Status reflects automation state, not pass/fail. Re-run `npm test` for green-state.

### Register — `tests/ui/test-register.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-REGISTER-01](./ui/register/TC-REGISTER-01.md) | Register with valid data | High | `@smoke @regression` | ✅ Automated | `test-register.spec.ts:19` |
| [TC-REGISTER-02](./ui/register/TC-REGISTER-02.md) | Submit empty registration form | Medium | — | ✅ Automated | `test-register.spec.ts:36` |
| [TC-REGISTER-03](./ui/register/TC-REGISTER-03.md) | Invalid email format (cross-browser) | Medium | — | ✅ Automated | `test-register.spec.ts:43` |
| [TC-REGISTER-04](./ui/register/TC-REGISTER-04.md) | Password mismatch | Medium | — | ✅ Automated | `test-register.spec.ts:63` |
| [TC-REGISTER-05](./ui/register/TC-REGISTER-05.md) | Privacy policy not accepted | Medium | — | ✅ Automated | `test-register.spec.ts:73` |

### My Account / Profile — `tests/ui/test-profile.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-PROFILE-01](./ui/profile/TC-PROFILE-01.md) | My Account dashboard | Medium | — | ✅ Automated | `test-profile.spec.ts:24` |
| [TC-PROFILE-02](./ui/profile/TC-PROFILE-02.md) | Update account information | High | — | ✅ Automated | `test-profile.spec.ts:34` |
| [TC-PROFILE-03](./ui/profile/TC-PROFILE-03.md) | Add new address (from dashboard) | High | — | ✅ Automated | `test-profile.spec.ts:47` |
| [TC-PROFILE-04](./ui/profile/TC-PROFILE-04.md) | Logout | High | — | ✅ Automated | `test-profile.spec.ts:58` |
| [TC-PROFILE-05](./ui/profile/TC-PROFILE-05.md) | Change password — round trip | High | — | ✅ Automated | `test-profile.spec.ts:70` |

### Address Book — `tests/ui/test-address-book.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-ADDRESS-01](./ui/address-book/TC-ADDRESS-01.md) | Add new address (happy path) | High | — | ✅ Automated | `test-address-book.spec.ts:19` |
| [TC-ADDRESS-02](./ui/address-book/TC-ADDRESS-02.md) | Required-field validation | Medium | — | ✅ Automated | `test-address-book.spec.ts:26` |
| [TC-ADDRESS-03](./ui/address-book/TC-ADDRESS-03.md) | Edit existing address | High | — | ✅ Automated | `test-address-book.spec.ts:41` |
| [TC-ADDRESS-04](./ui/address-book/TC-ADDRESS-04.md) | Delete address (when 2+ exist) | Medium | — | ✅ Automated | `test-address-book.spec.ts:48` |
| [TC-ADDRESS-05](./ui/address-book/TC-ADDRESS-05.md) | Cannot delete only remaining address | Medium | — | ✅ Automated | `test-address-book.spec.ts:63` |

### Home — `tests/ui/test-home.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-HOME-01](./ui/home/TC-HOME-01.md) | Access wishlist via header icon | Low | — | ✅ Automated | `test-home.spec.ts:17` |
| [TC-HOME-02](./ui/home/TC-HOME-02.md) | Add to wishlist from homepage hover | Medium | — | ✅ Automated | `test-home.spec.ts:25` |

### Product — `tests/ui/test-product.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-PRODUCT-01](./ui/product/TC-PRODUCT-01.md) | Open product detail page | Medium | — | ✅ Automated | `test-product.spec.ts:10` |
| [TC-PRODUCT-02](./ui/product/TC-PRODUCT-02.md) | Add-to-compare toast | Medium | — | ✅ Automated | `test-product.spec.ts:16` |
| [TC-PRODUCT-03](./ui/product/TC-PRODUCT-03.md) | Size chart functionality | Low | — | ✅ Automated | `test-product.spec.ts:23` |
| [TC-PRODUCT-04](./ui/product/TC-PRODUCT-04.md) | Pop-up functionality | Low | — | ✅ Automated | `test-product.spec.ts:29` |
| [TC-PRODUCT-05](./ui/product/TC-PRODUCT-05.md) | Quantity counter (inc/dec/fill) | Medium | — | ✅ Automated | `test-product.spec.ts:35` |

### Compare Products — `tests/ui/test-compare-products.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-COMPARE-01](./ui/compare-products/TC-COMPARE-01.md) | Add 2 products and verify table | Medium | — | ✅ Automated | `test-compare-products.spec.ts:12` |
| [TC-COMPARE-02](./ui/compare-products/TC-COMPARE-02.md) | Verify table with 3 products | Medium | — | ✅ Automated | `test-compare-products.spec.ts:21` |
| [TC-COMPARE-03](./ui/compare-products/TC-COMPARE-03.md) | Remove one + replace with another | Medium | — | ✅ Automated | `test-compare-products.spec.ts:35` |
| [TC-COMPARE-04](./ui/compare-products/TC-COMPARE-04.md) | Remove all → empty state | Low | — | ✅ Automated | `test-compare-products.spec.ts:52` |
| [TC-COMPARE-05](./ui/compare-products/TC-COMPARE-05.md) | Duplicate handling | Medium | — | ✅ Automated | `test-compare-products.spec.ts:70` |

### Cart (UI) — `tests/ui/test-cart.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-CART-01](./ui/cart/TC-CART-01.md) | Verify empty cart state | Medium | `@regression` | ✅ Automated | `test-cart.spec.ts:23` |
| [TC-CART-02](./ui/cart/TC-CART-02.md) | Add product (search flow) | High | `@smoke @regression` | ✅ Automated | `test-cart.spec.ts:31` |
| [TC-CART-03](./ui/cart/TC-CART-03.md) | Remove product from cart | High | `@regression` | ✅ Automated | `test-cart.spec.ts:41` |
| [TC-CART-04](./ui/cart/TC-CART-04.md) | Update product quantity in cart | High | `@regression` | ✅ Automated | `test-cart.spec.ts:51` |
| [TC-CART-05](./ui/cart/TC-CART-05.md) | Update qty to 0 (remove via qty) | Medium | `@regression` | ✅ Automated | `test-cart.spec.ts:67` |
| [TC-CART-06](./ui/cart/TC-CART-06.md) | Add product (homepage browse) | Medium | `@regression` | ✅ Automated | `test-cart.spec.ts:79` |
| [TC-CART-07](./ui/cart/TC-CART-07.md) | Add multi-quantity from PDP | Medium | `@regression` | ✅ Automated | `test-cart.spec.ts:88` |
| [TC-CART-08](./ui/cart/TC-CART-08.md) | Add via homepage hover-toast | Medium | `@regression` | ✅ Automated | `test-cart.spec.ts:98` |

### Checkout — `tests/ui/test-checkout.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-CHECKOUT-01](./ui/checkout/TC-CHECKOUT-01.md) | Different shipping address | High | `@smoke @regression` | ✅ Automated | `test-checkout.spec.ts:49` |
| [TC-CHECKOUT-02](./ui/checkout/TC-CHECKOUT-02.md) | Toggle "same address" recovery | Medium | `@regression` | ✅ Automated | `test-checkout.spec.ts:58` |
| [TC-CHECKOUT-03](./ui/checkout/TC-CHECKOUT-03.md) | Mandatory T&C check | Medium | `@regression` | ✅ Automated | `test-checkout.spec.ts:69` |
| [TC-CHECKOUT-04](./ui/checkout/TC-CHECKOUT-04.md) | New-user happy path + comment | High | — | ✅ Automated | `test-checkout.spec.ts:78` |

### Wish List — `tests/ui/test-wish-list.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-WISHLIST-01](./ui/wishlist/TC-WISHLIST-01.md) | Add wishlist → cart | Medium | — | ✅ Automated | `test-wish-list.spec.ts:20` |
| [TC-WISHLIST-02](./ui/wishlist/TC-WISHLIST-02.md) | Remove from wishlist | Medium | — | ✅ Automated | `test-wish-list.spec.ts:25` |
| [TC-WISHLIST-03](./ui/wishlist/TC-WISHLIST-03.md) | Wishlist row → PDP | Low | — | ✅ Automated | `test-wish-list.spec.ts:30` |

### Cart API — `tests/api/test-cart.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-CART-API-01](./api/cart/TC-CART-API-01.md) | POST `checkout/cart/add` | High | — | ✅ Automated | `test-cart.spec.ts:11` |
| [TC-CART-API-02](./api/cart/TC-CART-API-02.md) | POST `checkout/cart/edit` | High | — | ✅ Automated | `test-cart.spec.ts:54` |
| [TC-CART-API-03](./api/cart/TC-CART-API-03.md) | POST `checkout/cart/remove` | High | — | ✅ Automated | `test-cart.spec.ts:99` |

### Cart UI + API Hybrid — `tests/api/test-cart-ui-api.spec.ts`

| TC ID | Title | Priority | Tags | Status | Spec |
| --- | --- | --- | --- | --- | --- |
| [TC-CART-HYBRID-01](./api/cart/TC-CART-HYBRID-01.md) | Add to cart — UI click + API assertion | High | — | ✅ Automated | `test-cart-ui-api.spec.ts:23` |

> **Maintenance:** when you add/remove/rename a test, update the matching row above and the affected entry's frontmatter. When you decide a TC won't be automated, mark it `🚫 Skipped` with the reason in Remarks.

### Status legend

| Symbol | Meaning |
| --- | --- |
| ⏳ Draft | Authored, not yet reviewed |
| 🟡 Ready | Reviewed, ready to automate |
| 🟢 In Progress | Currently being automated |
| ✅ Automated | Spec exists and passes CI |
| 🚫 Skipped | Will not be automated (note reason in Remarks) |
| ⚠️ Flaky | Automated but quarantined |

## Authoring workflow

1. **Copy `_template.md`** into the matching `ui/<feature>/` or `api/<feature>/` folder.
2. **Rename** it using the `TC-<MODULE>-<NN>.md` convention.
3. **Fill in every section** — vague TCs produce vague tests. Pay special attention to:
   - **Preconditions** (what must already be true; for this project, almost every UI TC starts with a freshly registered user from the `beforeEach` hook).
   - **Test Data** (refer to existing factories in `data/` rather than hard-coded values where possible).
   - **Expected Result** (must describe an *observable* state — UI text, URL, DOM presence, API status, …).
4. **Add a row to the index above** with status `⏳ Draft`.
5. **(Optional) Run `generate-manual-testcase` skill** to expand a single requirement into a batch of TCs first, then split each row into its own file here.

## Automation workflow (`generate-testcase`)

When you're ready to automate:

1. Flip the TC's status to `🟢 In Progress`.
2. Invoke the **`generate-testcase`** skill with:
   - The path to this manual TC file.
   - The matching `knowledge-base/{ui|api}/<feature>.md` for context.
3. The skill will add the spec under `tests/{ui,api}/test-<feature>.spec.ts` and update `knowledge-base/`.
4. Verify locally: `npm run check:all` then `npx playwright test -g "<TC ID>" --project=chromium`.
5. Flip the status to `✅ Automated` and fill in the `Spec` and `Knowledge base` columns.

## Related skills

| Skill | Purpose |
| --- | --- |
| [`generate-manual-testcase`](../../.agents/skills/generate-manual-testcase/SKILL.md) | Requirement → batch of manual TCs (Excel-ready). Use *before* this folder. |
| [`generate-testcase`](../../.agents/skills/generate-testcase/SKILL.md) | Manual TC (this folder) → automated Playwright spec. Primary consumer. |
| [`playwright-test-generator`](../../.agents/skills/playwright-test-generator/SKILL.md) | Live-site exploration when no manual TC exists yet. |
| [`playwright-test-healer`](../../.agents/skills/playwright-test-healer/SKILL.md) | Repair a broken automated spec — does not consume manual TCs. |
