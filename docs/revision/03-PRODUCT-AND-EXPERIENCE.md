# Product and Experience Specification

Status: proposed expanded product contract, not approved replacement of canonical UI/scope. [01](01-REQUIREMENTS-AND-DECISIONS.md) owns approvals. “Must” below means acceptance behaviour **if that capability is approved for implementation**. Proposed defaults require ADR-003/006 approval.

## 1. Shared core, optional workspaces

Confirmed owner direction: **කරන්න තියෙන වැඩ ටික පිළිවෙළට සැලසුම් කරලා, ඒවා කරගෙන යන එක පහසු කිරීම.** The core makes the next action clear, keeps the plan realistic and helps the person resume after interruption. Focus protection, sustainable recovery and user control remain part of that value. The [decision register](01-REQUIREMENTS-AND-DECISIONS.md) records the clarification and its release limits.

Education organises study and teaching work; Deep Focus supplies no lesson videos, papers, notes, textbooks or question/answer library. Students and teachers bring their own resources. Local storage is the default; optional subscription cloud storage requires verified entitlement, explicit resource selection and approved cost/security/release contracts. The [resource contract](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) defines these boundaries; curriculum metadata and optional class collaboration do not turn this into a content-delivery platform.

```text
Deep Focus identity + private personal space
  ├─ Shared core: Plan → Focus → Outcome → Recovery → Return
  ├─ Personal / Professional modules
  │    ├─ Professional → team → organisation
  │    ├─ Developer → project → delivery team
  │    ├─ Freelancer → client project → agency
  │    ├─ Creator → production workflow → studio
  │    └─ Founder → experiments/objectives → company
  └─ Education modules
       ├─ General / Custom learner (no country pack required)
       ├─ School → O/L / A/L → subjects/topics/revision
       ├─ University → modules/projects/research
       ├─ Lifelong learner → skills/practice/evidence
       ├─ Teacher/tutor/lecturer → cohorts/assignments
       └─ Institute/school/university → managed memberships
```

One person can be a student, freelancer and tutor simultaneously. Role choices personalise shortcuts/templates; they do not create additional identities or grant organisational privileges. Workspace membership is separately authorised. An organisation sponsoring a seat does not acquire the person's private journals, personal tasks or motivation phrases.

Do not implement a microservice for each branch. Reuse tasks, goals, sessions, outcomes and permissions. Add modules when their workflows and ownership contracts are approved. Prefer a modular backend with explicit boundaries before independently deployed services become necessary.

## 2. Approved navigation direction and proposed screen content

Approved stable mobile destinations: **Home / Plan / Focus / Progress / Profile**,
with Rewards inside Progress. The active session is an explicitly recoverable
state, not a second unrelated timer. January does not automatically include every
destination's future modules. The [canonical screen map](../V1_SCREEN_MAP.md)
now specifies the target routes and old-URL redirects; application source still
uses the older tabs. Detailed [experience contracts](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md)
refine state/interaction cases without claiming that migration is implemented.

| Destination | Primary content | Nested, not extra permanent tabs |
| --- | --- | --- |
| Home | Resume active work or Start Focus; today's meaningful priority; bounded plan | Optional quote/landscape; suggested Return Ticket |
| Plan | Tasks, goals, today's availability | Education timetable, projects, templates, calendar connection when enabled |
| Focus | Configure or resume session | Optional sound/shield selection; recovery |
| Progress | History, outcomes, period totals | Streaks/XP/achievements, advanced insights; no public leaderboard by default |
| Profile | Preferences, account, privacy, billing entry | Personalisation, languages, integrations, workspace switch, help |

Personalisation must not rearrange core navigation unpredictably. Disabled modules do not leave dead buttons. Locked paid capability shows an honest explanation and a way back, never a fake result. When a deep link targets an unavailable/deleted object, show the reason and a safe parent destination. Back navigation must not accidentally cancel a running session.

## 3. Optional onboarding and editable personalisation

Two independent layers: essential consent/account requirements when applicable, and optional product personalisation. Skipping the second does not waive the first. Guest/local entry, minimum age and account requirements remain an explicit scope/legal decision; do not manufacture consent from questionnaire answers.

First screen offers app language, accessibility options and **Use defaults**. Language can be selected without completing assessment. Proposed question schema:

| Step/key | Question / allowed response | How it is used |
| --- | --- | --- |
| 1 `roles` | Student, professional, developer, freelancer, creator, founder, educator; multi-select; prefer not to say | Suggested workflows only |
| 2 `intent` | Start more easily / protect attention / finish priorities / organise study/work / unsure | Home suggestions, never an inferred diagnosis |
| 3 `friction` | Interruptions / unclear next step / too much planned / inconsistent routine / unsure; optional multi | Non-medical tips |
| 4 `availability` | Typical available minutes and chosen days, or decide daily | Planner upper bound, not a mandatory productivity target |
| 5 `preferred_windows` | Optional local time windows / no preference | Suggested slots, not reminders without consent |
| 6 `focus_preference` | Short / standard / custom duration / unsure | Proposed default; user can edit before every session |
| 7 `experience_density` | Simple / show advanced tools | Disclosure preference, not different underlying rights |
| 8 `learning_context` | Only if relevant: General/Custom or available verified pack | Pack preview and explicit install; never inferred from UI language |
| 9 `accountability` | Solo / explore private accountability / skip | Informational preference only; no auto-invite or progress sharing |
| 10 `review` | Summary of all proposed defaults and optional features | Exact changes preview, Apply or Continue with defaults |

Show only applicable questions (normally 7–10 screens including review), Back, Skip and progress. Do not require filling irrelevant fields to reach the app. Each answer is saved as a draft when storage is available. A failed save is visible; the user can continue with in-memory defaults but must not be told the draft is durable.

Proposed default bundle: System theme; General/Custom context; 25-minute focus and 5-minute optional break; no enabled social sharing, AI transmission, shielding permission, paid add-on or notification schedule; Default motivation. Existing explicit settings override this bundle. Exact duration limits and existing XP formula must be copied from canonical rules into the approved release contract, not re-invented by Luna.

`PersonalisationDraft = { schemaVersion, answers, completedStep, updatedAt }` is separate from applied settings. Applying produces one atomic preferences change and clears the draft only after persistence succeeds. Record `source: default | questionnaire | explicit` per configurable preference. Re-running assessment previews changes; preserve explicit overrides unless the user selects that field for replacement. Never rewrite previous sessions, goals, task dates or workspace membership. Reset personalisation resets recommendations/preferences selected in the preview, **not all app data**.

Acceptance P-01: skip all optional answers → useful Home; reopen → chosen language retained. P-02: kill/reopen halfway → resumable draft, or truthful storage error. P-03: edit one answer → unrelated explicit settings and past data unchanged. P-04: unsupported/old answer values migrate safely to Unknown and require no forced diagnosis/role.

## 4. Language and country/curriculum packs

Separate fields: `uiLocale`, `contentLanguage`, `timeZone`, `regionPreferences`, optional `curriculumPackId/version`, `billingCountry` from billing verification and legally required service/age policy context. Do not store precise location unless an approved feature needs it. A country pack contains optional organisational curriculum metadata, not supplied teaching materials, a language switch, identity proof or legal compliance module.

General/Custom is always usable without a pack. A Sinhala-speaking professional can use General mode; an English UI student can use a Tamil-medium syllabus. If content lacks translation, label its actual language and offer available alternatives rather than fabricate a translated official version.

Locale implementation contract: stable message IDs; no concatenated translated sentences; plural/date/number formatting; translation context and screenshots; fonts tested for Sinhala/Tamil shaping; RTL mirrored layout where appropriate but not blindly mirroring icons with semantic direction. Fallback chain `exact locale → supported base language → English` for missing app strings, with release checks that reject missing essential/legal strings. Do not auto-translate legal copy or personal phrases. Language packs do not contain executable code.

Initial Sinhala/Tamil/English is a recommendation, not yet a published support promise. More locales can be added without country packs, after qualified review and full key-flow QA. Keep a per-locale release status rather than advertising every partially translated language.

Pack manifest proposal: `id`, `version`, `countryContext`, `qualification`, `medium`, `effectiveFrom`, `effectiveTo?`, `sourceUrls`, `rightsStatus`, `reviewer`, `reviewedAt`, `checksum`, `schemaVersion`, `status: draft|reviewed|withdrawn`. Content is immutable by version. Installation previews subjects/calendar changes; upgrading maps known topic IDs and preserves custom items. Never delete student work because a pack changed. Withdrawn content is labelled and cannot be installed anew; existing user records remain readable unless removal is legally required through a separate process.

Acceptance P-05: change UI language → curriculum, billing and timezone unchanged. P-06: remove pack → user tasks/results preserved and orphaned labels readable. P-07: offline install failure → previous valid pack remains; no partially activated syllabus.

## 5. Reliable focus and recovery

Owner refinement, September 16: no XP penalties for missed work; no unverified
health predictions. The owner wants exit behavior configurable in Settings before
a session for people seeking stronger commitment. On September 17 the owner
approved keeping a separate Emergency exit even when ordinary End early is
disabled in Settings. Emergency-exit availability is no longer an open question.
Exact interaction and the ability to change the active mode during a session
still need a contract; no delay, PIN, third-party permission or gesture was
approved by this reply. Do not interpret commitment settings as an unbreakable
lock or permission to lose a user's data. The domain's ability to persist
cancel/recovery remains separate from ordinary End early visibility.

Acceptance for the approved distinction (NOT RUN): ordinary exit enabled →
ordinary End early available; ordinary exit disabled → separate Emergency exit
still available. An emergency early stop uses cancellation with actual elapsed
time, not fabricated completion or an XP deduction. Core offline/ad-independent
behavior and visible persistence failure/recovery rules still apply. This does
not claim the current app implements a strict mode or an emergency-specific UI.

[19](19-SAFETY-AND-COMMITMENT-CONTRACT.md) supplies the proposed exit-policy
snapshot/control matrix, failure behavior, four build cards and twenty NOT RUN
cases. It separates confirmed safety constraints from default/interaction
proposals; no strict mode or shielding capability is marked implemented.

Persisted state names remain `active ↔ paused → completed | cancelled`;
`configured` is a setup/UI state and “Running” is a display label for `active`,
not a new serialized enum. An interrupted local record is recovered into its
persisted state, not fabricated into a completion. Terminal records are immutable
except a separately audited correction process. A rest session is separate,
linked data. The [core reliability contract](13-CORE-RELIABILITY-CONTRACTS.md)
refines transitions, timing precision, save/retry/recovery and test fixtures;
its new types/schema/cutoff proposals require reconciliation before adoption.

- `start` fixes duration, task ID, optional goal link and settings snapshot. Editing defaults later must not alter an active session.
- Active elapsed time excludes paused spans and is derived from timestamps/lifecycle, never UI interval count. A detected clock anomaly displays an uncertainty/recovery state and cannot produce trusted rewards solely from a forged client clock.
- Complete only when validated elapsed time reaches configured duration. Early stop is Cancel/End early with actual elapsed time, not a completed full session. Confirmation must not trap the user.
- Persist terminal event and outbox atomically **before** clearing active state. Retrying completion cannot add another session or reward.
- After completion offer optional Outcome Receipt, optional True Zen Break and summary; skip remains available. If pausing exposes a short-rest UI, it must remain a paused focus session, not create a completed-session break or grant completion XP. Reconcile the exact canonical pause route before changing navigation.
- Break can be skipped/ended early, is not mandatory treatment, and gives no focus minutes. Rest prompts never block urgent use.
- Return to app after background/restart must offer the real active/paused record or explain a damaged record; no silently reset timer. Multiple-device conflicts use [04](04-BACKEND-SECURITY-AND-SYNC.md).

Acceptance P-08: pause ten minutes → those minutes excluded. P-09: kill during terminal write → exactly one durable terminal outcome after recovery. P-10: early stop → no completed-session reward. P-11: settings/task title change during session → stable link and original configuration survive. P-12: break skip/end → no fabricated focus time.

## 6. Tasks, goals, progress and differentiated workflows

Task: stable ID, title, optional notes, status, priority, due semantics (date-only or instant), optional estimate and links. Archiving/deleting a task does not destroy linked historical sessions. Date-only deadlines must not shift a day with timezone conversion. Goal progress is derived from eligible records within a **bounded** period; use half-open interval `[start, end)` and documented timezone rule. Do not apply a newly changed timezone retroactively without an explicit preview/migration policy.

Streaks/XP/achievements are secondary feedback, not payment instruments. Keep reward rules versioned and deduplicated on trusted infrastructure. Offline results can show “pending verification”; do not imply that timestamp checks prove a person genuinely concentrated. No real-money rewards, random paid rewards, XP wagers or loss of purchased features after a missed day. Legacy numbers/formulas must be reconciled explicitly before implementation; this proposal does not silently change them.

Analytics label source and uncertainty: completed focus duration, session count, task completion and optional self-reported outcome are different metrics. A minute is not mastery, employee performance or mental health. Give empty states without fake graphs, filters with explicit timezone/period, and a readable history detail view. Do not hide personal data export behind an analytics add-on.

**Return Ticket:** user chooses Save next step while pausing/ending, or from task detail. Private fields: next action, optional short context, selected references. On resume show one dismissible card. Never capture clipboard, browser tabs or code automatically. Mark a ticket resolved explicitly or offer update; do not silently delete it on timer completion.

**Outcome Receipt:** optional “What changed?” with short result, linked task and user-selected evidence. “Worked on it” and Skip are valid outcomes. Completing a timer does not automatically complete a task. AI can draft a receipt only as a labelled proposal.

**Capacity Planner:** sum proposed work, fixed commitments and chosen buffers against actual available windows. Unschedulable work remains visibly unplaced; never overfill silently. Cross-workspace views may combine the user's own information locally while sharing only approved availability blocks with others. Manual edits win over regenerated suggestions unless specifically replaced.

Acceptance P-13: goal end boundary excludes following-period record. P-14: replay session event → unchanged XP. P-15: completed timer with unfinished task → task remains unfinished. P-16: over-capacity plan → visible unplaced items; no fake “all scheduled” success.

## 7. Education workflow contract

Detailed Sri Lanka layer: [evidence and strategy](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md), [implementation contracts](11-SRI-LANKA-EDUCATION-CONTRACTS.md). The latter refines this proposal; it does not supersede the decision register or promote the entire teacher/institute workflow into January scope.

Core hierarchy: `learning programme → subject/module → topic → planned work/practice → attempt/result → review action`. A learner may use only tasks/timetable without grades. Timetable supports recurring lessons, exceptional dates and exam events with timezone and source version. Avoid treating every schedule as one repeated Monday–Friday week.

Sri Lanka launch slice recommendation: General/custom student and independent teacher organisers using their own local resources. An optional owner-selected, reviewer-verified curriculum-metadata pilot remains OPEN in ADR-007; it is not required to use a personal paper/book reference. Do not generate or supply “official” teaching content. Exam-date metadata, if offered, must show source and last verified date; unconfirmed dates are labelled provisional.

Practice/recall: learner records an attempt and an optional mistake category; revision suggestions derive from an approved algorithm and transparent inputs. Manual reschedule/skip always available. Grading and GPA require programme-specific, versioned rules and sample calculations verified by a subject authority. No universal conversion, guarantee of grades or accredited certificate implied by XP.

Independent teacher flow: add own class commitments/resources → plan preparation and marking tasks → focus → record completed/remaining work → review the next class. No learner records, content publishing or cohort are required. The amendment recorded September 29 now targets bounded optional classroom collaboration for V1: private cohort → eligible invitation → work instructions/deadline → learner-confirmed private plan → intentionally selected completion/progress share → text feedback. Concrete contracts/review remain gated; no private timetable/notes/full history access, full LMS or general messenger. Resource transfer is not enabled by that outline; resources stay local unless the owner of the resource explicitly enables approved paid cloud. Cloud storage itself is private, not class sharing. Institute administration and permitted learning-record export/retention require separate contracts.

School, tuition, commute and personal commitments share one private capacity plan. Qualification, grade, exam cohort year and course medium are independent fields. Teacher assignments create learner-confirmed private links/copies; published revisions never silently reschedule private work. Submissions contain only explicitly selected class-scoped fields, not a live view over personal history. “No submission received” is not evidence that a learner did no work, especially offline. A teacher-lite mobile pilot and a future desktop teacher workspace require their own approved surface/scope; January Website/Account Portal does not automatically include a full LMS.

Future interoperability goes through adapters and explicit mappings. Import preview, conflict resolution, source IDs and rollback are required before enabling roster/grade writes. Never assume LTI or OneRoster grants unrestricted access to personal focus data.

## 8. Professional enterprise workflows

| Role | Individual → team/enterprise workflow | Deliberate boundary |
| --- | --- | --- |
| Professional | Priorities → protected sessions → selected outcomes → team focus agreement | No keystroke/screenshots/productivity surveillance |
| Developer | Issue/bug context → implementation focus → Return Ticket → reviewed handoff | Repository links do not authorise commits or expose source to AI |
| Freelancer | Client milestone → estimated work → actual session evidence → selected client update | No invoices/payroll/escrow in core; client sees only shared scope |
| Creator | Brief → draft → review → planned publish → outcome | Calendar entry is not permission to publish externally |
| Founder | Objective → experiment → execution → evidence/review → next decision | No fabricated KPI or automatic team ranking |

Workflow packs are editable templates, not mandatory alternative apps. Enterprise readiness adds roles, seat management, audit, tested offboarding, scoped integrations and support commitments. SSO/SCIM/residency capabilities require separate implementation and evidence before sales claims. Founders or admins cannot opt all members into private behavioural monitoring.

## 9. Motivation, illustration and accessible visual system

Motivation mode enum: `default | personal | off`. Personal phrases are private plain text with documented limits in the final component contract; no HTML, external embeds or auto-sharing. Empty personal collection offers Default or Off, never a broken carousel. User can add/edit/delete/order phrases and choose placements. Default quote selection is stable during an active session; no attention-seeking rotation. Keep error messages and critical instructions independent of motivational copy.

Brand source: [reference interpretation](evidence/Brand-Reference.md). Preserve the blue arcs/path and coral focal point; dark navy and light backgrounds follow user references. Exact accessible colour pairs, typography, spacing and component tokens need an approved token sheet after prototype testing. The user's existing local blue token edit is not overwritten by this document. Coral brand accent must not be the sole error/success cue.

Landscapes: home hero, welcome and session footer are proposed locations; avoid heavy illustrations behind working lists/forms. Prepare original/licensed assets in light/dark variants. Text remains real UI text for translation and screen readers. Static references do not specify animation timing. Motion proposal: brief functional transitions, ambient motion Off by default during focus, system reduced-motion overrides, no autoplay audio. Test battery/performance before adding animated scenery.

Every component specification must include loading, empty, populated, error/retry, disabled, focused/pressed, large-text, screen-reader and light/dark states where applicable. Proposed touch minimum: 44 pt iOS / 48 dp Android; keyboard-visible focus on web. Validate WCAG AA contrast targets, non-colour status cues and local-language text expansion on real layouts. Exact production tokens are gated, not invented hexadecimal values here.

## 10. Focus-oriented collaboration

Opt-in private rooms/partners before any public community. Invitation must not reveal whether arbitrary emails have an account. Membership acceptance is explicit. Presence is ephemeral and may be stale; it is not proof of work. Session status shares only enabled fields and expiry, not task titles by default. Leaving a room never cancels another person's timer or penalises group members.

Messages arriving during focus are queued/muted according to user preference. Show an optional inbox count afterwards; do not force-open chat or override system Do Not Disturb. Reporting, blocking, invite rate limits, abuse handling and retention are required before chat ships. Blocking must apply to invitations, direct messages and realtime delivery, not just hide a conversation locally.

Minimum-age, guardian/institute consent, minors' discovery/DM rules and moderation responsibility are OPEN. Until approved, **do not release child-facing social capabilities**. No public profiles/stranger DMs by default. Public channels, feeds and large communities remain separate future products with an operational moderation gate, not a hidden January commitment.

## 11. Future feature admission rule

DF-050–075 retain voice, advanced AI, integrations, sounds, cosmetics, challenges, widgets, desktop/wearables and enterprise extensions. Retention in the inventory is not an executable specification. Before each is READY: define target user/value, input/output, state transitions, data owner, permissions, offline/deletion behaviour, UI states, tests, rollout and cost limits. Never let Luna improvise those missing contracts while building a different task.
