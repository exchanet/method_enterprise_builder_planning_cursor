# Sub-skill: Delivery Report

## Purpose

Generate comprehensive, evidence-based delivery reports for enterprise features and modules. Ensures all quality gates are met and provides full traceability from requirement to test evidence before marking any work complete.

## When to Use

- Phase 8 of METHOD-ENTERPRISE-BUILDER-PLANNING
- Before any PR merge for enterprise-critical features
- Before any production deployment
- When a feature or module is declared "done"

## Steps

### Step 1: Accumulate PDCA-T results

As each micro-task completes, record:

```markdown
## Micro-task Completion Log

| ID | Name | Lines | Tests | Passed | Coverage | Completed |
|---|---|---|---|---|---|---|
| DOM1-INF-001 | users migration | 18 | 4 | 4 | 100% | ✓ |
| DOM1-DOM-001 | Email value object | 32 | 8 | 8 | 99.5% | ✓ |
| DOM1-APP-001 | RegisterUserCommand | 44 | 12 | 12 | 99.2% | ✓ |

Running totals:
Tasks completed: [N]/[total]
Tests accumulated: [N]
Minimum coverage: [lowest %]
```

### Step 2: Run final quality gate verification

Before generating the report, verify ALL gates:

```markdown
## Quality Gate Verification

### Code quality
- [ ] Unit test coverage ≥99%: [measured %]
- [ ] No linter errors: [Y/N]
- [ ] Cyclomatic complexity < 10: max = [N]
- [ ] Code duplication < 3%: [N%]
- [ ] No TODO/FIXME in production code: [Y/N]

### Testing
- [ ] All unit tests passing: [N/N]
- [ ] All integration tests passing: [N/N]
- [ ] All E2E tests passing (CUJs): [N/N]
- [ ] Performance tests within SLO: [Y/N]

### Security
- [ ] STRIDE analysis completed: [Y/N]
- [ ] 0 critical vulnerabilities: [N found]
- [ ] 0 high vulnerabilities: [N found]
- [ ] Security checklist signed off: [Y/N]
- [ ] No secrets in code: [scan passing]

### Compliance
- [ ] Compliance matrix updated: [Y/N]
- [ ] GDPR obligations met: [Y/N / N/A]
- [ ] ACID boundaries documented: [Y/N / N/A]
- [ ] Audit log implemented: [Y/N / N/A]

### Documentation
- [ ] ADRs created: [N decisions documented]
- [ ] API documentation updated: [Y/N]
- [ ] Runbook updated: [Y/N / N/A]

If ANY gate fails: STOP. Fix before generating delivery report.
```

### Step 3: Generate the full delivery report

```markdown
# Delivery Report: [Feature/Module Name]

**Date:** [YYYY-MM-DD]
**Version:** [X.Y.Z]
**Author:** [name]
**Reviewer:** [name]

---

## Implementation Summary

[2-3 sentences describing what was built, for whom, and the business value it delivers]

---

## Micro-task Completion

| ID | Task | Layer | Pack | Lines | Status |
|---|---|---|---|---|---|
| [ID] | [name] | [layer] | [pack] | [N] | ✓ Complete |

**Total tasks:** [N]/[N] (100%)
**Total lines implemented:** [N]
**Average task size:** [N] lines

---

## Test Report

### Summary
| Layer | Tests | Passed | Failed | Coverage |
|---|---|---|---|---|
| Unit | [N] | [N] | **0** | [N]% |
| Integration | [N] | [N] | **0** | 100% of integration points |
| E2E | [N] | [N] | **0** | 100% of CUJs |
| Security | [N] | [N] | **0** | OWASP Top 10 covered |
| Performance | [N scenarios] | [N] | **0** | All SLOs validated |
| **TOTAL** | **[N]** | **[N]** | **0** | **≥99%** |

### Coverage detail
```
[paste coverage tool output — line/branch coverage per file]
```

### Test execution log
```
[paste test runner output — all tests with PASS/FAIL status]
```

---

## Performance Results

| Scenario | p50 | p95 | p99 | Error rate | SLO target | Status |
|---|---|---|---|---|---|---|
| Baseline | [X]ms | [X]ms | [X]ms | [X]% | p95 < [X]ms | ✓ PASS |
| Spike | [X]ms | [X]ms | [X]ms | [X]% | p99 < [X]ms | ✓ PASS |

---

## Security Sign-off

| Check | Result |
|---|---|
| STRIDE analysis | Completed — [N] threats identified, all mitigated |
| Critical vulnerabilities | 0 |
| High vulnerabilities | 0 |
| OWASP Top 10 | All 10 items addressed |
| Secrets scan | Clean |
| Dependency audit | [N] medium (accepted: [reason]) |

---

## Compliance Checklist

| Standard | Requirement | Status |
|---|---|---|
| GDPR Art. [N] | [requirement] | ✓ Implemented |
| ISO 27001 A.[N] | [control] | ✓ Implemented |
| [Other] | [requirement] | ✓ Implemented |

ACID compliance: [N transaction boundaries documented and tested]

---

## Architecture Decisions Recorded

| ADR | Decision | Status |
|---|---|---|
| ADR-[NNN] | [title] | Accepted |
| ADR-[NNN] | [title] | Accepted |

---

## Key Technical Decisions

1. **[Decision]:** [brief justification — why this approach was chosen]
2. **[Decision]:** [brief justification]

---

## Suggested Next Steps

1. [Follow-up feature or technical improvement]
2. [Monitoring/alerting to add]
3. [Technical debt to address in next iteration]

---

## Verdict

- [ ] All quality gates: PASSED
- [ ] Definition of Done: COMPLETE
- [ ] Ready for production: **YES**

**Sign-off:** [author] | **Reviewed by:** [reviewer] | **Date:** [YYYY-MM-DD]
```

### Step 4: Attach supporting evidence

Every delivery report MUST include as attachments or inline content:
- Full test output (not a summary — the actual runner output)
- Coverage report (per-file breakdown)
- Security scan output (dependency scan, SAST scan)
- Performance test results (k6/Artillery output with thresholds)
- ADR documents (or links to them)

## Minimum Acceptable Delivery Report

Even for small features (2-3 micro-tasks), the report must include:

```markdown
# Delivery Report: [Name] (Minimal)

**Micro-tasks completed:** [N]/[N]
**Tests:** [N] passed, 0 failed, coverage [N]%
**Security:** STRIDE completed, 0 critical/high
**ADRs:** [N or "None required"]
**Gates:** ALL PASSED
**Status: READY FOR PRODUCTION**
```

## Non-negotiable Rules

1. **Zero failed tests** — A delivery report with failed tests is not a delivery report; it is an incident report
2. **Evidence, not assertions** — "Tests are passing" is not valid; attach the test output
3. **Coverage ≥99% is the floor** — Do not round up; 98.7% is not 99%
4. **Security gate is blocking** — One critical or high vulnerability stops delivery
5. **No ADR backlog** — All architecture decisions during the feature must be recorded before delivery
6. **Compliance is complete** — The compliance matrix must be updated; "will do in next sprint" is not acceptable
