# Assertions — `utilities/assertions.ts`

The `Assertions` class is the **value-and-data assertion toolkit** — primitives, arrays, objects, JSON shapes, schemas, and string patterns. It's a static class wrapping Playwright's `expect.soft` so a single failed check does not abort the test, allowing reporters to surface every problem in one run.

> Use `Assertions` for **values**. Use [`AssertHelper`](./assert-helper.md) for **DOM elements / locators / pages / API responses**. Don't mix them.

**Goals**

- Keep tests free of raw `expect(...)` boilerplate.
- Produce uniform, named assertion-failure messages in the Playwright report and Allure trace (`@step` decorators).
- Make complex shape checks (subset, schema, list-contains-sublist) one-liners instead of hand-rolled loops.

---

## 1. Import & call shape

```typescript
import { Assertions } from '@utilities/assertions';

Assertions.assertEqual(actualTotal, 199.99, 'Cart total after discount');
Assertions.assertContains(['ok', 'pending'], orderStatus);
Assertions.assertObjectIsSubset(actualUser, { email: 'qa@x.test' });
```

Rules:

- All methods are **static** — never `new Assertions()`.
- The optional last `message` argument shows up verbatim in the report; always pass a domain-meaningful string ("Cart total after discount", not "value should equal").
- Methods are **soft** by default (Playwright `expect.soft`) — a failure marks the test as failed but execution continues to the next assertion.

---

## 2. Method catalogue

### Primitives & equality

| Method | Use for |
|---|---|
| `assertEqual(actual, expected, msg?)` | Strict `===` between primitives or references |
| `assertDeepEqual(actual, expected, msg?)` | Recursive value-equality (objects/arrays) |
| `assertNotEqual(actual, expected, msg?)` | Negation of `assertEqual` |
| `assertType(value, type, msg?)` | `typeof value === type` (`'string'`, `'number'`, …) |
| `assertTrue(condition, msg?)` / `assertFalse(condition, msg?)` | Boolean conditions |
| `assertNotNull(value, msg?)` | Value is neither `null` nor `undefined` |
| `assertAlmostEqual(actual, expected, delta, msg?)` | Floating-point comparison within tolerance |

### Numeric range

| Method | Use for |
|---|---|
| `assertGreaterThan(actual, threshold, msg?)` | `actual > threshold` |
| `assertGreaterThanOrEqual(actual, threshold, msg?)` | `actual >= threshold` |
| `assertLessThan(actual, threshold, msg?)` | `actual < threshold` |
| `assertLessThanOrEqual(actual, threshold, msg?)` | `actual <= threshold` |

### Strings

| Method | Use for |
|---|---|
| `assertStringContains(haystack, needle, msg?)` | Substring match |
| `assertStringStartsWith(actual, prefix, msg?)` | Prefix match |
| `assertStringEndsWith(actual, suffix, msg?)` | Suffix match |
| `assertStringMatchesRegex(actual, regex, msg?)` | Regex match |
| `assertStringNotContains(haystack, needle, msg?)` | Negation of contains |
| `assertValidDateTimeFormat(value, msg?)` | `MM/DD/YYYY HH:MM:SS` shape |
| `assertValidEmailFormat(value, msg?)` | RFC-ish email shape |

### Arrays & collections

| Method | Use for |
|---|---|
| `assertArrayEqual(actual, expected, msg?)` | Order-sensitive array equality |
| `assertNotEmpty(collection, msg?)` | `length > 0` for arrays/strings |
| `assertContains(haystack, needle, msg?)` | Single-item membership |
| `assertArrayNotContains(haystack, needle, msg?)` | Negation |
| `assertArrayContainsAll(haystack, items, msg?)` | Every `item` is present |
| `assertArrayNotContainsAny(haystack, items, msg?)` | None of `items` are present |
| `assertListContainsSubList(haystack, sub, msg?)` | Sublist appears as a contiguous slice |
| `assert2DArrayContains(matrix, row, msg?)` | Row exists somewhere in `string[][]` |

### Objects, JSON, schemas

| Method | Use for |
|---|---|
| `assertObjectEqual(actual, expected, msg?)` | Structural object equality |
| `assertObjectIsSubset(actual, partial, msg?)` | Every `partial` key/value appears in `actual` |
| `assertJsonContainsObject(actual, expected, msg?)` | API response body contains the given shape |
| `assertValidKeyInResponse(response, keyPath, msg?)` | Key path exists in API JSON |
| `assertSchemaByType(actual, schema, msg?)` | `{ name: 'string', age: 'number' }`-style shape check |
| `assertObjectIncludes(actual, expected, msg?)` | Same as `Object.is`-aware subset assertion |

> All "JSON / schema" methods accept plain TS objects — there is no `ajv` dependency.

---

## 3. When to reach for which class

```
Comparing two primitives (number, string, boolean)?      → Assertions.assertEqual
Comparing two arrays/objects by value?                   → Assertions.assertDeepEqual / assertObjectEqual
Checking a partial / subset shape?                       → Assertions.assertObjectIsSubset
Checking that a string matches a regex?                  → Assertions.assertStringMatchesRegex
Checking that an element is visible / has text / has a value? → AssertHelper.assertElementVisible / …  (NOT this class)
Checking page URL / title?                               → AssertHelper.assertPageHasURL / assertPageHasTitle
Checking API response status / body?                     → AssertHelper.assertResponseOK + Assertions.assertJsonContainsObject
```

---

## 4. Soft vs hard

`Assertions` uses `expect.soft` so reports collect **all** failures in one run. Two consequences:

1. The test does **not** stop at the first failure — code after a failed assertion still runs.
2. To convert a soft check into a fatal one, use `expect(...).toBe(...)` directly inside a `verify…` page method — but prefer redesigning the test instead. Premature aborts hide downstream regressions.

If you genuinely need a hard stop (e.g. `userId` must exist before later assertions can use it), throw an explicit `Error` after the assertion:

```typescript
Assertions.assertNotNull(userId, 'userId must exist before checkout');
if (userId === null || userId === undefined) {
  throw new Error('Aborting: missing userId');
}
```

---

## 5. Connecting `Assertions` to the rest of the framework

```
data/                  →  fixtures and generators (typed against models/)
pages/                 →  call Assertions inside `verify…` / `expect…` methods
tests/                 →  call Assertions for plain value checks (rare); usually delegate to page.expect…
utilities/assertions.ts → THE library — never duplicate its logic in a page or spec
```

Place value assertions inside `verify…` methods on the page object:

```typescript
@step('Verify cart total matches expected')
async verifyCartTotal(expected: number): Promise<void> {
  const actual = Number(await this.commonPage.textContent(this.cartTotal));
  Assertions.assertAlmostEqual(actual, expected, 0.01, 'Cart total');
}
```

The spec then reads as:

```typescript
await cartPage.verifyCartTotal(199.99);
```

---

## 6. Anti-patterns (Do Not)

- **No raw `expect(...)`** in specs or page objects — go through `Assertions` (or `AssertHelper` for DOM).
- **No `expect(true).toBe(true)`** as a placeholder — write a real assertion or remove the test.
- **No try/catch around an assertion** to "ignore" failures — that defeats the soft-assert design.
- **No `assertEqual` on Locators** — use `AssertHelper.assertElementHasText / Value / …` instead.
- **No assertion logic inside an action method** (`login`, `addToCart`) — assertions belong in `verify…` / `expect…`.
- **No string-format / regex assertions on numbers** — convert and use `assertEqual` / `assertAlmostEqual`.

---

## 7. Quick reference — Picking the right method

```
Need to know two values are equal?              → assertEqual / assertDeepEqual
Need to know an object contains certain keys?    → assertObjectIsSubset / assertSchemaByType
Need to know an array contains items?            → assertContains / assertArrayContainsAll
Need to know an array does NOT contain items?    → assertArrayNotContains / assertArrayNotContainsAny
Need to compare floats?                          → assertAlmostEqual(actual, expected, delta)
Need to validate API JSON body shape?            → assertJsonContainsObject / assertValidKeyInResponse
Need to validate a date / email format?          → assertValidDateTimeFormat / assertValidEmailFormat
```
