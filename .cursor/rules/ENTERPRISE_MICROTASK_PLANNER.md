# ENTERPRISE_MICROTASK_PLANNER

Reference guide for decomposing enterprise features into PDCA-T micro-tasks of ≤50 lines each.

---

## Decomposition Principles

1. **One responsibility per micro-task** — Each task does exactly one thing
2. **≤50 lines** — If it exceeds 50, split it (no exceptions)
3. **Independently testable** — Can be tested in isolation without other tasks
4. **Explicit dependencies** — Every task declares what it depends on
5. **Layer-aware** — Tasks are placed in the correct architectural layer
6. **Pack-aware** — Tasks belong to a specific pack (modular design)

---

## Decomposition Algorithm

```
STEP 1: Feature → Domains
  Break the feature into business domains (billing, users, notifications...)

STEP 2: Domain → Architectural Layers
  For each domain, identify the layers:
  ├── Infrastructure layer (DB schema, repositories, external clients)
  ├── Domain layer (entities, value objects, domain services, business rules)
  ├── Application layer (use cases, commands, queries, event handlers)
  └── Interface layer (HTTP controllers, CLI handlers, message consumers)

STEP 3: Layer → Micro-tasks
  For each layer in each domain, create micro-tasks:
  - Schema migration = 1 micro-task
  - Repository method = 1 micro-task
  - Domain entity = 1 micro-task (or split per method if large)
  - Use case = 1 micro-task
  - Controller endpoint = 1 micro-task
  - Test file = 1 micro-task (or split per category)

STEP 4: Order tasks by dependency
  Build a DAG (Directed Acyclic Graph) of task dependencies
  Execute tasks in topological order (infrastructure first)
```

---

## Micro-task Size Guidelines

| Component type | Typical lines | Max lines | Split strategy |
|---|---|---|---|
| Database schema (migration file) | 5–20 | 40 | One migration per table/change |
| Repository method (CRUD) | 10–20 | 30 | One method per task |
| Domain entity | 20–40 | 50 | Split: constructor + methods separately |
| Value object | 10–25 | 40 | One value object per task |
| Domain service | 15–35 | 50 | One service method per task |
| Use case (command handler) | 20–40 | 50 | One use case per task |
| HTTP controller endpoint | 15–30 | 40 | One endpoint per task |
| Middleware | 10–25 | 40 | One concern per middleware |
| Unit test file | 30–80 | N/A | Split by test category |
| Integration test | 20–50 | N/A | One integration scenario per test |

---

## Micro-task Template

```markdown
## Micro-task [DOMAIN]-[LAYER]-[NNN]: [Name]

**Pack:** [pack-name]
**Layer:** infrastructure | domain | application | interface
**Estimated lines:** [N]
**Depends on:** [task IDs, empty if none]
**Priority:** critical | high | medium | low

### Objective
[One sentence: what this task creates and why it's needed]

### Implementation specification
[Precise description of what to implement — function signatures, types, behavior]

### Inputs
- [input name]: [type] — [description]

### Outputs / Returns
- [output name]: [type] — [description]

### Business rules
- [rule 1]
- [rule 2]

### Error conditions
| Condition | Error type | HTTP status (if API) |
|---|---|---|
| [condition] | [ErrorClass] | [4xx/5xx] |

### Acceptance criteria
- [ ] [Criterion 1 — must be measurable and unambiguous]
- [ ] [Criterion 2]

### Required tests (≥99% coverage)
- [ ] Happy path: [describe]
- [ ] Error case: [describe]
- [ ] Edge case: [describe]
- [ ] Security: [describe, if applicable]
- [ ] Performance: [describe, if applicable]

### PDCA-T checklist
- [ ] Plan: this template fully completed
- [ ] Do: implementation ≤50 lines
- [ ] Check: self-review (types, security, readability, no duplication)
- [ ] Act: all tests pass
- [ ] Test: coverage ≥99% confirmed and documented
```

---

## Example Decomposition: User Authentication Module

### Feature: User authentication with JWT, MFA, and audit trail

**Domain:** auth

```
auth domain
├── Infrastructure layer
│   ├── AUTH-INF-001: users table migration (email, password_hash, mfa_secret, status)
│   ├── AUTH-INF-002: audit_events table migration (actor, action, resource, outcome, metadata)
│   ├── AUTH-INF-003: UserRepository.findByEmail()
│   ├── AUTH-INF-004: UserRepository.create()
│   ├── AUTH-INF-005: UserRepository.updateLastLogin()
│   └── AUTH-INF-006: AuditRepository.append()
│
├── Domain layer
│   ├── AUTH-DOM-001: Email value object (validation, normalization)
│   ├── AUTH-DOM-002: Password value object (hashing with bcrypt, verification)
│   ├── AUTH-DOM-003: User entity (constructor, state machine: active/suspended/deleted)
│   ├── AUTH-DOM-004: MfaCode value object (TOTP generation and verification)
│   └── AUTH-DOM-005: AuthToken value object (JWT creation and verification)
│
├── Application layer
│   ├── AUTH-APP-001: RegisterUserCommand + handler
│   ├── AUTH-APP-002: LoginCommand + handler (with MFA step if enabled)
│   ├── AUTH-APP-003: RefreshTokenCommand + handler
│   ├── AUTH-APP-004: LogoutCommand + handler (token revocation)
│   ├── AUTH-APP-005: EnableMfaCommand + handler
│   └── AUTH-APP-006: AuditAuthEventHandler (cross-cutting, writes audit log)
│
└── Interface layer
    ├── AUTH-INT-001: POST /auth/register controller
    ├── AUTH-INT-002: POST /auth/login controller
    ├── AUTH-INT-003: POST /auth/refresh controller
    ├── AUTH-INT-004: POST /auth/logout controller
    ├── AUTH-INT-005: POST /auth/mfa/setup controller
    └── AUTH-INT-006: AuthMiddleware (validate JWT on protected routes)
```

**Total micro-tasks:** 22  
**Dependencies:** INF tasks first, then DOM, then APP, then INT  
**Estimated effort:** 22 tasks × 30 min avg = ~11 hours

---

## Dependency DAG Rules

When building the dependency graph:

```
Rules:
1. Infrastructure tasks have no dependencies (they are the foundation)
2. Domain tasks depend on Infrastructure (need repositories)
3. Application tasks depend on Domain (use domain entities and services)
4. Interface tasks depend on Application (call use cases)
5. Within a layer: declare inter-task dependencies explicitly
6. Circular dependencies are NOT allowed (must restructure if they appear)

DAG notation:
AUTH-INT-002 → AUTH-APP-002 → AUTH-DOM-002, AUTH-DOM-005
                             → AUTH-INF-003, AUTH-INF-006
```

---

## PDCA-T Sub-cycle per Micro-task

Apply this cycle for EVERY micro-task without exception:

```
PLAN ──────────────────────────────────────────────────────
  1. Read the micro-task template completely
  2. Verify: is this truly ≤50 lines? If not, split.
  3. Check: is there an existing skill for this type of task?
  4. Identify all error conditions and edge cases upfront

DO ────────────────────────────────────────────────────────
  5. Implement the task (≤50 lines)
  6. Apply: complete type hints (TypeScript / Python 3.12+)
  7. Apply: zero hardcoding (all values from config or params)
  8. Apply: specific exception types (no bare `catch(e){}`)
  9. Apply: structured logging (no console.log in production code)

CHECK ─────────────────────────────────────────────────────
  10. Self-review checklist:
      ✓ Type hints 100% complete?
      ✓ Any security vulnerability?
      ✓ Any code duplication with existing code?
      ✓ Is it readable without comments?
      ✓ Does it follow the project's naming conventions?
      ✓ Single responsibility (does only one thing)?

ACT ───────────────────────────────────────────────────────
  11. Write tests: happy path + error + edge + security
  12. Execute tests and display results
  13. If any test fails: fix before proceeding

TEST ──────────────────────────────────────────────────────
  14. Measure coverage (line + branch)
  15. If coverage < 99%: identify uncovered paths → add tests
  16. Show final coverage report
  17. Mark task as DONE only when coverage ≥99%
```

---

## Micro-task Backlog Format

Maintain the backlog in a structured table:

```markdown
## Micro-task Backlog: [Feature Name]

| ID | Name | Layer | Pack | Depends on | Status | Coverage |
|---|---|---|---|---|---|---|
| AUTH-INF-001 | users table migration | infrastructure | security-compliance | — | ✓ Done | 100% |
| AUTH-INF-002 | audit_events migration | infrastructure | security-compliance | — | ✓ Done | 100% |
| AUTH-DOM-001 | Email value object | domain | security-compliance | AUTH-INF-001 | ✓ Done | 99.5% |
| AUTH-DOM-002 | Password value object | domain | security-compliance | AUTH-INF-001 | In Progress | — |
| AUTH-APP-001 | RegisterUserCommand | application | security-compliance | AUTH-DOM-001, AUTH-DOM-002 | Pending | — |
| AUTH-INT-001 | POST /auth/register | interface | security-compliance | AUTH-APP-001 | Pending | — |

**Progress:** 3/22 tasks complete (14%)
**Overall coverage (completed tasks):** 99.8%
```

---

## Common Anti-patterns to Avoid

```
ANTI-PATTERN: God task
"Implement the entire authentication system" → Split into ≥20 micro-tasks

ANTI-PATTERN: Layer violation
Domain entity directly calls HTTP client → Move to infrastructure layer

ANTI-PATTERN: Untestable task
"Configure the database connection" → Extract logic, make injectable

ANTI-PATTERN: Hardcoded values
JWT_SECRET = "my-secret-key" → Use config/secrets manager injection

ANTI-PATTERN: Missing error handling
User = await db.findOne(id); // crashes if null → Handle null explicitly

ANTI-PATTERN: Test shortcuts
"I'll write tests later" → Tests written BEFORE marking task as done
```
