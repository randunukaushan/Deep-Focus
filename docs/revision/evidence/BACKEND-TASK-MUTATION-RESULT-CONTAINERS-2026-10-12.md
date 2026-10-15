# Task mutation result-container evidence — 2026-10-12

## Implemented

`postgres-task-applier.ts` now validates database result containers across
task patch, soft-delete and action transitions. Ambiguous multi-row reads or
`RETURNING` results fail closed, while zero-row version conflicts and
owner/version SQL predicates retain their existing behavior.

## Actual verification

- Focused tests: `tests/domain/postgres-task-applier.test.mjs`, `tests/domain/postgres-task-patch-applier.test.mjs`, `tests/domain/postgres-task-delete-applier.test.mjs`, `tests/domain/postgres-task-action-applier.test.mjs`
- Focused result: **29/29 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1441 tests: 1435 PASS, 0 FAIL, 6 SKIPPED** across **248** test files
- Docs checker: **PASS** (`518` markdown files, `936` local links checked)

## Boundaries

- Local task mutation candidates only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
