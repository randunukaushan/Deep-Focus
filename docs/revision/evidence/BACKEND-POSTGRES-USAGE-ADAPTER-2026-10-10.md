# Backend evidence — PostgreSQL usage reservation adapter (2026-10-10)

## Implemented

The local candidate now adapts the server-authoritative usage reservation contract to PostgreSQL. Allowance reads are owner-bound and row-locked, reservations update the allowance and insert replay metadata in one transaction, identical receipt IDs replay the stored decision without granting again, and consume/release settlement updates both allowance counters and the receipt together. The composed usage service reads server entitlement and reserves allowance within the same transaction boundary. A separate snapshot reader returns admission plus allowance without inventing free/paid/rewarded source mapping. A local migration adds `remaining_units` without fabricating values for existing rows.

## Verification

- `postgres-usage-adapter.test.mjs`: 8/8 passed.
- Full bundled runtime suite: 509/509 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No payment provider, AI provider, Supabase connection, remote migration, production data, or deployment was used. Existing rows with missing replay metadata, real PostgreSQL concurrency, independent security review, and release/device verification remain `REVIEW_PENDING`.

## Follow-up: returned usage-scope validation — 2026-10-10

- Reservation inserts now validate returned `owner_id`, `receipt_id`,
  `capability` and `period_key` against the verified request.
- Settlement allowance updates validate returned owner, capability and period;
  receipt status updates validate returned owner, receipt, capability, period
  and final status before reporting success.
- Added five regression checks covering foreign reservation scope, foreign
  allowance metadata and foreign settlement metadata.
- Usage adapter focused checks — **16/16 PASS**.
- Full bundled-runtime repository suite — **642/642 PASS**.
- TypeScript, affected ESLint, documentation checker and `git diff --check` —
  **PASS** (line-ending warnings only).
- Real PostgreSQL rollback/concurrency, provider/billing integration,
  independent security review and Android/device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: settlement acknowledgement — 2026-10-10

- Allowance counter update එකෙන් පසු receipt status update එකේ affected row එක
  `returning receipt_id` මඟින් තහවුරු කරයි. Row එකක් නොවෙනස් වුණොත් transaction
  එක success ලෙස නොපෙන්වා `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ.
- Entitlement, usage adapter සහ usage-boundary focused checks: **24/24 PASS**.
- Full bundled-runtime repository suite after this follow-up: **592/592 PASS**.
- TypeScript `--noEmit`: **PASS**; affected ESLint: **PASS**; documentation
  checker: **PASS** (80/80 requirements, 0 errors).
- Real PostgreSQL rollback/concurrency, provider/billing integration සහ
  independent review තවම **NOT_RUN / REVIEW_PENDING**.

## Follow-up: reservation receipt acknowledgement — 2026-10-10

- Allowance reservation insert එක `returning receipt_id` මගින් තහවුරු කරයි.
  Receipt row එක නොලැබුණොත් `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වන අතර
  transaction rollback වීමට ඉඩ දෙයි; allowance එක පමණක් සාර්ථක ලෙස වාර්තා
  නොවේ.
- Missing acknowledgement regression test එක එක් කළා. Remote billing/provider
  execution, real rollback/concurrency සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Usage and entitlement focused checks — **25/25 PASS**.
- Full bundled-runtime repository suite — **598/598 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).

## Follow-up: session-bound allowance transactions — 2026-10-10

- Usage service reservation, settlement and capability-usage reads require a
  verified `sessionId`, then lock and recheck the app session before
  entitlement, allowance or receipt access. Low-level transaction helpers stay
  available for isolated adapter tests only.
- Revoked, expired, missing or foreign sessions fail closed before usage data or
  allowance writes are reached.
- Usage/entitlement focused checks — **34/34 PASS**; full bundled-runtime suite
  — **657/657 PASS**; TypeScript and affected ESLint — **PASS**.
- Live billing/provider integration, remote PostgreSQL/RLS execution,
  independent security review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
