# Installation Guide — Method Enterprise Builder Planning

## Prerequisites

Before installing this module, install the required companion methods:

1. **[Method Modular Design](https://github.com/exchanet/method_modular_design_cursor)** — Core + Packs architecture pattern
2. **[PDCA-T Method](https://github.com/exchanet/method_pdca-t_coding_Cursor)** — Quality assurance cycle

---

## Option 1: Express Installation (Recommended — no command line needed)

The fastest way to get started. No terminal, no git, no configuration required.

**Step 1 — Download**

Go to the [GitHub repository](https://github.com/exchanet/method_enterprise_builder_planning_cursor) and click **Code → Download ZIP**. Unzip the downloaded file.

**Step 2 — Copy the path**

Note the path to the unzipped folder. For example:

```
Windows: C:\Users\your-name\Downloads\method-enterprise_builder_planning
macOS:   /Users/your-name/Downloads/method-enterprise_builder_planning
Linux:   /home/your-name/Downloads/method-enterprise_builder_planning
```

**Step 3 — Open Cursor Agent and install**

Open Cursor → start a new Agent chat. Paste the path and write:

```
Install this method so I can use it in Cursor:
C:\Users\your-name\Downloads\method-enterprise_builder_planning
```

Cursor will automatically:
- Copy the `.cursor/rules/` and `.cursor/skills/` folders to the correct global location
- Register all rules and skills for use in any project

**Step 4 — Restart Cursor**

Close and reopen Cursor completely (not just the chat tab) so the new rules and skills are loaded.

**Step 5 — Use it**

In any Cursor chat, type:

```
/method-enterprise_builder
```

Cursor will acknowledge activation and ask you to describe your system. The 8-phase builder cycle begins immediately.

---

## Option 2: Manual Installation (Git)

### Clone and copy to your project

```bash
git clone https://github.com/exchanet/method_enterprise_builder_planning_cursor.git
cd method_enterprise_builder_planning_cursor

# Copy rules and skills to your project
cp -r .cursor /path/to/your/project/
```

### Install companion methods

```bash
# Method Modular Design (Core + Packs pattern)
git clone https://github.com/exchanet/method_modular_design_cursor.git
cp -r method_modular_design_cursor/.cursor/rules/METHOD_MODULAR_DESIGN.md \
      /path/to/your/project/.cursor/rules/
cp -r method_modular_design_cursor/.cursor/rules/MODULAR_*.md \
      /path/to/your/project/.cursor/rules/
cp -r method_modular_design_cursor/.cursor/skills/method-modular-design \
      /path/to/your/project/.cursor/skills/

# PDCA-T Method (quality assurance cycle)
git clone https://github.com/exchanet/method_pdca-t_coding_Cursor.git
cp -r method_pdca-t_coding_Cursor/.cursor/rules/METODO-PDCA-T.md \
      /path/to/your/project/.cursor/rules/
cp -r method_pdca-t_coding_Cursor/.cursor/skills/metodo-pdca-t \
      /path/to/your/project/.cursor/skills/
```

---

## Option 3: Rules Only (Minimal)

If you only want the Cursor rules without the skill sub-files:

```bash
cp .cursor/rules/METHOD-ENTERPRISE-BUILDER-PLANNING.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_ARCHITECTURE.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_SECURITY.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_SCALABILITY.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_COMPLIANCE.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_TESTING.md /path/to/project/.cursor/rules/
cp .cursor/rules/ENTERPRISE_MICROTASK_PLANNER.md /path/to/project/.cursor/rules/
```

---

## Option 4: Skills Only

```bash
cp -r .cursor/skills/method-enterprise-builder-planning /path/to/project/.cursor/skills/
```

---

## Option 5: Enterprise Packs as Reference Library

To use the enterprise packs in your own modular project:

```bash
cp -r packs/enterprise-architecture-pack /path/to/project/packs/
cp -r packs/security-compliance-pack /path/to/project/packs/
cp -r packs/high-availability-pack /path/to/project/packs/
cp -r packs/testing-coverage-pack /path/to/project/packs/
cp -r packs/acid-compliance-pack /path/to/project/packs/
```

---

## Verification

After installation, verify that Cursor has loaded the method correctly.

### Check rules are present

Your `.cursor/rules/` directory should contain:

```
METHOD-ENTERPRISE-BUILDER-PLANNING.md  ← trigger: manual
ENTERPRISE_ARCHITECTURE.md
ENTERPRISE_SECURITY.md
ENTERPRISE_SCALABILITY.md
ENTERPRISE_COMPLIANCE.md
ENTERPRISE_TESTING.md
ENTERPRISE_MICROTASK_PLANNER.md

# Companion method rules (required)
METHOD_MODULAR_DESIGN.md
METODO-PDCA-T.md
```

### Check skills are present

Your `.cursor/skills/` directory should contain:

```
method-enterprise-builder-planning/
├── SKILL.md
├── architecture-planning.md
├── security-planning.md
├── scalability-planning.md
├── compliance-planning.md
├── microtask-decomposition.md
├── testing-strategy.md
└── delivery-report.md

method-modular-design/     ← companion method
metodo-pdca-t/             ← companion method
```

### Test activation

In a Cursor Agent chat, type:

```
/method-enterprise_builder
```

Cursor should respond by activating the method and asking you to describe your system. If it does, the installation is complete.

---

## Optional: Project Configuration File

Create this file at your project root to pre-configure the method's default settings:

```json
{
  "project": {
    "name": "My Enterprise System",
    "type": "mission-critical",
    "primary_language": "typescript",
    "framework": "express"
  },
  "quality_gates": {
    "unit_test_coverage_minimum": 99,
    "max_microtask_lines": 50,
    "require_stride_analysis": true,
    "require_adr_for_architecture_decisions": true
  },
  "sla": {
    "availability_sla_percent": 99.9,
    "latency_p95_ms": 300,
    "latency_p99_ms": 1000
  },
  "compliance": {
    "gdpr": true,
    "iso_27001": true,
    "soc2": false,
    "pci_dss": false
  }
}
```

Save this file as `enterprise-builder.config.json` in your project root.

---

## Updating

```bash
cd method_enterprise_builder_planning_cursor
git pull origin main

# Re-copy updated files
cp -r .cursor /path/to/your/project/
```

Always check `CHANGELOG.md` before updating to review breaking changes.
