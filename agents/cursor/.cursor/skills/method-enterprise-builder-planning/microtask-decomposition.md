# Sub-skill: Micro-task Decomposition

## Purpose

Break any enterprise feature into PDCA-T micro-tasks of ≤50 lines each, organized by domain and architectural layer, with explicit dependencies.

## When to Use

- Phase 4 of METHOD-ENTERPRISE-BUILDER-PLANNING
- Any time a feature needs to be split before implementation begins
- When a task exceeds 50 lines and must be divided

## Steps

### Step 1: Domain identification

Identify the business domains involved in the feature:

```
Feature: [Name]
Domains:
├── [domain-1] — [what it owns]
├── [domain-2] — [what it owns]
└── [domain-3] — [what it owns]
```

Ask: Do any two domains share data? If yes, define the integration point (event, API, shared read model).

### Step 2: Layer mapping per domain

For each domain, map to architectural layers:

```
[domain-name]/
├── infrastructure/   ← DB, cache, external clients, file storage
├── domain/           ← Entities, value objects, domain services
├── application/      ← Use cases, commands, queries, event handlers
└── interface/        ← HTTP, CLI, message consumers
```

**Rule:** Always start from infrastructure. Never build application layer before domain layer exists.

### Step 3: Create micro-tasks

For each file/unit in each layer, create one micro-task:

```markdown
| ID | Name | Layer | Lines est. | Depends on |
|---|---|---|---|---|
| DOM1-INF-001 | [table] migration | infrastructure | 15 | — |
| DOM1-INF-002 | [Entity]Repository.findById() | infrastructure | 20 | DOM1-INF-001 |
| DOM1-DOM-001 | [Entity] value object | domain | 30 | — |
| DOM1-DOM-002 | [Entity] entity | domain | 45 | DOM1-INF-002, DOM1-DOM-001 |
| DOM1-APP-001 | Create[Entity]Command handler | application | 35 | DOM1-DOM-002 |
| DOM1-INT-001 | POST /[resource] controller | interface | 25 | DOM1-APP-001 |
```

### Step 4: Validate the backlog

Before starting implementation:

- [ ] Every task ≤50 lines
- [ ] No circular dependencies
- [ ] Infrastructure tasks have no domain/application dependencies
- [ ] Domain tasks do not import from interface layer
- [ ] Each task has clear acceptance criteria
- [ ] Pack assigned to each task

### Step 5: Order execution

Sort tasks in topological order (dependencies first). Execute bottom-up:
`infrastructure → domain → application → interface`

## Split Patterns

When a task exceeds 50 lines, apply one of these patterns:

### Split by method

```
UserEntity (80 lines) →
├── UserEntity.constructor + properties (30 lines)
├── UserEntity.validation methods (25 lines)
└── UserEntity.state machine methods (25 lines)
```

### Split by responsibility

```
AuthService (120 lines) →
├── AuthService.register() — 40 lines
├── AuthService.login() — 45 lines
└── AuthService.validateToken() — 35 lines
```

### Split by layer

```
AuthController (90 lines, mixed concerns) →
├── AuthController (30 lines — routing only)
├── AuthRequestValidator (30 lines — input validation)
└── AuthResponseMapper (30 lines — response mapping)
```

## Example: Payment Processing Feature

```
Feature: Process payment with ACID compliance

Domain: payments

payments/
├── infrastructure/
│   ├── PAY-INF-001: payments table migration (15 lines)
│   ├── PAY-INF-002: PaymentRepository.create() (20 lines)
│   ├── PAY-INF-003: PaymentRepository.findById() (15 lines)
│   └── PAY-INF-004: StripeClient.charge() wrapper (30 lines)
│
├── domain/
│   ├── PAY-DOM-001: Money value object (amount + currency, validation) (25 lines)
│   ├── PAY-DOM-002: PaymentStatus enum + state machine (20 lines)
│   ├── PAY-DOM-003: Payment entity (constructor, status transitions) (40 lines)
│   └── PAY-DOM-004: PaymentDomainService.validatePayment() (25 lines)
│
├── application/
│   ├── PAY-APP-001: ProcessPaymentCommand + handler (45 lines)
│   ├── PAY-APP-002: RefundPaymentCommand + handler (40 lines)
│   └── PAY-APP-003: PaymentFailedEventHandler (30 lines)
│
└── interface/
    ├── PAY-INT-001: POST /payments controller (25 lines)
    └── PAY-INT-002: POST /payments/:id/refund controller (20 lines)

Total: 14 micro-tasks | Estimated: ~7 hours implementation + tests
```

## PDCA-T Check: Microtask Line Validation (v2.0.0+)

After implementing each micro-task (the "Check" step of PDCA-T), run the linter to confirm the file stays within the 50-line budget:

```bash
# Validate a single file
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --task=src/payments/domain/money.ts

# Custom limit
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --task=src/payments/domain/money.ts --max-lines=40

# Validate all files in a directory
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --dir=src/payments/domain/

# JSON output for CI
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --task=src/file.ts --format=json
```

**If the task exceeds 50 effective lines**, the linter outputs automatic split suggestions:

```
✗ src/payments/application/authorize-payment.ts — FAIL (67 effective lines > 50)
  Breakdown: 89 total | 67 code | 12 comments | 8 imports | 2 blank

  Suggested split (3 units):
    ├── extract: unit-1()  [lines 1–28]    ~22 effective lines
    ├── extract: unit-2()  [lines 29–55]   ~24 effective lines
    └── extract: unit-3()  [lines 56–89]   ~21 effective lines

  Result: 3 micro-tasks of ~22 lines each
```

Act on the suggestions: extract each unit into its own file, re-run the linter to confirm each passes, then continue with the "Act" step of PDCA-T.

## Best Practices

1. **Name tasks with domain prefix** — Makes dependencies and pack assignment clear
2. **Estimate lines before writing** — Forces thinking about scope upfront
3. **Never merge tasks to save time** — Small tasks are faster to test and review
4. **Document skipped tasks** — If a task is not needed, document why
5. **Review backlog before starting** — Team agreement on task scope prevents mid-task splits
