# Entitlement admission input-boundary evidence — 2026-10-13

## Implemented

`admitServerCapability` now rejects null and array runtime inputs with the
structured `invalid_actor` denial. This keeps malformed calls fail-closed and
preserves the existing server-authoritative owner, capability, entitlement,
expiry and policy checks.

## Actual verification

- Focused test: `tests/domain/entitlement-boundary.test.mjs`
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1455 tests: 1449 PASS, 0 FAIL, 6 SKIPPED** across
  **258** test files.
- Docs checker: **PASS** (`530` markdown files, `936` local links checked)

## Boundaries

- Local server-authoritative candidate only; no live entitlement provider or database was contacted.
- Pricing, payments and paid-service activation remain disabled/pending.
- Independent security review and device verification: `REVIEW_PENDING` / `NOT_RUN`.
- No migration, deployment, merge, push or commit was performed.
