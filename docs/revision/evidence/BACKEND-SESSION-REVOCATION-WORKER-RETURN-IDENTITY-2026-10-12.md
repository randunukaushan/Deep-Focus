# Session revocation worker returned-identity evidence — 2026-10-12

## Implemented

`postgres-app-session-revocation-worker-adapter.ts` now requires every
database-returned claim, complete and fail row to preserve both the locked
`owner_id` and `session_id`, in addition to the existing `revocation_id` and
lease/state validation. A returned row that crosses account or session
identity now fails closed with `DEPENDENCY_UNAVAILABLE`.

## Actual verification

- Focused test: `tests/domain/postgres-app-session-revocation-worker-adapter.test.mjs`
- Focused result: **5/5 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1423 tests: 1417 PASS, 0 FAIL, 6 SKIPPED** across **240** test files
- Docs checker: **PASS** (`509` markdown files, `936` local links checked)

## Boundaries

- Local PostgreSQL persistence adapter candidate only; no live database or provider API was contacted.
- Real lease concurrency and cross-account RLS evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
