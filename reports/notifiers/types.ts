import type { FullConfig, Suite } from '@playwright/test/reporter';

export type RunStatus = 'passed' | 'failed' | 'timedout' | 'interrupted';

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  /** First N failed/flaky test titles. Capped to keep messages digestible. */
  failedTests: string[];
}

export interface CliContext {
  envName: string;
  project: string;
  target: string;
  grep: string;
  workers: string;
  retries: string;
}

/**
 * Normalized, channel-agnostic snapshot of a finished Playwright run.
 * Each notifier formats this into its native shape (text, blocks, HTML, ...).
 */
export interface RunReport {
  status: RunStatus;
  durationMs: number;
  summary: RunSummary;
  context: CliContext;
  /** Pre-rendered plain-text body (Google-Chat-style `*bold*`). Channels may use as-is or reformat. */
  message: string;
  /** Source for richer formatters that don't want to parse `message`. */
  config: FullConfig;
  suite: Suite;
}

export interface Notifier {
  readonly name: string;
  /** Cheap, synchronous check — only the orchestrator calls this. */
  isEnabled(): boolean;
  send(report: RunReport): Promise<void>;
}
