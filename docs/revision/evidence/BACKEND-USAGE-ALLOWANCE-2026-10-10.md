# Server usage allowance boundary — 2026-10-10

AI සහ optional cloud-resource usage සඳහා server-authoritative allowance
decision foundation එකක් එකතු කළා. මෙය provider, payment, price හෝ live billing
integration එකක් නොවේ.

## Implemented

- Verified active capability admission එකක් නැත්නම් usage grant එකක් නොදෙයි.
- Owner, capability, period, policy version සහ server-held counters එකට බැඳී ඇත.
- Consumed සහ reserved units එකතුව limit එක ඉක්මවන්නේ නම් fail-closed වේ.
- Request units bounds පරීක්ෂා කරයි; client-controlled counter එකක් result එකට
  පිළිගන්නේ නැත.
- Accepted decision එක caller විසින් idempotency receipt සමඟ එකම server
  transaction එකක persist කළ යුතු බව code contract එකේ පැහැදිලි කර ඇත.
- `consumed` හෝ `released` receipt එකක් නැවත reservation replay කළොත් provider
  call එක නැවත නොයන ලෙස fail-closed වේ. Reserved provider execution helper එක
  success එකේ consume කරයි; provider failure එකේ release කරයි; settlement failure
  එක success ලෙස සඟවන්නේ නැහැ.
- Explicit reservation සහ settlement helpers read/allowance/receipt transition
  එක caller-owned transaction එකකට බැඳීමට contract කරයි; concurrent write lock
  එක final store implementation එකේ වගකීම ලෙස පැහැදිලිව තබයි.

## Actual checks

- Focused usage-boundary checks — **10/10 PASS**.
- Full bundled-runtime repository suite — **387/387 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.
- Docs checker — **PASS**.

## Remaining gates

- Actual PostgreSQL allowance reservation/consumption store, concurrent
  reservation integration සහ signed billing events — **NOT_RUN**.
- Provider/price decision, live payment activation, independent security review
  සහ deployment — **REVIEW_PENDING**.
