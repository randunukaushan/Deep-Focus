# Sync transaction stored-hash verification — 2026-10-11

## Implemented

The PostgreSQL sync transaction adapter now recomputes the canonical change
hash whenever it reads an existing change for replay. If the stored payload,
identity, operation or sequence no longer matches the stored hash, the
adapter fails closed and does not accept the replay.

## Actual checks

- Sync transaction focused tests: **10/10 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **988/988 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL concurrent replay execution, RLS/account-isolation
verification, Android/device verification and independent security review
remain `NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
