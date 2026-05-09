# Fuzzing Framework Documentation

The `@my-project/fuzzing` package provides a powerful, type-safe robust framework for mutating API payloads and catching regressions, schema errors, and edge-cases. 

It exposes two distinct fuzzing strategies: **Targeted Type Confusion** and **Schema-Based Chaos Logic**.

---

## Which one should I use?

Here is the simple rule of thumb on which one to pick:

### The "Sniper": `generatePayloadStream`
**Use this when you want to target ONE specific field.**
Imagine you have a huge payload, but you specifically want to test the validation of the `user.email` field. You want the rest of the payload to stay perfectly valid so the API doesn't fail for other reasons.

### The "Shotgun": `generateFuzzingPayload`
**Use this when you want to automatically fuzz EVERYTHING in the payload, or when you need Cross-Field Relationships.**
You give it a payload, and the algorithm automatically crawls through every single property it finds, trying hundreds of dictionary attacks (like XSS strings, gigantic numbers, weird unicode) on every field, one by one.

### Summary of Differences

| Feature | `generatePayloadStream` | `generateFuzzingPayload` |
| :--- | :--- | :--- |
| **Target Area** | A specific JSON path (e.g. `user.age`) | The ENTIRE nested object |
| **Mutations Used** | Simple type swaps (String -> Number, Array) | Deep attacks (SQLi, XSS, Max Integers) |
| **Supports Constraints?** | ❌ No | ✅ Yes (can use `ObjectConstraint` class) |
| **Best used for...** | Precise schema testing on single fields | Throwing everything at the wall to see if it crashes |

---

## 1. Targeted Type Confusion (`generatePayloadStream`)

### When to use
Use this strategy when you want to specifically target **a single field** at a specific JSON path and mutate its type iteratively while keeping the rest of the payload pristine.

### Usage
```typescript
import { generatePayloadStream } from '@my-project/fuzzing';

const payload = { user: { name: "John", age: 30 } };

for await (const mutation of generatePayloadStream(payload, "user.name")) {
   console.log(mutation.payload);    // Output: { user: { name: -1, age: 30 } } (first mutation)
   console.log(mutation.meta.key);   // Output: 'asNumberNegativeInt'
}
```

This async generator yields payloads safely cloned with different boundary types in a highly deterministic order. It uses minimal memory footprint.

## 2. Schema-Based Chaos Logic (`generateFuzzingPayload`)

### When to use
Use this when you want an **exhaustive combinatorial fuzzing** over an entire request body. This recursive walker crawls your whole object tree and yields broken variants based on smart `FUZZ_DICTIONARY` defaults like XSS payload strings and numeric bounds.

### Cross-Field Relationships
The absolute strongest feature of `generateFuzzingPayload` is the constraint system. Instead of blinding throwing bad dictionaries at properties, you can explicitly map dependencies between fields (e.g., throwing a failure automatically if `age < 18` and `car_license` exists).

#### Extending Object Constraints

You can create complex schema logic by subclassing `ObjectConstraint`. You then override the `generateFuzzCases` method to inject relational fuzzing cases:

```typescript
import { ObjectConstraint, generateFuzzingPayload, type FuzzCase_t } from '@my-project/fuzzing';

// 1. Create a Schema definition representing relationships
class UserProfileConstraint extends ObjectConstraint<{age: number, car_license: string | null}> {
  
  async generateFuzzCases(): Promise<FuzzCase_t[]> {
    // Inherit the structural logic checks (Null/Undefined behaviors)
    const cases = await super.generateFuzzCases();

    // Add unique logic tying fields together!
    cases.push({
      name: 'Invalid Relationship: Under 18 cannot have a license',
      value: { age: 17, car_license: 'XYZ-1234' }, 
      expected: 'failure' 
    });

    cases.push({
      name: 'Valid Relationship: Under 18 with null license',
      value: { age: 17, car_license: null }, 
      expected: 'success' 
    });

    return cases;
  }
}

// 2. Consume it using the generator
const schema = new UserProfileConstraint({
   age: 25, 
   car_license: "DEFAULT" 
});

for await (const testCase of generateFuzzingPayload(schema)) {
   console.log(testCase.caseName); // "[root] Invalid Relationship..."
   // Call your API using `testCase.payload` and assert `testCase.expected`
}
```

#### Enum and Boundary Logic (Min / Max)

You do not need to manually write tests for boundaries if you use the built-in constraints.

```typescript
import { StringConstraint } from '@my-project/fuzzing';

// 1. Enum Testing
// The fuzzer will test valid enums, AND explicitly extract a value, corrupt it (e.g. "ACTIVE_INVALID"), and test it.
const statusField = new StringConstraint('ACTIVE', { 
    oneOf: ['ACTIVE', 'INACTIVE', 'PENDING'] 
});

// 2. Boundary Testing
// The fuzzer automatically generates strings of length 4 (failure), 5 (success), 10 (success), and 11 (failure).
const usernameField = new StringConstraint('John', { 
    min: 5, 
    max: 10 
});
```

#### Dynamic / Network Constraints (HTTP Fetching)

Because the underlying engine is built entirely on `async/await` generators, you can easily pull data from your backend (like available time slots or dynamic IDs) to feed into your constraints.

**Approach: Fetch dynamically inside `generateFuzzCases`**
If the data you need depends on *other fields* in the constraint, you can make the API call mid-fuzzing:

```typescript
class ScheduleConstraint extends ObjectConstraint<{date: string, timeframe: string}> {
  
  async generateFuzzCases(): Promise<FuzzCase_t[]> {
    const cases = await super.generateFuzzCases();

    // Make your HTTP call mid-fuzzing dynamically
    const apiResult = await getAvailableTimeSlotsCallApi(`/api/slots?date=${this.defaultValue.date}`);
    const firstInvalidSlot = apiResult.invalid_slots[0];
    
    // Inject the result from HTTP directly into the mutation engine
    cases.push({
      name: 'Test sending an explicitly unavailable slot',
      value: { 
          date: this.defaultValue.date, 
          timeframe: firstInvalidSlot 
      },
      expected: 'failure'
    });

    return cases;
  }
}
```

## Resilience Features

- **Object Safe Cloning**: Objects are cleanly cloned safely. Failsafes exist for un-cloneable payload properties (functions/symbols) to prevent test crashes.
- **Deduplication**: Deep value uniqueness filters are built-in so overlapping primitive properties in fuzzing iterations do not spam the output.
- **Resumability**: You can restart broken tests via `generateFuzzingPayloadWithSkip(schema, 500)` to instantly jump back to loop 500 without testing the starting cases.
