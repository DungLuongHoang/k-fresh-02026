# Interfaces — `models/`

The `models/` folder is the **single source of truth for data shapes** used across `data/`, `pages/`, and `tests/`. Every input/output object passed to a page object, fixture, or assertion must be typed by an interface defined here.

**Goals**

- Catch contract drift at compile time, not in a flaky test.
- Make refactoring safe (rename a field once → everywhere updates).
- Keep test data, page objects, and assertions aligned through one shared shape.

---

## Folder Layout

```
models/
├── address.ts      Address shape (+ DefaultAddressOption union)
├── customer.ts     Minimal customer record
├── index.ts        Cross-cutting types (e.g. ENV)
├── order.ts        Composes Customer + Address + Product[]
├── product.ts      Product details
├── search.ts       Search input
├── user.ts         User (login) and UserProfile (registration)
└── action-type.ts  Action enums shared by pages
```

Import with the path alias `@models/...`:

```typescript
import { User, UserProfile } from '@models/user';
import { Order } from '@models/order';
```

---

## 1. Basic Interface

```typescript
// models/user.ts
export interface User {
  username: string;
  password: string;
}
```

Rules:
- One concept per interface, named in **PascalCase**.
- Field names in **camelCase**.
- Always `export` — never declare unexported "private" interfaces.

---

## 2. Optional and Readonly Properties

```typescript
// models/user.ts
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword?: string;   // optional
}
```

```typescript
export interface AuditedRecord {
  readonly id: number;        // cannot be reassigned after creation
  readonly createdAt: Date;
}
```

Use `?` for genuinely optional fields. Do **not** mark a field optional just to silence an error — fix the data instead.

---

## 3. Union Types and String Literals

When a field has a closed set of valid values, define a union and reuse it:

```typescript
// models/address.ts
export type DefaultAddressOption = 'yes' | 'no';

export interface Address {
  firstName: string;
  lastName: string;
  city: string;
  postCode: string;
  country: string;
  defaultAddress: DefaultAddressOption;
}
```

```typescript
// models/index.ts
export type ENV = 'qa' | 'prod' | 'staging' | 'dev';
```

Prefer string-literal unions over `string` for fixed sets — they enable autocomplete and exhaustiveness checks.

---

## 4. Extending Interfaces

Use `extends` when one shape is a superset of another:

```typescript
export interface User {
  username: string;
  password: string;
}

export interface UserWithEmail extends User {
  email: string;
}
```

Use **interface extension** for nominal "is-a" relationships. Use **composition** (next section) for "has-a".

---

## 5. Composition (Nested Interfaces)

`Order` does not "extend" `Customer`; it **contains** one:

```typescript
// models/order.ts
import { Address } from '@models/address';
import { Customer } from '@models/customer';
import { Product } from '@models/product';

export interface Order {
  id: number;
  product: Product[];
  customer: Customer;
  status: string;
  address: Address;
  purchaseDate: Date;
  totalAmount: number;
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
}
```

Composition is the default for domain models. Reach for `extends` only when there is a true subtype relationship.

---

## 6. Utility Types (Pick, Omit, Partial, Required, Readonly)

Utility types let you derive new shapes **without duplicating fields**.

### `Pick<T, K>` — keep only some fields

Use for narrow, single-purpose payloads (e.g. login).

```typescript
import { UserProfile } from '@models/user';

export type LoginCredentials = Pick<UserProfile, 'email' | 'password'>;

const creds: LoginCredentials = {
  email: 'qa.user@example.test',
  password: 'P@ssw0rd!',
};
```

### `Omit<T, K>` — keep everything except some fields

Use when you need almost the full shape minus a few fields (e.g. data passed to a "create" form does not yet have an `id`).

```typescript
import { Order } from '@models/order';

export type NewOrder = Omit<Order, 'id' | 'purchaseDate' | 'status'>;
```

### `Partial<T>` — every field optional

Use for **patch / update** payloads:

```typescript
import { UserProfile } from '@models/user';

export type UserProfileUpdate = Partial<UserProfile>;

await accountPage.updateProfile({ telephone: '0123456789' });
```

Do **not** use `Partial` to relax types in test data — define the actual optional fields on the source interface.

### `Required<T>` — every field required

Use to flip optional fields back to required (rare, but useful for "fully-validated" branches):

```typescript
type CompleteAddress = Required<Address>; // state and zipCode become mandatory
```

### `Readonly<T>` — freeze the object

Use for shared fixtures that tests must not mutate:

```typescript
import { Product } from '@models/product';

export const FROZEN_PRODUCT: Readonly<Product> = {
  id: 'sku-001',
  name: 'iPod Nano',
  // ...
};
```

### Combining utility types

Utility types compose:

```typescript
type EditableProduct = Partial<Omit<Product, 'id'>>;
// every field optional, except `id` is removed entirely
```

---

## 7. When to Use `interface` vs `type`

| Use case | Pick |
|---|---|
| Shape of an object that may be extended later | `interface` |
| Shape of an object passed to a page object / data file | `interface` |
| Union of string literals (e.g. `'yes' \| 'no'`) | `type` |
| Result of a utility (`Pick`, `Omit`, `Partial`) | `type` |
| Function signature | `type` |
| Tuple | `type` |

Interfaces are open (declaration-merging works); type aliases are closed. Default to `interface` for object shapes; reach for `type` when you need a union, tuple, or utility-derived alias.

---

## 8. Connecting Interfaces to the Rest of the Framework

### In `data/` — typed test data

Every export in `data/` must be typed against a `models/` interface:

```typescript
// data/user-data.ts
import { User } from '@models/user';

export const validUser: User = {
  username: 'qa.user@example.test',
  password: 'P@ssw0rd!',
};
```

### In `pages/` — typed actions

Page object methods accept and return interfaces — never `any`, never inline anonymous objects:

```typescript
// pages/ui/login-page.ts
import { User } from '@models/user';

export class LoginPage extends LoginLocators {
  @step('Login with username and password')
  async login(user: User): Promise<void> {
    await this.commonPage.fill(this.inputUsername, user.username);
    await this.commonPage.fill(this.inputPassword, user.password);
    await this.commonPage.click(this.btnLogin);
  }
}
```

### In `tests/` — typed assertions

Pass typed data straight into actions. The compiler will catch typos before the test runs:

```typescript
import { test } from '@pages/base-page';
import { validUser } from '@data/user-data';

test('logs in', async ({ loginPage }) => {
  await loginPage.login(validUser);
});
```

---

## 9. Barrel Exports

`models/index.ts` is the place for **cross-cutting types** that don't belong to a single entity:

```typescript
// models/index.ts
export type ENV = 'qa' | 'prod' | 'staging' | 'dev';
```

Do **not** re-export every model from `index.ts` — keep imports specific so refactors stay targeted:

```typescript
// preferred
import { User } from '@models/user';

// avoid: forces editors to walk the whole models tree on rename
import { User } from '@models';
```

---

## 10. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Interface name | PascalCase noun | `UserProfile`, `Order`, `Address` |
| Type alias (union) | PascalCase, suffix that hints the role | `DefaultAddressOption`, `ENV` |
| Type alias (derived) | PascalCase, describes the slice | `LoginCredentials`, `NewOrder`, `UserProfileUpdate` |
| Field name | camelCase | `firstName`, `postCode`, `defaultAddress` |
| Boolean field | starts with `is` / `has` / `should` | `isActive`, `hasShippingAddress` |
| File name | kebab-case, singular | `user.ts`, `address.ts`, `action-type.ts` |

---

## 11. Anti-patterns (Do Not)

- **No `any`** — use `unknown` and narrow, or define the missing shape.
- **No anonymous inline objects** as page object parameters — define an interface.
- **No optional fields used as a workaround** — model the data correctly.
- **No duplication** between `User` and `UserProfile`-style siblings — derive with `Pick` / `Omit`.
- **No inheritance chains deeper than 2 levels** — prefer composition.
- **No interfaces declared inside a `data/` or `pages/` file** — they belong in `models/`.

---

## 12. Quick Reference — Choosing the Right Shape

```
Need to describe an object that exists in the app?            → interface in models/
Need a closed set of string values?                            → type union in models/
Need a "create payload" missing server-generated fields?      → Omit<T, '...'>
Need a "patch payload" with all-optional fields?              → Partial<T>
Need a "login-only" subset of a larger profile?               → Pick<T, '...'>
Need to lock a fixture from being mutated by tests?           → Readonly<T>
Need a shape combined from two domain entities?               → compose: { customer: Customer; ... }
```
