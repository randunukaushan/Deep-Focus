# App-session registry admission candidate — 2026-10-10

Supabase sign-out එක refresh sessions revoke කළත් දැනට valid access JWT එකක්
expiry වන තුරු පැවතිය හැකි නිසා, approved backend contract එකේ app-session
registry recheck boundary එක මෙයින් local candidate එකක් ලෙස සකස් කළා.

## Implemented

- Helper එක JWT decode කරන්නේ නැහැ; provider verifier එකෙන් ලැබුණු claims පමණක්
  පිළිගනී.
- Issuer, audience, subject, session ID සහ expiry පරීක්ෂා කරයි.
- Owner/session registry row එක active, matching සහ non-expired විය යුතුයි.
- Missing, foreign, revoked, expired හෝ malformed claims fail-closed වේ.
- Issue කිරීම valid owner/expiry වලට පමණක් සීමා කරයි; revoke කිරීම foreign
  owner, expired record සහ repeated revoke fail-closed කරයි.
- Explicit transaction helpers issue write එකත්, revoke read + transition එකත්
  caller-owned database transaction boundary එකකට යවයි; load-then-revoke
  race එක caller contract එකෙන් වෙන් කර ඇත.

## Actual checks

- App-session focused tests — **7/7 PASS**.
- Full bundled-runtime repository suite — **358/358 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Real Supabase JWT verification, app-session registry migration/RPC, refresh/
  sign-out/all-device revocation and recent-auth policy — **NOT_RUN**.
- RLS/transaction concurrency, independent security review, device and
  production evidence — **REVIEW_PENDING**.

## Follow-up: registry-row fail-closed validation — 2026-10-10

- Admission/revoke boundary එක storage row එකේ UUID, timestamp ordering සහ
  status/revocation consistency නැවත validate කරයි. Corrupt row එකක්
  authorization හෝ revoke transition එකක් බවට පත් නොවේ.
- Auth/session focused tests: **20/20 PASS**.
- Full bundled-runtime repository suite: **591/591 PASS**.
- TypeScript `--noEmit`: **PASS**; affected ESLint: **PASS**; docs checker:
  **PASS** (80/80 requirements, 0 errors).
- Real provider verification, remote concurrency, independent review සහ device
  evidence තවම **NOT_RUN / REVIEW_PENDING**.

## Follow-up: session insert acknowledgement — 2026-10-10

- App-session create path එක `returning session_id` මගින් insert වූ row එක
  තහවුරු කරයි. Acknowledgement row එක නොලැබුණොත්
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ; issue transaction එක success
  ලෙස නොපෙන්වයි.
- Missing acknowledgement සඳහා regression test එකක් එක් කළා. Remote database
  execution සහ independent review තවම **REVIEW_PENDING**.
- Session adapter focused checks — **4/4 PASS**.
- Full bundled-runtime repository suite — **594/594 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).
