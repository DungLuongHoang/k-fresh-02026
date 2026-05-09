import type { Notifier, RunReport } from './types';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env['EMAIL_SMTP_HOST']?.trim();
  const from = process.env['EMAIL_FROM']?.trim();
  const to = parseList(process.env['EMAIL_TO']);

  if (!host || !from || to.length === 0) return null;

  const port = Number(process.env['EMAIL_SMTP_PORT'] ?? 587);
  // Default `secure: true` for the SMTPS port (465), STARTTLS for 587/25.
  const secure =
    (process.env['EMAIL_SMTP_SECURE'] ?? (port === 465 ? 'true' : 'false')).toLowerCase() === 'true';

  const user = process.env['EMAIL_SMTP_USER']?.trim();
  const pass = process.env['EMAIL_SMTP_PASS']?.trim();

  // Build the result without setting `user`/`pass` keys when absent — required
  // by `exactOptionalPropertyTypes: true`.
  const config: SmtpConfig = {
    host,
    port,
    secure,
    from,
    to,
    cc: parseList(process.env['EMAIL_CC']),
    bcc: parseList(process.env['EMAIL_BCC']),
  };
  if (user) config.user = user;
  if (pass) config.pass = pass;
  return config;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Convert the shared `*bold*` plain-text body into a tiny styled HTML block. */
function buildHtmlBody(report: RunReport): string {
  const { status, summary, context } = report;
  const passed = status === 'passed';
  const accent = passed ? '#16a34a' : '#dc2626';
  const headline = passed ? 'Playwright run PASSED' : 'Playwright run FAILED';

  const failedRows =
    summary.failedTests.length > 0
      ? `<h3 style="margin:16px 0 4px">First failed tests</h3><ol>${summary.failedTests
          .map((title) => `<li>${escapeHtml(title)}</li>`)
          .join('')}</ol>`
      : '';

  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
    <div style="border-left:6px solid ${accent};padding:12px 16px;background:#f8fafc;border-radius:6px">
      <h2 style="margin:0;color:${accent}">${headline}</h2>
      <p style="margin:4px 0 0;color:#475569">${escapeHtml(context.envName.toUpperCase())} · ${escapeHtml(context.project)}</p>
    </div>
    <h3 style="margin:16px 0 4px">Summary</h3>
    <table style="border-collapse:collapse">
      <tr><td style="padding:2px 12px 2px 0">Total</td><td><b>${summary.total}</b></td></tr>
      <tr><td style="padding:2px 12px 2px 0">Passed</td><td style="color:#16a34a"><b>${summary.passed}</b></td></tr>
      <tr><td style="padding:2px 12px 2px 0">Failed</td><td style="color:#dc2626"><b>${summary.failed}</b></td></tr>
      <tr><td style="padding:2px 12px 2px 0">Skipped</td><td>${summary.skipped}</td></tr>
      <tr><td style="padding:2px 12px 2px 0">Flaky</td><td style="color:#d97706">${summary.flaky}</td></tr>
    </table>
    ${failedRows}
    <h3 style="margin:16px 0 4px">Full report</h3>
    <pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px;overflow:auto">${escapeHtml(report.message)}</pre>
  </body></html>`;
}

function buildSubject(report: RunReport): string {
  const status = report.status.toUpperCase();
  const env = report.context.envName.toUpperCase();
  const { passed, total } = report.summary;
  const subjectPrefix = process.env['EMAIL_SUBJECT_PREFIX']?.trim() || '[K Fresh QA]';
  return `${subjectPrefix} [${status}] ${env}: ${passed}/${total} passed`;
}

export class EmailNotifier implements Notifier {
  public readonly name = 'email';

  isEnabled(): boolean {
    return readSmtpConfig() !== null;
  }

  async send(report: RunReport): Promise<void> {
    const config = readSmtpConfig();
    if (!config) {
      throw new Error('Email SMTP config is incomplete (need EMAIL_SMTP_HOST, EMAIL_FROM, EMAIL_TO)');
    }

    // Lazy-load nodemailer so the dependency is only required when email is
    // actually enabled. Keeps cold starts fast for users not using email.
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user && config.pass ? { auth: { user: config.user, pass: config.pass } } : {}),
    });

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      ...(config.cc.length > 0 ? { cc: config.cc } : {}),
      ...(config.bcc.length > 0 ? { bcc: config.bcc } : {}),
      subject: buildSubject(report),
      text: report.message,
      html: buildHtmlBody(report),
    });
  }
}
