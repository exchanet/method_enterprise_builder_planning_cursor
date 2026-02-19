# Changelog

All notable changes to Method Enterprise Builder Planning will be documented in this file.

Repository: [method_enterprise_builder_planning_cursor](https://github.com/exchanet/method_enterprise_builder_planning_cursor)  
Author: Francisco J Bernades — [@exchanet](https://github.com/exchanet)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
