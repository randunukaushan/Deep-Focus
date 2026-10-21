# SQLite v2 replay hash evidence — 2026-10-12

## Confirmed finding

SQLite v2 replay validation compared the stored group metadata and payload,
but did not read or verify the persisted per-change `change_hash` value.

## Change

Replay now reads each stored change hash, recomputes the expected hash from the
validated group change and rejects a mismatch as `SYNC_V2_REPLAY_CONFLICT`.
The existing transaction rollback and retry behavior remains unchanged.

## Evidence

- SQLite v2 focused tests: **3/3 PASS**, including persisted-hash corruption,
  duplicate replay and rollback/retry coverage.
- TypeScript typecheck and affected ESLint: **PASS**.
- Full repository suite: **1392/1392 PASS** across **238** test files.
- Docs checker: **PASS** (`495` markdown files, `936` local links checked).
- Real Expo SQLite installed-device verification and independent review:
  `NOT_RUN` / `REVIEW_PENDING`.
