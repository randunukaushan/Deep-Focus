# Sync rejection policy — 2026-10-10

මෙය local outbox එකේ server response handling contract එකයි. Server එකක්
ස්ථිරව ප්‍රතික්ෂේප කළ mutation එකක් retry කරමින් loop වීම වැළැක්වීමට එය
`rejected` ලෙස quarantine කරයි. Local mutation එක මකන්නේ නැති නිසා explicit
recovery/merge ක්‍රියාවකට ඉඩ තිබේ. මෙය remote database transaction එකක් හෝ
recovery UI එකක් සම්පූර්ණ කළ බව නොකියයි.

## Implemented

- `ACCESS_DENIED`, `ENTITY_DELETED`, `AUTH_REQUIRED`, `VERSION_CONFLICT` සහ
  validation/idempotency වැනි user action අවශ්‍ය codes `rejected` කරයි.
- Network, transport සහ malformed-response failures තවම retryable වන අතර local
  mutation එක මකා නොදමයි.
- SQLite outbox update එක owner-scoped transaction එකකින් `rejected` state,
  attempt count සහ safe error code එක සුරකී; pending loader එක එම record නැවත
  යවන්නේ නැත.
- Existing acknowledgment, duplicate-ID, concurrent-push සහ failure-closed
  හැසිරීම් රැකගෙන regression test එකතු කර ඇත.

## Actual checks

- Focused sync/ownership checks — **26/26 PASS**.
- Bundled-runtime repository suite before this slice — **328/328 PASS**; after
  subsequent remote, restore, sync-recovery, snapshot, session and migration slices — **344/344 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- Docs checker සහ diff whitespace check මේ slice එකෙන් පසුව නැවත ධාවනය කළ යුතුයි.

## Remaining gates

- Actual remote mutation endpoint, PostgreSQL receipt transaction, conflict
  merge/recovery UI, two-account cloud replay සහ device/offline restart evidence —
  **NOT_RUN / REVIEW_PENDING**.
- Production migration, remote writes, deployment සහ independent security review —
  **REVIEW_PENDING**.
