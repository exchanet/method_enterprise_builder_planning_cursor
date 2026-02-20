import { describe, it, expect } from 'vitest';
import { countEffectiveLines, detectLanguage } from '../src/analyzers/line-counter.ts';
import { classifyTypescript } from '../src/parsers/typescript-parser.ts';
import { classifyPython } from '../src/parsers/python-parser.ts';

// ─── Language detection ────────────────────────────────────────────────────

describe('detectLanguage()', () => {
  it('detects TypeScript files', () => {
    expect(detectLanguage('src/money.ts')).toBe('typescript');
    expect(detectLanguage('src/component.tsx')).toBe('typescript');
  });

  it('detects JavaScript files', () => {
    expect(detectLanguage('src/utils.js')).toBe('javascript');
    expect(detectLanguage('module.mjs')).toBe('javascript');
  });

  it('detects Python files', () => {
    expect(detectLanguage('service.py')).toBe('python');
  });

  it('returns unknown for unsupported files', () => {
    expect(detectLanguage('schema.sql')).toBe('unknown');
  });
});

// ─── TypeScript parser ─────────────────────────────────────────────────────

describe('classifyTypescript()', () => {
  it('classifies blank lines', () => {
    const result = classifyTypescript('\n\n');
    expect(result.every((l) => l.type === 'blank')).toBe(true);
  });

  it('classifies single-line comments', () => {
    const lines = classifyTypescript('// This is a comment\n');
    expect(lines[0].type).toBe('comment');
  });

  it('classifies block comments', () => {
    const src = '/* start\n * middle\n */\n';
    const lines = classifyTypescript(src);
    expect(lines.every((l) => l.type === 'blank' || l.type === 'comment')).toBe(true);
  });

  it('classifies import statements', () => {
    const lines = classifyTypescript("import { Foo } from './foo.ts';\n");
    expect(lines[0].type).toBe('import');
  });

  it('classifies actual code', () => {
    const lines = classifyTypescript('const x = 42;\n');
    expect(lines[0].type).toBe('code');
  });
});

// ─── Python parser ─────────────────────────────────────────────────────────

describe('classifyPython()', () => {
  it('classifies hash comments', () => {
    const lines = classifyPython('# comment\n');
    expect(lines[0].type).toBe('comment');
  });

  it('classifies triple-quote docstrings as comments', () => {
    const src = '"""\nThis is a docstring.\n"""\n';
    const lines = classifyPython(src);
    expect(lines.every((l) => l.type === 'comment' || l.type === 'blank')).toBe(true);
  });

  it('classifies import statements', () => {
    const lines = classifyPython('from pathlib import Path\n');
    expect(lines[0].type).toBe('import');
  });

  it('classifies code lines', () => {
    const lines = classifyPython('x = 42\n');
    expect(lines[0].type).toBe('code');
  });
});

// ─── Effective line counting ───────────────────────────────────────────────

// Valid micro-task: 38 effective lines (matches banking-walkthrough PAY-DOM-001)
const VALID_MONEY_TS = `
// Money value object
import type { Currency } from './types.ts';

export class Money {
  private constructor(
    private readonly _amountCents: bigint,
    private readonly _currency: Currency,
  ) {}

  static of(amount: number, currency: Currency): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(\`Invalid amount: \${amount}\`);
    }
    if (Math.round(amount * 100) / 100 !== amount) {
      throw new Error(\`Amount must have at most 2 decimal places: \${amount}\`);
    }
    return new Money(BigInt(Math.round(amount * 100)), currency);
  }

  get amount(): number { return Number(this._amountCents) / 100; }
  get currency(): Currency { return this._currency; }
  get amountInCents(): bigint { return this._amountCents; }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amountCents + other._amountCents, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this._amountCents - other._amountCents;
    if (result < 0n) throw new Error('Subtraction result cannot be negative');
    return new Money(result, this._currency);
  }

  equals(other: Money): boolean {
    return this._amountCents === other._amountCents && this._currency === other._currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(\`Currency mismatch: \${this._currency} vs \${other._currency}\`);
    }
  }
}
`.trim();

// Invalid: over 50 effective lines (includes lots of code logic)
const INVALID_LARGE_TS = Array.from({ length: 70 }, (_, i) => `const var${i} = ${i};`).join('\n');

describe('countEffectiveLines()', () => {
  it('passes a file within the 50-line limit', () => {
    const result = countEffectiveLines(VALID_MONEY_TS, 'money.ts', 50);
    expect(result.breakdown.effective).toBeLessThanOrEqual(50);
    expect(result.exceedsLimit).toBe(false);
  });

  it('fails a file exceeding the limit', () => {
    const result = countEffectiveLines(INVALID_LARGE_TS, 'large.ts', 50);
    expect(result.exceedsLimit).toBe(true);
    expect(result.breakdown.effective).toBeGreaterThan(50);
  });

  it('does not count blank lines as effective', () => {
    const src = 'const a = 1;\n\n\nconst b = 2;\n';
    const result = countEffectiveLines(src, 'test.ts', 50);
    expect(result.breakdown.blank).toBe(3);
    expect(result.breakdown.effective).toBe(2);
  });

  it('does not count comment lines as effective', () => {
    const src = '// comment 1\n// comment 2\nconst x = 1;\n';
    const result = countEffectiveLines(src, 'test.ts', 50);
    expect(result.breakdown.comment).toBe(2);
    expect(result.breakdown.effective).toBe(1);
  });

  it('does not count import lines as effective', () => {
    const src = "import { foo } from './foo.ts';\nconst x = foo();\n";
    const result = countEffectiveLines(src, 'test.ts', 50);
    expect(result.breakdown.imports).toBe(1);
    expect(result.breakdown.effective).toBe(1);
  });

  it('generates split suggestions when limit exceeded', () => {
    const result = countEffectiveLines(INVALID_LARGE_TS, 'large.ts', 50);
    expect(result.splitSuggestions.length).toBeGreaterThan(0);
    for (const s of result.splitSuggestions) {
      expect(s.estimatedLines).toBeGreaterThan(0);
      expect(s.lineRange[0]).toBeLessThanOrEqual(s.lineRange[1]);
    }
  });

  it('works with Python files', () => {
    const src = '# comment\nimport os\n\ndef foo():\n    return 42\n';
    const result = countEffectiveLines(src, 'service.py', 50);
    expect(result.language).toBe('python');
    expect(result.breakdown.comment).toBe(1);
    expect(result.breakdown.imports).toBe(1);
    expect(result.breakdown.effective).toBe(2); // def + return
    expect(result.exceedsLimit).toBe(false);
  });
});
