# Backend evidence — PostgreSQL security migration contracts (2026-10-10)

Local migration contract tests now check that the server entitlement, allowance,
receipt and app-session candidates keep owner identity and capability boundaries,
RLS, bounded counters, foreign-key relationships and service-role-only access
explicit in the SQL. These are static migration checks; they do not claim that
the SQL has been executed in Supabase.

## Actual checks

- `postgres-security-migration-contract.test.mjs`: **6/6 PASS**.
- Full bundled runtime repository suite: **511/511 PASS**.
- Remote Supabase execution, RLS advisor output, independent security review and
  device verification: **NOT_RUN / REVIEW_PENDING**.

## Boundaries

No remote schema, production data, credentials, deployment or destructive
operation was touched. The migration files remain local review candidates.

## Follow-up: entitlement and allowance ownership assertions — 2026-10-10

- Contract checks now explicitly require entitlement rows to reference the
  profile owner and use an owner/capability primary key.
- Allowance/receipt migrations must retain the composite owner relationship,
  RLS and explicit revocation of client-role table access.
- Migration/security focused checks — **9/9 PASS**; full bundled-runtime suite
  — **657/657 PASS**; TypeScript and affected ESLint — **PASS**.
- Remote SQL/RLS execution, Supabase advisors, independent security review and
  device verification remain **NOT_RUN / REVIEW_PENDING**.
