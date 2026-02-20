// TypeScript/JavaScript line classifier
// Returns an array of line types for each line in the source.

export type LineType = 'code' | 'blank' | 'comment' | 'import';

export interface ClassifiedLine {
  lineNumber: number;
  raw: string;
  type: LineType;
}

export function classifyTypescript(source: string): ClassifiedLine[] {
  const lines = source.split('\n');
  const result: ClassifiedLine[] = [];
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const lineNumber = i + 1;

    if (trimmed === '') {
      result.push({ lineNumber, raw, type: 'blank' });
      continue;
    }

    // Block comment tracking
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false;
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    if (trimmed.startsWith('/*') || trimmed.startsWith('/**')) {
      inBlockComment = !trimmed.includes('*/');
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    // Single-line comment
    if (trimmed.startsWith('//')) {
      result.push({ lineNumber, raw, type: 'comment' });
      continue;
    }

    // Import / export-from / require
    if (
      /^import\s/.test(trimmed) ||
      /^export\s+\{/.test(trimmed) ||
      /^export\s+\*\s+from/.test(trimmed) ||
      /^const\s+\w+\s*=\s*require\(/.test(trimmed)
    ) {
      result.push({ lineNumber, raw, type: 'import' });
      continue;
    }

    result.push({ lineNumber, raw, type: 'code' });
  }

  return result;
}
