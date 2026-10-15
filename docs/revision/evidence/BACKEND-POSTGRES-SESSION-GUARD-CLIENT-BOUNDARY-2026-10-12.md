# PostgreSQL session-guard client boundary evidence — 2026-10-12

## Confirmed finding

The session guard assumed its database client and `query` callback were valid.
Malformed dependencies could therefore produce an unclassified TypeError at
the authentication boundary.

## Change

The guard now rejects an absent or non-callable database client with a safe
dependency failure before validating identities or issuing the session query.
Existing owner binding, active/revoked checks and row ambiguity handling remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-session-guard.test.mjs`
- Result: 5/5 passed, including malformed client dependencies.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/Auth integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
