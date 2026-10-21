# AI generation admission boundary evidence — 2026-10-12

## Confirmed finding

The server-authoritative AI admission factory did not validate its transaction
runner, and the transaction callback did not validate the database client
before session, entitlement or allowance work. A malformed dependency could
therefore fail outside the bounded admission path.

## Change

Runner and client guards now fail closed before state access. Request validation
still precedes dependency validation, preserving malformed-input error
precedence. Session re-check, server entitlement checks, allowance reservation,
replay handling and atomic request/job ordering remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-generation-admission-adapter.test.mjs`
- Result: 7/7 passed, including malformed runner/client coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1379/1379 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`485` markdown files, `936` local links checked).
- Real Supabase Auth/entitlement/allowance integration: `NOT_RUN`;
  independent security review: `REVIEW_PENDING`.
