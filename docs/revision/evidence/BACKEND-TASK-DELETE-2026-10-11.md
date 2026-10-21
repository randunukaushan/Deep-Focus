# Backend task delete candidate — 2026-10-11

## Implemented

- Added an owner-bound `DELETE /v1/tasks/{id}` route to the local gateway.
- Admission requires exactly `expectedVersion`; stale, foreign or already
  deleted rows fail closed without a physical delete.
- The PostgreSQL candidate soft-deletes the task, increments its version,
  preserves historical focus-session rows, appends a null-payload task
  tombstone to the owner sync feed and finalizes the mutation receipt with the
  committed sync sequence.
- Added regression coverage for route/DTO admission, malformed and stale
  deletes, ownership/version metadata, tombstone hashing and handler wiring.

## Verification

- Task-delete affected focused set: **49/49 PASS** (including the complete
  gateway transaction handler path).
- Full repository suite: **685/685 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS** (`231` Markdown files, `936` local links).
- Git diff check: **PASS** (line-ending warnings only; no whitespace errors).

## Boundaries

This is an isolated local candidate. No Supabase SQL, production data,
deployment or remote request was performed. Reminder cancellation and live
planning-link cleanup are not guessed because their approved storage contract
is not present in this slice; they remain `REVIEW_PENDING`. PostgreSQL/RLS
runtime, independent security review and Android/device verification remain
`NOT_RUN / REVIEW_PENDING`.
