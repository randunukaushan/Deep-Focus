# Gateway mutation hash plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — idempotency hashes must not differ from the request data after
transport serialization.
VERIFICATION_STATUS: local candidate checks recorded after the focused run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live gateway request or deployment.

## Change

Gateway mutation canonicalization now rejects sparse arrays, symbol properties,
extra array properties, and custom-prototype objects before hashing.

## Actual checks

- Focused gateway mutation hash tests: **4/4 passed**.
- Full repository test suite after this slice: **1,510 total; 1,501 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No live gateway, database, deployment, commit, push, or package/tool download
was performed.
