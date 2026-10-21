# Sync hash array-shape boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — sync hashes must represent exactly the data that can cross the
transport boundary.
VERIFICATION_STATUS: focused local checks passed; full-suite evidence follows
the completed run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

Canonical sync hashing now rejects sparse arrays, symbol properties, and
non-index array properties. This prevents an array's hash representation from
silently differing from its JSON transport representation.

## Actual checks

- Focused server sync transaction and PostgreSQL adapter tests: **27/27
  passed**.
- Full repository test suite after this slice: **1,505 total; 1,496 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No live database, device verification, production migration, commit, push, or
package/tool download was performed.
