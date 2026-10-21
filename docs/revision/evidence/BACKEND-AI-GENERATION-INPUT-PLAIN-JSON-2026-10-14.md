# AI generation input plain-JSON boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — server-authoritative AI request identity must bind to the exact
input snapshot and version data, not a silently coerced JSON form.
VERIFICATION_STATUS: local candidate checks recorded after the focused run.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no provider or live database call.

## Change

AI generation request creation now rejects non-plain JSON snapshot and version
values before serializing or opening the database transaction. Existing size,
identity, deadline, replay, reservation and job checks remain.

## Actual checks

- Focused AI generation request creator tests: **11/11 passed**.
- Full repository test suite after this slice: **1,513 total; 1,504 passed;
  0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No OpenAI call, live database, device verification, production migration,
commit, push, or package/tool download was performed.
