# Sub-skill: Security Planning

## Purpose

Apply security-by-design practices to enterprise systems: STRIDE threat modeling, RBAC permission design, audit trail implementation, encryption planning, and OWASP compliance verification.

## When to Use

- Phase 3 (Risk Matrix) and Phase 6 (Security & Compliance) of METHOD-ENTERPRISE-BUILDER-PLANNING
- When designing authentication and authorization for any module
- When implementing audit trail requirements
- Before delivering any API or interface feature

## Steps

### Step 1: Complete STRIDE analysis

For each module or API boundary, work through all 6 STRIDE categories:

```markdown
## STRIDE Analysis: [Module/Boundary Name]

Work through each threat systematically:

**S — Spoofing**
Q: Who could impersonate a legitimate user or service?
Threats identified: [list]
Controls: [authentication mechanism, token validation]

**T — Tampering**
Q: What data in transit or at rest could be modified?
Threats identified: [list]
Controls: [integrity checks, HMAC, input validation, parameterized queries]

**R — Repudiation**
Q: What actions could be denied by the actor who performed them?
Threats identified: [list]
Controls: [audit log with actor ID, digital signatures]

**I — Information Disclosure**
Q: What sensitive data could be exposed to unauthorized parties?
Threats identified: [list]
Controls: [encryption, access controls, data masking in logs]

**D — Denial of Service**
Q: How could the system be made unavailable?
Threats identified: [list]
Controls: [rate limiting, circuit breakers, resource quotas]

**E — Elevation of Privilege**
Q: How could a user gain more permissions than authorized?
Threats identified: [list]
Controls: [RBAC enforcement, input validation, IDOR prevention]
```

### Step 2: Design the RBAC permission matrix

```markdown
## RBAC Matrix: [System/Module Name]

### Roles
| Role | Description | Who has this role |
|---|---|---|
| super_admin | Full system access | Platform administrators only |
| admin | Full company access | Company administrators |
| manager | Read + write for their team | Team managers |
| member | Read + write for their own data | Regular employees |
| viewer | Read only | Auditors, read-only accounts |

### Permissions Matrix
| Resource | Action | super_admin | admin | manager | member | viewer |
|---|---|---|---|---|---|---|
| users | create | ✓ | ✓ | ✗ | ✗ | ✗ |
| users | read:own | ✓ | ✓ | ✓ | ✓ | ✓ |
| users | read:all | ✓ | ✓ | ✓ (team) | ✗ | ✗ |
| users | update:own | ✓ | ✓ | ✓ | ✓ | ✗ |
| users | update:all | ✓ | ✓ | ✗ | ✗ | ✗ |
| users | delete | ✓ | ✓ | ✗ | ✗ | ✗ |

### Permission check implementation pattern
Every endpoint must verify:
1. Is the user authenticated? (valid token)
2. Does the user have the required permission? (RBAC check)
3. Does the user own the resource? (IDOR check, if applicable)
```

### Step 3: Define audit trail schema

```markdown
## Audit Trail Design: [System Name]

### Auditable events (complete list)
Authentication: login_success, login_failure, logout, password_change, mfa_enable, mfa_disable
Authorization: permission_denied, role_assigned, role_removed
Data: [resource]_created, [resource]_updated (with before/after diff), [resource]_deleted
Admin: user_created, user_suspended, config_changed, export_executed

### Audit event schema
{
  id: UUID,
  timestamp: ISO8601 (UTC),
  actor_id: string,
  actor_type: "user" | "service" | "system",
  actor_ip: string (nullable),
  action: string (format: "verb:resource", e.g. "create:user"),
  resource_type: string,
  resource_id: string,
  tenant_id: string (nullable, for multi-tenant),
  outcome: "success" | "failure" | "error",
  metadata: JSON (before/after state, error details, context)
}

### Storage requirements
- Append-only (no UPDATE or DELETE operations on audit table)
- Separate database or schema from main application data
- Retention: minimum 1 year accessible, 7 years archived
- Access: read-only for compliance team, write-only for application
```

### Step 4: Encryption planning

```markdown
## Encryption Plan: [System Name]

### At-rest encryption
| Data | Classification | Encryption | Key management |
|---|---|---|---|
| User passwords | Restricted | bcrypt (cost=12) | N/A (one-way hash) |
| PII fields | Restricted | AES-256-GCM (field-level) | Secrets manager |
| Database files | Confidential | Transparent encryption | Cloud KMS |
| Backups | Confidential | AES-256 | Cloud KMS |

### In-transit encryption
- External: TLS 1.3 mandatory (reject TLS 1.0/1.1/1.2 without explicit business justification)
- Internal: TLS 1.2+ between services, mTLS for sensitive service-to-service
- Certificate management: automated renewal (Let's Encrypt / ACM), 90-day max validity

### Sensitive field handling in code
Never log: passwords, tokens, credit card numbers, SSN, API keys
Always mask in logs: email (show first char + domain), phone (show last 4 digits)
Never serialize to response: password_hash, mfa_secret, internal IDs (use public IDs)
```

### Step 5: Complete security checklist

Run this checklist before marking any module as ready:

```markdown
## Security Checklist: [Module Name]

### Input Validation
- [ ] All inputs validated with allowlist approach
- [ ] String length limits enforced
- [ ] SQL injection: all queries use parameterized statements
- [ ] XSS: all user content escaped before rendering
- [ ] File uploads: type validation + size limit + virus scan (if applicable)

### Authentication
- [ ] All endpoints (except public) require valid authentication
- [ ] Token algorithm: RS256 or ES256 (not HS256)
- [ ] Token expiry enforced: access ≤15 min, refresh ≤7 days
- [ ] Refresh token rotation implemented

### Authorization
- [ ] RBAC check on every protected endpoint
- [ ] Resource ownership verified (IDOR prevention)
- [ ] No role or permission determined from client-supplied data

### Data Protection
- [ ] PII fields identified and handled per classification
- [ ] No sensitive data in logs
- [ ] No sensitive data in error messages returned to client
- [ ] No secrets in source code (automated scan passing)

### Audit
- [ ] All auditable events listed and implemented
- [ ] Audit log written for all state-changing operations
- [ ] Audit log is tamper-evident

### OWASP Top 10
- [ ] A01 Broken Access Control: RBAC enforced
- [ ] A02 Cryptographic Failures: encryption plan implemented
- [ ] A03 Injection: parameterized queries throughout
- [ ] A04 Insecure Design: STRIDE completed
- [ ] A05 Security Misconfiguration: reviewed
- [ ] A06 Vulnerable Components: dependency scan clean
- [ ] A07 Auth Failures: lockout + secure sessions
- [ ] A08 Integrity Failures: CI/CD integrity verified
- [ ] A09 Logging Failures: audit log implemented
- [ ] A10 SSRF: outbound URL validation enforced
```

## Best Practices

1. **Threat model before architecture** — Security decisions must precede code structure decisions
2. **Deny by default** — All permissions denied unless explicitly granted
3. **Verify at every layer** — Do not rely on a single authorization check at the API boundary
4. **Never trust client data** — Validate and re-validate at every layer
5. **Audit first, fix second** — If you can detect a breach, you can recover; if you can't detect it, you can't
6. **Principle of least privilege** — Every service, user, and process gets only what it needs
7. **Automate security scans** — Manual review is not sufficient; CI must enforce security gates
