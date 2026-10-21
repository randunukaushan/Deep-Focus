# Google OAuth callback origin evidence — 2026-10-12

## Confirmed finding

The Google OAuth flow extracted a code from any successful browser-returned URL
without rechecking that the URL matched the configured Deep Focus redirect
origin and path. A code from an unexpected callback URL could therefore reach
the exchange boundary.

## Change

The flow now routes the browser callback through the existing strict redirect
parser before exchanging the code. Unexpected origins/paths and callback error
URLs are rejected without an exchange. PKCE redirect configuration,
single-use exchange coalescing and provider/session behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/auth-service.test.mjs`
- Result: 8/8 passed, including unexpected-origin no-exchange coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1384/1384 PASS** across **238** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`490` markdown files, `936` local links checked).
- Real provider callback/device verification: `NOT_RUN`; independent security
  review: `REVIEW_PENDING`.
