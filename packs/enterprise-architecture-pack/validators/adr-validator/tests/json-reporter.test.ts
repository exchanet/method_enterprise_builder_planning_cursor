import { describe, it, expect } from 'vitest';
import { reportToJson, reportToJUnit } from '../src/reporters/json-reporter.ts';
import type { ValidationResult } from '../src/index.ts';

describe('JSON Reporter', () => {
  describe('reportToJson', () => {
    it('debe generar JSON válido con estructura correcta', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'test.md',
          adrTitle: 'Test ADR',
          violations: [],
        },
      ];

      const output = reportToJson(results);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('totalAdrs', 1);
      expect(parsed).toHaveProperty('passed', 1);
      expect(parsed).toHaveProperty('failed', 0);
      expect(parsed).toHaveProperty('warned', 0);
      expect(parsed.results).toHaveLength(1);
    });

    it('debe contar correctamente ADRs pasados', () => {
      const results: ValidationResult[] = [
        { filePath: '1.md', adrTitle: 'One', violations: [] },
        {
          filePath: '2.md',
          adrTitle: 'Two',
          violations: [{ ruleId: 'W', severity: 'warning', message: 'w', hint: null }],
        },
      ];

      const output = reportToJson(results);
      const parsed = JSON.parse(output);

      expect(parsed.passed).toBe(2); // Both pass (warnings don't fail)
      expect(parsed.failed).toBe(0);
    });

    it('debe contar correctamente ADRs fallados', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'fail.md',
          adrTitle: 'Fail',
          violations: [{ ruleId: 'E', severity: 'error', message: 'e', hint: null }],
        },
      ];

      const output = reportToJson(results);
      const parsed = JSON.parse(output);

      expect(parsed.passed).toBe(0);
      expect(parsed.failed).toBe(1);
    });

    it('debe contar correctamente ADRs con warnings', () => {
      const results: ValidationResult[] = [
        { filePath: '1.md', adrTitle: 'Pass', violations: [] },
        {
          filePath: '2.md',
          adrTitle: 'Warn',
          violations: [{ ruleId: 'W', severity: 'warning', message: 'w', hint: null }],
        },
        {
          filePath: '3.md',
          adrTitle: 'Fail',
          violations: [{ ruleId: 'E', severity: 'error', message: 'e', hint: null }],
        },
      ];

      const output = reportToJson(results);
      const parsed = JSON.parse(output);

      expect(parsed.warned).toBe(1); // Only ADR with warning but no error
    });

    it('debe incluir timestamp ISO válido', () => {
      const results: ValidationResult[] = [];
      const output = reportToJson(results);
      const parsed = JSON.parse(output);

      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('reportToJUnit', () => {
    it('debe generar XML válido con estructura JUnit', () => {
      const results: ValidationResult[] = [
        { filePath: 'test.md', adrTitle: 'Test', violations: [] },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(output).toContain('<testsuites');
      expect(output).toContain('<testsuite');
      expect(output).toContain('<testcase');
      expect(output).toContain('</testsuites>');
    });

    it('debe marcar testcase con failures para errores', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'fail.md',
          adrTitle: 'Fail',
          violations: [
            {
              ruleId: 'TEST-ERROR',
              severity: 'error',
              message: 'Test error message',
              hint: 'Fix hint',
            },
          ],
        },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('<failure');
      expect(output).toContain('type="TEST-ERROR"');
      expect(output).toContain('Test error message');
      expect(output).toContain('Fix hint');
    });

    it('debe marcar testcase con properties para warnings', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'warn.md',
          adrTitle: 'Warn',
          violations: [
            {
              ruleId: 'TEST-WARN',
              severity: 'warning',
              message: 'Test warning',
              hint: null,
            },
          ],
        },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('<properties>');
      expect(output).toContain('<property');
      expect(output).toContain('name="TEST-WARN"');
      expect(output).toContain('Test warning');
    });

    it('debe contar correctamente tests y failures', () => {
      const results: ValidationResult[] = [
        { filePath: '1.md', adrTitle: 'Pass', violations: [] },
        {
          filePath: '2.md',
          adrTitle: 'Fail',
          violations: [{ ruleId: 'E', severity: 'error', message: 'e', hint: null }],
        },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('tests="2"');
      expect(output).toContain('failures="1"');
    });

    it('debe escapar caracteres XML especiales', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'test.md',
          adrTitle: 'Test',
          violations: [
            {
              ruleId: 'TEST',
              severity: 'error',
              message: 'Message with <tags> & "quotes"',
              hint: "Hint with 'apostrophes'",
            },
          ],
        },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('&lt;tags&gt;');
      expect(output).toContain('&amp;');
      expect(output).toContain('&quot;');
      expect(output).toContain('&apos;');
      expect(output).not.toContain('<tags>');
    });

    it('debe manejar múltiples violaciones en un ADR', () => {
      const results: ValidationResult[] = [
        {
          filePath: 'multi.md',
          adrTitle: 'Multi',
          violations: [
            { ruleId: 'E1', severity: 'error', message: 'Error 1', hint: null },
            { ruleId: 'E2', severity: 'error', message: 'Error 2', hint: null },
          ],
        },
      ];

      const output = reportToJUnit(results);

      expect(output).toContain('type="E1"');
      expect(output).toContain('type="E2"');
      expect(output).toContain('errors="2"');
    });

    it('debe manejar array vacío de resultados', () => {
      const output = reportToJUnit([]);

      expect(output).toContain('tests="0"');
      expect(output).toContain('failures="0"');
      expect(output).toContain('errors="0"');
    });
  });
});
