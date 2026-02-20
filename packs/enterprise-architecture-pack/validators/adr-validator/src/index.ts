#!/usr/bin/env node
// ADR Validator CLI — entry point
// Usage: node src/index.ts [options] <path-to-adr-dir-or-file>
//
// Options:
//   --strict          Exit 1 on warnings as well as errors (default: exit 1 on errors only)
//   --format=console  Output format: console (default) | json | junit
//   --output=<path>   Write output to file instead of stdout

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { parseAdr } from './parser.ts';
import { runEnterpriseRules } from './rules/enterprise-rules.ts';
import { runComplianceRules } from './rules/compliance-rules.ts';
import { runStructuralRules } from './rules/structural-rules.ts';
import { reportToConsole } from './reporters/console-reporter.ts';
import { reportToJson, reportToJUnit } from './reporters/json-reporter.ts';
import type { RuleViolation } from './rules/enterprise-rules.ts';

export interface ValidationResult {
  filePath: string;
  adrTitle: string;
  violations: RuleViolation[];
}

function collectAdrFiles(targetPath: string): string[] {
  const resolved = resolve(targetPath);
  const stat = statSync(resolved);

  if (stat.isFile()) {
    return extname(resolved) === '.md' ? [resolved] : [];
  }

  return readdirSync(resolved)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(resolved, f));
}

function validateFile(filePath: string): ValidationResult {
  const content = readFileSync(filePath, 'utf-8');
  const adr = parseAdr(content, filePath);

  const violations: RuleViolation[] = [
    ...runStructuralRules(adr),
    ...runEnterpriseRules(adr),
    ...runComplianceRules(adr),
  ];

  return { filePath, adrTitle: adr.title, violations };
}

function parseArgs(args: string[]): {
  strict: boolean;
  format: 'console' | 'json' | 'junit';
  output: string | null;
  target: string;
} {
  const flags = args.filter((a) => a.startsWith('--'));
  const positional = args.filter((a) => !a.startsWith('--'));

  const strict = flags.includes('--strict');
  const formatFlag = flags.find((f) => f.startsWith('--format='));
  const outputFlag = flags.find((f) => f.startsWith('--output='));

  const formatValue = formatFlag?.split('=')[1] ?? 'console';
  const format =
    formatValue === 'json' ? 'json' : formatValue === 'junit' ? 'junit' : 'console';

  return {
    strict,
    format,
    output: outputFlag ? outputFlag.split('=')[1] : null,
    target: positional[0] ?? '.',
  };
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
ADR Validator — Method Enterprise Builder Planning v2.0.0

Usage:
  node src/index.ts [options] <path>

Options:
  --strict           Exit 1 on warnings (default: exit 1 on errors only)
  --format=console   Output format: console | json | junit (default: console)
  --output=<path>    Write output to file

Examples:
  node src/index.ts ./docs/adr/
  node src/index.ts --strict --format=junit --output=reports/adr.xml ./docs/adr/
    `);
    process.exit(0);
  }

  const { strict, format, output, target } = parseArgs(args);

  let files: string[];
  try {
    files = collectAdrFiles(target);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.warn(`No .md files found in: ${target}`);
    process.exit(0);
  }

  const results = files.map(validateFile);

  let outputContent: string;
  if (format === 'json') {
    outputContent = reportToJson(results);
  } else if (format === 'junit') {
    outputContent = reportToJUnit(results);
  } else {
    reportToConsole(results);
    outputContent = '';
  }

  if (output && outputContent) {
    writeFileSync(output, outputContent, 'utf-8');
    console.log(`Report written to: ${output}`);
  } else if (outputContent) {
    console.log(outputContent);
  }

  const hasErrors = results.some((r) => r.violations.some((v) => v.severity === 'error'));
  const hasWarnings = results.some((r) => r.violations.some((v) => v.severity === 'warning'));

  if (hasErrors || (strict && hasWarnings)) {
    process.exit(1);
  }
}

main();
