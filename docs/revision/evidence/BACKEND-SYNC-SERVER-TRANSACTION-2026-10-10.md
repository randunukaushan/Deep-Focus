# Server-side sync transaction candidate — 2026-10-10

මෙය verified actor, cursor owner සහ locked sync head එක මත incremental sync
page එකක් commit කිරීමට local Supabase Edge/transaction candidate boundary එකකි.
මෙය remote function deployment හෝ production PostgreSQL write එකක් නොවේ.

## Implemented

- Actor UUID එක cursor owner UUID එකට සමානදැයි transaction එක ආරම්භ කිරීමට පෙර
  පරීක්ෂා කරයි; client payload එකක owner field එකක් විශ්වාස නොකරයි.
- Transaction store එකෙන් owner sync head එක lock කර, request cursor එක current
  head එකට නොගැළපේ නම් `SYNC_HEAD_CHANGED` ලෙස නවත්වයි.
- Sequence order, entity kind, entity ID සහ page size සීමා කරයි.
- එකම sequence එකේ එකම canonical hash එක නැවත ලැබුණොත් replay ලෙස පිළිගනී;
  වෙනස් payload එකක් නම් `SYNC_REPLAY_CONFLICT` ලෙස fail කරයි.
- New change records සහ head advancement එක එක transaction callback එකකට පමණක්
  යවයි; store rollback කිරීම caller-provided transaction එකේ වගකීමයි.

## Actual checks

- Server sync transaction focused tests — **5/5 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite — **NOT_RUN after this candidate**;
  previous verified suite **367/367 PASS**.

## Remaining gates

- Real Supabase/PostgreSQL `sync_heads` row lock, `sync_changes` insert,
  concurrent two-account execution, Edge Function authentication and remote
  integration — **NOT_RUN**.
- Independent security review, deployment and production migration —
  **REVIEW_PENDING**.

## Follow-up: signed cursor handoff — 2026-10-10

- Pull boundary එකෙන් එන signed `payload.signature` cursor එක transaction
  boundary එක හරහා අහිමි නොවී `nextCursor` ලෙස preserve කරයි.
- පැරණි single-segment opaque cursor ආකෘතියද තවම පිළිගනී; transaction layer
  එක format පමණක් පරීක්ෂා කරන අතර owner/signature/expiry verification pull
  boundary එකේම පවතී.
- Server pull + transaction + cursor focused tests: **15/15 PASS**.
- Full bundled-runtime repository suite after this follow-up: **586/586 PASS**.
- TypeScript `--noEmit`: **PASS**.
- Affected-file ESLint: **PASS**.
- Documentation checker: **PASS** (80/80 requirements, 0 errors).
- Remote PostgreSQL locking, RLS, Edge runtime, independent review සහ device
  verification තවම **NOT_RUN / REVIEW_PENDING**.
## Local outbox cleanup follow-up

The local sync coordinator now cleans its per-store in-flight marker through a
handled success/error continuation. A load failure is still returned to the
caller, but it no longer creates an unobserved rejected cleanup promise or
poisons the next retry.

- Sync focused checks — **20/20 PASS**.
- Full suite — **685/685 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Remote sync runtime, live RLS and independent review — **NOT_RUN / REVIEW_PENDING**.

- Canonical delete changes now use `payload: null` in both the server pull
  validator and ordered commit validator. Upsert changes still require a
  non-array object payload; delete hashes remain bound to the null payload.
- Delete-protocol focused checks: **12/12 PASS**.
- Full repository suite after this follow-up: **693/693 PASS**.
- TypeScript and affected ESLint: **PASS**.
- Remote runtime, RLS execution, independent security review and device
  verification: **NOT_RUN / REVIEW_PENDING**.

