# Backend analytics summary evidence

## Scope

Implemented the local EX-17 `GET /v1/analytics/summary` candidate. The route
accepts only `start`, `end` and `timeZone`, uses a reviewed maximum range, and
returns the canonical period, projection metadata and verified summary shape.

## Data and safety boundaries

- Focus totals count only completed, owner-bound focus sessions and use the
  persisted `focused_ms` value.
- Task totals count only completed, owner-bound tasks in the requested
  half-open period.
- `sourceSequence` is read from the owner's sync-change stream and
  `ruleVersion` is explicit (`analytics-summary-v1`).
- The SQL binds the verified actor ID; it does not accept an owner ID from the
  request.
- If no reviewed `analyticsMaxRangeMs` policy is configured, the route fails
  closed with `DEPENDENCY_UNAVAILABLE` rather than inventing a range policy.

## Verification

- Focused route, query-admission, handler-registry and validation checks:
  **43/43 passed**.
- Typecheck, source lint, full test suite and documentation checks remain part
  of the final verification run for this slice.

## Pending gates

- Live Supabase RLS and two-account isolation: `REVIEW_PENDING` / `NOT_RUN`.
- Live freshness and production query-plan evidence: `REVIEW_PENDING`.
- Independent security review and Android/device verification: `REVIEW_PENDING`
  / `NOT_RUN`.

This is an implementation candidate, not evidence of a production database
deployment or production readiness.
