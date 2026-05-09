# Automation Framework Reference

These docs are the **contract** for contributing to the test framework. Every new test, page object, locator, fixture, or helper must follow the conventions in the relevant file. Open the doc that matches the layer you're touching.

## Layer map

```
tests/      ─ which user journeys we verify          → tests.md
data/       ─ what we feed those journeys           → test-data.md
models/     ─ the shapes of that data               → interfaces.md
pages/      ─ how the user acts on the UI / API     → pages.md
locators/   ─ where elements live                   → locators.md
utilities/  ─ shared toolbox (constants, decorator,
              random data, JSON, currency, …)       → utilities.md

assertions ─ value / array / object / JSON checks   → assertions.md
DOM checks ─ Locator / Page / API response / files  → assert-helper.md

coverage   ─ what every feature must include        → coverage-requirements.md
```

## Index

| File | What it covers | When to read |
|---|---|---|
| [`coverage-requirements.md`](./coverage-requirements.md) | Per-feature checklist, tag taxonomy, layer matrix | Before opening a coverage PR |
| [`tests.md`](./tests.md) | Spec layout, hooks, tags, UI vs API, side-effect verification | Adding or modifying a `tests/**/*.spec.ts` |
| [`pages.md`](./pages.md) | Page-object pattern, `@step`, fixture registration, naming | Adding or modifying a `pages/**/*-page.ts` |
| [`locators.md`](./locators.md) | Locator priority, naming prefixes, `TRANSLATIONS`, iframes | Adding or modifying a `locators/*-locators.ts` |
| [`interfaces.md`](./interfaces.md) | Model design, utility types, composition vs extension | Adding or modifying a `models/*.ts` |
| [`test-data.md`](./test-data.md) | Static catalogues, generators, env-aware loaders, `Messages` | Adding or modifying a `data/*.ts` |
| [`utilities.md`](./utilities.md) | `Constants`, `Logger`, `@step`, `Utility`, `Generate`, `Currency`, JSON | Reaching for or extending the shared toolbox |
| [`assertions.md`](./assertions.md) | Value / object / array / JSON / schema checks (static `Assertions`) | Comparing values |
| [`assert-helper.md`](./assert-helper.md) | DOM / page / API-response / download checks (instance `AssertHelper`) | Asserting on a Locator, Page, APIResponse, or Download |

## Reading order for new contributors

1. **`coverage-requirements.md`** — what your PR must include.
2. **`tests.md`** — the language a spec is written in.
3. **`pages.md`** — the layer that owns business actions.
4. **`locators.md`** — the layer that owns selectors.
5. **`interfaces.md`** + **`test-data.md`** — the shapes and the fixtures.
6. **`utilities.md`** + **`assertions.md`** + **`assert-helper.md`** — the toolbox.

## How these docs evolve

- Every contract change (new convention, deprecation, naming rule) lands in one of these files first, then in the code.
- The "Anti-patterns" sections are authoritative — if a reviewer flags something, find it here. If it isn't here yet, add it.
- Each file ends with a "Quick reference" decision tree — when you're stuck, scan that section before reading top-to-bottom.

---

> Format reference: [`.agents/skills/write-agent-skill/SKILL.md`](../../.agents/skills/write-agent-skill/SKILL.md). The progressive-disclosure structure (folder layout → numbered sections → quick reference → anti-patterns) is intentional and should be preserved when you add a new doc to this folder.
