# Backend evidence — PostgreSQL sync gateway handlers (2026-10-10)

## Implemented

The local candidate now composes verified-owner sync pull and authorized sync-page commit handlers with the PostgreSQL pull and transaction adapters. Pull uses the signed cursor contract; commit derives cursor ownership from the verified actor and uses the ordered replay/conflict transaction contract.

## Verification

- `postgres-sync-gateway-handlers.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 513/513 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local composition candidate only. No HTTP deployment, Supabase connection, remote migration, production data, or device verification was used. Independent security review and real PostgreSQL concurrency/RLS evidence remain `REVIEW_PENDING`.

## Follow-up: transaction session recheck — 2026-10-10

- Sync `pull` සහ `commit` requests දැන් verified `sessionId` එක අනිවාර්ය කරයි.
- PostgreSQL pull read සහ commit head-lock transaction දෙකම `app_sessions` row
  එක lock කර active/expiry/revocation තත්ත්වය නැවත පරීක්ෂා කරයි.
- Revoked session එකකදී sync data access කිරීමට පෙර `AUTH_REQUIRED` ලෙස
  fail-closed වන regression case එක එක් කළා.
- Sync gateway focused checks — **4/4 PASS**; related sync adapter checks —
  **28/28 PASS**; full bundled-runtime suite — **651/651 PASS**.
- Real PostgreSQL/RLS execution, independent security review සහ Android/device
  verification remain **NOT_RUN / REVIEW_PENDING**.
