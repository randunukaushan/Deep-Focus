# Signed sync cursor candidate — 2026-10-10

මෙය server-only sync cursor contract එකකි. Public mobile/web bundle එකෙන්
import නොකළ යුතු අතර signing secret එක managed server secret එකකින් පමණක්
ලැබිය යුතුය. Remote project එකට deploy කරලා නැත.

## Implemented

- Cursor payload එක owner UUID, `sync` endpoint, page limit, decimal `after`
  sequence, decimal high-water sequence සහ expiry සමඟ version කර ඇත.
- HMAC-SHA-256 signature එකක් නැති, වෙනස් කළ, වෙනත් account එකකට හෝ වෙනස්
  page limit එකකට භාවිත කළ cursor fail-closed වේ.
- `after <= highWater`, limit 1–100, sequence number JavaScript number එකක්
  නොකර decimal string එකක් ලෙස රඳවා ඇත.
- Secret එක අවම length එකට වඩා කෙටි නම් signing/verification නතර වේ.

## Actual checks

- `node --experimental-strip-types --test tests/domain/sync-cursor.test.mjs` —
  **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Remaining gates

- Managed secret injection/rotation, real Edge Function execution, database
  high-water locking සහ two-account cursor penetration — **NOT_RUN**.
- Independent security review, deployment සහ remote integration —
  **REVIEW_PENDING**.

## Hardened parser follow-up

The cursor token now has a bounded maximum length and malformed base64url
segments are normalized to `SYNC_CURSOR_INVALID` rather than leaking a decoder
exception. Existing signed-cursor behavior is preserved.

- Sync cursor/server-pull/PostgreSQL-pull focused set: **13/13 PASS**.
- Full bundled-runtime suite after this follow-up: **581/581 PASS**, 0 failures,
  0 skipped.
- TypeScript `--noEmit`, affected ESLint and documentation checks: **PASS**;
  remote execution and independent review remain **NOT_RUN/REVIEW_PENDING**.
