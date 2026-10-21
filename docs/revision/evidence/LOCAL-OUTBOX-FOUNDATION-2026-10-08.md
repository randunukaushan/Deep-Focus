# Local Outbox Foundation — 2026-10-08

Status: IMPLEMENTED CANDIDATE — `REVIEW_PENDING`

## Scope

The Android SQLite store is now schema version 4. It adds an owner-scoped
`local_outbox` table for durable terminal focus-session mutations. The local
terminal record and its `session.terminal` outbox row are committed in one
transaction. Payloads are canonical JSON with a SHA-256 digest; duplicate
terminal retries reuse the same `terminal:<session-id>` mutation key. Pending
work is retained until an explicit acknowledgement method is called.

## Evidence

- `tests/domain/local-database-ownership.test.mjs`: 17/17 passed, including
  migration to schema v4, duplicate retry, digest-backed payload, attempt
  metadata, acknowledgement, history retention and two-account isolation.
- `tests/domain/session-boundaries.test.mjs`: 26/26 passed, including rollback
  and restart recovery after injected SQLite failures.
- The existing local migration, ownership, duplicate, corruption and recovery
  assertions remain enabled; no test was removed or weakened.

## Boundary and remaining gate

This is not server synchronization. It does not execute Supabase SQL, RLS,
Edge handlers, cursor pull/push, tombstone conflict handling, or account
export/deletion. Those remain blocked on the independent BE-02/BE-06 security
and protocol review. The outbox stores no access or refresh tokens.
