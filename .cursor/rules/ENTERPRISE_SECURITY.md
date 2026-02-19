# ENTERPRISE_SECURITY

Reference guide for security-by-design practices in enterprise systems. Every module must complete this checklist before delivery.

---

## Security-First Principle

Security in enterprise systems is **never a phase** — it is a **continuous property** integrated at every layer:

```
THREAT MODEL (before architecture) → SECURE DESIGN (during architecture)
→ SECURE CODE (during implementation) → SECURITY TESTS (during testing)
→ SECURITY AUDIT (before delivery) → RUNTIME MONITORING (after delivery)
```

---

## STRIDE Threat Model

Apply STRIDE analysis to every module and every API endpoint.

### STRIDE categories

| Threat | Definition | Control mechanism |
|---|---|---|
| **S**poofing | Attacker impersonates a user or system | Authentication (MFA, certificates) |
| **T**ampering | Attacker modifies data in transit or at rest | Integrity checks, signatures, HMAC |
| **R**epudiation | Actor denies performing an action | Audit logs, digital signatures |
| **I**nformation Disclosure | Sensitive data exposed to unauthorized parties | Encryption, access controls, data masking |
| **D**enial of Service | System made unavailable | Rate limiting, circuit breakers, auto-scaling |
| **E**levation of Privilege | Attacker gains higher permissions | RBAC, least privilege, input validation |

### STRIDE analysis template

```markdown
## STRIDE Analysis: [Module / Endpoint Name]

| Threat | Attack Scenario | Current Control | Residual Risk | Status |
|---|---|---|---|---|
| Spoofing | JWT token theft via XSS | HttpOnly cookies, Content-Security-Policy | Low | Mitigated |
| Tampering | Modify request body to escalate price | Input validation + HMAC signature | Low | Mitigated |
| Repudiation | Admin denies deleting user | Immutable audit log with user ID | Low | Mitigated |
| Info Disclosure | SQL error exposes schema | Generic error messages, structured logging | Low | Mitigated |
| DoS | Flood login endpoint | Rate limiting 10 req/min per IP | Medium | Accepted |
| Elevation | Horizontal privilege escalation | Resource ownership check per request | Low | Mitigated |
```

---

## Authentication Standards

### Minimum requirements for enterprise systems

```
Authentication scheme:
├── Public APIs (external users):  OAuth 2.0 + PKCE or SAML 2.0
├── Internal service-to-service:   mTLS or signed JWTs (RS256/ES256)
├── Admin interfaces:              MFA mandatory (TOTP or hardware key)
└── Machine accounts:              Client credentials + IP allowlist

Token requirements:
├── Algorithm: RS256 or ES256 (never HS256 for multi-service)
├── Access token expiry: 15 minutes maximum
├── Refresh token expiry: 7 days (rotated on use)
├── Token storage: HttpOnly + Secure + SameSite=Strict cookies
└── Token revocation: Blocklist or short expiry + refresh rotation
```

### Multi-Factor Authentication (MFA)

- MFA mandatory for: admin accounts, finance operations, PII access
- Supported methods: TOTP (RFC 6238), WebAuthn/FIDO2, SMS (last resort)
- Recovery codes: generated at enrollment, stored hashed (bcrypt), single use
- Brute-force protection: exponential backoff + account lockout after 10 failures

---

## Authorization Model

### RBAC (Role-Based Access Control) — Default model

```markdown
## Permission Matrix Template

| Role | Resource | Create | Read | Update | Delete | Export |
|---|---|---|---|---|---|---|
| admin | users | ✓ | ✓ | ✓ | ✓ | ✓ |
| manager | users | ✗ | ✓ | ✓ | ✗ | ✓ |
| viewer | users | ✗ | ✓ | ✗ | ✗ | ✗ |
```

### ABAC (Attribute-Based Access Control) — When RBAC is insufficient

Use when: resource ownership matters (user can only edit their own resources), dynamic context (time-based access, location-based), data classification levels.

```
Policy rule syntax:
ALLOW action=READ on resource=document
  IF user.department == document.department
  AND document.classification IN user.clearance_levels
  AND current_time BETWEEN 08:00 AND 20:00
```

### Least Privilege enforcement

- Every service account has only the permissions it needs for its specific function
- Permissions reviewed quarterly (access recertification)
- Unused permissions revoked after 90 days of inactivity
- Privileged access (admin) requires just-in-time (JIT) provisioning

---

## Data Protection

### Data Classification

| Class | Description | Examples | Controls required |
|---|---|---|---|
| Public | No harm if disclosed | Marketing content | None beyond integrity |
| Internal | Not for external disclosure | Internal docs, config | Access control |
| Confidential | Business sensitive | Business plans, contracts | Encryption + access control |
| Restricted | Regulated or high-impact | PII, financial data, health | Encryption + audit + RBAC + DLP |

### Encryption standards

```
At rest:
├── Databases: AES-256-GCM (transparent encryption at storage level)
├── File storage: AES-256-GCM with envelope encryption (data key + master key)
├── Backups: Same as primary data
└── Key management: AWS KMS / Azure Key Vault / HashiCorp Vault

In transit:
├── External: TLS 1.3 minimum (TLS 1.2 acceptable with strong ciphers)
├── Internal: TLS 1.2+ or mTLS for service-to-service
├── Cipher suites: ECDHE+AESGCM (disable RC4, DES, 3DES, export ciphers)
└── Certificate rotation: automated, 90-day maximum validity
```

### PII Handling

- Identify all PII fields at schema design time (GDPR Article 4)
- PII fields logged: never (mask or exclude from all log output)
- PII in responses: include only fields needed by the consumer (field filtering)
- PII retention: document retention period per data type, automated deletion
- Right to erasure: soft delete + anonymization pipeline, not hard delete

---

## Input Validation and Output Sanitization

### Input validation — non-negotiable rules

```
Every input MUST be validated for:
├── Type (string, integer, boolean, UUID, date...)
├── Format (regex, enum, range, length)
├── Business rules (ownership, state machine transitions)
└── Security rules (SQL injection, XSS, path traversal, command injection)

Validation strategy:
├── Allowlist (whitelist) over Denylist (blacklist)
├── Validate at the boundary (API layer), re-validate at domain layer
├── Reject invalid input with 400 Bad Request + structured error
└── Never trust client-supplied data for server-side decisions
```

### Output sanitization

```
Every output MUST be sanitized for:
├── SQL output: parameterized queries only (never string concatenation)
├── HTML output: escape or use safe templating (never innerHTML with user data)
├── JSON output: validate schema matches contract (no internal fields leaked)
├── Error messages: generic to users, detailed in structured logs
└── File paths: canonicalize and validate against allowed base paths
```

---

## Audit Trail Requirements

### Auditable events (minimum set)

Every enterprise system MUST audit:

```
Authentication events:
├── Login (success and failure, with IP + user agent)
├── Logout
├── Password change / reset
├── MFA enable/disable
└── Token refresh

Authorization events:
├── Permission denied
├── Role assignment / removal
└── Privilege escalation

Data events:
├── Create (with full payload snapshot)
├── Update (with before/after diff)
├── Delete (with payload snapshot)
└── Export / Download of sensitive data

Administrative events:
├── User account create / disable / delete
├── Configuration change
└── Security policy change
```

### Audit log schema

```typescript
interface AuditEvent {
  id: string;              // UUID v4
  timestamp: string;       // ISO 8601, UTC
  actor: {
    id: string;            // User or service ID
    type: 'user' | 'service' | 'system';
    ip?: string;
    userAgent?: string;
  };
  action: string;          // verb:resource (e.g., "create:user")
  resource: {
    type: string;          // Resource type
    id: string;            // Resource ID
    tenantId?: string;     // Multi-tenant context
  };
  outcome: 'success' | 'failure' | 'error';
  metadata?: Record<string, unknown>; // Before/after state, error details
}
```

### Audit log storage requirements

- Append-only (no updates or deletes possible)
- Tamper-evident (HMAC chain or write-once storage)
- Retention: minimum 1 year hot, 7 years archive (varies by regulation)
- Search: queryable by actor, resource, time range, action
- Access: restricted to compliance/security team + automated systems

---

## OWASP Top 10 Checklist (per release)

Before delivering any API or web interface, verify:

```
A01 Broken Access Control       → [ ] RBAC enforced on every endpoint
A02 Cryptographic Failures      → [ ] All sensitive data encrypted
A03 Injection                   → [ ] All queries parameterized
A04 Insecure Design             → [ ] Threat model completed
A05 Security Misconfiguration   → [ ] Default credentials removed, debug off
A06 Vulnerable Components       → [ ] Dependencies scanned (Dependabot / Snyk)
A07 Auth Failures               → [ ] Account lockout, secure sessions
A08 Software Integrity Failures → [ ] CI/CD pipeline integrity verified
A09 Security Logging Failures   → [ ] Audit log implemented
A10 SSRF                        → [ ] Outbound URL validation enforced
```

---

## Secrets Management

```
NEVER:
- Hardcode secrets in source code
- Store secrets in environment variable files committed to git
- Log secrets or tokens at any log level
- Transmit secrets in URL query parameters

ALWAYS:
- Store secrets in a secrets manager (AWS Secrets Manager, Vault, Azure Key Vault)
- Inject secrets at runtime via environment injection or secrets sidecar
- Rotate secrets regularly (API keys: 90 days, DB passwords: 180 days)
- Use different secrets per environment (dev / staging / production)
- Scan commits for secrets (git-secrets, detect-secrets, truffleHog)
```
