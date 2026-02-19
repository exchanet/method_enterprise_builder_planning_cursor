# Sub-skill: Architecture Planning

## Purpose

Guide architectural decisions for enterprise systems, generate Architecture Decision Records (ADR), apply correct patterns for each context, and map modules to the Core + Packs structure.

## When to Use

- Phase 5 of METHOD-ENTERPRISE-BUILDER-PLANNING
- When selecting between architectural patterns
- When creating ADR documents
- When mapping features to the modular pack structure
- When generating C4 diagrams

## Steps

### Step 1: Apply the architecture decision tree

Use the decision trees from `ENTERPRISE_ARCHITECTURE` rule to select the primary pattern.

**Questions to answer first:**
1. Single team or multiple autonomous teams? → Modular Monolith vs Microservices
2. Does business complexity require rich domain model? → Hexagonal / DDD
3. Is full state audit required? → Event Sourcing
4. Are reads and writes radically different in volume? → CQRS
5. Are there distributed transactions? → Saga pattern

**Document the selection:**
```markdown
## Architecture Selection: [System Name]

Primary pattern: [Modular Monolith / Microservices / Hexagonal / ...]
Justification: [Why this pattern fits this context]
Alternative considered: [What was rejected and why]
ADR: ADR-001 (see below)
```

### Step 2: Create ADR for each significant decision

For every decision that is hard to reverse or has significant trade-offs:

```markdown
## ADR-[NNN]: [Decision Title]

**Date:** [YYYY-MM-DD]
**Status:** Proposed → Accepted

### Context
[The forces and constraints that led to this decision]

### Decision
[Stated clearly and unambiguously]

### Alternatives considered
| Alternative | Pros | Cons | Rejected because |
|---|---|---|---|
| [option A] | [+] | [-] | [reason] |
| [option B] | [+] | [-] | [reason] |

### Consequences
- Positive: [what becomes easier]
- Negative: [accepted trade-offs]
- Risks: [what could go wrong, mitigation]

### Compliance impact
- [ ] No compliance impact
- [ ] Requires compliance review: [standard]
```

### Step 3: Map to Core + Packs

Assign each architectural component to the correct layer:

```
Core (infrastructure only, no business logic):
├── HTTP server / framework setup
├── Database connection pool
├── Cache client
├── Message bus client
├── Logger
├── Config loader
└── Health check endpoints

Packs (business modules):
├── [pack-name-1]/   ← complete bounded context
│   ├── pack.json
│   ├── config.schema.json
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interface/
└── [pack-name-2]/
```

**Rule:** If a component requires knowledge of business rules → it belongs in a Pack. If it only requires infrastructure (DB, HTTP, cache) → it belongs in Core.

### Step 4: Generate C4 diagrams (text format)

#### Level 1: System Context

```
[External User] ──→ [System Name] ──→ [External System 1]
                                  ──→ [External System 2]
[Internal Admin] ──→ [System Name]
```

#### Level 2: Container diagram

```
[System Name]
├── Web Application (React/Next.js) ← HTTPS ── [Browser]
├── API Server (Node/Python) ← REST/GraphQL
│   ├── ──→ PostgreSQL (primary data store)
│   ├── ──→ Redis (cache + sessions)
│   └── ──→ [External Payment API]
└── Background Workers
    ├── ──→ PostgreSQL
    └── ──→ Message Queue
```

### Step 5: Document pack interfaces

For each pack, define its public contract:

```markdown
## Pack: [pack-name]

### Exposes (public API)
- REST: GET /[resource], POST /[resource], PATCH /[resource]/:id
- Events published: [EventName1], [EventName2]
- Hooks registered: onInit, onUserCreated

### Consumes
- Events: [EventName from other pack]
- REST: [other pack's endpoints]

### Does NOT expose
- Internal domain types
- Database schema details
- Internal service implementations
```

## ADR Decision Library

Common decisions for enterprise systems (use as starting templates):

### ADR-T01: Database selection

```
Decision: Use PostgreSQL as the primary relational database
Context: Need ACID transactions, complex queries, JSON support
Alternatives: MySQL (less advanced), MongoDB (not relational), CockroachDB (distributed, more complex)
Consequences: Strong consistency, excellent tooling, limited horizontal write scaling (use read replicas)
```

### ADR-T02: Authentication mechanism

```
Decision: Use JWT (RS256) with short expiry + refresh token rotation
Context: Stateless API, multiple services need to verify tokens
Alternatives: Session cookies (stateful, not scalable across services), API keys (no user context)
Consequences: Need JWKS endpoint, token revocation via blacklist required for security
```

### ADR-T03: Event bus selection

```
Decision: Use [RabbitMQ / Kafka / Redis Streams] for async messaging
Context: [throughput, ordering, replay requirements]
Kafka: high throughput, log retention, replay → use for event sourcing, analytics
RabbitMQ: flexible routing, lower latency → use for work queues, notifications
Redis Streams: low latency, simple setup → use for low-volume, non-critical events
```

### ADR-T04: Caching strategy

```
Decision: Redis as distributed cache with cache-aside pattern
Context: Multiple app instances need shared cache state
Alternatives: In-process cache (not shared), Memcached (no data structures)
Consequences: Additional infrastructure, cache invalidation complexity
```

## Best Practices

1. **One ADR per decision** — Never combine multiple decisions in one ADR
2. **ADR is immutable when Accepted** — Create a new ADR to supersede, never edit the old one
3. **Core is technology, Packs are business** — Keep this boundary strict
4. **Default to Modular Monolith** — Extract to Microservices only when proven necessary
5. **Draw before coding** — C4 diagrams expose integration issues before they become code
6. **Pack boundaries = domain boundaries** — If two features always change together, they belong in the same pack
