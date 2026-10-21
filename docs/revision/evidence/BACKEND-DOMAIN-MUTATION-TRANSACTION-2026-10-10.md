# Backend domain mutation transaction contract — 2026-10-10

මෙය personal-core writes සඳහා local transaction adapter contract එකකි. Real
PostgreSQL adapter එකක්, RPC එකක් හෝ remote migration එකක් මෙහි සක්‍රිය කර නැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/domain-mutation-transaction.test.mjs` — **5/5 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **423/423 PASS**.
- Documentation checker — **PASS**.

## Follow-up: session-bound fail-closed coverage — 2026-10-10

- A malformed session ID is rejected before a transaction opens.
- A session-bound mutation fails closed when the transaction store does not
  provide the required session recheck, before the owner head can be locked.
- Combined transaction/gateway/adapter focused checks — **24/24 PASS**.
- Full bundled-runtime repository suite — **649/649 PASS**; TypeScript and
  affected ESLint — **PASS**.
- Real PostgreSQL owner-head locking, RLS, crash/rollback and two-account
  integration tests remain **NOT_RUN / REVIEW_PENDING**.

## Remaining gates

- Real PostgreSQL owner-head locking, RLS, domain RPCs, crash/rollback and
  two-account integration tests — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
