# Backend AI usage projection evidence

## Scope

Added a local EX-31 response projection for server-authoritative AI usage.
It aggregates only server-provided allowance buckets and exposes no client
grant, price, provider credential or billing decision.

## Safety behavior

- `unconfigured` and `unavailable` responses contain only null availability,
  policy, timestamp, bucket and action fields.
- Current responses require a bounded policy version, valid timestamps, unique
  supported bucket sources and unique approved action names.
- Aggregate available/reserved counts are recomputed from buckets and checked
  for safe integer overflow.
- This slice is read-only; reservation/settlement remains behind the existing
  server transaction boundary.

## Verification

- Focused projection tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Live entitlement/allowance storage, Supabase RLS, provider execution and
independent security review remain `REVIEW_PENDING`; no paid service or live
grant was enabled.
