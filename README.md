# ai-qa-training — E-Commerce Playground Automation Testing

> AI-assisted QA automation training repo built on **Playwright + TypeScript** with a strict **Page Object Model (POM)** structure, Allure reporting, multi-channel run notifications, and a curated library of prompts/skills for AI-assisted test authoring.

**Website Under Test:** https://ecommerce-playground.lambdatest.io/

**Wiki:** https://github.com/khanhdodang/ai-qa-training/wiki

---

## Table of Contents

- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [npm Scripts](#npm-scripts)
- [Running Tests](#running-tests)
- [Tooling & Conventions](#tooling--conventions)
- [Git Hooks (Husky)](#git-hooks-husky)
- [Reporting](#reporting)
- [Run-Result Notifications](#run-result-notifications)
- [Knowledge Base](#knowledge-base)
- [AI Prompt Library](#ai-prompt-library)
- [Agent Skills](#agent-skills)
- [Coding Standards](#coding-standards)
- [Contributing](#contributing)
- [Notes](#notes)
- [License](#license)

---

## Technologies

- Playwright
- TypeScript (strict mode, `bundler` module resolution)
- Node.js (>= 18, LTS v24.x recommended, latest v25.x supported)
- Page Object Model (POM)
- ESLint (flat config) + Husky + lint-staged + Commitlint
- Allure Report 3

---

## Project Structure

| Folder/File | Description |
|---|---|
| `.agents/skills/` | Reusable agent skills (test gen, eval, etc.) |
| `.github/` | GitHub workflows and CI/CD configurations |
| `.husky/` | Git hooks (`pre-commit`, `pre-push`, `commit-msg`, `post-merge`) |
| `data/` | Test data files |
| `documents/` | Framework docs (POM, automation-framework/*, husky guidelines) |
| `knowledge-base/` | UI + API domain knowledge fed to AI prompts |
| `locators/` | Pure locator definitions (no behavior) |
| `models/` | Data models and interfaces |
| `pages/` | Page Object Model (POM) classes (`api/`, `ui/`) |
| `profiles/` | Per-environment `.env` configurations |
| `prompts/` | AI prompt library (core / advanced / devops / reporting) |
| `reports/` | Custom Playwright reporter (Slack / Google Chat / Email) |
| `tests/` | UI + API test cases (`tests/ui/`, `tests/api/`) |
| `utilities/` | Helper functions and reusable utilities |
| `wiki/` | Source-controlled wiki pages (mirror of GitHub Wiki) |
| `allurerc.mjs` | Allure 3 configuration |
| `eslint.config.mjs` | ESLint flat configuration |
| `playwright.config.ts` | Playwright projects + reporters |
| `tsconfig.json` | TypeScript strict configuration |

---

## Prerequisites

Before running this project, make sure the following are installed:

- Node.js (>= 18, LTS v24.x recommended, latest v25.x supported)
- npm

Check installed versions:

```bash
node -v
npm -v
```

---

## Installation

```bash
# 1. Clone
git clone https://github.com/khanhdodang/ai-qa-training.git
cd ai-qa-training

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install
```

---

## npm Scripts

| Script | What it does |
|---|---|
| `npm test` | Run tests on Chromium (default). |
| `npm run test:all` | Run on Chromium + Firefox + WebKit. |
| `npm run test:chrome` | Run tests on Chromium. |
| `npm run test:firefox` | Run tests on Firefox. |
| `npm run test:webkit` | Run tests on WebKit. |
| `npm run test:ui` | Open Playwright UI Mode. |
| `npm run test:debug` | Run with the Playwright Inspector. |
| `npm run codegen` | Launch Playwright Codegen against the UAT site. |
| `npm run linter` | ESLint with `--fix`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run check:all` | Lint + typecheck (used by `pre-push`). |
| `npm run allure-report` | Generate static Allure HTML into `allure-report/`. |
| `npm run allure-serve` | Live Allure server. |
| `npm run show-report` | Open Playwright HTML report. |

---

## Running Tests

### Chromium (default)

```bash
npm test
# or
npm run test:chrome
```

### All browsers

```bash
npm run test:all
```

### Firefox / WebKit

```bash
npm run test:firefox
npm run test:webkit
```

### UI Mode

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

### Playwright Code Generator

Generate locators and test actions automatically:

```bash
npm run codegen
```

---

## Tooling & Conventions

- **TypeScript** in strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`.
- **Path aliases:** `@pages/*`, `@locators/*`, `@utilities/*`, `@models/*`, `@data/*`, `@tests/*`.
- **Module resolution:** `bundler` (TS 6+ compatible, no deprecation warnings).
- **Page Object Model:** locators live in `locators/`, behavior in `pages/`, assertions in `tests/`. Never put a selector in a test file.
- **Naming:** kebab-case files, PascalCase classes, camelCase methods.
- **Imports:** absolute path aliases for cross-folder imports, relative for siblings.

See [`documents/OOP_POM_Documentation.md`](./documents/OOP_POM_Documentation.md) and [`documents/automation-framework/`](./documents/automation-framework/) for the full framework spec.

---

## Git Hooks (Husky)

| Hook | Command | Purpose |
|---|---|---|
| `pre-commit` | `npx lint-staged` | ESLint `--fix` on staged `*.{js,ts}`. |
| `commit-msg` | `commitlint` | Enforce Conventional Commits. |
| `pre-push` | `npm run check:all` + `.only` guard | Lint + typecheck, blocks pushes containing `.only` in `tests/`. |
| `post-merge` | post-merge automations | Refresh deps when `package-lock.json` changes. |

> **Tip:** if `pre-push` blocks you with `Detected '.only' left in the tests code!`, remove the `test.only(...)` / `describe.only(...)` and re-push.

Full guide: [`documents/husky-guidelines.md`](./documents/husky-guidelines.md).

---

## Reporting

### Playwright HTML

After execution, open the HTML report:

```bash
npx playwright show-report
```

### Allure Report 3

The Allure CLI is a project devDependency, so no global install is needed. Configuration lives in [`allurerc.mjs`](./allurerc.mjs).

Generate a static HTML report into `./allure-report/`:

```bash
npm run allure-report
```

Or serve it on the fly with a live local server:

```bash
npm run allure-serve
```

---

## Run-Result Notifications

After every `playwright test` run, the custom reporter ([`reports/custom-reporter.ts`](./reports/custom-reporter.ts)) builds a one-page run summary (env, target, pass-rate, first failed tests, …) and **fans it out to every configured channel in parallel**. If no channel is configured, the reporter is a no-op.

> **Full guide:** [`reports/README.md`](./reports/README.md) — quick-start per channel, full env-var reference, troubleshooting, and how to add a new channel.

Channels are enabled by setting the matching env vars (typically in `profiles/.env.<env>.local`):

| Channel | Required env vars | Notes |
| --- | --- | --- |
| **Google Chat** | `GOOGLE_CHAT_WEBHOOK` (or legacy `LOCAL_CI_GOOGLE_CHAT_WEBHOOK`) | Plain text body. Set `PLAYWRIGHT_DISABLE_GOOGLE_CHAT_REPORTER=1` to mute just this channel. |
| **Slack** | `SLACK_WEBHOOK_URL` (or `SLACK_WEBHOOK`) | Sends a Slack [Block Kit](https://api.slack.com/block-kit) card with header + monospace body. |
| **Email** | `EMAIL_SMTP_HOST`, `EMAIL_FROM`, `EMAIL_TO` (comma-sep). Optional: `EMAIL_SMTP_PORT` (default `587`), `EMAIL_SMTP_SECURE` (`true` for SMTPS port 465), `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`, `EMAIL_CC`, `EMAIL_BCC`, `EMAIL_SUBJECT_PREFIX`. | SMTP via `nodemailer`. Sends multipart text + HTML. |

Optional global controls:

- `NOTIFY_CHANNELS=googlechat,slack,email` — explicit allow-list. If unset, all channels with config auto-enable; if set, **only the listed channels fire** even when others are configured.
- `PLAYWRIGHT_DISABLE_NOTIFICATIONS=1` — kills every channel for this run (CI emergency switch).

Output you'll see at the end of `npx playwright test`:

```text
Notification sent: googlechat
Notification sent: slack
Notification failed (email): connect ECONNREFUSED 127.0.0.1:587
```

A single channel failing does **not** affect the others — they're dispatched via `Promise.allSettled`.

---

## Knowledge Base

Domain documentation under [`knowledge-base/`](./knowledge-base/) is the source of truth feeding the AI prompts:

- **UI:** `home`, `register`, `product`, `cart`, `checkout`, `wish-list`, `address-book`, `compare-products`, `profile`
- **API:** `cart`, `cart-ui-api`

When generating new tests with AI, point the agent at the relevant knowledge-base file first so it picks up the right selectors, payloads, and acceptance criteria.

---

## AI Prompt Library

Curated prompts under [`prompts/`](./prompts/), organised by lifecycle stage:

| Category | Prompts |
| --- | --- |
| **Core** | `pom-generator`, `test-generator`, `test-data-generator`, `failure-analyzer` |
| **Advanced** | `risk-analysis`, `visual-ai`, `visual-regression-reviewer`, `selector-healing`, `performance-analyzer`, `release-readiness` |
| **DevOps** | `ci-optimizer`, `docker-runner`, `parallel-sharding` |
| **Reporting** | `executive-summary`, `quality-score`, `sprint-health-dashboard`, `trend-analysis`, `defect-insights`, `report-summarizer` |

Each prompt is self-contained Markdown — paste it into Cursor / Claude / ChatGPT and provide the requested inputs.

---

## Agent Skills

Reusable, progressive-disclosure skills under [`.agents/skills/`](./.agents/skills/) covering:

- E2E + API testing patterns (`e2e-testing`, `api-testing-mock`, `api-security-testing`, `api-fuzzer-generator`)
- Test generation (`generate-testcase`, `generate-manual-testcase`, `playwright-test-generator`)
- Test fixing & healing (`test-fixing`, `playwright-test-healer`)
- Evaluation (`llm-evaluation`, `agent-evaluation`, `advanced-evaluation`)
- Workflow (`git-pr-workflows-git-workflow`, `git-pushing`, `git-advanced-workflows`)
- Engineering quality (`typescript-expert`, `spec-to-code-compliance`, `data-quality-frameworks`)

Skills are loaded on demand by the agent — see each `SKILL.md` for trigger conditions and usage.

---

## Coding Standards

- Use TypeScript best practices
- Follow Page Object Model structure (locators → pages → tests)
- Keep locators separated from test logic
- Reuse common methods through utility/helper classes
- Maintain readable and scalable test scripts
- Use **Conventional Commits** (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, …) — enforced by `commit-msg`

---

## Contributing

1. Branch from `main` using a descriptive name (e.g. `feat/checkout-discount-codes`).
2. Follow the POM structure — no selectors in tests, no assertions in pages.
3. Run `npm run check:all` locally; the `pre-push` hook will run it again.
4. Use Conventional Commits; messages are linted by `commit-msg`.
5. Open a PR; CI runs the full Playwright matrix.

---

## Notes

- This project is intended for learning and automation practice purposes.
- The test website is publicly available for testing and demonstration.
- Make sure the environment and dependencies are properly installed before execution.

---

## License

This project is for educational and testing purposes only. See [`SECURITY.md`](./SECURITY.md) for the security policy.
