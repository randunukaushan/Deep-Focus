# Goal contribution result-integrity evidence — 2026-10-12

## Implemented

`postgres-goal-contribution-applier.ts` now validates the transaction runner
and all goal, session, insert and idempotent-replay result containers. It
rejects duplicate replay rows and validates returned contribution identity,
unit, value, rule version and source version before reporting an attribution.
The existing owner-bound locking, completed-session count rule and actual
focused-time attribution remain unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-goal-contribution-applier.test.mjs`
- Focused result: **9/9 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1443 tests: 1437 PASS, 0 FAIL, 6 SKIPPED** across **250** test files
- Docs checker: **PASS** (`520` markdown files, `936` local links checked)

## Boundaries

- Local goal-attribution persistence candidate only; no live database or provider API was contacted.
- Real RLS and cross-account isolation evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
