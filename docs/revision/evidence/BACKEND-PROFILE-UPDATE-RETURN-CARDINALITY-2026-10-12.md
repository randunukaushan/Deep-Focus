# Profile update returned-row cardinality evidence — 2026-10-12

## Implemented

`postgres-profile-applier.ts` now rejects more than one row from the
owner/version-bound `UPDATE ... RETURNING` statement. It no longer chooses the
first row from an ambiguous database response.

## Actual verification

- Focused test: `tests/domain/postgres-profile-applier.test.mjs`
- Focused result: **4/4 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1430 tests: 1424 PASS, 0 FAIL, 6 SKIPPED** across **243** test files
- Docs checker: **PASS** (`513` markdown files, `936` local links checked)

## Boundaries

- Local profile mutation candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
