# Settings update returned-row cardinality evidence — 2026-10-12

## Implemented

`postgres-settings-applier.ts` now rejects more than one row from the
owner/version-bound `UPDATE ... RETURNING` statement. It no longer chooses the
first row from an ambiguous database response.

## Actual verification

- Focused test: `tests/domain/postgres-settings-applier.test.mjs`
- Focused result: **3/3 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **NOT RUN in this slice** (latest recorded result: **1430 tests: 1424 PASS, 0 FAIL, 6 SKIPPED** across **243** test files)
- Docs checker: **NOT RUN in this slice** (latest recorded result: **PASS**, 513 markdown files)

## Boundaries

- Local settings mutation candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
