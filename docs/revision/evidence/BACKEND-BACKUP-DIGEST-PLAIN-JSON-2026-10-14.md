# Backup digest plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — backup digests must represent exactly the payload that can be
restored or exported.
VERIFICATION_STATUS: local candidate checks recorded after the focused run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or restore was performed.

## Change

Backup canonicalization now rejects sparse arrays, symbol properties, and
non-index array properties before hashing. Existing owner, digest, duplicate,
record-count, size, and all-or-nothing restore checks remain unchanged.

## Actual checks

- Focused backup and PostgreSQL backup-adapter tests: **27/27 passed**.
- Full repository test suite after this slice: **1,508 total; 1,499 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No live database, device verification, production restore/migration, commit,
push, or package/tool download was performed.
