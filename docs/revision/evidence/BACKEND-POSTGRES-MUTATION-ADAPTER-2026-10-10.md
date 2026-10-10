# Backend evidence — PostgreSQL mutation adapter candidate (2026-10-10)

## Implemented

`postgres-domain-mutation-adapter.ts` supplies a local, dependency-injected PostgreSQL contract for the existing domain mutation transaction. It locks the verified owner's `df_private.sync_heads` row, reads the owner/operation/mutation receipt, delegates the validated mutation to an operation-specific applier using the same transaction client, and inserts the receipt before the caller-owned transaction commits.

No connection, credential, project ID, or remote write is created by this module. Missing owner-head state and malformed receipt JSON fail closed through the safe server boundary.

## Verification

- `postgres-domain-mutation-adapter.test.mjs`: 4/4 passed.
- Full bundled runtime suite: 446/446 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local adapter candidate only. It has not been connected to Supabase, applied to any migration, or used with real data. SQL review, RLS/security review, independent review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: active-profile transaction recheck — 2026-10-10

- Before locking `df_private.sync_heads`, the adapter now locks and verifies
  the actor's active `df_private.profiles` row in the same transaction.
- Missing or non-active account state fails closed with `ACCESS_DENIED`; the
  mutation applier and head lock are not reached.
- Domain mutation and gateway-handler focused checks — **12/12 PASS**.
- Full bundled-runtime repository suite — **645/645 PASS**; TypeScript and
  affected ESLint — **PASS**.
- Real PostgreSQL transaction/RLS execution, independent review and Android/
  device verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: app-session transaction recheck — 2026-10-10

- When a gateway supplies a session ID, the mutation transaction now locks and
  rechecks the matching `df_private.app_sessions` row before the owner profile,
  sync-head, receipt, or mutation work proceeds.
- Missing, expired, revoked, inactive, or foreign session identity fails closed
  with `AUTH_REQUIRED`; the mutation applier and sync-head lock are not reached.
- Active-session propagation and adapter regression checks — **26/26 PASS**.
- Full bundled-runtime repository suite — **647/647 PASS**; TypeScript and
  affected ESLint — **PASS**.
- Real PostgreSQL transaction/RLS execution, independent security review and
  Android/device verification remain **NOT_RUN / REVIEW_PENDING**.
