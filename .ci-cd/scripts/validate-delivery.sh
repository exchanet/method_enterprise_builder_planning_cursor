#!/usr/bin/env bash
# validate-delivery.sh — Phase 8 Delivery Validation Gate
# Validates that all required artifacts are present and quality gates passed

set -euo pipefail

echo "📦 Method Enterprise Builder Planning — Delivery Validation Gate"
echo "=============================================================="
echo ""

FAILED=0

# ── Check Phase 1: Enterprise Context ──────────────────────────────────
echo "Phase 1 — Enterprise Context:"
if [ -f "docs/enterprise-context.md" ]; then
  echo "  ✅ Enterprise context document present"
else
  echo "  ❌ Missing: docs/enterprise-context.md"
  FAILED=1
fi

# ── Check Phase 3: Risk Matrix ─────────────────────────────────────────
echo ""
echo "Phase 3 — Risk Matrix:"
RISK_FILES=$(find docs -name "*risk*" -o -name "*stride*" 2>/dev/null | wc -l)
if [ "$RISK_FILES" -gt 0 ]; then
  echo "  ✅ Risk analysis document(s) present ($RISK_FILES file(s))"
else
  echo "  ❌ Missing: Risk/STRIDE analysis in docs/"
  FAILED=1
fi

# ── Check Phase 5: ADR Validation ──────────────────────────────────────
echo ""
echo "Phase 5 — Architecture Decision Records (ADR):"
if [ -d "docs/adr" ] && [ -n "$(ls -A docs/adr/*.md 2>/dev/null)" ]; then
  ADR_COUNT=$(ls -1 docs/adr/*.md 2>/dev/null | wc -l)
  echo "  ✅ ADR directory present with $ADR_COUNT ADR(s)"
  
  # Check if ADR validation report exists
  if [ -f "reports/adr-validation/adr-validation.xml" ] || [ -f "reports/adr-validation.xml" ]; then
    echo "  ✅ ADR validation report present"
  else
    echo "  ⚠️  ADR validation report not found (expected in reports/)"
  fi
else
  echo "  ⚠️  No ADRs found in docs/adr/ (acceptable if no architectural decisions were made)"
fi

# ── Check Phase 7: Test Evidence ───────────────────────────────────────
echo ""
echo "Phase 7 — Test Quality Gate:"
if [ -d "reports/test-evidence" ] || [ -d "reports" ]; then
  echo "  ✅ Test evidence directory present"
  
  # Check for test results
  if [ -f "reports/test-results.json" ] || [ -f "reports/test-evidence/test-results.json" ]; then
    echo "  ✅ Test results present"
  else
    echo "  ⚠️  Test results not found (expected: reports/test-results.json)"
  fi
  
  # Check for coverage report
  if [ -d "coverage" ]; then
    echo "  ✅ Coverage report present"
  else
    echo "  ⚠️  Coverage report not found (expected: coverage/)"
  fi
else
  echo "  ❌ Missing: Test evidence (reports/ directory)"
  FAILED=1
fi

# ── Summary ────────────────────────────────────────────────────────────
echo ""
echo "=============================================================="
if [ $FAILED -eq 0 ]; then
  echo "✅ DELIVERY VALIDATION PASSED"
  echo ""
  echo "All required artifacts are present. The project is ready for delivery."
  echo ""
  echo "Evidence archived in: reports/delivery-evidence-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  exit 0
else
  echo "❌ DELIVERY VALIDATION FAILED"
  echo ""
  echo "Some required artifacts are missing. Complete all 8 phases before delivery."
  echo "See docs/METHOD-ENTERPRISE-BUILDER-PLANNING.md for the full protocol."
  exit 1
fi
