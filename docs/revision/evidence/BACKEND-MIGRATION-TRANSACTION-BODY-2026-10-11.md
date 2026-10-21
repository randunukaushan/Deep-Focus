# Migration transaction-body execution — 2026-10-11

## Implemented

The PostgreSQL migration runner candidate still checksums the complete local
migration file, including its required `BEGIN`/`COMMIT` wrapper. When the
caller supplies an already-open transaction, the adapter now sends only the
validated body to the client. This avoids nested transaction-control commands
while preserving the same receipt identity and checksum.

Empty bodies and nested `BEGIN`, `COMMIT` or `ROLLBACK` commands fail before
SQL execution. Destructive SQL remains rejected by the existing guard.

## Actual checks

- PostgreSQL migration-runner adapter focus: **5/5 PASS**.
- Full repository suite: **1225/1225 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Gates

Actual PostgreSQL execution, rollback/restart rehearsal, independent SQL
security review and production migration remain `NOT_RUN` / `REVIEW_PENDING`.
No remote database, deployment or commit was performed.
