# Session revocation worker adapter boundary evidence — 2026-10-12

## Implemented

`postgres-app-session-revocation-worker-adapter.ts` now validates its runner,
request values, database client, result containers, row cardinality and mapped
lease state for due-list, claim, complete and fail operations. This keeps
provider-revocation retry state and lease fencing fail-closed when persistence
returns malformed or ambiguous data.

## Actual verification

- Focused test: `tests/domain/postgres-app-session-revocation-worker-adapter.test.mjs`
- Focused result: **4/4 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1331/1331 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`449` markdown files, `936` local links checked)

## Boundaries

- Local worker persistence candidate only; no provider API or live database was
  contacted.
- Real lease concurrency and cross-account RLS evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
