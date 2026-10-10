# Sync snapshot staging migration candidate — 2026-10-10

Sync recovery contract එකේ snapshot bootstrap එකට අවශ්‍ය metadata සහ immutable
page staging සඳහා follow-up migration candidate එකක් සකස් කළා. Existing core
tables සහ app-session registry candidate පසු dependency order එකේ පවතින මේ file
එක remote project එකට apply කර නැත.

## Implemented

- Owner-bound `sync_snapshots` metadata table: contract version, decimal
  high-water, expiry, page count, manifest digest සහ lifecycle status.
- Owner/snapshot/page composite identity සමඟ `sync_snapshot_pages` table,
  page count/index, high-water, digest, bounded cursor සහ JSON payload checks.
- Composite FK මගින් page එකක් foreign snapshot එකකට බැඳීම වැළැක්වෙයි.
- දෙකම private RLS-enabled tables; `anon`/`authenticated` direct grants නැති අතර
  server-side reviewed operation සඳහා පමණක් `service_role` grant candidate එක ඇත.
- Page completeness, digest aggregation, expiry cleanup සහ ready transition
  හිතාමතා SQL trigger එකකට නොදමා server transaction gate එකක් ලෙස තබා ඇත.

## Actual checks

- Migration contract tests — **5/5 PASS**.
- Full bundled-runtime repository suite — **344/344 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Disposable PostgreSQL execution, rollback/restart, page completeness and
  concurrent two-account RLS tests — **NOT_RUN**.
- Snapshot retention/deletion policy, server ready-state transaction,
  independent security review and remote/production migration —
  **REVIEW_PENDING**.
