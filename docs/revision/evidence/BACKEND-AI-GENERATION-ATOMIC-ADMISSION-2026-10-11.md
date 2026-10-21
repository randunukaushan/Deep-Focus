# Backend evidence — atomic AI generation admission candidate (2026-10-11)

Added a local PostgreSQL candidate that composes the verified app-session
recheck, server entitlement admission, usage reservation, generation request and
queued job in one caller-owned transaction. A new request reserves usage before
the request/job rows become committed. An existing pending request must already
have its reservation receipt; missing reservation state fails closed instead of
being repaired. Terminal request replays do not reserve another allowance.

The candidate is not wired into the HTTP route yet because provider selection,
reservation policy and independent review remain gates. The existing route
continues to return `POLICY_UNCONFIGURED`, so no live charge or generation is
claimed by this local candidate.

## Actual checks

- Atomic admission, request creator and usage adapter checks: **30/30 PASS**.
- Full repository regression: **1109/1109 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS** — 343 Markdown files, 80/80 requirements,
  936 local links checked.

## Boundaries

No Supabase connection, live RLS, real concurrent database transaction,
provider call, production data, deployment, payment, independent security
review or Android/device verification was used. Those remain **REVIEW_PENDING /
NOT_RUN**.
