# Entitlement expiry read boundary — 2026-10-12

## Implemented

The PostgreSQL entitlement reader now rejects a stored entitlement whose
optional `expires_at` value is not a valid timestamp. This keeps malformed
server-side state from crossing the reader boundary; normal expiry admission
still remains server-authoritative.

## Actual checks

- Entitlement reader focused suite: **8/8 PASS**.
- Malformed expiry row: rejected as `DEPENDENCY_UNAVAILABLE` before a record is
  returned.
- No provider, payment, remote database or production migration was run.

## Gates

Live Supabase entitlement/RLS execution, provider webhook reconciliation,
independent security review and device verification remain `NOT_RUN` /
`REVIEW_PENDING`.
