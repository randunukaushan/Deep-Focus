# Backend evidence — PostgreSQL entitlement reader (2026-10-10)

## Implemented

The local candidate now stores and reads generic server-authoritative capability records for `ai` and `cloud_resources`. Reads are owner/capability bound, require the database verification marker `server`, and preserve policy version and expiry data for the existing capability admission boundary. The composed adapter passes the database result into the server-only admission policy; no provider, catalog, price, or client-grant field is trusted as authorization.

## Verification

- `postgres-entitlement-adapter.test.mjs` and `postgres-capability-admission.test.mjs`: 7/7 passed, including foreign-owner isolation.
- Full bundled runtime suite: 504/504 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

The schema and reader are local candidates only. Provider billing/catalog writes, live charges, Supabase execution, RLS review, independent security review, and release/device verification remain `REVIEW_PENDING`.

## Follow-up: exact owner/capability binding — 2026-10-10

- Database row එක requested owner ID සහ capability සමඟ exact match නොවුණොත්
  entitlement mapper එක `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ.
- Foreign-shaped storage row සඳහා account-isolation regression test එක එක් කළා.
- Remote entitlement execution, RLS/security review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Entitlement, capability-admission and isolation focused checks — **13/13 PASS**.
- Full bundled-runtime repository suite — **599/599 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).
- Entitlement, capability-admission and policy focused checks — **14/14 PASS**.
- Full bundled-runtime repository suite — **607/607 PASS**.

## Follow-up: session-bound capability read — 2026-10-10

- The entitlement reader now requires and rechecks the verified app session
  before reading the server-authoritative capability row.
- Usage reserve/read composition passes the same required session ID into the
  entitlement reader after its transaction-level session check; the internal
  boundary cannot silently fall back to an unbound entitlement read.
- A revoked, expired, missing or foreign session cannot reach AI/cloud
  entitlement data.
- Entitlement, capability-admission and usage focused checks — **29/29 PASS**.
- Full bundled-runtime repository suite after the contract hardening —
  **675/675 PASS**.
- Live provider/billing integration, remote PostgreSQL/RLS execution,
  independent security review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
