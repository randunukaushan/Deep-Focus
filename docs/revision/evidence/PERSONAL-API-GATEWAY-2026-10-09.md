# Personal API gateway boundary — 2026-10-09

මෙය Supabase Edge Function තුළ භාවිත කළ හැකි server-side contract boundary එකක
local implementation එකකි. එය remote project එකට deploy කරලා නැත, database එකට
ලියා නැත, සහ independent security review අවසන් වූ බව නොකියයි.

## Implemented

- `Authorization: Bearer <user token>` නොමැති හෝ publishable key එක bearer ලෙස
  යොදා ඇති requests fail-closed වේ.
- Token එකෙන් `resolveUser` මඟින් actor identity ලබාගෙන පසුව පමණක් dispatcher
  වෙත යවයි. Request body එකේ `ownerId`, `userId` හෝ `serviceRole` පිළිගන්නේ නැත.
- Approved `/v1/` personal routes පමණක් map කරයි; unknown routes 404 වේ.
- සියලු mutations සඳහා UUID `Idempotency-Key` අනිවාර්ය කරයි.
- Body size සහ object-shape සීමා කරයි; dispatcher දෝෂයේ SQL/provider විස්තර
  client වෙත නොයවා safe `DEPENDENCY_UNAVAILABLE` response එකක් ලබා දෙයි.
- Dispatch input එකේ actor, operation, resource ID, body සහ idempotency key
  වෙන්ව තබයි; ownership determination client identifier එකකින් නොකරයි.

## Verification

- Gateway tests: **5/5 PASS**.
- TypeScript: **PASS**.
- Affected-file ESLint: **PASS**.
- Full bundled-runtime regression suite after this slice: **274/274 PASS**.
- Supabase නිල guidance එකේ user JWT සඳහා `Authorization` header භාවිත කිරීමත්,
  platform verification එකට අමතරව handler-level checks කිරීමත් අනුව boundary එක
  තෝරා ඇත. මෙය platform runtime/security review සාක්ෂියක් නොවේ.

## Remaining gates

- Actual Edge Function runtime, `verify_jwt` configuration, server JWT
  verification and reviewed privileged database client: `NOT_RUN`.
- RLS penetration, transaction/idempotency receipt tests and remote deployment:
  `REVIEW_PENDING` / `NOT_AUTHORIZED`.
