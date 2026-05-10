# GitHub Milestones — Convention & Catalogue

Single source of truth for the milestones used to plan and report progress on this repo. Mirrors the pattern in [`prompts/core/defect-labels.md`](../prompts/core/defect-labels.md): **define the names here, bootstrap from a script, query from automation**.

> Issues and PRs filed against this repo SHOULD be assigned to exactly one milestone (or `Backlog` if not yet scheduled). The QA Metrics dashboard's traceability panel can be extended in the future to bucket open work by milestone — that's why the names are stable, dated, and curated.

---

## TL;DR

- **Versioned milestones** (`v1.x`, `v2.x`) track framework / training / dashboard releases.
- **Open milestones** carry a target due-date so they show up under "Upcoming" on GitHub.
- **`Backlog`** catches everything that's not yet scheduled — no due date, never closes.
- Bootstrap them in any clone with: `npm run bootstrap:milestones`.

---

## Catalogue

### Shipped (close on creation)

| # | Title | State | Description |
|---|---|---|---|
| 1 | `v1.0 · Foundations` | closed | POM framework (`locators/` → `pages/` → `tests/`), basic UI/API specs against the OpenCart demo, Allure 3, multi-channel run notifications. |
| 2 | `v1.1 · Multi-env CI & Live Dashboard` | closed | qa / uat / staging matrix in GitHub Actions, GitHub Pages auto-deploy, environment switcher, Run-Context card, dashboard PDF + live HTML. |
| 3 | `v1.2 · AI Prompt + Skill Library` | closed | `prompts/core` · `advanced` · `devops` · `reporting`, prompt orchestrator, 30+ Agent Skills under `.agents/skills/`, defect-labels and test-tags conventions. |
| 4 | `v1.3 · Training Curriculum` | closed | 33-module, 6-phase QA Engineer training under `training/` (Foundations → AI-Assisted QA), every module backed by code in this repo. |

### Open — scheduled

| # | Title | Due | State | Description |
|---|---|---|---|---|
| 5 | `v2.0 · Coverage Hardening` | **2026-08-31** | open | Close all open `REQ-*` traceability gaps, expand `tests/api/test-security.spec.ts`, add visual-regression baselines + axe-core a11y scans, raise pass-rate target to ≥ 98%. |
| 6 | `v2.1 · Mobile & Cross-browser` | **2026-11-30** | open | Mobile-emulation Playwright projects (iPhone 14, Pixel 8), real-device support via BrowserStack/SauceLabs, responsive-layout regression suite. |
| 7 | `v2.2 · Self-Healing & AI-Assisted Authoring` | **2027-02-28** | open | AI-driven locator healing in CI on `selector-resolution` failures, automated flaky-test triage opening pre-filled GitHub issues, AI auto-PR generation from failed runs. |

### Open — rolling

| # | Title | Due | State | Description |
|---|---|---|---|---|
| 8 | `Backlog` | — | open | Catch-all for unscheduled ideas, nice-to-haves, and discovered work waiting for prioritisation. Never closes. |

---

## Conventions

- **Title format** — versioned milestones use `vMAJOR.MINOR · Theme` (e.g. `v2.0 · Coverage Hardening`). One concise theme per milestone.
- **One milestone per issue/PR** — pick the smallest scoped one. Use `Backlog` only when nothing else fits.
- **Closing rule** — a milestone closes when **all attached issues are closed** AND every shipped item lands in the changelog (`README.md` "What's new" or `CHANGELOG.md` if introduced).
- **Slipped due dates** — bump the due date on the milestone and add a one-line note here under "Catalogue". Don't silently retitle.
- **Adding a new milestone** — add the row here first, then re-run the bootstrap script (it's idempotent — existing titles are skipped).

---

## Bootstrap

Requires:
- `gh` CLI authenticated as a user with **push** access to `khanhdodang/ai-qa-training`, **or**
- `GITHUB_TOKEN` env var with `repo` scope.

```bash
# One-shot — creates anything missing, leaves existing milestones untouched.
npm run bootstrap:milestones

# Or, against a fork:
GITHUB_REPOSITORY=your-org/your-fork npm run bootstrap:milestones
```

Behind the wheel: [`scripts/bootstrap-milestones.sh`](../scripts/bootstrap-milestones.sh) loops over the catalogue and calls `gh api repos/$REPO/milestones`. It's idempotent (skips on title match) and prints a summary at the end.

### Manual fallback (one-liner)

```bash
gh api repos/khanhdodang/ai-qa-training/milestones \
  -f title='v2.0 · Coverage Hardening' \
  -f description='Close REQ-* gaps; visual + a11y; security expansion.' \
  -f due_on='2026-08-31T23:59:59Z' \
  -f state='open'
```

### Closing the four shipped milestones

```bash
for n in 1 2 3 4; do
  gh api -X PATCH repos/khanhdodang/ai-qa-training/milestones/$n -f state='closed'
done
```

---

## Querying milestones

```bash
# Open milestones with progress
gh api repos/khanhdodang/ai-qa-training/milestones?state=open \
  --jq '.[] | "\(.title) — \(.open_issues) open / \(.closed_issues) closed (due \(.due_on // "—"))"'

# Issues attached to a milestone
gh issue list --milestone 'v2.0 · Coverage Hardening' --state all
```

---

## Related references

- [`prompts/core/defect-labels.md`](../prompts/core/defect-labels.md) — defect labels feed the dashboard's Defects panel; milestones layer on top to add **timeline**.
- [`prompts/core/test-tags.md`](../prompts/core/test-tags.md) — every test carries severity + priority tags; combine with milestones for "what's expected by `v2.0`?" reports.
- [`.github/workflows/playwright.yml`](workflows/playwright.yml) — CI matrix that produces the artefacts these milestones gate on.
