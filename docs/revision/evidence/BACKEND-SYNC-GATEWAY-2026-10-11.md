# Backend evidence: sync gateway candidate

Date: 2026-10-11

## Implemented

- Added `GET /v1/sync/pull` and `POST /v1/sync/push` to the local gateway
  route allowlist.
- Push requests accept only the bounded cursor/change DTO and reject malformed
  sequence values, unknown entity kinds, foreign-shaped fields and invalid
  delete payloads before domain execution.
- Pull requests accept only the signed cursor and bounded limit query; the
  existing cursor binds owner, endpoint, limit, high-water mark and expiry.
- Both handlers require the verified app session and reuse the existing
  owner-scoped PostgreSQL sync adapters for transaction locking, replay and
  hash-conflict handling.
- Missing sync secret/configuration fails closed as a dependency error; no
  client owner ID is accepted.

## Evidence

- Gateway route, DTO and handler focused tests: **33/33 PASS**.
- TypeScript: **PASS**.
- Existing sync adapter, cursor, replay and recovery tests remain in the full
  repository suite; no test was removed or weakened.

## Boundaries

This is a local implementation candidate. No remote Supabase database,
production migration, deployment or device run was performed. Live RLS,
two-account isolation, provider session verification and independent security
review remain `REVIEW_PENDING`/`NOT_RUN`.
