# Backup and restore admission and atomic candidate — 2026-10-10

මෙය actual backup file/database restore එකක් නොකරන server-side admission සහ
atomic-restore candidate contract එකකි. Retention, deletion tombstones, provider
backup scope සහ production restore policy කිසිවක් මෙයින් තීරණය කරන්නේ නැත.

## Implemented

- Backup manifest එක version, verified owner, schema version, creation time,
  record count සහ SHA-256 payload digest සමඟ validate කරයි.
- Foreign owner, future schema, digest mismatch සහ non-empty target restore
  කිරීම fail-closed කරයි.
- Admission helper එක කිසිදු delete, overwrite, migration හෝ data write එකක්
  සිදු නොකරයි; actual restore transaction එක වෙනම reviewed server operation එකක්
  විය යුතුය.
- Complete payload records owner/UUID/type අනුව validate කර duplicate identity
  records reject කරයි. Valid payload එක එක caller-owned transaction callback එකකට
  පමණක් යවයි; callback failure caller වෙත propagate වේ.
- Canonical JSON SHA-256 helper එක key-order වෙනසෙන් independent ලෙස payload
  digest ගණනය කරයි; data වෙනස් වුණොත් digest එක වෙනස් වේ.
- Atomic restore path එක caller-supplied digest එක පමණක් විශ්වාස නොකර payload
  එකම නැවත hash කර manifest සහ computed digest දෙකම ගැළපෙන බව පරීක්ෂා කරයි.
- Backup export candidate එක verified owner එකට පමණක් source read කර record
  ownership/duplicate checks පසු immutable manifest + payload artifact එකක්
  digest සමඟ සාදයි; source failure සඟවන්නේ නැහැ.
- Rollback/restart recovery coverage එකෙන් පළමු transaction failure එකෙන් පසු
  එකම validated artifact එකෙන් explicit retry කළ හැකි බව පරීක්ෂා කරයි; helper එක
  delete හෝ overwrite කරන්නේ නැහැ.

## Actual checks

- `node --experimental-strip-types --test tests/domain/backup-restore.test.mjs` —
  **11/11 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Retry coverage follow-up — 2026-10-10

- Backup/restore focused checks — **12/12 PASS**.
- Full bundled-runtime repository suite — **650/650 PASS**.
- TypeScript and affected ESLint — **PASS**.

## Remaining gates

- Real backup creation, isolated restore, interrupted restore/restart and
  deletion-tombstone replay — **NOT_RUN**.
- Retention/region policy, independent security review and deployment —
  **REVIEW_PENDING**.
