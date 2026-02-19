# Testing Coverage Pack — Hook Implementations

## validateTestCoverage (onMicrotaskComplete)

After every micro-task PDCA-T cycle, validate:

```markdown
## Coverage Validation: Micro-task [ID]

Required tests completed:
- [ ] Happy path: [N tests]
- [ ] Error cases: [N tests]
- [ ] Edge cases: [N tests]
- [ ] Security tests: [N tests / N/A]
- [ ] Performance tests: [N tests / N/A]

Coverage measured: [N]%
Minimum required: 99%

Result: PASS (≥99%) / FAIL (<99% — must add more tests before proceeding)
```

## onPhaseComplete (Phase 4 — Micro-task Decomposition)

When micro-tasks are defined, generate the test specification for each:

```markdown
## Test Specifications (Phase 4 Output)

For each micro-task in the backlog, generate:

| Task ID | Happy path | Error cases | Edge cases | Security | Total min tests |
|---|---|---|---|---|---|
| DOM1-INF-001 | 1 | 2 | 2 | 1 | 6 |
| DOM1-DOM-001 | 2 | 3 | 4 | 2 | 11 |

Total minimum tests for this feature: [N]
```

## onPhaseComplete (Phase 7 — Test Strategy)

Produce the full test strategy document:

```markdown
## Test Strategy (Phase 7 Output)

### Test pyramid allocation
Unit: [N] tests (70% target)
Integration: [N] tests (20% target)
E2E: [N] tests covering [N] CUJs (7% target)
Chaos/Load: [N] scenarios (3% target)

### Critical User Journeys
| CUJ ID | Journey | Priority | E2E test |
|---|---|---|---|
| CUJ-001 | [journey] | Critical | [ ] |

### Load test plan
| Scenario | Duration | Load | Pass criteria |
|---|---|---|---|
| Baseline | 5 min | [N] users | p95 < [X]ms |

### CI quality gate config
[YAML configuration for CI pipeline]
```

## qualityGateEvaluation (onQualityGateCheck)

Evaluate all testing quality gates:

```markdown
## Testing Quality Gate Evaluation

- Unit coverage: [N]% [PASS ≥99% / FAIL <99%]
- Integration tests: [N]/[N] passing [PASS/FAIL]
- E2E tests: [N]/[N] CUJs covered [PASS/FAIL]
- Performance: [all SLOs met: YES/NO]
- Security tests: [all OWASP surfaces covered: YES/NO]

Overall: PASS (all gates green) / FAIL (see items above)
```

## deliveryReportSection (onDeliveryReportGenerate)

Testing section of the delivery report:

```markdown
## Test Report

| Category | Tests | Passed | Failed | Coverage |
|---|---|---|---|---|
| Unit | [N] | [N] | **0** | [N]% |
| Integration | [N] | [N] | **0** | 100% of integration points |
| E2E | [N] | [N] | **0** | [N] of [N] CUJs |
| Security | [N] | [N] | **0** | OWASP Top 10 covered |
| Load | [N scenarios] | [N] | **0** | All SLOs met |
| **TOTAL** | **[N]** | **[N]** | **0** | **≥99%** |

### Coverage breakdown
[Per-file coverage report from test runner]

### Performance results
| Scenario | p95 | p99 | Error rate | Pass? |
|---|---|---|---|---|
| Baseline | [X]ms | [X]ms | [X]% | ✓ |

### Testing sign-off: [APPROVED / BLOCKED]
```
