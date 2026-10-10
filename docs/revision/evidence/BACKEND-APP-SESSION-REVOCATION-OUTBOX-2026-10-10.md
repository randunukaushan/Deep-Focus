# Backend app-session provider revocation outbox — 2026-10-10

මෙය app-session registry revoke එකෙන් පසු provider revocation retry සඳහා local
migration සහ transaction contract candidate එකකි. Provider credentials, raw
errors, remote migration හෝ worker runtime එකක් සක්‍රිය කර නැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/app-session-revocation.test.mjs` — **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **431/431 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- PostgreSQL migration execution, worker lease/fencing, provider signature/
  revocation adapter, retry/backoff and two-account integration — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
