import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportToConsole } from '../src/reporters/console-reporter.ts';
import type { ValidationResult } from '../src/index.ts';

describe('Console Reporter', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('debe mostrar PASS para ADR sin violaciones', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'docs/adr/adr-001.md',
        adrTitle: 'ADR-001: Use PostgreSQL',
        violations: [],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('✓ docs/adr/adr-001.md — PASS'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ALL PASSED ✓'));
  });

  it('debe mostrar FAIL para ADR con errores', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'docs/adr/adr-002.md',
        adrTitle: 'ADR-002: Invalid',
        violations: [
          {
            ruleId: 'ADR-STR-001',
            severity: 'error',
            message: 'Missing required sections',
            hint: 'Add Context and Decision sections',
          },
        ],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✗'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('FAIL'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ADR-STR-001'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('FAILED'));
  });

  it('debe mostrar WARN para ADR con solo warnings', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'docs/adr/adr-003.md',
        adrTitle: 'ADR-003: Brief Context',
        violations: [
          {
            ruleId: 'ADR-STR-003',
            severity: 'warning',
            message: 'Context section too brief',
            hint: 'Add more detail',
          },
        ],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('WARN'));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('PASSED with warnings'),
    );
  });

  it('debe contar correctamente múltiples ADRs', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'adr-001.md',
        adrTitle: 'Valid',
        violations: [],
      },
      {
        filePath: 'adr-002.md',
        adrTitle: 'Has Error',
        violations: [
          { ruleId: 'TEST', severity: 'error', message: 'Error', hint: null },
        ],
      },
      {
        filePath: 'adr-003.md',
        adrTitle: 'Has Warning',
        violations: [
          { ruleId: 'TEST', severity: 'warning', message: 'Warn', hint: null },
        ],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Validated: 3 ADR(s)'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Errors:    1'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warnings:  1'));
  });

  it('debe mostrar hint cuando está disponible', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'test.md',
        adrTitle: 'Test',
        violations: [
          {
            ruleId: 'TEST',
            severity: 'error',
            message: 'Test message',
            hint: 'Test hint',
          },
        ],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('→ Test hint'));
  });

  it('debe manejar ADRs con múltiples violaciones', () => {
    const results: ValidationResult[] = [
      {
        filePath: 'multi.md',
        adrTitle: 'Multi violations',
        violations: [
          { ruleId: 'ERR-1', severity: 'error', message: 'Error 1', hint: null },
          { ruleId: 'ERR-2', severity: 'error', message: 'Error 2', hint: null },
          { ruleId: 'WARN-1', severity: 'warning', message: 'Warning 1', hint: null },
        ],
      },
    ];

    reportToConsole(results);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR-1'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ERR-2'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('WARN-1'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Errors:    2'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warnings:  1'));
  });

  it('debe manejar array vacío de resultados', () => {
    reportToConsole([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Validated: 0 ADR(s)'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ALL PASSED ✓'));
  });
});
