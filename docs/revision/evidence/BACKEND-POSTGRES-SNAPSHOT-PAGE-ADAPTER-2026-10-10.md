# Backend evidence — PostgreSQL snapshot page reader (2026-10-10)

The local PostgreSQL candidate now reads a snapshot page only through an
owner-bound join to its snapshot metadata. The query requires `ready` status and
an unexpired snapshot; malformed digest, page identity, entity identity/version,
snapshot metadata mismatch, bigint high-water value or payload data fails closed.
This is a read candidate only: staging writes, manifest policy,
retention and mirror swap remain separate gates.

## Actual checks

- `postgres-snapshot-page-adapter.test.mjs`: **7/7 PASS**.
- Full bundled runtime repository suite: **522/522 PASS**.
- Remote PostgreSQL execution, snapshot rollback/restart drill, RLS review,
  independent security review and device verification: **NOT_RUN / REVIEW_PENDING**.

## Boundaries

No snapshot data, remote database, production system or deployment was touched.
