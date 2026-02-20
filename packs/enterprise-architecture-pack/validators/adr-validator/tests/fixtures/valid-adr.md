# ADR-001: SERIALIZABLE Isolation for Payment Transactions

**Date:** 2026-01-15
**Status:** Accepted
**Deciders:** Payments lead, DBA, Security architect

## Context

The payment authorization and capture flow reads the current account balance and writes an updated transaction record atomically. Under concurrent load (up to 2,000 TPS peak), multiple authorization requests for the same account can arrive simultaneously, creating two integrity risks: lost updates and phantom reads. PCI-DSS Requirement 6.5 mandates data integrity protection at the database layer, not solely in application logic.

## Decision

Use SERIALIZABLE isolation for all payment write transactions (authorize, capture, refund). Use SELECT ... FOR UPDATE on the account row to acquire a row lock early. All transactions commit within 150ms — external calls go through the Outbox pattern.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| READ COMMITTED (default) | Does not prevent lost updates. Two concurrent authorizations on the same account both succeed — overdraft risk. Unacceptable for financial data. |
| REPEATABLE READ | Prevents lost updates via snapshot, but not phantom reads. Fraud detection queries remain vulnerable. |
| Application-level lock (Redis) | Introduces distributed lock expiry edge cases and a Redis availability dependency. SERIALIZABLE at DB level is simpler and provable. |
| Optimistic concurrency (version column) | Appropriate for low-contention. Hot accounts under payroll runs would cause retry storms that blow the p95 SLO at peak. |

## Consequences

**Positive:**
- Zero risk of lost update or phantom read on payment data.
- PCI-DSS Req. 6.5 compliance provable at DB level.

**Negative:**
- ~15% throughput reduction under peak vs READ COMMITTED.
- Serialization failures (ERROR 40001) require retry logic (max 3, exponential backoff).

## Compliance Impact

Directly addresses PCI-DSS Requirement 6.5 (data integrity) and ISO 27001 A.12.1 (operational procedures). No GDPR impact — this decision concerns transaction isolation, not personal data processing.
