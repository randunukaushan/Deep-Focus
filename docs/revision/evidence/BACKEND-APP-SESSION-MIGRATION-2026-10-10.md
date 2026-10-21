# App-session registry migration candidate — 2026-10-10

App/API revocation boundary සඳහා `df_private.app_sessions` නමින් වෙනම
versioned migration candidate එකක් සකස් කළා. මෙය provider JWT signature
verification වෙනුවට භාවිත කළ යුතු එකක් නොවේ; server එක claims verify කරලා මේ
registry row එක transaction එකකදී නැවත පරීක්ෂා කළ යුතුයි.

## Implemented

- Owner profile foreign key, session UUID primary key, active/revoked state,
  issued/expiry/revoked timestamp checks සහ owner-state index.
- `df_private` private boundary එක රැකගෙන `anon`/`authenticated` direct table
  grants ඉවත් කරයි; `service_role` grant එක server review පසු පමණක් භාවිත කළ යුතුයි.
- Explicit owner-bound RLS policies සහ no automatic expiry trigger/job.
- Existing personal-core migration එක වෙනස් නොකර dependency-ordered follow-up
  migration එකක් ලෙස තබා ඇත.

## Actual checks

- Migration contract tests — **4/4 PASS**.
- Full bundled-runtime repository suite — **344/344 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Disposable PostgreSQL execution, rollback/restart, RLS penetration and
  concurrent revoke/read tests — **NOT_RUN**.
- Supabase Auth claim/session integration, independent security review and
  remote/production migration — **REVIEW_PENDING**.
