# Deep Focus: ශ්‍රී ලංකාවේ Student සහ Teacher Product Strategy

## Product boundary

Deep Focus academic videos, papers, notes, textbooks හෝ question/answer libraries සපයන්නේ නැත. Students තමන්ගේ study resources සහ teachers තමන්ගේ preparation/marking resources සම්බන්ධ කරගෙන වැඩ හා කාලය සංවිධානය කරගනිති. Local storage default ය; September 25 තීරණයෙන් optional paid cloud ජනවාරි release එකට අවශ්‍යයි. මිල/capacity cost/revenue review පසු තීරණය කළ යුතු අතර security/billing/production acceptance තවම ඉතිරියි. Cloud subscription එකක් resource upload හෝ class sharing සඳහා ස්වයංක්‍රීය අවසරයක් නොවේ.

මෙහි curriculum/subject pilot යනු optional organisational metadata සහ workflow validation ය; supplied teaching-content pilot එකක් නොවේ. Independent teacher workflow එක cohort/learner sharing නැතිවත් ප්‍රයෝජනවත් විය යුතුය. පහත local-provider facts සහ historical reviews මේ boundary එකට අනුව competition/context evidence ලෙස කියවිය යුතුය. ක්‍රියාත්මක කිරීමේ විස්තර [resource/work-planning contract](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) තුළ ඇත.

## ප්‍රධාන නිගමනය

Deep Focus සඳහා වඩාත් සාධාරණ positioning එක **school, tuition සහ independent study අතර වැඩ සැලසුම් කර, focus session එකකින් ඉදිරියට ගෙන, ඉතිරි වැඩ සහ අවශ්‍ය feedback නැවත සැලැස්මට සම්බන්ධ කරන system එකක්** යන්නයි. තවත් video library එකක්, generic AI tutor එකක් හෝ සම්පූර්ණ school-management system එකක් වීම මුල් differentiation එක ලෙස දුර්වලය. දේශීයව ඒ පරාසවල දැනටමත් සේවා තිබේ.[^3][^4][^6]

මෙය තහවුරු කළ market gap එකක් හෝ payment guarantee එකක් නොව, සාක්ෂි මත ගොඩනැගූ **product hypothesis** එකකි. විශේෂයෙන් studentsගේ ආරම්භ කිරීමේ අපහසුතාව, එකිනෙකට ගැටෙන වැඩ, සහ teachersගේ feedback workload පිළිබඳ සැබෑ භාවිතයෙන් තහවුරු කිරීම අවශ්‍යය. Software භාවිතය වැඩි වීම, දිගු focus minutes හෝ streak එකක් පමණක් learning improvement ලෙස නොසලකන්න.

නිර්දේශිත enterprise vision එකේ student, independent teacher/tutor සහ institute යන customers තුන්දෙනාට වෙන් වූ value සහ permissions තිබිය යුතුය. එහෙත් January 1, 2027 release එකට එම මුළු vision එකම ඇතුළත් කිරීම අනිවාර්ය නොවේ. Mobile app, Public Website සහ Account Portal release boundary තුළ තබාගෙන, තහවුරු කළ කුඩා education slice එකක් තෝරාගැනීම වැදගත්ය.

## 1. දේශීය පසුබිම සහ එහි සීමා

Ministry of Education 2025 School Census එකේ census date එක June 1, 2025 ය. එහි government-school population එක පහත පරිදි දැක්වේ; teachers සහ principals ඇතුළත් teaching staff යනු එකම ගණන නොවේ.[^1]

| මිනුම | 2025 අගය |
| --- | ---: |
| Government schools | 10,047 |
| Students | 3,747,544 |
| Teachers, principals ඇතුළත් මුළු staff නොවේ | 229,661 |
| Grades 10–11, O/L cycle | 622,213 |
| Grades 12–13, A/L cycle | 409,325 |

මෙම සංඛ්‍යා paid customers, reachable smartphone users හෝ tuition enrolments නොවේ. Private candidates, පාසලෙන් පිට repeat candidates සහ වෙනත් education sectors සඳහා වෙනම evidence අවශ්‍යය. Census එක Sinhala, Tamil සහ bilingual medium වෙන් කරයි; A/L එකද Science පමණක් නොව Arts, Commerce, Technology සහ වෙනත් streams ඇතුළත්ය.[^1]

DCS January–June 2025 survey එක ages 5–69 සහ households 12,500ක් ආවරණය කරයි. එහි age 15–19 කාණ්ඩයේ පසුගිය මාස 12 තුළ internet භාවිතය 82.9% සහ email භාවිතය 32.4% ය. Internet/email සඳහා භාවිත devices distribution එකේ smartphone share 79.7% ය; එය students 79.7%කට තමන්ගේ phone එකක් තිබෙනවා යන්න නොවේ.[^2]

**Design implication:** mobile-first, low-data සහ offline-friendly flow එකක් යෝග්‍යය. Email නිතර භාවිත කරන බව අනුමාන නොකර account/recovery usability පරීක්ෂා කළ යුතුය. එහෙත් email usage අඩු වීම email ownership නැති බව නොපෙන්වයි; ඒ නිසා SMS OTP එක ස්වයංක්‍රීයව තෝරාගැනීමටත් මෙය ප්‍රමාණවත් සාක්ෂියක් නොවේ. Shared phones, account switching සහ recovery වෙනම design/test කළ යුතුය.

## 2. කාටද මුලින් value දෙන්නේ?

| Segment | කළ යුතු වැඩ | Deep Focus hypothesis | මැනිය යුතු අවදානම |
| --- | --- | --- | --- |
| O/L learner | Subjects කිහිපයක school/tuition/revision ගලපන්න | අද කළ හැකි කුඩා plan සහ catch-up queue | වැඩ වැඩි කර stress වැඩි කිරීම |
| A/L learner | Theory, revision, paper practice සහ practical preparation | Topic-linked attempts සහ next-action planning | Science-only design; scores වැරදිව අර්ථ දැක්වීම |
| Private/repeat candidate | School timetable නැතිව exam cohort එකකට වැඩ කරන්න | Grade එකට බැඳී නැති qualification/exam-year profile | School membership අනිවාර්ය කිරීම |
| Teacher/tutor | Work assign කර අවශ්‍ය learnersට feedback දෙන්න | කෙටි reusable assignments සහ submitted-progress view | තවත් admin dashboard එකක බර |
| Teacher as an individual | Lessons prepare, marking සහ තමන්ගේ වැඩ සැලසුම් කරන්න | Personal/professional core + optional education tools | Class feature නොගත් teacherට value නැති වීම |
| Institute | Teachers/cohorts/permissions/records manage කරන්න | පසුව managed workspaces සහ scoped reporting | මුලින්ම සම්පූර්ණ ERP එකක් හදන්න යාම |

University සහ lifelong learning shared architecture තුළ රඳවාගත හැක. එහෙත් මුල් school-exam pilot එකෙන් GPA rules, university assessment හෝ accreditation තහවුරු නොවේ. එක් කෙනෙකු student සහ tutor දෙකම විය හැකි නිසා role එක profile shortcut එකක් විය යුතු අතර security permission එකක් නොවිය යුතුය.

## 3. දේශීය alternatives සහ reviews

පහත comparison එක provider descriptions සහ public evidence මත පදනම් වේ. Features ප්‍රකාශ කර තිබීම production quality හෝ independent efficacy proof එකක් නොවේ. මෙය ශ්‍රී ලංකාවේ හොඳම apps පිළිබඳ definitive ranking එකක්ද නොවේ.

| Alternative | ප්‍රකාශිත/පෙනෙන ශක්තිය | Deep Focus සඳහා implication |
| --- | --- | --- |
| e-thaksalawa | Grades 1–13 resources, papers, school LMS සහ teacher-development resources. Nenasa AI student/teacher support Sinhala/Tamil/English ලෙස ප්‍රකාශ කරයි.[^3] | “Multilingual AI + syllabus content” පමණක් unique promise එකක් නොකරන්න. Approved links හරහා complement කරන්න |
| DP Education | Free school learning content; website එක languages සහ browser/mobile access ප්‍රකාශ කරයි.[^4] | Free content නැවත package කර selling point කර නොගන්න; content එකෙන් පසු කරන වැඩ පහසු කරන්න |
| Dialog Guru | Animated lessons, activated period තුළ repeat access සහ mobile-based service entry.[^6] | Local paid-learning alternatives තිබේ; නමුත් ඒවායේ presence එක Deep Focus willingness-to-pay තහවුරු නොකරයි |
| Techceum | Exam-year අනුව theory/revision class timetable examples.[^7] | `examCohortYear` සහ class type වෙන් කර තබන්න; actual timetable එක user/teacher විසින් තහවුරු කළ යුතුය |
| PS Physics | Theory/revision/paper-class සහ missed-lesson study-pack examples.[^8] | Catch-up work වෙනම plan කිරීමේ අවශ්‍යතාව පරීක්ෂා කරන්න; provider එකක workflow national norm එකක් නොකරන්න |

DP Education Google Play හි පෙනෙන historical reviews තුළ accessible teaching පිළිබඳ ප්‍රශංසා සමඟ English-medium coverage සහ lesson loading පිළිබඳ ඉල්ලීම් තිබේ. Seminiගේ February 27, 2022 review එක සහ Jayaweera414ගේ July 31, 2021 review එක මෙහි examples වේ; developer responsesද ඇත. September 1, 2021 desktop-access ඉල්ලීම current desktop limitation එකක් ලෙස භාවිත කළ නොහැක, දැන් website එක browser access ප්‍රකාශ කරන නිසාය.[^5][^4]

**Review-derived recommendation:** supported subject/medium/edition coverage පැහැදිලිව පෙන්වන්න; empty lesson එකක් වෙනුවට unavailable/retry state දෙන්න; advertised experience එක සම්පූර්ණයෙන් පරීක්ෂා කරන්න. පැරණි reviews වර්තමාන unresolved bugs ලෙස ඉදිරිපත් නොකරන්න. Selected reviews self-selected evidence වන අතර complaints කොපමණ ප්‍රචලිතද යන්න මනින්නේ නැත.

මෙම providers සඳහා partnership, content-copy permission හෝ supported integration API එකක් තහවුරු කර නැත. Link එකක් දීම සහ content download/rehost/AI training කිරීම සමාන බලතල නොවේ.

## 4. Teacher සහ tuition research කියන්නේ කුමක්ද?

PGIS RESCON 2025 conference abstract SE05, Matale zone එකේ selected schools පහක A/L Physics students 332ක් සහ teachers 12ක් විමසා ඇත. එහි tuition participation ඉහළ බවත්, assessments සහ missed lessons ගැන findings තිබෙන බවත් දැක්වේ. එය local, subject-specific sample එකකි; සියලු ශ්‍රී ලංකා students සඳහා national percentage එකක් හෝ causal effect එකක් නොවේ.[^9]

UNICEF 2024 teacher-training account එක digital skills, localized practical training සහ blended classroom work පිළිබඳ අවශ්‍යතාව විස්තර කරයි. එය training programme/participant account එකක් වන අතර සියලු teachersගේ skill level මිනුමක් නොවේ.[^10]

UNICEF March 2026 Akelius account එක eastern Sri Lanka primary-school initiative එකක devices, teacher support සහ feedback ගැන විස්තර කරයි. මේ primary-language case එක O/L/A/L Deep Focus outcomes සඳහා efficacy proof එකක් නොවේ.[^11]

**නිර්දේශය:** teacher onboarding එකේ පළමු සාර්ථක වැඩේ “classroom database configure කිරීම” නොව, learnerට ලබාදිය හැකි කෙටි assignment එකක් සකස් කිරීම විය යුතුය. Sample class එක synthetic data සමඟ පෙන්වන්න; reusable template, familiar terminology සහ Sinhala/Tamil support ලබාදෙන්න. Teachersගේ subject expertise වෙනුවට AI දමාගැනීම නොව, තහවුරු කළ වැඩ learnerගේ දෛනික plan එකට සම්බන්ධ කිරීම product value එක කරගන්න.

## 5. නිර්දේශිත learning loop එක

```text
School / tuition work + personal goals + available time
                    ↓
       Learner reviews a realistic plan
                    ↓
             Focus / practice
                    ↓
     Optional attempt / outcome / mistake note
                    ↓
       One next action or a Return Ticket
                    ↓
  Optional class submission → teacher feedback
                    ↓
      Learner confirms the next plan change
```

මෙහි “optional” යනු වැදගත් product rule එකකි. Timer එකක් අවසන් කළාම task එක, assignment එක හෝ syllabus topic එක automatically mastered ලෙස mark නොකරන්න. Learnerට paper එකේ ප්‍රශ්න තුනක් පමණක් කළ බව, තේරුණේ නැති බව හෝ කිසිදු result එකක් නොදා සිටීම සටහන් කළ හැකි විය යුතුය.

**උදාහරණය:** learnerට school homework, Saturday tuition paper class සහ Monday test එක තිබේ. App එක school/tuition/commute/වෙනත් commitments වටා තමා ලබාදුන් available time තුළ plan එකක් යෝජනා කරයි. පැය දෙකක වැඩට ඉඩ විනාඩි 45 නම් ඉතිරිය unplaced ලෙස පෙන්වයි; හොරෙන් සියල්ල schedule කරන්නේ නැත. ඊළඟ දවසට unfinished work ගෙනයද්දී learnerගේ confirmation අවශ්‍යය.

Practice record එකේ source, topic, attempted items සහ optional result දාන්න පුළුවන්. වැරදි category එකක් තෝරනවා නම් `concept / recall / method / calculation / time / unsure` වැනි explainable options යෝජනා කළ හැක; ඒවා diagnosis නොවේ. Recommended next task එකක් userට edit/skip කළ හැකි විය යුතුය. Advanced spaced-repetition algorithm එකක් පසුව තෝරාගැනීමට පෙර simple manual review date එක විශ්වාසදායකව වැඩ කළ යුතුය.

Teacher assignment එක learnerගේ private plan එකට copy/link කිරීමෙන් teacherට මුළු timetable එකේ අයිතිය නොලැබිය යුතුය. Teacher දකින්නේ class එකට නියමිතව submit කළ work සහ feedback පමණි. Offline හෝ තවම sync නොවූ submission එකක් “lazy”, “absent” හෝ “low ability” ලෙස label නොකරන්න.

## 6. Country packs, language සහ curriculum correctness

NIE නිල syllabus සහ teacher-guide entry points තිබේ.[^12] ඒවා content provenance සඳහා ආරම්භක sources වන අතර සෑම subject/edition එකක්ම app එකට දමා භාවිත කිරීමට අවසර ලැබී තිබෙන බව නොපෙන්වයි. Subject reviewer විසින් exact qualification, topic mapping, medium සහ edition තහවුරු කළ පසුව පමණක් verified pack ලෙස නිකුත් කිරීම නිර්දේශිතය.

March 23, 2026 official Cabinet decision summary එක Grade 1 reforms 2026දී ක්‍රියාත්මක වන බවත් Grade 6 සඳහා 2027 සැලසුමක් බවත් සඳහන් කරයි. එය පැරණි roadmaps ස්ථිර ලෙස hard-code නොකළ යුතු බව පෙන්වයි; එම නිවේදනයෙන් A/L syllabus සියල්ල 2027දී වෙනස් වන බව නිගමනය කළ නොහැක.[^13]

නිර්දේශිත වෙන්කිරීම්:

- App language: Sinhala, Tamil, English සහ පසුව reviewed locales. Country pack නැතිවත් භාවිත කළ හැක.
- Learning context: General/Custom හෝ verified Sri Lanka qualification pack.
- Course medium: එක් subject එකකට වෙනස් විය හැක; UI language එක මාරු කළාට මෙය මාරු නොවේ.
- Qualification/cohort: O/L, A/L, custom; exam year grade එකෙන් ස්වයංක්‍රීයව infer නොකරන්න.
- Curriculum edition: immutable version සහ explicit upgrade preview. පැරණි attempts සහ custom topics මකන්නේ නැත.
- Exam event: official source, last-verified date සහ provisional/confirmed state. Verified 2027 timetable නොමැති තැන exact countdown promise නොකරන්න.[^14]

General mode එක fallback punishment එකක් නොව සම්පූර්ණ personal planner එකක් විය යුතුය. Reviewed curriculum pack නැති subject එකක් සඳහා title සහ custom topics දාලා වැඩ කළ හැකි විය යුතුය. Tamil interface තිබුණත් Tamil-medium educational content incomplete නම් ඒ දෙක වෙන් කර ප්‍රකාශ කළ යුතුය.

## 7. Privacy, low-data සහ shared-device design

Offline focus/planning එකට cloud connectivity අනිවාර්ය නොකිරීම යෝග්‍යය. එහෙත් local save, queued sync සහ teacherට ලැබුණු submission යන තත්ත්ව තුන UI එකෙන් වෙනස්ව පෙන්විය යුතුය. Shared phone එකක sign-out/account switch පසු පරණ userගේ drafts, notifications, cached class data සහ upload queue වෙනත් userට නොපෙනිය යුතුය. Public portal responses private account data සමඟ cache නොවිය යුතුය.

Guardian consent, institute authority සහ teacher role යනු එකම දෙයක් නොවේ. Teacher invite එකක් age-policy approval ලෙස නොසලකන්න. Student profile එකට public discovery, stranger DM, location හෝ school-name publication default නොකරන්න. Teacher progress view එක තුළ private motivation phrases, journals, අනෙක් teachersගේ classes හෝ personal focus history නොපෙන්වන්න.

Gazette No. 2498/16, July 22, 2026, January 1, 2027 දින සිට PDPA Sections 2 සහ 3, Part I සහ Part III ක්‍රියාත්මක වන බව නියම කරයි.[^15] ඒ දිනය launch target එකට සමාන නිසා privacy readiness release gate එකක් විය යුතුය. මෙය Act එකේ සියලු provisions එකවර ආරම්භ වන බවට හෝ Deep Focus compliant බවට ප්‍රකාශයක් නොවේ.

Age/consent basis, current amended law, controller/processor roles, cross-border hosting, retention සහ child-data obligations සඳහා qualified Sri Lankan legal review අවශ්‍යය. Supabase තෝරාගැනීම data region, child policy හෝ compliance තෝරාගැනීමක් නොවේ. එම review අවසන් නොවී real minors සහිත pilot එකක් ආරම්භ කිරීම නිර්දේශ නොකරයි.

## 8. මිනිස්සු ගෙවන්නේ කුමකටද?

**Student hypothesis:** scattered work එක ඉතා අඩු input එකකින් achievable plan එකක් බවට ගෙන ඒම; interrupted work නැවත ආරම්භ කිරීම; තමන්ගේ revision gaps පෙන්වන clear record එකක්. මේ value එක content quantity හෝ AI-message count එකකින් පමණක් මනින්න බැහැ.

**Teacher hypothesis:** assignment reuse, safe class distribution, submission triage සහ useful feedback ලබාදීමට යන කාලය අඩු කිරීම. Independent teacherට personal preparation/marking planner එකද value දෙයි. Institute plan එකේ පසුව permission management, audit සහ seat administration තිබිය හැක; studentsගේ private behaviour data විකිණීම value proposition නොවේ.

Student core, optional study tools, teacher tools සහ institute administration entitlement families ලෙස සැලසුම් කළ හැක. එහෙත් final prices, free limits සහ January paid modules තවම තීරණය කළ යුතුය. Teacher paid plan එකක් තිබීමෙන් learnersට hidden paid upgrade එකක් අනිවාර්ය නොකරන්න; assignment acceptance සඳහා අවශ්‍ය learner rights පෙරම catalog එකේ පැහැදිලි කරන්න. Export/delete වැනි privacy controls paywall නොකරන්න.

Willingness-to-pay තහවුරු කිරීමට මුලින් repeated useful usage සහ saved effort පරීක්ෂා කර, පසුව transparent package concepts පෙන්වන්න. “මෙය තිබුණොත් ගන්නවාද?” යන එකම ප්‍රශ්නය revenue forecast එකක් නොවේ. පාසල් සිසුන්ගෙන් pressure සහිත payment commitments නොගන්න; payer, learner සහ teacher වෙනස් පුද්ගලයන් විය හැක.

## 9. Validation සහ launch proposal

### Discovery

මුලින් teachers 4ක් සහ learners 8–12ක් සමඟ bounded interviews/usability sessions යෝජනා කරයි. Sinhala සහ Tamil medium, O/L සහ A/L, non-metro context, shared-device/low-connectivity cases සහ tuition නොයන learner අවම වශයෙන් sampling තුළ සලකන්න. මෙම සංඛ්‍යා statistical representation සඳහා නොව ප්‍රධාන workflow errors හඳුනාගැනීමටය. Recruiting හෝ interviews සිදුකර ඇති බවට මෙහි ප්‍රකාශයක් නැත.

ඉල්ලිය යුත්තේ sample week එකක්, missed assignment එකකට කරන දේ, next revision තීරණය කරන ආකාරය සහ teacher feedback process එකයි. Private chat histories, raw student rosters, national IDs හෝ real marksheets අවශ්‍ය නැත. Consent-approved synthetic/redacted examples භාවිත කළ හැක. Student school/tuition access එක research participation මත රඳා නොතැබිය යුතුය.

### Bounded pilot

Policy/rights review පසු **teachers 4ක්, opt-in learners 30–50ක්, සති 4ක්** යන pilot එක යෝජිතය; එය approved commitment එකක් නොවේ. පළමු verified pack සඳහා O/L Mathematics හෝ reviewer පහසුවෙන් සපයාගත හැකි එක් A/L subject එකක් සලකා බැලිය හැක. අවසාන තේරීම reviewer, medium, content rights සහ actual workflow evidence මත කළ යුතුය; Matale Physics research තිබීමෙන් Physics අනිවාර්ය නොවේ.

| මිනුම | Operational definition / caution |
| --- | --- |
| Learner activation | තමා තෝරාගත් work item එක plan කර, focus/practice attempt එකක් කර, next action හෝ explicit skip එකක් සටහන් කිරීම |
| Teacher activation | තමන්ගේ resource/reference එකක් preparation/marking task එකකට සම්බන්ධ කර, work block එකක් කර, ඉතිරි වැඩ සටහන් කිරීම; classroom pilot අනුමත නම් assignment/submission/feedback වෙනම මැනීම |
| Return value | දෙවන සතියේ වෙනත් දවසක relevant learning loop එකක් නැවත භාවිත කිරීම; app-open count නොවේ |
| Time burden | Teacher assignment/feedback time සහ learner planning time observed tasks මඟින් සටහන් කිරීම |
| Reliability | Acknowledged saves lost, duplicate submissions, wrong-account access සහ unresolved sync states වෙනම ගණන් කිරීම |
| Planning usefulness | Unplaced work පිළිබඳ අවබෝධය, manual changes, next action තේරීම සහ reasons for abandonment |
| Equity/access | Medium, device-sharing සහ connectivity අනුව barriers qualitatively report කිරීම; කුඩා groups public report කර re-identification නොකිරීම |

Cross-user leakage, acknowledged data loss හෝ consent failure එකක් තිබුණොත් affected pilot නවත්වන්න. Activation/retention thresholds baseline නොමැතිව හදා “success” කියන්න එපා; first usability round පසු criteria පෙරම ලියා, pilot අවසන් වූ පසු ඒවා ගැලපෙන ලෙස වෙනස් නොකරන්න. Four-week pilot එකෙන් exam-grade improvement හෝ long-term efficacy තහවුරු කළ නොහැක.

### Acquisition සහ website

Public website එකේ Students, Teachers සහ General/Professional සඳහා වෙන් වූ entry points තිබිය යුතුය. දැනට usable features සහ future roadmap පැහැදිලිව වෙන් කරන්න. Teacher demo එකේ learner-private-data boundary පෙන්වන්න; localized quick-start, support, subscription explanations සහ account/privacy controls දෙන්න.

Teacher referrals සහ small class demos යෝජිත acquisition routes වේ; school endorsement, government partnership හෝ official exam affiliation තිබෙනවා ලෙස ප්‍රකාශ නොකරන්න. පුද්ගලයන්ට messages යැවීම, rosters import කිරීම හෝ real cohorts create කිරීම වෙනම explicit authorization සහ privacy process අවශ්‍ය ක්‍රියා වේ.

## 10. Release boundary සහ remaining uncertainty

January සඳහා mobile General learner planning, reliable focus, optional outcome/return සහ approved locale support ශක්තිමත් කිරීම යෝග්‍යය. Verified pack සහ teacher-lite cohort pilot එක **scope candidates** වේ, automatic commitments නොවේ. Website/Account Portal අනිවාර්ය වීමෙන් full teacher LMS web dashboard එකක් හෝ full productivity web app එකක් Januaryට අනිවාර්ය වන්නේ නැත.

තවමත් තහවුරු කළ යුතු දේ: exact pilot subject/medium/edition; 2027 official exam timetable; current consolidated legal/age rules; teacher/student direct feedback; content reuse rights; authentication recovery on shared devices; willingness-to-pay; hosting and operational limits. සියලු local alternatives hands-on tested බවක් හෝ review complaints තවම unresolved බවක් මෙහි අනුමාන නොකෙරේ.

මෙම strategy එක Deep Focus mission එකට ගැළපෙන්නේ learning/work execution පහසු කරමින් user control සහ sustainable focus රැකෙන තරමටය. එය content platform, social network, school ERP සහ AI tutor සියල්ල එකවර ගොඩනගන roadmap එකකට හැරුණොත් මුල් value එක දුර්වල වීමේ අවදානම වැඩිය. Enterprise readiness යනු මුලින්ම විශාල feature count එකක් නොව **clear ownership, dependable workflows, tested security සහ පසුව පුළුල් කළ හැකි boundaries** යන්නයි.

## Sources

පහත sources සඳහා evidence cutoff/access date 2026-09-14 ය. Publication dates වෙනම සඳහන් කර ඇත. Provider pages යනු first-party descriptions; reviews සහ programme stories වෙනම සීමිත evidence ලෙස භාවිත කර ඇත.

[^1]: Ministry of Education, [School Census 2025 Summary Report](https://moe.gov.lk/wp-content/uploads/2026/01/School_Census-2025_Summary-Report-V1.pdf), census June 1, 2025; published file January 2026. Definitions and printed pp. 1, 5; government-school totals, O/L/A/L cycles and medium/stream distinctions.
[^2]: Department of Census and Statistics, [Computer Literacy Statistics 2025: First Six Months](https://www.statistics.gov.lk/Resource/en/ComputerLiteracy/Bulletins/2025-FirstSixMonths.pdf), January–June 2025 survey. Printed p. 4, Tables 8–9; age-group usage and device-distribution denominators, with report sampling/method notes.
[^3]: Ministry of Education, [e-thaksalawa Learning Content Management System](https://e-thaksalawa.moe.gov.lk/lcms/), undated live product page. Grades/resources, school LMS/teacher links and Nenasa AI language/support claims.
[^4]: DP Education, [Official website](https://www.dpeducation.lk/), undated live provider description. Free-learning scope, languages and website/mobile access claims; individual lesson coverage not certified.
[^5]: DP Education, [Google Play listing and user reviews](https://play.google.com/store/apps/details?id=lk.databoxtech.dpeducation), selected visible reviews July 31 and September 1, 2021; February 27, 2022, with developer replies. Historical qualitative evidence, not current defect verification or rating comparison.
[^6]: Dialog Axiata, [Guru Learning](https://dialog.lk/value-added-services/guru-learning), undated service description. Lessons, activation and repeat-access workflow; no price forecast derived.
[^7]: Techceum, [Class timetable](https://techceum.lk/timetable.php), provider timetable showing exam-year and theory/revision examples. Schedule subject to change; not a national survey.
[^8]: PS Physics, [Official class information](https://psphysics.lk/), provider's indexed page content: theory/revision/paper and study-pack examples. Direct page retrieval was unavailable; no live enrolment or API capability verification.
[^9]: F. S. N. Mohamed and P. R. K. A. Vitharana, “Impact of Private Tuition on G.C.E. Advanced Level Physics Learning in Matale Educational Zone, Sri Lanka,” [PGIS RESCON 2025 Proceedings](https://www.pgis.lk/rescon2025/docs/RESCON_2025_Proceedings.pdf), abstract SE05, printed p. 229. Selected-school sample of 332 students and 12 teachers; conference abstract, not national causal evaluation.
[^10]: UNICEF Sri Lanka, [Teaching and learning using modern technology](https://www.unicef.org/srilanka/stories/teaching-and-learning-using-modern-technology), June 11, 2024; describes June 2023 teacher digital-competency training and a participant perspective.
[^11]: Lakna Paranamanna / UNICEF Sri Lanka, [Transforming English language learning into a digital adventure](https://www.unicef.org/srilanka/stories/transforming-english-language-learning-digital-adventure), March 3, 2026. Akelius primary-school programme account in eastern Sri Lanka, not an O/L/A/L controlled study.
[^12]: National Institute of Education, [Syllabus selection](https://nie.lk/selesyll) and [Teacher-guide selection](https://nie.lk/seletguide), official entry points. Exact subject editions and reuse rights still require individual review.
[^13]: Office of the Cabinet of Ministers, [Continuation of the process of educational reforms](https://www.cabinetoffice.gov.lk/cab/index.php?Itemid=49&dID=13822&id=16&lang=en&option=com_content&view=article), March 23, 2026 Cabinet decision summary, as indexed; heading notes confirmation at the following meeting. Also [official English Cabinet decision publication](https://news.lk/images/pdf/2026/03/25/Cabinet_Decision_on_2026.03.23_English_1.pdf). Planning announcement, not validation of every later syllabus.
[^14]: Department of Examinations, [Official website](https://doenets.lk/). Authoritative monitoring/verification destination; no verified 2027 O/L/A/L schedule is asserted from its homepage.
[^15]: Government of Sri Lanka, [Gazette Extraordinary No. 2498/16](https://dpa.gov.lk/Gazet/2498-16_E.pdf), July 22, 2026, p. 1A, order dated July 13, 2026. Specified PDPA commencement January 1, 2027. See also Data Protection Authority [official guidelines and gazette index](https://dpa.gov.lk/guidelines.php); draft instruments on the index are not assumed binding final rules.
