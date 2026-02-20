// Console reporter — human-readable output for terminal/local use

import type { ValidationResult } from '../index.ts';

const ICONS = { error: '✗', warning: '⚠', info: 'ℹ', pass: '✓' } as const;

export function reportToConsole(results: ValidationResult[]): void {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const errors = result.violations.filter((v) => v.severity === 'error');
    const warnings = result.violations.filter((v) => v.severity === 'warning');
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (result.violations.length === 0) {
      console.log(`${ICONS.pass} ${result.filePath} — PASS`);
      continue;
    }

    const status = errors.length > 0 ? 'FAIL' : 'WARN';
    console.log(`\n${errors.length > 0 ? ICONS.error : ICONS.warning} ${result.filePath} — ${status}`);
    console.log(`  Title: ${result.adrTitle}`);

    for (const v of result.violations) {
      const icon = v.severity === 'error' ? ICONS.error : ICONS.warning;
      console.log(`  ${icon} [${v.ruleId}] ${v.message}`);
      if (v.hint) {
        console.log(`       → ${v.hint}`);
      }
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`Validated: ${results.length} ADR(s)`);
  console.log(`Errors:    ${totalErrors}`);
  console.log(`Warnings:  ${totalWarnings}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('Status:    ALL PASSED ✓');
  } else if (totalErrors === 0) {
    console.log('Status:    PASSED with warnings');
  } else {
    console.log('Status:    FAILED — fix errors before marking ADR as Accepted');
  }
}
