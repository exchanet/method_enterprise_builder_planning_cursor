# Command: /validate-adr

Runs the enterprise ADR Validator against one or more ADR files.

## Usage

```
/validate-adr [path]
```

## Examples

```
# Validate all ADRs in the standard directory
/validate-adr docs/adr/

# Validate a specific ADR
/validate-adr docs/adr/ADR-001-isolation.md
```

## What it runs

```bash
node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts \
  --format=console [path]
```

## Rules checked

- ADR-STR-001: Required sections (Context, Decision) present
- ADR-STR-002: ADR has a title
- ADR-ENT-001: ≥2 alternatives documented
- ADR-ENT-002: Alternatives include rejection reasons
- ADR-ENT-003: Compliance Impact section present
- ADR-ENT-004: Valid status (Proposed/Accepted/Deprecated/Superseded)
- ADR-ENT-005: ISO 8601 date format (YYYY-MM-DD)
- ADR-COMP-001: Security ADRs reference a compliance standard
- ADR-COMP-002: Consequences section present
- ADR-COMP-003: Regulated ADRs name their deciders

## Gate rule

An ADR that fails any `error`-severity rule cannot be marked as **Accepted**.
