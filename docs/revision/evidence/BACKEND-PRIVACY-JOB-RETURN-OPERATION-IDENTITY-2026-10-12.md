# Privacy job returned-operation identity evidence — 2026-10-12

## Implemented

`postgres-privacy-job-adapter.ts` now requires claim, complete and fail
transition results to preserve the original `operation_id`, as well as the
existing owner/job identity, lease metadata and state validation. A returned
row bound to a different operation now fails closed with
`DEPENDENCY_UNAVAILABLE`.

## Actual verification

- Focused test: `tests/domain/postgres-privacy-job-adapter.test.mjs`
- Focused result: **12/12 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1424 tests: 1418 PASS, 0 FAIL, 6 SKIPPED** across **241** test files
- Docs checker: **PASS** (`510` markdown files, `936` local links checked)

## Boundaries

- Local PostgreSQL privacy-job persistence candidate only; no live database or provider API was contacted.
- Real RLS, lease concurrency and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
