# Account bootstrap result-container evidence — 2026-10-12

## Implemented

`postgres-account-bootstrap-adapter.ts` now validates the transaction runner,
transaction client and every PostgreSQL `rows` container before reading
profile, personal-workspace or sync-head results. Malformed responses fail
closed with `DEPENDENCY_UNAVAILABLE`; invalid adapter configuration fails with
`VALIDATION_FAILED`.

## Actual verification

- Focused test: `tests/domain/postgres-account-bootstrap-adapter.test.mjs`
- Focused result: **4/4 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1430 tests: 1424 PASS, 0 FAIL, 6 SKIPPED** across **243** test files
- Docs checker: **PASS** (`512` markdown files, `936` local links checked)

## Boundaries

- Local account-bootstrap persistence candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
