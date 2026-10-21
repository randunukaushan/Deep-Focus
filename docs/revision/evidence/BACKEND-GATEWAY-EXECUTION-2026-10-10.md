# Backend gateway handler execution — 2026-10-10

මෙය request admission සහ operation DTO admission පසු server-side handler එකකට
යන local execution boundary එකකි. මෙය database transaction, Supabase Auth,
ownership policy හෝ remote Edge Function implementation එකක් ලෙස නොසලකයි.

## Implemented

- Admitted operation එකේ allowlisted handler එක පමණක් කැඳවයි.
- Actor, operation, path resource ID, idempotency key සහ validated body පමණක්
  handler context එකට ලබා දෙයි.
- Handler එක නොමැති විට fake success නොදී `503 DEPENDENCY_UNAVAILABLE` දෙයි.
- Safe boundary errors සහ unexpected provider/SQL/stack errors raw details නැති
  public envelope එකකට map කරයි.
- Success response එක operation status (`200/201`), plain object body, JSON
  serializability සහ 256 KiB byte ceiling එකට සීමා කරයි.

## Actual checks

- `node --experimental-strip-types --test tests/domain/gateway-execution.test.mjs` — **7/7 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after the current local slices — **685/685 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Real domain handlers, server-side authorization, database transactions and
  provider session verification — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.

## Follow-up: domain mutation receipt acknowledgement

- PostgreSQL domain mutation receipt insert එක `returning mutation_id` මගින්
  database එකෙන් ඇත්තටම row එකක් ලැබුණු බව පරීක්ෂා කරයි. Row එක නොලැබුණොත්
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ; caller transaction එක rollback
  කළ යුතු බැවින් domain mutation එක success ලෙස පිට නොවේ.
- Missing acknowledgement සඳහා regression test එකක් සහ gateway harness එකේ
  returning-row fixture එකක් එක් කළා. Code assertion ඉවත් කිරීමක් හෝ දුර්වල
  කිරීමක් කළේ නැහැ.
- Focused domain mutation, adapter සහ gateway checks — **15/15 PASS**.
- Full bundled-runtime repository suite — **593/593 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Documentation checker — **PASS**.
- `git diff --check` — code errors නැත; පවතින line-ending warnings පමණි.
