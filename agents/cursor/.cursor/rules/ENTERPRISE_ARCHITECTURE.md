# ENTERPRISE_ARCHITECTURE

Reference guide for architectural patterns, decision trees, and Architecture Decision Records (ADR) in enterprise systems.

---

## Architectural Pattern Decision Tree

Use this tree to select the correct architectural pattern:

```
Is the system a single product by one team?
├── YES → Is domain complexity high (many business rules)?
│         ├── YES → Modular Monolith (start here, extract later)
│         └── NO  → Simple Layered Architecture
└── NO  → Are teams fully autonomous per bounded context?
          ├── YES → Microservices
          └── NO  → Modular Monolith with service interfaces
```

```
Does the system require event replay or audit of all state changes?
├── YES → Event Sourcing + CQRS
└── NO  → Are reads and writes radically different in load?
          ├── YES → CQRS (without full Event Sourcing)
          └── NO  → Standard repository pattern
```

```
Are there long-running, distributed transactions across services?
├── YES → Saga Pattern (Choreography or Orchestration)
└── NO  → Local ACID transactions
```

---

## Pattern Specifications

### Modular Monolith (recommended for most enterprise systems)

**When to use:** Single deployment unit with clear module boundaries. Easier to operate, test, and refactor than microservices. Preferred starting architecture.

**Structure:**
```
src/
├── core/           ← Shared infrastructure (no business logic)
├── modules/
│   ├── billing/    ← Complete billing domain
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interface/
│   └── users/      ← Complete users domain
└── shared/         ← Cross-cutting concerns
```

**Non-negotiable rules:**
- Modules communicate only through public interfaces, never through internal types
- No circular dependencies between modules
- Database schema per module (logical separation minimum, physical preferred)
- Each module independently testable in isolation

**ADR required:** Yes — document why Modular Monolith was chosen over Microservices.

---

### Microservices

**When to use:** Teams are independent, deployment cadences differ significantly, services have radically different scaling needs.

**Non-negotiable rules:**
- Each service owns its own database (no shared DB)
- Service communication via async events (preferred) or sync REST/gRPC with Circuit Breaker
- Each service independently deployable and rollback-able
- Service contracts (OpenAPI / AsyncAPI) versioned and backward compatible

**Required patterns:**
- Circuit Breaker (Resilience4j / Polly / opossum)
- Bulkhead (isolate thread pools per downstream service)
- Retry with exponential backoff + jitter
- Dead Letter Queue for failed async messages
- Distributed tracing (OpenTelemetry)

**ADR required:** Yes — document service boundaries and why each service is separate.

---

### Hexagonal Architecture (Ports & Adapters)

**When to use:** Business logic must be testable without external infrastructure. Long-term maintainability is a priority.

**Structure:**
```
domain/           ← Pure business logic, zero dependencies
application/      ← Use cases, orchestration
ports/
├── inbound/      ← Interfaces that trigger use cases (e.g., HTTP, CLI, Queue)
└── outbound/     ← Interfaces the app calls externally (DB, email, API)
adapters/
├── inbound/      ← HTTP controllers, CLI handlers, message consumers
└── outbound/     ← DB repositories, email clients, external API clients
```

**Non-negotiable rules:**
- Domain layer has ZERO imports from infrastructure
- All external dependencies injected through ports
- Business logic unit-testable without any infrastructure

---

### CQRS (Command Query Responsibility Segregation)

**When to use:** Read and write models are significantly different in complexity or performance requirements.

**Pattern:**
```
Command side:                    Query side:
├── Command handlers             ├── Query handlers
├── Domain aggregates            ├── Read models (denormalized)
├── Write DB (normalized)        └── Read DB (optimized projections)
└── Event publisher ──────────────────────→ Event handler
                                              └── Projects to read DB
```

**Non-negotiable rules:**
- Commands validate all inputs before executing
- Commands are idempotent (same command twice = same result)
- Read models are rebuilt from events if corrupted
- Eventual consistency between write and read sides is explicitly documented

---

### Event Sourcing

**When to use:** Full audit trail of all state changes is required (financial, compliance, regulated systems).

**Core concepts:**
- State is derived from a sequence of immutable events
- Current state = replay of all events from beginning
- Snapshots optimize replay performance (every N events)
- Events are immutable — never deleted or modified

**Event store requirements:**
- Append-only writes
- Optimistic concurrency control (version numbers)
- Efficient range queries by aggregate ID and version
- Snapshot support for long-lived aggregates

**ADR required:** Yes — Event Sourcing significantly increases complexity. Document the justification.

---

### Saga Pattern

**When to use:** Distributed transactions span multiple services or databases.

#### Choreography Saga
- Services emit events and react to other services' events
- Simpler to implement, harder to debug
- Use when: ≤3 services involved, low coupling required

#### Orchestration Saga
- Central saga orchestrator coordinates all steps
- Easier to debug and monitor
- Use when: ≥4 services, complex compensation logic, compliance audit required

**Compensation template:**
```
Step 1: Reserve inventory     → Compensation: Release inventory
Step 2: Charge payment        → Compensation: Refund payment
Step 3: Create shipment       → Compensation: Cancel shipment
Step 4: Send confirmation     → Compensation: Send cancellation
```

---

### Circuit Breaker Pattern

**States:**
```
CLOSED ──[N failures in window]──→ OPEN ──[timeout]──→ HALF-OPEN
  ↑                                                         │
  └─────────────[success]───────────────────────────────────┘
```

**Configuration defaults for enterprise:**
```
failureThreshold: 5 failures in 60 seconds
openDuration: 30 seconds
halfOpenMaxCalls: 3
successThreshold: 2 consecutive successes
```

---

## C4 Model — Diagram Levels

Use C4 model for all architecture documentation:

| Level | Audience | Shows |
|---|---|---|
| L1: System Context | Non-technical stakeholders | System + external actors |
| L2: Container | Technical stakeholders | Applications, databases, services |
| L3: Component | Developers | Major components within a container |
| L4: Code | Implementers | Classes, functions (generated from code) |

**Minimum required:** L1 and L2 for every system. L3 for critical services.

---

## ADR Archive Template

Maintain ADRs in `docs/adr/` directory:

```
docs/
└── adr/
    ├── ADR-001-modular-monolith.md
    ├── ADR-002-postgresql-as-primary-db.md
    ├── ADR-003-event-sourcing-for-audit.md
    └── ADR-NNN-[decision-slug].md
```

Numbering: Sequential integers, never reused. Deprecated ADRs are marked `Status: Superseded by ADR-NNN`, not deleted.
