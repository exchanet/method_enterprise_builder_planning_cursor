# Agent Adapter: Kimi Code (Moonshot AI)

Method Enterprise Builder Planning v2.0.0 — Kimi Code Edition.

## Installation

```bash
# Copy KIMI.md to your project root
cp agents/kimi-code/KIMI.md /path/to/your-project/KIMI.md
```

Kimi Code reads `KIMI.md` automatically from the project root.

## Activation

Kimi detects enterprise planning intent automatically from keywords in your message.
No explicit command required:

```
"I need to design a mission-critical payment system with PCI-DSS compliance..."
```

Or explicitly:
```
"Activate METHOD-ENTERPRISE-BUILDER-PLANNING for: [description]"
```

## Tool integration

Kimi uses `@terminal` to run validators:
```
@terminal node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/
@terminal node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --task=src/file.ts
```

## Example workflow

1. **Activate (natural language detection):**
   ```
   I need to design a mission-critical payment system with PCI-DSS compliance,
   99.999% availability, and ACID transactions. Stack: Node.js + PostgreSQL.
   ```

2. **Kimi auto-detects keywords** (`mission-critical`, `PCI-DSS`, `ACID`, `99.999%`) and activates the 8-phase protocol. Generates `docs/enterprise-context.md` for Phase 1.

3. **Phase 5 — Validate ADRs:**
   ```
   @terminal node packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts docs/adr/
   ```

4. **Phase 7 — Lint microtasks:**
   ```
   @terminal node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts --dir=src/payments/
   ```

5. **Phase 8 — Delivery report** generated with all evidence artifacts.
