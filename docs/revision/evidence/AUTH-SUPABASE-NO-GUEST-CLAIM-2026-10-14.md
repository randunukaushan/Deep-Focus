# Supabase provider no-guest claim boundary — 2026-10-14

## Confirmed finding

The approved product decision does not support guest mode, but the provider
claims adapter validated only the user/session identity fields. A verified
provider response that explicitly marked the identity as anonymous could pass
that adapter unless a later layer happened to reject it.

## Change

The server-only Supabase claims adapter now fails closed when
`is_anonymous === true`. The existing provider verification, UUID/session,
issuer, audience and expiry checks remain unchanged. Claims that omit this
optional marker continue through the provider's normal verified-claims path;
absence is not treated as proof of anonymity.

## Evidence

- Focused test: `tests/domain/supabase-provider-session-verifier.test.mjs` —
  `5 passed, 0 failed`.
- Full suite: `1484 tests, 1475 passed, 0 failed, 9 skipped`.
- Typecheck: passed. Affected lint: passed.
- Documentation checker: `PASS`; `555` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live Supabase Auth, real token revocation, RLS and two-account isolation:
  `NOT_RUN` / `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No provider call, secret, live database, migration, deployment or package
  installation was used.
- This rejects an explicit anonymous claim; it does not claim that a live Auth
  project has been configured or that provider claim behavior has been
  independently verified.
