# EX-27 Session Revocation Receipt Evidence — 2026-10-11

## Implemented

The local candidate now binds an EX-27 request to its verified owner, mutation
ID and server-derived request hash. The first transaction freezes the selected
owned session IDs, enqueues provider-revocation work, revokes those registry
rows and saves the receipt before commit. An exact retry replays the frozen
result without rereading or selecting sessions; a changed hash is rejected
before session selection. This prevents `others`/`all` replay from including a
newer session created after the original request.

The new migration is server-only and review-pending. It stores no provider
credential or raw provider error and denies direct client grants.

## Verification

- Revocation plan, migration-contract and PostgreSQL adapter tests: **26/26 PASS**
- Gateway response-validation test: **1/1 PASS**
- Recent-auth gateway gate test: **1/1 PASS**
- PostgreSQL handler composition tests: **2/2 PASS**
- Gateway built-in wiring test: **1/1 PASS**
- Full repository test suite after this slice: **920/920 PASS**
- TypeScript typecheck: **PASS**
- The tests cover exact replay, changed-intent rejection, no session reread on
  replay, transaction ordering, outbox failure propagation, ownership checks,
  receipt shape validation, gateway response validation and client-denied
  migration policy and one-transaction handler composition.

## Remaining gates

- Remote Supabase SQL/RLS execution: **NOT_RUN / REVIEW_PENDING**
- Provider revocation worker runtime and concurrent PostgreSQL execution:
  **NOT_RUN / REVIEW_PENDING**
- Independent security review and Android/device verification:
  **NOT_RUN / REVIEW_PENDING**
