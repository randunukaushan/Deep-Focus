# Changelog
- Post-focus break record සඳහා local-only backend foundation එක එකතු කළා.
  Owned terminal focus session පරීක්ෂාව, server-derived `actualMs`, duplicate
  rejection, bounded timestamps, RLS/server-only migration, gateway route සහ
  sync payload wiring ඇතුළත්. Focused checks **49/49 PASS**; full suite
  **701/701 PASS**; TypeScript, affected ESLint, docs checker සහ diff check
  **PASS**. Mobile materializer, OS scheduling, remote apply, independent
  review සහ Android verification තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL sync change contract එකේ තිබූ mismatch එක නිවැරදි කිරීමට
  local-only migration candidate එකක් එකතු කළා. `settings` upsert changes
  පිළිගන්න අතර delete tombstones සඳහා `payload = NULL` නීතියත් schema එකට
  ඇතුළත් කළා. Operation/payload consistency constraint එක නිසා වැරදි
  payload එකක් සමඟ sync change commit වීම වැළකේ. Migration සහ security
  contract checks **12/12 PASS**. Remote apply, PostgreSQL execution,
  independent review සහ production migration තවම `NOT_RUN / REVIEW_PENDING`.
- User settings sync සඳහා mobile SQLite materializer එක එකතු කළා. Remote
  payload validation, owner isolation, stale-version protection, replay safety
  සහ receipt/mirror/settings/cursor එකම transaction එකක atomic කිරීම ඇතුළත්.
  Local SQLite schema version 12 migration එකෙන් settings typed columns සහ
  sync receipt constraint එක එකතු කළා; පරණ JSON source මකා නැහැ. Mobile
  focused checks **24/24 PASS**; full suite **693/693 PASS**; TypeScript,
  affected ESLint, docs checker සහ diff check **PASS**. Supabase/production
  apply, independent security review සහ Android device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Canonical settings contract එකට ගැළපෙන local-only `df_private.user_settings`
  migration foundation එක එකතු කළා. Owner binding, version, bounded defaults,
  RLS සහ `service_role`-only grants ඇතුළත්. Supabase වෙත apply කළේ නැහැ.
  Migration checks **8/8 PASS**; full suite **686/686 PASS**; TypeScript,
  affected ESLint, docs checker සහ diff check **PASS**. Owner-bound
  `GET /v1/settings` read route එකත් එකතු කළා. දැන් owner/version-bound
  `PATCH /v1/settings` සහ `settings` sync entity support එකත් ඇත. Settings
  focused checks **37/37 PASS**, full suite **692/692 PASS**. Mobile materializer,
  remote runtime/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Local gateway candidate එකට owner-scoped `DELETE /v1/tasks/{id}` එකතු කළා.
  Task එක physical delete නොකර version bump එකක් සහ null-payload task tombstone
  එකක් sync feed එකට දමයි; කලින් focus-session history රැකේ. Gateway transaction
  integration regression එකත් එකතු කළා. Focused checks **49/49 PASS**; full suite
  **685/685 PASS**; TypeScript, affected ESLint,
  docs checker සහ diff check **PASS**. Reminder cancellation සහ live planning
  link cleanup සඳහා canonical storage contract නැති නිසා ඒවා `REVIEW_PENDING`.
  Remote runtime, independent security review සහ Android/device verification
  තවම `NOT_RUN / REVIEW_PENDING`.
- Local gateway candidate එකට owner-scoped `DELETE /v1/goals/{id}` එකතු කළා.
  Physical delete නොකර soft-delete version bump එකක්, null-payload goal
  tombstone එකක් සහ committed sync sequence එකට බැඳුණු idempotency receipt එකක්
  භාවිතා කරයි. Focused checks **55/55 PASS**; full suite **680/680 PASS**;
  TypeScript, affected ESLint, docs checker සහ diff check **PASS**. Remote
  runtime, independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Sync push/pull validators වල canonical delete change එකට `payload: null`
  නිවැරදිව allow කළා. Upsert payload validation දුර්වල කළේ නැහැ; delete hash,
  ordering සහ replay checks තවම ක්‍රියාත්මකයි. Focused checks **12/12 PASS**;
  full suite **693/693 PASS**; TypeScript, ESLint සහ docs checker **PASS**.
- PostgreSQL mutation transaction එකට optional response finalizer එකක් එකතු කළා.
  Sync change sequence එක DB transaction එකෙන් ලැබුණු පසුව response එකත්
  idempotency receipt එකත් එකම committed result එකට බැඳිය හැක. මෙය canonical
  delete tombstone සඳහා foundation එකක් පමණයි; delete route සක්‍රිය කළේ නැහැ.
  Focused checks **31/31 PASS**; full suite **691/691 PASS**; TypeScript,
  ESLint, docs checker සහ diff check **PASS**.
- Local server candidate එකට owner-scoped `PATCH /v1/goals/{id}` එකතු කළා.
  `expectedVersion` අනිවාර්යයි; title/description පමණක් වෙනස් කළ හැකි අතර
  version match නොවුණොත් conflict වේ. Commit එකෙන් පසු patched goal එක owner
  sync change feed එකට ඇතුළත් වේ. Focused checks **28/28 PASS**; full suite
  **690/690 PASS**; TypeScript, ESLint, docs checker සහ diff check **PASS**.
  Goal delete tombstone/receipt එක වෙනම `REVIEW_PENDING`.
- Canonical sync command 14 අතරින් remote pusher එකේ අඩුවී තිබූ task/goal delete
  සහ patch, break, settings, reminder commands map කළා. Versioned delete
  requests `Expected-Version` header එකෙන් පමණක් යවයි; remote API client එකට
  idempotent `DELETE` සහ range validation එකතු කළා. Focused remote checks
  **15/15 PASS**; full suite **687/687 PASS**; TypeScript, ESLint සහ docs
  checker **PASS**. Remote runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Gateway evidence notes වල පරණ test counts current repository outputට ගලපලා update කළා:
  entrypoint **10/10**, execution **7/7**, full suite **685/685**. Code behavior
  වෙනස් කළේ නැහැ; docs checker සහ affected checks **PASS**. Remote runtime සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Sync outbox cleanup එකේ failed load එකකට පස්සේ ඇතිවිය හැකි unhandled rejection
  අවදානම ඉවත් කළා. මුල් error එක caller වෙතම යන අතර ඊළඟ retry එකට store lock
  නොවී නැවත sync විය හැකි බව regression test එකෙන් තහවුරු කළා. Sync focused
  checks **20/20 PASS**; full suite **685/685 PASS**; TypeScript, affected ESLint
  සහ docs checker **PASS**. Remote sync runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Server entitlement migration contract එකට `service_role` පමණක් privilege ලැබෙන බවත්
  `public/anon/authenticated` grants නොමැති බවත් regression assertions දෙකකින් තහවුරු කළා.
  Full suite, TypeScript, affected ESLint සහ docs checker **PASS**. Live RLS,
  remote runtime සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
- AI proposal එකේ allowance reservation fail වුණොත් raw storage error leak නොවී
  safe `DEPENDENCY_UNAVAILABLE` ලැබෙන ලෙස සකස් කළා; provider call එකට පෙරම
  නවත්වන regression test එකක් එක් කළා. AI/planning focused checks
  **22/22 PASS**; full suite **684/684 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI apply boundary එකේ session recheck raw failuresත් safe
  `DEPENDENCY_UNAVAILABLE` response එකකට map කළා. Server-defined auth errors
  preserve කරන අතර apply callback එකට යාම නවත්වන regression test එකක් එකතු කළා.
  AI/planning focused checks **21/21 PASS**; full suite **683/683 PASS**;
  TypeScript, affected ESLint සහ docs checker **PASS**. Remote runtime සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- AI confirmed-plan apply callback එකේ raw errors safe `DEPENDENCY_UNAVAILABLE`
  boundary එකකට map කළා; දැනටමත් server-defined `SafeBoundaryError` codes
  preserve කරනවා. Provider/session/apply leakage regression coverage සමඟ
  AI/planning focused checks **20/20 PASS**; full suite **682/682 PASS**;
  TypeScript, affected ESLint සහ docs checker **PASS**. සැබෑ provider සහ
  remote runtime තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated gateway සඳහා synthetic accounts දෙකක isolation regression එකක්
  එක් කළා. Account A සහ Account B requests දෙකම verified actor/session සහ
  owner-scoped resource එකටම බැඳෙන බව පරීක්ෂා වේ. Gateway focused checks
  **23/23 PASS**; full suite **681/681 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. මෙය local boundary evidence එකක් පමණයි; සැබෑ
  Supabase/RLS පරීක්ෂණ තවම `NOT_RUN / REVIEW_PENDING`.
- Confirmed AI plan apply boundary එකට apply-වීමට පෙර verified actor/session
  recheck එක අනිවාර්ය කළා. Revoked-session regression test එක server apply
  callback එකට පෙර නවත්වන බව තහවුරු කරයි. AI/planning focused checks
  **19/19 PASS**; full suite **680/680 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. සැබෑ provider, remote allowance store සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL snapshot metadata/page adapters වලටත් `sessionId` අනිවාර්ය කළා.
  Session recheck එක metadata/page private readsට පෙර සිදු වන අතර missing-session
  direct composition එක fail-closed වේ. Snapshot focused checks **21/21 PASS**;
  full suite **679/679 PASS**; TypeScript, affected ESLint සහ docs checker
  **PASS**. Remote RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL sync pull/commit adapters වලට `sessionId` දැන් අනිවාර්ය කළා.
  Session recheck එක private sync head/change queriesට පෙර transaction එක තුළම
  සිදු වේ; session නැති direct composition එක fail-closed වේ. Sync focused
  checks **19/19 PASS**; full suite **677/677 PASS**; TypeScript, affected
  ESLint සහ docs checker **PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL read-handler boundary එක දැන් `sessionId` නැති direct composition එකක්
  දත්ත query වෙත යාමට පෙර `AUTH_REQUIRED` ලෙස නවත්වයි. Valid session තිබෙන reads
  සහ missing-session regression coverage එකතු කළා. Gateway/read focused checks
  **22/22 PASS**; full suite **676/676 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote RLS, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL entitlement read contract එකෙන් `sessionId` දැන් අනිවාර්ය කළා.
  Usage reserve/read paths දැනටමත් කළ app-session recheck එකට එම ID එකම pass
  කරන නිසා, session-boundary එක මඟහැරෙන internal composition එකක් compile-time
  මට්ටමේදීත් වැළකේ. Entitlement/capability/usage focused checks **29/29 PASS**;
  full suite **675/675 PASS**. Remote PostgreSQL/RLS, independent security
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
- Server AI planning boundary candidate එකක් එක් කළා. AI allowance එක server-side
  reserve නොවුණොත් provider call නොකරයි; provider failure එකේ reservation
  release කරයි; success එකේ consume කරයි. Plan apply callback එක explicit,
  matching confirmation token එකෙන් පසුව පමණක් කැඳවයි. AI/usage focused checks
  **31/31 PASS**; full suite **675/675 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. මෙය සැබෑ OpenAI integration එකක් නොවන අතර provider,
  credentials, remote storage සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI provider failure එක raw error එකක් ලෙස ඉහළට නොයවා
  `AI_PROVIDER_UNAVAILABLE` safe boundary code එකකට map කළා; allowance release
  සහ apply-not-called regression එකත් රැකුණා. AI boundary checks
  **31/31 PASS**.
- Rate-limit denial response එකට bounded `Retry-After` header එක සම්බන්ධ කළා.
  Header එක server-derived seconds වලින් පමණක් එන අතර error body එකේ secret හෝ
  internal detail නැත. Gateway/error-boundary checks **18/18 PASS**; full
  suite **670/670 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
- Gateway error path එකට allowlisted diagnostic logger hook එකක් සම්බන්ධ කළා.
  `SafeBoundaryError` code/status/retryability සහ validated request ID පමණක්
  log කරයි; raw error message, stack, SQL, token හෝ request body නොයයි. Logger
  එක fail වුණත් public response එක වෙනස් නොවේ. Error-boundary/gateway checks
  **14/14 PASS**; full suite **670/670 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote logging integration සහ independent review
  `NOT_RUN / REVIEW_PENDING`.
- Gateway rate-limit සඳහා local PostgreSQL atomic counter adapter සහ
  `gateway_rate_limit_buckets` migration candidate එක් කළා. Owner/operation/
  fixed-window key එක `ON CONFLICT` update එකකින් ගණන් කරයි; malformed DB result
  fail-closed වේ. Local concurrent counter contract එකත් පරීක්ෂා කරයි.
  Rate-limit/migration focused checks **26/26 PASS**; full suite **671/671
  PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Remote SQL, retention cleanup, distributed load test සහ independent review
  තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated gateway එකට actor/operation scoped atomic rate-limit admission
  සම්බන්ධ කළා. Counter එක deny කළොත් handler එකට යාමට පෙර bounded `429`
  response එකක් ලැබේ. Gateway/rate-limit checks **11/11 PASS**; full suite
  **662/662 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Distributed counter, retention cleanup සහ runtime configuration තවම
  `REVIEW_PENDING`.
- Authenticated mutation gateway එකේ write handlers සඳහා `sessionId` දැන්
  අනිවාර්යයි. Session එක නොමැති request එක owner/profile/head write කිරීමට
  පෙර `AUTH_REQUIRED` ලෙස නවතයි. Gateway/domain focused checks **23/23 PASS**;
  full suite **661/661 PASS**; TypeScript, affected ESLint සහ docs checker
  **PASS**. Remote PostgreSQL/RLS සහ independent review
  `NOT_RUN / REVIEW_PENDING`.
- Snapshot build/staging writes දැන් verified `sessionId` එකෙන් transaction
  ඇතුළත recheck කරයි. Revoked session එකකදී snapshot insert/update එකට පෙර
  fail-closed වේ. Snapshot staging/build checks **14/14 PASS**; full suite
  **660/660 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Remote PostgreSQL/RLS, independent review සහ device verification
  `NOT_RUN / REVIEW_PENDING`.
- Snapshot metadata, page සහ signed-cursor reads වලට verified `sessionId`
  transaction එකට බැඳුණා. Revoked session එකකදී snapshot query එකට පෙර
  `AUTH_REQUIRED` ලෙස නවතන regression coverage එක එක් කළා. Snapshot read/cursor
  checks **12/12 PASS**; full regression **659/659 PASS**; TypeScript සහ
  affected ESLint **PASS**; docs checker **PASS** (226 Markdown, 936 links,
  80/80 requirements). Real PostgreSQL/RLS, independent security review සහ
  Android/device verification `NOT_RUN / REVIEW_PENDING`.
- Entitlement/usage migration contract tests තවත් තද කළා: profile foreign key,
  owner-capability primary key, composite allowance/receipt ownership සහ client
  role grants නොමැති බව explicitව පරීක්ෂා කරයි. Migration/security checks
  **9/9 PASS**; full regression **657/657 PASS**; TypeScript සහ affected ESLint
  **PASS**. Remote SQL/RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI/cloud usage service boundary එකේ reserve, settle සහ allowance read සඳහා
  verified `sessionId` දැන් අනිවාර්ය කළා. Session එකක් නොමැති හෝ revoked වූ විට
  entitlement, allowance හෝ receipt data වෙත යාමට පෙර fail-closed වේ. Usage
  focused checks **34/34 PASS**; full regression **657/657 PASS**; TypeScript
  සහ affected ESLint **PASS**. Live billing/provider integration,
  PostgreSQL/RLS සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Server entitlement reads වලට session-bound transaction recheck එක එක් කළා.
  AI/cloud capability record එක කියවීමට පෙර active app session එක lock කරයි;
  revoked session එකකදී capability data වෙත නොයයි. Entitlement focused checks
  **11/11 PASS**; full regression **655/655 PASS**; TypeScript සහ affected
  ESLint **PASS**. Live billing/provider integration, PostgreSQL/RLS සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated PostgreSQL read handlers වලටත් transaction-level app-session
  recheck එක එක් කළා. Session revoke/expiry race එකක් තිබුණත් protected query
  එකට පෙර `AUTH_REQUIRED` ලෙස නවතයි. Read/gateway focused checks **17/17 PASS**;
  full regression **653/653 PASS**; TypeScript සහ affected ESLint **PASS**.
  Real PostgreSQL/RLS, independent security review සහ Android verification
  තවම `NOT_RUN / REVIEW_PENDING`.

- Sync pull/commit gateway එකට verified app session recheck එක සම්බන්ධ කළා.
  Pull සහ commit දෙකේම data read/head lock කිරීමට පෙර `app_sessions` row එක
  transaction එකේ lock කර active, නොකල් ඉකුත් වූ සහ revoke නොකළ බව පරීක්ෂා කරයි.
  Sync gateway tests **4/4 PASS**; අදාළ adapter checks සමඟ **28/28 PASS**;
  full regression **651/651 PASS**; TypeScript සහ affected ESLint **PASS**.
  Real PostgreSQL/RLS සහ independent security review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Backup restore regression coverage දැන් පළමු transaction rollback වීමෙන් පසු
  එකම digest-bound artifact එක නැවත භාවිතයෙන් සාර්ථක retry එකක්ද පරීක්ෂා කරයි.
  Backup checks **12/12 PASS**; full regression **650/650 PASS**; TypeScript සහ
  affected ESLint **PASS**. මෙය actual database restore හෝ production backup
  evidence එකක් නොවන අතර ඒවා තවම `NOT_RUN / REVIEW_PENDING`.

- Domain mutation contract එකට session-bound negative coverage එක එක් කළා:
  malformed session ID එක transaction එක විවෘත කිරීමට පෙර reject වෙයි; session
  recheck adapter එක නොමැති නම් owner head lock එකට යාමට පෙර fail-closed වෙයි.
  Focused transaction/gateway/adapter checks **24/24 PASS**; full regression
  **649/649 PASS**; TypeScript සහ affected ESLint **PASS**. Real PostgreSQL/RLS,
  independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Domain mutation writes දැන් actorගේ app session එකත් එකම database transaction එකේ
  නැවත lock කර පරීක්ෂා කරයි. Active, නොකල් ඉකුත් වූ සහ revoke නොකළ session එකක්
  නැතිනම් mutation applier එකට හෝ sync head lock එකට නොයයි. Gateway එක verified
  session ID එක transaction context එකට pass කරන බවට regression assertion එකක්ද
  එක් කළා. Focused checks **26/26 PASS**; full regression **647/647 PASS**;
  TypeScript සහ affected ESLint **PASS**. Real PostgreSQL/RLS execution,
  independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Domain mutation transaction එක `sync_heads` lock කිරීමට පෙර එකම transaction
  එකේ actorගේ active profile row එක lock කරලා නැවත පරීක්ෂා කරන ලෙස ශක්තිමත්
  කළා. Missing/disabled profile එකකින් mutation එකක් ඉදිරියට නොයයි. නව
  regression test සමඟ focused domain/gateway checks **12/12 PASS**; full
  regression **645/645 PASS**. Real PostgreSQL/RLS execution, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Migration safety gate එකට private-table migration එකකින් `public`, `anon` හෝ
  `authenticated` වෙත direct `GRANT` එකක් නොයන බවට වෙනම assertion එකක් එක්
  කළා. Migration safety checks **3/3 PASS**; full regression **644/644 PASS**.
  මෙය static SQL evidence එකක් පමණයි; remote migration/RLS execution,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL task action, sync head advance සහ snapshot publish `RETURNING`
  contracts සම්පූර්ණ කළා. Task action එකේ SQL එක දැන් code එක validate කරන
  `owner_id` field එකම ආපසු ලබා දෙයි; sync head සහ ready snapshot දෙකම owner හා
  resource identity validate කරයි. Foreign returned metadata සඳහා regression
  tests 2ක් එක් කළා. Combined focused checks **27/27 PASS**; full regression
  **644/644 PASS**. Remote PostgreSQL/RLS execution, independent review සහ
  device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL usage reservation සහ settlement writes වල returned receipt/allowance
  metadata validate කරන ලෙස ශක්තිමත් කළා. Foreign owner, capability හෝ period
  metadata ලැබුණොත් grant/settlement එක සාර්ථක ලෙස report කරන්නේ නැහැ. නව
  regression checks 5ක් සමඟ usage adapter focused checks **16/16 PASS**;
  full regression **642/642 PASS**. TypeScript, affected ESLint, docs checker
  සහ diff checkත් සාර්ථකයි. Remote entitlement/RLS review, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session revocation outbox insert එකේ returned `owner_id`, `session_id` සහ
  `revocation_id` validate කරන ලෙස ශක්තිමත් කළා. Foreign outbox metadata
  ලැබුණොත් revocation එක created ලෙස report කරන්නේ නැහැ. Focused checks
  **7/7 PASS**; full regression **637/637 PASS**. Remote auth/RLS review,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- App session create/revoke writes වල returned owner, session ID සහ revoke
  status validate කරන ලෙස auth adapter එක ශක්තිමත් කළා. Foreign session
  metadata ලැබුණොත් write එක පිළිගන්නේ නැහැ. Focused checks **6/6 PASS**;
  full regression **636/636 PASS**. Remote auth/RLS review, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Mutation receipt ලියන විට returned `owner_id`, operation සහ `mutation_id`
  request receipt එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  receipt metadata ලැබුණොත් idempotency result එක පිළිගන්නේ නැහැ. Focused
  checks **11/11 PASS**; full regression **635/635 PASS**. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Sync head advance එකේ returned `owner_id` සහ sequence verified actor/next
  sequence එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign head
  metadata ලැබුණොත් advance එක පිළිගන්නේ නැහැ. Sync writer focused checks
  **7/7 PASS**; full regression **634/634 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Mutation-to-sync change writer එකේ returned insert row එකේ `owner_id`,
  sequence සහ hash පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign metadata ලැබුණොත්
  sync head advance නොකර fail-closed වේ. Sync writer focused checks **6/6
  PASS**; full regression **633/633 PASS**. Remote RLS, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL sync transaction change insert එකේ returned `owner_id`, sequence සහ
  hash request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign insert
  metadata එකක් ලැබුණොත් owner head advance නොකර fail-closed වේ. Sync focused
  checks **11/11 PASS**; full regression **632/632 PASS**. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task actions වල අවසාන update එකෙන් ආපසු ලැබෙන task `owner_id` සහ `id`
  verified actor/task එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **5/5 PASS**; full regression **631/631 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task creation `RETURNING` row එකේ `owner_id`, `workspace_id` සහ `id`
  verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **8/8 PASS**; full regression **630/630 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task patch update එකේ returned task `owner_id` සහ `id` verified actor/task
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign ownership metadata
  එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks **6/6 PASS**;
  full regression **629/629 PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session event update එකේ returned session `owner_id` සහ `id` verified
  actor/session එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **7/7 PASS**; full regression **628/628 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session event insert එකෙන් ආපසු ලැබෙන event `owner_id`, `session_id`,
  `sequence` සහ `type` request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign හෝ replay-shaped metadata එකක් ලැබුණොත් session update නොකර
  fail-closed වේ. Focused checks **6/6 PASS**; full regression **627/627
  PASS**. Remote RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Focus session start කිරීමේදී returned session `owner_id`, `workspace_id` සහ
  `id` verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign metadata එකක් ලැබුණොත් response එක පිළිගන්නේ නැහැ. Focused checks
  **7/7 PASS**; full regression **626/626 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Goal creation සඳහා database එකෙන් ආපසු ලැබෙන goal `owner_id`, `workspace_id`
  සහ `id` verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත්
  කළා. Foreign metadata එකක් ලැබුණොත් response එක accept නොකර
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ. Focused checks **6/6 PASS**;
  full regression **625/625 PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task actions (`begin`, `complete`, `cancel`, `archive`) සඳහා current task row
  එකේ returned `owner_id` සහ `id` verified actor/request එකට ගැළපෙනවාදැයි
  පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign metadata එකක් ලැබුණොත් state update
  නොකර fail-closed වේ. Focused checks **4/4 PASS**; full regression
  **624/624 PASS**. Remote RLS, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`.

- Task patch කරන විට goal join එකෙන් ආපසු ලැබෙන task owner, task ID, goal owner,
  goal workspace සහ goal ID නැවත validate කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් task update නොකර fail-closed වේ. Focused checks
  **5/5 PASS**; full regression **623/623 PASS**. Remote RLS/workspace
  isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Task create goal lookup එක returned owner, workspace සහ goal ID verified
  actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign goal
  metadata එකක් task එකකට භාවිත වීම නවත්වන regression test එකක් එක් කළා.
  Remote RLS/workspace isolation, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **7/7 PASS**; full
  regression **622/622 PASS**.

- Task create workspace lookup එක returned owner සහ workspace ID verified actor
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign workspace metadata
  එකක් task එකකට භාවිත වීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/workspace isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**; full regression
  **621/621 PASS**.

- Task නැති `startSession` අවස්ථාවේ workspace lookup එක returned owner සහ ID
  verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign workspace metadata එකක් session එකකට භාවිත වීම නවත්වන regression test
  එකක් එක් කළා. Remote RLS/session isolation, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**;
  full regression **620/620 PASS**.

- Snapshot staging retry එක existing page row එක accept කිරීමට පෙර returned
  owner සහ snapshot identity පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign page metadata
  එකක් ready snapshot එකකට ඇතුළු වීම නවත්වන regression test එකක් එක් කළා.
  Remote snapshot/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused staging/build checks **12/12 PASS**;
  full regression **619/619 PASS**.

- Idempotency mutation receipt reads වල returned owner, operation සහ mutation ID
  replay request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස adapter එක ශක්තිමත් කළා.
  Foreign receipt data එකක් replay success එකක් වීම නවත්වන regression test එකක්
  එක් කළා. Remote database/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**; full regression
  **618/618 PASS**.

- Goal creation workspace lookup එක returned owner සහ workspace ID verified
  actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign workspace
  metadata එකක් goal එකකට බැඳීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/workspace isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **617/617 PASS**.

- Start-session task lookup එක returned owner, workspace සහ task ID request
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign task metadata එකක්
  session snapshot එකට copy වීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/session isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **616/616 PASS**.

- Session event update එකේ locked session row එකේ returned owner සහ session ID
  verified actor/resource එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote
  RLS/event isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **615/615 PASS**.

- App-session registry read එක returned owner සහ session identity request එකට
  ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign session row එකක්
  authorization/revocation flow එකට යාම නවත්වන regression test එකක් එක් කළා.
  Remote auth/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **614/614 PASS**.

- Usage allowance reads වල owner, capability සහ period scope එකත්, settlement
  receipt reads වල owner සහ receipt identity එකත් නැවත validate කරන ලෙස adapter
  එක ශක්තිමත් කළා. Foreign allowance row එකක් fail-closed කරන regression test
  එකක් එක් කළා. Remote entitlement execution, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **11/11 PASS**;
  full regression **613/613 PASS**.

- Sync transaction replay reads වල stored change owner identity එක request
  account එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස adapter එක ශක්තිමත් කළා. Foreign
  replay row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
  Focused checks **7/7 PASS**; full regression **612/612 PASS**.

- Mutation-to-sync change writer එක committed entity row එකේ owner සහ entity ID
  request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign row එකක්
  sync stream එකට ඇතුළු වීම නවත්වන regression test එකක් එක් කළා. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
  Focused checks **5/5 PASS**; full regression **611/611 PASS**.

- Sync pull adapter එක returned change row එකේ `owner_id` request account එකට
  ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. වෙනත් account එකක returned row
  එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`. Focused sync
  pull checks **5/5 PASS**; full regression **610/610 PASS**.

- Ready snapshot metadata reads වල returned owner සහ snapshot identity request
  එකට ගැළපෙනවාදැයි නැවත පරීක්ෂා කළා. Foreign metadata row එකක් fail-closed
  කරන regression test එකක් එක් කළා. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Metadata/read focused checks
  **10/10 PASS**; page සහ metadata/read එකතුව **21/21 PASS**.

- Snapshot page reads වල returned owner, snapshot සහ page identity request එකට
  ගැළපෙනවාදැයි adapter boundary එකේම නැවත පරීක්ෂා කළා. Foreign-shaped returned
  row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`. Focused snapshot
  checks **8/8 PASS**.

- Entitlement expiry timestamp එක වැරදි නම් capability access grant නොකරන
  fail-closed behavior එකට adapter regression coverage එකක් එක් කළා. Remote
  entitlement execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.

- Task create applier එක goal link එකක් නැති අවස්ථාවකත් workspace ownership එක
  server-side තහවුරු කරන ලෙස ශක්තිමත් කළා. Foreign workspace task creation සඳහා
  regression test එකක් එක් කළා. Remote RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`. Focused task checks **9/9 PASS**; full regression
  **606/606 PASS**.

- Task edit එකක `goalId` වෙනස් කරන විට goal එක එකම owner workspace එකට අයිතිදැයි
  server-side තහවුරු කරන ලෙස patch applier එක ශක්තිමත් කළා. Cross-workspace
  link regression test එකක් එක් කළා. Remote RLS execution සහ independent review
  තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **12/12 PASS**; full
  regression **605/605 PASS**.

- Task එකක් නැති focus session එකක් ආරම්භ කරන විට workspace ownership එකත්
  server-side තහවුරු කරන ලෙස start-session applier එක ශක්තිමත් කළා. Foreign
  workspace regression test එකක් එක් කළා. Remote RLS execution සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **12/12 PASS**; full
  regression **604/604 PASS**.

- Goal create applier එක verified actorට අයිති workspace එකක් පමණක් භාවිත කරන
  ලෙස server-side check එකක් එක් කළා. Foreign workspace goal creation සඳහා
  regression test එකක් එක් කළා. Remote RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **8/8 PASS**; full regression
  **603/603 PASS**.

- Task create applier එක linked goal එකේ owner සහ workspace දෙකම server-side
  පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign හෝ වෙනත් workspace goal එකකට task
  link කිරීම නවත්වන regression test එකක් එක් කළා. Remote RLS execution සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **8/8
  PASS**; full regression **602/602 PASS**.

- PostgreSQL read handlers වල returned resource/profile row identity නැවත
  පරීක්ෂා කර foreign හෝ malformed row එකක් DTO එකක් ලෙස යැවීම වසා දැමුවා.
  Account-isolation regression tests දෙකක් එක් කළා. Remote RLS execution සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused read checks **9/9
  PASS**; full regression **601/601 PASS**.

- Entitlement storage row එක requested owner සහ capability සමඟ exact match නොවුණොත්
  server capability grant එකකට map නොකර fail-closed කරන ලදී. Foreign-shaped
  storage row එකක් සඳහා account-isolation regression test එකක් එක් කළා. Remote
  entitlement execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
  Focused entitlement checks **13/13 PASS**; full regression **599/599 PASS**.

- PostgreSQL usage reservation එකේ allowance update වූ පසු receipt insert එක
  තහවුරු නොකර success වීම වසා දැමුවා. `returning receipt_id` සහ missing
  acknowledgement regression test එකක් එක් කළා. Remote billing/provider
  execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused usage
  checks **25/25 PASS**; full regression **598/598 PASS**.

- PostgreSQL sync transaction adapter එකේ `sync_changes` insert acknowledgement
  නැතිව owner head එක advance වීම වසා දැමුවා. Expected sequence සහ exact hash
  පරීක්ෂා කරන regression test එකක් එක් කළා. Remote PostgreSQL/RLS සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`. Focused adapter checks **6/6 PASS**;
  full regression **597/597 PASS**.

- PostgreSQL `sync_changes` insert එකෙන් expected sequence සහ exact change hash
  ආපසු ලැබුණාදැයි තහවුරු නොවුණොත් owner sync head එක advance නොකරන ලෙස
  fail-closed කළා. Missing acknowledgement සඳහා regression test එකක් එක් කළා;
  focused gateway/sync checks **8/8 PASS**, full regression **596/596 PASS**.
  Remote PostgreSQL/RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL focus-session event insert එක ලියා ඇති බව `returning sequence` මගින්
  තහවුරු නොවුණොත් session update එකෙන් success නොකියන ලෙස fail-closed කළා.
  Database acknowledgement නැති අවස්ථාවට regression test එකක් එක් කළා. Remote
  database execution සහ independent review තවම `REVIEW_PENDING`. Focused checks
  **7/7 PASS**; full regression **595/595 PASS**, TypeScript, affected ESLint සහ
  docs checkerත් **PASS**.

- PostgreSQL app-session create කිරීමේ `INSERT` එකෙන් `session_id` row එකක්
  ආපසු ලැබුණාදැයි තහවුරු නොකර success වාර්තා වීම වසා දැමුවා. `returning
  session_id` සහ database acknowledgement නැති විට fail-closed regression test
  එකක් එක් කළා. Remote auth/database execution සහ independent review තවම
  `REVIEW_PENDING`. Focused checks **4/4 PASS**; full regression **594/594
  PASS**, TypeScript, affected ESLint සහ docs checkerත් **PASS**.

- PostgreSQL domain mutation receipt එක ලියූ බව `returning mutation_id` row එකෙන්
  තහවුරු නොවුණොත් mutation එක සාර්ථක ලෙස වාර්තා නොකර
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed කරන ලදී. Database acknowledgement
  නැති වීම සඳහා regression test එකක් එක් කළා; gateway test harness එකත් සැබෑ
  returning row එක නිරූපණය කරන ලෙස යාවත්කාලීන කළා. Focused checks **15/15
  PASS**; remote database execution සහ independent review තවම
  `REVIEW_PENDING`.

- Usage settlement receipt update එකේ affected row එක තහවුරු නොකර success කියන
  අවදානම වසා දැමුවා. `returning receipt_id` check එක සහ regression test එකක්
  එක් කළා. Focused usage checks **24/24 PASS**; remote provider/billing,
  PostgreSQL concurrency සහ independent review තවම `REVIEW_PENDING`. Full
  regression **592/592 PASS**, TypeScript, ESLint සහ docs checkerත් **PASS**.

- Usage settlement එකේ allowance counter එක වෙනස් වුණත් receipt status row එක
  update නොවුණොත් success කියන අවදානම වසා දැමුවා. `returning receipt_id`
  පරීක්ෂාවක් සහ fail-closed regression test එකක් එක් කළා. සැබෑ billing/provider
  execution සහ independent review තවම `REVIEW_PENDING`.

- App-session admission සහ revoke transition එක storage එකෙන් ලැබෙන registry row
  එකේ owner/session IDs, timestamps සහ status/revocation ගැළපීම නැවත validate
  කරන ලෙස fail-closed කළා. Corrupt row එකක් authorization හෝ revoke write එකක්
  බවට පත් නොවන regression test එකක් එක් කළා. Remote auth execution සහ
  independent review තවම `REVIEW_PENDING`. Focused auth/session checks
  **20/20 PASS**; full regression **591/591 PASS**, TypeScript, ESLint සහ docs
  checkerත් **PASS**.

- Revocation worker එක storage එකෙන් ලැබෙන claim record එකේ owner/session UUID,
  `processing` state, lease ID සහ lease expiry නැවත පරීක්ෂා කරන ලෙස fail-closed
  කළා. වැරදි හෝ පැරණි lease එකකින් provider action එකකට යාම වළක්වන regression
  test එකක් එක් කළා. Remote provider execution සහ independent review තවම
  `REVIEW_PENDING`. Focused revocation checks **12/12 PASS**; full regression
  **590/590 PASS**, TypeScript, ESLint සහ docs checkerත් **PASS**.

- සියලුම private-table migrations සඳහා RLS enable කිරීම සහ `public`/`anon`/
  `authenticated` table access revoke කිරීම අනිවාර්ය කරන migration safety
  regression guard එකක් එක් කළා. දැනට තිබෙන migrations වල security boundary
  වෙනස් කළේ නැහැ; remote execution සහ independent review තවම
  `REVIEW_PENDING`.

- PostgreSQL sync head එක update වූ බව row count එකෙන් තහවුරු නොකර සාර්ථක බව
  පෙන්විය හැකි අවදානම වසා දැමුවා. Transaction adapter සහ mutation change writer
  දෙකම `returning last_sequence` පරීක්ෂා කර row එකක් නොවෙනස් වුණොත් fail-closed
  වේ. Focused checks **11/11 PASS**; remote PostgreSQL/RLS සහ independent
  review තවම `REVIEW_PENDING`. Full regression **588/588 PASS**, TypeScript,
  affected ESLint සහ docs checkerත් **PASS**.

- Server pull එකෙන් නිකුත් කරන signed `payload.signature` cursor එක sync
  transaction boundary එකේ පැරණි single-segment validation නිසා නවතින ගැටලුව
  නිවැරදි කළා. පැරණි opaque cursor support එක රැකගෙන bounded signed format එක
  සහ regression test එකක් එක් කළා. Focused checks **15/15 PASS**; remote
  full regression suite **586/586 PASS**, TypeScript **PASS**, affected ESLint
  **PASS**, docs checker **PASS**; remote
  PostgreSQL/RLS, independent review සහ device verification තවම
  `REVIEW_PENDING` / `NOT_RUN`.

- Remote sync එකට නොගැලපෙන local mutation (`session.terminal`, malformed
  payload/target/command/ID) offline retry loop එකකට යවන්නේ නැතිව per-item
  permanent rejection ලෙස quarantine කරන ලෙස සකස් කළා. Batch එකේ කලින්
  accepted items අහිමි නොවන ලෙස partial result එක රැකේ. Focused tests සහ full
  regression evidence පසුව සටහන් කරයි; remote production sync තවම
  `REVIEW_PENDING`.

  Verification: focused sync checks **16/16 PASS**, full regression suite
  **585/585 PASS**, TypeScript **PASS**, affected ESLint **PASS**, සහ docs
  checker **PASS** (80/80 requirements). Remote production wiring සහ
  independent/device review තවම `REVIEW_PENDING`.

- Local sync pull apply validator එක server pull boundary එකෙන් එන signed
  `payload.signature` cursor පිළිගන්නා ලෙස ගලපලා, cursor එක page data සමඟ
  atomic store callback වෙතම යන regression test එකක් එක් කළා. පැරණි
  single-segment fixtures රැකේ; real server/local SQLite integration තවම
  `REVIEW_PENDING`.

- Server entitlement boundary එක malformed `verifiedBy`/`policyVersion` metadata
  එකක් නිසා access grant නොකරන ලෙස fail-closed කළා. Focused entitlement,
  PostgreSQL admission සහ usage checks වලින් පරීක්ෂා කරයි; live billing/provider
  execution සහ independent review තවම `REVIEW_PENDING`.

- App-session issue path එකේ owner-provided/verified `issuedAt` අගය record එකේ
  රැකගෙන PostgreSQL insert එකට parameter ලෙස යවන ලෙස නිවැරදි කළා; runtime
  clock එකෙන් නිහඬව වෙනස් timestamp එකක් හදන්නේ නැහැ. Adapter regression එකෙන්
  ඒක පරීක්ෂා කරයි. Remote auth execution සහ independent security review තවම
  `REVIEW_PENDING`.

- Local snapshot mirror validator එක server build එකෙන් එන signed
  `payload.signature` cursor පිළිගන්නා ලෙස server-side validators සමඟ ගලපලා,
  complete mirror swap regression test එකක් එකතු කළා. පැරණි cursor ආකෘතියද
  රැකේ; remote/device/independent review evidence තවම `REVIEW_PENDING`.

- Incremental sync cursor parser එක malformed base64 input එකේ raw decoder
  error නොපෙන්වා `SYNC_CURSOR_INVALID` ලෙස fail-closed වන ලෙසත්, token එකට
  උපරිම දිග සීමාවක් ඇති ලෙසත් දැඩි කළා. Focused checks සහ full regression
  results evidence record එකේ දක්වා ඇත; remote security execution සහ
  independent review තවම `REVIEW_PENDING`.

- Snapshot cursor validation materializer, staging සහ page reader අතර ගලපලා
  පැරණි single-segment cursors රැකගෙන signed `payload.signature` opaque cursors
  ද පිළිගන්නා ලෙස සකස් කළා. Build integration failure එකෙන් හමු වූ contract
  mismatch එකට regression coverage තිබේ; full suite evidence ඊළඟ check එකේ
  සටහන් කරයි. Remote execution සහ independent review තවම `REVIEW_PENDING`.

- Materializer → PostgreSQL staging composition candidate එකක් එකතු කළා.
  Authorized records pages වලට බෙදා signed cursors සමඟ existing transactional
  stager වෙත යවයි; staging failure propagate කරන අතර `ready` තත්ත්වය තමන්ම
  ප්‍රකාශ නොකරයි. Focused checks: **4/4 PASS**. Public job route, real
  PostgreSQL/RLS, secret custody, retention සහ independent review තවම
  `REVIEW_PENDING`.

- Snapshot materializer එකට asynchronous server-signed cursor factory එකක්
  බැඳිය හැකි කළා. Non-final page එකට signed next-page cursor එකක් සහ final
  page එකට `null` තබයි; owner, snapshot, page count, expiry සහ secret
  boundaries validate කරයි. Focused checks: **4/4 PASS**. Secret custody,
  route wiring, remote execution, RLS සහ independent review තවම
  `REVIEW_PENDING`.

- Snapshot page cursor handler composition candidate එකක් එකතු කළා. HMAC cursor
  verify වූ පසුව පමණක් signed owner/snapshot/page index එකෙන් page reader එකට
  යයි; client page index, foreign/tampered/expired/wrong-secret cursor විශ්වාස
  නොකරයි. Focused checks: **5/5 PASS**. Public route registration, secret
  custody, real RLS සහ independent review තවම `REVIEW_PENDING`.

- Snapshot page සඳහා owner/snapshot/page/expiry-bound HMAC opaque cursor
  candidate එකක් එකතු කළා. Incremental sync cursor එකෙන් scope එක වෙන් කරයි;
  tamper, foreign reuse, expiry සහ invalid secret tests තිබේ. Focused checks:
  **5/5 PASS**. Secret custody, route wiring, real RLS සහ independent review
  තවම `REVIEW_PENDING`.

- Snapshot materialization boundary එකක් එකතු කළා. Authorized records stable
  order එකට pages 100ක් බැගින් බෙදයි; empty snapshot, duplicate identity,
  malformed record, digest සහ cursor checks තිබේ. Focused checks: **5/5 PASS**.
  JCS implementation, cursor minting, real database materialization සහ review
  gates තවම `REVIEW_PENDING`.

- Snapshot metadata/page readers සඳහා verified actor-bound read-handler
  composition candidate එකක් එකතු කළා. Missing/expired/foreign rows safe
  `NOT_FOUND` ලෙස හසුරුවයි. Focused checks: **4/4 PASS**; route registry,
  opaque cursor wiring, real RLS සහ independent review තවම `REVIEW_PENDING`.

- Owner-bound, unexpired `ready` snapshot metadata reader candidate එකක් එකතු
  කළා. Contract version, digest, page count, timestamp සහ decimal PostgreSQL
  `bigint` validation තිබේ. Focused checks: **5/5 PASS**; job lifecycle, RLS,
  remote execution සහ independent review තවම `REVIEW_PENDING`.

- PostgreSQL snapshot staging adapter candidate එකක් එකතු කළා. Owner-bound
  metadata `FOR UPDATE`, immutable page retry/deduplication, complete-page
  `ready` transition, duplicate entity checks සහ PostgreSQL `bigint` සීමා
  enforce කරයි. Focused checks: **7/7 PASS**. Remote PostgreSQL execution,
  RLS, retention, independent security review සහ production migration තවම
  `REVIEW_PENDING`.

- PostgreSQL snapshot page reader candidate එකක් එකතු කළා. Owner-bound snapshot
  join, `ready` status, expiry check සහ malformed page fail-closed validation
  තිබේ. Entity identity/version/payload validation සහ PostgreSQL bigint
  high-water සහ snapshot metadata consistency handling ද එක් කළා. Focused checks:
  **7/7 PASS**; staging writes,
  retention සහ mirror swap
  තවම `REVIEW_PENDING`.

- Local migration safety contract checks එකතු කළා: version prefixes duplicate නොවීම,
  `BEGIN`/`COMMIT` transaction boundary සහ destructive reset statements නොතිබීම.
  Focused checks: **2/2 PASS**; remote rollback/restart verification තවම
  `REVIEW_PENDING`.

- Sync adapter එක private `focus_session` storage kind එක canonical wire
  `session` kind එකට pull වෙද්දී map කරන අතර, inbound `session` changes storage
  සඳහා legacy internal kind එකට normalize කරයි. Focused pull/transaction checks:
  **8/8 PASS**; remote sync runtime සහ independent review තවම
  `REVIEW_PENDING`.

- Owner-bound PostgreSQL read handlers එකතු කළා: profile, tasks, goals සහ focus sessions
  list/read operations. Fixed owner predicates, bounded result sizes, safe DTO mapping සහ
  privacy-preserving not-found behavior තිබේ. Focused coverage **3/3 PASS**; real SQL/RLS
  execution සහ independent review තවම `REVIEW_PENDING`.

- Gateway handler registry එක local PostgreSQL transaction සහ operation-specific appliers
  සමඟ සම්බන්ධ කළා. `createTask`, `patchTask`, task actions, goal create සහ session writes
  සඳහා verified context, idempotency receipt සහ SQL adapter එක එක chain එකක යයි. Focused
  coverage **3/3 PASS**; remote integration සහ independent review තවම `REVIEW_PENDING`.

- `applySessionEvent` සඳහා owner/version/sequence-bound PostgreSQL SQL applier candidate එක
  එකතු කළා. Pause/resume/complete/cancel event order, focused/paused milliseconds, state
  transitions සහ completion target enforce කරයි. Focused coverage **3/3 PASS**; SQL
  execution සහ independent review තවම `REVIEW_PENDING`.

- `applyTaskAction` සඳහා owner/version-bound PostgreSQL SQL applier candidate එක එකතු කළා.
  Begin/complete/cancel/archive transitions, route ID binding සහ deleted/terminal protection
  enforce කරයි. Focused coverage **3/3 PASS**; SQL execution සහ independent review තවම
  `REVIEW_PENDING`.

- `startSession` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Verified
  task title snapshot, seconds-based timer input, contract version 2 සහ unsafe/foreign
  task rejection enforce කරයි. Focused coverage **3/3 PASS**; SQL execution සහ
  independent review තවම `REVIEW_PENDING`.

- `createGoal` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Goal type/unit,
  positive target, ordered UTC instants, bounded timezone සහ allowlisted fields enforce කරයි.
  Focused coverage **3/3 PASS**; SQL execution සහ independent review තවම `REVIEW_PENDING`.

- `patchTask` සඳහා optimistic-version සහ owner-bound PostgreSQL SQL applier candidate එක
  එකතු කළා. Optional fields පැහැදිලිව update/clear කරයි; stale, foreign, deleted හෝ
  terminal records fail-closed කරයි. Focused coverage **3/3 PASS**; SQL execution සහ
  independent review තවම `REVIEW_PENDING`.

- `createTask` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Owner ID
  trusted context එකෙන් පමණක් ගනී; typed due fields parameterized SQL වෙත map කරයි;
  body owner injection සහ malformed result fail-closed කරයි. Focused coverage **3/3 PASS**.
  SQL execution සහ independent review තවම `REVIEW_PENDING`.

- Local PostgreSQL domain-mutation adapter contract එක එකතු කළා. `sync_heads` owner lock,
  receipt replay, exact mutation apply input සහ receipt insert එක caller-owned transaction
  එකක තබයි. Focused adapter coverage **4/4 PASS**; remote wiring සහ independent review
  තවම `REVIEW_PENDING`.

- Domain mutation transaction එක `requestSha256` සහ validated body එක adapter `apply` call එකට
  එකට ලබාදෙයි. එම නිසා PostgreSQL adapter එකට එකම transaction එක තුළ mutation apply කිරීමත්
  intent-bound receipt එක ලිවීමත් කළ හැක. Focused transaction coverage **6/6 PASS**.

- Gateway mutation hash එක server-derived handler context එකට ලබාදෙන ලෙස wiring කළා.
  Domain transaction එකට operation/path/validated body එකට බැඳුණු idempotency hash එකක්
  ලැබෙනවා. Focused execution test එකෙන් exact hash එක පරීක්ෂා කළා; PostgreSQL adapter
  wiring සහ independent security review තවම `REVIEW_PENDING`.

- Gateway mutation canonical hash helper එක එකතු කළා. Operation/path/body සඳහා
  key-order independent SHA-256 hash එකක් සාදයි; owner ID, token හෝ secret එකක්
  input එකට ඇතුළත් නොකරයි. Focused checks **3/3 PASS**; receipt/database wiring
  සහ PostgreSQL evidence තවම `REVIEW_PENDING`.

- Revocation retry schedule එක එකතු කළා. Attempt count අනුව exponential delay එකක්
  ගණනය කර bounded maximum එකක නවත්වයි; raw provider error වෙනුවට allowlisted
  code පමණක් තබයි. Focused checks **3/3 PASS**; production backoff policy සහ
  worker runtime තවම `REVIEW_PENDING`.

- Revocation outbox worker lease/fencing contract එක එකතු කළා. Claim එක worker සහ
  lease IDකට බැඳේ; stale completion ප්‍රතික්ෂේප කරයි; provider failure එක raw
  error නොතබා allowlisted code සහ retry time සමඟ schedule කරයි. Focused checks
  **4/4 PASS**; real worker/RPC concurrency තවම `REVIEW_PENDING`.

- App-session provider revocation outbox candidate එක එකතු කළා. Session revoke
  සහ durable outbox enqueue එක එක transaction එකක සිදු කරයි; provider API call එක
  transaction ඇතුළේ නොකරයි; replay/foreign/failure cases fail-closed. Focused
  checks **4/4 PASS**; actual worker/provider runtime තවම `REVIEW_PENDING`.

- Gateway rate-limit admission contract එක එකතු කළා. Actor සහ operation scoped
  atomic counter store එකක් හරහා bounded window/limit පරීක්ෂා කරයි; denied request
  `429 RATE_LIMITED`, malformed counter result `503` ලෙස fail-closed වේ.
  Focused checks **4/4 PASS**; distributed production limiter තවම `REVIEW_PENDING`.

- Domain mutation transaction contract එක එකතු කළා. Owner-head lock, owner/operation/
  mutation receipt replay, changed-payload conflict, domain apply සහ receipt write
  එකම caller-owned transaction එකක අනුපිළිවෙළට යයි. Focused checks **5/5 PASS**;
  සැබෑ PostgreSQL RPC/transaction execution තවම `REVIEW_PENDING`.

- Gateway success response validation එක එකතු කළා. Operation එකට ගැළපෙන
  `200/201` status, object body, undefined-field rejection, JSON serializability
  සහ 256 KiB response limit පරීක්ෂා කරයි. Invalid handler output success ලෙස
  නොයයි. Focused execution checks **7/7 PASS**; response schema/runtime තවම
  `REVIEW_PENDING`.

- Personal-core DTO semantic validation එක එකතු කළා. UUID, version, timestamp,
  duration, text, due, goal unit සහ session/task transition fields contract
  limits අනුව පරීක්ෂා කරයි. Invalid semantic payload handler/database layer වෙත
  නොයයි. Focused checks **4/4 PASS**; full schema/runtime integration තවම
  `REVIEW_PENDING`.

- Gateway entrypoint composition එක එකතු කළා. Request admission → route-specific
  DTO → owner authorization → domain handler යන අනුපිළිවෙළ එකම local entrypoint
  එකකින් පවත්වාගෙන යයි; malformed/foreign requests handler හෝ owner store වෙත
  නොයයි. Focused checks **4/4 PASS**; සැබෑ Edge Function runtime සහ database
  transaction තවම `REVIEW_PENDING`.


- Gateway owner authorization boundary එක එකතු කළා. Resource, workspace සහ
  linked goal/task owner IDs server-side store callback එකෙන් actor සමඟ සසඳයි;
  foreign/missing ownership `404` ලෙස fail-closed වන අතර handler එක ඊට පෙර
  නොකැඳවේ. Focused authorization/execution checks **9/9 PASS**; සැබෑ
  PostgreSQL/RLS transaction proof තවම `REVIEW_PENDING`.

- Domain handler execution boundary එක එකතු කළා. Admitted operation එකට අදාළ
  handler එක පමණක් server-derived actor/resource/body context සමඟ කැඳවයි; handler
  නැතිනම් හෝ raw error එකක් ආවොත් safe `DEPENDENCY_UNAVAILABLE` response එකක්
  පමණක් දෙයි. Focused checks **4/4 PASS**; සැබෑ domain/database handlers සහ
  Supabase runtime තවම `REVIEW_PENDING`.

- Personal-core operation DTO admission එක එකතු කළා. Route එක අනුව allowed සහ
  required body fields පරීක්ෂා කරයි; `ownerId` වැනි client ownership injection
  fields ප්‍රතික්ෂේප කරයි; task action ID එක path ID සමඟ ගැළපිය යුතුය. Focused
  checks **4/4 PASS**; full semantic schema validation, handler/database write
  සහ remote runtime තවම `REVIEW_PENDING`.

- Personal-core gateway route allowlist එක එකතු කළා. Approved OpenAPI operation
  14ක් method/path අනුව map කරයි; unknown route, wrong method සහ malformed
  resource UUID domain layer එකට යාමට පෙර fail-closed වේ. Router focused checks
  **3/3 PASS**; actual Edge Function handlers, database authorization සහ remote
  runtime තවම `REVIEW_PENDING`.

- Gateway request admission candidate එක එකතු කළා. `/v1` method/path, verified
  actor UUID, write idempotency key, request/body byte limits, JSON object shape
  සහ unknown-field rejection domain handler එකට පෙර සිදු කරයි. Gateway focused
  checks **5/5 PASS**; සැබෑ Edge Function route, provider auth සහ database
  transaction තවම `REVIEW_PENDING`.

- Usage reservation/settlement transaction helpers එකතු කළා. Allowance read,
  receipt replay check සහ reserve/consume/release write එක caller-owned
  transaction boundary එකකට බැඳේ. Usage focused checks **10/10 PASS**; සැබෑ
  PostgreSQL concurrency තවම `REVIEW_PENDING`.

- AI usage execution lifecycle එක තද කළා. Settled receipt replay එක provider
  call එකට යන්නේ නැහැ; reserved call success එක consume කරයි, provider failure
  එක release කරයි, settlement failure එක success ලෙස නොපෙන්වයි. Usage focused
  checks **9/9 PASS**; live provider/ledger තවම `REVIEW_PENDING`.

- Request session admission candidate එක එකතු කළා. Bearer token එක provider
  verifier එකෙන් තහවුරු කර active app-session registry row එක නැවත පරීක්ෂා
  කරයි; guest fallback, raw provider errors සහ malformed-token pass-through නැහැ.
  Focused checks **5/5 PASS**; live Auth/Edge Function runtime තවම
  `REVIEW_PENDING`.

- App-session revoke race boundary එක එකතු කළා. Registry read සහ revoke
  transition එක caller-owned transaction එකකින් එකට සිදු කරයි; issue path එකටත්
  transaction helper එකක් ඇත. Focused app-session checks **7/7 PASS**; සැබෑ
  Supabase transaction/runtime තවම `REVIEW_PENDING`.

- Backup export candidate එක එකතු කළා. Verified owner source එකෙන් records
  කියවා ownership/duplicate checks පසු digest-bound manifest එකක් සාදයි; source
  failures සඟවන්නේ නැහැ. Backup focused checks **11/11 PASS**; actual storage,
  retention සහ restore runtime තවම `REVIEW_PENDING`.

- Supabase server-side sync pull candidate එක එකතු කළා. Verified actor සහ signed
  cursor scope පරීක්ෂා කර owner-bound high-water page එකක් කියවයි; malformed,
  unordered හෝ store-failure result එක fail-closed වේ. Focused checks **4/4
  PASS**; remote read, RLS සහ independent review තවම `REVIEW_PENDING`.

- Supabase server-side sync transaction candidate එක එකතු කළා. Verified actor,
  cursor-owner binding, locked-head conflict, canonical replay hash සහ atomic
  change/head commit contract එක පනවයි. Focused checks **5/5 PASS**; PostgreSQL,
  Edge Function සහ independent review තවම `REVIEW_PENDING`.

- Stale sync cursor recovery සඳහා SQLite reset adapter එක එකතු කළා. Remote
  receipts/cursors පමණක් reset කර snapshot bootstrap එකට ඉඩ දෙයි; remote mirror,
  local tasks සහ pending work නොමකයි. Real SQLite recovery check **1/1 PASS**;
  සම්පූර්ණ suite **367/367 PASS**; cloud/device/independent review තවම
  `REVIEW_PENDING`.

- Incremental SQLite sync pull adapter එක එකතු කළා. Account-scoped sequence
  receipts, duplicate replay handling, conflicting replay rejection සහ cursor
  update එක එක transaction එකකින් සිදු කරයි. Cursor write failure එකේ entity,
  receipt සහ cursor rollback වේ. Focused checks **26/26 PASS** සහ සම්පූර්ණ suite
  **366/366 PASS**; cloud/device/independent review තවම `REVIEW_PENDING`.

- SQLite remote mirror apply candidate එක එකතු කළා. Account-scoped remote
  entities සහ sync cursor එක එකම transaction එකකින් replace කරයි; local domain
  rows, pending outbox සහ local overlay preserve කරයි. Simulated cursor-write
  failure එකේ පෙර mirror/cursor නැවත ලැබීම තහවුරු කළා. SQLite focused checks
  **21/21 PASS** සහ සම්පූර්ණ suite **365/365 PASS**; cloud/device/independent
  review තවම `REVIEW_PENDING`.

- Snapshot mirror apply boundary එක එකතු කළා. සම්පූර්ණ snapshot validation
  පසුව එක් atomic store callback එකකට entities යවයි; outbox සහ local overlay
  preserve flags අනිවාර්යයි. Apply-boundary checks **3/3 PASS**; සැබෑ domain-row
  swap සහ cloud/device verification තවම `REVIEW_PENDING`.

- Backup payload සඳහා canonical JSON SHA-256 digest helper එක එකතු කළා. Object
  key order වෙනස් වුණත් digest එක ස්ථාවරයි; data වෙනස් වුණොත් digest mismatch
  හඳුනාගත හැක. Backup focused checks **8/8 PASS**; actual backup storage සහ
  restore transaction තවම `REVIEW_PENDING`. Restore path එක caller digest එක
  පමණක් නොව payload එකම නැවත hash කරයි; focused checks **9/9 PASS**.

- Server boundary එකට allowlisted safe diagnostic log helper එක එකතු කළා.
  Error/message/stack/token values serialize නොකර event, status, stable code,
  retryability සහ bounded request ID පමණක් තබයි. Focused checks **5/5 PASS**;
  live log sink සහ secret rotation තවම `REVIEW_PENDING`.

- App-session issue/revoke lifecycle candidate එක එකතු කළා. Session issue එක
  verified owner UUID සහ valid expiry වලට බැඳී ඇත; revoke එක foreign owner,
  expired record සහ repeated revoke fail-closed කරයි. Focused checks **6/6
  PASS**; provider/session database transaction තවම `REVIEW_PENDING`.

- Usage allowance ledger සඳහා private Supabase migration candidate එකක් එකතු
  කළා. Owner/capability/period key, consumed/reserved limit check, composite
  replay receipt key, allowance foreign key සහ client direct grants නැති RLS
  boundary ඇත. Contract checks **12/12 PASS**; remote apply සහ PostgreSQL
  concurrency verification තවම `REVIEW_PENDING`.

- Server-side usage allowance decision boundary එක එකතු කළා. Verified active
  capability, owner, capability, period, policy version, consumed/reserved
  counters සහ bounded request units පරීක්ෂා කරයි; limit ඉක්මවීම fail-closed වේ.
  Payment/provider integration හෝ live charge එකක් නැහැ. Focused checks **7/7
  PASS** සහ replay-safe atomic reservation/consume/release contract checks
  **7/7 PASS**; actual database write integration තවම review gate යටතේ.

- Local SQLite snapshot staging adapter එක එකතු කළා. Snapshot header/page writes
  transaction එකකින් owner-scoped ලෙස සිදු කරයි; retry duplicate pages
  idempotent, වෙනස් replay conflict, incomplete finalize reject, reopen පසුව
  ready snapshot නැවත කියවිය හැක. Interrupted staging එක pages නොමකා failed
  state එකේ තබා explicit resume එකක් ලබාගනී. Validated snapshot orchestration එක
  owner-bound ලෙස stage/finalize කරයි; validated mirror pages live domain rows
  වෙනස් නොකර local staging වෙත map කරයි. Focused checks **20/20 PASS** සහ full suite
  **361/361 PASS**; mirror swap, crash recovery සහ device/cloud verification
  තවම `REVIEW_PENDING`.

- Local SQLite schema version **9** එකට owner-scoped snapshot staging සහ page
  tables එකතු කළා. High-water, page/digest, cursor, JSON validity සහ composite
  foreign-key checks ඇත; existing outbox, active session සහ resources tables
  වෙනස් නොවේ. Focused ownership/migration checks **17/17 PASS** සහ full suite
  **344/344 PASS**; actual mirror swap තවම `REVIEW_PENDING`.

- Sync snapshot staging සඳහා versioned migration candidate එකක් එකතු කළා.
  Owner-bound snapshot metadata/pages, high-water/page-count/digest constraints,
  expiry/status fields, composite page FK සහ private RLS boundary ඇත. Client
  direct grants නැහැ. Focused migration checks: **5/5 PASS**; PostgreSQL execution
  සහ ready-state transaction තවම `REVIEW_PENDING`.

- App-session registry සඳහා වෙනම versioned Supabase migration candidate එකක්
  එකතු කළා. Owner FK, active/revoked state, expiry constraints, index සහ RLS
  policies ඇත; `anon`/`authenticated` direct grants නොමැත. Focused migration
  checks: **4/4 PASS**; SQL execution සහ remote apply තවම `REVIEW_PENDING`.

- Server-side app-session registry admission candidate එක එකතු කළා. Provider
  verifier එකෙන් ලැබුණු issuer/audience/subject/session expiry claims සහ active
  registry row එක එකට පරීක්ෂා කරයි; revoked/foreign/missing sessions fail-closed.
  Focused checks: **3/3 PASS**; සැබෑ Supabase session registry සහ revocation
  transaction තවම `REVIEW_PENDING`.

- Snapshot mirror candidate එක complete pages, high-water, cursor, page digest සහ
  duplicate entity identities පරීක්ෂා කරලා එක staged-install callback එකකට පමණක්
  යවයි. Validation හෝ store failure එකකදී partial success නොපෙන්වයි. Focused
  checks: **3/3 PASS**; සැබෑ SQLite mirror swap/cloud snapshot තවම
  `REVIEW_PENDING`.

- Sync pull cursor එක stale වුණාම `SYNC_RESET_REQUIRED` සඳහා snapshot bootstrap
  ආරම්භ කරන recovery policy එක එකතු කළා. Local outbox සහ unsynced overlay රැකෙනවා;
  `AUTH_REQUIRED`, `ACCESS_DENIED`, rate-limit සහ transient failure වෙනම
  හැසිරවෙයි. Focused checks: **3/3 PASS**; actual cloud snapshot/install
  transaction තවම `REVIEW_PENDING`.

- Backup restore candidate එක දැන් සම්පූර්ණ payload එක validate කරලා, owner/schema/
  digest/empty-target checks පසු එක transaction callback එකකට පමණක් යවයි.
  Foreign හෝ duplicate records write වීමට පෙර ප්‍රතික්ෂේප වේ; transaction failure
  caller වෙත යන නිසා rollback/retry කළ හැක. Focused checks: **7/7 PASS**;
  actual SQLite/PostgreSQL restore transaction තවම `REVIEW_PENDING`.

- Remote client එක gatewayගේ nested safe error envelope එකෙන් `code` නිවැරදිව
  කියවයි. එමඟින් `ACCESS_DENIED` සහ `VERSION_CONFLICT` වැනි server decisions
  outbox quarantine policy එකට යන අතර private error message එකක් නොගනී.
  Focused checks: remote client **7/7 PASS**, remote sync pusher **6/6 PASS**;
  live gateway integration තවම `REVIEW_PENDING`.

- Local outbox sync එකේ server-side permanent rejection policy එක එකතු කළා.
  `ACCESS_DENIED`, `ENTITY_DELETED`, `VERSION_CONFLICT` සහ validation වැනි
  user-action අවශ්‍ය ප්‍රතික්ෂේප `rejected` ලෙස quarantine කරයි; network/transport
  failures පමණක් retry කරයි. Focused checks: **26/26 PASS**; actual remote
  mutation transaction සහ recovery UI තවම `REVIEW_PENDING`.

- Local sync pull adapter එකක් එකතු කළා. Change page එකේ cursor, sequence,
  entity IDs, entity kinds සහ page size පරීක්ෂා කරලා, page එකත් cursor එකත්
  එකම atomic store callback එකකට පමණක් යවයි. Validation හෝ storage failureකදී
  cursor advance නොවේ. Focused checks: **4/4 PASS**; real cloud pull/local
  mirror transaction තවම `REVIEW_PENDING`.

- Server mutation guard candidate එකක් එකතු කළා. Verified actor සහ resource
  ownership match වීම අනිවාර්යයි; foreign resources privacy-preserving
  `not_found` ලෙස ප්‍රතික්ෂේප වේ. එකම mutation receipt එකේ එකම payload නම්
  replay කරන අතර වෙනස් payload එකක් conflict වේ. Focused checks: **4/4 PASS**;
  actual database transaction/row-lock execution තවම `REVIEW_PENDING`.

- Sync mutation batch validation දැන් එක් එක් item එකේ UUID mutation ID,
  command සීමාව, UUID target ID, object payload සහ client ownership fields
  පරීක්ෂා කරයි. Invalid items server dispatcher එකට යන්නේ නැහැ. Focused
  gateway checks: **12/12 PASS**; per-item database authorization තවම
  `REVIEW_PENDING`.

- AI/cloud capability admission සඳහා server-only entitlement candidate එකක්
  එකතු කළා. Matching verified owner, capability, active status, policy version
  සහ expiry පමණක් පිළිගනී; client flags, prices හෝ provider claims වලින් access
  ලැබෙන්නේ නැහැ. Database reader එක server-only admission policy එකට compose
  කරලා active, expired සහ missing entitlement checks එකතු කළා. Focused checks:
  **7/7 PASS**, foreign-owner isolation check ඇතුළුව. Real billing/webhook/
  allowance ledger integration තවම
  `REVIEW_PENDING`.

- Entitlement, allowance/receipt සහ app-session migration candidates සඳහා RLS,
  owner binding, bounded counters, foreign keys සහ service-role access static
  contract checks එකතු කළා. Migration SQL එක remote Supabase එකට යොදා නැහැ.
  Outbox ownership, private provider-error boundary සහ lease fencing checks ද
  එක් කළා. Focused checks: **6/6 PASS**; remote execution, advisors සහ independent
  security review තවම `REVIEW_PENDING`.

- Usage reservation service එක entitlement read, allowance lock සහ receipt
  write එක එකම PostgreSQL transaction boundary එකකට compose කළා. Entitlement
  නැති විට allowance query එකට යන්නේ නැහැ. Reservation, settlement සහ
  admission/allowance snapshot checks: **8/8 PASS**;
  live provider, billing සහ remote database execution තවම `REVIEW_PENDING`.

- Non-destructive backup restore admission candidate එකක් එකතු කළා. Restore
  කිරීමට පෙර verified owner, schema version, payload SHA-256 සහ empty-target
  condition පරීක්ෂා කරයි; foreign/future/corrupt/overwrite cases fail-closed.
  Focused checks: **4/4 PASS**. Actual backup storage, restore transaction සහ
  retention policy තවම `REVIEW_PENDING`.

- Server boundary helpers now reject public/short/control-character secrets,
  non-HTTPS service URLs and raw provider/SQL/stack errors. Public error
  responses use stable safe codes only. Focused checks: **4/4 PASS**; actual
  secret-store injection and Edge Function runtime verification remain
  `REVIEW_PENDING`.

- Server-only signed sync cursor candidate එකක් එකතු කළා. Cursor එක owner,
  endpoint, page limit, decimal sequence high-water mark සහ expiry සමඟ HMAC
  signature එකකට බැඳේ; tamper, cross-account reuse, wrong limit, expiry සහ
  දුර්වල secret fail-closed වේ. Focused cursor checks: **4/4 PASS**. Key
  storage, rotation සහ live database integration `REVIEW_PENDING`.

- Personal sync gateway routing now includes bounded `GET /v1/sync` and
  `POST /v1/sync/mutations` contracts with actor-derived identity, cursor/page
  limits and a maximum batch of 25. Database cursor signing, transaction
  ordering and per-item authorization remain isolated review gates. Focused
  gateway checks: **11/11 PASS**.

- Mutation requests now carry a canonical JSON SHA-256 digest alongside the
  idempotency key, allowing the reviewed server/database receipt layer to
  distinguish a safe replay from the same key being reused with changed data.
  Raw tokens and secrets are not hashed or logged. Focused gateway checks:
  **9/9 PASS**; live receipt execution remains `REVIEW_PENDING`.

- Personal API gateway now fail-closes when the verified resolver returns a
  non-UUID actor, and regression coverage records expired/revoked-session
  rejection plus stable idempotency-key forwarding for server-side replay
  handling. Focused gateway checks: **8/8 PASS**; TypeScript and ESLint pass.
  This remains an isolated contract boundary, not live Supabase/RLS evidence.

- Backend migration candidate RLS now declares explicit owner-bound
  `SELECT`/`INSERT`/`UPDATE`/`DELETE` policies, including both existing-row and
  resulting-row checks for updates. Direct client grants remain revoked and
  the remote development project was not changed. Focused contract checks:
  **3/3 PASS**; TypeScript and affected-file ESLint pass. Isolated SQL/RLS
  penetration verification remains `REVIEW_PENDING`.

- Password recovery outcome messages now use the approved Sinhala/Tamil/English
  locale copy and do not expose provider error text directly in native recovery
  routes.

- The local account portal now clears password state when signing out and exposes
  its busy state to assistive technology; provider and sync behavior are
  unchanged.

- Native Sign In email and password validation now use the shared
  Sinhala/Tamil/English locale copy instead of hardcoded English messages;
  authentication behavior is unchanged.

- Home duration facts now use the selected locale's minute copy; Settings
  labels, stored seconds/minute values and timer behavior remain unchanged.

## 2026-10-09

- Onboarding profile application failures now use safe localized copy instead
  of exposing raw exception text; profile accessibility labels also use the
  selected locale. Focused check: **1/1 PASS**; TypeScript and ESLint pass.

- Assessment persistence now stores stable safe failure categories instead of
  copying arbitrary storage exception text into flow state. Focused check:
  **1/1 PASS**; TypeScript and ESLint pass.

- Focus setup preset labels and accessibility names now use the selected
  locale's minute copy instead of hardcoded English text. Focused check: **1/1
  PASS**; TypeScript and ESLint also pass.

- Teacher assignment draft saving state now uses localized Sinhala, Tamil and
  English copy instead of a hardcoded ellipsis. Focused check: **1/1 PASS**;
  TypeScript and ESLint also pass.

- Auth callback loading indicator now uses the localized callback loading title
  instead of a hardcoded English accessibility label. Focused checks are
  **2/2 PASS**; TypeScript and ESLint also pass.

- Settings duration and language option accessibility labels now use the
  localized section copy and distinguish selectable options from their parent
  cards. Focused settings/localization checks are **10/10 PASS**; TypeScript
  and ESLint also pass.

- Home focus hero accessibility labeling now reuses the selected locale's
  existing start-focus copy instead of a hardcoded English label. Focused
  checks are **4/4 PASS**; TypeScript and ESLint also pass. The full suite
  after the regression test is **305/305 PASS**.

- Onboarding assessment accessibility labels now use the approved localized
  copy for the back action and progress indicator. Focused assessment and
  locale checks are **8/8 PASS**; TypeScript and ESLint also pass. The full
  suite after the regression test is **304/304 PASS**.

- Auth session/configuration/link errors now use locale-aware safe copy in
  `AuthProvider` for Sinhala, Tamil and English. The focused auth-copy checks
  are **2/2 PASS**; TypeScript and ESLint also pass. The full suite after the
  regression test is **303/303 PASS**.

- Resource mutation failures now use localized, resource-specific safe copy
  instead of exposing raw storage error messages. The focused resource and
  locale checks are **5/5 PASS**; TypeScript and ESLint also pass. The full
  suite after adding the regression test is **302/302 PASS**.

- Resources loading state now uses resource-specific Sinhala/Tamil/English
  copy instead of the unrelated Tasks loading message. The focused check is
  **1/1 PASS** and the full suite is **301/301 PASS**.

- Tasks save failures now use the existing localized task copy, preserving the
  draft and list behavior. The focused check is **1/1 PASS** and the full suite
  is **300/300 PASS**.

- Progress History accessibility summaries now use localized history copy for
  the focus-time summary, filter-empty state and session-list count. The
  focused check is **1/1 PASS** and the full suite is **299/299 PASS**.

- Added a fail-closed Cloud Resources upload-intent boundary. It requires
  explicit selection, matching ownership, consent and a server-verified active
  entitlement, but performs no upload, download, quota reservation or charge;
  focused checks are **4/4 PASS** and the full suite is **298/298 PASS**.

- Added a Profile-linked local teacher assignment draft screen with Sinhala,
  Tamil and English labels, accessible fields and explicit save/error states.
  It remains device-local and performs no invite or cloud write; the current
  full suite remains **294/294 PASS**.
- Rebuilt the Android debug APK after the education UI slice: `assembleDebug`
  succeeded with **662** tasks (61 executed, 601 up-to-date). Device install,
  runtime and accessibility evidence remain `NOT_RUN` because no device was
  connected.
- A fresh Android device probe could not start the local `adb` daemon
  (`failed to check server version`); no device evidence was inferred.

- Added a local-only, versioned teacher assignment draft boundary with bounded
  text and Sri Lankan education metadata validation. It does not create classes,
  invite learners or send server writes; focused tests are **4/4 PASS** and the
  current full suite is **294/294 PASS**.
- Added SQLite v8 owner-scoped persistence for teacher assignment drafts. Newer
  revisions replace older local drafts, stale writes are rejected, owners remain
  isolated and corrupt metadata fails closed; storage tests are **3/3 PASS**.

- Progress summary and goal-card accessibility labels now use localized copy
  for totals, focus time and goal progress; analytics and navigation are
  unchanged. Progress tests are **4/4 PASS** and the full suite is
  **287/287 PASS**.
- Progress period selector accessibility now uses localized Progress copy;
  period selection and analytics calculations are unchanged. The full
  **287/287** suite remains pass.
- Active Task row accessibility labels now use localized ready-state copy
  instead of hard-coded `pending`; task behavior is unchanged. Tasks tests are
  **5/5 PASS** and the full suite is **287/287 PASS**.
- Task detail accessibility labels now use localized Task Detail copy for
  loading, summary, description, due-date and no-goal states. Task editing,
  validation and persistence are unchanged; Task detail tests are **19/19
  PASS** and the full suite is **287/287 PASS**.
- Profile signed-in status and sign-out accessibility labels now use the
  localized account copy; authentication and sign-out behavior are unchanged.
  The full **287/287** suite remains pass.
- Root auth-gate loading text and its accessibility label now use the existing
  localized sign-in loading copy. Secure session restore and route decisions are
  unchanged; the full **287/287** suite remains pass.
- Profile and Focus tab accessibility labels now use existing localized copy;
  the Focus tab no longer announces raw internal session statuses. Navigation
  and session behavior are unchanged; the full **287/287** suite remains pass.
- Settings accessibility labels now use the existing localized copy for loading,
  failure/retry, navigation, duration, appearance, language and local-data
  states. Settings persistence and save-retry behavior are unchanged; component
  tests are **6/6 PASS** and the full suite remains **287/287 PASS**.
- The True Zen Break route now localizes its timer, visible duration choices and
  duration-choice
  accessibility labels in `en`/`si`/`ta`; saved settings, retry behavior and
  countdown units are unchanged. Focused checks, typecheck, lint and the full
  **287/287** suite pass; human translation and device review remain pending.
- The active focus-session route now localizes its remaining-time warning,
  timer accessibility label and terminal history-save recovery message in
  `en`/`si`/`ta`, without changing seconds-based timing or persistence
  behavior. Locale/session tests, typecheck, lint and the full **286/286**
  suite pass; human translation and device review remain pending.
- Added a pure Task/Goal sync mutation-envelope draft. It binds each validated
  create payload to the verified actor and workspace and carries a UUID
  idempotency key; it does not enqueue or send remote writes. Invalid identity
  or mutation IDs fail closed. Focused tests are **5/5 PASS** and the bundled
  suite is **286/286 PASS**; server receipts, RLS, outbox integration and
  independent security review remain pending.
- New locally-created Tasks, Goals and Focus Sessions now receive UUID-shaped
  stable IDs while existing legacy IDs remain unchanged. Timer storage remains
  seconds-based; this only prepares new records for the reviewed server contract
  and does not enable remote sync. Stable-ID regression tests were added; the
  the bundled suite was **276/276 PASS** at that slice.
- Added a side-effect-free Task/Goal create-payload boundary that requires
  verified UUID record and workspace IDs, preserves explicit fields, and makes
  the seconds-to-milliseconds goal conversion explicit. It is not wired to
  remote writes until workspace bootstrap, server ownership and review gates
  exist; builder tests cover legacy-ID rejection and conversion safety.
- Added a fail-closed `/me` workspace-bootstrap parser that binds the returned
  profile to the already verified session actor, validates the personal
  workspace UUID and positive version, and rejects extra or malformed fields.
  It performs no network or local account write until the real backend exists;
  the bundled suite after this slice is **282/282 PASS**.
- Added the typed client boundary that requests only `GET /v1/me` and passes the
  response through the ownership-bound parser. It is not wired into auth startup
  or a deployed server, so it cannot create a local workspace from unverified
  data. The full bundled suite after this slice is **284/284 PASS**.
- Native Profile now shows the existing owner-scoped SQLite outbox status in
  Sinhala/Tamil/English. It reports loading, local read failure, no pending
  changes or pending local changes without claiming that secure remote sync is
  active. TypeScript, affected lint and the full **274/274** runtime suite pass;
  backend/RLS, independent security review and Android device verification stay
  pending. Evidence: `LOCAL-SYNC-STATUS-UI-2026-10-09.md`.
- Local personal API gateway boundary එක එක් කළා. Bearer identity, actor
  derivation, UUID idempotency, owner-field rejection, approved route mapping සහ
  safe dependency errors tests සමඟ සකස් කළා. මෙය Edge Function එකට deploy කරලා
  නැති local boundary එකක් පමණයි; RLS, transaction receipts සහ independent
  security review තවම pending.
- Local remote-sync dispatcher boundary එකක් එක් කළා. Approved personal API
  routes සඳහා command mapping, UUID idempotency keys, client-supplied owner
  field rejection, legacy seconds-based terminal snapshot rejection සහ
  permanent conflict/retryable error වෙන්කිරීම tests සමඟ සකස් කළා. එය app
  startup එකට හෝ remote project එකට තවම සම්බන්ධ කර නැහැ; reviewed gateway,
  server schema සහ independent security review අවශ්‍යයි.
- Supabase CLI `2.120.0` එක තාවකාලික, project එකෙන් පිටත runtime එකකින් භාවිත කර
  local `supabase/migrations/20261009071127_personal_core_v1.sql` schema candidate එක
  සකස් කළා. එහි private `df_private` tables, composite owner foreign keys,
  RLS enablement සහ direct client grants නැති බවට structural tests එකතු කළා.
  මෙය remote project එකට යොදා නැහැ; SQL execution, RLS penetration test සහ
  independent security review තවම `REVIEW_PENDING`.
- Local Android debug APK එක Gradle wrapper එකෙන් සාර්ථකව build කළා. APK hash
  සහ build output evidence එක `ANDROID-DEBUG-BUILD-2026-10-09.md` හි සටහන් කර ඇත.
  Device/emulator එකක් නොතිබූ නිසා install සහ Android end-to-end verification
  තවම `NOT_RUN`; backend security review සහ production release readiness ද
  තවම pending ය.
- Website tests `17/17`, TypeScript, ESLint සහ local optimized `next build`
  pass වුණා. Build එකෙන් static pages 16/16 generate වුණා. Sandboxed run එකේ
  Windows path access දෝෂයක් තිබුණත්, අවශ්‍ය local access සමඟ build එක
  සාර්ථකයි. Browser/provider/deployment review තවම pending; remote publish කළේ
  නැහැ.
- Account Portal session verification error එකට Sinhala/Tamil/English retry
  action එකක් එක් කළා. Provider error එකක් hidden success එකක් ලෙස නොපෙන්වා,
  userට නැවත session check කරන්න පුළුවන්; provider sync behavior වෙනස් කළේ නැහැ.
- Mobile no-guest route guard audit එක ලේඛනගත කළා. Signed-out usersට protected
  routes වෙත direct navigation කළත් sign-in වෙත යොමු වන අතර, session restore
  වනතුරු protected UI නොපෙන්වයි. Provider/RLS/device acceptance මෙයින් තහවුරු
  නොවේ.
- Sync outbox response validation එක තද කළා. එකම mutation එක accepted සහ
  rejected දෙකේම තිබුණොත්, duplicate ID තිබුණොත් හෝ foreign ID එකක් තිබුණොත්
  local mutation acknowledge නොකර retryable error එකක් තබයි. New regression
  test එක ඇතුළුව bundled-runtime suite එක **241/241 PASS** ලෙස නැවත පරීක්ෂා
  කළා. Real server/RLS sync තවම review-pending.
- Corrupt local outbox එකක duplicate `mutationId` තිබුණොත් remote push එකට යැවීම
  නවතා `SYNC_OUTBOX_INVALID` retry state එකක් තබන validation එකක් එක් කළා.
- Duplicate outbox regression test එකෙන් පසුව full bundled-runtime suite එක
  **242/242 PASS**. Corrupt local rows server push boundary එකට නොයන බව local
  safety test එකෙන් තහවුරු කළා; real backend sync තවම review-pending.
- Authenticated remote API boundary එකේ 2xx response එකක් වුණත් වැරදි JSON,
  array/scalar response හෝ decode failure එකක් නම් `REMOTE_RESPONSE_INVALID`
  ලෙස fail-closed කරන ලදි. Server error status fallback එක රැකගෙන focused
  boundary tests **6/6**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint සහ project Expo lint pass වුණා. Remote server/RLS, independent
  security review සහ Android device verification තවම pending.
- Native Session History සහ Session Detail routes වල title,
  loading/error/empty states, filters, statuses, metrics සහ accessibility hints
  shared `en`/`si`/`ta` locale layer එකට ගෙනා. Focused history/locale tests
  **7/7**, full bundled-runtime suite **244/244**, TypeScript සහ affected lint
  pass. Translation review සහ Android device gate තවම `REVIEW_PENDING`; session
  storage/calculations වෙනස් කළේ නැහැ.
- Native Rewards route එකේ heading, loading/error/empty states, milestone copy,
  statuses සහ accessibility labels `en`/`si`/`ta` locale module එකට ගෙනා.
  Rewards tests **3/3**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint pass. Reward calculations, session history සහ entitlement
  behavior වෙනස් කළේ නැහැ; translation/device review තවම pending.
- Native Progress route එකේ heading, loading/error/empty states, period controls,
  metrics, insight සහ navigation copy `en`/`si`/`ta` locale module එකට ගෙනා.
  Progress tests **4/4**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint pass. Progress calculations, time windows සහ local storage
  behavior වෙනස් කළේ නැහැ; translation/device review තවම pending.
- Extended native Task Detail with locale-driven Sinhala/English labels for
  loading, editing, goals, dates, priorities, archive/delete actions and
  status copy. Existing accessibility labels and task safety behavior remain
  intact. Focused Task Detail tests pass 19/19; the current bundled-runtime
  regression suite passes 240/240. No backend, migration, dependency,
  production or release gate was changed.
- Extended native Settings with locale-driven Sinhala/Tamil/English sections,
  saved-error recovery, focus/break preferences, accessibility, privacy and
  account status copy. Existing settings persistence and timer units are
  unchanged; focused Settings tests pass 6/6.
- Extended the onboarding productivity-profile surface with Sinhala/English
  locale copy for saved-answer previews, retry/error states and the explicit
  local-settings confirmation flow. Assessment persistence and suggestion
  semantics are unchanged; focused onboarding tests pass 4/4.
- Extended the seven-question assessment screen with Sinhala/English locale
  copy for navigation, progress context, loading/error/retry, answer choices,
  skip and profile actions. Question IDs, validation and local persistence are
  unchanged; the bundled assessment suite remains 4/4.
- Extended the onboarding entry screen with Sinhala/English locale copy for
  its introduction, three-step explanation, privacy note and navigation
  actions. Assessment routing and answer-clearing behavior are unchanged.
- Added Tamil locale copy for the complete onboarding flow: entry, assessment
  and productivity profile. Question IDs, persistence, validation and explicit
  settings confirmation remain unchanged; human translation review is still
  required.

- Recorded a read-only backend gate: the local personal-core contract checker
  passed 36 DTO fixtures, 7 cursor fixtures, 14 operations and 9 declared
  prototype tables; the approved development Supabase project remains empty
  with zero migrations and zero security-advisor lints. This is not deployed
  schema/RLS proof. A fresh bundled-runtime root regression run passed 188/188,
  with typecheck, lint and documentation checks passing. No migration, remote
  write, dependency change, commit or push was made. See
  `revision/evidence/BACKEND-READONLY-GATE-2026-10-09.md`.
- Extended the approved `si/ta/en` locale layer to the native Plan, Focus and
  Profile tabs, including account state, recovery, preference and privacy copy.
  Timer, ownership and persistence behavior did not change; human translation
  and device accessibility review remain pending.
- Extended locale coverage to the local Plan My Day preview: time input,
  loading/error/empty states, task selection, reordering, proposal confirmation
  and start actions now use `si/ta/en` copy. The preview remains local-only;
  saved-plan lifecycle and AI provider integration remain review-pending.
- Extended the local account portal with `en/si/ta` copy selected from the
  HTTP-only site-locale cookie. Sign-in, sign-up, reset, session-state,
  sync-boundary and browser-secret safety messages are translated without
  changing provider authentication or private-data behavior. Portal sync
  remains review-pending.
- Extended the native Goals screen with locale-driven headings, goal composer,
  validation, loading/error/empty states and accessibility labels for
  `en`/`si`/`ta`. Goal storage, calculations, seconds units and ownership
  behavior did not change.
- Extended the native Tasks screen with locale-driven headings, composer,
  validation, loading/error/empty states, archive controls and task-row
  accessibility labels for `en`/`si`/`ta`. Task persistence, retry behavior,
  completion semantics and owner boundaries did not change.
- Extended the native Focus setup screen with locale-driven task selection,
  duration choices, loading/error validation and start/back actions for
  `en`/`si`/`ta`. Timer state, duration bounds and saved settings behavior did
  not change.
- Removed the unnecessary Windows-sensitive Turbopack root override from the
  local website config. An elevated local verification then completed the
  Next.js production build successfully: compile, TypeScript, page data and
  static generation for all 16 pages. This is build evidence only; no hosting
  or deployment was performed.
- Extended the native Session Summary screen with locale-driven completion,
  cancellation, metrics, status and next-session copy for `en`/`si`/`ta`.
  Session calculations, stored history and seconds-based units did not change.
- Started the local-resource foundation with bounded domain validation for
  user-entered references and explicit HTTPS links. Unsafe schemes, embedded
  credentials, control characters and invalid bounds are rejected; no network
  fetch, file import, cloud upload, AI input or task persistence was added in
  this slice.
- Added a local SQLite v6 resource repository for explicit references and
  HTTPS links. Resources and task links are owner-scoped, revision-checked,
  duplicate-safe and transaction-backed; missing resources are retained rather
  than deleted, and corrupt rows fail closed. Added five real SQLite regression
  tests plus the existing ownership suite; the fresh focused run passed 22/22.
  This remains `REVIEW_PENDING`: no file picker/import, cloud upload, AI input,
  paid storage, UI or production migration was added.
- Fresh full verification after the resource slice passed `196/196` root tests,
  root typecheck, root lint, documentation checks and `git diff --check`.
  The test-run module warnings are tooling warnings only; no test was skipped.
- Added an isolated configurable AI-planning provider boundary with a
  deterministic local mock. It validates bounded task input, returns a
  proposal marked as requiring confirmation, and rejects mismatched or early
  confirmations without changing tasks. No OpenAI request, credential, cost,
  allowance or live provider integration was added.
- Fresh full verification after the planning slice passed `199/199` root tests,
  typecheck, lint, documentation checks and `git diff --check`.
- Added a local advertising-policy guard only: it requires explicit consent and
  adult eligibility, and blocks ads on focus, recovery, True Zen Break, auth and
  settings surfaces. No advertising SDK, targeting, impression call or paid
  service was activated.
- Fresh full verification after the ad-policy slice passed `202/202` root tests,
  typecheck, lint, documentation checks and `git diff --check`.
- Added the first local Resources UI slice. Users can add bounded references or
  explicit HTTPS links, review locally stored items, and mark an item missing
  without deleting its history. The Profile screen links to it in all three
  supported locales. File import, network fetch, cloud upload and paid storage
  remain disabled.
- Added task-detail resource association. Users can link or unlink an active
  owner-scoped local resource revision without uploading or syncing content;
  focused task-detail coverage remains `19/19` passing.
- Added local confirmed-plan persistence for Plan My Day. SQLite v7 stores
  ordered plan items under the active owner, retires a replaced plan, rejects
  foreign tasks and rolls back invalid writes. No task status is changed and
  no AI request or remote sync is performed; focused UI/domain coverage is
  `11/11` passing.
- Added a tested local outbox sync orchestration boundary. It sends only due
  mutations in bounded batches, uses a stable retry idempotency key, acknowledges
  only explicit server mutation IDs, and retains rejected or malformed results
  for retry; concurrent calls for the same owner share one push. Focused sync
  coverage is `6/6` passing. No remote endpoint is enabled because the reviewed
  sync contract and backend runtime are still pending.
- Localized the Task detail resource-association labels, empty state and
  recoverable link errors through the approved `en`/`si`/`ta` locale layer;
  task behavior and storage boundaries are unchanged.
- Added a local-only entitlement decision boundary for AI and cloud resources.
  Core focus remains available, premium access requires a matching
  server-verified active entitlement, and the sandbox provider cannot purchase
  or restore anything. No prices, charges, billing provider or premium grant
  were enabled.
- Added a local classroom-policy foundation for synthetic/adult development
  fixtures: invite previews omit tokens, expired/revoked invites fail closed,
  and policy-version agreement is required. Real-minor pilot access remains
  disabled unless separately approved legal and pilot gates are present; no
  classroom data or remote sharing is enabled.

## 2026-10-08

- Added owner-scoped local UI-locale preference storage for the approved
  Sinhala, Tamil and English choices. Existing settings migrate additively to
  schema v5 with an English fallback; the Settings screen saves the choice
  without changing timer defaults. The locale now also drives the five primary
  native navigation labels through a small stable-ID copy layer. Full screen
  translations, font and accessibility review, and Android runtime verification
  remain pending.
- Added explicit local onboarding personalization: after review and confirmation,
  assessment choices can set future focus and break defaults; failed writes are
  visible and existing tasks/goals/session state remain unchanged. Device and
  human language/accessibility review remain pending.
- Added reduced-motion handling to the native splash overlay. The overlay stays
  static while the device preference is being read and skips the decorative
  animation when reduced motion is enabled; installed-device accessibility
  verification remains pending.
- Added an Android SQLite v4, owner-scoped durable outbox foundation for
  terminal focus-session mutations. History and the pending mutation commit
  atomically; retries, acknowledgement, payload-digest validation and account
  isolation are covered by real SQLite tests. This remains `REVIEW_PENDING` and
  is not a deployed backend sync implementation.

- Started the public-site locale preference foundation for the approved Sinhala, Tamil and English interface locales. Full page translations and human language/accessibility review remain pending; no site deployment.
- Localized public homepage copy and shared shell labels for Sinhala, Tamil and English. Other public content pages remain English and localized wording awaits human language review.
- Added Sinhala/Tamil copies for personal, education, roadmap, updates and help pages; untranslated commercial/legal/feature pages disclose that the content remains English.
- Added an evidence-based V1 implementation checklist that distinguishes local implementation, incomplete integrations, verification gates, and owner actions.
- Added local SQLite onboarding draft restore, serialized/revision-checked saves, retry-visible errors, and owner-scoped cancellation for skipped assessments. Applying suggestions to settings/tasks remains separate and pending.
- Added an explicit local Plan My Day proposal confirmation gate before starting a proposed task. It remains an in-memory confirmation only; no plan, schedule, reminder, AI call or task mutation is persisted.
- Added provider-backed email/password and Google development flows to the local account portal using only the publishable Supabase key. Private sync, privileged credentials and deletion controls remain review-pending.
- Added a tested remote API client boundary that requires authenticated bearer
  access, HTTPS `/v1/` paths and idempotency keys for mutations while preserving
  server conflict codes; no remote endpoint was contacted.
- Added a local account-portal status foundation that refuses fake sessions and clearly separates pending provider/backend work from the public preview.
- Rebuilt the local Android debug APK successfully (exit code 0) and recorded
  its artifact hash. Device installation and runtime verification remain
  `NOT_RUN` because no Android device or emulator is attached.
- Added an additive local SQLite v3 default-focus-duration setting (25/45/60
  minutes), Settings controls, and Focus Session Setup restoration. Existing
  break settings and older local data remain preserved; persisted-storage review
  and installed-device verification remain pending.
- Added ignored local development configuration for the approved Supabase
  development project using only its publishable client values; no private key,
  remote schema write or deployment was performed.

## Unreleased — 2026-10-08

- Personal Assessment now has a versioned seven-question V1 definition with
  stable question/option IDs, required-answer validation, reversible choices,
  and a deterministic profile that separates exactly what the user shared
  from optional starting suggestions. Answers remain only in the onboarding
  flow's memory and are cleared when it is left; they do not modify settings or
  tasks. This is a preview only, not persisted onboarding. Storage wiring waits
  for independent review and Android migration verification. Focused domain and
  route tests: 6/6 PASS; see
  [assessment profile evidence](revision/evidence/ASSESSMENT-PROFILE-IN-MEMORY-2026-10-08.md).

## Unreleased — 2026-10-07

- Prepared an isolated HIGH-risk auth owner-binding candidate using Supabase
  `getClaims()` and same-account SecureStore offline binding. It is deliberately
  not wired into the active `AuthProvider`; the existing auth path remains
  unchanged pending independent security review. Mocked tests do not prove
  native SecureStore, real Supabase, offline, or account-switch behavior. See
  [auth owner-binding evidence](revision/evidence/AUTH-SESSION-OWNER-BINDING-2026-10-07.md).
- The public Features page now shows an evidence-linked status for core focus,
  tasks/progress, Plan My Day and the Account Portal, with surface and date.
  Every item is explicitly unreleased; prototype/plan limitations remain visible.
  Responsive cards follow light/dark text contrast checks. Public copy is still
  pending independent content/accessibility review and has not been published.
  Web suite: 9/9 PASS; TypeScript, ESLint and Next.js build pass (15 static
  routes generated). Browser/screen-reader checks remain NOT_RUN. See
  [feature-status evidence](revision/evidence/WEB-FEATURE-STATUS-2026-10-07.md).
- Added owner-scoped SQLite assessment-draft tables and a version-2 local schema
  upgrade. Draft answers are type-checked, saved atomically with revision checks,
  and can be reopened; the upgrade rollback/retry, duplicate, concurrent-writer,
  corrupted-value and account-isolation cases use real SQLite. This is storage
  groundwork only: onboarding UI is not wired, assessment questions/result rules
  remain separate, and the high-risk migration is `REVIEW_PENDING`. Focused real
  SQLite suite: 15/15 PASS; whole-suite results are in the evidence note. No
  production database was opened or migrated. See
  [assessment-storage evidence](revision/evidence/ASSESSMENT-STORAGE-V2-2026-10-07.md).
- Rewards now distinguishes a failed local session-history read from a genuine
  empty history. Failures show a generic accessible message and retry action;
  milestone totals render only after a successful read. No reward rules, writes,
  or trusted XP were added. Route regressions: 3/3 PASS; combined checks recorded
  in the task evidence. Device/screen-reader verification remains NOT_RUN. See
  [Rewards recovery evidence](revision/evidence/REWARDS-READ-RECOVERY-2026-10-07.md).
- Plan My Day suggestions now preserve a user-controlled task order. Accessible
  earlier/later controls reorder only visible blocks, disable at list boundaries,
  and use 48dp targets. This changes only the in-memory preview; it does not save
  a plan or touch tasks. Available time now rejects values below the approved
  25-minute starting duration and integers outside JavaScript's safe range with
  an accessible explanation. Tests: focused route 6/6 PASS; full suite 163/163
  PASS; typecheck and affected-file ESLint pass. See
  [proposal-order evidence](revision/evidence/PLAN-MY-DAY-PROPOSAL-ORDER-2026-10-07.md).
- Plan My Day now distinguishes task loading, a local read failure with retry,
  and a successfully empty task list. A delayed read resolving after the route
  loses focus is ignored; proposal controls remain disabled until tasks load.
  This is local recovery only—the proposal is still heuristic, not OpenAI-backed,
  and it does not write tasks or schedules. Route regressions: 3/3 PASS; full
  suite: 160/160 PASS; typecheck and affected-file ESLint pass. See
  [Plan My Day recovery evidence](revision/evidence/PLAN-MY-DAY-READ-RECOVERY-2026-10-07.md).
- The public-site header now switches to a native, keyboard-operable disclosure
  on small screens, keeping the menu reachable without JavaScript and giving its
  trigger and links 48px minimum targets with visible focus. Desktop navigation
  remains unchanged. Web suite 8/8, TypeScript, ESLint and Next production build
  pass; browser/screen-reader checks remain NOT_RUN. See the
  [small-screen navigation evidence](revision/evidence/WEB-MOBILE-NAV-2026-10-07.md).
- Progress now has local week/month/all-time summaries for actual focused
  seconds (including ended-early sessions), completed-session count, completed
  tasks and saved goal progress, plus a timezone-aware weekly activity chart.
  Conflicting or invalid local records fail closed instead of inflating totals
  or appearing as zero; no client reward/XP grants or cloud analytics were
  added. Domain and route tests pass; the current combined full suite is
  156/156. TypeScript and direct affected-file ESLint pass. Native/device,
  localization, and independent review
  remain pending. See
  [local Progress evidence](revision/evidence/PROGRESS-LOCAL-ANALYTICS-2026-10-07.md).
- Settings now load and save the existing 5/10/15-minute default break choice
  with distinct loading/read-error states, serialized updates, and truthful
  save-failure recovery. The old value remains selected until SQLite confirms
  the write; web reports the unsupported local-SQLite path instead of claiming
  an in-memory value was persisted. No settings schema/migration changed. Four
  route regressions cover load, save, retry and duplicate writes; the combined
  suite is 156/156 PASS, with typecheck and affected-file ESLint PASS. Native
  device/review checks remain pending. See
  [Settings recovery evidence](revision/evidence/SETTINGS-BREAK-RECOVERY-2026-10-07.md).
- The optional break screen now handles saved-setting read failures without an
  unhandled rejection. It offers retry, or lets the user explicitly choose an
  unsaved break length without overwriting preferences; it only starts once a
  saved or manually chosen length is known. Three route regressions cover saved
  default, read failure/manual choice and retry. Combined suite: 151/151 PASS;
  typecheck and affected ESLint pass. Android verification is NOT_RUN. See
  [break recovery evidence](revision/evidence/FOCUS-BREAK-SETTINGS-RECOVERY-2026-10-07.md).
- Tasks can now be archived and restored without deleting the task, changing
  its ID, or detaching focus history. Archive state is owner-scoped, revision-
  checked and retained through the existing JSON extension field (no schema
  migration); archived records are hidden from active lists and Plan My Day,
  remain discoverable on request, cannot start new focus work, and remain in
  history/progress sources. SQLite tests cover reopen/retry, stale revisions,
  owner isolation and history preservation; route tests cover restore/error and
  list behavior. Full suite: 156/156 PASS; typecheck and affected ESLint PASS.
  Independent review/device checks remain pending. See
  [task archive evidence](revision/evidence/TASK-ARCHIVE-2026-10-07.md).
- Recorded the owner's expanded V1 implementation authorization: Supabase Auth,
  backend, secure sync, Google/email sign-in, Apple-ready iOS flow, no guest mode,
  and the exact `deep-focus-dev` project. This records scope only; it does not
  claim authentication, account isolation, provider setup, independent review,
  device verification or release readiness. See
  [authorization and auth task brief](revision/evidence/V1-AUTH-FOUNDATION-TASK-2026-10-07.md).
- Added a `REVIEW_PENDING` mobile authentication/local-identity candidate:
  SecureStore-backed Supabase Auth, email/password, Google PKCE, Apple iOS,
  verification/recovery routes, signed-out gating, sign-out, and account-scoped
  SQLite namespaces. Auth service/route-gate tests cover key error and callback
  replay paths. Provider configuration, backend/RLS/sync, native behavior and
  independent security review are still unverified; this is not release-ready.
- Task detail and Plan My Day now pass a stored `taskId` into focus setup. Setup
  and the session hook resolve the task in the active owner namespace; session
  history stores the stable relationship and title snapshot. Missing/completed
  tasks fail closed, and SQLite's existing composite owner foreign key rejects
  cross-owner references. Focus/session, real-SQLite ownership and task-route
  regressions pass; this persisted HIGH-risk slice remains `REVIEW_PENDING` for
  independent storage/ownership review and native verification.
- Task detail now supports editing an active task's title. SQLite performs an
  owner-scoped conditional update against the loaded `updatedAt`, preserves the
  stable task ID, returns the database timestamp, and refuses stale or terminal
  task edits. Failed saves retain the draft; conflicts offer a reload instead
  of overwriting newer data. The focused route/SQLite tests pass; task editing
  remains part of the broader task lifecycle `REVIEW_PENDING` and has not had
  native accessibility/device verification.
- The same task editor now also supports the existing optional description and
  low/medium/high priority fields. They are validated and updated with the title
  in the same owner-scoped, revision-checked SQLite statement; goal links and due
  dates are preserved. No new schema fields were added. Actual tests are recorded
  in the task evidence; due-date editing and a separate reversible archive state
  remain open.
- Task editing can now associate a task with one of the active goals owned by
  the current local namespace, or clear the optional link. SQLite's composite
  owner/goal foreign key rejects cross-account links. A storage regression found
  and fixed stale duplicate `goalId`/priority/due-date values being resurrected
  from legacy JSON after typed-column updates. Goal-read errors are recoverable;
  no account sync or goal-progress formula changed. Independent review remains
  pending.
- Task deletion is now an explicit confirmation flow. The owner-scoped SQLite
  transaction detaches linked focus sessions by clearing only `task_id`, keeps
  each existing `task_name` snapshot (or the task title when no snapshot exists),
  and then deletes the task. Revision mismatch, duplicate requests, and write
  failure do not delete newer data or history. Independent review and device
  verification remain pending; see the task deletion evidence.
- Goal detail now edits the title and target for active current-period goals.
  Focus targets show minutes while SQLite continues storing seconds; period
  boundaries, type, status, identity and derived progress are preserved. Writes
  are owner-scoped and revision-checked; failures retain the draft and stale
  revisions require reload. Route and real-SQLite regressions cover retry,
  conflict, unit conversion and account isolation. Independent review remains
  `REVIEW_PENDING`; device verification is `NOT_RUN`. See the
  [goal-edit evidence](revision/evidence/GOAL-EDIT-2026-10-07.md).
- Goal detail now offers confirmed goal deletion. SQLite checks the loaded goal
  revision and atomically unlinks its tasks (advancing task revisions) before
  deleting the goal; task records and focus history remain. Stale requests and
  injected transaction failure leave the goal and links unchanged. Independent
  review remains `REVIEW_PENDING`; Android device/accessibility checks are
  `NOT_RUN`. See the [goal-deletion evidence](revision/evidence/GOAL-DELETE-2026-10-07.md).
- Task detail now edits an optional due date using strict `YYYY-MM-DD` input,
  stored as UTC midnight for stable cross-device calendar dates. Existing dates
  remain unchanged unless edited; blank clears, invalid dates do not write. The
  local schema is unchanged; SQLite typed due-date values now override stale
  legacy JSON duplicates. Tests cover date parsing/formatting, failed validation,
  update/clear and account isolation. Independent review is `REVIEW_PENDING`;
  device keyboard/accessibility checks are `NOT_RUN`. See the
  [task-date evidence](revision/evidence/TASK-DUE-DATE-2026-10-07.md).
- Goals now complete automatically inside the same local SQLite transaction
  when verified session activity reaches the target. Focus-time counts actual
  focused seconds from completed/cancelled sessions; session-count counts
  completed sessions only. Completion records the first qualifying event time,
  is duplicate-safe and rolls back with a failed session write. Target edits and
  preserved local JSON imports also reconcile. Elapsed bounded goals become
  expired; verified late events still reconcile by their event time. No XP/reward
  grant was added.
  Independent storage/security review is `REVIEW_PENDING`; Android/device checks
  are `NOT_RUN`. See the
  [goal-completion evidence](revision/evidence/GOAL-AUTO-COMPLETION-2026-10-07.md).
- The combined domain, component, navigation and web regression suite now passes
  112/112 after these additions; root TypeScript check, changed-file ESLint and
  documentation checker also pass. This does not clear independent review or
  Android/iOS device gates.
- After goal lifecycle and task deadline additions, the combined regression
  suite passes 135/135. Root typecheck, affected-file ESLint, documentation
  checker, and diff check pass. Independent review and Android/device checks
  remain pending.
- Re-ran official npm 11.6.2 full and `--omit=dev` audits on the current tree:
  32 records (12 moderate, 20 high, 0 critical) in both reports. Triage did not
  establish compatible safe fixes, so no package/lockfile changes were made;
  SDK check remains clean. Reachability and release impact are recorded in the
  [dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).

## Audit fixes — 2026-10-07

- Guarded terminal session history against stale active writes; moved local
  SQLite operations onto a private serialized connection with foreign keys
  checked before transactions. Failed initialization is retryable in-process.
- Preserved unchanged migrated goals during new-goal saves; save-failure waiting
  time now stays paused until explicit user resume. Tasks keeps drafts/list state
  on failed saves and exposes load/retry/saving states.
- Corrected Plans navigation and footer-note text contrast using theme tokens.
  Added regressions for all eight audit findings; combined suite passed 64/64.
- Independent/native/browser verification remains pending; no production-ready
  claim. Details: [audit-fix evidence](revision/evidence/AUDIT-FIXES-2026-10-06.md).
- Goals now distinguishes a failed local goals/session-history read from a real
  empty result, preserves existing data, and offers retry. Added route and domain
  failure/recovery tests. Save now prevents duplicate in-flight submissions,
  disables editing/cancel while pending, and preserves the draft on failure.
  Combined suite passes 71/71, root typecheck and focused ESLint pass. Native
  screen-reader/device behavior remains pending; see
  [Goals read-failure evidence](revision/evidence/GOAL-READ-FAILURE-2026-10-07.md).
- Task detail now loads only a persisted task by ID, reports recoverable read/save
  failures, and changes completion UI only after a successful write. Route titles
  are no longer passed or trusted; duplicate completion is guarded. Four focused
  regression cases are included. Goal detail now distinguishes storage errors
  from genuinely missing goals and offers retry. Session History list/detail also
  recover from read failures instead of showing false empty/missing states. The
  latest combined suite passes 82/82. Task lifecycle review and
  native interaction remain `REVIEW_PENDING`; see
  [Task detail evidence](revision/evidence/TASK-DETAIL-RECOVERY-2026-10-07.md).

All notable changes to the Deep Focus project should be documented in this file.

This changelog provides a chronological record of significant project updates and helps developers, contributors, and future users understand how Deep Focus has evolved over time.

The format is inspired by Keep a Changelog principles and adapted to the needs of the Deep Focus project.

The changelog should record completed and meaningful changes rather than planned or speculative work.

## Unreleased — 2026-10-06

- Corrected the public-site skip link to target the page's programmatically
  focusable `<main>` landmark on home, public content and not-found routes.
  Added regression assertions for all three render paths and small accent-text
  contrast across sampled light/dark page surfaces (minimum 5.75:1 and 6.06:1).
  Website tests 6/6, typecheck, ESLint, Next production build and local route
  response smoke check pass. Real keyboard/screen-reader browser verification
  remains pending.

- Applied 16 semver-compatible transitive dependency updates from a reviewed
  `npm audit fix` (without `--force`); root SDK/framework versions were not
  changed by this remediation step. The command's fresh audit output reported
  32 findings (20 high, 12 moderate, 0 critical), down from the recorded 38
  after SDK patch alignment. Remaining advisories include `braces`,
  `decode-uri-component`, `image-size`, `node-forge` and `uuid`; npm's proposed
  fixes for several require breaking Expo/router changes and were not applied.
  Fresh full and `--omit=dev` audits both confirm 32 findings (20 high,
  12 moderate, 0 critical): 7 direct and 25 transitive. The same graph under
  `--omit=dev` does not prove runtime exploitability. The final Expo SDK
  compatibility check reports dependencies up to date. Root tests
  47/47, root typecheck, focus ESLint, web tests 6/6, web typecheck/ESLint and
  Next production build pass. The website's fresh production-only audit reports
  0 findings; its full audit has five high dev-tool findings through `braces`,
  with no patched compatible path applied. Details and limitations:
  [dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).

- Focus recovery now routes startup read failures to an explicit, retryable
  recovery state instead of leaving a rejected promise or implying there is no
  active session. The flow is read-only and preserves the active record. This
  HIGH-risk candidate remains `REVIEW_PENDING`; independent review and Android/
  iOS lifecycle evidence are not complete. Details:
  [focus recovery read-failure evidence](revision/evidence/FOCUS-RECOVERY-READ-FAILURE-2026-10-06.md).

- Added an isolated Next.js public-site preview with twelve static public routes,
  responsive navigation and reduced-motion support. It clearly labels the
  product as in development and does not fake accounts, prices, policies,
  downloads or support. Isolated website dependency installation succeeded;
  website tests, typecheck, ESLint and Next production build pass after fixing
  Turbopack root inference. Browser/accessibility review, account portal, legal
  review, locale QA, hosting and publication remain pending. Evidence:
  [WEB-01/02 preview](revision/evidence/WEB-01-public-preview-2026-10-06.md).

- Progress now distinguishes an unreadable session history from a genuinely
  empty one, gives a non-destructive retry, and avoids exposing storage error
  details. Added read-state and transient-retry regression tests. This does not
  alter stored data or progress calculations; native rendering and screen-reader
  behavior remain pending. Task evidence:
  [Progress read-failure slice](revision/evidence/UX-02-progress-read-failure-2026-10-06.md).
  Final focused suite: 43/43 pass; TypeScript typecheck, direct ESLint and docs
  checker pass. No platform interaction was run.
- Clarified Goals screen copy to distinguish focused time from completed-session
  count. Added direct regressions for both approved outcomes (cancelled session
  time counts; its session count does not). The complete mobile test command
  passes 45/45; root typecheck, focused ESLint, docs checker and whitespace check
  pass. No native device UI test was run. Details:
  [goal semantics evidence](revision/evidence/GOAL-SEMANTICS-UI-2026-10-06.md).

- Recorded owner-approved SQLite local-store, no-auto-account-claim, and ages
  15–17 development/legal release boundary decisions in canonical contracts.
- Added an Expo SQLite v1 schema/import repository draft and routed native task,
  goal, settings, and session storage adapters through it. Legacy JSON inputs are
  retained and import is transactional; production data/migration/deployment
  remain explicitly out of scope.
- Updated goal progress semantics: completed and cancelled sessions contribute
  confirmed seconds to time goals; only completed sessions count toward
  session-count goals. Existing legacy goal time units convert explicitly.
- Evidence: TypeScript typecheck, docs checker, in-memory SQLite DDL execution
  (7 tables), ESLint and whitespace check passed. The earlier 35-test run omitted
  the separate three-test Button suite; the historical 38-test baseline was 31
  timer/session + 4 navigation + 3 component tests. All 38 remain, and three new
  SQLite-backed migration/ownership tests bring the combined total to 41/41.
  The seven former JSON-adapter safety cases now run through SQLite and retain
  failure/retry/restart/concurrency/corruption/duplicate assertions. Tests use
  Node's built-in SQLite engine with a narrow Expo API shim, not an installed
  Android/iOS runtime. Independent review, native device checks, qualified legal
  review for real-minor access, and production migration/deployment remain pending.
- The initial install reported 40 vulnerabilities without retaining their
  advisory detail. On 2026-10-06, official npm CLI 11.21.0 ran from an isolated
  temporary folder with Node 24.19.0. Full and `--omit=dev` audits both returned
  40 findings (27 high, 13 moderate, 0 critical): 7 direct, 33 transitive, none
  exclusively dev-only in the production dependency graph. Project manifests
  were hash-checked unchanged. Actual app exploitability/binary reachability
  remain conditional and unverified; findings and remediation scope are in
  [the dated dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).
  At the time of that initial read-only audit, no audit fix or dependency upgrade
  had been attempted; the later reviewed remediation is recorded at the top of
  this Unreleased section and in the linked evidence addendum.

---

## Versioning

---

Deep Focus intends to use Semantic Versioning principles for public releases where appropriate.

Version numbers generally follow the format:

`MAJOR.MINOR.PATCH`

Examples:

- `1.0.0`
- `1.1.0`
- `1.1.1`

In general:

- `MAJOR` represents significant incompatible or major product changes
- `MINOR` represents backward-compatible functionality or meaningful feature additions
- `PATCH` represents backward-compatible fixes and smaller corrections

Before the first stable public release, versioning may remain flexible while the product and release process are still evolving.

Version numbers should communicate meaningful differences between releases as clearly and consistently as practical.

---

## Change Categories

---

Changes may be recorded under the following categories:

## Unreleased

### Accessible loading state for shared buttons — 2026-10-06

- Loading buttons now expose a changed accessible name alongside their busy and
  disabled states; callers may supply localized loading copy. Added synthetic
  source-level component tests for loading, localization override and idle state;
  38/38 combined focus/navigation/component tests pass. Real VoiceOver/TalkBack
  announcement behavior remains NOT_RUN.

### Approved mobile navigation skeleton — 2026-10-06

- Aligned the tabs with Home / Plan / Focus / Progress / Profile. Plan links to
  existing Tasks and Goals; Rewards and session history now live under Progress.
  Legacy Analytics, Rewards and history routes redirect to their canonical
  destinations while preserving the history session ID.
- Added static navigation-contract checks. Expo Router cold/warm links, Back,
  account switching and Android/iOS behavior remain NOT_RUN; the read-only ADB
  inventory found no connected Android device.
- Focused verification: 35/35 session/timer/navigation tests pass; TypeScript
  typecheck and ESLint pass. Static checks do not establish native navigation
  behavior.
- The document-only experience checker passes: 27 routes, five aliases and 56
  proposed-token contrast pairs; these figures do not certify runtime UI.

### Session persistence recovery — 2026-10-06

- Surface active/history/cleanup write failures, serialize same-runtime storage
  operations, and persist terminal history before clearing the active recovery
  file. Identical terminal retries are idempotent; a pending terminal active file
  can be restored and finalized after restart. Malformed history is preserved.
- Added synthetic failure, retry, restart, conflicting-duplicate and
  concurrent-append tests; 31/31
  domain/boundary tests, typecheck and focused ESLint pass. The legacy JSON adapter
  still lacks a cross-process lock and atomic multi-file transaction; HIGH review
  and Android/iOS failure/restart evidence remain pending.

### Remaining timer contracts and guarded startup — 2026-10-06

- Fixed CR-T02/06/08: early completion retains the live session; invalid duration
  and malformed timing records reject explicitly. Preserved CR-T04/05 repairs
  and the existing seconds schema/engine return types.
- Timer startup now waits for hydration, catches validation/read errors, blocks
  controls/writes/auto-completion on error and preserves unreadable active data.
  Added loading/recovery UI, early-completion feedback, guarded break navigation
  and restored task-name display. New route duration follows setup's 5–180 range.
- 24 domain/boundary tests pass; typecheck and direct ESLint pass. Boundary tests
  use substituted React/platform scheduling, not device integration. See
  `tests/domain/README.md` for exact evidence and remaining storage risks.
- HIGH lifecycle candidate: independent review/device checks remain pending.
  No storage transaction rewrite, V2 migration, dependency changes or deployment.

### Focus timer projection corrections — 2026-10-06

- Corrected seconds-based projection of completed/cancelled sessions to use their
  stored totals, and treated an epoch-zero pause timestamp as present.
- Added CR-T04/CR-T05 regression coverage. The focused suite reports 7 pass and
  3 remaining failures (CR-T02/06/08); TypeScript check passes. Lint remains
  unverified because `npm` and `npx` are unavailable. No schema, UI, return type,
  persistence or V2 migration change; broader timer review remains pending.

### Optional onboarding prototype — 2026-10-06

- Added UI-P3 intro, optional conditional 9/10-step questionnaire, selected-change
  review, defaults, keep/resume/discard and Profile re-entry to the isolated preview.
- Added draft en/si/ta onboarding/card copy, independent learning-context/medium
  choices and personalized Home card. Sri Lanka is explicitly a metadata preview,
  not an installed/verified syllabus; no auth, provider, upload or persistence.
- New browser flow and existing interaction/motion checks pass. Native language,
  accessibility and production integration remain unverified; see
  `artifacts/ui-prototype/ONBOARDING.md` for evidence and Luna handoff.

### Prototype scenery and motion refinement — 2026-10-04

- UI-P2 adds layered day/night SVG scenery, finite entrance replay, start/pause
  feedback and completion check reveal to the isolated browser prototype.
- OS/manual reduced-motion and session scenery freeze tested; existing flows and
  320/390px checks pass. Visual approval and native performance remain pending.
  No production Expo code, providers or dependencies changed.

### Interactive UI reference — 2026-10-04

- Added isolated `artifacts/ui-prototype` Home/Plan/Focus browser preview with
  light/dark scenery, sample task and timer interactions, personal motivation
  controls, reduced-motion support, and local preview server.
- Edge interaction/320px/390px smoke checks passed; screenshots and limitations
  recorded in its README. No production Expo implementation or release readiness
  is claimed; final visual approval remains pending.

- October 3 FG-01: finalized the existing build guide as the single working
  entry, with canonical phases 0–10, required launch lanes and feature-specific
  pending inputs. Routed root/revision README, map and implementation plan to it;
  replaced the duplicate diagnostic handoff with a pointer to the coding prompt.
  Closed the broad editorial pass while retaining unresolved feature/review
  requirements. No new numbered document or app/source change.

- October 3 BH-01: inventoried eight OpenAPI sources / 82 operations and local
  schema references; documented four repeated component-name groups without
  flattening their meanings. Corrected the personal-core draft to reject a
  supplied empty cursor, with seven parameter fixtures. Prepared the first
  bounded coding-task handoff and refreshed actual timer diagnostic evidence
  (three passing cases, five existing gaps). No app repair or runtime API work.

- October 3 DH-01: consolidated remaining documentation into nine linked
  workstreams with concrete completion evidence, added a copyable read-only
  first-task handoff, and refreshed January capacity to 90 days / approximately
  321–450 gross owner hours. Preserved feature/review gates and identified API
  operation/schema ownership inventory as the next document task.

- October 1 EB-00: drafted typed classroom Edge/database preparation, crypto
  material and encrypted invitation result contracts; reconciled internal
  signatures/grants/recovery and added local bridge schema/model checks. Corrected
  the prose operation split to 13 mutations/nine reads against unchanged OpenAPI.
  No public API, app/SQL implementation or production key/nonce policy change;
  independent review and runtime integration remain pending.
- October 2 KN-00: drafted separate command/AES key custody options, committed-
  before-use nonce allocation/recovery rules, rotation/restore fencing and a
  reviewer-ready independent security review brief. No keys, KMS, allocator,
  provider account or runtime integration was created or approved.
- October 1 FA-00: recorded classroom adapter feasibility self-review, placed the
  incompatible SQL-only AES-GCM path on ADAPTER_HOLD and documented the proposed
  Edge/atomic-database correction. Added decoded-NUL guard/reference regressions
  and reconciled implementation warnings. No app/SQL/Edge implementation, provider
  change or independent security acceptance.
- September 30 HC-00: specified classroom canonical command digest/replay,
  closed-command denial, opaque cursor registry and invitation helper behavior;
  added synthetic encoding/HMAC/token and predicate-model fixtures/checker.
  Reconciled auxiliary-storage and helper references; public DTOs and app code
  unchanged. No SQL/crypto adapter, legal retention or production policy implemented.
- September 30 SF-00: documented 22 classroom internal function signatures,
  capability restrictions, seven ordered uncreated migration seams and isolated
  runner admission/barrier/oracle requirements; mapped all 40 TX/TI scenarios to
  required execution surfaces. Extended read-only contract checks; no SQL, runner,
  app, provider or production policy implemented and no runtime tests claimed.
- September 30 TI-00: selected draft private acceptance tombstone/live-FK and
  server-only Edge/PostgreSQL identity-bridge designs in packet 42; reconciled
  owner-head/session/class lock ordering and added 16 NOT_RUN integration scenarios.
  No public DTO, app code, SQL, role, credential or retention-policy change.
- September 30 CR-00: reconciled bounded-classroom references across canonical
  API/data/database/security/testing documents; added 22-operation/11-table access
  and integrity review matrices, privacy-export boundaries and six OPEN isolated
  SQL admission gates in packet 41. Expanded read-only document coverage checks;
  no migration, app implementation, new export DTO or independent acceptance.
- September 30: added draft classroom wire/data packet 40, 57 strict JSON Schema
  definitions, 22 OpenAPI operations, a read-only DTO/reference checker and 24
  NOT_RUN isolated transaction scenarios. Documented relational constraints,
  authorization/replay/locking and private-task recovery boundaries. No SQL,
  app code, deployment or independent security acceptance is claimed.
- September 29: added draft bounded-classroom packet 39 with eight implementation
  preparation cards, 24 NOT_RUN scenarios, explicit private/class payload and
  retry/revocation boundaries, inspected Task-storage prerequisites and six gates.
  Included primary-source authorization checks and canonical reconciliation map;
  no app/SQL implementation, independent review or runtime/security pass claimed.
- September 29: recorded bounded classroom sharing in the V1 target, January-first
  feature-deferral policy and delegated routine specification boundaries. Reconciled
  canonical scope/sequence and active education/release/owner summaries, preserving
  full productivity web later and required Website/Portal. No specific feature cut,
  app implementation, security acceptance or production readiness is claimed.
- September 28: added the twelve-field source-to-migration inventory, actual
  legacy reader limitations and six pending migration failure cases. A synthetic
  probe confirmed two pause histories can produce identical legacy JSON; clarified
  why conversion cannot recover lost precision. No real data read/migrated, app
  fix, new schema, ownership policy or independent review claimed.
- September 28: reconciled stale active summaries with already recorded teacher,
  locale, age-target, selected-stack and resource-format decisions. Updated the
  owner entry point to current core review/harness work. Kept legal, configuration,
  limits, translation/native QA and independent-review gates; no new approvals,
  application changes or production acceptance.
- September 28: prepared the seven-choice core review/reconciliation packet with
  specific questions, canonical destinations and evidence requirements. Corrected
  draft cutoff precedence after resume and clarified enclosing validation context;
  linked the Luna handoff/readiness gates. Self-review only, no canonical timing
  adoption, app/test code, installed package or independent sign-off.
- September 28: extended the harness investigation with the concrete renderer/
  reconciler React peer mismatch and a narrower uninstalled candidate. Expanded
  the existing core contract with seven proposed freeze choices, typed projection
  outcomes, eight fixture oracles and target-cutoff provenance across pause/resume.
  Updated readiness/playbook; no app fixes, schema migration or approval inferred.
- September 28: completed revision 38's test-harness proposal after interrupted
  research: no-new-package Node domain slice, exact future files/commands, eight
  acceptance cases and separate Expo/RNTL component gates. Recorded passing
  import smoke, deliberate failure canary and unchanged five engine gaps;
  no test-suite files, packages, app fixes or device/security verification added.
- September 28: refreshed the read-only core diagnostic (three checks pass,
  five existing contract gaps reproduced) and added revision 13's gap-to-caller
  handoff with regression oracles and exact next harness-proposal requirements.
  Updated playbook/readiness; no app fixes, dependencies or native tests claimed.
- September 28: added revision 37's proposed viewer permission/containment contract,
  separating Android/iOS feasibility, logical UI revocation, native quiescence and
  disk cleanup. Added view-lease/CLOSE_PENDING behavior and six NOT_RUN refinements
  of existing device cases. No permission/config/code change, adapter selection,
  runtime evidence or security acceptance; viewer integration remains HOLD.

- September 28: completed the bounded PDF-viewer source investigation in revision
  36 §7. Verified four public npm archive checksums in memory and matched eight
  viewer files to its release commit; corrected branch-versus-published plugin
  version assumptions. Recorded permission, parsing, loader/cleanup and review
  gaps with a HOLD disposition. No package installation, app edit, runtime test or
  complete transitive-security certification; all twelve device cases remain NOT_RUN.

- Added September 26 viewer compatibility research and isolated device-test plan
  (revision 36): inspected lock/installed native-stack baseline, primary-source
  candidate and plugin-version evidence, parser-engine distinctions, synthetic
  measurement/harness prerequisites and twelve NOT_RUN device cases. No library
  selected, installed or built; numeric policy, native security/accessibility
  evidence and independent review remain open. App behavior is unchanged.

- Recorded the later September 26 owner approval of initial PDF/JPG/PNG,
  website/video links and book/page references, with in-app read-only PDF/image
  viewing. Reconciled resource scope, options and readiness summaries. Numeric
  limits, detailed format restrictions, native adapters and production acceptance
  remain open; no code, dependencies or runtime behavior changed. ADR totals
  remain 2 approved / 9 partial / 1 open.

- Added the requested resource format/limit/viewer option sheet (September 26,
  revision 35): three scope alternatives, recommended bounded local PDFs/images,
  numerical prototype candidates with exact units, native/external/remote viewer
  tradeoffs and eight NOT_RUN probes. No owner approval, measured safety, PDF
  package choice, app change or paid-cloud allowance is inferred. Independent
  review and real native compatibility/security/accessibility evidence remain open.

- Recorded September 26 owner clarifications: desired 15+ product audience,
  intended Sri Lanka company publisher, resource-organising concept and planned
  AWS Device Farm/friends' Android testing. Consent, incorporation, merchant and
  format/size/viewer choices remain separate gates. Added revision 34's local
  import/open/recovery draft with five cards and twenty NOT_RUN cases; routed
  scope/readiness/test planning and document checks. No source, package, native,
  provider, purchase or deployment change; independent review remains pending.

- Reconciled the September 25 owner release answers: Android+iOS, Website/Portal,
  O/L/A/L/higher-stage education, independent personal-teacher launch, si/ta/en
  and optional paid cloud. Added revision 32's complete 80-family placement map;
  retained numeric-age/consent, exact feature, price/quota and operational gates.
  Added revision 33's source-backed paid-cloud admission/recovery draft, six cards
  and twenty NOT_RUN runtime cases. Updated scope/routing/readiness and structural
  checks; fifteen document/reference checkers PASS. No app, provider, purchase,
  migration or deployment change; independent review and real tests still pending.

- Added PL-05 saved-plan activation/pause/recovery draft (September 25): revision
  31, eight unfilled evidence gates, four cards, twelve NOT_RUN scenarios and a
  fail-closed reference checker. Completes the five PL specification drafts, not
  implementation or release acceptance. Specifies compatible writer/cursor rollout,
  preserved privacy duties, worker/receipt recovery and safe-forward boundaries.
  No app/API/SQL/config change, real rollout or independent review performed.

- Added PL-04 mobile saved-plan storage/outbox/editor recovery specification
  (September 20–21): revision 30, six cards, six open gates, twenty NOT_RUN device
  cases and a synthetic state/guard checker. Reconciled data/security/testing and
  documentation routing. Defines honest pending/receipt states, account fences,
  crash/conflict/privacy reset and reminder recovery; no app/package/SQL/OS
  implementation or capability activation. Independent review remains pending.

- Added PL-03 isolated database/RPC/migration test specification (September 20):
  revision 29, seven ordered cards, seven open gates and 24 detailed future cases,
  plus a structural packet checker. Separates prototype foundation gaps, trusted
  actor/privilege design, atomic commands, cutover and safe recovery. No executable
  SQL, runtime test, new API operation, app change or database action; independent
  review and actual implementation/evidence remain pending.

- Added account-export artifact draft (September 20): revision 28, nineteen schema
  definitions, fourteen typed sections, explicit deferred-family dispositions,
  snapshot/digest and private delivery rules; added reference checker and routing.
  EX-21–23 and the 60-operation API inventory are unchanged. Source mapping,
  deferred-family access, policy/runtime/independent review remain gates; no app,
  SQL, provider, cloud upload or deployment was performed.

- Added PL-02 replication/snapshot/export-component draft (September 20): revision
  27, 23 DTO definitions and six operations (60 across seven partial API files).
  Defines atomic groups, privacy epochs, legacy isolation and archived-plan export;
  added reference checker and reconciled routing/readiness docs. Full account-export
  packaging, real SQL/client tests and independent review remain open. No app,
  database, provider or deployment change; this is not a shipped sync feature.

- Completed the interrupted saved-plan management wire draft (September 20):
  revision 26, thirteen DTO definitions, two management operations (54 combined),
  exact reminder actions/versions and minimal receipts. Reconciled PG-05's
  undeployed current-plan read/header and added its document checker; initial
  interruption left stale fixtures and a missing checker, now addressed.
  No app/backend/SQL changes; replication/export wire and independent review
  remain pending. This records documentation work, not a shipped feature.

- Added the draft saved-plan lifecycle/privacy contract (revision 25): explicit
  edit/archive/restore/delete effects, known-context erasure, owner transactions,
  privacy-epoch artifact suppression and legacy/v2 sync boundaries; five bounded
  next packets and twelve future runtime cases. Added a read-only synthetic
  lifecycle checker and reconciled data/security/routing references. No wire/API
  count change, executable SQL, app/backend implementation or production action;
  strict lifecycle/replication DTOs and independent review remain pending.

- Added draft daily-plan focus/break/reminder contracts, strict generation/status/
  cancellation/revision/plan-read wire schemas and five OpenAPI operations (52
  across five slices). Proposed contractVersion 2 separates whole-plan confirmation
  from v1 task/reminder changes, with no progress awarded for planning. Added
  read-only negative/time/dependency checks; plan migrations, sync/export/deletion,
  provider/runtime integration and independent review remain gated. No app changes.

- Specified the proposed AI generation/reservation, lost-response recovery,
  cancellation-versus-completion, worker fencing and manual-revision lifecycles
  in revision 23, with a read-only transition model/reference checker and five
  follow-up cards / 24 future integration scenarios. Reconciled canonical timeout,
  cancellation and legacy data-shape notes. Strict generation wire/schedule/provider
  contracts and independent/runtime review remain open; the existing OpenAPI count
  is unchanged at 47. No application code, provider or database changes.

- Added the six remaining extension-inventory wire contracts for rewards/history,
  goal progress, AI usage, proposal retrieval and atomic selected apply, with
  strict schemas and read-only negative/semantic-reference fixtures. Four draft
  slices now cover 47 operations / all 33 extension rows, not the full V1 API.
  Reconciled the older editable AI-apply and introductory-five response examples;
  preserved no failed-generation debit, zero apply debit and explicit policy gates.
  Generation/revision/provider contracts, migrations and independent/runtime
  security verification remain incomplete. No application code changed.

- Added a critically reviewed, bounded engineering-workflow specification:
  documentation authority/map, risk/STOP/escalation rules, evidence-based
  Definition of Done, replaceable model mapping and task brief. Shortened root
  AGENTS/AI entry points with detailed constraints preserved in routed guardrails;
  reconciled playbook/contribution/development workflow and authorization language.
  Independent governance/security review remains pending; this is not a completed
  enterprise implementation freeze. No app/model/provider configuration changed.
- Corrected the draft SyncPull query schema to express its existing shared
  default limit of 50; no checker assertion was weakened and no runtime default
  application is implied.

- Added fifteen proposed sync/privacy/session/billing-visibility wire operations
  and strict DTO fixtures (41 unique operations across three partial OpenAPI
  slices). Specified snapshot/poll cursors, filtered profile-log mapping, lost
  deletion-response recovery via a pre-issued narrow status credential, secret
  replay isolation, app-session revocation and truthful billing states/IDs.
  Corrected an older ruleVersion-based reward deduplication reference. Exact
  security/TTL/key/merchant/price policies and provider-specific implementation
  remain gated; no app, SQL execution, payment, account deletion or deployment.

- Added a proposed twelve-operation extension OpenAPI slice alongside the
  fourteen-operation core, with strict break/reminder/page and typed soft-delete
  receipt schemas. Clarified bodyless delete/version-header normalization,
  direct/sync reuse, error codes and live pagination; extended document-only
  fixtures and cross-file contract checks. Corrected settings endpoint IDs and
  the stale fixed-five/ad-only packaging note. Restored required unobtrusive ads
  explicitly in the January admission checklist, added its release gate and
  refreshed capacity-date arithmetic. No API deployment, app changes, ad SDK,
  new owner policy, dependency, purchase or runtime-test pass is claimed.

- Reconciled legacy settings defaults/cloud API examples and clarified numeric
  XP examples, calendar-day ordering and minute/second/millisecond boundaries.
  Added a proposed settings/progress contract with five SP cards/24 NOT RUN cases,
  strict account-settings/analytics response shapes and truthful zero versus
  unavailable snapshots. Extended document fixtures to compare canonical settings
  examples with schemas and check reference unit arithmetic. Numeric reward/day
  policies, full extension APIs and actual migrations remain open; no app code,
  production default, XP formula, service or dependency changed.

- Reconciled both legacy Focus Bet stake/forfeiture sections, architecture reward
  references and misleading positive health-component examples with approved
  non-punitive/non-diagnostic rules. Retained clearly labelled prohibited examples
  and historical evidence. Aligned canonical strict-mode exit guidance; added
  proposed safety/commitment contract with four SC cards and twenty NOT RUN cases.
  Exact default/interaction/schema adoption remains gated; no app, health model,
  shielding capability or Emergency exit implementation was changed.

- Recorded September 17 owner approval that a separate Emergency exit remains
  available when ordinary End early is disabled through pre-session Settings.
  Synchronized scope, AI rules and revision decision/product/readiness summaries;
  exact interaction and in-session preference details remain open. Documentation
  only; no strict-mode or emergency-exit UI implementation is claimed.

- Reconciled the owner's safety/AI/advertising decisions in the requirement
  register, product/monetization/readiness summaries and canonical AI scope,
  vision, blueprint, plan, architecture, data/database/API, UI and testing rules.
  No missed-work XP penalties or unverified health predictions; limited free AI
  plus optional paid AI; unobtrusive initial-release ads required. Fixed-five/
  ad-only assumptions were superseded or marked as legacy examples. Pre-session
  exit configurability is recorded without inventing an emergency/hard-lock
  policy. Exact allowance/prices/ad settings and complete paid-AI contracts
  remain open. Documentation only; no app code or advertising service changed.

- Added remaining-backend and Website/Portal documentation: strict extension
  DTOs, fourteen sync command kinds, 33 extension/overlapping endpoint contracts,
  snapshot/replay/progress/AI/privacy-job/operations rules, eight BX cards and
  24 future cases. Added a 25-page/two-handler web manifest, ten WP cards/24 future
  cases and publication/rollback runbook. Consolidated readiness/owner decisions
  and corrected the cloud-settings assumption for local phrases/assessment data.
  Read-only checks passed 59 new DTO fixtures plus existing contract/document
  checks. No app code, provider, SQL migration, website scaffold or deployment
  changed; open policies and missing complete response/API/migration contracts
  remain explicit, not silently marked ready.

- Recorded approved Supabase Edge Functions API, Expo SQLite/SecureStore and
  Home/Plan/Focus/Progress/Profile navigation with Rewards under Progress.
  Reconciled the canonical 27-route inventory, architecture navigation and five
  UI examples; updated primary-brand/button guidance to the approved blue
  direction while exact tokens remain proposed. Added backend DTO/OpenAPI and
  guarded SQL prototype documentation, eight BE cards/eighteen future cases,
  and detailed experience/personalization/motivation contracts with eight UX
  cards/twenty-four future cases. Read-only checks passed 32 DTO fixtures and
  56 proposed contrast pairs, plus route/relative-link/ID consistency. These
  are document checks, not deployed backend, app UI, SQL/RLS or accessibility
  certification. No application code or production service was changed.

- Reconciled confirmed January Website/Account Portal inclusion, current weekly
  capacity, selected Auth and the reopened documentation phase in canonical scope,
  screen-map and implementation-plan clauses. Added detailed core lifecycle,
  save/retry/recovery and legacy-migration draft contracts, six CR cards and twenty
  acceptance scenarios. A read-only current-engine diagnostic ran eight synthetic
  checks: three passed and five existing contract gaps were reproduced. No app
  code or dependency was changed and no bug was fixed; detailed new schema and
  implementation choices remain gated. Extended structural documentation checks.
- Clarified education as students' study-work and teachers' independent preparation/marking organisation using their own resources, excluding Deep Focus-supplied papers, notes, videos and other academic materials. Added local-resource/import/recovery and optional paid-cloud draft contracts, six R cards and sixteen future acceptance scenarios. Recorded the owner's refinement from local-only storage to local default plus optional subscription cloud; added a dated provider-cost input snapshot and revenue/cost model without selecting retail prices, quotas or a cloud launch date. Updated affected product/data/security/scope references; no app code, storage service or paid checkout was changed.
- Recorded the owner's product-purpose clarification: organise work and make carrying it out easier across personal/professional and education contexts. Updated revision decision/product/education contracts to explicitly exclude academic lesson-video production/upload/hosting/sales; curriculum structure and optional resource-link proposals do not imply a course-content platform. Existing V1 and AI approval gates remain unchanged. Documentation only; no app functionality changed.
- Recorded the owner's Supabase PostgreSQL/Auth and Next.js Website/Account Portal selections on 2026-09-14 and reconciled those selections in architecture, security, database/API introductions and revision references. Hosting and detailed runtime/policies remain open. Added a cited Sri Lanka student/teacher research report and draft education ownership/flow contracts, ten bounded subcards and eighteen future acceptance scenarios. Updated the January privacy gate after verifying Gazette 2498/16. No infrastructure, app code, real-user pilot or deployment was changed.
- Added the initial research-backed enterprise documentation review draft in `docs/revision/`, including an 80-family requirements register, initially 12 pending architecture/product decisions, retained 20-app evidence, product/security/web/billing contracts, Luna task preparation, release gates and a structural documentation validator. Added README/AI-rules discovery notes. That initial draft did not approve providers, complete the canonical rewrite, fix application code or publish any feature; subsequent stack approval is recorded separately above.
- Implemented local focus-session history and session detail views.
- Added welcome, onboarding, assessment, productivity profile, and account-access UI flows.
- Added focus break, recovery, and automatic pause/resume navigation.
- Added Plan My Day proposal UI and connected account access from Profile and Settings.
- Improved settings with selectable break-duration controls while keeping unsupported sync, notification, and authentication behavior explicit.
- Persisted the selected default break duration locally across app restarts.
- Added a visible Session Recovery entry point under Profile > Your Focus.
- Fixed navigation wiring for Sign In, Create Account, Email Verification, and Forgot Password routes.

- Added
- Changed
- Improved
- Fixed
- Removed
- Deprecated
- Security

### Added

Used for new functionality, capabilities, or significant project additions.

### Changed

Used when existing behavior, architecture, workflows, or requirements change meaningfully.

### Improved

Used as a Deep Focus project convention for meaningful enhancements that do not clearly represent entirely new functionality or defect fixes.

### Fixed

Used for resolved defects or incorrect behavior.

### Removed

Used for functionality, files, APIs, or supported behavior that has been removed.

### Deprecated

Used for functionality that remains available but is planned for future removal or replacement.

### Security

Used for meaningful security-related changes or fixes that are appropriate to document publicly.

Not every category needs to appear in every release.

Empty categories should be omitted from finalized release entries.

---

## Unreleased

---

The `Unreleased` section contains notable completed changes that have not yet been included in a public release.

Only work that has actually been completed should be recorded here.

### Added

- Initial project documentation
- Project vision
- Product blueprint
- UI/UX design specification
- Component library
- AI development rules
- Architecture documentation
- Development guide
- Contribution guide
- Testing strategy
- Initial changelog structure
- EAS development, preview, production, and submission configuration
- Added the initial shared design-token foundation for colors, typography, spacing, radii, shadows, opacity, motion, and layout.
- Added an accessible shared Button component with primary, secondary, ghost, destructive, disabled, and loading states
- Added canonical V1 and post-V1 feature-scope documents, including permanent links to the pre-change documentation snapshot
- Added a canonical V1 screen map covering full-screen routes, primary navigation, contextual interfaces, and unresolved implementation decisions
- Added local task and weekly-goal creation, detail, completion, and progress flows.
- Added Home-matched Focus, Analytics, Rewards, Profile, Settings, Task, and Goal screens with accessible empty and loading states.

### Changed

- Renamed the application configuration and package metadata from MyFirstApp to Deep Focus
- Replaced the experimental session setup entry screen with the Phase 0 Deep Focus home  screen
- Simplified web navigation to the active Home route
- Documented `Plan My Day` as required V1 scope and `Break Down This Task` plus `Review My Day Lite` as release-gated V1 targets
- Documented the November 15 scope checkpoint, November 30 beta, December 15 store submission, and January 1, 2027 public-release targets
- Synchronized the Blueprint, UI specification, architecture, and implementation plan with the canonical five-tab V1 navigation model
- Replaced the temporary Home and Explore navigation with a connected five-tab V1 route skeleton and contextual workflow routes
- Canonicalized the shared visual tokens to the Deep Focus navy and mint palette,
  including accessible dark/light theme values and a distinct AI-only lavender accent
- Refined the Home dashboard into a calm, premium zero-state experience with a
  clear session entry point and working quick-action routes
- Added the first timestamp-based Focus Session vertical slice with live timer,
  pause/resume, completion, cancellation, and session summary states
- Added guarded local active-session and history persistence with a recovery route
- Extended the local focus workflow with session-history details, derived analytics, calm milestone progress, and local task/goal progress views.

### Fixed

- Fixed Quick Action and profile links so Tasks and Goals resolve to their list routes instead of the dynamic detail routes.
- Fixed Welcome and authentication links so the onboarding index resolves through its canonical `/onboarding` route.

### Removed

- Removed obsolete Explore, Focus, Summary, and legacy index prototype routes


### Improved

- Improved project documentation structure and consistency
- Refined documentation for maintainability and future scalability
- Strengthened accessibility guidance
- Strengthened privacy and security guidance
- Refined AI behavior and development guidance
- Expanded development and contribution standards
- Expanded testing, compatibility, performance, release, and defect-management guidance
- Synchronized product, UI, component, architecture, data, database, API, security, and testing contracts for proposal-first AI actions, task reminders, subtasks, action accounting, and trusted rewarded unlocks

---

## Release Guidelines

---

Every public release should be represented in this changelog.

Each release entry should include, where applicable:

- Version number
- Release date
- Significant user-visible changes
- Important internal changes
- Added functionality
- Changed functionality
- Meaningful improvements
- Bug fixes
- Removed functionality
- Deprecated functionality
- Security-related updates

Release notes should remain:

- Clear
- Concise
- Accurate
- Factual
- Easy to understand

Changelog entries should describe what changed rather than provide unnecessary implementation detail.

Features that are planned but not completed should not be recorded as released functionality.

---

## Version History

---

Released versions should appear below `Unreleased`.

The newest released version should appear first.

Example:

```text
## [1.0.0] - YYYY-MM-DD

### Added

- Added Feature A.
- Added Feature B.

### Changed

- Updated existing application behavior.

### Improved

- Improved application performance.

### Fixed

- Fixed a notification issue.

### Removed

- Removed deprecated functionality.

### Deprecated

- Deprecated legacy functionality scheduled for future removal.

### Security

- Improved authentication handling.
```

Categories without relevant changes should be omitted.

Release dates should use a consistent format:

`YYYY-MM-DD`

Released entries should not normally be modified after publication except to correct inaccurate information.

Material corrections to historical entries should preserve the accuracy of the project history.

---

## Pre-Release Versions

---

Before Deep Focus reaches its first stable public release, pre-release versions may be used where appropriate.

Examples may include:

- `0.1.0`
- `0.2.0`
- `1.0.0-alpha.1`
- `1.0.0-beta.1`
- `1.0.0-rc.1`

Pre-release identifiers should only be introduced when they provide useful meaning to the development or release process.

The project does not need to create version numbers for every internal development change.

---

## Release Process

---

Before publishing a new release:

- Complete the intended release scope
- Complete appropriate testing and validation
- Resolve release-blocking defects
- Review relevant documentation
- Update the application version where required
- Review the `Unreleased` section
- Move applicable completed entries into the new release section
- Add the release version and date
- Remove empty categories
- Review the changelog for accuracy
- Create the appropriate Git release tag
- Publish release notes where applicable

After creating a release, the `Unreleased` section should remain available for subsequent completed changes.

A public release should represent a version that has completed the verification appropriate to its intended scope.

---

## Release Tags

---

Public release tags should correspond clearly with application versions.

A consistent tag format should be used, such as:

```text
v1.0.0
v1.1.0
v1.1.1
```

Pre-release tags may follow the corresponding version identifier where applicable.

Examples:

```text
v1.0.0-beta.1
v1.0.0-rc.1
```

Tags should reference the commit representing the intended release state.

Release tags should not be created for ordinary documentation or development commits.

---

## Documentation Updates

---

Significant documentation changes may be recorded when they materially affect:

- Project direction
- Product requirements
- Architecture
- Development standards
- Testing requirements
- Contributor expectations
- Security or privacy guidance
- Accessibility requirements
- AI behavior or development rules
- Release processes

Minor editorial changes, formatting corrections, and typo fixes generally do not need individual changelog entries unless they materially change project understanding.

Documentation entries should describe completed documentation changes accurately.

---

## Change Recording Principles

---

Every recorded change should:

- Be accurate
- Represent completed work
- Be concise and understandable
- Describe user-visible impact when applicable
- Describe significant internal or documentation changes when relevant
- Avoid unnecessary implementation detail
- Avoid duplicate entries
- Avoid speculative future functionality
- Use the most appropriate change category
- Remain understandable without requiring commit-history investigation

The changelog should not function as:

- A project roadmap
- A complete commit log
- A task tracker
- A list of every modified file
- A record of insignificant editorial changes

Git history should preserve implementation-level change history, while the changelog should preserve meaningful release-level project history.

---

## Changelog Maintenance

---

The changelog should be updated as meaningful work is completed rather than reconstructed entirely at release time.

Before a release, contributors should verify that:

- Relevant completed changes are represented
- Planned but incomplete work is excluded
- Duplicate entries are removed
- Categories are accurate
- Descriptions reflect actual implementation
- Security-sensitive details are not unnecessarily exposed
- Historical release information remains accurate

Changelog maintenance should remain lightweight and proportional to the scale of the project.

---

## Conclusion

---

This changelog serves as the historical record of significant changes made to Deep Focus.

Maintaining an accurate changelog helps developers, contributors, and future users understand the evolution of the application while improving transparency and release traceability.

A well-maintained changelog should provide:

- Clear version history
- Accurate change records
- Consistent release documentation
- Reliable release notes
- Useful historical context
- Long-term project traceability

The changelog should remain concise, factual, maintainable, and synchronized with completed project work.

As Deep Focus evolves, changelog practices may evolve with the release process while preserving the principles of accuracy, clarity, and meaningful historical documentation.

---
## 2026-10-08

- Connected the native Welcome, Sign In, Create Account and password-recovery
  screens to the persisted English/Sinhala/Tamil locale-copy layer. Added copy
  coverage for each approved locale. This does not claim full app-wide
  translation or accessibility/device acceptance.
- Added a local account-portal password-reset request flow using the public
  Supabase client. Responses do not reveal whether an account exists; private
  app-data sync and provider/runtime review remain pending.
- Connected the native Home screen's greeting, focus hero, paused-session
  recovery, progress labels and quick actions to the approved locale-copy
  layer. Timer and progress calculations remain unchanged.

## 2026-10-09

- Completed the remaining Progress route locale wiring for the weekly focus
  chart, goals heading and session units. Calculations and stored data remain
  unchanged; human translation, accessibility and Android device review are
  still pending.
- Connected the native Goal detail route's states and actions to the approved
  English/Sinhala/Tamil copy layer without changing goal storage, calculations,
  stale-write protection or delete confirmation behavior.
- Connected the native interrupted-session recovery screen to the approved
  English/Sinhala/Tamil copy layer without changing recovery reads or routing.
- Connected Plan My Day confirmed-plan saved and save-failure messages to the
  approved English/Sinhala/Tamil copy layer without changing planning or local
  persistence behavior.
- Added a local Sri Lankan education-metadata validator for bounded O/L, A/L
  and higher-stage context. It does not enable classroom sharing or supply
  teaching materials; those contracts remain review-pending.
- Added a policy-gated local classroom boundary helper: explicit learner
  confirmation creates a private task, while selected progress shares exclude
  focus history, private notes and resources. Server authorization and review
  gates remain pending.
- Added revision-bound, teacher-role-only feedback preparation to the same local
  classroom boundary; it is not server authorization or a release gate.
- Connected the native True Zen Break screen to the approved
  English/Sinhala/Tamil copy layer without changing timing or saved settings.
- Connected the Focus summary's return-home action to the shared locale copy
  without changing session calculations or navigation behavior.
- Connected the active focus-session state and action copy to the approved
  English/Sinhala/Tamil locale layer without changing timer or persistence logic.
### 2026-10-09

- Localized the native authentication callback loading/error state for the
  supported Sinhala, Tamil and English app locales. Provider verification and
  account/backend acceptance remain separate pending gates.
- Added a central age-sensitive access decision: ages 15–17 remain available
  for development, while real-minor classroom pilot/release access requires
  explicit legal review and pilot enablement. Unknown and under-15 states fail
  closed.
- Added a portal-visible account summary download that contains only provider-
  visible status; private app data is excluded while sync is disabled, and
  account deletion remains clearly unavailable until the reviewed server flow
  exists.
- Made the local Plan My Day model label configurable through a bounded build
  setting, with the local mock remaining the default. No OpenAI request,
  credential or paid allowance is enabled by this change.
- Added an isolated OpenAI planning-provider boundary with strict structured
  proposal validation and the same explicit-confirmation requirement. It has no
  network transport, credentials, task mutation or paid usage enabled.
### Backend candidate — owner-bound profile update

- Added a local `patchMe` PostgreSQL candidate with active-account and optimistic-version checks, plus gateway registry wiring and regression coverage. This remains a local `REVIEW_PENDING` candidate; no remote database was changed.

### Backend candidate — authenticated gateway boundary

- Added a local gateway wrapper that verifies the provider token, rechecks the app-session registry, and only then binds the verified owner to gateway admission. Invalid or revoked sessions fail closed without touching owner storage.

### Backend candidate — PostgreSQL sync pull adapter

- Added an owner-bound, bounded and snapshot-transactional `sync_changes` read adapter with signed high-water continuation support and fail-closed row validation. It remains local and `REVIEW_PENDING`.
- Wired the implemented PostgreSQL domain mutation store to append complete owner-bound entity snapshots and advance the owner sequence in the same transaction before writing the mutation receipt.
- Added a versioned local `change_hash` migration and PostgreSQL sync transaction adapter for exact replay, duplicate prevention and changed-replay conflict handling.
- Added a local PostgreSQL usage reservation adapter with locked allowances, replay-safe receipts, consume/release settlement and non-fabricating replay metadata migration.
- Added a local PostgreSQL app-session registry and revocation-outbox adapter with owner/session locking and idempotent outbox enqueue.
- Added a generic server-authoritative entitlement schema and owner-bound reader for AI/cloud capability admission; provider and pricing integration remain isolated and pending.
- Added local PostgreSQL sync gateway handlers that compose signed pull and owner-bound ordered commit adapters.
