# Entitlement response array boundary — 2026-10-14

## Scope

The server-shaped entitlement response validator now rejects sparse or
otherwise non-plain entitlement arrays before returning current rights. This
does not grant access or contact a provider; it only hardens the local wire
response boundary.

## Evidence

- Focused entitlement/gateway suites: `24/24 passed; 0 failed; 0 skipped`
- Full domain suite: `1519 total; 1510 passed; 0 failed; 9 skipped`
- TypeScript check: `PASS` (`tsc --noEmit --pretty false`)
- Affected-file lint: `PASS` (validator and regression test)
- Documentation check: `PASS` (`docs/revision/check-docs.mjs`)

## Gates not established here

- Live provider/entitlement verification: `REVIEW_PENDING`
- Live payment or purchase flow: `NOT_RUN`
- Android/device verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production deployment: `NOT_RUN`
