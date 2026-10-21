# Backend goal patch candidate — 2026-10-10

## Implemented

- Added an owner-bound `PATCH /v1/goals/{id}` route to the local gateway
  candidate.
- Admission allows only `expectedVersion`, `title` and `description`; at least
  one editable field is required.
- The PostgreSQL candidate uses parameterized SQL, verifies the actor/resource
  identity, updates only when the expected version matches, increments the
  version in the same statement, and fails closed on a missing row or malformed
  returned metadata.
- The sync change writer now includes patched goals in the owner-bound change
  feed after the transaction succeeds.
- The PostgreSQL transaction adapter now supports an optional response
  finalizer that receives the committed sync sequence before the idempotency
  receipt is written. This is the foundation needed for canonical tombstone
  receipts; it does not activate deletion by itself.

## Verification

- Goal applier, gateway route/DTO, handler registry, sync-writer and transaction
  finalization focused set: **31/31 PASS**.
- Full repository suite: **691/691 PASS**.
- TypeScript, affected ESLint, documentation checker and diff check: **PASS**.

## Boundaries

This is an isolated local candidate. No Supabase SQL, production data,
deployment or remote request was performed. `goal.delete` remains separate and
`REVIEW_PENDING` because its canonical tombstone/receipt response needs a
different transaction result contract. PostgreSQL/RLS runtime, independent
security review and Android/device verification remain `NOT_RUN / REVIEW_PENDING`.
