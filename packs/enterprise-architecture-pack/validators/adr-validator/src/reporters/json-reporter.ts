// JSON reporter — machine-readable output for CI/CD pipelines
// Also generates JUnit XML format for test result integration.

import type { ValidationResult } from '../index.ts';

export interface JsonReport {
  timestamp: string;
  totalAdrs: number;
  passed: number;
  failed: number;
  warned: number;
  results: ValidationResult[];
}

export function reportToJson(results: ValidationResult[]): string {
  const passed = results.filter((r) => r.violations.every((v) => v.severity !== 'error')).length;
  const failed = results.length - passed;
  const warned = results.filter(
    (r) => r.violations.some((v) => v.severity === 'warning') && !r.violations.some((v) => v.severity === 'error'),
  ).length;

  const report: JsonReport = {
    timestamp: new Date().toISOString(),
    totalAdrs: results.length,
    passed,
    failed,
    warned,
    results,
  };

  return JSON.stringify(report, null, 2);
}

export function reportToJUnit(results: ValidationResult[]): string {
  const failed = results.filter((r) => r.violations.some((v) => v.severity === 'error'));
  const totalErrors = results.reduce(
    (sum, r) => sum + r.violations.filter((v) => v.severity === 'error').length,
    0,
  );

  const testCases = results
    .map((r) => {
      const errors = r.violations.filter((v) => v.severity === 'error');
      const warnings = r.violations.filter((v) => v.severity === 'warning');

      const failures = errors
        .map(
          (v) =>
            `      <failure type="${v.ruleId}" message="${escapeXml(v.message)}">${escapeXml(v.hint ?? '')}</failure>`,
        )
        .join('\n');

      const props = warnings
        .map((v) => `        <property name="${v.ruleId}" value="${escapeXml(v.message)}"/>`)
        .join('\n');

      return `    <testcase name="${escapeXml(r.filePath)}" classname="adr-validator" time="0">
${props ? `      <properties>\n${props}\n      </properties>` : ''}
${failures}
    </testcase>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="adr-validator" tests="${results.length}" failures="${failed.length}" errors="${totalErrors}" time="0">
  <testsuite name="Enterprise ADR Validation" tests="${results.length}" failures="${failed.length}">
${testCases}
  </testsuite>
</testsuites>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
