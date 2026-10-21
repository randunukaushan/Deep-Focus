# AI generation cancellation boundary evidence — 2026-10-12

## Confirmed finding

The PostgreSQL AI-generation cancellation store did not validate its runner at
factory creation or its transaction client before cancellation receipt,
request and allowance state access. A malformed dependency could therefore
fail outside the bounded cancellation path.

## Change

Runner and client guards now fail closed before state access. Request identity
validation and its error precedence remain unchanged. Receipt replay,
reservation release, optimistic request transition and terminal timestamp
preservation remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-generation-cancellation-adapter.test.mjs`
- Result: 7/7 passed, including malformed runner/client coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1380/1380 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`486` markdown files, `936` local links checked).
- Real provider/auth/allowance integration: `NOT_RUN`; independent security
  review: `REVIEW_PENDING`.
