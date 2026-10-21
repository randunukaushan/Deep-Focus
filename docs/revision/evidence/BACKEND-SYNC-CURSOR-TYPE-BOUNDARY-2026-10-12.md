# V1 signed cursor type-boundary evidence — 2026-10-12

## Confirmed finding

The V1 signed cursor verifier passed expected owner and clock values directly
to UUID matching and date parsing. Unsafe runtime values could throw before the
normal invalid-cursor result.

## Change

- Expected owner IDs are checked as strings before UUID matching.
- Expected clock values are checked as strings before date parsing.
- Invalid values fail before HMAC verification and cursor admission.
- Existing signature, cross-account, limit, expiry and malformed-token tests
  remain unchanged.

Focused evidence: `tests/domain/sync-cursor.test.mjs` — **6/6 passed**.
Typecheck and affected lint — **passed**.

Live sync execution, PostgreSQL/RLS isolation, device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
