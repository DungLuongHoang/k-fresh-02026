import { postJson } from './http';
import type { Notifier, RunReport } from './types';

const ENV_KEYS = ['LOCAL_CI_GOOGLE_CHAT_WEBHOOK', 'GOOGLE_CHAT_WEBHOOK'] as const;

function resolveWebhook(): string {
  for (const key of ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

export class GoogleChatNotifier implements Notifier {
  public readonly name = 'googlechat';

  isEnabled(): boolean {
    if (process.env['PLAYWRIGHT_DISABLE_GOOGLE_CHAT_REPORTER'] === '1') return false;
    return resolveWebhook().length > 0;
  }

  async send(report: RunReport): Promise<void> {
    const webhook = resolveWebhook();
    if (!webhook) throw new Error('Google Chat webhook is not configured');
    // Google Chat understands plain text with simple `*bold*` mrkdwn — same shape
    // the reporter has emitted historically, so message is forwarded as-is.
    await postJson(webhook, { text: report.message });
  }
}
