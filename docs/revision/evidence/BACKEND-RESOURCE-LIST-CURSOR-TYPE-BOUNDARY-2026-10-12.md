# Resource list cursor type-boundary evidence — 2026-10-12

## Confirmed finding

The five owner-bound list cursor verifiers passed expected owner and clock
values directly to UUID matching and date parsing. Unsafe runtime values could
throw before the normal invalid-cursor result for reminders, focus sessions,
account sessions, breaks or plans.

## Change

- All five verifiers check expected owner IDs as strings before UUID matching.
- All five verifiers check expected clock values as strings before date parsing.
- Invalid contexts fail before HMAC verification and list admission.
- Existing endpoint, owner, limit, order, expiry and tamper assertions remain
  unchanged.

Focused evidence: `tests/domain/resource-list-cursor.test.mjs` — **7/7 passed**.
Typecheck and affected lint — **passed**.

Live list reads, PostgreSQL/RLS isolation, device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
