import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter';

import { dispatchNotifications, type RunReport } from './notifiers';
import type { CliContext, RunSummary } from './notifiers/types';

function detectTargetType(project: string, target: string): 'API' | 'UI' {
  const projectValue = project.toLowerCase();
  const targetValue = target.toLowerCase();
  if (projectValue.includes('api') || targetValue.includes('tests/api/')) {
    return 'API';
  }
  return 'UI';
}

function formatTargetLabel(_project: string, target: string, grep: string): string {
  return target || grep || 'tests';
}

function inferProjectLabel(target: string, grep: string): string {
  const resolvedTarget = (target || grep || '').toLowerCase();
  if (resolvedTarget.includes('tests/api/')) {
    return 'API - Full Suite';
  }
  if (resolvedTarget.includes('tests/ui/')) {
    return 'UI Projects (auto-selected by Playwright)';
  }
  return 'Auto-selected by Playwright';
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function parseOption(args: string[], name: string): string {
  const index = args.indexOf(name);
  if (index === -1) return '';
  return args[index + 1] ?? '';
}

function parseTarget(args: string[]): string {
  const testIndex = args.indexOf('test');
  if (testIndex === -1) return '';

  for (let index = testIndex + 1; index < args.length; index += 1) {
    const current = args[index];
    if (!current?.startsWith('-')) {
      return current ?? '';
    }
    if (['--project', '--grep', '--workers', '--retries', '--config'].includes(current)) {
      index += 1;
    }
  }
  return '';
}

function buildCliContext(config: FullConfig): CliContext {
  const args = process.argv.slice(2);
  const env = process.env;

  const explicitProject =
    env['PLAYWRIGHT_NOTIFY_PROJECT'] ||
    env['PLAYWRIGHT_GCHAT_PROJECT'] ||
    parseOption(args, '--project');
  const resolvedTarget =
    env['PLAYWRIGHT_NOTIFY_TARGET'] ||
    env['PLAYWRIGHT_GCHAT_TARGET'] ||
    parseTarget(args) ||
    config.rootDir ||
    'tests';
  const resolvedGrep =
    env['PLAYWRIGHT_NOTIFY_GREP'] ||
    env['PLAYWRIGHT_GCHAT_GREP'] ||
    parseOption(args, '--grep');

  return {
    envName: env['PLAYWRIGHT_NOTIFY_ENV'] || env['PLAYWRIGHT_GCHAT_ENV'] || env['ENV'] || 'uat',
    project: explicitProject || inferProjectLabel(resolvedTarget, resolvedGrep),
    target: resolvedTarget,
    grep: resolvedGrep,
    workers:
      env['PLAYWRIGHT_NOTIFY_WORKERS'] ||
      env['PLAYWRIGHT_GCHAT_WORKERS'] ||
      parseOption(args, '--workers') ||
      String(config.workers),
    retries:
      env['PLAYWRIGHT_NOTIFY_RETRIES'] ||
      env['PLAYWRIGHT_GCHAT_RETRIES'] ||
      parseOption(args, '--retries') ||
      String(config.projects[0]?.retries ?? 0),
  };
}

function formatTitlePath(test: TestCase): string {
  return test
    .titlePath()
    .filter((part) => part && !part.endsWith('.spec.ts'))
    .join(' > ');
}

function buildSummary(suite: Suite): RunSummary {
  const summary: RunSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    failedTests: [],
  };

  for (const test of suite.allTests()) {
    summary.total += 1;
    switch (test.outcome()) {
      case 'expected':
        summary.passed += 1;
        break;
      case 'skipped':
        summary.skipped += 1;
        break;
      case 'flaky':
        summary.flaky += 1;
        if (summary.failedTests.length < 4) {
          summary.failedTests.push(formatTitlePath(test));
        }
        break;
      case 'unexpected':
        summary.failed += 1;
        if (summary.failedTests.length < 4) {
          summary.failedTests.push(formatTitlePath(test));
        }
        break;
      default:
        break;
    }
  }

  return summary;
}

function formatPassRate(summary: RunSummary): string {
  if (summary.total === 0) return '0.00%';
  return `${((summary.passed / summary.total) * 100).toFixed(2)}%`;
}

const platform = os.platform();

let osName = '';
if (platform === 'darwin') {
  osName = 'macOS';
} else if (platform === 'win32') {
  osName = 'Windows';
} else if (platform === 'linux') {
  osName = 'Linux';
}
else {
  osName = 'Unknown';
}

const machineName = os.hostname();

function buildMessage(result: FullResult, context: CliContext, summary: RunSummary): string {
  const statusIcon = result.status === 'passed' ? '✅' : '❌';
  const label = result.status === 'passed' ? 'Passed' : 'Failed';
  const suiteType = detectTargetType(context.project, context.target || context.grep || 'tests');
  const targetLabel = formatTargetLabel(context.project, context.target, context.grep);
  const envLabel = context.envName.toUpperCase();
  const runOrigin = process.env['CI'] ? 'CI' : 'Local';

  const lines = [
    `${statusIcon} ${runOrigin} CI ${label}`,
    `Suite Type: *${suiteType}*`,
    `💻 Machine: ${osName}`,
    `🖥️ Machine Name: ${machineName}`,
    `🌍 *Environment:* ${envLabel}`,
    `🧩 Project: ${context.project}`,
    `🎯 *Target:* ${targetLabel}`,
    '',
    '⚙️ Execution',
    `• Workers: ${context.workers}`,
    `• Retries: ${context.retries}`,
    `• Duration: ${formatDuration(result.duration)}`,
    '',
    '📊 Test Summary',
    `• Total: ${summary.total}`,
    `• ✅ Passed: ${summary.passed}`,
    `• ❌ Failed: ${summary.failed}`,
    `• ⏭️ Skipped: ${summary.skipped}`,
    `• ⚠️ Flaky: ${summary.flaky}`,
    `*Pass Rate:* *${formatPassRate(summary)}*`,
  ];

  if (summary.failedTests.length > 0) {
    lines.push('', '🔥 First Failed Tests');
    summary.failedTests.forEach((failedTest, index) => {
      lines.push(`${index + 1}. ${failedTest}`);
    });
  }

  return lines.join('\n');
}

export default class CustomReporter implements Reporter {
  private config?: FullConfig;
  private suite?: Suite;

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.suite = suite;
  }

  async onEnd(result: FullResult): Promise<void> {
    if (!this.config || !this.suite) {
      console.log('Notifications skipped: run context unavailable.');
      return;
    }

    const context = buildCliContext(this.config);
    const summary = buildSummary(this.suite);

    // Skip notifications for runs that didn't actually execute any tests:
    //   - `--list` / `--dry-run` enumerate but don't run the tests
    //   - empty filter or no tests in suite (`summary.total === 0`)
    //   - everything was skipped (no real results to report)
    // Without this guard a dry-run pings Slack/Google Chat/Email with a 0/0 report.
    const isListing = process.argv.includes('--list') || process.argv.includes('--dry-run');
    const allSkipped =
      summary.total > 0 &&
      summary.passed === 0 &&
      summary.failed === 0 &&
      summary.flaky === 0;
    if (summary.total === 0 || isListing || allSkipped) {
      console.log('Notifications skipped: no tests executed.');
      return;
    }

    const message = buildMessage(result, context, summary);

    const report: RunReport = {
      status: result.status,
      durationMs: result.duration,
      summary,
      context,
      message,
      config: this.config,
      suite: this.suite,
    };

    const logs = await dispatchNotifications(report);
    for (const line of logs) {
      console.log(line);
    }
  }
}

export function ensureReporterArtifacts(): void {
  const reportDir = path.resolve(process.cwd(), 'playwright-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
}

ensureReporterArtifacts();
