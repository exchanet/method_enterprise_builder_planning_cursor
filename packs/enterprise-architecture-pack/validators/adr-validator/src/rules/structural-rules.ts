// Structural ADR validation rules (ADR-STR-001 .. ADR-STR-003)
// Verify that required Markdown sections and header fields are present.

import { ParsedAdr, hasSection } from '../parser.ts';
import { Rule, RuleViolation } from './enterprise-rules.ts';

const REQUIRED_SECTIONS = ['context', 'decision'];

export const structuralRules: Rule[] = [
  {
    id: 'ADR-STR-001',
    name: 'Required Sections Present',
    severity: 'error',
    validate: (adr) => REQUIRED_SECTIONS.every((s) => hasSection(adr, s)),
    message: 'ADR is missing required sections: "## Context" and/or "## Decision".',
    hint: 'Add the missing sections. Minimum structure: ## Context, ## Decision, ## Alternatives Considered, ## Consequences.',
  },
  {
    id: 'ADR-STR-002',
    name: 'ADR Has a Title',
    severity: 'error',
    validate: (adr) => adr.title.trim().length > 0,
    message: 'ADR has no title. The first heading must identify the decision.',
    hint: 'Start the document with "# ADR-NNN: Short description of the decision".',
  },
  {
    id: 'ADR-STR-003',
    name: 'Context Section Is Not Empty',
    severity: 'warning',
    validate: (adr) => {
      if (!hasSection(adr, 'context')) return true;
      const content = Object.entries(adr.sections)
        .filter(([k]) => k.includes('context'))
        .map(([, v]) => v.content)
        .join('');
      // Remove the heading line itself and check there's actual prose
      const body = content.replace(/^##.*$/m, '').trim();
      return body.length > 50;
    },
    message: 'The "Context" section appears to be empty or too brief.',
    hint:
      'Write at least 2-3 sentences explaining the problem, the constraints, and why a decision is needed.',
  },
];

export function runStructuralRules(adr: ParsedAdr): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const rule of structuralRules) {
    if (!rule.validate(adr)) {
      violations.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        hint: rule.hint,
      });
    }
  }
  return violations;
}
