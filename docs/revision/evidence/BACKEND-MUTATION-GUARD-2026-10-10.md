# Server mutation guard candidate — 2026-10-10

මෙය database commit එකට පෙර server-side ownership/idempotency admission
contract එකකි. Final transaction එකේ actor recheck, receipt uniqueness, owner
head lock සහ domain write එක එකම transaction එකකින් සිදු කළ යුතුය; මේ helper එක
එය තනිව සම්පූර්ණ කළ බව නොකියයි.

## Implemented

- Verified actor සහ resource owner එක නොගැළපේ නම් foreign record existence leak
  නොකර `not_found` decision එකක් දෙයි.
- එකම owner/operation/mutation ID සහ එකම payload digest එකක් නම් පැරණි response
  replay කිරීමට ඉඩ දෙයි.
- එකම idempotency key එක වෙනස් digest එකකට හෝ වෙනත් operation/owner එකකට
  භාවිත කළොත් conflict කරයි.
- Invalid actor, mutation UUID, operation name සහ digest fail-closed වේ.

## Actual checks

- `node --experimental-strip-types --test tests/domain/mutation-guard.test.mjs` —
  **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Remaining gates

- Real PostgreSQL receipt transaction, owner-head row lock, concurrent replay,
  two-account RLS and rollback/restart tests — **NOT_RUN**.
- Independent security review and remote integration — **REVIEW_PENDING**.
