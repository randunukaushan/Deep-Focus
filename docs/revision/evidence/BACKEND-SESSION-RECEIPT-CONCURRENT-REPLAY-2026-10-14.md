# Account-session receipt concurrent replay — 2026-10-14

## Confirmed finding

The account-session revocation plan already replayed a receipt found before
planning, but two requests with the same owner and mutation ID could both see
no receipt before either insert committed. The later insert could then surface
an unbounded database uniqueness error rather than using the original frozen
receipt or returning a bounded idempotency conflict.

## Change

The PostgreSQL receipt adapter now uses `ON CONFLICT (owner_id, mutation_id)
DO NOTHING`. When another transaction wins the insert, the adapter locks and
reads the stored receipt: matching request digests return the frozen target
set, while a different digest returns `IDEMPOTENCY_CONFLICT`. The plan layer
accepts a returned frozen receipt so a concurrent replay cannot replace the
original target set with a newly calculated one.

## Evidence

- Focused tests: `tests/domain/postgres-app-session-adapter.test.mjs` and
  `tests/domain/app-session-revocation-plan.test.mjs` — `28 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1486 tests, 1477 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `556` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live PostgreSQL concurrency, RLS and provider revocation: `NOT_RUN` /
  `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No live database, migration application, deployment, package installation,
  commit or push was performed.
- The local candidate preserves the existing transaction-owner boundary and
  does not change provider credentials or revocation policy.
