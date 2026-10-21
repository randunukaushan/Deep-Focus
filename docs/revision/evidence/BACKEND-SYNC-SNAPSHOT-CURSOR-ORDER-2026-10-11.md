# SQLite snapshot cursor ordering — 2026-10-11

## Implemented

Snapshot installation creates a durable pull cursor even when no incremental
change receipts exist yet. The incremental pull path now treats that cursor as
the ordering floor and rejects any new sequence at or below it. This prevents a
stale change from moving the remote mirror backwards after a snapshot.

The existing receipt replay, duplicate, conflict, account-isolation and
transaction rollback rules remain unchanged.

## Actual checks

- SQLite ownership/snapshot/sync focused tests: **45/45 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full suite after this change: **956/956 PASS**.

## Gates

Real cloud sync, Supabase RLS and Android restart/network recovery remain
`NOT_RUN`; independent review remains `REVIEW_PENDING`.

## Follow-up — committed sequence validation

The PostgreSQL pull boundary, local SQLite adapter and pull-page boundary now reject sequence `0`, which
is the initial cursor value rather than a committed server change. This keeps
the local contract aligned with the PostgreSQL `sequence > 0` constraint and
prevents an invalid page from changing the mirror or cursor.

- Sync/SQLite/server focused tests after the follow-up: **58/58 PASS**.
- TypeScript: **PASS**; affected ESLint: **PASS**; documentation check:
  **PASS**; `git diff --check`: **PASS** with existing line-ending notices.
- Full cloud/RLS, Android recovery and independent security review remain
  `NOT_RUN`/`REVIEW_PENDING`.
