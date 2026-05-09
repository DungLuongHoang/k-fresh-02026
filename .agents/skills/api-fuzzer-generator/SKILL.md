---
name: api-fuzzer-generator
description: Generates exhaustive, constraint-based Playwright API fuzzing tests with internal HTTP evaluation logic. Use when testing an endpoint for validation gaps or boundary logic errors.
---

# API Fuzzer Generator

This skill transforms typical JSON payloads or API endpoints into exhaustive, data-driven fuzzing tests utilizing the local project's fuzzing package. It specifically relies on the `generateFuzzingPayload` generator and `ObjectConstraint` subclassing.

## When to use this skill
- Fuzz testing a new or existing API endpoint.
- Writing regression boundary tests using Playwright.
- Generating combinatorial constraints for complex request payloads.

## How to use it

To generate an effective API Fuzzer, follow this Progressive Disclosure workflow:

### Discovery Phase: Context & Memory Retrieval
1. Examine the user's provided JSON payload, endpoint, or OpenAPI spec.
2. Search the local Knowledge Base (`@knowledge-base`) for pre-existing domain constraints for this endpoint.

### Activation Phase: Draft Generation
Output the initial code immediately to give the user a baseline. The baseline MUST include two major pieces:
1. **The Fuzzing Schema**: Subclass `ObjectConstraint` using field definitions. Do NOT silently invent bounds. If you guess, you MUST comment it using `// GUESS:`. 
2. **The Playwright Test Suite**: A `.spec.ts` wrapper that executes the tests.

The generated Playwright script MUST loop through the cases and include the Intelligent Evaluator Contract logic to evaluate the status code against the expected outcome:

```typescript
import { test, expect } from '@playwright/test';
import { generateFuzzingPayload } from '../../utilities/fuzzing';

// ... (Your ObjectConstraint Definition)

test.describe('API Fuzzing', () => {
    test('Execute Fuzzing Cases safely', async ({ request }) => {
        const schema = new YourObjectConstraint({ ...basePayload });
        
        for await (const testCase of generateFuzzingPayload(schema)) {
            const response = await request.post('/api/endpoint', { 
                data: testCase.payload 
            });

            // 1. Handle Rate Limiting
            if (response.status() === 429) {
                console.warn('Rate Limited! Handle backoff or skip logic here.');
                continue;
            }

            // 2. Intelligent HTTP Assertions
            if (testCase.expected === 'success') {
                expect(response.ok(), `Case "${testCase.caseName}" failed: Expected 2xx but got ${response.status()}`).toBeTruthy();
            } else if (testCase.expected === 'failure') {
                expect(response.status(), `Case passed unexpectedly.`).toBeGreaterThanOrEqual(400);
                expect(response.status(), `Server crashed!`).toBeLessThan(500);
                
                // Assert the server failed for the RIGHT reason (the mutated field)
                const mutatedKey = testCase.mutation.path[testCase.mutation.path.length - 1];
                const responseBody = await response.text();
                expect(responseBody).toContain(mutatedKey as string);
            }
        }
    });
});
```

### Execution Phase: Clarification & Refinement
After providing the draft:
1. **Probe**: Explicitly ask the user to clarify any relationships or bounds you are missing. *Use the @ask-questions-if-underspecified logic to probe.*
2. **Dependency Check**: API endpoints often depend on prior responses (e.g., an `UpdateProduct` payload needs a real `product_id` from a `CreateProduct` response). Always ask the user if any fields in the target payload depend on upstream dependencies, and ask for related CURL/request/response examples to capture this context.
3. **Commit to Knowledge Base**: If the user provides you with new constraints or relationship rules, you MUST write this back to the Knowledge Base immediately.

## Best Practices
- **Never guess silently**: Always comment assumptions with `// GUESS:`.
- **Beware of Deletion Overlap**: Be incredibly cautious with fuzzing `POST`, `PUT`, `DELETE` requests in production/pre-prod environments. Default to using test fixtures or transaction wrappers.
