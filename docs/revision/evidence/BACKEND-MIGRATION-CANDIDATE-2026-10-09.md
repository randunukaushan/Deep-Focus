# Backend migration candidate — 2026-10-09

මෙය approved personal-core contract එකෙන් local review සඳහා සකස් කළ migration
candidate එකකි. Supabase development project එකට මෙය apply කර නැත. Production
data, remote schema, authentication configuration සහ deployment කිසිවක් වෙනස්
කළේ නැත.

## Implemented locally

- Supabase CLI `2.120.0` එක project dependency හෝ global Node setup වෙනස් නොකර
  temporary runtime එකකින් `supabase migration new personal_core_v1` හරහා
  migration file එක නිර්මාණය කළා.
- `df_private` schema සහ profiles, workspaces, goals, tasks, focus sessions,
  focus events, mutation receipts, sync heads සහ sync changes tables ඇතුළත්.
- Owner/workspace/session/task/goal සම්බන්ධතා composite foreign keys මගින්
  cross-owner links වලක්වයි.
- Tables සඳහා RLS enable කර ඇති අතර `anon` සහ `authenticated` roles සඳහා
  direct table grants නැත. `service_role` grant එක server gateway review
  අවසන් වූ පසු පමණක් භාවිත කළ යුතු බව migration එකේ පැහැදිලි කර ඇත.
- සෑම private table එකකටම owner-bound `SELECT`, `INSERT`, `UPDATE` සහ
  `DELETE` policies explicit ලෙස තිබේ. `UPDATE` policy එක පැරණි row එකත්
  නව row එකත් `auth.uid()` සමඟ පරීක්ෂා කරයි; direct grants නැති නිසා මේවා
  client access එකක් ලෙස සැලකිය නොහැක.
- Active session uniqueness, idempotency receipt uniqueness, time units,
  status transitions සඳහා database checks ඇතුළත්.
- RPCs, triggers, credentials, server handlers සහ client-facing grants
  හිතාමතා ඇතුළත් කර නැත.

## Verification

- `tests/domain/backend-migration-contract.test.mjs` — migration structure,
  ownership constraints, RLS operation policies සහ grant boundary tests
  **3/3 PASS**.
- Bundled-runtime regression suite — **344/344 PASS** after the RLS, gateway,
  signed-cursor, server-boundary, backup-admission and entitlement slices.
  contract slices. This is a local regression result, not live Supabase
  security evidence.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- New migration test file ESLint with `--max-warnings=0` — **PASS**. A broader
  repository lint run still reports one pre-existing import-order warning in
  `tests/domain/assessment-personalization.test.mjs`; it was not changed or
  hidden by this slice.
- `node docs/revision/check-backend-contracts.mjs --details` — existing
  documentation contract checker **PASS**; එය SQL execute කරන්නේ නැත.
- Remote Supabase read-only state වෙනස් කර නැත; remote tables/migrations
  `0` ලෙස පවතින බව කලින් read-only gate එකෙන් තහවුරු කර තිබේ.

## Remaining gates

- SQL execution against an isolated disposable database: `NOT_RUN`.
- RLS penetration, migration rollback/restart and authenticated provider tests:
  `NOT_RUN`.
- Independent qualified security review: `REVIEW_PENDING`.
- Remote development migration, production migration, deployment and Android
  device verification: `NOT_AUTHORIZED` හෝ `NOT_RUN`.

මෙම file එක schema එක implemented/secure/deployed බව කියන සාක්ෂියක් නොවේ;
එය remote integration gate එකට පෙර local candidate එකක් පමණි.
