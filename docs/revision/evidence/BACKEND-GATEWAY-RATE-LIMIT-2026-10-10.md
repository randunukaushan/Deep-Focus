# Backend gateway rate-limit admission — 2026-10-10

මෙය gateway request සඳහා caller-supplied atomic counter store contract එකකි.
එය in-memory හෝ process-local limiter එකක් ලෙස production proof නොවේ; shared
distributed implementation එක පසුව review කළ යුතුය.

## Actual checks

- `node --experimental-strip-types --test tests/domain/gateway-rate-limit.test.mjs` — **4/4 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **427/427 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Distributed atomic counter, abuse load tests, retention cleanup and runtime
  configuration — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.

## Follow-up: authenticated gateway wiring — 2026-10-10

- `handleAuthenticatedGatewayRequest` දැන් request එක handler වෙත යැවීමට පෙර
  configured atomic counter එකෙන් actor/operation scoped limit එක පරීක්ෂා කරයි.
- Denied request එක `429 RATE_LIMITED` ලෙස map වන අතර handler එක කැඳවන්නේ නැත.
- Denied response එකට server-derived `Retry-After` header එක එක් වේ.
- Gateway/rate-limit focused checks — **11/11 PASS**.
- Error-boundary header regression checks — **18/18 PASS**; full bundled-runtime
  suite — **670/670 PASS**; TypeScript, affected ESLint and docs checker —
  **PASS** (228 Markdown, 936 links, 80/80 requirements).
- Full bundled-runtime suite — **662/662 PASS**; TypeScript and affected
  ESLint — **PASS**; docs checker — **PASS** (226 Markdown, 936 links,
  80/80 requirements).
- Distributed counter, runtime configuration, independent
  security review සහ device verification — **NOT_RUN / REVIEW_PENDING**.
