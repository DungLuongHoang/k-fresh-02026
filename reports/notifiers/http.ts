import http from 'node:http';
import https from 'node:https';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Minimal POST helper for webhook-style channels (Slack, Google Chat, ...).
 * Kept intentionally tiny so we don't pull in axios/node-fetch just for this.
 */
export async function postJson(
  webhookUrl: string,
  body: unknown,
  options: { timeoutMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const target = new URL(webhookUrl);
  const client = target.protocol === 'https:' ? https : http;
  const payload = JSON.stringify(body);

  await new Promise<void>((resolve, reject) => {
    const request = client.request(
      {
        method: 'POST',
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (response) => {
        // Drain the body so the socket can be reused / closed cleanly.
        response.on('data', () => { });
        response.on('end', () => {
          const statusCode = response.statusCode ?? 0;
          if (statusCode >= 200 && statusCode < 300) {
            resolve();
            return;
          }
          reject(new Error(`Webhook ${target.host} returned status ${statusCode}`));
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(new Error(`Webhook ${target.host} timed out after ${timeoutMs}ms`));
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}
