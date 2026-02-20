# ENTERPRISE_TESTING

Reference guide for enterprise test strategy, coverage requirements, test templates, and quality gates.

---

## Enterprise Test Pyramid

```
         /\
        /  \
       / E2E \         7%  — Critical user journeys only
      /────────\
     /Integration\    20%  — Service boundaries, DB, external APIs
    /──────────────\
   /    Unit Tests   \ 70%  — Business logic, pure functions, edge cases
  /──────────────────\
 / Chaos / Load / Perf \ 3%  — Resilience, throughput, failure injection
/──────────────────────\
```

### Coverage requirements by layer

| Test type | Minimum coverage | Measurement | Blocking on failure |
|---|---|---|---|
| Unit | **≥99%** line/branch coverage | Code coverage tools | YES — hard block |
| Integration | 100% of integration points tested | Manual checklist | YES — hard block |
| E2E | 100% of critical user journeys | Journey list | YES — hard block |
| Security | All OWASP Top 10 surfaces | STRIDE matrix | YES — hard block |
| Performance | All p95/p99 SLOs validated | Load test reports | YES — hard block |
| Chaos | Minimum chaos experiment set | Chaos runbook | WARN — soft block |

> **Coverage is a quality floor, not a quality ceiling.**
> ≥99% line/branch coverage is the minimum threshold — not the definition of quality.
> A test suite that reaches 99% with trivial assertions (e.g. `expect(true).toBe(true)`,
> or asserting only return types without verifying values) is worse than one at 90%
> with assertions that verify meaningful business behavior.
> Coverage measures *what code was executed during tests*, not *whether tests verify
> correct behavior*. Always review assertion quality alongside coverage numbers.
> The question to ask per test: **"If this code had a bug, would this assertion catch it?"**

---

## Unit Test Standards

### Mandatory test types per function/method

Every function MUST have at minimum:

```
1. Happy path test     — normal, valid input → expected output
2. Error case test     — invalid input → expected error/exception
3. Edge case test      — boundary values (min, max, empty, null, zero)
4. Security test       — malicious input, injection attempts (when applicable)
5. Performance test    — within acceptable time bounds (when applicable)
```

### Unit test template

```typescript
describe('[ComponentName / FunctionName]', () => {
  // ── Setup ──────────────────────────────────────────────────────
  beforeEach(() => {
    // Minimal, isolated setup per test
  });

  // ── Happy Path ─────────────────────────────────────────────────
  it('should [expected behavior] when [valid input condition]', () => {
    // Arrange
    const input = createValidInput();
    // Act
    const result = subjectUnderTest(input);
    // Assert
    expect(result).toEqual(expectedOutput);
  });

  // ── Error Cases ────────────────────────────────────────────────
  it('should throw [ErrorType] when [invalid condition]', () => {
    expect(() => subjectUnderTest(invalidInput)).toThrow(ExpectedError);
  });

  // ── Edge Cases ─────────────────────────────────────────────────
  it('should handle empty input gracefully', () => { ... });
  it('should handle maximum length input', () => { ... });
  it('should handle minimum valid value', () => { ... });
  it('should handle null/undefined (if applicable)', () => { ... });

  // ── Security Tests ─────────────────────────────────────────────
  it('should reject SQL injection attempt', () => { ... });
  it('should reject XSS payload in string fields', () => { ... });

  // ── Concurrent / Race Condition Tests ──────────────────────────
  it('should handle concurrent writes without data corruption', async () => { ... });
});
```

### Test naming conventions

```
Format: "[unit] should [expected behavior] when [condition]"

Good:
✓ "calculateTax should return 0 when income is below threshold"
✓ "UserService.create should throw ValidationError when email is invalid"
✓ "PaymentProcessor.charge should be idempotent with same idempotency key"

Bad:
✗ "test 1"
✗ "should work"
✗ "calculateTax test"
```

---

## Integration Test Standards

### What to test at integration level

```
Integration tests MUST cover:
├── Database: CRUD operations, transactions, constraint violations
├── Cache: hit, miss, expiry, invalidation
├── External APIs: success, 4xx, 5xx, timeout, network failure
├── Message queue: publish, consume, dead-letter, ordering
├── File storage: upload, download, delete, permission errors
└── Service-to-service: all inter-service API calls
```

### Integration test template

```typescript
describe('[ServiceName] Integration', () => {
  let db: TestDatabase;
  let service: ServiceUnderTest;

  // Use real infrastructure (test containers or dedicated test environment)
  beforeAll(async () => {
    db = await TestDatabase.start(); // Testcontainers / Docker
    service = new ServiceUnderTest({ db });
  });

  afterAll(async () => {
    await db.stop();
  });

  afterEach(async () => {
    await db.truncate(['table1', 'table2']); // Clean state between tests
  });

  it('should persist [entity] and retrieve it by ID', async () => {
    const entity = await service.create(validPayload);
    const retrieved = await service.findById(entity.id);
    expect(retrieved).toMatchObject(validPayload);
  });

  it('should rollback transaction when [step] fails', async () => {
    // Simulate failure mid-transaction
    // Assert: no partial writes in DB
  });

  it('should handle external API timeout with circuit breaker', async () => {
    mockExternalApi.delay(15_000); // Exceed timeout
    const result = await service.callExternal();
    expect(result).toEqual(fallbackResponse); // Circuit breaker response
  });
});
```

---

## E2E Test Standards

### Critical user journey catalog

Document and test ALL critical user journeys:

```markdown
## Critical User Journeys: [System Name]

| Journey ID | Name | Priority | Covered by E2E |
|---|---|---|---|
| CUJ-001 | User registration and first login | Critical | [ ] |
| CUJ-002 | Complete purchase (cart → payment → confirmation) | Critical | [ ] |
| CUJ-003 | Password reset via email | High | [ ] |
| CUJ-004 | Export user data (GDPR) | Compliance | [ ] |
| CUJ-005 | Admin: create and assign user roles | High | [ ] |
```

### E2E test template (Playwright)

```typescript
test.describe('CUJ-001: User Registration and Login', () => {
  test('should register new user and complete email verification', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');

    // Fill form with valid data
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'SecurePass1!');

    // Submit and verify redirect
    await page.click('[type=submit]');
    await expect(page).toHaveURL('/verify-email');

    // Verify email confirmation sent (check test inbox)
    const emailLink = await getVerificationLink('test@example.com');
    await page.goto(emailLink);

    // Verify successful verification
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=welcome-message]')).toBeVisible();
  });

  test('should reject registration with existing email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name=email]', 'existing@example.com');
    await page.click('[type=submit]');
    await expect(page.locator('[data-testid=error-message]')).toContainText('already registered');
  });
});
```

---

## Security Testing

### Mandatory security tests per release

```markdown
## Security Test Checklist: [Release / Feature]

### Input Validation Tests
- [ ] SQL injection: all query parameters and request body fields
- [ ] XSS: all string fields rendered in HTML
- [ ] Path traversal: all file path inputs
- [ ] Command injection: any system command construction
- [ ] LDAP injection: any LDAP query construction
- [ ] XML injection / XXE: any XML parsing

### Authentication Tests
- [ ] Brute force protection: account locked after 10 failed attempts
- [ ] Password complexity enforced
- [ ] Session invalidated on logout
- [ ] JWT: algorithm confusion attack (alg:none rejected)
- [ ] OAuth: state parameter validated (CSRF protection)

### Authorization Tests
- [ ] Horizontal privilege escalation: user A cannot access user B's resources
- [ ] Vertical privilege escalation: regular user cannot call admin endpoints
- [ ] IDOR (Insecure Direct Object Reference): all resource IDs checked against ownership
- [ ] Missing function-level access control: all endpoints require authentication

### Cryptography Tests
- [ ] Weak algorithms rejected: MD5, SHA1, DES not in use
- [ ] TLS configuration: SSLLabs A rating minimum
- [ ] Certificates: not expired, valid chain, correct hostname

### Secrets Tests
- [ ] No secrets in source code (automated scan)
- [ ] No secrets in logs (automated scan)
- [ ] No secrets in API responses
```

---

## Performance Testing

### Load test scenarios (required before production release)

| Scenario | Description | Pass criterion |
|---|---|---|
| Baseline | Normal load for 5 minutes | All SLOs met |
| Sustained load | Target throughput for 30 minutes | No degradation over time |
| Spike test | 5x normal load for 2 minutes | System recovers within 30s |
| Soak test | 70% load for 8 hours | No memory leak, no performance degradation |
| Stress test | Ramp up until failure | Failure is graceful, circuit breakers activate |
| Volume test | Large data sets | Performance within SLO |

### k6 load test template

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 1000 },  // Sustained load
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<1000'], // SLO thresholds
    errors: ['rate<0.001'],                          // < 0.1% error rate
  },
};

export default function () {
  const res = http.get('https://api.example.com/endpoint');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 300,
  });

  errorRate.add(res.status !== 200);
  responseTime.add(res.timings.duration);

  sleep(1);
}
```

---

## Quality Gates

Quality gates are enforced in CI/CD pipeline. No code merges without passing ALL gates:

### CI quality gate checklist

```yaml
# Required CI checks (all must pass):
quality_gates:
  unit_tests:
    required: true
    coverage_threshold: 99%
    
  integration_tests:
    required: true
    
  security_scan:
    required: true
    fail_on: critical, high    # Medium: warn only
    tools: [snyk, semgrep, trivy]
    
  static_analysis:
    required: true
    complexity_max: 10         # Cyclomatic complexity
    duplication_max: 3%
    
  dependency_audit:
    required: true
    fail_on: critical          # High: warn only
    
  secrets_scan:
    required: true
    fail_on: any_secret_detected
    
  license_check:
    required: true
    allowed: [MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC]
    blocked: [GPL, AGPL, LGPL]  # Review required
```

### Definition of Done (DoD) — Enterprise

A feature or module is DONE only when ALL of the following are true:

```
Code quality:
- [ ] Code review approved by ≥2 reviewers
- [ ] No linter warnings
- [ ] Cyclomatic complexity < 10 per function
- [ ] No TODO comments (tracked in issue tracker instead)

Testing:
- [ ] Unit test coverage ≥99%
- [ ] All integration tests passing
- [ ] E2E tests for all critical journeys
- [ ] Performance tests within SLO

Security:
- [ ] STRIDE review completed
- [ ] No critical/high vulnerabilities in scan
- [ ] Security checklist signed off

Compliance:
- [ ] Compliance matrix updated
- [ ] GDPR data processing documented (if applicable)
- [ ] Audit log implemented (if applicable)

Documentation:
- [ ] ADR created for significant decisions
- [ ] API documentation updated (OpenAPI)
- [ ] Runbook updated (for operational features)

Delivery:
- [ ] Delivery report generated with test metrics
- [ ] Monitoring/alerting configured
- [ ] Feature flag set (if canary rollout)
```
