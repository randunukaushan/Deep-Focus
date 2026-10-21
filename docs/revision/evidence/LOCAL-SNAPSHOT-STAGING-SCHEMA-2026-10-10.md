# Local SQLite snapshot staging schema — 2026-10-10

Cloud snapshot install එකට පෙර pages restart-safe ලෙස තබාගැනීමට local SQLite
schema version 11 candidate එකක් එකතු කළා. Staging metadata/pages වලට අමතරව
account-scoped remote mirror rows/cursor tables ද ඇත; existing domain rows,
outbox, active focus session සහ local resources overwrite නොකරයි.

## Implemented

- Owner/snapshot primary key සහ owner/snapshot/page composite page key.
- Building/ready/failed state, high-water, page count, digest, cursor සහ JSON
  payload constraints.
- Page foreign key staging metadata වෙත බැඳේ; local migration එක transaction
  එකකින් version 8 සිට 11 දක්වා යයි.
- Existing databases සඳහා restart-safe upgrade path සහ new databases සඳහා
  initial schema path දෙකම update කළා.
- `beginSnapshotStaging`, `stageSnapshotPage`, `loadSnapshotStaging` සහ
  `finalizeSnapshotStaging` owner-scoped SQLite adapter ක්‍රියා එකතු කළා.
- එකම page එක නැවත ලැබුණොත් idempotent ලෙස පිළිගනී; වෙනස් payload/digest එකක්
  conflict ලෙස reject කරයි; incomplete staging finalize නොකරයි.
- Interrupted staging එක `failed` ලෙස සටහන් කර pages නොමකා තබයි; explicit
  `resumeSnapshotStaging` එකෙන් පසුව ඉතිරි pages දිගටම ලිවිය හැක.
- Validated snapshot orchestration එක owner-bound ලෙස pages stage කර finalize
  කරයි; මැදින් failure වුණොත් recovery සඳහා `failed` state එක සටහන් කරයි.
- Validated mirror pages local staging payload එකට map කරයි; live tasks/goals
  rows වෙනස් නොකරන බව real SQLite test එකෙන් තහවුරු කළා.
- `applySnapshotAtomically` remote mirror entities සහ cursor එක එක transaction
  එකකින් replace කරයි; failure එකකදී පෙර mirror එක rollback වෙයි.

## Actual checks

- Existing SQLite ownership/migration/staging checks — **23/23 PASS**.
- Full bundled-runtime repository suite — **367/367 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Android lifecycle crash/restart, cloud integration and real overlay reapply —
  **NOT_RUN**.
- Real SQLite device lifecycle, cloud integration, independent review and
  production schema migration — **REVIEW_PENDING**.
