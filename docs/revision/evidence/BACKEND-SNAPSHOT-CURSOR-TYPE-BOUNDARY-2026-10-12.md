# Snapshot page cursor type-boundary evidence — 2026-10-12

## Confirmed finding

Snapshot page cursor verification passed expected owner, snapshot and clock
values directly to UUID matching and date parsing. Unsafe runtime values could
throw before the normal invalid-cursor result at the snapshot ownership
boundary.

## Change

- Expected owner and snapshot IDs are checked as strings before UUID matching.
- Expected clock values are checked as strings before date parsing.
- Invalid contexts fail before HMAC verification and page admission.
- Existing owner, snapshot, page-range, expiry, tamper and secret assertions
  remain unchanged.

Focused evidence: `tests/domain/snapshot-page-cursor.test.mjs` — **6/6 passed**.
Typecheck and affected lint — **passed**.

Live snapshot reads, PostgreSQL/RLS isolation, device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
