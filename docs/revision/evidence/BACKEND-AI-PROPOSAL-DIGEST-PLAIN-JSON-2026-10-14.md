# AI proposal digest plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — proposal replay identity must not change when JSON transport
coerces operation values.
VERIFICATION_STATUS: local candidate checks recorded after the focused run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live provider or database execution.

## Change

The PostgreSQL AI proposal adapter now rejects sparse arrays, symbol
properties, extra array properties, custom-prototype objects, and malformed
operation collections before digest comparison or persistence.

## Actual checks

- Focused AI proposal, apply-transaction, and apply-adapter tests: **18/18
  passed**.
- Full repository test suite after this slice: **1,509 total; 1,500 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No OpenAI call, live database, device verification, production migration,
commit, push, or package/tool download was performed.
