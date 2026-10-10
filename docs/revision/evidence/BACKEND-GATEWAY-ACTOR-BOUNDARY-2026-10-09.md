# Backend gateway actor boundary — 2026-10-09

මෙය local server-gateway contract එකේ කුඩා ආරක්ෂක slice එකකි. මෙය Supabase
Edge Function එකකට deploy කරලා නැත, live token provider එකකින් පරීක්ෂා කරලා
නැත, සහ RLS penetration evidence එකක් නොවේ.

## Implemented

- Verified-token resolver එකෙන් ලැබෙන actor ID canonical UUID එකක් නොවේ නම්
  request එක fail-closed ලෙස `401` කරයි.
- Resolver එක session එක expired/revoked බව කියන විට dispatcher එකට request
  නොයවයි.
- Mutation idempotency key එක gateway එක වෙනස් නොකර server dispatcher වෙත
  යවයි; duplicate suppression සහ response replay කිරීම server/database
  receipt transaction එකේ වගකීම ලෙස වෙන් කර ඇත.
- Mutation body එක canonical key order එකකට normalise කර SHA-256 digest එකක්
  dispatch input එකට යවයි. ඒක `mutation_receipts.request_sha256` සමඟ ගැළපීම
  server layer එකට භාරයි; raw token හෝ secret එකක් digest input එකට නොයයි.
- Existing body ownership-field rejection, route allow-list, request limit සහ
  safe error behavior රඳවා ඇත.
- Sync pull/push route contracts now enforce cursor length, page limit and
  maximum batch size before dispatch. The gateway still does not claim to sign
  or persist cursors, apply per-item ownership, or commit database receipts.
- Each sync mutation is also checked for UUID identity/target fields, bounded
  command text, object payload and absence of client ownership fields.

## Actual checks

- Bundled runtime command `node --experimental-strip-types --test
  tests/domain/personal-api-gateway.test.mjs` — **12/12 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Remaining gates

- Real Supabase Auth token verification, expired JWT/session revocation,
  two-account ownership tests, concurrent database writes and receipt replay —
  **NOT_RUN**.
- Independent qualified security review and Edge Function runtime review —
  **REVIEW_PENDING**.
