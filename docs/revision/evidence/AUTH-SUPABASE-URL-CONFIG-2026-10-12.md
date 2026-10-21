# Supabase client URL configuration evidence — 2026-10-12

## Confirmed finding

Client configuration accepted any URL with the `https:` protocol, including
URLs containing credentials, query parameters or fragments. Those values were
not needed for Supabase client configuration and could expose sensitive
configuration through the public client URL.

## Change

The URL boundary now requires an HTTPS host and rejects embedded credentials,
query data and fragments. The client still accepts only the publishable
`sb_publishable_` key; no service-role or secret key was added.

## Evidence

- Focused test: `tests/domain/supabase-client-config.test.mjs`
- Result: 1/1 passed, including unsafe URL rejection cases.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1388/1388 PASS** across **238** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`492` markdown files, `936` local links checked).
- Real mobile build/configuration verification: `NOT_RUN`; independent
  security review: `REVIEW_PENDING`.
