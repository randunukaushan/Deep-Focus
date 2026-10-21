# No-guest mobile route audit — 2026-10-09

Native route guard එකේ current behavior පරීක්ෂා කළා. Signed-out, unverified,
configuration-error සහ generic error තත්ත්වවලදී protected app routes වෙත
direct navigation කළත් `/auth/sign-in` වෙත යොමු කරයි. Session restoration
අවසන් වනතුරු protected UI render නොකරයි.

Signed-in userට public welcome/auth entry routes පෙන්වන්නේ නැතිව Home වෙත
යොමු කරයි. Password recovery route එක පමණක් recovery state එකේ සීමිත ලෙස
විවෘත වේ; guest app access එකක් නොවේ.

## සාක්ෂි

- `src/features/auth/auth-routing.ts` — decision boundary.
- `tests/domain/auth-routing.test.mjs` — initializing, signed-out, signed-in
  සහ recovery cases.
- Bundled-runtime full suite: **240/240 PASS**.

මෙය provider runtime, secure token storage, RLS, sync හෝ Android device
verification සාක්ෂියක් නොවේ. ඒවා වෙනම `REVIEW_PENDING` / `NOT_RUN` gates වේ.
