import { EmailNotifier } from './email';
import { GoogleChatNotifier } from './google-chat';
import { SlackNotifier } from './slack';
import type { Notifier, RunReport } from './types';

const ALL_NOTIFIERS: Notifier[] = [
  new GoogleChatNotifier(),
  new SlackNotifier(),
  new EmailNotifier(),
];

function parseChannelAllowList(): Set<string> | null {
  const raw = process.env['NOTIFY_CHANNELS']?.trim();
  if (!raw) return null;
  const set = new Set(
    raw
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
  return set.size > 0 ? set : null;
}

/**
 * Decide whether the user has *opted in* to notifications for this run.
 *
 * Default policy is **off**: notifications only fire when the caller explicitly
 * asks for them. This keeps a stray `GOOGLE_CHAT_WEBHOOK` (e.g. exported from
 * a shell rc file) from spamming the channel on every local `npm test`.
 *
 * Opt-in is granted by ANY of:
 *   - `NOTIFY_ENABLED=1` (or its `PLAYWRIGHT_ENABLE_NOTIFICATIONS=1` alias)
 *   - `NOTIFY_CHANNELS` is set (an explicit allow-list IS the opt-in)
 *   - `CI` is truthy — pipeline runs are the whole reason webhooks exist
 */
function isOptedIn(): boolean {
  if (process.env['NOTIFY_ENABLED'] === '1') return true;
  if (process.env['PLAYWRIGHT_ENABLE_NOTIFICATIONS'] === '1') return true;
  if (process.env['NOTIFY_CHANNELS']?.trim()) return true;
  if (process.env['CI']) return true;
  return false;
}

export function resolveActiveNotifiers(): Notifier[] {
  // Hard kill switch wins over everything else, including CI.
  if (process.env['PLAYWRIGHT_DISABLE_NOTIFICATIONS'] === '1') return [];

  // Default-off: callers must explicitly opt in (see `isOptedIn`).
  if (!isOptedIn()) return [];

  const allowList = parseChannelAllowList();
  return ALL_NOTIFIERS.filter((notifier) => {
    // Honor explicit allow-list (even if a channel is otherwise enabled).
    if (allowList && !allowList.has(notifier.name)) return false;
    return notifier.isEnabled();
  });
}

/**
 * Fan out the report to every enabled channel concurrently.
 * Failures in one channel do NOT block the others (Promise.allSettled).
 * Returns a per-channel log line that the reporter prints to stdout.
 */
export async function dispatchNotifications(report: RunReport): Promise<string[]> {
  const notifiers = resolveActiveNotifiers();
  if (notifiers.length === 0) {
    if (process.env['PLAYWRIGHT_DISABLE_NOTIFICATIONS'] === '1') {
      return ['Notifications disabled via PLAYWRIGHT_DISABLE_NOTIFICATIONS=1.'];
    }
    return [
      'Notifications skipped (default-off). Opt in with NOTIFY_ENABLED=1, '
        + 'NOTIFY_CHANNELS=googlechat|slack|email, or run with CI=1. '
        + 'A channel also needs its config (GOOGLE_CHAT_WEBHOOK / SLACK_WEBHOOK_URL / EMAIL_SMTP_HOST).',
    ];
  }

  const results = await Promise.allSettled(
    notifiers.map(async (notifier) => {
      await notifier.send(report);
      return notifier.name;
    }),
  );

  return results.map((result, index) => {
    const channel = notifiers[index]?.name ?? 'unknown';
    if (result.status === 'fulfilled') {
      return `Notification sent: ${channel}`;
    }
    const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
    return `Notification failed (${channel}): ${error}`;
  });
}

export type { Notifier, RunReport } from './types';
