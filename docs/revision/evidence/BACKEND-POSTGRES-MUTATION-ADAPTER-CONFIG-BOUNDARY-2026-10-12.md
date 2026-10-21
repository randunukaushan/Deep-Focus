# PostgreSQL mutation adapter configuration evidence — 2026-10-12

## Confirmed finding

The mutation adapter factory assumed that its transaction runner, mutation
applier and optional sync writer were callable. Malformed dependencies could
therefore surface as runtime failures after a request reached the write path.

## Change

The factory now validates all injected write-path dependencies before returning
the domain mutation store. Existing owner-head locking, session recheck,
receipt replay, sync-sequence and receipt-write checks remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-domain-mutation-adapter.test.mjs`
- Result: 15/15 passed, including malformed dependency configuration.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
