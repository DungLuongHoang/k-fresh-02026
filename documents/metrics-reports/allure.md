# Allure Report 3 — Setup & Guideline

> How this repo wires **Allure Report 3** (`allure-playwright`) into the existing Playwright suite to produce a rich, single-run interactive report with screenshots, videos, Playwright traces, nested step timelines, severity/priority labels, and the Awesome UI plugin.
>
> Allure Report is the **per-run, local deep-dive** layer in this repo's reporting stack. For multi-run trend analytics and cross-team dashboards, see [`report-portal.md`](./report-portal.md).
>
> **Versions verified (2026-05):**
>
> | Component | Version | Notes |
> |---|---|---|
> | `allure` (CLI + core) | `3.7.0` | Already in [`package.json`](../../package.json) |
> | `allure-playwright` (reporter) | `3.7.2` | Already in [`package.json`](../../package.json) |
> | `allure-js-commons` | `3.7.x` (transitive) | Pulled in by `allure-playwright`; provides the labelling API |
> | `@playwright/test` | `^1.59.1` | Already in [`package.json`](../../package.json) |
> | `@allurereport/plugin-awesome` | `3.7.0` | Bundled with `allure` 3.7.0 — enabled via `allure.config.ts` |

---

## When to reach for Allure Report

Use when:

- You need a **visual, interactive single-run report** with screenshots, videos, and trace attachments for each failed test — the fastest way to understand *what happened in this run*.
- You want to **navigate failures by severity, priority, or feature** (the labels set in [`pages/base-page.ts`](../../pages/base-page.ts) flow straight into the Allure sidebar).
- You're **debugging a flaky or failing test locally** and want a self-contained HTML artefact to share with the team without uploading to a server.
- You need an **Allure Awesome UI** — the enhanced layout introduced in Allure 3 — with a quality gate badge and timeline view.

Avoid when:

- You need **trends across multiple CI runs** — use [ReportPortal](./report-portal.md) for that.
- You want a **real-time live tail of a running suite** — use the `list` reporter that's already in the array.
- You want **machine-readable output** for the QA Metrics Dashboard — use the `junit` reporter (already present at `test-results/e2e-results.xml`).
- You're tempted to make Allure the **only** reporter — keep `list`, `html`, and `junit` in parallel (see §Anti-patterns).

---

## The picture

```
  Playwright workers
        │
        ├──► list          → stdout         (CI tail — always-on)
        ├──► html          → playwright-report/  (Playwright native HTML)
        ├──► allure-playwright → allure-results/ ← you are here
        ├──► junit         → test-results/e2e-results.xml  (dashboard feed)
        └──► custom-reporter   → Slack / email notifier

  allure-results/        ← raw JSON + attachments written per test
        │
        ▼
  npm run allure-generate  →  allure-report/index.html   (static site)
  npm run allure-serve     →  http://localhost:PORT       (auto-opens)
  npm run report           →  generate + serve (one command)
```

The `allure-results/` folder is the source of truth. Everything else (the HTML site) is generated from it on demand and is safe to delete.

---

## Step-by-step: from zero to first report

### Step 1 — Nothing to install

Both `allure` and `allure-playwright` are already in `package.json`. Run:

```bash
npm install
```

That's it. The Allure CLI is available as `npx allure`.

### Step 2 — Verify the reporter is wired in `playwright.config.ts`

Open [`playwright.config.ts`](../../playwright.config.ts). The reporter array (lines 27–42) already contains:

```typescript
['allure-playwright', {
  detail: true,            // include step-level detail (test.step blocks)
  outputFolder: 'allure-results',
  suiteTitle: true,        // use describe() block names as suite titles
}],
```

No changes needed. The reporter writes raw JSON results to `allure-results/` after every `npx playwright test` run.

### Step 3 — Run the tests and generate the report

```bash
# 1. Run tests (writes allure-results/)
npm test                      # Desktop Chrome, QA env

# 2a. Generate static HTML site + open in browser (two commands)
npm run allure-generate        # → allure-report/
npm run allure-serve           # → http://localhost:<PORT>

# 2b. Or do both in one command
npm run report
```

`allure-serve` is the fastest option for local debugging — it generates and serves in one step without writing files to `allure-report/`.

### Step 4 — Use the Awesome plugin (Allure 3 default)

Allure 3 ships with two built-in UI plugins:

| Plugin | Key | Description |
|---|---|---|
| **Classic** | `classic` | The familiar Allure 2 layout — tree view, behaviours, packages |
| **Awesome** | `awesome` | New in Allure 3 — card-based UI, quality gate badge, timeline chart |

`awesome` is enabled by default in Allure 3.7.0. To pin the plugin or configure quality gates, create `allure.config.ts` in the repo root:

```typescript
// allure.config.ts  (create at repo root if it doesn't exist yet)
import { defineConfig } from 'allure';

export default defineConfig({
  name: 'E-Commerce QA Suite',
  output: 'allure-report',
  historyPath: 'allure-history',   // persist history across runs for trend widgets
  plugins: {
    awesome: {
      enabled: true,
    },
  },
  // Quality gate: mark the report RED if more than 0 critical failures
  qualityGate: {
    qualityGateFile: false,        // set to true to write quality-gate.json for CI
  },
});
```

> **Note:** `allure.config.ts` is optional — without it Allure 3.7.0 uses sensible defaults (Awesome plugin on, `allure-report` output folder). Add it only when you need to customise quality gates, history paths, or name the suite.

---

## How tags, severity, and priority reach the report

The [`pages/base-page.ts`](../../pages/base-page.ts) `beforeEach` hook reads Playwright tags (e.g. `@P1`, `@critical`, `@cart`) and calls `allure-js-commons` to set labels:

```typescript
// pages/base-page.ts (lines 168–170) — already in the repo
import * as allure from 'allure-js-commons';

if (severity) await allure.severity(severity.slice(1));   // @critical → "critical"
if (priority) await allure.label('priority', priority.slice(1)); // @P1 → "P1"
if (feature)  await allure.feature(feature.slice(1));     // @cart → "cart"
```

The result in the Allure Awesome UI:

- **Severity** column: sorts Critical → Major → Minor → Trivial
- **Priority** custom label: filterable in the sidebar
- **Feature / Story** groupings: appear in the Behaviours tree

**No extra code is needed in individual spec files** — the bridge is fully automatic as long as tests carry the required tags (enforced by [`pages/base-page.ts`](../../pages/base-page.ts) and validated by the [test-tags-validator skill](../../.agents/skills/test-tags-validator/SKILL.md)).

---

## Enriching individual tests with the allure-js-commons API

Use these APIs inside `test()` bodies for richer reports. Import from the same package the repo already uses:

```typescript
import * as allure from 'allure-js-commons';
```

| API | What it does in the report | When to use |
|---|---|---|
| `allure.description(text)` | Adds a markdown description card to the test | Explain *why* the test exists, not what it does |
| `allure.link(url, name, type)` | Adds clickable links (issue, tms, custom) | Link to the Jira ticket or test-case in TestRail |
| `allure.issue('PROJ-123')` | Shorthand for a Jira/GitHub issue link | Every test that covers a known ticket |
| `allure.attachment(name, content, type)` | Attaches arbitrary content (JSON, HTML, CSV…) | Attach API response bodies or CSV fixtures |
| `allure.parameter(name, value)` | Adds a parameter badge (data-driven tests) | Show which data variant this run used |
| `allure.story('story name')` | Groups tests under a user story | Pairs with `allure.feature()` for Behaviour tree |

### Worked example — cart spec enrichment

This example is adapted from [`tests/ui/test-cart.spec.ts`](../../tests/ui/test-cart.spec.ts):

```typescript
import { test } from '../../pages/base-page';
import * as allure from 'allure-js-commons';

test('Add MacBook Pro to cart @P1 @critical @cart', async ({ cartPage, productPage }) => {
  // Link to the requirement — appears as a clickable badge in Allure
  await allure.issue('TC-02');
  await allure.description(
    'Verifies that adding a quantity-adjusted MacBook Pro from the product ' +
    'page results in the correct item appearing in the cart.'
  );
  // Parameter badge shows in data-driven runs
  await allure.parameter('Product', 'MacBook Pro');
  await allure.parameter('Quantity', '2');

  await test.step('Navigate to product page', async () => {
    await productPage.openProductPage('macbook');
  });

  await test.step('Set quantity and add to cart', async () => {
    await productPage.setQuantity(2);
    await productPage.clickAddToCart();
  });

  await test.step('Verify cart contents', async () => {
    await cartPage.verifyCartContents('MacBook Pro', 2);
  });
});
```

> **`test.step()` is the primary grouping primitive.** Allure 3 renders each `test.step()` as a collapsible timeline node with its own duration bar — no extra Allure API needed.

---

## Attachments: screenshots, videos, and traces

The `playwright.config.ts` already captures these on failure:

```typescript
screenshot: 'only-on-failure',
video:      'retain-on-failure',
trace:      'retain-on-failure',
```

`allure-playwright` picks them up automatically and attaches them to each failed test item in the report. You will see:

- **Screenshot** — pinned to the failed step
- **Video** — a replay card (MP4, seekable in browser)
- **Playwright Trace** — a `.zip` link; open it in the [Trace Viewer](https://playwright.dev/docs/trace-viewer) with `npx playwright show-trace <path>`

To **manually attach** content during a test (e.g. an API response body):

```typescript
await allure.attachment(
  'API response — cart POST',
  JSON.stringify(responseBody, null, 2),
  { contentType: 'application/json' },
);
```

---

## History and trend widgets

Allure 3 supports a **trend chart** across previous runs if you persist history between CI runs. The history is stored in `allure-history/` (or wherever `historyPath` points in `allure.config.ts`).

In a GitHub Actions pipeline, preserve history with a cache or artefact upload/download:

```yaml
# .github/workflows/playwright.yml
- name: Restore Allure history
  uses: actions/cache@v4
  with:
    path: allure-history
    key: allure-history-${{ github.ref_name }}
    restore-keys: allure-history-

- name: Run tests
  run: npm test

- name: Generate Allure report
  run: npm run allure-generate

- name: Upload Allure report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-report-${{ github.run_number }}
    path: allure-report/
    retention-days: 14

- name: Save Allure history
  if: always()
  uses: actions/cache/save@v4
  with:
    path: allure-history
    key: allure-history-${{ github.ref_name }}
```

> Without history, the Trend and Retry graphs in the Awesome UI are empty but harmless — the report still works.

---

## Comparing Allure with the other reporters in this repo

| Concern | `list` | `html` | `junit` | **`allure-playwright`** | ReportPortal |
|---|---|---|---|---|---|
| **Best for** | CI live tail | Quick Playwright native review | Dashboard feed (machine-readable) | **Rich single-run deep dive** | Multi-run trends, cross-team UI |
| **Audience** | Engineer reading CI log | Engineer post-run | The QA Dashboard | **Engineer / QA lead** | PMs, SREs, QA leads |
| **Screenshots / video / trace** | ❌ | ✅ (Playwright native) | ❌ | ✅ (richer — attached per step) | ✅ (per-test) |
| **Step timeline** | ❌ | ✅ | ❌ | ✅ native | ✅ via `includeTestSteps` |
| **Severity / priority labels** | ❌ | ❌ | ❌ | ✅ via `allure-js-commons` | ✅ via attributes |
| **Persisted across runs** | ❌ | ❌ (artefact per run) | ⚠️ via dashboard | ⚠️ with history cache | ✅ server-side |
| **Hosting required** | none | none | none | none (HTML artefact) | ⚠️ server or SaaS |
| **Run-time overhead** | 0 ms | ~50 ms | ~10 ms | ~100 ms | ~200 ms (async) |

**Rule of thumb:** always run `allure-playwright` alongside `list` and `junit`. Retire it only if ReportPortal has been the daily driver for 3+ consecutive months and nobody opens the Allure HTML any more.

---

## Anti-patterns this guideline rules out

- ❌ **Removing the `detail: true` option.** Without it, `test.step()` blocks are collapsed into a single flat entry — you lose the step timeline that makes Allure useful for debugging.
- ❌ **Deleting `allure-results/` before a report is generated.** If you clean up between runs, use `rm -rf allure-results && npx playwright test && npm run allure-generate` in strict sequence. Generating from a partial or stale `allure-results/` produces a corrupt report.
- ❌ **Committing `allure-results/` or `allure-report/` to git.** Both are in `.gitignore` already. These can be hundreds of MB per run.
- ❌ **Using `allure.step()` from `allure-js-commons` instead of `test.step()`.** In Allure 3 + Playwright, `test.step()` is the canonical grouping primitive — it integrates with Playwright's own trace, retry, and timeout machinery. `allure.step()` bypasses all of that.
- ❌ **Calling `allure.severity()` / `allure.label()` directly in spec files.** The repo's `base-page.ts` `beforeEach` hook sets these from Playwright tags automatically. Duplicating the calls produces conflicting labels in the report.
- ❌ **Replacing `junit` with `allure-playwright`.** The JUnit feed drives [`templates/qa-metrics-dashboard.html`](../../templates/qa-metrics-dashboard.html) (Panels #1–#4). Removing it silently breaks the dashboard.
- ❌ **Running `allure generate` without `--clean` when re-running locally.** Old attachments accumulate in `allure-results/`. Use `allure generate allure-results --clean -o allure-report` to start fresh.

---

## Upgrade path

| From | To | What changes |
|---|---|---|
| `allure-playwright` 2.x | 3.7.x | **Breaking.** The reporter config key and option names changed. Remove the old `allure-playwright@2` reporter block and add the 3.x block as documented in §Step 2. History format changed — old `allure-results/` history is not forward-compatible; start fresh. |
| `allure-playwright` 3.x → 3.7.x | drop-in | Additive. Adds `watch` command (real-time reporting) and quality-gate JSON output. |
| Classic UI → Awesome UI | automatic | Allure 3.7.0 enables Awesome by default. No action required. Disable with `plugins: { awesome: { enabled: false } }` in `allure.config.ts` if you prefer Classic. |

---

## Refresh due

**2026-11** — Allure 3 ships roughly every 2–3 months. Re-run the [`write-document` skill](../../.agents/skills/write-document/SKILL.md) with a latest-version sweep at that point.

---

## Related

- [`documents/metrics-reports/README.md`](./README.md) — the 64 QA metrics that Allure results visualise
- [`documents/metrics-reports/report-portal.md`](./report-portal.md) — the multi-run trend layer that sits alongside Allure
- [`playwright.config.ts`](../../playwright.config.ts) — the reporter array this doc references (lines 27–42)
- [`pages/base-page.ts`](../../pages/base-page.ts) — the tag→Allure label bridge (`allure.severity`, `allure.label`, `allure.feature`)
- [`prompts/core/test-tags.md`](../../prompts/core/test-tags.md) — tag taxonomy that drives the severity/priority/feature labels
- [`.agents/skills/test-tags-validator/SKILL.md`](../../.agents/skills/test-tags-validator/SKILL.md) — enforces the tags that feed Allure labels
- [`.agents/skills/failure-analyzer/SKILL.md`](../../.agents/skills/failure-analyzer/SKILL.md) — reads Allure / HTML reporter output to root-cause failures
- [`.agents/skills/trace-analysis/SKILL.md`](../../.agents/skills/trace-analysis/SKILL.md) — analyses the `.zip` trace attached to a failed Allure test item
- [`.agents/skills/write-document/SKILL.md`](../../.agents/skills/write-document/SKILL.md) — the skill that authored this doc
- Allure 3 docs: [allurereport.org](https://allurereport.org/)
- `allure-playwright` source: [allure-framework/allure-js](https://github.com/allure-framework/allure-js)
