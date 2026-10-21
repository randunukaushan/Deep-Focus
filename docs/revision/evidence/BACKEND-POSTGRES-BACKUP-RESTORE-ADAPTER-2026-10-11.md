# PostgreSQL backup/restore composition boundary — 2026-10-11

මෙය remote database එකකට සම්බන්ධ නොවන local candidate එකකි. PostgreSQL
transaction runner එක caller විසින් ලබාදුන් එකක් පමණක් භාවිත කරයි; credentials,
table selection, overwrite policy හෝ destructive cleanup තීරණය නොකරයි.

## Implemented

- Owner-verified backup export එක source read කිරීම සහ digest-bound artifact
  සෑදීම එකම injected transaction boundary එකට බැඳේ.
- Restore එකේ සම්පූර්ණ manifest/payload validation අවසන් වූ පසුව පමණක්
  caller-owned writer එක කැඳවේ.
- Foreign owner artifact එකක් write callback එකට නොයයි.
- Actual database restore, rollback/restart, backup provider behavior,
  independent security review සහ production activation මෙයින් තහවුරු නොවේ.

## Actual checks

- Backup/restore සහ PostgreSQL adapter focused tests: **19/19 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.

## Gate status

- Live Supabase database, real backup/restore and Android recovery: **NOT_RUN**.
- Independent security review and migration/deployment acceptance:
  **REVIEW_PENDING**.
