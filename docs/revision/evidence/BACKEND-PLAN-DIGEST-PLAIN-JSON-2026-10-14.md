# Plan replication digest plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — plan replication integrity must not hash values whose transport
representation changes during JSON serialization.
VERIFICATION_STATUS: local candidate checks recorded after the focused run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

Plan replication/export canonicalization now rejects sparse arrays, symbol
properties, extra array properties, and custom-prototype objects before digest
calculation or verification. Existing plan validation and digest checks remain.

## Actual checks

- Focused plan replication tests: **7/7 passed**.
- Full repository test suite after this slice: **1,507 total; 1,498 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No live database, device verification, production migration, commit, push, or
package/tool download was performed.
