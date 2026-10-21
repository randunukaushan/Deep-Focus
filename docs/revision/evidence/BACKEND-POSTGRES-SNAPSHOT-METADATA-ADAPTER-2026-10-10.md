# PostgreSQL snapshot metadata reader — 2026-10-10

`ready` සහ තවම expire නොවූ snapshot metadata පමණක් owner-bound query එකකින්
කියවීමට local adapter candidate එකක් එකතු කළා. `high_water` PostgreSQL
`bigint` text ලෙස රකින අතර, malformed metadata, invalid identity සහ missing/
expired/foreign rows fail-closed/absent ලෙස හසුරුවයි.

## සැබෑ පරීක්ෂණ

- `postgres-snapshot-metadata-adapter.test.mjs` — **5/5 PASS**.
- Full bundled-runtime repository suite — **553/553 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- `node docs/revision/check-docs.mjs` — **PASS**; 80/80 requirements covered.
- `git diff --check` — **PASS**; no content errors (line-ending notices only).
- මෙය read-only adapter එකකි; staging writes, job runner, JCS manifest
  calculation, RLS execution, remote database සහ device behavior පරීක්ෂා කර නැත.
- Independent security review සහ production migration — **REVIEW_PENDING**.

## සීමා

Query එක caller-supplied transaction runner එකක් භාවිතා කරන අතර credentials හෝ
remote project එකක් තෝරා නොගනී. Snapshot status endpoint එකකට සම්පූර්ණ job
semantics එකක් මෙයින් තහවුරු නොවේ.
