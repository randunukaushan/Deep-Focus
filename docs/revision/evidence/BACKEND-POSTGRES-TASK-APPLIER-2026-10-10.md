# Backend evidence — PostgreSQL createTask applier candidate (2026-10-10)

## Implemented

The local `createTask` SQL applier uses the verified actor from the transaction input, never a client-supplied owner field. It validates the task/workspace IDs, bounded text, priority and date/instant deadline shape, then uses parameterized SQL against `df_private.tasks`. The composite foreign keys remain responsible for workspace and goal integrity; the gateway authorization layer checks ownership before this applier is called.

## Verification

- `postgres-task-applier.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 449/449 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No SQL was sent to Supabase, no migration or production data was touched, and the applier is not release-integrated. PostgreSQL execution, RLS bypass/negative tests, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: linked-goal ownership binding — 2026-10-10

- `createTask` applier එක `goalId` තිබේ නම් goal එක verified owner සහ task
  workspace එකටම අයිතිදැයි database එකෙන් පරීක්ෂා කරයි. නොගැළපුණොත් task insert
  කිරීමට පෙර `NOT_FOUND` ලෙස නවත්වයි.
- Foreign/other-workspace goal link regression test එක එක් කළා. Remote RLS
  execution සහ independent review තවම **NOT_RUN / REVIEW_PENDING**.
- Task applier + gateway authorization focused checks — **8/8 PASS**.
- Full bundled-runtime repository suite — **602/602 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).

## Follow-up: task workspace binding — 2026-10-10

- `createTask` applier එක goal link එකක් නැති අවස්ථාවකත් workspace එක verified
  actorට අයිතිදැයි insert කිරීමට පෙර තහවුරු කරයි. Foreign workspace එකක් නම්
  `NOT_FOUND` ලෙස fail-closed වේ.
- Task applier + authorization focused checks — **9/9 PASS**.
- Remote RLS execution සහ independent review තවම **NOT_RUN / REVIEW_PENDING**.
- Full bundled-runtime repository suite — **606/606 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).
