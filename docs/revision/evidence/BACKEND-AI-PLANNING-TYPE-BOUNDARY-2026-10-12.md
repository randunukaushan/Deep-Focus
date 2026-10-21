# Server AI planning type-boundary evidence — 2026-10-12

## Confirmed finding

The server AI planning boundary passed actor, session and receipt values
directly to UUID matching, and passed the creation clock directly to date
parsing. Unsafe JavaScript runtime values could therefore throw before the
boundary returned its safe validation error.

## Change

- Identity values are checked as strings before UUID matching.
- The creation clock is checked as a string before date parsing.
- The same identity guard is used before confirmed-plan application.
- Invalid values stop before provider calls, allowance operations and the
  confirmed-plan server callback.
- Existing confirmation-token, revoked-session, provider-failure, allowance
  settlement and safe-error assertions remain unchanged.

Focused evidence: `tests/domain/server-ai-planning-boundary.test.mjs` —
**10/10 passed**.
Typecheck and affected lint — **passed**.

This remains local candidate evidence. Live provider/allowance execution,
Supabase RLS, Android/device verification and independent security review are
still `REVIEW_PENDING` or `NOT_RUN`.
