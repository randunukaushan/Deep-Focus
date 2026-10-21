# Snapshot materialization boundary — 2026-10-10

දැනට authorize කර අවසන් records පමණක් deterministic entity/UUID order එකට
සකස් කර, records 100ක් බැගින් immutable pages වලට බෙදන pure boundary එකක්
එකතු කළා. Empty account එකකට එක empty page එකක් ලැබේ. Duplicate identities,
malformed entities, page/manifest digest outputs සහ non-final cursor outputs
fail-closed වේ.

Digest algorithm/JCS, cursor minting, source database query සහ `ready` publish
කරන transaction එක caller-owned ලෙස තබා ඇත. මේ file එකෙන් production policy
හෝ remote data access නිර්මාණය නොවේ.

## සැබෑ පරීක්ෂණ

- `snapshot-materializer.test.mjs` — **5/5 PASS**.
- Full bundled-runtime repository suite — **562/562 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- `node docs/revision/check-docs.mjs` — **PASS**; 80/80 requirements covered.
- `git diff --check` — **PASS**; no content errors (line-ending notices only).
- Real PostgreSQL repeatable-read snapshot, JCS compatibility, RLS, retention,
  independent review සහ device verification — **NOT_RUN / REVIEW_PENDING**.
