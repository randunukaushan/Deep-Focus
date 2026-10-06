# Deep Focus — Evidence සහ Repository Audit

මෙය [ප්‍රධාන Sinhala research report](<./Deep-Focus-Market-Research-SI.md>) සඳහා supporting ledger එකකි. Research snapshot: 2026-09-13. මෙහි coverage, limitations සහ verification පිළිබඳ handoff සටහන් ඇත.

## 1. Scope සහ authorization boundary

මුල් අදහස, repository documents, current implementation, changelog සහ public market evidence විමර්ශනය කර ඇත. Research recommendations implementation authorization ලෙස සලකා නැත. Application code, approved docs, dependencies, git history හෝ userගේ pending edits වෙනස් කර නැත. අවසාන විමර්ශනය සහ synthesis තනිවම සිදු කර ඇත.

Local checkout: C:/Users/User/Documents/ChatGPT/Deep Focus. Branch main; HEAD a6a481e. Configured remote: [randunukaushan/Deep-Focus](https://github.com/randunukaushan/Deep-Focus). Remote freshness, remote write permission හෝ deployed app access තහවුරු කර නැත.

Preserved existing modifications:

- [home-screen.tsx](<../../../src/features/home/home-screen.tsx>)
- [tokens.ts](<../../../src/theme/tokens.ts>)

## 2. Document coverage register

පහත docs directory හි ගොනු 18 සම්පූර්ණයෙන් කියවා ඇත; headings-only search එකක් මත scope තීරණය කර නැත. විශාල documents chunked reading මගින් කියවා truncated portions නැවත කියවා ඇත. Documents implementation state සඳහා තනි සාක්ෂියක් ලෙස භාවිත කර නැත.

| Document | විමර්ශනයට වැදගත් දේ |
| --- | --- |
| [AI_RULES.md](<../../../docs/AI_RULES.md>) | mandatory workflow, scope, safe AI සහ user control |
| [PROJECT_VISION.md](<../../../docs/PROJECT_VISION.md>) | calm, sustainable productivity mission |
| [BLUEPRINT.md](<../../../docs/BLUEPRINT.md>) | product domains සහ planned experience |
| [V1_FEATURE_SCOPE.md](<../../../docs/V1_FEATURE_SCOPE.md>) | approved V1 versus optional/conditional work |
| [POST_V1_FEATURE_SCOPE.md](<../../../docs/POST_V1_FEATURE_SCOPE.md>) | deferred platform/features සහ scope boundaries |
| [V1_IMPLEMENTATION_PLAN.md](<../../../docs/V1_IMPLEMENTATION_PLAN.md>) | dependency order, release gates සහ target dates |
| [V1_SCREEN_MAP.md](<../../../docs/V1_SCREEN_MAP.md>) | 5-tab structure, required/conditional routes |
| [ARCHITECTURE.md](<../../../docs/ARCHITECTURE.md>) | layers, provider boundaries සහ feature ownership |
| [DEVELOPMENT_GUIDE.md](<../../../docs/DEVELOPMENT_GUIDE.md>) | local tooling, conventions සහ implementation workflow |
| [CONTRIBUTING.md](<../../../docs/CONTRIBUTING.md>) | review, commits සහ change discipline |
| [UI_UX_DESIGN_SPECIFICATION.md](<../../../docs/UI_UX_DESIGN_SPECIFICATION.md>) | full session/break flow, tokens, states සහ accessibility |
| [COMPONENT_LIBRARY.md](<../../../docs/COMPONENT_LIBRARY.md>) | reusable patterns, interaction states සහ examples |
| [DATA_MODEL.md](<../../../docs/DATA_MODEL.md>) | lifecycle, goal periods, task identity සහ derived progress |
| [DATABASE_SCHEMA.md](<../../../docs/DATABASE_SCHEMA.md>) | ownership, constraints සහ transaction expectations |
| [API_SPEC.md](<../../../docs/API_SPEC.md>) | contracts, idempotency, proposals සහ grant handling |
| [SECURITY.md](<../../../docs/SECURITY.md>) | secure credentials, privacy, minimal AI context, deletion/export |
| [TESTING_STRATEGY.md](<../../../docs/TESTING_STRATEGY.md>) | lifecycle, persistence, a11y, security සහ release verification |
| [CHANGELOG.md](<../../../docs/CHANGELOG.md>) | recorded changes versus template/planned language |

Root README සහ CLAUDE.md ද කියවා ඇත; AGENTS.md instructions අදාළ කර ඇත. [F:/.txt](F:/.txt) මුල් අදහස සම්පූර්ණයෙන් කියවා, historical product input ලෙස සලකා ඇත. Supplied images දෙක [brand memo](<./Brand-Reference.md>) හි සටහන් කර ඇත.

### Document conflicts / drift

| ස්ථානය | ගැටලුව | නිර්දේශය; මෙහි වෙනස් කර නැත |
| --- | --- | --- |
| README vs implementation checklist | Phase 0 complete / Phase 1 ongoing, නමුත් overall checklist unchecked | acceptance evidence සමඟ status align කරන්න |
| UI §9.12 vs code | required duration පසු පමණක් completed; code early Complete ඉඩදෙයි | canonical completion semantics ක්‍රියාත්මක කරන්න |
| UI canonical lifecycle vs Component §21.34 example | completed → optional break → summary සහ focus → summary → break ordering වෙනස | specific canonical rule අනුව example cleanup owner review කරන්න |
| UI auth sections | සමහර “if enabled” wording සහ explicit required V1 auth | canonical V1 scope අනුව wording reconcile කරන්න |
| Component examples | BurnoutRiskCard/percentage-like examples සහ non-medical/no false precision rules | illustrative legacy examples implementation permission ලෙස නොගන්න |
| UI splash example vs supplied brand | “Focus with Purpose” සහ “Focus on What Matters.” | owner-approved canonical tagline භාවිත කරන්න |
| Approved mint tokens vs brand/current edits | mint / blue-coral / blue-slate sources තුනක් | explicit brand token decision එකක් ගන්න |
| Architecture/idea Focus Bet vs mission | virtual staking language සහ no-gambling/non-pressure principles | punitive stake mechanism නොගන්න; owner clarification අවශ්‍යය |
| Changelog | duplicate Unreleased/template-style sections | recorded completed changes සහ template guidance පැහැදිලිව වෙන් කරන්න |

## 3. Code coverage සහ changelog cross-check

Route files, focus engine/hooks/storage/types/history, tasks/goals/settings modules, home screen, shared components/hooks/theme, app/package/TypeScript/lint configuration සහ scaffold script කියවා ඇත. Generated dependency sources හෝ package-lock.json එකේ සෑම line එකක්ම human-read කළ බවක් නොකියමි. Dependency metadata සහ actual package configuration පරීක්ෂා කර ඇත. Asset binary internals code ලෙස audit කර නැත.

| Area | Local references | තත්ත්වය / සීමාව |
| --- | --- | --- |
| Focus | [engine](<../../../src/features/focus/session-engine.ts>), [hook](<../../../src/features/focus/use-focus-session.ts>), [storage](<../../../src/features/focus/session-storage.ts>) | timestamp base හොඳයි; hydration/serialization/error boundaries incomplete |
| Focus routes | [setup](<../../../src/app/focus/setup.tsx>), [session](<../../../src/app/focus/session.tsx>), [break](<../../../src/app/focus/break.tsx>), [recovery](<../../../src/app/focus/recovery.tsx>), [summary](<../../../src/app/focus/summary.tsx>) | early completion, clear-before-append, taskName loss, break persistence gaps |
| Tasks | [task types](<../../../src/features/tasks/task-types.ts>), [storage](<../../../src/features/tasks/task-storage.ts>), task routes | local CRUD; stable session-task relationship incomplete |
| Goals | [goal types](<../../../src/features/goals/goal-types.ts>), [progress](<../../../src/features/goals/goal-progress.ts>) | createdAt lower-bound only; period semantics incomplete |
| Auth/onboarding | auth routes, assessment/productivity-profile routes | forms/flows present; real identity/provider and persisted personalization absent |
| Planning | [plan-my-day.tsx](<../../../src/app/plan-my-day.tsx>) | deterministic 25+5 planning; no actual AI/proposal/grant implementation |
| Settings | [settings-storage.ts](<../../../src/features/settings/settings-storage.ts>), profile/settings route | break-duration persistence; full preferences/notifications not done |
| Progress | tabs analytics/rewards, history routes, session-history module | local totals/basic milestones; not full XP/streak analytics system |
| UI foundation | components, hooks, theme, global CSS | role/busy/touch patterns partly present; real-device a11y not verified |
| Configuration | [package.json](<../../../package.json>), app.json, tsconfig.json, ESLint config | Expo 56 stack; no test script; app version 1.0.0 is metadata only |

Native storage functions web platform සඳහා no-op/empty fallback paths භාවිත කරයි. එබැවින් web preview එකේ persistence තිබෙන බව කියන්න බැහැ. Native JSON storage එක පමණක් තිබීම trusted backend ownership, multi-device synchronization හෝ security certification නොවේ.

Recent local commit trail:

| Commit | Date | Recorded change |
| --- | --- | --- |
| a6a481e | 2026-09-11 | persist settings and expose recovery |
| 7c88631 | 2026-09-11 | onboarding and focus support flows |
| 5c3ef65 | 2026-09-11 | expanded local productivity flows |
| 8a9ceee | 2026-09-10 | greeting and time-based atmosphere |
| b7a765a | 2026-09-10 | home light theme/compact layout |
| 274cb1e | 2026-09-09 | local focus history experience |
| 0c55d79 | 2026-09-09 | completed progress on home |
| 73075fd | 2026-09-09 | focus session flow/home navigation |
| 8258539 | 2026-09-09 | navigation and home foundation |
| 642e23b | 2026-09-09 | focus start→setup |
| ac58241 | 2026-08-31 | primary logo asset |

## 4. Verification

Initial npx --no-install tsc --noEmit සහ npm run lint attempts shell PATH තුළ npx/npm නොමැති නිසා ධාවනය නොවීය. පසුව තිබෙන bundled Node runtime සහ project-local packages භාවිත කර checks අවසන් කළා. Working directory එක repository root ය. Runtime: C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe.

| Actual command arguments to bundled Node | Result |
| --- | --- |
| ./node_modules/typescript/bin/tsc --noEmit | Exit 0; TypeScript errors නැත |
| ./node_modules/eslint/bin/eslint.js . | Exit 0; errors 0, warning 1 |

Lint warning එක generated .expo/types/router.d.ts:1 හි unused eslint-disable directive එකකි. No --fix භාවිත කළේ නැත; generated file වෙනස් කර නැත. Direct ESLint result එක npm run lint / Expo wrapper ධාවනය කළ බවට claim එකක් නොවේ. TypeScript/lint pass වීම lifecycle, persistence, security හෝ real-device correctness සනාථ නොකරයි.

Automated behavior tests, expo-doctor, iOS/Android build, emulator/device runs, screen-reader/large-text checks, performance/battery profiling, security penetration tests සහ live backend checks මෙහි සිදු කර නැත. Dependencies install/update කර නැත. Static findings reproduced runtime incidents ලෙස ඉදිරිපත් කර නැත.

## 5. Review evidence ledger

පහත records main report එකේ review themes සඳහා author/date anchors ය. Public profile names මත identity verification කළ බවක් නොවේ. “Historical”, “developer fixed”, “disputed” සහ “relative age” labels current-defect claims වැළැක්වීමට යොදා ඇත. Exact individual-review permalink නොලැබුණු තැන්වල source review page + author/date භාවිත කර ඇත. Text paraphrases පමණි.

| App / source | Examined review anchors | Evidence caution |
| --- | --- | --- |
| [Forest — Play](https://play.google.com/store/apps/details?id=cc.forestapp) | August Jones, 2026-09-02: friends/gifting; John Soria, 2025-04-21: coins/tree controls; Tiffany King, 2025-02-26: restore/crash | last two historical; complaints not reproduced |
| [Focus To-Do — Play](https://play.google.com/store/apps/details?id=com.superelement.pomodoro) | Mariya Merkley, 2026-09-03: daily utility; Doug Osgood, 2025-01-24: batch operations; XX Li, 2026-06-14: widget/task attribution | lifetime purchase review ≠ universal current offer |
| [TickTick — Play](https://play.google.com/store/apps/details?id=com.ticktick.task) | Nya, 2025-08-13: sounds; Don Boothby, 2025-07-15: control discoverability; Shonda Filley, 2026-09-06: reminders/grocery request | grocery request intentionally not adopted |
| [Todoist — Play](https://play.google.com/store/apps/details?id=com.todoist) | Jonathan Blaine, 2024-12-21: capture/repetition; Christine Muller, 2026-06-16: lean pricing tier | old reminder-paywall claim not treated as current; official pricing cross-check |
| [Focus Plant — Play](https://play.google.com/store/apps/details?id=com.shikudo.focus.google) | Angela Schuh, 2025-01-27: start motivation; Sarah Decoteau, 2024-11-17: complexity/pause; Miriam Erickson, 2022-07-03: minimal version | 2022 example only illustrates game overhead risk |
| [Freedom — Play](https://play.google.com/store/apps/details?id=to.freedom.android2) | Jon Kotowski, 2026-08-28: battery; Joshua Toeppe, 2026-07-07: filtering; Alanna Daniels, 2026-08-17: schedules | developer says schedule fix 7.14.1 on 2026-08-20 |
| [Opal — Play](https://play.google.com/store/apps/details?id=com.withopal.opal) | D D, 2026-08-30: overlay; D Marco, 2026-08-30: YouTube category; Kate, 2026-06-11: shorter delay | overlay toggle exists; category issue acknowledged |
| [one sec — Play](https://play.google.com/store/apps/details?id=wtf.riedel.onesec) | Michelle Stewart, 2025-06-10: repeated friction; Jamie Volle, 2025-07-03: free features; Caroline, 2023-01-30: blocking | free-feature claim disputed; Caroline issue historically fixed |
| [ScreenZen — Play](https://play.google.com/store/apps/details?id=com.screenzen) | Megan B, 2026-05-04: free controls; Cody Whitlock, 2025-03-12: keyword request; Tushar Pankaj, 2025-01-17: unlock/diagnostics | developer later states unlock fix |
| [AppBlock — Play](https://play.google.com/store/apps/details?id=cz.mobilesoft.appblock) | Quincy Rogers, 2026-08-28: escape settings; David B, 2026-07-30: one-time purchase; Greg Colvin, 2026-06-26: setup/support | lifetime option exists per reply; no confirmed exploit |
| [RescueTime — Trustpilot](https://www.trustpilot.com/review/www.rescuetime.com) | Juil Yoon, 2025-10-15: historical data; David Treece, 2025-11-28: complexity; Dmitry, 2026-05-21: payment disclosure | small sample, self-selection |
| [Rize — G2](https://www.g2.com/sellers/rize), [feedback](https://feedback.rize.io/) | Amanda H, 2026-09-08: support/classification; Haider S, 2026-09-04: tracking; Kayden Emerson, displayed 8 days ago: multi-window rules; Edi Bouazza, 9 days ago: Linear ID search | small G2 sample; board ages not exact dates; monitor claim not engine proof |
| [Session — US](https://apps.apple.com/us/app/session-pomodoro-focus-timer/id1521432881), [Canada](https://apps.apple.com/ca/app/session-pomodoro-focus-timer/id1521432881?platform=iphone&see-all=reviews) | schrutefarms9000, 2025-10-10: workflow; LeoofSparta, 2024-09-08: click count; franciscoyira, 2025-12-10: stability | legacy requests do not establish current missing platforms |
| [Sunsama — Product Hunt](https://www.producthunt.com/products/sunsama/reviews?review=925095) | Neo, 9 months ago: ritual; Seher Mohsin, 3 months ago: mobile/integration; Andrei Popov, 3 years ago: cost/desktop | relative ages as displayed; selected reviewer population |
| [Motion — Trustpilot](https://www.trustpilot.com/review/www.usemotion.com) | Kate Haranis, 2026-04-01: capture/configuration; Greg Campbell, 2026-03-21: organization; Dina Rom, 2026-03-15: data/account allegation | allegation is not legal finding |
| [Focusmate — Trustpilot](https://www.trustpilot.com/review/www.focusmate.com), [Product Hunt](https://www.producthunt.com/products/focusmate/reviews) | Virginia Brown, 2026-09-04: accountability; Emily Munyard, experience 2026-08-10: support; Ryan Denman, 2026-07-14: connection; TC, 3 years ago: matching/language | experience/update dates distinct; older request not verified current absence |
| [Flow Club — Product Hunt](https://www.producthunt.com/products/flow-club?launch=flow-club-lounge), [Reddit](https://www.reddit.com/r/adhdwomen/comments/1ljkysi/any_discounts_or_alternatives_to_flow_club_loved/) | Kevin Griffin, 3 years ago: music; Suzanne Hanks, 2 years ago: group format; Ok-Drag8062, 2025-06-24: affordability | Reddit later update reports joining; host relationships considered |
| [Brain.fm — Trustpilot](https://www.trustpilot.com/review/brain.fm) | Silas, 2026-08-09: player/support; Seth Games…, 2026-08-12: subjective benefit; Craig E, updated review: browser friction | Craig date unavailable here; environment confound; no efficacy inference |
| [Endel — Play](https://play.google.com/store/apps/details?hl=en&id=com.endel.endel) | Jeremy G, 2026-07-26: UI/upsell; Matt G, 2026-06-25: loops/cost; K Anderson, 2026-06-09: subjective benefit | experience not clinical evidence |
| [Structured — Play](https://play.google.com/store/apps/details/Structured_Daily_Planner?hl=en-US&id=io.unorderly.structured) | Izz Bella, 2026-09-02: free value; Fernanda, 2026-07-22: recurring tasks; Google User, 2024-11-21: reminder tier | developer distinguishes basic free vs custom paid |

මෙහි main-profile evidence සඳහා review/feedback anchors 61ක් ඇත. මෙය apps වල සියලු reviews ගණන නොවේ; accessible purposive sample එකකි. අමතර reviews/developer replies context සඳහා කියවා ඇති නමුත් exhaustive corpus analysis කළ බව නොකියමි.

### වැරදි නිගමන වළක්වාගත් තැන්

- Focusmate no-show Reddit thread එකක පසුව account verification issue resolved බව update විය; එය platform-wide partner shortage බවට භාවිත කර නැත.
- Product Hunt හි Focusmate former-intern relationship සහ Flow Club user/host relationship වැනි affiliations independent endorsements ලෙස නොගත්තෙමි.
- Rize හි seller-invited review එකක් unqualified independent user evidence ලෙස ගෙන නැත; main examples වෙනම organic/validated labels සහිත records ය.
- Brain.fm Trustpilot supplement/product-mix-up review එක relevant app defect ලෙස නොගත්තෙමි.
- Developer “fixed” reply එක independent retest නොවේ; “developer reports fixed” ලෙසම සලකා ඇත.
- Old price/reminder complaints current official feature table එකට විරුද්ධ නම් current table එක ප්‍රමුඛ කර ඇත.

## 6. Research limits සහ confidence

**Higher confidence:** local static code observations; supplied image identity; approved-vs-implemented distinction; exact official feature/platform statements access date දිනට.

**Moderate confidence:** sample එක තුළ recurring qualitative themes. Review pages curated/region-dependent විය හැක; bugs different versions/devices මත වෙනස් වේ. Review authorsගේ purchase history/identity බාහිරව verify කර නැත.

**Hypothesis only:** Return Ticket differentiation, willingness to pay, enterprise demand, new feature retention effects, future trend status. “Nobody has built this”, market-share forecasts හෝ clinical efficacy claims නැත.

**Not covered:** complete market census, representative review sentiment statistics, all localized prices, live product hands-on trials for all 20, full prior-art/trademark/legal clearance, paid enterprise procurement interviews, production security audit. Some research publisher pages had access/correction gaps; unsupported quantitative audio claims omitted.

## 7. Handoff

Created artifacts පමණක්:

- [Deep-Focus-Market-Research-SI.md](<./Deep-Focus-Market-Research-SI.md>) — Sinhala/English-technical report, 20 profiles, strategy සහ linked sources.
- [Evidence-and-Repository-Audit.md](<./Evidence-and-Repository-Audit.md>) — coverage, evidence anchors සහ verification limits.
- [Brand-Reference.md](<./Brand-Reference.md>) — original logo/light-dark reference and conflicts.

Next approved implementation step: Phase 1 foundation acceptance/status එක පළමුව තහවුරු කර, approved authentication/user foundation සහ reliable focus vertical slice dependency order අනුව ඉදිරියට යන්න. Early completion සහ durable-save risks ඒ slice එකේ priority acceptance items කරගන්න. Research idea එකක් V1 තුළට ගෙන ඒමට owner scope approval වෙනම අවශ්‍යය.


