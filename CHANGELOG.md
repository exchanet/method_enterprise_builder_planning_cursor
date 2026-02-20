# Changelog

All notable changes to Method Enterprise Builder Planning will be documented in this file.

Repository: [method_enterprise_builder_planning_cursor](https://github.com/exchanet/method_enterprise_builder_planning_cursor)  
Author: Francisco J Bernades — [@exchanet](https://github.com/exchanet)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0-rc1] - 2026-02-20

### Fixed
- **ADR Validator**: Corrected title parser regex to only match H1 headings (`#`), not H2 (`##`) — fixes test "ADR without title fails ADR-STR-002"
- **Security**: Updated all npm dependencies to fix 5 moderate vulnerabilities in vitest/vite/esbuild chains
- **CI/CD**: Created missing scripts (`coverage-check.sh`, `microtask-lint.sh`, `validate-delivery.sh`)

### Changed
- Upgraded `vitest` from `^2.0.0` to `^4.0.18` in both validators (ADR Validator + Microtask Linter)

### Verified
- All 40 tests passing (20 ADR Validator + 20 Microtask Linter)
- 0 vulnerabilities in `npm audit`
- Complete PDCA-T analysis report generated (`ANALISIS-PDCA-T-METHOD-ENTERPRISE-BUILDER.md`)

---

## [2.0.0] - 2026-02-20

### Breaking Changes

- **`.cursor/` moved to `agents/cursor/.cursor/`** — existing Cursor installations require update.
  Run `scripts/migrate-to-v2.ps1` (Windows) or `scripts/migrate-to-v2.sh` (macOS/Linux).
  See `docs/MIGRATION-v2.md` for full migration steps.
- **System nature updated** — project now documented as a **hybrid framework**: structured prompts + standalone executable tools. Pure prompt-system note updated accordingly.

### Added

**Fase 1 — Executable validators**
- `packs/enterprise-architecture-pack/validators/adr-validator/` — ADR Validator CLI (TypeScript, Node.js ≥22, no external dependencies)
  - Parser: regex-based Markdown section extractor (no AST dependency)
  - 11 rules across 3 rule sets: structural (ADR-STR-001..003), enterprise (ADR-ENT-001..005), compliance (ADR-COMP-001..003)
  - Reporters: console (human-readable) + JSON + JUnit XML (CI/CD integration)
  - Gate: ADR cannot be marked Accepted if any `error`-severity rule fails
- `packs/enterprise-microtask-planner-pack/` — New pack with Microtask Linter CLI
  - Language support: TypeScript/JavaScript + Python (regex-based, no AST)
  - Counts effective lines: total − blank − comment-only − import lines
  - Automatic split suggestions when limit exceeded (detects function/class boundaries)
  - Reporters: console (with split suggestions) + JSON

**Fase 2 — CI/CD Templates**
- `.ci-cd/templates/github-actions/workflow-enterprise-builder.yml` — Full workflow with 5 quality gates
- `.ci-cd/templates/gitlab-ci/.gitlab-ci.yml` — GitLab CI template
- `.ci-cd/templates/azure-devops/azure-pipelines.yml` — Azure DevOps template
- `.ci-cd/templates/jenkins/Jenkinsfile` — Jenkins pipeline
- `.ci-cd/scripts/coverage-check.sh` — Validates ≥99% coverage on all metrics
- `.ci-cd/scripts/adr-validator-ci.sh` — CI wrapper for ADR Validator (JUnit output)
- `.ci-cd/scripts/microtask-lint.sh` — CI wrapper for Microtask Linter
- `.ci-cd/scripts/validate-delivery.sh` — Phase 8 delivery gate

**Fase 3 — Multi-agent support**
- `agents/cursor/` — Cursor AI adapter (existing rules/skills, now under agents/)
- `agents/claude-code/` — Claude Code adapter (CLAUDE.md + /plan-enterprise, /validate-adr commands)
- `agents/kimi-code/` — Kimi Code adapter (KIMI.md with keyword auto-detection)
- `agents/windsurf/` — Windsurf Cascade adapter (WINDSURF.md)
- `agents/README.md` — Agent comparison table and installation commands
- `scripts/migrate-to-v2.sh` — Migration script for macOS/Linux
- `scripts/migrate-to-v2.ps1` — Migration script for Windows (PowerShell)
- `docs/MIGRATION-v2.md` — Full migration guide

**Documentation (v1.x improvements)**
- `examples/banking-walkthrough.md` — Complete executed walkthrough with real agent output
- `x-ui` properties clarified as design markers (not existing UI) in all config.schema.json files
- "What this is and what it is not" sections added to README.md and README.es.md
- Coverage quality floor vs ceiling note added to ENTERPRISE_TESTING.md and testing-strategy.md

### Integration updates
- `architecture-planning.md` skill — ADR Validation Step added
- `microtask-decomposition.md` skill — PDCA-T Check with microtask-linter command added

---

## [1.0.0] - 2026-02-19

### Added

- Initial release of Method Enterprise Builder Planning module
- Name: **Builder** reflects dual purpose — plans AND guides complete construction of enterprise software
- Slash command activation: `/method-enterprise_builder`
- 8-phase enterprise builder cycle (Context → NFR → Risk → Decomposition → Architecture → Security → Testing → Delivery)
- `.cursor/rules/METHOD-ENTERPRISE-BUILDER-PLANNING.md` — main Cursor rule with `trigger: manual`
- 6 reference rules: `ENTERPRISE_ARCHITECTURE.md`, `ENTERPRISE_SECURITY.md`, `ENTERPRISE_SCALABILITY.md`, `ENTERPRISE_COMPLIANCE.md`, `ENTERPRISE_TESTING.md`, `ENTERPRISE_MICROTASK_PLANNER.md`
- Main skill `SKILL.md` with 7 orchestrated sub-skills
- Sub-skills: `architecture-planning.md`, `security-planning.md`, `scalability-planning.md`, `compliance-planning.md`, `microtask-decomposition.md`, `testing-strategy.md`, `delivery-report.md`
- Core planning engine at `core/planning-engine/`
- 5 enterprise packs: `enterprise-architecture-pack`, `security-compliance-pack`, `high-availability-pack`, `testing-coverage-pack`, `acid-compliance-pack`
- 3 real-world planning examples: banking system, high-availability SaaS, mission-critical API
- Full documentation in `docs/` (EN/ES)
- Integration declarations for [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) and [PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor)
- Bilingual support (English / Spanish) across all rules and skills

### Compliance standards supported

- ISO/IEC 25000 (SQuaRE) quality model
- ISO 27001 security management
- CMMI level 3+ process maturity
- ACID transaction model
- STRIDE threat modeling
- GDPR/RegTech compliance mapping

---

## Versioning Policy

- **MAJOR**: Breaking changes to planning methodology or pack interfaces
- **MINOR**: New packs, new sub-skills, new compliance standards
- **PATCH**: Documentation fixes, checklist updates, clarifications
