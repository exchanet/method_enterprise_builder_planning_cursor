// JSON reporter for microtask-linter

import type { LineCountResult } from '../analyzers/line-counter.ts';

export interface LinterJsonReport {
  timestamp: string;
  maxLines: number;
  totalFiles: number;
  passed: number;
  failed: number;
  results: LineCountResult[];
}

export function reportToJson(results: LineCountResult[], maxLines: number): string {
  const passed = results.filter((r) => !r.exceedsLimit).length;
  const report: LinterJsonReport = {
    timestamp: new Date().toISOString(),
    maxLines,
    totalFiles: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
  return JSON.stringify(report, null, 2);
}
