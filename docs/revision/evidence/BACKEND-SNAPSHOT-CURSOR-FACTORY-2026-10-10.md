# Snapshot cursor factory evidence — 2026-10-10

## Outcome

The pure snapshot materializer can now use an asynchronous cursor callback. A
small factory creates HMAC-signed cursors for the next page and returns `null`
for the final page, binding owner, snapshot, page count and expiry to the
signed payload.

## Acceptance evidence

- `tests/domain/snapshot-page-cursor-factory.test.mjs` plus the existing
  materializer tests: **9/9 PASS**.
- Existing synchronous cursor callbacks remain supported; the materializer
  awaits either a synchronous or asynchronous callback.
- Factory tests cover signed payload preservation, final-page `null`, invalid
  boundaries, invalid expiry and weak secret configuration.

## Boundaries

This is a local candidate only. It does not choose secret custody or rotation,
register a public endpoint, execute a remote migration, prove PostgreSQL/RLS
behavior or pass independent security review. Those remain `REVIEW_PENDING`.
