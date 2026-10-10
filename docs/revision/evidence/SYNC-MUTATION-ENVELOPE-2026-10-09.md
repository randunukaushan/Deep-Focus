# Sync mutation envelope — 2026-10-09

## Implemented

Added a pure Task/Goal create-mutation draft around the existing validated
payload builders. Each draft carries a caller-supplied UUID idempotency key,
the already verified actor UUID, the verified workspace UUID, an explicit
operation name and the validated payload. Invalid actor, workspace or mutation
IDs fail closed. The draft does not enqueue, send, claim an account or write a
database; remote delivery remains behind the backend authorization gate.

## Verification

- Focused mutation-builder tests: **5/5 PASS**.
- TypeScript `--noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- Bundled runtime suite after this slice: **286/286 PASS**, 0 failed.

## Pending

Server-side idempotency receipts, RLS enforcement, numeric version handling,
event-based session sync, outbox integration and independent security review
are still required before these drafts may drive remote writes. Android device
verification remains `NOT_RUN`.
