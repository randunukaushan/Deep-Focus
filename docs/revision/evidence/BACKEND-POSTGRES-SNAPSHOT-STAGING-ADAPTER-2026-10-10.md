# PostgreSQL snapshot staging adapter — 2026-10-10

මෙය `sync_snapshots` සහ `sync_snapshot_pages` සඳහා local PostgreSQL adapter
candidate එකකි. `ready` snapshot එකක් ලෙස සලකන්නේ owner-bound metadata row එක
අගුළු දමා, සියලු immutable pages එකම transaction එකකින් පරීක්ෂා කර, page count
ගැළපීමෙන් පසුව පමණි.

## සීමාව සහ අවදානම

- Phase 8 sync recovery / snapshot staging slice; risk **HIGH**.
- දැනට ඇති local migration schema සහ `SnapshotPage` allowlist පමණක් භාවිතා කරයි.
- owner UUID, snapshot ID, decimal PostgreSQL `bigint` සීමාව, timestamp order,
  page sequence, digest shape, entity identity සහ duplicate entity checks කරයි.
- එකම snapshot retry එකේ metadata හෝ page payload වෙනස් නම්
  `IDEMPOTENCY_CONFLICT` ලබා දෙයි; ready snapshot එක නැවත ලියන්නේ නැත.
- transaction runner එක caller සපයන නිසා credentials, connection හෝ remote
  project තෝරා නොගනී.

## Follow-up: ready-row identity validation — 2026-10-10

- Snapshot publish `RETURNING` row එකෙන් `owner_id`, `snapshot_id` සහ `status`
  තුනම expected request එකට ගැළපෙනවාදැයි පරීක්ෂා කරයි.
- Foreign returned ready-metadata regression test එක එක් කළා.
- Focused staging checks — **9/9 PASS**; full repository regression —
  **644/644 PASS**.
- Remote PostgreSQL/RLS execution, independent review සහ device verification
  තවම **NOT_RUN / REVIEW_PENDING**.

## Follow-up: authenticated snapshot staging — 2026-10-10

- Snapshot build/staging input එකට verified `sessionId` අනිවාර්ය කළා.
- Session row එක එකම write transaction එක ඇතුළත recheck කරන්නේ snapshot
  metadata insert කිරීමට පෙරය; revoked session එකකදී storage write එකක් නොවේ.
- Snapshot staging/build checks — **14/14 PASS**.
- Full bundled-runtime suite — **660/660 PASS**; TypeScript and affected
  ESLint — **PASS**; docs checker — **PASS** (226 Markdown, 936 links,
  80/80 requirements).
- Remote PostgreSQL/RLS execution, independent security review සහ device
  verification — **NOT_RUN / REVIEW_PENDING**.

## Task brief සාරාංශය

**Acceptance:** owner-bound insert; metadata `FOR UPDATE`; immutable page
retry/deduplication; complete page set පමණක් `ready`; malformed/foreign,
oversized high-water, missing page සහ changed payload fail-closed.

**Non-goals:** remote Supabase execution, snapshot materialization query,
RFC 8785 JCS digest implementation, retention/deletion policy, job worker,
RLS acceptance, device verification සහ production migration.

## සැබෑ පරීක්ෂණ

- `postgres-snapshot-staging-adapter.test.mjs` — **7/7 PASS**.
- Full bundled-runtime repository suite — **548/548 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- `git diff --check` — **PASS**; no content errors (existing line-ending
  notices are filtered as workspace noise).
- පරීක්ෂා කළ අවස්ථා: atomic ready transition, ready retry, incomplete ready
  metadata, changed manifest, malformed owner, conflicting duplicate page සහ
  PostgreSQL `bigint` සීමාව ඉක්මවීම.

## තවමත් විවෘත gates

Disposable PostgreSQL execution, two-account RLS/authorization, repeatable-read
materialization, concurrent domain writes, rollback/restart drill, retention
policy, independent security review, Android/iOS verification සහ remote/
production migration — **NOT_RUN / REVIEW_PENDING**.

Private snapshot payload, user data, credentials හෝ remote database එකකට මෙහිදී
ප්‍රවේශ වී නැත. Commit, push, deploy හෝ production operation කර නැත.
