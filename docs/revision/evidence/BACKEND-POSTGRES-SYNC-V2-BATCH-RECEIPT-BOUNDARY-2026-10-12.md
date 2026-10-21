# PostgreSQL V2 batch-receipt boundary evidence — 2026-10-12

## Implemented

`postgres-sync-v2-batch-receipt-adapter.ts` now validates runner and client
configuration, query result containers, duplicate stored rows and returned
insert identities. Stored replay receipts and newly written receipts fail
closed when their database representation is malformed; existing request-hash,
owner, response-bound and replay semantics remain unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-sync-v2-batch-receipt-adapter.test.mjs`
- Focused result: **7/7 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1332/1332 PASS**
- Docs checker: **PASS** (`444` markdown files, `936` local links checked)

## Boundaries

- Local adapter candidate only; no Supabase project or live database was
  contacted.
- Real concurrent replay and cross-account RLS evidence: `REVIEW_PENDING`.
- Android/device and offline network evidence: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
