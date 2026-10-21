# PostgreSQL sync pull adapter validation — 2026-10-11

The owner-bound PostgreSQL sync read adapter now rejects a zero sequence even
if an inconsistent storage result bypasses the SQL `sequence > after` filter.
This keeps the server adapter aligned with the positive sequence contract used
by the pull boundary and SQLite client.

Cursor continuations also compare the signed high-water value with the current
database high-water inside the same transaction. A database rollback is now
reported as a dependency failure before an empty page can advance recovery.

Focused PostgreSQL sync adapter and gateway checks: **24/24 PASS**.
TypeScript and affected ESLint: **PASS**. Full repository suite after this
slice: **959/959 PASS**. Documentation check and `git diff --check`: **PASS**.

This remains local candidate code. Live Supabase execution, RLS/account
isolation, Android recovery and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
