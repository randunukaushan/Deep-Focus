# Snapshot payload non-finite number evidence — 2026-10-12

## Result

The local snapshot payload boundary now rejects `NaN` and infinite numbers
before storage. PostgreSQL snapshot retry comparison also fails closed when a
malformed stored page contains a non-finite number; it does not treat the
value as JSON `null` or publish the snapshot.

Focused checks:

- `tests/domain/snapshot-payload-boundary.test.mjs`: 3/3 passed.
- `tests/domain/postgres-snapshot-staging-adapter.test.mjs`: 13/13 passed.

## Scope and gates

This is a local candidate only. No live database, migration, deployment,
production data or remote RLS execution was used. Live account-isolation,
device recovery and independent security review remain `REVIEW_PENDING` or
`NOT_RUN`.
