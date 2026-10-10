# Backend evidence — PostgreSQL sync pull adapter (2026-10-10)

## Implemented

The local candidate now adapts the existing signed sync-pull contract to PostgreSQL. It reads only rows for the verified owner, computes the high-water mark inside the same transaction when starting a pull, preserves the signed high-water bound on continuation, caps the requested page at 100, maps the private legacy `focus_session` kind to canonical wire `session`, and rejects malformed stored rows without exposing database details.

The mutation store now optionally writes a complete owner-bound entity snapshot to `sync_changes` after the domain applier and before the mutation receipt, using a locked next sequence and the same caller-owned transaction. The PostgreSQL gateway wiring enables this writer for the implemented personal-core mutations.

## Verification

- `postgres-sync-pull-adapter.test.mjs`: 4/4 passed.
- `postgres-sync-change-writer.test.mjs`: 2/2 passed.
- Full bundled runtime suite: 513/513 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

No Supabase connection, remote migration, production data, or deployment was used. Real PostgreSQL snapshot/locking behavior, RLS/security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: sync-head write acknowledgement — 2026-10-10

- Mutation-to-sync change writer එක head update එකේ affected row එක තහවුරු නොවුණොත්
  සාර්ථක ලෙස අවසන් නොකර fail-closed වේ.
- Change-writer regression checks: **3/3 PASS**; transaction/gateway සමඟ
  ඒකාබද්ධ focused checks: **11/11 PASS**.
- Remote PostgreSQL execution, RLS, independent security review සහ device
  verification තවම `REVIEW_PENDING` / `NOT_RUN`.

Full repository regression after the head-write follow-up: **588/588 PASS**;
TypeScript, affected ESLint සහ documentation checker **PASS**.

## Follow-up: session-bound pull transaction — 2026-10-10

- When supplied by the authenticated sync gateway, the pull adapter locks and
  rechecks the matching app-session row before reading the owner's changes.
- A revoked, expired or foreign session cannot reach sync data reads.
- Related sync gateway/adapter checks — **28/28 PASS**; full repository suite —
  **651/651 PASS**; TypeScript and affected ESLint — **PASS**.
- Real PostgreSQL/RLS execution and independent security review remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: required session at adapter boundary — 2026-10-10

- Pull and commit adapter factories now require a `sessionId` and recheck the
  matching active app-session row before private sync head/change access.
- A missing session fails closed before sync data access; authenticated gateway
  wiring continues to pass the verified request session.
- Sync pull/transaction/gateway focused checks — **19/19 PASS**.
- Full repository suite — **677/677 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Real PostgreSQL/RLS execution, independent security review and Android/device
  verification remain **NOT_RUN / REVIEW_PENDING**.
