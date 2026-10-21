# V2 signed cursor type-boundary evidence — 2026-10-12

## Confirmed finding

V2 cursor verification passed the expected owner directly to UUID matching and
the expected clock directly to date parsing. Unsafe runtime values could throw
before the signed cursor returned its normal invalid result.

## Change

- Expected owner IDs are checked as strings before UUID matching.
- Expected clock values are checked as strings before date parsing.
- Invalid values fail before HMAC verification and cursor admission.
- Existing signature, cross-account, limit, expiry and bigint-range assertions
  remain unchanged.

Focused evidence: `tests/domain/sync-v2-cursor.test.mjs` — **4/4 passed**.
Typecheck and affected lint — **passed**.

Live sync execution, PostgreSQL/RLS isolation, device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
