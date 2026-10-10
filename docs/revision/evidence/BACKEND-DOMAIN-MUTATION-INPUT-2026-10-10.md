# Backend evidence — domain mutation input handoff (2026-10-10)

## Implemented

The caller-owned domain transaction now forwards the verified actor, operation, mutation ID, canonical request SHA-256, and validated request body to the adapter's `apply` callback. Receipt lookup/replay and the final receipt write remain inside the same transaction boundary. Malformed body shapes are rejected before opening a transaction.

## Verification

- `domain-mutation-transaction.test.mjs`: 6/6 passed, including exact adapter input and malformed-body fail-closed coverage.
- Full bundled runtime suite: 442/442 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is still a local contract candidate. No PostgreSQL adapter was connected, no remote migration or database write was performed, and independent security review/device verification remain `REVIEW_PENDING`.
