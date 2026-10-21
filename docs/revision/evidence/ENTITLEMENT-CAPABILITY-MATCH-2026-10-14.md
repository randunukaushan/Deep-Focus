# Entitlement capability matching — 2026-10-14

## Confirmed finding

The local entitlement decision checked owner, verification state, status and
expiry, but did not compare the requested capability with the capability on
the returned entitlement record.

## Change

The decision now fails closed with `capability_mismatch` when an entitlement
for `ai` is presented for `cloud_resources`, or the reverse. The server-side
authoritative adapter already performs this check and was not changed.

## Evidence

- Focused test: `tests/domain/entitlement-policy.test.mjs` — `5 passed, 0 failed`.
- Typecheck and affected lint: passed.
- Full suite: `1481 tests: 1472 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `552` Markdown files, `936` local links
  checked, `80/80` requirements covered, `0` errors.

## Boundaries

- This is local admission evidence; it is not live billing, provider or
  Supabase entitlement evidence.
- No purchase, charge, paid service, remote database or deployment was used.
- Independent security review remains `REVIEW_PENDING`.
