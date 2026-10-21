# Plan replication digest numeric integrity — 2026-10-12

## Implemented

Plan replication/export canonical digests now reject non-finite numbers instead
of converting them to JSON `null`. Push-size validation uses the same canonical
representation, so a malformed wire command cannot be accepted for hashing or
execution.

## Actual checks

- Plan replication wire focused suite: **6/6 PASS**.
- Non-finite transaction payload: rejected before digest acceptance.
- No remote database, migration, deployment or external service was used.

## Gates

Live plan sync, PostgreSQL/RLS execution, device recovery and independent
security review remain `NOT_RUN` / `REVIEW_PENDING`.
