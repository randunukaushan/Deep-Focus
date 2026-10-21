# Sync pull plain-JSON payload boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — owner-bound sync data must not be silently changed by JSON
transport coercion.
VERIFICATION_STATUS: local candidate checks passed.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live Supabase request or deployment.

## Change

The server sync pull and PostgreSQL adapter now reject non-plain JSON payload
values, including `Date`, custom-prototype objects, and `undefined`, before
size validation, hashing, cursor signing, or return to the client. Existing
size, finite-number, owner, hash, ordering, and failure assertions remain.

## Actual checks

- Focused sync pull and adapter tests: **23/23 pass**.
- Full repository test suite after the related sync-hash slice: **1,505 total;
  1,496 passed; 0 failed; 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS**; errors `0`.

## Limits

No live database, device verification, production migration, commit, push, or
package/tool download was performed. This is not proof of live RLS or Edge
runtime behavior.
