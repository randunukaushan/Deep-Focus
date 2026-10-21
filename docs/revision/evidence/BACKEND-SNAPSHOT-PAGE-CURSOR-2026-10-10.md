# Snapshot page cursor boundary — 2026-10-10

Immutable snapshot page සඳහා වෙනම HMAC-signed opaque cursor boundary එකක්
එකතු කළා. Cursor එක owner, snapshot ID, page index/count, endpoint scope සහ
expiry එකට බැඳේ. වෙනත් account/snapshot එකකට යළි භාවිත කිරීම, tampering,
expired token, invalid page boundary සහ දුර්වල secret fail-closed වේ.

මෙය existing incremental sync cursor එකෙන් වෙනම scope එකකි. Cursor එක page
content හෝ user data නොතබන අතර, page fetch එකට authorization වෙනුවට අමතර
scope binding එකක් ලෙස පමණක් භාවිත කළ යුතුය.

## සැබෑ පරීක්ෂණ

- `snapshot-page-cursor.test.mjs` — **5/5 PASS**.
- Full bundled-runtime repository suite — **567/567 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- `node docs/revision/check-docs.mjs` — **PASS**; 80/80 requirements covered.
- `git diff --check` — **PASS**; no content errors (line-ending notices only).
- Real key rotation/secret custody, route registration, PostgreSQL/RLS,
  independent security review සහ device verification — **NOT_RUN / REVIEW_PENDING**.
