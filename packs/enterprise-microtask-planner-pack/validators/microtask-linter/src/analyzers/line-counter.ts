// Effective line counter — the core logic of the microtask linter
// "Effective lines" = lines of actual code (excludes blank, comment, import lines).

import { classifyTypescript, type ClassifiedLine } from '../parsers/typescript-parser.ts';
import { classifyPython } from '../parsers/python-parser.ts';

export type Language = 'typescript' | 'javascript' | 'python' | 'unknown';

export interface LineBreakdown {
  total: number;
  effective: number;
  blank: number;
  comment: number;
  imports: number;
}

export interface SplitSuggestion {
  name: string;
  lineRange: [number, number];
  estimatedLines: number;
}

export interface LineCountResult {
  filePath: string;
  language: Language;
  breakdown: LineBreakdown;
  exceedsLimit: boolean;
  splitSuggestions: SplitSuggestion[];
}

export function detectLanguage(filePath: string): Language {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'typescript';
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.cjs')) return 'javascript';
  if (filePath.endsWith('.py')) return 'python';
  return 'unknown';
}

export function countEffectiveLines(
  source: string,
  filePath: string,
  maxLines: number,
): LineCountResult {
  const language = detectLanguage(filePath);
  let classified: ClassifiedLine[];

  if (language === 'typescript' || language === 'javascript') {
    classified = classifyTypescript(source);
  } else if (language === 'python') {
    classified = classifyPython(source);
  } else {
    // Fallback: count non-blank, non-comment lines via simple heuristic
    classified = source.split('\n').map((raw, i) => ({
      lineNumber: i + 1,
      raw,
      type: raw.trim() === '' ? 'blank' : raw.trim().startsWith('#') || raw.trim().startsWith('//') ? 'comment' : 'code',
    }));
  }

  const breakdown: LineBreakdown = {
    total: classified.length,
    effective: classified.filter((l) => l.type === 'code').length,
    blank: classified.filter((l) => l.type === 'blank').length,
    comment: classified.filter((l) => l.type === 'comment').length,
    imports: classified.filter((l) => l.type === 'import').length,
  };

  const exceedsLimit = breakdown.effective > maxLines;
  const splitSuggestions = exceedsLimit
    ? generateSplitSuggestions(classified, maxLines)
    : [];

  return { filePath, language, breakdown, exceedsLimit, splitSuggestions };
}

function generateSplitSuggestions(lines: ClassifiedLine[], maxLines: number): SplitSuggestion[] {
  const codeLines = lines.filter((l) => l.type === 'code');
  const suggestions: SplitSuggestion[] = [];

  // Detect function/class/method boundaries as natural split points
  const boundaryPattern = /^(export\s+)?(async\s+)?function\s+\w+|^(export\s+)?class\s+\w+|^\s+(async\s+)?\w+\s*\([^)]*\)\s*[:{]/;
  const boundaries: number[] = [];

  for (const line of lines) {
    if (line.type === 'code' && boundaryPattern.test(line.raw)) {
      boundaries.push(line.lineNumber);
    }
  }

  if (boundaries.length <= 1) {
    // No clear boundaries: suggest equal splits
    const chunkSize = Math.ceil(codeLines.length / Math.ceil(codeLines.length / maxLines));
    for (let i = 0; i < codeLines.length; i += chunkSize) {
      const chunk = codeLines.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;
      suggestions.push({
        name: `extracted-unit-${suggestions.length + 1}`,
        lineRange: [chunk[0].lineNumber, chunk[chunk.length - 1].lineNumber],
        estimatedLines: chunk.length,
      });
    }
    return suggestions;
  }

  // Build chunks between detected boundaries
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end = i < boundaries.length - 1 ? boundaries[i + 1] - 1 : lines.length;
    const chunkCodeLines = lines
      .filter((l) => l.lineNumber >= start && l.lineNumber <= end && l.type === 'code')
      .length;

    if (chunkCodeLines > 0) {
      suggestions.push({
        name: `unit-${i + 1}`,
        lineRange: [start, end],
        estimatedLines: chunkCodeLines,
      });
    }
  }

  return suggestions;
}
