# Security Policy

This repository is a **Playwright UI/API test-automation framework**. It does not run in production and does not serve traffic, so the threat model is centred on **credential leakage**, **malicious dependencies**, and **misuse of test infrastructure** (CI runners, webhooks, SMTP credentials).

---

## Scope

| In scope | Out of scope |
|---|---|
| Leaked credentials in committed files (`profiles/.env.*`, hard-coded tokens) | Vulnerabilities in the system-under-test (`ecommerce-playground.lambdatest.io` and similar) — report those upstream |
| Malicious or compromised npm dependency that this project ships | General npm-ecosystem issues unrelated to packages we depend on |
| Webhook URL or SMTP credential exfiltration via the notification system (`reports/notifiers/`) | Webhook-spam against your own channel because you set `NOTIFY_ENABLED=1` locally |
| Insecure husky / CI pipeline (e.g. running untrusted code from PRs) | Generic GitHub-platform vulnerabilities — report those to GitHub |
| `code-committer` or other Cursor/Claude agents granted excessive permissions | Issues caused by users running `--no-verify` or otherwise bypassing the documented hooks |

---

## Supported versions

This is a single-track repository — only the `main` branch is "supported". Long-running release branches do not exist. CVEs and dependency advisories are addressed against `main` and any active release/hotfix branch.

| Branch | Status |
|---|---|
| `main` | Supported |
| `release/*`, `hotfix/*` | Supported while open |
| any other branch | Unsupported (best-effort) |

---

## Reporting a vulnerability

**Do not** open a public GitHub issue, pull request, or chat message describing the vulnerability. Send a private report by email to:

- **khanhdo.pmp@gmail.com** — subject prefix `[SECURITY] ai-qa-training: <short title>`

Include:

1. A description of the issue and the threat (credential leak / dependency / pipeline / agent / other).
2. Steps to reproduce, with the smallest possible example.
3. Affected commit SHA / branch / tag.
4. Your proposed remediation, if you have one.
5. Whether you'd like to be credited in the eventual fix commit.

### Response expectations

| Stage | Target |
|---|---|
| Initial acknowledgement | within **3 business days** |
| Triage decision (accepted / declined / needs more info) | within **7 business days** |
| Fix landed on `main` for accepted reports | within **14 business days** for high severity, **30 days** otherwise |
| Public disclosure | coordinated — not before a fix is shipped, unless the issue is already public |

If the report is declined, you will receive a written reason and (where possible) a pointer to the upstream project to escalate to.

---

## Secrets policy

Secrets are everything that, if leaked, would let someone act as you or as the test pipeline. In this repo that includes:

- Login credentials: `LOGIN_USERNAME`, `LOGIN_PASSWORD`
- Notification webhooks: `GOOGLE_CHAT_WEBHOOK`, `LOCAL_CI_GOOGLE_CHAT_WEBHOOK`, `SLACK_WEBHOOK_URL`, `SLACK_WEBHOOK`
- SMTP credentials: `EMAIL_SMTP_HOST`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`, …
- Any GitHub / cloud / CI token — including the URL embedded in `git remote get-url origin`

### Where they are allowed

| Location | Allowed? |
|---|---|
| `profiles/.env.<env>.local` (gitignored — see [`.gitignore`](./.gitignore)) | ✅ |
| CI secret store (GitHub Actions Secrets, Jenkins Credentials, …) | ✅ |
| Shell rc file (`~/.zshrc`, `~/.bashrc`) | ⚠️ allowed but discouraged — see "Default-off notifications" in [`reports/README.md`](./reports/README.md) |
| `profiles/.env.<env>` (tracked) | ❌ — only `*.example` versions are tracked |
| Any committed file (`.ts`, `.json`, `.yml`, …) | ❌ |
| Commit messages, PR descriptions, issue comments | ❌ |
| `git remote` URLs (`https://user:TOKEN@github.com/...`) | ❌ — use the credential manager or SSH instead |

### If a secret leaks

1. **Rotate it immediately** — revoke the old credential at the source (GitHub PAT, Slack webhook, SMTP password, …).
2. Force-rewrite history if the leak is in a private branch you control (`git filter-repo`); for already-pushed shared branches, rotation is the only real fix — git history alone is not a secret.
3. Email **khanhdo.pmp@gmail.com** with the commit SHA so we can audit.

---

## Hardening guarantees in this repo

- `.gitignore` excludes `profiles/.env.*` while allowing `*.example`.
- `commitlint.config.js` + `husky/commit-msg` enforce Conventional Commits — secrets accidentally typed into a message body are still committed, but the gate makes them visible.
- `husky/pre-push` runs `npm run check:all` (ESLint + `tsc --noEmit`) and a grep for `test.only` before pushing, reducing accidental debug pushes.
- Notifications are **default-off** ([`reports/notifiers/index.ts`](./reports/notifiers/index.ts)) — a stray `GOOGLE_CHAT_WEBHOOK` in your shell will not exfiltrate run summaries unless you explicitly opt in.
- The `code-committer` Claude agent ([`.claude/agents/code-committer.md`](./.claude/agents/code-committer.md)) is forbidden from staging `.env*`, `*.pem`, `*.key`, or anything matching `secrets/*`, and is forbidden from `--no-verify`, force-push to protected branches, or `git config` mutations.

These are **belts and braces** — they reduce blast radius but do not replace careful review of every diff.

---

## Dependency hygiene

- Production-runtime dependencies (`dependencies` in `package.json`) are kept **minimal** — currently 6 packages.
- Development dependencies (`devDependencies`) are reviewed quarterly; PRs that add a new direct dependency must explain *why* in the commit body.
- `npm audit` is informational, not a gate — its high-noise advisories are triaged manually before being filed.

If you find a transitive dependency that is malicious or compromised:

1. Pin a safe version with `overrides` in `package.json` (see [npm docs](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)).
2. File a private report (see "Reporting a vulnerability" above).
3. Do **not** open a public issue until the fix is on `main`.

---

## Agent / automation security

This repository is set up to be operated partly by AI coding agents (Cursor, Claude Code). Treat agent permissions like CI permissions:

- **Never** paste a real secret into an agent prompt — agents may persist context to logs or transcripts.
- **Never** ask an agent to "commit and push my .env" — the documented agent (`code-committer`) is configured to refuse, but the safest path is not to ask.
- Review every diff an agent produces before merging.
- Agents must not bypass husky hooks, force-push to protected branches, or `git config` the repository.

---

## Acknowledgements

A `SECURITY.md` is a living document. PRs that strengthen the policy (clearer scope, faster triage, additional hardening) are welcome. Reports filed in good faith and through the private channel above are **always** acknowledged, even if declined.
