# Backend entitlement response validation evidence

## Scope

Added the EX-28 canonical entitlement-response validator. It validates the
documented current/unavailable envelope, bounded entitlement entries, IDs,
states, approved sources and timestamps.

## Safety behavior

- `unavailable` responses must contain null freshness, catalog and entitlement
  fields, with no fabricated empty rights list.
- Current responses require the full server-shaped grant/license/scope/source
  metadata and reject unknown billing states or client sources.
- This validator does not map the existing local entitlement table into billing
  rights; that mapping remains pending because the current table lacks the
  canonical billing identifiers.

## Verification

- Focused validator tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Canonical billing-provider mapping, live entitlement/RLS verification,
independent security review and production billing remain `REVIEW_PENDING`.
