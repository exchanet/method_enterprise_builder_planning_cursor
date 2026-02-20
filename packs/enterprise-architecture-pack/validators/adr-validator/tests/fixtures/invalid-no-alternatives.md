# ADR-002: Use Redis for Session Storage

**Date:** 2026-01-20
**Status:** Accepted
**Deciders:** Backend team

## Context

We need to store user sessions. The application is stateless and runs on multiple instances, so local memory is not suitable. We decided to use Redis.

## Decision

Use Redis as the distributed session store. Sessions expire after 24 hours. All instances connect to the same Redis Sentinel cluster.

## Consequences

**Positive:**
- Shared session state across all instances.
- Fast read/write latency (< 1ms).

**Negative:**
- Additional infrastructure dependency.
- Redis failure = all sessions lost (mitigated by Sentinel HA).

## Compliance Impact

No PCI-DSS or GDPR impact. Session tokens do not contain personal data — only a session ID that references the user record in the primary database.
