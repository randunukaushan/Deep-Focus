# Usage allowance ledger migration candidate — 2026-10-10

Server-authoritative AI/cloud allowance සහ replay receipt සඳහා private,
versioned Supabase migration candidate එකක් එකතු කළා. මෙය local artifact එකක්
පමණි; development project එකට remote apply කරලා නැහැ.

## Implemented

- Owner/capability/period composite primary key සහ bounded allowance counters.
- `consumed_units + reserved_units <= limit_units` integrity check.
- Owner/receipt composite primary key සහ allowance row වෙත composite foreign key.
- Receipt units 1–1000 අතර සීමා කර ඇත; duplicate receipt replay එක database key
  එකෙන් වැළැක්වේ.
- RLS enabled; `public`, `anon`, `authenticated` වෙත direct grants නැති අතර
  `service_role` පමණක් server-side access ලබයි.

## Actual checks

- Backend migration contract + usage boundary checks — **12/12 PASS**.
- Full bundled-runtime repository suite — **352/352 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- Docs checker — **PASS**.

## Remaining gates

- Isolated PostgreSQL execution, lock/concurrency tests, actual reservation
  transaction and receipt consumption/release flow — **NOT_RUN**.
- Independent security review, remote migration, production data and billing
  provider integration — **REVIEW_PENDING**.
