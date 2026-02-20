// Compliance-specific ADR validation rules (ADR-COMP-001 .. ADR-COMP-003)
// These produce warnings, not errors, to allow non-regulated systems to pass.

import { ParsedAdr, getSectionContent, hasSection } from '../parser.ts';
import { Rule, RuleViolation } from './enterprise-rules.ts';

const REGULATED_KEYWORDS = ['pci', 'gdpr', 'iso 27001', 'soc2', 'soc 2', 'hipaa', 'psd2', 'eba'];
const SECURITY_KEYWORDS = [
  'authentication', 'authorization', 'encryption', 'auth',
  'token', 'certificate', 'tls', 'ssl', 'rbac', 'jwt',
];

function mentionsRegulation(content: string): boolean {
  const lower = content.toLowerCase();
  return REGULATED_KEYWORDS.some((kw) => lower.includes(kw));
}

function isSecurityRelated(adr: ParsedAdr): boolean {
  const full = adr.rawContent.toLowerCase();
  return SECURITY_KEYWORDS.some((kw) => full.includes(kw));
}

export const complianceRules: Rule[] = [
  {
    id: 'ADR-COMP-001',
    name: 'Security ADR Must Reference Compliance Standard',
    severity: 'warning',
    validate: (adr) => {
      if (!isSecurityRelated(adr)) return true;
      const complianceContent = getSectionContent(adr, 'compliance');
      return mentionsRegulation(complianceContent) || mentionsRegulation(adr.rawContent);
    },
    message:
      'This ADR appears security-related but does not reference any compliance standard (PCI-DSS, GDPR, ISO 27001, SOC2).',
    hint: 'Add the applicable standard to the "Compliance Impact" section, or confirm explicitly that no standard applies.',
  },
  {
    id: 'ADR-COMP-002',
    name: 'Consequences Section Must Be Present',
    severity: 'warning',
    validate: (adr) => hasSection(adr, 'consequences'),
    message: '"Consequences" section is missing.',
    hint:
      'Add "## Consequences" with positive (+) and negative (-) consequences of the decision.',
  },
  {
    id: 'ADR-COMP-003',
    name: 'Regulated ADR Must Name Deciders',
    severity: 'warning',
    validate: (adr) => {
      if (!mentionsRegulation(adr.rawContent)) return true;
      return adr.deciders !== null && adr.deciders.trim().length > 0;
    },
    message:
      'ADR references regulated data but does not name deciders. Compliance audits require accountability.',
    hint: 'Add "**Deciders:** [name, role]" to the ADR header.',
  },
];

export function runComplianceRules(adr: ParsedAdr): RuleViolation[] {
  const violations: RuleViolation[] = [];
  for (const rule of complianceRules) {
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
