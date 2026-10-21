# මුලින් කියවන්න — Deep Focus revision එකේ තත්ත්වය

## 2026-09-30 — Classroom security/test සූදානම

[Reconciliation packet](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
API operations 22 සහ logical tables 11 සඳහා access/integrity rules පැහැදිලි කරනවා.
ප්‍රධාන API/data/security/testing documents වල references ගළපා තිබෙනවා.
Classroom data සඳහා export/retention සීමා සහ isolated SQL test gates වෙන් කර ඇත.
සැබෑ database tests තවම NOT_RUN; independent review PENDING. App/DB වෙනස් නැහැ.

## 2026-09-30 — Classroom API/data contracts

[Wire/data packet](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) තුළ API
operations 22ක් සඳහා request/response schemas, relational data structure සහ
transaction-test සැලැස්ම ඇත. Duplicate requests, access revoke, withdrawal,
lost response සහ private Task recovery වෙන් කර තිබෙනවා. Local schema checks
පමණක් run කළ හැක; database transaction cases 24ම NOT_RUN. App/SQL වෙනස් කර
නැහැ. නිශ්චිත production policy සහ independent review තවම අවශ්‍යයි.

## 2026-09-29 — Classroom sharing සහ release priority

[Classroom implementation packet](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) දැන්
සකස් කර ඇත: කුඩා task cards 8ක්, පරීක්ෂණ අවස්ථා 24ක් සහ ඉතිරි gates 6ක්.
Invitation → assignment → private task → කැමැත්තෙන් progress share → feedback
යන flow එකට offline/retry, duplicate, account switch, revoke/withdraw rules ඇත.
මේවා draft contracts ය; tests 24ම NOT_RUN. App code/SQL හදා නැහැ.
Independent review සහ නිශ්චිත security/legal/retention තීරණ තවම අවශ්‍යයි.

V1 target එකට සීමිත **classroom sharing** ඇතුළත්: private class invitations,
teacherගේ වැඩ විස්තර/deadline, ශිෂ්‍යයා තහවුරු කර private plan එකට එකතු කිරීම,
තෝරාගත් completion/progress share කිරීම සහ teacher feedback. Private timetable,
notes සහ සම්පූර්ණ focus history ගුරුවරයාට පෙන්වන්නේ නැහැ. Full LMS, සාමාන්‍ය
chat හෝ resource-file sharing මෙයින් අනුමත වෙන්නේ නැහැ.

ජනවාරි 1ට අවදානමක් තිබුණොත් features කල් දමා scope අඩු කරන policy එක
අනුමතයි; **තවම කිසිම feature එකක් කපා නැහැ**. අදාළ effort/dependencies සහ
user impact සමඟ වෙනස සටහන් කළ යුතුයි. Security/privacy/accessibility/recovery
සහ අවශ්‍ය review අඩු කරන්නේ නැහැ. Full productivity web පසුවට; Public Website
සහ Account Portal තවම release අවශ්‍යතා වේ. දිනය guarantee එකක් නොවේ.

සාමාන්‍ය design/technical specification තීරණ මට භාර දී ඇත. මුදල් වැය කිරීම,
මිල, legal facts සහ අවශ්‍ය independent review ඔබ සමඟ විසඳිය යුතුයි.
මේක documentation update එකක් පමණයි; classroom app/API/schema හදා හෝ
tests run කර නැහැ. [01](01-REQUIREMENTS-AND-DECISIONS.md) සහ
[32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) නිවැරදි scope එක දක්වයි.

## 2026-09-28 — දැනට වැඩ කරන කොටස සහ අනුමත තීරණ

Timer foundation සඳහා [review packet එක](13-CORE-RELIABILITY-CONTRACTS.md)
තුළ තීරණ 7, failure examples සහ අදාළ ප්‍රධාන docs ගලපන පිළිවෙළ ඇත.
[Test-harness සැලැස්ම](38-TEST-HARNESS-ADMISSION-PLAN.md) වෙනම සකස් කර ඇත;
test files හෝ app fixes තවම කර නැහැ. Independent technical review, නිශ්චිත
adoption සහ පසුව bounded implementation අවසර අවශ්‍යයි. Viewer HOLD එක
timer foundation එකේ documentation වැඩ නවත්වන බාධාවක් නොවේ.

නැවත තෝරාගන්න අවශ්‍ය නැති දේ: ජනවාරි personal-teacher organiser එක,
si/ta/en භාෂා, 15+ desired product target සහ PDF/JPG/PNG ඇතුළු අනුමත
resource direction එක. ඒවා legal eligibility, translations/QA, file limits,
native package හෝ production readiness තහවුරු කළ බවක් නොවේ.
අනුමැතියේ නිවැරදි සීමා [01 register එකේ](01-REQUIREMENTS-AND-DECISIONS.md) ඇත.

## PDF/image viewer — research සහ device-test සැලැස්ම

[Viewer test plan](36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md) සකස් කර ඇත.
දැනට ඇති image library එක සහ PDF සඳහා native wrapper/custom-native/local-web
විකල්ප සසඳා තිබෙනවා. Library එකක් තවම තෝරාගෙන හෝ install කර නැහැ.
Compatibility, privacy, accessibility, memory සහ recovery සඳහා test cases 12ක්
ඇත—සියල්ල NOT_RUN. Size limits තවම final නැහැ; independent review ඉතිරියි.
September 28 update: packages 4ක checksums සහ viewer source files 8ක ගැළපීම
පරීක්ෂා කළා. Plugin permissions, cache/cleanup සහ parser isolation තවම විසඳිය
යුතු නිසා production භාවිතයට HOLD. මෙය app එකේ අලුත් bug එකක් නොවේ.
[Permissions/containment proposal](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md) දැන්
සකස් කර ඇත: preview එක වැසීම, native processing නැවතීම සහ temporary cleanup
වෙන් කර තිබෙනවා. Android/iOS හැකියාවන් එකම ලෙස assume කර නැහැ.
තවත් test refinements 6ක් ඇත; tests කර නැහැ. Qualified review සහ අවශ්‍ය
technical තීරණවලින් පසුව වෙනම අනුමැතියෙන් native tests. App code වෙනස් කර නැහැ.

## Resource formats / viewer — අනුමත direction එක

[Option sheet](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md) දැන් සකස් කර ඇත.
ඔබේ “හා” පිළිතුර අනුව මුලින් PDF, JPG/PNG, website/video links සහ පොත්/page
references; images සහ PDFs app එක ඇතුළේ read-only බලන්න දීම අනුමතයි.
Word/PowerPoint/audio/video files පසුව සලකා බලමු; දැන් ඒවා implement කිරීමක් නැහැ.

Device tests සඳහා ආරම්භක යෝජනා: PDF 25 MiB/පිටු 300, image 10 MiB/24 MP,
local resource budget එක owner කෙනෙකුට 1 GiB. මේවා measured safe limits හෝ
ඔබේ අනුමත policy එක නොවේ; paid-cloud GB plan එකකුත් නොවේ. Exact bytes, ඉතිරි
parser/disk/key/backup gates, iPhone HEIC සීමාව සහ native PDF compatibility/
accessibility tests පැහැදිලිව වෙන් කර ඇත. Probes 8ම NOT_RUN; app code වෙනස් නැහැ.

## 2026-09-26 — අලුත් තොරතුරු සහ local resources

ඔබේ **15+ product target** එක, **ශ්‍රී ලංකාවේ පිහිටුවීමට බලාපොරොත්තු වන
සමාගම හරහා release කිරීම**, සහ **AWS Device Farm + යාළුවන්ගේ Android phones**
testing සැලැස්ම සටහන් කර ඇත. Consent/legal policy, actual company registration,
merchant approval හෝ tests කළ බවක් ඒවායින් තහවුරු වෙන්නේ නැහැ.

Resource-organising අදහස සහ ඉහත මුල් formats/viewing direction එක අනුමතයි;
exact limits සහ PDF adapter තවම තීරණය කර නැහැ. [Local-resource packet](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md)
තුළ add/import/open/replace/remove, account-switch සහ interrupted recovery සඳහා
draft task cards 5ක් සහ NOT_RUN test cases 20ක් ඇත. Original file එක වෙනස් නොකිරීම,
cache එක durable save ලෙස නොසැලකීම සහ failed save එකකට success නොපෙන්වීම
වෙන් කර ඇත. App code/paid services වෙනස් කර නැහැ; independent review ඉතිරියි.

ඊළඟට අවශ්‍ය වන්නේ native viewer compatibility/security විමර්ශනය, exact
limits/backup policy සහ local schema/command contracts ය. මුළු enterprise
documentation එක final build-ready බවක් මේ update එකෙන් කියන්නේ නැහැ.

## 2026-09-25 — එදින release තීරණ (historical checkpoint)

ඔබේ පිළිතුරු පහ සටහන් කර ගළපා ඇත: **Android + iOS + Public Website +
Account Portal**, Sri Lanka O/L/A/L සහ ඊට ඉහළ learning stages, මුල් release එකේ
independent personal-teacher organiser, Sinhala/Tamil/English සහ optional paid
Cloud Resources. Resources local-default ය; subscription එකක් ගත්තත් තෝරාගත්
files පමණක් explicit consent අනුව upload කළ හැක. Full productivity web සහ
class assignment/progress/cohort services එදින පසුවට තැබුවා; bounded classroom
subset එක දැන් ඉහත September 29 record අනුව V1 target එකට ඇතුළත්ය. අධ්‍යාපන මට්ටම තෝරාගැනීම
numeric minimum age/consent policy එකක් අනුමත කිරීමක් නොවේ.

[Release map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) තුළ requirement families
80ම වෙන් කර ඇත. [Paid-cloud packet](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md)
තුළ billing/quota/private upload/recovery සඳහා draft cards 6ක් සහ NOT_RUN cases
20ක් ඇත. App එක හදා හෝ tests run කළ බවක් නොවේ. January දක්වා gross availability
පැය 350–490කි; ඒක delivery guarantee එකක් නොවේ. Exact price/limits/provider
configuration/age policy සහ independent review තවම ඉතිරියි.

පහත dated updates ඒ ඒ වෙලාවේ checkpoint ය; current choices සඳහා ඉහත map සහ
01 register භාවිත කරන්න. මුළු enterprise documentation එක final බවක් නොකියයි.

2026-09-19 ඊළඟ update: ඉතිරි reward/goal-progress/AI API operations හයටත්
[wire contracts සහ strict schemas](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) සකස් කළා.
දැන් draft operations 47ක්; extension inventory එකේ rows 33ම ආවරණය වෙනවා.
ඒ කියන්නේ සියලු V1/enterprise APIs හෝ backend එක ඉවරයි කියන එක නොවේ.
AI generation/revision, actual database/provider implementation සහ policies
තවම ඉතිරියි. අලුත්ම verification evidence `09` audit එකේ ඇත.

2026-09-19: ඔබ දුන් අලුත් engineering-system prompt එක මුලින් විවේචනාත්මකව
[audit කළා](21-ENGINEERING-WORKFLOW-AUDIT.md). දැන් [documentation map](../DOCUMENTATION_MAP.md),
කෙටි AGENTS/AI entry points, risk/STOP/escalation policy, Definition of Done,
වෙනම model-selection policy සහ bounded task template ඇත. කලින් product තීරණ
වෙනස් කළේ නැහැ. මේ governance වැඩේ independent review තවම PENDING;
මම තනියෙම කළ self-review එක ඒ වෙනුවට ගණන් ගන්නේ නැහැ. Docs/contract checks
පහ pass; app/database/security runtime tests කළේ නැහැ. මුළු enterprise package
එක තවම final build-ready තත්ත්වයට පැමිණ නැහැ.

අලුත්ම continuation: [ඉතිරි backend contracts](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md)
සහ [Website/Portal runbook](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) සකස් කර ඇත.
කරපු දේ සහ තවම අවශ්‍ය තීරණ එකම තැනක: [Readiness sheet](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md).
මේක production implementation/test completion කියන එක නොවේ.

[Safety/commitment contract](19-SAFETY-AND-COMMITMENT-CONTRACT.md) එකත් දැන් ඇත:
ordinary/Emergency exit, save failure/recovery, no-XP-penalty සහ truthful claims
සඳහා task cards 4ක් සහ NOT RUN test scenarios 20ක්. පරණ Focus Bet stake/loss
නීති සහ positive burnout-component examples අදාළ canonical docs වල ගලපා ඇත.
Exact defaults/interaction සහ release inclusion තවම proposals/decisions ය.

[Settings/progress/unit contract](20-SETTINGS-PROGRESS-AND-UNITS.md) තුළ දැනට
app එකේ තියෙන defaults, පැරණි UI examples සහ තවම තීරණය කළ යුතු XP/day rules
වෙන් කර ඇත. Task cards 5ක් සහ NOT RUN cases 24ක් ඇත. Account-only settings සහ
analytics zero/unavailable responses සඳහා strict schema examples එකතු කළා;
මේවා app/backend implementation හෝ final reward formula එකක් නොවේ.

September 18 wire-contract update: [API extension slice](contracts/personal-extensions.openapi.json)
එකෙන් තවත් operations 12ක් පැහැදිලි කළා: goal edit/delete, task delete,
settings, break history, reminders සහ analytics. කලින් core 14ත් සමඟ draft
operations 26ක් එම checkpoint එකේ තිබුණා. ඊළඟ [operations slice](contracts/operations-api.openapi.json)
එකෙන් sync, export/deletion, account sessions සහ billing visibility operations
15ක් එකතු කළා: දැන් draft operations 41ක්. Deletion response එක නැති වුණත්
status ලබාගැනීම, sync අතරමඟ නතර වීම සහ subscription තත්ත්වය නොදන්නා විට
වැරදි තොරතුරු නොපෙන්වීම සඳහා contracts ඇත. තවත් reward/goal-progress/AI
operations 6ක wire outputs එම checkpoint එකේ ඉතිරිව තිබුණා; දැන් ඒවා `22` තුළ
ඇත. සැබෑ database/security tests සහ final policies තවම ඉතිරියි. API එක deploy/run
කළේ නැහැ; security-sensitive details තවම review proposals.

අලුත්ම policy update: XP penalties සහ තහවුරු නොකළ health predictions නැහැ.
Limited free AI + optional paid AI add-on අනුමතයි; මිල සහ allowance පසුවයි.
මුල් release එකේ කරදරකාරී නොවන ads තිබිය යුතුයි; focus/True Zen Break අතරතුර
ads නැහැ. Exit behaviour කලින් Settings වලින් තෝරාගැනීමේ direction එක අනුමතයි;
September 17 තීරණය: සාමාන්‍ය End early අක්‍රිය කළත් වෙනම Emergency exit තිබෙනවා.
එහි exact interaction සහ session අතරතුර setting වෙනස් කිරීමේ නීති තවම OPEN.
මේ තීරණවලට අදාළ canonical AI paragraphs ගලපා ඇත; implementation කර නැහැ.

2026-09-14. මෙය ඔබට review කරන්න සකස් කළ research-backed draft package එකයි. මම තනියෙම කළා; වෙන agents භාවිත කළේ නැහැ. App code, backend accounts, payments හෝ deployment වෙනස් කරලා නැහැ.

Update: ඔබ Supabase PostgreSQL/Auth සහ Next.js Website/Portal selection එක අනුමත කළා. ඒ තීරණය දැන් register සහ canonical architecture/security references වල සටහන් කර තිබෙනවා. Hosting, වෙනත් product/legal තීරණ සහ අවසාන contracts තවම ඉතිරියි.

2026-09-15 update: January Website/Portal, පැය 25–35/week සහ නැවත විවෘත කළ
documentation phase එක පරණ scope/plan එකට ගලපා ඇත. [Core contract](13-CORE-RELIABILITY-CONTRACTS.md)
තුළ transitions, save failure/retry, recovery සහ migration සඳහා නිශ්චිත
උපදෙස්, subcards 6ක් සහ scenarios 20ක් ඇත. Current engine එකේ read-only checks
8න් 3ක් pass; පවතින gaps 5ක් නැවත තහවුරු වුණා. ඒ bugs fix කළේ නැහැ.
මුළු package එක තවම final build-ready documentation එකක් නොවේ.

## මගේ ප්‍රධාන නිර්දේශය

2026-09-16 update: Edge Functions, Expo SQLite/SecureStore සහ අලුත් navigation
direction එක අනුමත ලෙස සටහන් කර ඇත. [Backend contract](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md)
තුළ API operations 14ක් සහ SQL prototype tables 9ක් ඇත; production backend
එකක් run/deploy කර නැත. [UI build contract](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md)
තුළ onboarding/භාෂා/motivation flows සහ colour proposals ඇත. Exact colours,
January feature freeze සහ ඉතිරි product/legal decisions තවම අවසන් නැත.

අලුත් තීරණය පැහැදිලියි: අපි පාඩම් videos, papers, notes හෝ වෙනත් teaching materials සපයන්නේ නැහැ. Student සහ teacher තමන්ගේ resources/work organise කරගන්නවා. Teacherට class preparation, marking සහ scheduling තමන්ටම භාවිත කළ හැක; cohort එකක් අනිවාර්ය නැහැ. Resources සඳහා local default සහ optional paid cloud ජනවාරි release placement එක අනුමතයි. මිල, GB limits සහ production acceptance තවම තීරණය/තහවුරු කර නැහැ.

Deep Focus එකේ මිනිස්සු ගෙවන්න කැමති වෙන වෙනස, timer එකට තවත් buttons ගොඩක් එකතු කිරීම නොවිය යුතුයි. **වැඩක් සැලසුම් කරලා, අවධානය රැකගෙන, ප්‍රතිඵලයක් ලබාගෙන, බාධාවකින් පසුව පහසුවෙන් නැවත පටන් ගන්න පුළුවන් system එකක්** හදමු. ඒ core එකට Personal/Professional සහ Education workflows ගලපමු.

මුල් differentiation prototype එකට මම නිර්දේශ කරන්නේ Return Ticket, Outcome Receipt සහ realistic Capacity Planning. Sri Lanka education context එකත් වැදගත්. ඒත් මේවා “ලෝකයේ වෙන කිසිම app එකක නැහැ” හෝ “කට්ටිය අනිවාර්යයෙන් ගෙවනවා” කියලා research එකෙන් තහවුරු වී නැහැ. ඒකට target-user testing අවශ්‍යයි.

## මේ package එකේ දැන් තියෙන්නේ

- ඔබේ chat තීරණ, පැරණි docs සහ research ideas එකතු කළ requirement/capability families **80ක register එකක්**. ඒ කියන්නේ features 80ක් implement කරලා කියන එක නොවේ.
- කලින් කළ **apps 20ක features/reviews research** එක, brand reference එක සහ repository audit එක. අලුත් research එකෙන් backend, payments, education, psychology, integrations සහ security decisions පරීක්ෂා කළා.
- Optional onboarding, defaults/redo, language/country-pack වෙන් කිරීම, personal motivation phrases, UI/navigation, professional/education expansion සහ focus-safe collaboration contracts.
- Backend ownership/security/sync, Website/Account Portal, modular monetization සහ AI/provider connection designs.
- Luna Medium සඳහා bounded task template, current defects සඳහා නිශ්චිත test fixtures, build order සහ testing/publishing gates.
- Sri Lanka students/teachers ගැන අමතර cited research එකක්: official 2025 school/device evidence, local learning alternatives සහ historical reviews, school/tuition/revision workflow, teacher value සහ bounded pilot proposal. ඒ මත education subcards 10ක් සහ acceptance scenarios 18ක් සකස් කර ඇත; tests run කළ බවක් නොවේ.
- [Own-resource workflow](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md): local import/recovery, student/teacher task planning, optional paid-cloud consent/quota rules, R cards 6ක් සහ test scenarios 16ක්. [Cloud cost model](06-MONETIZATION-AND-ENTITLEMENTS.md) තුළ storage පමණක් නොව downloads, operation costs සහ net subscription receipts ගලපා ඇත; final price එකක් නියම කර නැහැ.

මුළු package එකට යන්න: [Read order](README.md). වැඩිපුරම market විස්තර: [Sinhala research report](evidence/Deep-Focus-Market-Research-SI.md). අලුත් තීරණවල සාක්ෂි: [Research addendum](02-RESEARCH-AND-RECOMMENDATIONS.md).

ලංකාවේ පැත්තට: [Student/Teacher strategy සහ research](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md), [Luna education contracts](11-SRI-LANKA-EDUCATION-CONTRACTS.md). Deep Research සහ PDF skills අනුව facts/recommendations වෙන් කර, වැදගත් official PDF tables සහ Gazette page එක visually පරීක්ෂා කළා. Direct student/teacher interviews හෝ real-user pilot තවම සිදුකර නැහැ.

## January 1 ගැන පැහැදිලි තත්ත්වය

**Mobile app + Public Website + Account Portal** January 1, 2027 target එකේ තිබෙනවා. Full productivity Web App එක පසුව; ඒක හදන architecture/task map එක දාලා තියෙනවා. Education launch එක Sri Lanka සඳහායි; General/Custom mode සහ global-ready structure රඳවාගෙන තියෙනවා.

2026-09-14 planning snapshot එකේ, පැය 25–35/week අනුව January දක්වා gross capacity එක පැය 389–545 පමණ වුණා. ඒ snapshot එකේ draft release work estimate range එක පැය 405–700. මේවා planning estimates; අද ඉතිරි පැය ගණනක් හෝ Lunaගේ වේගය ගැන සහතිකයක් නොවේ. ඒ නිසා enterprise vision එක සම්පූර්ණයෙන් සැලසුම් කළත් ඒ සියල්ල January එකට දාන්න පොරොන්දු වීම සාධාරණ නැහැ. [Capacity සහ release plan](08-VERIFICATION-AND-RELEASE.md) තුළ ඒ සීමාව පැහැදිලිව තිබෙනවා.

## තවම අවසන් නොකළේ මොනවාද?

September 18 capacity update එකේ January 1 දක්වා සති 15ක් / gross පැය 375–525ක්
තිබෙනවා. මේක availability arithmetic පමණයි; වැඩ ඉවර වෙන බවට සහතිකයක් නොවේ.
ඔබ ඉල්ලූ unobtrusive launch ads සඳහා වෙනම release gate එකක් දැන් ඇත. Ads
implementation/consent/testing සහ cloud storage පරණ estimate එකෙන් ආවරණය
වුණා කියලා ගන්නේ නැහැ; selected scope එකට නැවත estimate කළ යුතුයි.

**පැරණි canonical documents සියල්ල rewrite කරලා, මුළු enterprise app එකම Lunaට decisions නැතුව build කරන්න පුළුවන් final specification එක තවම ඉවර නැහැ.** ඒ බව මම හංගන්නේ නැහැ. Provider-specific migrations/security policies, exact numeric rules සහ හැම future subfeature එකේම executable task cards සඳහා පහත තීරණ අවශ්‍යයි.

| මුලින් තීරණය කරන කොටස | මගේ recommendation / අවශ්‍ය තොරතුරු |
| --- | --- |
| Backend සහ web stack | Supabase PostgreSQL/Auth/Edge Functions සහ Next.js Website/Portal APPROVED. Next.js hosting සහ exact deployment configuration තවම OPEN |
| Local persistence/testing | Expo SQLite + SecureStore APPROVED; exact adapters, Expo 56 real-build/migration proof සහ test tooling ඉතිරියි |
| Brand/behaviour | Blue/navy/coral සහ Home/Plan/Focus/Progress/Profile APPROVED; Rewards Progress ඇතුළේ. XP penalties/health predictions නැහැ. Ordinary End early අක්‍රිය කළත් Emergency exit තිබෙනවා. Exact tokens/exit interaction සහ in-session settings නීති ඉතිරියි |
| January product/monetization | Limited free AI + optional paid AI සහ unobtrusive launch ads APPROVED. Allowance/prices පසුව; ad format/provider/placement/age rules සහ exact January feature slice ඉතිරියි |
| Education/languages | Own-resource General/custom organiser මුලින්; optional curriculum metadata pilot/medium/edition වෙනම තීරණයක්. Teaching materials සපයන්නේ නැහැ. Launch locales සඳහා qualified review අවශ්‍යයි |
| Production/legal facts | Minimum age/consent, business country සහ merchant eligibility, data region/retention/restore objectives. සමහර දේවල් current legal/provider review අවශ්‍යයි |

මුදල් budget එක දැන්ම ඔබෙන් ඉල්ලන්නේ නැහැ. ඒත් merchant eligibility නොදැන paid checkout එක production-ready කියන්න බැහැ. Password/API keys chat එකේ දෙන්න අවශ්‍ය නැහැ.

## ඊළඟ වැඩේ

Latest September 19 checkpoint: [Daily plan/API contract](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md)
එකෙන් ordered focus blocks/breaks/reminders සහ generation/recovery/revision wire
එකතු කර ඇත. Draft API operations දැන් 52යි; පහත 47 සටහන කලින් checkpoint එකයි.
Plan save කිරීමෙන් XP/session completion ලැබෙන්නේ නැහැ. Database/sync/privacy
integration සහ independent/runtime verification තවම ඉතිරියි.

September 19 continuation: [AI generation/recovery/revision](23-AI-GENERATION-RECOVERY-AND-REVISION.md)
contract එකේ connection loss, cancel/completion race, allowance reservation සහ
manual edit සඳහා නැවත charge නොකරන නීති සකස් කර ඇත. Reference checker එක actual
backend/security test එකක් නොවේ. Strict generation API සහ focus-block/break schedule
contracts තව ඉතිරියි; OpenAPI operations ගණන තවම 47යි. App code වෙනස් කර නැහැ.

[Decision register](01-REQUIREMENTS-AND-DECISIONS.md) එකේ approved stack එක අනුව canonical reconciliation ඉදිරියට ගෙන යනවා; ඉතිරි material decisions වෙන් කරලා තියෙනවා. එක තීරණයක් අදාළ files සියල්ලටම යන විදිහ [coverage map](09-COVERAGE-AND-AUDIT.md) එකේ තිබෙනවා. දැනටමත් අනුමත කළ stack එක නැවත අනුමත කරන්න අවශ්‍ය නැහැ.

Deep Research skill එක නිසා facts/reviews/recommendations වෙන් කරලා citations සහ limitations තබා ගත්තා. OpenAI Docs skill එකෙන් Lunaට දෙන task context, constraints සහ verification handoff පැහැදිලි කළා. ඒ දෙකෙන්ම “bugs නැති app එකක් guarantee” කරන්නේ නැහැ; ඒ වෙනුවට වැරදි හඳුනාගෙන release එක නවත්වන්න පුළුවන් පරීක්ෂණ ක්‍රමයක් දාලා තියෙනවා.
