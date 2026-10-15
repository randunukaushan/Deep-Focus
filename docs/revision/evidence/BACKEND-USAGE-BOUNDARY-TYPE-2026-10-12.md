# Server usage boundary type evidence — 2026-10-12

## Confirmed finding

The usage reservation and settlement paths passed actor and receipt values
directly to a UUID regular expression. Reservation also called `.trim()` on the
period key without first checking its type. Unsafe runtime values could throw
before the server-authoritative quota boundary returned a denial.

## Change

- UUID checks now require string values before regex matching.
- Reservation period keys now require strings before trimming.
- Invalid identity/period values return `invalid_request` before receipt or
  allowance reads and before writes.
- Existing quota limits, entitlement-policy matching, duplicate replay,
  provider-settlement and transition assertions were retained.

Focused evidence: `tests/domain/usage-boundary.test.mjs` — **15/15 passed**.
Typecheck and affected lint — **passed**.

This is local boundary evidence only. Live Supabase quota/RLS execution,
provider integration, Android/device verification and independent security
review remain `REVIEW_PENDING` or `NOT_RUN`.
