# Backend management-link validation evidence

## Scope

Added the EX-30 management-link security foundation. It accepts only an
owned-looking UUID license reference, validates provider-shaped link metadata,
and constrains destinations to an explicitly configured HTTPS origin allowlist.

## Safety behavior

- Client return URLs and arbitrary provider destinations are not accepted.
- Credentials, unexpected ports, fragments, non-HTTPS and scheme-relative URLs
  are rejected.
- Non-empty redirect chains are rejected; a provider adapter must return one
  final allowlisted destination.
- No provider, license lookup, checkout, live redirect or management action was
  added. Ownership must still be checked by trusted server storage before use.

## Verification

- Focused management-link tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Provider-specific destination allowlists, owned-license database lookup, live
billing integration, redirect behavior, independent security review and
production billing remain `REVIEW_PENDING`.
