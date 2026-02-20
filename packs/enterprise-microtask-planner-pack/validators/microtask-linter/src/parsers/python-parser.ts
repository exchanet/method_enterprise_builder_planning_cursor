// Python line classifier

import type { ClassifiedLine, LineType } from './typescript-parser.ts';

export function classifyPython(source: string): ClassifiedLine[] {
  const lines = source.split('\n');
  const result: ClassifiedLine[] = [];
  let inDocstring = false;
  let docstringQuote = '';

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const lineNumber = i + 1;

    if (trimmed === '') {
      result.push({ lineNumber, raw, type: 'blank' });
      continue;
    }

    // Docstring tracking (triple-quote strings used as block comments)
    if (inDocstring) {
      if (trimmed.includes(docstringQuote)) inDocstring = false;
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      docstringQuote = trimmed.startsWith('"""') ? '"""' : "'''";
      const closeIdx = trimmed.indexOf(docstringQuote, 3);
      if (closeIdx === -1) inDocstring = true; // multi-line docstring
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    // Single-line comment
    if (trimmed.startsWith('#')) {
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    // Import statements
    if (/^import\s/.test(trimmed) || /^from\s+\S+\s+import\s/.test(trimmed)) {
      result.push({ lineNumber, raw, type: 'import' });
      continue;
    }

    result.push({ lineNumber, raw, type: 'code' });
  }

  return result;
}
