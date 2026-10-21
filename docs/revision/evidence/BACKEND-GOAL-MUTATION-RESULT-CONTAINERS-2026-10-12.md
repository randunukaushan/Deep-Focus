# Goal mutation result-container evidence — 2026-10-12

## Implemented

`postgres-goal-applier.ts` now validates workspace and mutation result
containers for create, patch and delete operations. Ambiguous multi-row
`RETURNING` results fail closed instead of trusting the first row. Existing
goal owner, unit, period and optimistic-version checks remain unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-goal-applier.test.mjs`
- Focused result: **12/12 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1442 tests: 1436 PASS, 0 FAIL, 6 SKIPPED** across **249** test files
- Docs checker: **PASS** (`519` markdown files, `936` local links checked)

## Boundaries

- Local goal mutation candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
