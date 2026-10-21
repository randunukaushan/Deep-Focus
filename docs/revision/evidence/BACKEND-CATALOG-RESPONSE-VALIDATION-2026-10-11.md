# Backend catalog response validation evidence

## Scope

Added the EX-29 catalog-response foundation. It validates the documented
`ios|android|web` surface hint, current/unconfigured/unavailable response
states, bounded published-offer metadata, unique offer IDs and provider-shaped
price freshness fields.

## Safety behavior

- The surface is only a display hint; this validator does not authorize a
  purchase or derive eligibility from client country, price or product IDs.
- `unconfigured` and `unavailable` responses contain null offers and freshness
  metadata, so they cannot fabricate a free catalog.
- Prices are accepted only as server-shaped nonnegative decimal strings with
  currency, fraction digits, provider source and freshness; no price or
  provider was selected by this slice.
- No live catalog, checkout, payment, store callback or provider mapping was
  added.

## Verification

- Focused catalog validator tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Merchant/provider selection, actual store eligibility and currency/tax/period
disclosure verification, live billing/RLS integration, independent security
review and production billing remain `REVIEW_PENDING`.
