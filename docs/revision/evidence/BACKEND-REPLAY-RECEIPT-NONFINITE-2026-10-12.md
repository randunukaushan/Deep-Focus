# Replay and receipt non-finite number evidence — 2026-10-12

## Result

The local personal API replay hash no longer converts `NaN` or infinite
numbers to JSON `null`. The V2 batch receipt boundary also rejects those
values before writing a durable replay receipt.

Focused checks:

- `tests/domain/personal-api-gateway.test.mjs`: 13/13 passed.
- `tests/domain/sync-v2-batch-receipt.test.mjs`: 7/7 passed.

## Scope and gates

This is a local candidate only. No live Supabase database, migration,
deployment or production data was used. Provider replay, live RLS, Android
device evidence and independent security review remain `REVIEW_PENDING` or
`NOT_RUN`.
