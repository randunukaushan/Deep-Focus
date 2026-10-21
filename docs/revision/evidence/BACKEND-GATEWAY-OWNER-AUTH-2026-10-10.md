# Backend gateway owner authorization — 2026-10-10

මෙය admitted personal-core operations සඳහා local server-side authorization
candidate එකකි. Store callback එක caller-owned transaction එකකින් authoritative
row ownership කියවිය යුතුය. මෙය remote RLS හෝ live PostgreSQL evidence එකක් නොවේ.

## Implemented

- Direct task, goal සහ session resources verified actor owner ID සමඟ පරීක්ෂා කරයි.
- Task/goal/session create requests සඳහා workspace ownership තහවුරු කරයි.
- Optional task goal සහ session task links ද එම actor ටම අයත් බව තහවුරු කරයි.
- Missing/foreign rows දෙකම privacy-preserving `404 NOT_FOUND` වේ.
- Authorization failure එකක් තිබුණොත් domain handler එක කැඳවන්නේ නැත.

## Actual checks

- `node --experimental-strip-types --test tests/domain/gateway-authorization.test.mjs tests/domain/gateway-execution.test.mjs` — **9/9 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after this slice — **408/408 PASS**.
- Documentation checker — **PASS**.

## Remaining gates

- Real PostgreSQL/RLS reads, transaction locking, provider session verification
  and Edge Function execution — **NOT_RUN / REVIEW_PENDING**.
- Independent security review, remote migration/deployment and Android device
  verification — **REVIEW_PENDING / NOT_RUN**.
