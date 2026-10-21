# Settings identity result-integrity evidence — 2026-10-13

## Implemented

`postgres-settings-applier.ts` now requires the returned settings record
identifier to be a UUID, in addition to the existing owner, preference,
version and timestamp checks. A malformed persistence response fails closed;
optimistic-version conflicts and allowlisted settings behavior are unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-settings-applier.test.mjs`
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite before this documentation-only evidence update:
  **1453 tests: 1447 PASS, 0 FAIL, 6 SKIPPED** across **258** test files.
- Docs checker: **PASS** (`526` markdown files, `936` local links checked)

## Boundaries

- Local PostgreSQL candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
