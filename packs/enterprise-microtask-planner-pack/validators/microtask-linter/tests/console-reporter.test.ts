import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportToConsole } from '../src/reporters/console-reporter.ts';
import type { LineCountResult } from '../src/analyzers/line-counter.ts';

describe('Microtask Linter Console Reporter', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('debe mostrar PASS para archivo dentro del límite', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'src/small.ts',
        breakdown: { total: 30, effective: 20, blank: 5, comment: 3, imports: 2 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('✓ src/small.ts — PASS (20 effective lines)'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ALL PASSED ✓'));
  });

  it('debe mostrar FAIL para archivo que excede el límite', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'src/large.ts',
        breakdown: { total: 100, effective: 75, blank: 10, comment: 10, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('✗ src/large.ts — FAIL (75 effective lines > 50)'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('FAILED — split the tasks'),
    );
  });

  it('debe mostrar breakdown para archivos que exceden límite', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'test.ts',
        breakdown: { total: 100, effective: 70, blank: 15, comment: 10, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Breakdown: 100 total | 70 code | 10 comments | 5 imports | 15 blank',
      ),
    );
  });

  it('debe mostrar sugerencias de split cuando están disponibles', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'large.ts',
        breakdown: { total: 150, effective: 120, blank: 15, comment: 10, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [
          { name: 'functionA', lineRange: [10, 60], estimatedLines: 45 },
          { name: 'functionB', lineRange: [61, 100], estimatedLines: 35 },
          { name: 'functionC', lineRange: [101, 150], estimatedLines: 40 },
        ],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Suggested split (3 units)'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('extract: functionA()'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[lines 10–60]'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('~45 effective lines'));
  });

  it('debe contar correctamente violaciones', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'pass.ts',
        breakdown: { total: 30, effective: 25, blank: 3, comment: 2, imports: 0 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
      {
        filePath: 'fail1.ts',
        breakdown: { total: 80, effective: 60, blank: 10, comment: 5, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
      {
        filePath: 'fail2.ts',
        breakdown: { total: 100, effective: 75, blank: 15, comment: 5, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Validated: 3 file(s)  |  Violations: 2  |  Max: 50 lines'),
    );
  });

  it('debe mostrar resultado de split con promedio de líneas', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'test.ts',
        breakdown: { total: 200, effective: 160, blank: 20, comment: 15, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [
          { name: 'fn1', lineRange: [1, 50], estimatedLines: 40 },
          { name: 'fn2', lineRange: [51, 100], estimatedLines: 40 },
          { name: 'fn3', lineRange: [101, 150], estimatedLines: 40 },
          { name: 'fn4', lineRange: [151, 200], estimatedLines: 40 },
        ],
      },
    ];

    reportToConsole(results, 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Result: 4 micro-tasks of ~40 lines each'),
    );
  });

  it('debe manejar array vacío de resultados', () => {
    reportToConsole([], 50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Validated: 0 file(s)  |  Violations: 0'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ALL PASSED ✓'));
  });
});
