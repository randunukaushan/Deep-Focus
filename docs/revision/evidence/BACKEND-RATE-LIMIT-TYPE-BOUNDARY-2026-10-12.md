# Gateway rate-limit type-boundary evidence — 2026-10-12

## Confirmed finding

Rate-limit admission passed actor IDs directly to UUID matching and trusted
the compile-time operation type. Unsafe runtime values could throw while
building the counter key instead of returning the normal validation denial.

## Change

- Actor IDs are checked as strings before UUID matching.
- Operation values are checked as strings before counter-key construction.
- Invalid values fail before the shared counter is called.
- Existing bounded 429, counter-decision and clock-limit assertions remain
  unchanged.

Focused evidence: `tests/domain/gateway-rate-limit.test.mjs` — **6/6 passed**.
Typecheck and affected lint — **passed**.

Live distributed rate limiting, database atomicity, RLS isolation and
independent security review remain `REVIEW_PENDING` or `NOT_RUN`.
