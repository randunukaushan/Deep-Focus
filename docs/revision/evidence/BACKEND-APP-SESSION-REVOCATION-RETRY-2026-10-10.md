# Backend app-session revocation retry schedule — 2026-10-10

මෙය revocation worker සඳහා bounded retry timing local candidate එකකි. Delay
values engineering defaults පමණි; production policy, queue runtime සහ provider
behaviour review කර නැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/app-session-revocation-retry.test.mjs` — **3/3 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **438/438 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Reviewed production backoff/jitter policy, durable worker runtime and provider
  reconciliation — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
