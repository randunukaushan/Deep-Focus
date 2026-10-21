# PostgreSQL sync gateway input boundary evidence — 2026-10-12

## Implemented

The sync gateway handler factory now validates the transaction runner, minimum
cursor-secret length and valid time window. Pull and commit request containers
are checked before actor/session validation or database access. Existing signed
cursor owner binding, session re-check and sync transaction behavior remain
unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-sync-gateway-handlers.test.mjs`
- Focused result: **5/5 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1342/1342 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`453` markdown files, `936` local links checked)

## Boundaries

- Local sync gateway candidate only; no live Supabase execution occurred.
- Real RLS, concurrent sync and Android offline/restart verification:
  `REVIEW_PENDING` / `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No production data, migration, deployment, merge, push or commit was used.
