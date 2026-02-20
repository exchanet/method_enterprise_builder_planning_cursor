#!/usr/bin/env node
// Microtask Linter CLI — validates that code files comply with the ≤N effective lines rule.
// "Effective lines" = total lines − blank lines − comment-only lines − import lines.
//
// Usage:
//   node src/index.ts --task=<file>                     Validate a single file
//   node src/index.ts --dir=<directory>                 Validate all .ts/.py files in a dir
//   node src/index.ts --max-lines=40 --task=<file>      Custom line limit
//   node src/index.ts --format=json --task=<file>       JSON output for CI

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { countEffectiveLines } from './analyzers/line-counter.ts';
import { reportToConsole } from './reporters/console-reporter.ts';
import { reportToJson } from './reporters/json-reporter.ts';

const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.py'];

function collectFiles(target: string, recursive: boolean): string[] {
  const resolved = resolve(target);
  const stat = statSync(resolved);

  if (stat.isFile()) {
    return SUPPORTED_EXTENSIONS.includes(extname(resolved)) ? [resolved] : [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(resolved)) {
    const fullPath = join(resolved, entry);
    const entryStat = statSync(fullPath);
    if (entryStat.isDirectory() && recursive) {
      files.push(...collectFiles(fullPath, recursive));
    } else if (SUPPORTED_EXTENSIONS.includes(extname(fullPath))) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseArgs(args: string[]): {
  task: string | null;
  dir: string | null;
  maxLines: number;
  format: 'console' | 'json';
  recursive: boolean;
} {
  const get = (prefix: string) => {
    const flag = args.find((a) => a.startsWith(prefix));
    return flag ? flag.slice(prefix.length) : null;
  };

  return {
    task: get('--task='),
    dir: get('--dir='),
    maxLines: parseInt(get('--max-lines=') ?? '50', 10),
    format: get('--format=') === 'json' ? 'json' : 'console',
    recursive: args.includes('--recursive') || args.includes('-r'),
  };
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Microtask Linter — Method Enterprise Builder Planning v2.0.0
Validates that code files comply with the ≤N effective lines micro-task rule.
"Effective lines" = code lines (excludes blank, comment, and import lines).

Usage:
  node src/index.ts --task=<file>              Validate a single file
  node src/index.ts --dir=<directory>          Validate all supported files in directory
  node src/index.ts --dir=<dir> --recursive    Include subdirectories
  node src/index.ts --max-lines=40 --task=...  Custom line limit (default: 50)
  node src/index.ts --format=json ...          JSON output

Supported languages: TypeScript (.ts, .tsx), JavaScript (.js, .mjs), Python (.py)
    `);
    process.exit(0);
  }

  const { task, dir, maxLines, format, recursive } = parseArgs(args);

  if (!task && !dir) {
    console.error('Error: provide --task=<file> or --dir=<directory>');
    process.exit(1);
  }

  const target = task ?? dir!;
  let files: string[];

  try {
    files = collectFiles(target, recursive || !!dir);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.warn(`No supported files found in: ${target}`);
    process.exit(0);
  }

  const results = files.map((f) => {
    const source = readFileSync(f, 'utf-8');
    return countEffectiveLines(source, f, maxLines);
  });

  if (format === 'json') {
    console.log(reportToJson(results, maxLines));
  } else {
    reportToConsole(results, maxLines);
  }

  const hasViolations = results.some((r) => r.exceedsLimit);
  process.exit(hasViolations ? 1 : 0);
}

main();
