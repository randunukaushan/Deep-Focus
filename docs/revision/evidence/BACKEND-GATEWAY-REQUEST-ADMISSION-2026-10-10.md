# Backend gateway request admission — 2026-10-10

මෙය Supabase Edge Function gateway සඳහා local, server-only request admission
candidate එකකි. මෙය authentication, database authorization හෝ remote deployment
කරන්නේ නැත; domain handler එකට යාමට පෙර අඩු සීමා සහිත request shape එකක් පමණක්
තහවුරු කරයි.

## Implemented

- `/v1/` path සහ `GET|POST|PATCH|DELETE` method allowlist එක පරීක්ෂා කරයි.
- Actor identity UUID එකක් විය යුතු අතර write requests සඳහා UUID
  `Idempotency-Key` අනිවාර්ය කරයි.
- Request ID, path සහ JSON body byte limits පරීක්ෂා කරයි; malformed JSON,
  arrays, control characters, non-JSON content සහ body නැති writes ප්‍රතික්ෂේප කරයි.
- Endpoint එකට ලබාදුන් allowed body keys වලින් පිටත fields ප්‍රතික්ෂේප කරයි.
- Public client එකෙන් owner ID හෝ domain authorization ලැබුණා යැයි නොසලකයි.

## Actual checks

- `node --experimental-strip-types --test tests/domain/gateway-admission.test.mjs` — **5/5 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **392/392 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Actual Edge Function route wiring, provider token verification and Supabase
  transaction execution — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
