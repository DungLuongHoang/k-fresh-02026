# Husky & Git-Hook Guidelines

[Husky](https://typicode.github.io/husky/) is the tool that wires this repo's `.husky/` scripts into Git's per-developer hooks. It runs **before** changes leave your working copy, so we catch lint, type, commit-message, and "left-`.only`-behind" mistakes locally instead of in CI.

If you skip the hooks (see [Bypassing safely](#bypassing-safely-and-when-not-to)), expect CI to be the next line of defence — but the loop is much slower.

## TL;DR

| You run… | Husky triggers… | Which executes… | Failure means… |
| --- | --- | --- | --- |
| `git commit` | `pre-commit` | `npx lint-staged` → ESLint `--fix` on staged `.js` / `.ts` | Lint errors that ESLint cannot auto-fix |
| `git commit` | `commit-msg` | `npx commitlint --edit "$1"` | Commit message violates Conventional Commits / our overrides |
| `git push` | `pre-push` | `npm run check:all` then `grep -rn 'tests/' -e '\.only'` | TS errors, lint errors, **or** a stray `.only` left in the test code |
| `git pull` / `git merge` | `post-merge` | `npm install` | Dependencies failed to install — usually a network / lockfile problem |

## How it gets installed

Husky installs itself the first time anyone runs `npm install`, via the `prepare` lifecycle script in `package.json`:

```json
"scripts": {
  "prepare": "husky"
}
```

That single command:

1. Creates the `.husky/_/` directory with the husky runtime.
2. Configures Git to look at `.husky/` for hooks instead of `.git/hooks/`.
3. Makes every `.husky/<hook>` script executable.

**You don't run anything else.** Cloning the repo + `npm install` is enough. If hooks aren't firing, see [Troubleshooting](#troubleshooting).

> The `post-merge` hook also runs `npm install` automatically, so pulling main usually keeps your deps in sync without you noticing.

## What each hook actually does

### `pre-commit` — auto-fix what's staged

```bash
npx lint-staged
```

Reads the `lint-staged` block in `package.json`:

```json
"lint-staged": {
  "*.{js,ts}": [
    "eslint --ext .ts tests pages locators utilities data --fix"
  ]
}
```

Only **staged** files are eligible (so unstaged work is never touched), and ESLint runs with `--fix` so style-only problems are repaired in place and re-staged automatically. Anything that can't be fixed automatically (logic errors, unused imports left over after a refactor, etc.) blocks the commit.

### `commit-msg` — enforce Conventional Commits

```bash
npx --no -- commitlint --edit "$1"
```

The argument `$1` is the temp file Git wrote your commit message to. Commitlint reads it and validates against:

- **Preset:** `@commitlint/config-conventional` (the standard Conventional Commits ruleset).
- **Project overrides** (defined in `commitlint.config.js`):
  - `subject-case`: `pascal-case` and `upper-case` are forbidden — but **sentence case is allowed** (`chore: Add cool stuffs` is fine).
  - `header-max-length`: 100 chars (default is 72; we relaxed it).
  - `body-max-line-length`: 120 chars (warning, not error).

#### Allowed types

`build` · `chore` · `ci` · `docs` · `feat` · `fix` · `perf` · `refactor` · `revert` · `style` · `test`

#### Quick examples

```text
feat(login): allow remembered email after logout
fix(cart): correct discount calculation for promo codes
chore: bump playwright to 1.59
docs(reports): add notification setup guide
test(checkout): cover same-as-billing toggle
```

#### Anatomy

```text
<type>(<optional scope>): <subject>
                        ↑          ↑
                  no upper-case   sentence case is fine,
                  here            <= 100 chars total header
<blank line>
<optional body, lines wrapped at ~120 chars>

<blank line>
<optional footer — e.g. "BREAKING CHANGE: …" or "Refs: KAN-123">
```

> **Heads-up:** the repo currently contains **both** `commitlint.config.js` *and* `.commitlintrc.json`. Commitlint's loader picks `commitlint.config.js` first — `.commitlintrc.json` is dead config and can be deleted. Tracked as a follow-up so the rule source-of-truth is unambiguous.

### `pre-push` — gate the push

```bash
npm run check:all
# Check for .only in tests to prevent pushing debug code to CI/CD
if grep -rn 'tests/' -e '\.only'; then
  echo "🚨 CRITICAL ERROR PREVENTED PUSH 🚨"
  echo "Detected '.only' left in the tests code!"
  ...
  exit 1
fi
```

Two gates run sequentially:

1. **`npm run check:all`** = `npm run linter && npm run typecheck`
   - `linter` → `eslint --ext .ts tests pages locators utilities data --fix`
   - `typecheck` → `tsc --noEmit`
2. **`.only` guard** — `test.only(...)` / `describe.only(...)` left in any `tests/**` file would cause CI to run **only** that one test, silently passing the build while the rest of the suite is skipped. The grep aborts the push with a loud red banner if any `.only` is found.

> The grep is intentionally broader than the test runner — it matches any `.only` anywhere in the `tests/` tree (including comments). False positives are rare in practice but, if you genuinely need the literal string in a test, prefix the line with a comment that doesn't include it (e.g. assemble it from a variable) or rephrase.

### `post-merge` — keep dependencies fresh

```bash
npm install
```

After `git pull` or `git merge`, this re-installs deps so the second you switch branches you don't run with stale `node_modules/`. The hook is idempotent — when nothing changed, `npm install` is essentially free.

If you don't want this for a specific pull (e.g. you're offline), bypass with:

```bash
git pull --no-verify
```

## Bypassing — safely, and when not to

Every hook can be bypassed with the standard Git escape hatches:

| Hook(s) | Bypass flag |
| --- | --- |
| `pre-commit`, `commit-msg`, `pre-push` | `--no-verify` (`-n`) on the matching command |
| `post-merge` | `git pull --no-verify` (or `git merge --no-verify`) |

```bash
git commit --no-verify -m "wip: emergency hotfix, fix linter follow-up"
git push --no-verify
```

**Use sparingly.** Acceptable reasons:

- A real production hotfix where seconds matter; CI will still gate.
- A genuine commitlint false positive that's blocking unrelated work.
- A deliberate `wip:` commit you intend to squash before pushing.

**Not acceptable reasons:**

- "Lint is annoying" — fix the lint instead.
- "Typecheck is slow" — `npm run typecheck` should finish in <10 s on a clean tree; if it doesn't, that's a tsconfig bug worth fixing.
- "I'll deal with the `.only` later" — the entire reason that grep exists is because that *never* happens.

If you find yourself routinely passing `--no-verify`, fix the underlying tooling problem instead of normalizing the bypass.

## Adding a new hook

1. Create the hook script (any executable command, no shebang or `chmod` required since husky v9):

   ```bash
   echo 'npx vitest run --changed' > .husky/pre-merge-commit
   ```

2. Test it manually before committing:

   ```bash
   sh .husky/pre-merge-commit
   ```

3. Commit it. The next clone will pick it up automatically because `prepare` re-installs husky on every `npm install`.

Hook names follow [Git's standard list](https://git-scm.com/docs/githooks). Common ones we don't yet use but might add:

| Hook | Useful for |
| --- | --- |
| `prepare-commit-msg` | Auto-prepend a JIRA ticket pulled from the branch name |
| `post-checkout` | Run `npm install` when switching branches that touch `package-lock.json` |
| `pre-rebase` | Block rebases of `main` |

## Configuration files

| File | Purpose | Authoritative? |
| --- | --- | --- |
| `.husky/<hook>` | The actual command(s) that run for the matching Git event | yes |
| `package.json` → `scripts.prepare` | Bootstraps husky on `npm install` | yes |
| `package.json` → `lint-staged` | What `pre-commit` runs file-by-file | yes |
| `commitlint.config.js` | Conventional Commits + project overrides | yes |
| `.commitlintrc.json` | Older alias for the above — **superseded** | **no** (delete candidate) |

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Commits succeed but no hooks run | husky never installed (you cloned and skipped `npm install`) | `npm install` once; verify with `git config --get core.hooksPath` → should print `.husky` |
| `husky: command not found` during `npm install` | Old/no Node, or `husky` removed from deps | Use Node ≥ 18, run `npm install --save-dev husky`, then `npx husky init` |
| `pre-commit` keeps reformatting files I didn't change | Some other commit landed `--fix`-eligible style on `main` | Pull `main`, let `lint-staged` rewrite once, commit the auto-fix as a separate `style:` commit |
| `commit-msg` rejects `Add: do thing` | Type `Add` is not in the allowed list | Use `feat:`, `fix:`, `chore:`, … (see [Allowed types](#allowed-types)) |
| `commit-msg` rejects `feat: Add Cool Thing` | Title-case subject | Either keep the rest lowercase (`feat: add cool thing`) or sentence-case it (`feat: Add cool thing`). PascalCase / SCREAMING-CASE are forbidden |
| `pre-push` fails with `Detected '.only' …` | `test.only(...)` in a test file | `git grep -nE '\.only'  tests/` to locate, remove `.only`, repush |
| `pre-push` runs `tsc --noEmit` errors I can't reproduce | IDE picked a different TS version than the project | In Cursor/VSCode: "TypeScript: Select TypeScript Version" → "Use Workspace Version" |
| `post-merge` fails to install offline | No network during the hook | `git pull --no-verify`; run `npm install` once you're back online |

## Cheat sheet

```bash
# Manually run all hooks against current state (without committing/pushing)
sh .husky/pre-commit          # what would the commit do?
sh .husky/pre-push            # what would the push do?

# Test a commit message without writing the commit
echo "feat(cart): trial" | npx commitlint

# Reinstall husky from scratch (e.g. .git/hooks reset)
rm -rf .husky/_
npm install                   # `prepare` rebuilds it

# One-shot bypass
git commit --no-verify -m "fix: bypass for X"
git push --no-verify

# Find which hooks fire for an event
ls .husky/                    # everything except `_/` is one of our hooks
```

## See also

- Husky docs: <https://typicode.github.io/husky/>
- Commitlint rules: <https://commitlint.js.org/reference/rules.html>
- Conventional Commits spec: <https://www.conventionalcommits.org/>
- Project notification reporter: [`reports/README.md`](../../reports/README.md)
