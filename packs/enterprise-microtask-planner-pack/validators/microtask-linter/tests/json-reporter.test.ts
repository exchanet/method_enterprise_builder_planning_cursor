import { describe, it, expect } from 'vitest';
import { reportToJson } from '../src/reporters/json-reporter.ts';
import type { LineCountResult } from '../src/analyzers/line-counter.ts';

describe('Microtask Linter JSON Reporter', () => {
  it('debe generar JSON válido con estructura correcta', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'test.ts',
        breakdown: { total: 30, effective: 25, blank: 3, comment: 2, imports: 0 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('maxLines', 50);
    expect(parsed).toHaveProperty('totalFiles', 1);
    expect(parsed).toHaveProperty('passed', 1);
    expect(parsed).toHaveProperty('failed', 0);
    expect(parsed.results).toHaveLength(1);
  });

  it('debe contar correctamente archivos pasados', () => {
    const results: LineCountResult[] = [
      {
        filePath: '1.ts',
        breakdown: { total: 30, effective: 20, blank: 5, comment: 3, imports: 2 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
      {
        filePath: '2.ts',
        breakdown: { total: 40, effective: 30, blank: 5, comment: 3, imports: 2 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.passed).toBe(2);
    expect(parsed.failed).toBe(0);
  });

  it('debe contar correctamente archivos fallados', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'fail.ts',
        breakdown: { total: 100, effective: 80, blank: 10, comment: 5, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.passed).toBe(0);
    expect(parsed.failed).toBe(1);
  });

  it('debe contar correctamente mix de pasados y fallados', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'pass1.ts',
        breakdown: { total: 30, effective: 25, blank: 3, comment: 2, imports: 0 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
      {
        filePath: 'fail1.ts',
        breakdown: { total: 100, effective: 75, blank: 15, comment: 5, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
      {
        filePath: 'pass2.ts',
        breakdown: { total: 35, effective: 28, blank: 4, comment: 2, imports: 1 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
      {
        filePath: 'fail2.ts',
        breakdown: { total: 90, effective: 70, blank: 12, comment: 5, imports: 3 },
        exceedsLimit: true,
        splitSuggestions: [],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.totalFiles).toBe(4);
    expect(parsed.passed).toBe(2);
    expect(parsed.failed).toBe(2);
  });

  it('debe incluir timestamp ISO válido', () => {
    const results: LineCountResult[] = [];
    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('debe incluir maxLines en el reporte', () => {
    const results: LineCountResult[] = [];
    const output = reportToJson(results, 40);
    const parsed = JSON.parse(output);

    expect(parsed.maxLines).toBe(40);
  });

  it('debe incluir breakdown completo de cada archivo', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'test.ts',
        breakdown: { total: 50, effective: 35, blank: 8, comment: 5, imports: 2 },
        exceedsLimit: false,
        splitSuggestions: [],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.results[0].breakdown).toEqual({
      total: 50,
      effective: 35,
      blank: 8,
      comment: 5,
      imports: 2,
    });
  });

  it('debe incluir splitSuggestions cuando existen', () => {
    const results: LineCountResult[] = [
      {
        filePath: 'large.ts',
        breakdown: { total: 120, effective: 100, blank: 10, comment: 5, imports: 5 },
        exceedsLimit: true,
        splitSuggestions: [
          { name: 'funcA', lineRange: [1, 60], estimatedLines: 50 },
          { name: 'funcB', lineRange: [61, 120], estimatedLines: 50 },
        ],
      },
    ];

    const output = reportToJson(results, 50);
    const parsed = JSON.parse(output);

    expect(parsed.results[0].splitSuggestions).toHaveLength(2);
    expect(parsed.results[0].splitSuggestions[0]).toEqual({
      name: 'funcA',
      lineRange: [1, 60],
      estimatedLines: 50,
    });
  });

  it('debe manejar array vacío de resultados', () => {
    const output = reportToJson([], 50);
    const parsed = JSON.parse(output);

    expect(parsed.totalFiles).toBe(0);
    expect(parsed.passed).toBe(0);
    expect(parsed.failed).toBe(0);
    expect(parsed.results).toEqual([]);
  });
});
