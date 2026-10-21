# Sync payload canonicalization — 2026-10-12

## Implemented

Server sync validation and hashing now use the same strict canonical JSON
representation. Nested `NaN`, positive infinity and negative infinity values
are rejected before a transaction opens; they cannot be silently coerced to
`null` and later persisted under a misleading hash. The owner-bound pull
validator rejects the same values before signing a continuation cursor.
The PostgreSQL pull adapter also maps malformed stored values to its safe
dependency failure before hash verification.
The PostgreSQL mutation-to-sync writer also rejects malformed committed
payloads before insertion and maps hash failures safely.

## Actual checks

- Server sync transaction focused suite: **11/11 PASS**.
- Non-finite nested payload regression: rejected before transaction access.
- Pull response non-finite nested payload: rejected before cursor signing.
- PostgreSQL pull non-finite stored payload: mapped to `DEPENDENCY_UNAVAILABLE`.
- PostgreSQL mutation-to-sync non-finite payload: rejected before insertion.
- Full repository suite after this slice: recorded after the final check.
- No remote database, production migration or deployment was run.

## Gates

Live PostgreSQL replay/concurrency, RLS, device recovery and independent
security review remain `NOT_RUN` / `REVIEW_PENDING`.
