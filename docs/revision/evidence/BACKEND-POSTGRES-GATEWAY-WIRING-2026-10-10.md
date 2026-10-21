# Backend evidence — PostgreSQL gateway handler wiring (2026-10-10)

## Implemented

`postgres-gateway-handlers.ts` composes the server-derived gateway context, canonical request hash, idempotency key, caller-owned domain transaction, owner-head lock/receipt, and operation-specific SQL applier. The registry intentionally exposes only the currently implemented personal-core write operations; unsupported or missing idempotency context fails closed.

## Verification

- `postgres-gateway-handlers.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 499/499 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local composition candidate only. No Supabase function, database connection, remote migration, or production data was used. Real gateway/RLS execution, concurrency evidence, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: transaction session context — 2026-10-10

- The handler registry forwards the gateway's verified session ID into the
  domain mutation transaction when present, preserving the server-derived
  identity boundary.
- The combined focused backend checks are **26/26 PASS** and the full bundled
  runtime suite is **647/647 PASS**; typecheck and affected ESLint pass.
- Real Supabase/RLS execution, concurrency evidence, independent security review
  and Android/device verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: no-guest authenticated mutation boundary — 2026-10-10

- Personal-core mutation handlers now reject a missing `sessionId` before the
  owner head, profile or domain write path is opened.
- Gateway/domain focused checks — **23/23 PASS**.
- Full bundled-runtime suite — **661/661 PASS**; TypeScript and affected
  ESLint — **PASS**; docs checker — **PASS** (226 Markdown, 936 links,
  80/80 requirements).
- Remote PostgreSQL/RLS execution, independent security review and Android/device
  verification remain **NOT_RUN / REVIEW_PENDING**.
