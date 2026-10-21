# AI Usage Route Evidence — 2026-10-11

`EX-31 GET /v1/ai/usage` now has a local gateway candidate. It requires an
active verified app session and returns the explicit `unconfigured` usage state.
The current allowance schema does not define a source allocation policy for
`free`, `paid` and `rewarded` buckets, so the route does not invent counts,
prices, providers or client grants.

Checks:

- Gateway route and handler regression checks: **13/13 PASS**
- Latest combined repository suite after migration runner: **925/925 PASS**
- TypeScript, affected ESLint, docs checker and `git diff --check`: **PASS**
- Missing/revoked session must fail before usage data: covered by the shared
  session guard contract; live database execution is **NOT_RUN**.
- Source allocation policy, live RLS, Android and independent review:
  **REVIEW_PENDING**.
