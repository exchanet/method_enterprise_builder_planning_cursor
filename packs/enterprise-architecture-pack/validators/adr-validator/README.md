# ADR Validator

Enterprise ADR (Architecture Decision Record) validation tool for Method Enterprise Builder Planning v2.0.0.

## What it validates

| Rule | ID | Severity | Check |
|---|---|---|---|
| Required sections present | ADR-STR-001 | error | `## Context` and `## Decision` exist |
| ADR has a title | ADR-STR-002 | error | First heading is not empty |
| Context is not empty | ADR-STR-003 | warning | Context section has ≥50 chars of prose |
| ≥2 alternatives documented | ADR-ENT-001 | error | "Alternatives Considered" has ≥2 entries |
| Alternatives have rejection reasons | ADR-ENT-002 | error | Rejection reasoning present |
| Compliance impact section | ADR-ENT-003 | error | `## Compliance Impact` section exists |
| Valid status lifecycle | ADR-ENT-004 | error | Status is one of: Proposed, Accepted, Deprecated, Superseded |
| ISO 8601 date | ADR-ENT-005 | error | Date matches `YYYY-MM-DD` format |
| Security ADR references standard | ADR-COMP-001 | warning | If security-related, mentions PCI-DSS/GDPR/ISO 27001/SOC2 |
| Consequences section present | ADR-COMP-002 | warning | `## Consequences` section exists |
| Regulated ADR names deciders | ADR-COMP-003 | warning | If mentions a compliance standard, deciders are named |

## Usage

```bash
# Validate all ADRs in a directory
node src/index.ts ./docs/adr/

# Validate a single file
node src/index.ts ./docs/adr/ADR-001-isolation.md

# Strict mode (warnings also fail)
node src/index.ts --strict ./docs/adr/

# JSON output (for CI pipelines)
node src/index.ts --format=json --output=reports/adr-report.json ./docs/adr/

# JUnit XML (for CI test result integration)
node src/index.ts --format=junit --output=reports/adr-results.xml ./docs/adr/
```

## Running tests

```bash
cd packs/enterprise-architecture-pack/validators/adr-validator
npm install
npm test
```

## ADR template that passes all rules

```markdown
# ADR-NNN: Short description of the decision

**Date:** YYYY-MM-DD
**Status:** Accepted
**Deciders:** Name, Role

## Context

[2-3 paragraphs explaining the problem, constraints, and why a decision is needed now]

## Decision

[Clear statement of the decision taken]

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Option A | rejected because [specific reason] |
| Option B | rejected because [specific reason] |

## Consequences

**Positive:**
- [benefit 1]

**Negative:**
- [drawback 1] — mitigated by [mitigation]

## Compliance Impact

[State which standards are affected, or confirm no compliance impact]
```
