# PostgreSQL sync delete replay — 2026-10-11

## Implemented

The PostgreSQL sync transaction adapter now validates stored changes according
to operation semantics: upserts require an object payload, while deletes must
retain their canonical `null` payload. Valid delete changes can therefore be
replayed idempotently after a lost response instead of being misclassified as
malformed storage data. Sequence, owner, entity and hash fields are validated
at the same boundary.

## Actual checks

- Sync transaction/pull focused tests: **42/42 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **961/961 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Live Supabase execution, real RLS/account isolation, Android network/restart
recovery and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
