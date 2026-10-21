# Gateway owner-route coverage evidence — 2026-10-12

## Scope

Task deletion, goal patch/deletion and goal-progress routes now perform the
same gateway-level owner lookup as their other direct-resource operations. A
foreign resource is returned as `NOT_FOUND` before its handler can run.

## Automated evidence

- `tests/domain/gateway-authorization.test.mjs`: **9/9 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is local authorization-boundary evidence only. Live Supabase RLS,
two-account PostgreSQL execution, Android/device verification and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
