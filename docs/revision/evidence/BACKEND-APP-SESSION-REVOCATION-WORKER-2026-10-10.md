# Backend app-session revocation worker lease — 2026-10-10

මෙය provider-revocation outbox worker සඳහා local lease/fencing candidate එකකි.
Provider call, worker runtime, distributed lock සහ PostgreSQL execution මෙහි
සක්‍රිය කර නැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/app-session-revocation-worker.test.mjs` — **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **435/435 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- PostgreSQL atomic claim/lease expiry, worker fencing under concurrency, retry
  backoff and real provider revocation — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.

## Follow-up: claimed-record validation — 2026-10-10

- Storage claim result එකේ owner/session UUID, `processing` state, lease ID සහ
  lease expiry input claim එකට ගැළපෙනවාදැයි provider work පෙර validate කරයි.
- Malformed හෝ වෙනත් worker lease එකකට අයත් claim එක
  `REVOCATION_CLAIM_INVALID` ලෙස fail-closed වේ.
- Focused worker tests: **5/5 PASS**.
- Full bundled-runtime repository suite after this follow-up: **590/590 PASS**.
- TypeScript `--noEmit`: **PASS**; affected ESLint: **PASS**; documentation
  checker: **PASS** (80/80 requirements, 0 errors).
- Real provider/runtime, concurrent PostgreSQL lease proof සහ independent review
  තවම **NOT_RUN / REVIEW_PENDING**.
