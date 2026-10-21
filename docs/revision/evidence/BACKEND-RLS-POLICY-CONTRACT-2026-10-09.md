# Backend RLS policy contract — 2026-10-09

මෙය `df_private` local migration candidate එකේ ownership-policy slice එකේ
evidence එකකි. Remote `deep-focus-dev` project එකට migration apply කරලා නැත;
production data, deployment සහ live traffic කිසිවක් වෙනස් කරලා නැත.

## Implemented

- `profiles`, `workspaces`, `goals`, `tasks`, `focus_sessions`, `focus_events`,
  `mutation_receipts`, `sync_heads` සහ `sync_changes` සඳහා owner-bound
  `SELECT`, `INSERT`, `UPDATE` සහ `DELETE` policies explicit කර ඇත.
- `UPDATE` policy එක පැරණි row එකත් නව row එකත් verified `auth.uid()` සමඟ
  ගැළපෙන බව පරීක්ෂා කරයි; එබැවින් ownership reassignment එක policy මට්ටමේදී
  අවහිර වේ.
- `anon` සහ `authenticated` direct table grants තවමත් revoke කර ඇත. ඒ නිසා
  මේ migration එක live client access එකක් සක්‍රිය කළා කියලා අදහස් නොවේ.

## Actual checks

- `node --test tests/domain/backend-migration-contract.test.mjs` — **3/3 PASS**.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/eslint/bin/eslint.js tests/domain/backend-migration-contract.test.mjs --max-warnings=0` — **PASS**.
- Full direct Node 20 suite invocation — **NOT_COMPARABLE**: 103/143 passed,
  40 files failed before assertions because this shell's Node 20 runner cannot
  load the repository's TypeScript modules or `node:sqlite`. This is a runner
  limitation, not a claim that the backend slice caused those failures. The
  repository's previously recorded bundled-runtime baseline remains separate.
- Correct bundled Node runtime repository suite — **344/344 PASS**. This
  confirms regression compatibility only; it does not execute PostgreSQL or
  prove live RLS isolation.

## Remaining gates

- Isolated PostgreSQL/Supabase SQL execution and two-account RLS penetration
  tests — **NOT_RUN**.
- Authenticated provider/session revocation and Edge Function verification —
  **NOT_RUN**.
- Independent qualified security review — **REVIEW_PENDING**.
- Remote migration, deployment, production data and Android device verification
  — **NOT_AUTHORIZED** or **NOT_RUN**.
