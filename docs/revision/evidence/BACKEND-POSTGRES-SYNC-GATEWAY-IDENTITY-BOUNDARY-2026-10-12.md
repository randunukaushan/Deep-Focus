# PostgreSQL sync-gateway identity boundary evidence — 2026-10-12

## Confirmed finding

The sync gateway applied a UUID regular expression directly to actor and
session request values. Runtime type confusion could therefore escape the
intended validation error path before pull or commit admission.

## Change

Actor and session values now require strings and valid UUIDs before constructing
the owner-bound pull or commit stores. Session rechecks, cursor binding and
verified-owner authorization remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-gateway-handlers.test.mjs`
- Result: 6/6 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1407/1407 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`469` markdown files, `936` local links checked).
- Real PostgreSQL/Auth/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
