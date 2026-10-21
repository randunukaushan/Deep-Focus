# PostgreSQL AI proposal adapter result-boundary evidence — 2026-10-12

## Confirmed finding

The proposal persistence adapter accessed query `.rows` directly in create,
load and apply paths. A malformed result container could therefore throw before
the proposal state boundary returned a safe dependency failure.

## Change

Create, replay, load and apply now share a validated result-row boundary. The
adapter also validates runner, client and transaction callback dependencies.
Owner binding, version checks, expiry, digest and state transitions remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-proposal-create-adapter.test.mjs`
- Result: 6/6 passed, including malformed dependencies and result containers.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/AI integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
