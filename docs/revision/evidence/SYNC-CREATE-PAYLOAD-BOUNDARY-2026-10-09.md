# Sync create-payload boundary — 2026-10-09

## Implemented

Added a pure adapter for Task and Goal create payloads. It requires UUID-shaped
record and workspace IDs, rejects legacy IDs instead of guessing ownership,
preserves bounded optional fields, and converts local focus-time goal seconds to
the server contract's explicitly named milliseconds at the boundary. It has no
network, database, account-claim or remote-write side effects.

## Verification

- Focused builder tests: **3/3 PASS**.
- TypeScript and affected lint are run with the implementation slice.
- Bundled runtime suite after this slice: **279/279 PASS**, 0 failed.

## Pending

The authenticated `/me` workspace bootstrap, numeric server versions for local
edits, event-based session sync, outbox integration, RLS/security review and
device verification are still required before enabling remote synchronization.
