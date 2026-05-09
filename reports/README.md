# Test-Run Notifications for Playwright

Per-run summary delivery for any Playwright project. After every test run the custom reporter ([`./custom-reporter.ts`](./custom-reporter.ts)) builds a single `RunReport` (status, duration, summary, first failed tests, env/target context) and **fans it out to every enabled channel in parallel** via `dispatchNotifications()`.

> **Default is OFF.** Notifications never fire unless the caller explicitly opts in (see [Channel enable rules](#channel-enable-rules)). A `GOOGLE_CHAT_WEBHOOK` exported in `~/.zshrc` will sit dormant until you set `NOTIFY_ENABLED=1`, list a channel in `NOTIFY_CHANNELS`, or run in `CI`.

## Architecture at a glance

```
Playwright run ends
        │
        ▼
custom-reporter.ts ──► dispatchNotifications(report)
                              │
                              ├─► GoogleChatNotifier  (POST text)
                              ├─► SlackNotifier       (POST Block Kit)
                              └─► EmailNotifier       (SMTP via nodemailer)

                       Promise.allSettled — one failure ≠ all failures
```

| File | Responsibility |
| --- | --- |
| `notifiers/types.ts` | `Notifier` interface + `RunReport`, `RunSummary`, `CliContext` types |
| `notifiers/http.ts` | Tiny `postJson()` over Node `http`/`https` with a 10 s timeout — used by webhook channels |
| `notifiers/google-chat.ts` | Posts the plain-text body to a Google Chat webhook |
| `notifiers/slack.ts` | Posts a Slack [Block Kit](https://api.slack.com/block-kit) card |
| `notifiers/email.ts` | SMTP via lazy-loaded `nodemailer`, multipart text + HTML |
| `notifiers/index.ts` | Discovers enabled channels, dispatches concurrently, returns per-channel log lines |
| `custom-reporter.ts` | Playwright `Reporter` wrapper that builds the `RunReport` and calls the dispatcher |

## Prerequisites

1. Add the custom reporter to your `playwright.config.ts`:

   ```typescript
   reporter: [
     ['html', { open: 'never' }],
     // ...your other reporters...
     ['./reports/custom-reporter.ts'],
   ],
   ```

2. Make sure `nodemailer` is installed if you intend to use the email channel:

   ```bash
   npm install nodemailer
   npm install -D @types/nodemailer
   ```

3. Decide where secrets live (e.g. `.env`, `profiles/.env.<env>.local`, CI secrets) — anything `process.env` can read at runtime is fine.

## Quick start

Pick your channel(s), set the env vars in your secrets store, **opt in for the run** (`NOTIFY_ENABLED=1` or `NOTIFY_CHANNELS=...`, or run in `CI`), and run any `npm test` script. The reporter runs at the end of the suite.

```bash
# Send to every configured channel:
NOTIFY_ENABLED=1 npm run test

# Or only Slack, even if Google Chat is also configured:
NOTIFY_CHANNELS=slack npm run test

# CI auto-opts in (most pipelines export CI=true), no extra flag needed:
CI=true npm run test
```

### Google Chat

1. In your Space → **Manage webhooks** → create a new webhook → copy the URL.
2. Export or persist the var:
   ```env
   GOOGLE_CHAT_WEBHOOK=https://chat.googleapis.com/v1/spaces/AAA.../messages?key=...&token=...
   ```
3. Run your tests. Look for `Notification sent: googlechat` at the end of the run.

### Slack

1. Slack admin → **Incoming Webhooks** → "Add to a channel" → copy the URL.
2. Export or persist the var:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
   ```
3. Run your tests. The post arrives as a Block Kit card with a coloured header and a monospace body block.

### Email (SMTP)

Minimum configuration:

```env
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_FROM="QA Bot <noreply@example.com>"
EMAIL_TO=team@example.com,qa-lead@example.com
```

Add credentials and tweak as needed:

```env
EMAIL_SMTP_PORT=587               # default 587 (STARTTLS); use 465 for SMTPS
EMAIL_SMTP_SECURE=false           # auto-true when port=465
EMAIL_SMTP_USER=apikey            # e.g. SendGrid uses literal "apikey"
EMAIL_SMTP_PASS=********          # SMTP password / API token
EMAIL_CC=manager@example.com
EMAIL_BCC=audit@example.com
EMAIL_SUBJECT_PREFIX=[QA]
```

Subject pattern (template):

```
<EMAIL_SUBJECT_PREFIX> [<STATUS>] <ENV>: <passed>/<total> passed
```

Example:

```
[QA] [PASSED] STAGING: 47/47 passed
[QA] [FAILED] PROD:    42/47 passed
```

> **Gmail tip.** A personal Gmail account requires an [App Password](https://myaccount.google.com/apppasswords) — your real account password will be rejected.

## Configuration reference

| Variable | Channel | Purpose | Default |
| --- | --- | --- | --- |
| `GOOGLE_CHAT_WEBHOOK` | Google Chat | Webhook URL | — |
| `LOCAL_CI_GOOGLE_CHAT_WEBHOOK` | Google Chat | Legacy alias for `GOOGLE_CHAT_WEBHOOK` | — |
| `SLACK_WEBHOOK_URL` | Slack | Incoming webhook URL | — |
| `SLACK_WEBHOOK` | Slack | Alias for `SLACK_WEBHOOK_URL` | — |
| `EMAIL_SMTP_HOST` | Email | SMTP server hostname | — |
| `EMAIL_SMTP_PORT` | Email | SMTP port | `587` |
| `EMAIL_SMTP_SECURE` | Email | `true` for SMTPS (TLS on connect) | `true` if port=465, else `false` |
| `EMAIL_SMTP_USER` | Email | SMTP username | unauthenticated |
| `EMAIL_SMTP_PASS` | Email | SMTP password / token | unauthenticated |
| `EMAIL_FROM` | Email | `From:` header (`Name <addr>` accepted) | — |
| `EMAIL_TO` | Email | Recipients (comma-separated) | — |
| `EMAIL_CC` | Email | Cc recipients (comma-separated) | none |
| `EMAIL_BCC` | Email | Bcc recipients (comma-separated) | none |
| `EMAIL_SUBJECT_PREFIX` | Email | Subject prefix | `[QA]` |
| `NOTIFY_ENABLED` | All | `1` opts this run into notifications (default is **off**) | unset |
| `PLAYWRIGHT_ENABLE_NOTIFICATIONS` | All | Alias for `NOTIFY_ENABLED` | unset |
| `NOTIFY_CHANNELS` | All | Allow-list (e.g. `slack,email`); when set, also implies opt-in | unset |
| `CI` | All | Any truthy value implies opt-in (typical CI runners set this) | unset |
| `PLAYWRIGHT_DISABLE_NOTIFICATIONS` | All | `1` mutes every channel — wins over all opt-in flags | unset |
| `PLAYWRIGHT_DISABLE_GOOGLE_CHAT_REPORTER` | Google Chat | `1` mutes only Google Chat (legacy flag) | unset |

### Reporter context overrides

These customize labels in the message body. Useful for matrix builds, team tagging, or branded summaries.

| Variable | Effect |
| --- | --- |
| `PLAYWRIGHT_NOTIFY_ENV` (or legacy `PLAYWRIGHT_GCHAT_ENV`) | Overrides the `Environment:` label (defaults to `ENV` then `uat`) |
| `PLAYWRIGHT_NOTIFY_PROJECT` (or legacy `PLAYWRIGHT_GCHAT_PROJECT`) | Overrides the `Project:` label |
| `PLAYWRIGHT_NOTIFY_TARGET` (or legacy `PLAYWRIGHT_GCHAT_TARGET`) | Overrides the `Target:` label |
| `PLAYWRIGHT_NOTIFY_GREP` (or legacy `PLAYWRIGHT_GCHAT_GREP`) | Overrides the grep label |
| `PLAYWRIGHT_NOTIFY_WORKERS` (or legacy `PLAYWRIGHT_GCHAT_WORKERS`) | Overrides the workers label |
| `PLAYWRIGHT_NOTIFY_RETRIES` (or legacy `PLAYWRIGHT_GCHAT_RETRIES`) | Overrides the retries label |

## Channel enable rules

A channel fires for the current run when **all** of these are true:

1. `PLAYWRIGHT_DISABLE_NOTIFICATIONS` ≠ `1`.
2. **The run is opted in** — at least one of these is set:
   - `NOTIFY_ENABLED=1` (or its alias `PLAYWRIGHT_ENABLE_NOTIFICATIONS=1`)
   - `NOTIFY_CHANNELS=...` (allow-list also counts as the opt-in)
   - `CI` is truthy (typical for pipeline runs)
3. `NOTIFY_CHANNELS` is unset **or** the channel name is in its comma-separated list.
4. The channel's own config is present (see table below).
5. The channel's individual disable flag (e.g. `PLAYWRIGHT_DISABLE_GOOGLE_CHAT_REPORTER`) is not set.

> Without an opt-in, the dispatcher logs `Notifications skipped (default-off)…` and returns immediately. Channels' webhooks/SMTP can sit configured indefinitely — they only fire when you ask.

| Channel name (in `NOTIFY_CHANNELS`) | Required env vars |
| --- | --- |
| `googlechat` | `GOOGLE_CHAT_WEBHOOK` |
| `slack` | `SLACK_WEBHOOK_URL` |
| `email` | `EMAIL_SMTP_HOST` + `EMAIL_FROM` + `EMAIL_TO` |

## Common recipes

```bash
# Default local run — silent even if GOOGLE_CHAT_WEBHOOK is exported in ~/.zshrc:
npm run test

# Local dev, want Slack pings for this run only (Google Chat stays muted):
NOTIFY_CHANNELS=slack npm run test

# Local dev, send to every configured channel for this run only:
NOTIFY_ENABLED=1 npm run test

# Hard-mute everything, even on CI (e.g. when re-running a flaky shard):
PLAYWRIGHT_DISABLE_NOTIFICATIONS=1 npm run test

# CI runner (CI=true is auto-set by GitHub Actions / GitLab / Jenkins / ...):
#   webhook + email, but only email recipients during a release window:
NOTIFY_CHANNELS=email npm run test \
  # with these env vars exported by the pipeline:
  #   SLACK_WEBHOOK_URL=https://hooks.slack.com/...
  #   EMAIL_SMTP_HOST=smtp.sendgrid.net
  #   EMAIL_SMTP_USER=apikey
  #   EMAIL_SMTP_PASS=$SENDGRID_TOKEN
  #   EMAIL_FROM="QA Bot <qa-bot@example.com>"
  #   EMAIL_TO=release-team@example.com
```

## Adding a new channel

1. Create `reports/notifiers/<name>.ts` exporting a class that implements `Notifier`:

   ```typescript
   import type { Notifier, RunReport } from './types';

   export class TeamsNotifier implements Notifier {
     public readonly name = 'teams';

     isEnabled(): boolean {
       return Boolean(process.env['TEAMS_WEBHOOK_URL']?.trim());
     }

     async send(report: RunReport): Promise<void> {
       const url = process.env['TEAMS_WEBHOOK_URL']!.trim();
       // build payload, POST it...
     }
   }
   ```

2. Register it in `notifiers/index.ts`:

   ```typescript
   import { TeamsNotifier } from './teams';

   const ALL_NOTIFIERS: Notifier[] = [
     new GoogleChatNotifier(),
     new SlackNotifier(),
     new EmailNotifier(),
     new TeamsNotifier(), // ← add here
   ];
   ```

3. Document the env vars in this README's tables.

That's it. The dispatcher will pick it up automatically — no changes needed in `custom-reporter.ts`.

## Local smoke test

A 30-second sanity check that exercises the dispatcher without running any browsers. Place this script **at the project root** (so the relative import resolves), then delete it after testing.

```bash
# 1. Drop a temp script at the repo root (DO NOT use /tmp — relative imports won't resolve).
cat > smoke-notify.ts <<'EOF'
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { dispatchNotifications, type RunReport } from './reports/notifiers';

const received: { url: string; body: string }[] = [];
const server = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => {
    received.push({ url: req.url ?? '', body: Buffer.concat(chunks).toString('utf8') });
    res.writeHead(200); res.end('{}');
  });
});
await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
const { port } = server.address() as AddressInfo;
process.env['GOOGLE_CHAT_WEBHOOK'] = `http://127.0.0.1:${port}/gchat`;
process.env['SLACK_WEBHOOK_URL']   = `http://127.0.0.1:${port}/slack`;

const report: RunReport = {
  status: 'passed', durationMs: 1234,
  summary: { total: 3, passed: 3, failed: 0, skipped: 0, flaky: 0, failedTests: [] },
  context: { envName: 'qa', project: 'smoke', target: 'tests', grep: '', workers: '1', retries: '0' },
  message: 'Hello from smoke test',
  config: {} as never, suite: {} as never,
};
console.log(await dispatchNotifications(report));
console.log(received);
server.close();
EOF

# 2. Run it.
npx tsx smoke-notify.ts

# 3. Clean up.
rm smoke-notify.ts
```

Expected output:

```
[ 'Notification sent: googlechat', 'Notification sent: slack' ]
[
  { url: '/gchat', body: '{"text":"Hello from smoke test"}' },
  { url: '/slack', body: '{"text":":white_check_mark: Playwright run PASSED ...' }
]
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Notifications skipped (default-off)…` log line | The run was not opted in | Re-run with `NOTIFY_ENABLED=1`, `NOTIFY_CHANNELS=<list>`, or under `CI=true` |
| `Notifications disabled via PLAYWRIGHT_DISABLE_NOTIFICATIONS=1.` | Hard kill switch is set | Unset `PLAYWRIGHT_DISABLE_NOTIFICATIONS` (it wins over every opt-in) |
| Reporter logs the opt-in line but still nothing arrives in the channel | None of `GOOGLE_CHAT_WEBHOOK` / `SLACK_WEBHOOK_URL` / `EMAIL_SMTP_HOST` are set | Set the env var(s) for the channel you want, then re-run |
| `Notification failed (slack): Webhook hooks.slack.com returned status 404` | Webhook URL revoked or typoed | Regenerate the incoming webhook in Slack |
| `Notification failed (email): connect ECONNREFUSED 127.0.0.1:587` | Wrong `EMAIL_SMTP_HOST` (still pointing at localhost) or firewall | Verify the host, port, and outbound SMTP rules |
| `Notification failed (email): Invalid login: 535 ...` | Bad credentials | For Gmail use an App Password; for SendGrid use literal username `apikey` |
| `Notification failed (googlechat): ... timed out after 10000ms` | Egress blocked | Allow the webhook host on port 443 from the runner; bump timeout in `notifiers/http.ts` if your network is slow |
| Reporter never runs (no notification logs at all) | `custom-reporter.ts` not registered | Confirm it's listed in the `playwright.config.ts` `reporter:` array |

## Design notes

- **Lazy `nodemailer` import.** `email.ts` only `import('nodemailer')` inside `send()`, so users who don't enable email pay no startup cost. The dep is still pinned in `package.json` so CI cold-cache builds aren't surprised.
- **No new HTTP client.** Node's built-in `http`/`https` is enough for two webhook POSTs. Avoiding `axios` / `node-fetch` keeps the reporter tree tiny.
- **`Promise.allSettled` everywhere.** A misconfigured Slack webhook must not break the email channel, and vice versa. The dispatcher logs each channel's status independently.
- **Backwards compatibility.** Every legacy `PLAYWRIGHT_GCHAT_*` and `LOCAL_CI_GOOGLE_CHAT_WEBHOOK` env var still works — anyone who already had the Google Chat reporter wired up does not need to change their config.
- **Default-off opt-in.** Earlier revisions fired notifications whenever a webhook was configured, which surprised users who exported `GOOGLE_CHAT_WEBHOOK` in their shell profile. The dispatcher now requires an explicit opt-in (`NOTIFY_ENABLED=1`, `NOTIFY_CHANNELS=...`, or `CI`), so local runs are silent by default and CI behavior is unchanged. Add `NOTIFY_ENABLED=1` to your test scripts in `package.json` if you want the old "always-on when configured" behaviour.
