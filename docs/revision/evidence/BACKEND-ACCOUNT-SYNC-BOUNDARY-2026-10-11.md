# Account sync boundary — 2026-10-11

## Scope

This is a local composition candidate between the verified account/session
owner, the owner-scoped SQLite outbox and the remote sync pusher. It does not
activate network sync from app startup and does not connect to Supabase.

## Safety behavior

- Missing verified owner or endpoint returns `unavailable` without a network
  call.
- The remote adapter receives only the bearer token returned by the injected
  access-token provider.
- The outbox coordinator rechecks the owner across the push boundary, so a
  changed account cannot consume the old response.
- No owner field is added to the client payload.

## Actual checks

- Boundary-focused tests: **3/3 PASS**.
- Existing sync-focused tests: **20/20 PASS**.
- Latest full suite: **1189/1189 PASS**.
- Runtime activation, live Supabase/RLS, Android recovery and independent
  security review: **REVIEW_PENDING / NOT_RUN**.

The boundary remains intentionally unconnected until the reviewed endpoint and
runtime session lifecycle are admitted.
