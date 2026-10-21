# Backend evidence — PostgreSQL sync transaction adapter (2026-10-10)

## Implemented

The local candidate now adapts the authorized sync-page transaction contract to PostgreSQL. It locks the owner head, reads existing sequence/hash pairs, maps canonical wire `session` to the private legacy `focus_session` storage kind, appends only owner-bound changes, advances the head after new rows, and permits exact replay while rejecting changed replay payloads. A separate local migration adds the stored `change_hash` column and index without fabricating hashes for pre-existing rows; rows lacking a reviewed backfill remain fail-closed.

## Verification

- `postgres-sync-transaction-adapter.test.mjs`: 4/4 passed.
- Full bundled runtime suite: 513/513 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

The migration and adapter are local candidates only. No remote migration, Supabase connection, production data, or deployment was used. Real PostgreSQL transaction rollback/locking, RLS/security review, and device verification remain `REVIEW_PENDING`.

## Follow-up: returned head identity validation — 2026-10-10

- Head advancement now returns and validates both `owner_id` and the expected
  sequence before the commit reports success.
- Added a foreign returned head regression test; the existing change/replay
  ownership checks remain.
- Adapter focused checks — **9/9 PASS**; full repository regression —
  **644/644 PASS**.
- Real PostgreSQL transaction/RLS execution, independent review and device
  verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: fail-closed head advancement — 2026-10-10

- `sync_heads` advancement දැන් `returning last_sequence` ප්‍රතිඵලයෙන් row එකක්
  ඇත්තටම update වූ බව තහවුරු කරයි. Row එකක් නොවෙනස් වුණොත්
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ.
- Transaction adapter, change writer සහ gateway regression tests: **11/11 PASS**.
- Full bundled-runtime repository suite after this follow-up: **588/588 PASS**.
- TypeScript `--noEmit`: **PASS**; affected ESLint: **PASS**; docs checker:
  **PASS** (80/80 requirements, 0 errors).
- Remote PostgreSQL/RLS සහ independent review තවම `REVIEW_PENDING`.

## Follow-up: change insert acknowledgement — 2026-10-10

- `sync_changes` insert එක `returning sequence, change_hash` මගින් expected
  change එකම ලියා ඇති බව තහවුරු කරයි. Acknowledgement එක නැති හෝ නොගැළපෙන
  විට `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වන අතර owner head එක advance
  නොවේ.
- Missing acknowledgement සඳහා regression test එක එක් කළා. Remote PostgreSQL,
  RLS/concurrency, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Sync transaction adapter focused checks — **6/6 PASS**; sync gateway plus
  adapter checks — **9/9 PASS**.
- Full bundled-runtime repository suite — **597/597 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).

## Follow-up: session-bound commit transaction — 2026-10-10

- The sync transaction adapter optionally locks and rechecks the verified app
  session before locking the owner sync head.
- The production-facing sync gateway supplies the verified session ID for every
  pull/commit request; revoked-session access is rejected before data access.
- Sync gateway/adapter checks — **28/28 PASS**; full repository regression —
  **651/651 PASS**; TypeScript and affected ESLint — **PASS**.
- Real PostgreSQL rollback/locking, RLS, independent review and device checks
  remain **NOT_RUN / REVIEW_PENDING**.
