# Backend personal-core gateway router — 2026-10-10

මෙය approved personal-core OpenAPI slice එකේ local server-only route allowlist
candidate එකකි. Request admission එකෙන් පසු operation එක තෝරාගැනීම පමණක් මෙහි
සිදු වේ; authentication, ownership, schema validation සහ database transaction
තීරණ මෙය bypass නොකරයි.

## Implemented

- `/me`, tasks, goals සහ focus-session operations සඳහා approved method/path
  14ක් explicit allowlist කරයි.
- Resource routes වල UUID path ID එක පමණක් operation context එකට ලබා දෙයි.
- Unknown routes, wrong methods, foreign-shaped IDs සහ unknown subroutes
  privacy-preserving `NOT_FOUND` ලෙස fail-closed වේ.
- Client body එකෙන් resource ownership හෝ operation තෝරාගැනීම නොගනී.

## Actual checks

- `node --experimental-strip-types --test tests/domain/gateway-router.test.mjs` — **3/3 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **395/395 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Actual Edge Function handler dispatch, provider session verification,
  operation DTO validation and Supabase transaction calls — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
