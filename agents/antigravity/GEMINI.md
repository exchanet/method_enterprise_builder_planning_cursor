---
name: method-enterprise-builder-planning-gemini
version: 2.0.0
author: Francisco J Bernades (@exchanet)
description: Enterprise Builder Planning optimized for Gemini 3 Pro and Deep Think models
model_preference: gemini-3-pro
fallback_models:
  - gemini-3-deep-think
  - gemini-3-flash
skills_path: .agent/skills
context_management:
  max_context_tokens: 2000000
  progressive_skill_loading: true
  skill_metadata_only_until_needed: true
safety:
  require_approval_for:
    - file_write
    - terminal_command
    - delete_file
    - git_operations
  auto_approve_read_operations: true
  block_on_critical_errors: true
gemini_specific:
  thinking_mode: deep_think_for_architecture_decisions
  multimodal: true
  code_execution: true
  grounding: true
---

# Method Enterprise Builder Planning — Gemini Edition

> Optimized for Google Gemini 3 Pro, Deep Think, and Flash models within Antigravity.

## Gemini-Specific Optimizations

### Use Deep Think for Phase 5 (Architecture Decisions)

When generating ADRs in Phase 5, switch to **gemini-3-deep-think** for extended reasoning:
- Decision tree selection (Monolith vs Microservices vs Hexagonal)
- Alternatives analysis (pros/cons/rejection reasons)
- Compliance impact assessment

Deep Think produces higher-quality architectural reasoning for complex trade-offs.

### Use Flash for Phase 1-2 (Context + NFRs)

Phases 1 and 2 are primarily classification and requirements gathering — **gemini-3-flash** is sufficient and faster:
- System classification (checkboxes)
- Stakeholder mapping (tables)
- NFR enumeration (SLOs, SLAs)

### Multimodal Support

If the user provides diagrams or screenshots:
- Use multimodal input to analyze existing architecture diagrams
- Cross-reference with C4 diagrams generated in Phase 5
- Extract data from compliance certification screenshots

### Code Execution for Validation

Run validators directly via Gemini's code execution:

```python
# Validate ADRs
import subprocess
result = subprocess.run([
    'node', 'packs/enterprise-architecture-pack/validators/adr-validator/src/index.ts',
    '--format=json', 'docs/adr/'
], capture_output=True, text=True)
print(result.stdout)
```

---

## 8-Phase Protocol

See `AGENTS.md` for the full protocol. The phases are identical — this file only specifies Gemini-specific optimizations.

## Skills

Load skills progressively:
1. User mentions enterprise planning → load `@skill plan-enterprise` (metadata only)
2. Phase 1 starts → load `@skill phase-1-context` (full instructions)
3. Phase 5 starts → load `@skill phase-5-adr` (full instructions)
4. ADR generated → load `@skill validate-adr` for validation

---

## Grounding for Compliance Standards

Enable grounding for Phase 1 and Phase 6 to look up current compliance standards:
- PCI-DSS v4.0 requirements
- GDPR Article 32 (security of processing)
- ISO 27001:2022 Annex A controls
- SOC 2 Trust Service Criteria

This ensures the generated compliance matrices reference the most current regulation versions.
