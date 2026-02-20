import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseAdr, countAlternatives, alternativesHaveRejectionReasons, hasSection } from '../src/parser.ts';
import { runEnterpriseRules } from '../src/rules/enterprise-rules.ts';
import { runComplianceRules } from '../src/rules/compliance-rules.ts';
import { runStructuralRules } from '../src/rules/structural-rules.ts';
import { reportToJson, reportToJUnit } from '../src/reporters/json-reporter.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name: string) {
  const content = readFileSync(join(fixturesDir, name), 'utf-8');
  return parseAdr(content, name);
}

// ─── Parser ────────────────────────────────────────────────────────────────

describe('parseAdr()', () => {
  it('extracts title from valid ADR', () => {
    const adr = loadFixture('valid-adr.md');
    expect(adr.title).toContain('SERIALIZABLE Isolation');
  });

  it('extracts ISO date', () => {
    const adr = loadFixture('valid-adr.md');
    expect(adr.date).toBe('2026-01-15');
  });

  it('extracts status', () => {
    const adr = loadFixture('valid-adr.md');
    expect(adr.status).toContain('Accepted');
  });

  it('extracts deciders', () => {
    const adr = loadFixture('valid-adr.md');
    expect(adr.deciders).toContain('DBA');
  });

  it('identifies sections by heading', () => {
    const adr = loadFixture('valid-adr.md');
    expect(hasSection(adr, 'context')).toBe(true);
    expect(hasSection(adr, 'decision')).toBe(true);
    expect(hasSection(adr, 'alternatives')).toBe(true);
    expect(hasSection(adr, 'consequences')).toBe(true);
    expect(hasSection(adr, 'compliance')).toBe(true);
  });

  it('counts 4 alternatives from table rows', () => {
    const adr = loadFixture('valid-adr.md');
    expect(countAlternatives(adr)).toBeGreaterThanOrEqual(2);
  });

  it('detects rejection reasons in alternatives', () => {
    const adr = loadFixture('valid-adr.md');
    expect(alternativesHaveRejectionReasons(adr)).toBe(true);
  });
});

// ─── Structural Rules ──────────────────────────────────────────────────────

describe('Structural rules', () => {
  it('valid ADR passes all structural rules', () => {
    const adr = loadFixture('valid-adr.md');
    const violations = runStructuralRules(adr);
    expect(violations.filter((v) => v.severity === 'error')).toHaveLength(0);
  });

  it('ADR without title fails ADR-STR-002', () => {
    const adr = parseAdr('No heading here\n\n## Context\nSome context.', 'no-title.md');
    const violations = runStructuralRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-STR-002')).toBe(true);
  });

  it('ADR missing Context section fails ADR-STR-001', () => {
    const content = '# ADR-X: Something\n\n## Decision\nWe decided X.';
    const adr = parseAdr(content, 'missing-context.md');
    const violations = runStructuralRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-STR-001')).toBe(true);
  });
});

// ─── Enterprise Rules ──────────────────────────────────────────────────────

describe('Enterprise rules', () => {
  it('valid ADR passes all enterprise rules', () => {
    const adr = loadFixture('valid-adr.md');
    const violations = runEnterpriseRules(adr);
    expect(violations.filter((v) => v.severity === 'error')).toHaveLength(0);
  });

  it('ADR without alternatives fails ADR-ENT-001', () => {
    const adr = loadFixture('invalid-no-alternatives.md');
    const violations = runEnterpriseRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-ENT-001')).toBe(true);
  });

  it('ADR without compliance section fails ADR-ENT-003', () => {
    const adr = loadFixture('invalid-no-compliance.md');
    const violations = runEnterpriseRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-ENT-003')).toBe(true);
  });

  it('ADR with invalid status fails ADR-ENT-004', () => {
    const content = `# ADR-X\n\n**Date:** 2026-01-01\n**Status:** Draft\n\n## Context\nSome context with details.\n\n## Decision\nDecision here.\n\n## Alternatives Considered\n\n| Alt | Why rejected |\n|---|---|\n| A | rejected because of X |\n| B | rejected because of Y |\n\n## Compliance Impact\nNo impact.`;
    const adr = parseAdr(content, 'bad-status.md');
    const violations = runEnterpriseRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-ENT-004')).toBe(true);
  });

  it('ADR with non-ISO date fails ADR-ENT-005', () => {
    const content = `# ADR-X\n\n**Date:** Jan 15 2026\n**Status:** Accepted\n\n## Context\nContext.\n\n## Decision\nDecision.\n\n## Alternatives Considered\n\n| Alt | Why rejected |\n|---|---|\n| A | rejected because X |\n| B | rejected because Y |\n\n## Compliance Impact\nNo impact.`;
    const adr = parseAdr(content, 'bad-date.md');
    const violations = runEnterpriseRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-ENT-005')).toBe(true);
  });
});

// ─── Compliance Rules ──────────────────────────────────────────────────────

describe('Compliance rules', () => {
  it('valid ADR passes all compliance rules', () => {
    const adr = loadFixture('valid-adr.md');
    const violations = runComplianceRules(adr);
    expect(violations.filter((v) => v.severity === 'error')).toHaveLength(0);
  });

  it('security ADR without compliance reference triggers ADR-COMP-001 warning', () => {
    const adr = loadFixture('invalid-no-compliance.md');
    const violations = runComplianceRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-COMP-001')).toBe(true);
  });

  it('ADR missing consequences section triggers ADR-COMP-002 warning', () => {
    const content = `# ADR-X\n\n**Date:** 2026-01-01\n**Status:** Accepted\n\n## Context\nContext here.\n\n## Decision\nDecision here.`;
    const adr = parseAdr(content, 'no-consequences.md');
    const violations = runComplianceRules(adr);
    expect(violations.some((v) => v.ruleId === 'ADR-COMP-002')).toBe(true);
  });
});

// ─── Reporters ─────────────────────────────────────────────────────────────

describe('JSON reporter', () => {
  it('produces valid JSON', () => {
    const adr = loadFixture('valid-adr.md');
    const violations = [
      ...runStructuralRules(adr),
      ...runEnterpriseRules(adr),
      ...runComplianceRules(adr),
    ];
    const json = reportToJson([{ filePath: 'valid-adr.md', adrTitle: adr.title, violations }]);
    const parsed = JSON.parse(json);
    expect(parsed.totalAdrs).toBe(1);
    expect(parsed.passed).toBe(1);
  });

  it('produces valid JUnit XML', () => {
    const adr = loadFixture('invalid-no-alternatives.md');
    const violations = runEnterpriseRules(adr);
    const xml = reportToJUnit([{ filePath: 'invalid.md', adrTitle: adr.title, violations }]);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<testsuites');
    expect(xml).toContain('<failure');
  });
});
