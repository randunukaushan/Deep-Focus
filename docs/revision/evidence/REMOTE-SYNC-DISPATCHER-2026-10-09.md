# Remote sync dispatcher boundary — 2026-10-09

මෙය local SQLite outbox එක approved personal API contract එකට map කරන isolated
boundary එකකි. Remote Supabase project එකට request එකක් යවා නැත; app startup
sync එකට ද මෙය සම්බන්ධ කර නැත.

## Implemented

- `src/features/sync/remote-sync-pusher.ts` මගින් `task.create`, `task.patch`,
  `task.action`, `goal.create`, `session.start`, `session.event` සහ
  `profile.patch` සඳහා නියමිත `/v1/` paths තෝරයි.
- Remote mutation idempotency key ලෙස local mutation UUID එකම භාවිත කරයි.
  Batch key එකක් අන්ධ ලෙස නැවත භාවිත නොකරයි.
- `ownerId`, `userId` සහ `serviceRole` වැනි client-supplied ownership fields
  fail-closed ලෙස ප්‍රතික්ෂේප කරයි.
- වර්තමාන seconds-based `session.terminal` snapshot එක remote
  `SessionEvent` එකක් ලෙස අනුමාන නොකර `SYNC_EVENT_REQUIRED` ලෙස නවතයි. මෙය
  milliseconds, event sequence හෝ trusted completion හිතාමතා නොගොඩනඟයි.
- `400/403/404/409/410/422` වැනි authorized permanent responses item-level
  rejection ලෙස ලබා දෙන අතර network, auth refresh, rate-limit සහ service
  outage වැනි transient errors retry layer එකට යවයි.
- Network, credentials, server implementation, RLS හෝ ownership authority
  මෙම adapter එකෙන් අනුමාන නොකරයි.

## Follow-up: complete approved extension command mapping — 2026-10-10

- Added local mapping for `task.delete`, `goal.patch`, `goal.delete`,
  `break.record`, `settings.patch`, `reminder.create`, `reminder.patch` and
  `reminder.delete` using the canonical `/v1/` paths.
- Delete commands validate the exact `VersionOnly` payload and send the value
  as the canonical `Expected-Version` header; no delete request body is sent.
- The authenticated API client now supports idempotent `DELETE` and validates
  expected versions in the approved positive 32-bit range.

## Verification

- Focused remote API + dispatcher tests: **15/15 PASS**.
- TypeScript: **PASS**.
- Affected-file ESLint with `--max-warnings=0`: **PASS**.
- Full bundled-runtime regression suite after this follow-up: **687/687 PASS**.

## Review gates

- Server-side JWT verification, RLS/API ownership, idempotent transaction
  receipts සහ conflict recovery: `REVIEW_PENDING`.
- Remote endpoint availability, live provider auth සහ Android network/runtime
  evidence: `NOT_RUN`.
- Current local outbox `session.terminal` records: remote sync සඳහා තවම
  intentionally unsupported; local recovery/data preservation unchanged.

## Follow-up: local contract rejection quarantine — 2026-10-10

- Malformed payload/target/command/ID සහ legacy `session.terminal` වැනි remote
  contract එකට යැවිය නොහැකි local items දැන් item-level permanent rejection
  ලෙස ලබා දේ. ඒවා transport failure ලෙස සලකා retry loop එකට යවන්නේ නැත.
- එකම batch එකේ කලින් සාර්ථක වූ items අහිමි නොවන ලෙස accepted සහ rejected IDs
  වෙන්ව preserve කරයි. Rejected items outbox store එකේ recovery සඳහා
  quarantine වේ; ඒවා නිහඬව මකා නොදමයි.
- Focused remote pusher + sync service tests: **16/16 PASS**.
- Full bundled-runtime regression suite: **585/585 PASS**.
- TypeScript `--noEmit`: **PASS**.
- Affected-file ESLint: **PASS**.
- Documentation checker: **PASS** (224 Markdown files, 80/80 requirements,
  0 errors).
- Remote production sync wiring, server contract, independent security review
  සහ Android/device evidence තවම `REVIEW_PENDING`/`NOT_RUN`; මෙම slice එකෙන්
  ඒ gates සම්පූර්ණ වූ බවක් කියන්නේ නැත.
