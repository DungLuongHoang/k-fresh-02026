import { postJson } from './http';
import type { Notifier, RunReport } from './types';

function resolveWebhook(): string {
  return (process.env['SLACK_WEBHOOK_URL'] ?? process.env['SLACK_WEBHOOK'] ?? '').trim();
}

function buildSlackPayload(report: RunReport): unknown {
  const { status, summary } = report;
  const headerEmoji = status === 'passed' ? ':white_check_mark:' : ':x:';
  const headline = `${headerEmoji} Playwright run ${status.toUpperCase()} — ${summary.passed}/${summary.total} passed`;

  // Slack Block Kit gives a much nicer card than raw text. We keep the plain
  // `text` field too so notifications/preview text remain readable.
  return {
    text: headline,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: headline, emoji: true },
      },
      {
        type: 'section',
        // Slack `mrkdwn` accepts the same `*bold*` syntax already used by the
        // shared message body, so we pass it through verbatim.
        text: { type: 'mrkdwn', text: '```' + report.message + '```' },
      },
    ],
  };
}

export class SlackNotifier implements Notifier {
  public readonly name = 'slack';

  isEnabled(): boolean {
    return resolveWebhook().length > 0;
  }

  async send(report: RunReport): Promise<void> {
    const webhook = resolveWebhook();
    if (!webhook) throw new Error('Slack webhook is not configured');
    await postJson(webhook, buildSlackPayload(report));
  }
}
