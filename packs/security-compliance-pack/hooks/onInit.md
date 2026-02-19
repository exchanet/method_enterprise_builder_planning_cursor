# Security & Compliance Pack — Hook Implementations

## detectComplianceRequirements (onPlanningStart)

At planning start, ask the user to confirm:

```markdown
## Security & Compliance Detection

Based on your system description, I need to confirm:

1. Does this system process EU personal data (names, emails, IP addresses)?
   → If YES: GDPR applies
   
2. Is this a SaaS product sold to enterprise customers?
   → If YES: SOC2 Type II audit likely required
   
3. Does this system process payment card data?
   → If YES: PCI-DSS applies
   
4. Does this system process health-related information?
   → If YES: HIPAA (US) or GDPR sensitive data (EU) applies
   
5. What data classification levels exist in this system?
   → Map to: public / internal / confidential / restricted
```

Output: Compliance scope document confirming applicable regulations.

## onPhaseComplete (Phase 3 — Risk Matrix)

When Phase 3 triggers, contribute the security risk analysis:

```markdown
## Security Risk Output (Phase 3)

### STRIDE matrix (per module)
[Complete STRIDE matrix per module identified in Phase 1]

### Security risk catalog additions
| Risk | Probability | Impact | Score | Mitigation |
|---|---|---|---|---|
| Credential stuffing on login | H | H | HIGH | Rate limiting + MFA |
| Broken object-level auth | M | H | HIGH | Ownership check per request |
| Secrets in environment files | L | H | MEDIUM | Secrets manager enforced |

### Authentication decisions
Selected scheme: [jwt-rs256 / oauth2-pkce / saml2]
MFA required for: [list of roles]
Token expiry: access=[15min], refresh=[7d]
```

## onPhaseComplete (Phase 6 — Security & Compliance)

Contribute the full security and compliance mapping:

```markdown
## Security & Compliance Output (Phase 6)

### RBAC permission matrix
[Full matrix for all roles × resources × actions]

### Audit trail design
[Audit event catalog + schema]

### Compliance matrix
[Full mapping: regulation → article → control → status]

### OWASP Top 10 verification
[Checklist with implementation status per item]

### Secrets management plan
[What secrets exist, where stored, rotation policy]
```

## securityGateCheck (onMicrotaskComplete)

When a micro-task completes, run this security gate:

```markdown
## Security Gate: Micro-task [ID]

- [ ] Input validation implemented (not just type checking — business rules too)
- [ ] Error messages are generic (no internal details exposed to client)
- [ ] No secrets hardcoded
- [ ] Sensitive fields excluded from logs
- [ ] Authorization check present (if this is an API endpoint)
- [ ] IDOR prevention: ownership verified (if resource is user-owned)

Gate result: PASS / FAIL
If FAIL: [list what needs to be fixed before this task is considered done]
```

## deliveryReportSection (onDeliveryReportGenerate)

Security section of the delivery report:

```markdown
## Security & Compliance Sign-off

### Threat model
- STRIDE analysis: ✓ Completed for [N] modules
- Threats identified: [N] | All mitigated: [Y/N]

### Vulnerability scan
- Critical: 0 | High: 0 | Medium: [N] (accepted: [reason])

### OWASP Top 10
- A01 Broken Access Control: ✓ | A02 Crypto Failures: ✓ | A03 Injection: ✓
- A04 Insecure Design: ✓ | A05 Misconfig: ✓ | A06 Components: ✓
- A07 Auth Failures: ✓ | A08 Integrity: ✓ | A09 Logging: ✓ | A10 SSRF: ✓

### Compliance status
| Standard | Requirements | Met | Pending |
|---|---|---|---|
| [GDPR/SOC2/etc.] | [N total] | [N] | [N] |

### Audit trail
- Events covered: [N] of [N] identified
- Storage: [append-only, retention X years]

### Security sign-off: [APPROVED / BLOCKED]
```
