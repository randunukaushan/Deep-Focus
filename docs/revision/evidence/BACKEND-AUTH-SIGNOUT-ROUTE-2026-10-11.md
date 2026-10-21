# Auth sign-out route candidate — 2026-10-11

## Task brief

- Outcome: connect the canonical `/v1/auth/sign-out` operation to the existing
  owner-bound app-session revocation boundary.
- Allowed scope: gateway route/admission, PostgreSQL handler composition, domain
  regression tests, changelog and this evidence record. No remote SQL or provider
  writes.
- Acceptance: exact empty JSON body; verified current session is the only target;
  a non-committed revocation result fails closed; malformed or missing sessions
  never become a successful sign-out.
- Risk: `HIGH`, because this changes authentication/session revocation routing.

## Evidence

- Focused gateway/handler tests: **46/46 PASS**.
- Typecheck: **PASS**.
- Affected lint: **PASS**.
- Full suite: **996/996 PASS**.
- Documentation checker: **PASS** (`316` markdown files, `936` local links, `80/80` requirements covered).

## Gates

- Live Supabase Auth/session revocation: `NOT_RUN`.
- RLS and disposable real-database isolation: `REVIEW_PENDING` / `NOT_RUN`.
- Android sign-out/account-switch verification: `NOT_RUN`.
- Independent qualified security review: `REVIEW_PENDING`.
- Production migration/deployment: not authorized and not performed.
