# ADR-003: JWT RS256 for API Authentication

**Date:** 2026-01-25
**Status:** Accepted

## Context

The API needs to authenticate incoming requests from both customer-facing mobile apps and internal service-to-service calls. We need a stateless, scalable authentication mechanism that works across multiple services without shared session state.

## Decision

Use JWT tokens signed with RS256 (RSA 2048-bit). Public keys are served via a JWKS endpoint. Tokens expire in 15 minutes. A refresh token (stored in Redis, HttpOnly cookie) extends sessions.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| JWT HS256 | Symmetric key means every service that verifies tokens also has signing capability — a compromised service can forge tokens for any user. |
| Opaque tokens + token introspection | Requires a network call to the auth server on every request — adds 20-50ms latency and creates a single point of failure. |
| mTLS for all clients | Suitable for service-to-service, but too complex for mobile clients — certificate distribution and rotation is operationally expensive. |

## Consequences

**Positive:**
- Stateless verification — any service with the public key can verify tokens.
- RS256 private key stays only in the auth service — other services cannot forge tokens.

**Negative:**
- JWKS endpoint is now a critical path — must be HA.
- Token revocation requires a blacklist (Redis) for short-lived tokens.
