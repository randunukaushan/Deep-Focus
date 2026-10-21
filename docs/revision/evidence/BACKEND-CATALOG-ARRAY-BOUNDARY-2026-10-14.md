# Catalog response array boundary — 2026-10-14

## Scope

The server-shaped catalog validator now rejects sparse or otherwise non-plain
arrays for offers, capabilities and supported territories before returning a
catalog projection. This protects subscription metadata display without
selecting a provider, price or live purchase flow.

## Evidence

- Focused catalog/gateway suites: `24/24 passed; 0 failed; 0 skipped`
- Full domain suite: `1518 total; 1509 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (catalog validator and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live provider/catalog verification: `REVIEW_PENDING`
- Live payment or purchase flow: `NOT_RUN`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production deployment: `NOT_RUN`
