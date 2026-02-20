// Enterprise ADR validation rules (ADR-ENT-001 .. ADR-ENT-005)

import { ParsedAdr, hasSection, countAlternatives, alternativesHaveRejectionReasons } from '../parser.ts';

export type Severity = 'error' | 'warning' | 'info';

export interface RuleViolation {
  ruleId: string;
  severity: Severity;
  message: string;
  hint?: string;
}

export interface Rule {
  id: string;
  name: string;
  severity: Severity;
  validate(adr: ParsedAdr): boolean;
  message: string;
  hint?: string;
}

const VALID_STATUSES = ['Proposed', 'Accepted', 'Deprecated', 'Superseded'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const enterpriseRules: Rule[] = [
  {
    id: 'ADR-ENT-001',
    name: 'Alternatives Analysis Required',
    severity: 'error',
    validate: (adr) => countAlternatives(adr) >= 2,
    message:
      'Enterprise ADRs must document at least 2 alternatives. Found fewer than 2 in "Alternatives Considered" section.',
    hint: 'Add a table or list with at least 2 alternative approaches and explain why each was rejected.',
  },
  {
    id: 'ADR-ENT-002',
    name: 'Alternatives Must Include Rejection Reasons',
    severity: 'error',
    validate: (adr) => {
      if (countAlternatives(adr) < 1) return false;
      return alternativesHaveRejectionReasons(adr);
    },
    message:
      'Each alternative must explain why it was rejected. Missing rejection reasoning in "Alternatives Considered" section.',
    hint: 'Add "rejected because" or a "Why rejected" column to each alternative entry.',
  },
  {
    id: 'ADR-ENT-003',
    name: 'Compliance Impact Assessment Required',
    severity: 'error',
    validate: (adr) => hasSection(adr, 'compliance'),
    message:
      'Compliance impact section is missing. Enterprise ADRs must explicitly state compliance implications (even if none).',
    hint: 'Add "## Compliance Impact" section stating which standards (PCI-DSS, GDPR, ISO 27001, SOC2) are affected, or confirm no compliance impact.',
  },
  {
    id: 'ADR-ENT-004',
    name: 'Decision Status Lifecycle',
    severity: 'error',
    validate: (adr) => {
      if (!adr.status) return false;
      return VALID_STATUSES.some((s) => adr.status!.toLowerCase().includes(s.toLowerCase()));
    },
    message: `ADR status is missing or invalid. Must be one of: ${VALID_STATUSES.join(', ')}.`,
    hint: 'Add "**Status:** Accepted" (or Proposed/Deprecated/Superseded) to the ADR header.',
  },
  {
    id: 'ADR-ENT-005',
    name: 'Date Format ISO 8601',
    severity: 'error',
    validate: (adr) => {
      if (!adr.date) return false;
      return ISO_DATE_RE.test(adr.date.trim());
    },
    message: 'ADR date is missing or not in ISO 8601 format (YYYY-MM-DD).',
    hint: 'Add "**Date:** 2026-02-20" to the ADR header.',
  },
];

export function runEnterpriseRules(adr: ParsedAdr): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const rule of enterpriseRules) {
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
