# Core Layer

The Core layer provides planning infrastructure with zero business logic.

## Principle

Following the [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) Core + Packs pattern:

> **Core contains only infrastructure. Business logic lives in Packs.**

In Method Enterprise Planning:
- **Core = Planning infrastructure** (phase orchestration, quality gate engine, report generation)
- **Packs = Domain knowledge** (architecture patterns, security standards, compliance rules, test strategies)

## Contents

```
core/
└── planning-engine/       ← The only core component
    ├── pack.json          ← Core metadata and pack discovery config
    ├── config.schema.json ← Global configuration schema
    └── README.md          ← Core documentation
```

## Stability guarantee

The Core never changes when new packs are added. Adding a new enterprise pack (e.g., a future `iso-42001-ai-pack`) requires:
- Creating `packs/iso-42001-ai-pack/` with `pack.json` and `config.schema.json`
- Registering a hook in `onPhaseComplete` or `onDeliveryReportGenerate`
- Zero changes to Core

This ensures Core stability across all future extensions.
