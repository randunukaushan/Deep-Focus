# Backend goal delete candidate — 2026-10-11

## Implemented

- Added an owner-bound `DELETE /v1/goals/{id}` route to the local gateway.
- Admission requires exactly `expectedVersion`; stale, foreign or already
  deleted rows fail closed without a physical delete.
- The PostgreSQL candidate performs a soft delete, increments the entity
  version, appends a null-payload `goal` tombstone to the owner sync feed and
  finalizes a stable mutation receipt with the committed sync sequence in the
  same transaction result.
- Added regression coverage for malformed input, stale/deleted rows,
  sequence/hash parameters, null tombstone payloads and route/handler wiring.

## Verification

- Goal delete and affected gateway/sync focused set: **55/55 PASS**.
- Full repository suite: **680/680 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS** (`231` Markdown files, `936` local links).
- Git diff check: **PASS** (line-ending warnings only; no whitespace errors).

## Boundaries

This is an isolated local candidate. No Supabase SQL, production data,
deployment or remote request was performed. PostgreSQL/RLS runtime,
independent security review and Android/device verification remain
`NOT_RUN / REVIEW_PENDING`.
