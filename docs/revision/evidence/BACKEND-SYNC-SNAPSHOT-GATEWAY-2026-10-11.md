# Backend evidence: sync snapshot read gateway candidate

Date: 2026-10-11

## Implemented

- Added `GET /v1/sync/snapshots/{id}` for owner-bound ready snapshot metadata.
- Added `GET /v1/sync/snapshots/{id}/pages?cursor=...` for signed, opaque page
  reads. A missing cursor or extra query field is rejected before storage.
- Reused the existing PostgreSQL metadata/page/cursor handlers, which recheck
  the app session, bind owner and snapshot identity, reject expired data and
  return privacy-preserving not-found results.
- Missing snapshot cursor configuration fails closed; no client page index or
  owner selector is trusted.

## Evidence

- Gateway and snapshot focused tests: **36/36 PASS**.
- TypeScript: **PASS**.
- Full suite immediately before this snapshot wiring: **844/844 PASS**.

## Boundaries

This is a local candidate. Snapshot creation/queueing, remote Supabase
execution, live RLS/two-account tests, Android/device verification and
independent security review remain `REVIEW_PENDING`/`NOT_RUN`.
