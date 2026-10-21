# Copilot PR #16 security finding reconciliation — 2026-10-12

මෙය Copilot වාර්තාවේ claims repository code, tests සහ canonical security
contracts සමඟ සසඳන local reconciliation එකක් පමණි. Live database, device
verification හෝ independent review මෙයින් සිදු වී නැත.

| Claim | Repository evidence | තත්ත්වය |
|---|---|---|
| `.env.example` තුළ Supabase values තිබීම | URL එක placeholder එකකි; key එක `sb_publishable_` placeholder එකකි. `service_role`/secret key එකක් නැත. `public-secret-scan` source test සහ gateway publishable-key rejection test පවතී. | Critical secret leak එක තහවුරු නොවේ; placeholder/client-safe configuration තහවුරුයි. |
| RLS සහ දෙගිණුම් isolation සැබෑ DB එකක පරීක්ෂා නොවීම | Migration contract tests RLS, client-role revoke සහ service-only grants පරීක්ෂා කරයි. නමුත් live authenticated identities දෙකකින් SQL/RLS negative test එකක් ධාවනය කර නැත. | `REVIEW_PENDING` / `NOT_RUN` |
| Auth session revocation සැබෑ Supabase Auth flow එකේ පරීක්ෂා නොවීම | Local gateway/session contracts සහ revocation logic tests පවතී. Provider-backed sign-out, old-token rejection, restart සහ account switching run එකක් නැත. | `REVIEW_PENDING` / `NOT_RUN` |
| Offline sync සහ Android restart recovery device එකකින් පරීක්ෂා නොවීම | Local outbox, retry, duplicate, owner-switch සහ recovery tests පවතී. Android/native restart/network-loss evidence නැත. | `REVIEW_PENDING` / `NOT_RUN` |
| AI apply token expiry/duplicate apply | Local confirmation, expiry, receipt and idempotency guards/tests පවතී. Real provider/server integration run එකක් නැත. | Local guard තහවුරුයි; real integration `NOT_RUN` |
| Sinhala/English/Tamil, accessibility සහ device rendering | Static/domain coverage පවතින නමුත් full installed-device rendering/assistive-technology pass එකක් නැත. | `REVIEW_PENDING` / `NOT_RUN` |
| Copilot review එක full line-by-line review නොවීම | වාර්තාවේ scope එක targeted review ලෙස පමණි; repository audit එකෙන් එය full independent review බව තහවුරු කළ නොහැක. | Independent review `REVIEW_PENDING` |

## Verification in this reconciliation

- Remote API token boundary focused test: **9/9 PASS**.
- Gateway focused suite: **14/14 PASS**, including malformed-authorization-header regression.
- PostgreSQL authorization adapter coverage now includes the `plan` to
  `ai_plans` ownership mapping.
- Remote transport/serialization regressions: **11/11 PASS** in the combined
  remote API client suite.
- Full repository suite (latest local run): **1454 tests: 1448 PASS, 0 FAIL, 6 SKIPPED** across **258** test files. The six skipped cases are PGlite-backed PostgreSQL integration tests, so they are not counted as passing live-database evidence.
- TypeScript typecheck and affected ESLint: **PASS**.
- Documentation checker: **PASS** (`526` markdown files, `936` local links).
- AI generation completion result-integrity regression: **6/6 PASS**; malformed job transition receipts now fail closed.
- No live Supabase write, migration, deployment, merge, paid service or
  production-data operation was performed.
