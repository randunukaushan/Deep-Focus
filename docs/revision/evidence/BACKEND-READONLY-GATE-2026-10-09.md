# Backend read-only gate — 2026-10-09

මෙය local contract checks සහ approved `deep-focus-dev` project එකේ
read-only inspection එකේ evidence එකකි. මෙය migration, RLS penetration test,
Edge Function test හෝ production-readiness සාක්ෂියක් නොවේ.

## Local checks

- `node docs/revision/check-backend-contracts.mjs --details` — **PASS**.
  DTO fixtures: 36, cursor fixtures: 7, operations: 14, resolved references:
  170, declared prototype tables: 9. The checker explicitly reports that it
  does not execute SQL/API/Auth/RLS.
- Bundled Node runtime එකෙන් domain/component/navigation suite — **188/188
  PASS**, 0 fail, 0 skipped, 0 todo. මෙය කලින් evidence එකේ සඳහන් 190/190
  run එකට අමතර fresh run එකකි; එම count දෙක එකම command output එකක් ලෙස
  එකට claim නොකරයි.
- `tsc --noEmit` — **PASS**.
- Direct Expo lint command — **PASS**. Existing warning එකක් නොපෙන්වා exit 0.
- `node docs/revision/check-docs.mjs` — **PASS**: Markdown 94, local links
  936, requirements 80/80, cloud runtime scenarios 0 run.

## Development project read-only observation

Supabase connector මගින් project ID `wffyrevlhnqiycoybqia` සඳහා 2026-10-09
read-only checks:

- `public` සහ `df_private` schemas සඳහා tables — **0**.
- Migrations — **0**.
- Security advisors — **0 lints**.

මෙයින් project එක empty/healthy බව පමණක් තහවුරු වේ. Backend tables, ownership,
RLS, API handlers හෝ secure sync implemented/accepted බව එයින් තහවුරු නොවේ.

## Tooling and gates

Local `supabase` executable එක PATH එකේ හෝ කලින් තිබූ temporary folders තුළ
නොතිබුණි. නිල CLI archive එකෙන් verified executable එකක් ලබාගත නොහැකි නිසා
CLI-generated migration එකක් නිර්මාණය නොකළෙමි. Project dependencies,
lockfiles, Supabase project schema සහ remote data වෙනස් නොකළෙමි.

Backend migration/RLS/API work — **REVIEW_PENDING**. Independent security
review, isolated SQL execution evidence, provider/auth runtime evidence සහ
Android device evidence ඉදිරියට අවශ්‍යය. Production migration, deployment,
commit සහ push මෙහි සිදු නොවීය.
