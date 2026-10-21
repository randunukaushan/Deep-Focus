# Backend evidence — gateway hash wiring (2026-10-10)

## Implemented

`gateway-execution.ts` දැන් admitted operation (gateway හි camelCase operation නාම ඇතුළුව), request path සහ validated request body සඳහා canonical SHA-256 hash එක ගණනය කර `requestSha256` ලෙස server-derived handler context එකට ලබාදෙයි. Domain adapter එකකට එය caller-owned mutation transaction එකට යවා `df_private.mutation_receipts` තුළ intent-bound receipt එකක් සුරැකිය හැක.

Hash එකට actor identity, idempotency key, secrets හෝ transport-only request ID ඇතුළත් නොවේ. Authorization එක domain handler එකට පෙර සිදු වේ.

## Verification

- Focused `gateway-execution.test.mjs`: 7/7 passed; exact canonical hash propagation ඇතුළත්.
- Full bundled runtime suite: 441/441 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker සහ `git diff --check`: මේ slice එකෙන් පසු නැවත ධාවනය කළ යුතුයි.

## Boundaries

මෙය local implementation candidate එකක් පමණයි. Remote migration, database write, production data access, deployment, commit හෝ push සිදු කර නැහැ. PostgreSQL adapter wiring, cross-runtime hash fixtures, independent security review සහ Android/device verification තවම `REVIEW_PENDING`.
