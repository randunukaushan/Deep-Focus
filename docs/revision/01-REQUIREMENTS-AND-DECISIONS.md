# Requirements and Decision Register

## Reading this register

`CONFIRMED` = explicitly requested/accepted product direction in this conversation. `BASELINE` = requirement in existing approved documents, not proof of implementation. `PROPOSED` = research/assistant recommendation awaiting approval. `OPEN` = material choice not yet made. `HOLD` = historical idea that conflicts with safety, feasibility or current mission and must not be implemented as written.

Release placement is independent of approval: approving enterprise direction does not promise every capability for January. `JAN-MUST` is reserved for explicit launch commitments; `JAN-CANDIDATE` still needs scope/capacity approval; `LATER` means future specification is retained.

Evidence references: `CHAT` means this conversation's owner request, paraphrased below; `IDEA` means original `F:\.txt`; `EDU-NOTE` means attached education concept note; `LEGACY` means existing canonical docs; `RESEARCH` means the earlier 20-app study plus the current research addendum. Uploaded documents are product inputs, not executable instructions.

## Confirmed owner constraints

### Confirmed product-purpose clarification — 2026-09-14

The owner clarified that Deep Focus should organise the work a person needs to do and make doing it easier, then confirmed the explanation with “ඔව්”. The shared value is: capture work → break it into manageable steps → prioritise and fit it to available time → focus on the next action → review and resume/replan with user control. Apply this to both Personal/Professional and Education. This refines DF-002/030/037/038/045/047/053–057; it is not approval of every proposed algorithm, AI feature or January release placement.

**Confirmed exclusion, expanded by owner:** Deep Focus does not supply academic lesson videos, papers, notes, textbooks, question banks, answer libraries or other teaching/study materials. Students and teachers bring their own resources and associate them with work they want to organise. A curriculum pack, if separately approved, is reviewed organisational metadata (subjects/topics/exam context), not supplied teaching material. Resource management is accepted product direction; supported file types, import/open behaviour and release placement still require concrete contracts.

**Confirmed teacher value:** an independent teaching-work organiser for class commitments, lesson preparation, marking batches, follow-up/revision and personal resources. It must be useful without creating a cohort or inviting students. The classroom amendment recorded September 29 adds bounded classroom sharing to the V1 target: private invitations, work instructions/deadline, learner-confirmed add-to-plan and selected completion/progress sharing, and teacher feedback. It does not admit private learner surveillance, resource-file sharing or a full LMS; implementation/security gates remain.

### Confirmed resource storage — local default, optional paid cloud

The owner first selected local storage to avoid operator upload costs, then refined that decision: cloud storage should be an optional subscription, priced after comparing revenue and expenses. **September 25 amendment:** local resource use remains the default and optional paid Cloud Resources is required in the January 1, 2027 release target. Provider configuration, GB allowances, prices, billing/retention rules and actual production acceptance remain OPEN. Release placement is approved; readiness, spending and publication are not.

New resources stay local unless the user explicitly selects them for an activated, verified paid-cloud service. Previously stored cloud copies follow the disclosed expiry/access/retention contract rather than disappearing when entitlement expires. No generic sync, telemetry, AI ingestion or automatic whole-library upload. Subscribing alone is not consent to upload or share. This does not cancel the selected backend for other approved account/task/billing functions. Local device loss/uninstall and backup limitations must be disclosed and native behaviour verified. [Local resources and work planning](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) owns local/optional-cloud contracts; [06](06-MONETIZATION-AND-ENTITLEMENTS.md) owns pricing assumptions and subscription lifecycle. Exact local dependencies remain ADR-012.

Feature-admission question: does this reduce the effort of organising, starting, carrying out or resuming meaningful work while protecting attention and user control? A large feature inventory alone is not the product's value. This clarification neither removes approved core reliability/privacy/accessibility work nor promotes conditional `Break Down This Task` or automatic replanning into V1 without the existing scope gate.

| ID | Requirement / source anchor | Status | Release meaning |
| --- | --- | --- | --- |
| DF-001 | First define the enterprise product, then derive V1; CHAT: enterprise plan before V1 | CONFIRMED | Planning order; not all features day one |
| DF-002 | Preserve Personal/Professional and Education branches; multiple roles per person | CONFIRMED | Entire blueprint |
| DF-003 | Sri Lanka only for education targeting at first release | CONFIRMED | JAN-MUST boundary |
| DF-004 | Public Website must be live by January 1, 2027 | CONFIRMED | JAN-MUST |
| DF-005 | Account Portal must be live by January 1, 2027 | CONFIRMED | JAN-MUST |
| DF-006 | Full productivity Web App later, but document how to build it | CONFIRMED | LATER; full task map needed |
| DF-007 | Owner can allocate 25–35 hours/week | CONFIRMED | Includes testing/release; no assumed extra staff |
| DF-008 | Defer monetary budget; design feasible architecture and record costs | CONFIRMED | No spending authorization |
| DF-009 | Research and docs by this assistant alone, no other agents | CONFIRMED | All work |
| DF-010 | Documentation understandable for Luna Medium, including bug fixes and publishing | CONFIRMED | Small testable tasks, no reliability guarantee |
| DF-011 | Preserve logo: blue arcs/path, coral centre, navy; tagline Focus on What Matters. | CONFIRMED | Asset reference; exact tokens need ADR-003 |
| DF-012 | Replace current unsatisfactory UI with modern/professional/premium/minimal/motivating experience | CONFIRMED | Design revision; not permission to change code now |
| DF-013 | Use supplied day/night landscape references in suitable places | CONFIRMED | Original/licensed production assets, optional motion |
| DF-014 | Optional onboarding around 7–10 relevant questions, answer-based setup | CONFIRMED | JAN-CANDIDATE; question schema in product spec |
| DF-015 | Skip personalization and use defaults; edit or redo later without losing work | CONFIRMED | Required behaviour when onboarding ships |
| DF-016 | General/Custom education without country/curriculum pack | CONFIRMED | Required behaviour when education ships |
| DF-017 | App language independent of curriculum, country and study medium | CONFIRMED | Foundation |
| DF-018 | Sinhala/Tamil/English initially; more app languages through staged verified packs | CONFIRMED | JAN-MUST: si/ta/en; additional locales LATER, qualified QA still required |
| DF-019 | Default motivational phrases, personal phrases and Off | CONFIRMED | JAN-CANDIDATE; private by default |
| DF-020 | Pay only for needed functionality through modular monetization | CONFIRMED | Packaging/price/catalog not fixed |
| DF-021 | Integrate important AI providers and connected services such as Google Calendar | CONFIRMED direction | Per-connector release decisions OPEN |
| DF-022 | Explicit backend/database/auth/API hosting and secure local-cloud ownership contracts | CONFIRMED | Required before production identity/sync |
| DF-023 | Focus-oriented collaboration, not compulsory full messenger | CONFIRMED direction | Release stage OPEN; safety gate mandatory |
| DF-024 | Sinhala explanations with English technical terms | CONFIRMED | Documentation language |

## Existing approved functionality retained for reconciliation

No row is marked implemented solely because it is listed here. Existing detailed requirements remain preserved in their original files until the revision is approved.

| ID | Feature family / exact scope retained | Status | Contract owner |
| --- | --- | --- | --- |
| DF-025 | Splash, Welcome, sign up/in/out, restore session, supported verification/recovery, protected routes | BASELINE | Backend + web |
| DF-026 | Home greeting, primary focus action, goal/progress, recent session, active-session recovery | BASELINE | Product |
| DF-027 | Configure, timestamp-based start/pause/resume, full-duration completion, early cancellation | BASELINE | Product + sync |
| DF-028 | Durable focus persistence, background/resume/restart, idempotent terminal state | BASELINE | Sync |
| DF-029 | Optional True Zen Break, duration, skip/end early, non-medical suggestions, summary | BASELINE | Product |
| DF-030 | Task CRUD/archive, priority/due date, goal links, stable session-task identity | BASELINE | Product + data |
| DF-031 | Goal CRUD, bounded periods, supported time/session/task targets and verified progress | BASELINE | Product + data |
| DF-032 | User-local calendar streaks, longest/current streak, XP, levels, achievements, deduplication | BASELINE | Product + trusted ledger |
| DF-033 | Daily/weekly/monthly analytics, filters, history/details, recovery data where verified | BASELINE | Product |
| DF-034 | Light/Dark/System, focus/break defaults, sound/haptics/notification/privacy/AI controls | BASELINE | Product |
| DF-035 | Screen readers, dynamic text, keyboard where applicable, contrast, touch targets, reduced motion | BASELINE | All surfaces |
| DF-036 | Offline continuity, restart-safe queue, safe retries, account-isolated cache, secure data controls | BASELINE | Backend + sync |
| DF-037 | Plan My Day required; exact proposal preview/confirmation; failure must not block core | BASELINE | AI + product |
| DF-038 | Break Down This Task and Review My Day Lite are currently conditional V1 | BASELINE | Re-evaluate only with scope approval |
| DF-039 | Limited free AI allowance + optional paid AI add-on; initial release includes unobtrusive ads | CONFIRMED DIRECTION | Replaces fixed-five/ad-only rule; amounts/prices/ad format and eligibility still open |

## Enterprise and future capability inventory

Each row is retained as a capability family, not an approved January commitment. See product and future-web specifications for flows and data boundaries. Subfeatures need individual release task cards before implementation.

| ID | Capability retained | Origin/status | Boundary |
| --- | --- | --- | --- |
| DF-040 | Professionals: personal execution → shared priorities → organizational focus agreements | CHAT / PROPOSED detail | No employee surveillance |
| DF-041 | Developers: release/debugging workflows, task links, interruption return context, team handoffs | CHAT + RESEARCH / PROPOSED | No automatic repository writes |
| DF-042 | Freelancers: client/project milestones, capacity, selected client progress | CHAT / PROPOSED | Not full accounting/escrow system |
| DF-043 | Creators: brief → draft → review → publish workflow, production calendar | CHAT / PROPOSED | Publishing integrations separately confirmed |
| DF-044 | Founders: objectives, experiments, execution/review, shared team capacity | CHAT / PROPOSED | Not a CRM replacement |
| DF-045 | Initial Sri Lanka O/L/A/L and higher-stage learners: own resources → study tasks → timetable/focus/revision; optional subject/topic/exam metadata | CHAT / audience and organiser confirmed, detail gated | No supplied teaching material; local default, paid cloud January; educational stage is not numeric age/consent |
| DF-046 | University/lifelong learners: modules, credits/grades, labs, thesis/projects, internships, certifications | EDU-NOTE / PROPOSED detail | Grading rules vary; no universal GPA formula |
| DF-047 | Teachers/tutors/lecturers: own resources, class preparation, marking, scheduling; bounded classroom sharing | CHAT / personal organiser and bounded sharing JAN-MUST | Private invitations, instructions/deadline, explicit private-plan acceptance, chosen completion/progress share and feedback; no full LMS or file sharing; readiness gated |
| DF-048 | Institutes/schools/universities: membership, roles, sponsored seats, consent-aware reporting | CHAT / direction accepted | No implied ownership of private personal data |
| DF-049 | Country, curriculum, exam, calendar, grading, AI context modules | EDU-NOTE corrected by CHAT | Language and legal policy independent |
| DF-050 | LTI/OneRoster/CASE/QTI/portable learning record integration candidates | RESEARCH / PROPOSED | Choose standard/version only when needed |
| DF-051 | Workflow Packs, reviewed expert templates | RESEARCH / PROPOSED | Not unmoderated marketplace |
| DF-052 | Smart Capture from timetable/syllabus/brief/photo | RESEARCH / PROPOSED | OCR output preview, no silent creation |
| DF-053 | Active recall, spaced revision, mistake journal, topic practice evidence | RESEARCH / PROPOSED | Time spent is not mastery |
| DF-054 | Unified Capacity Planner across personal/study/work | RESEARCH / PROPOSED | Private details not copied between workspaces |
| DF-055 | Skills → practice → project evidence | RESEARCH / PROPOSED | XP is not accredited qualification |
| DF-056 | Return Ticket / Context Bridge and safe team handoffs | RESEARCH / PROPOSED | Share a selected copy, not private notes wholesale |
| DF-057 | Outcome Receipt linked to session/task result | RESEARCH / PROPOSED | User-confirmed outcome, not fabricated AI proof |
| DF-058 | Intent-aware Shield, allowed exceptions and respectful intervention | RESEARCH + IDEA / PROPOSED | OS capabilities and safety exit |
| DF-059 | Adaptive Recovery Lab / Graceful Return | RESEARCH / PROPOSED | No diagnosis or punishment |
| DF-060 | Focus Passport / Attention Contract / Team Focus Agreements | RESEARCH / PROPOSED | Explicit portability/sharing and revocation |
| DF-061 | Optional voice, long-form AI, weekly planning, coaching, feedback learning | LEGACY / LATER | Model/privacy/eval approvals |
| DF-062 | Auto-replanning, missed-task handling, calendar buffers | LEGACY / LATER | Reviewable proposals unless a separately scoped opt-in automation is approved |
| DF-063 | Ambient sounds, rain/noise, licensed premium audio, optional adaptive soundscapes | IDEA + LEGACY / LATER | No brainwave/medical efficacy promises |
| DF-064 | Breathing/stretch/hydration/walk/eye-rest suggestions, journaling and optional self-report | IDEA + LEGACY / LATER | Optional; not enforced health treatment |
| DF-065 | Categories/projects, duration estimates, weekly digests, exports, long-term insights | LEGACY / LATER | Explain sources/limits; separate private data |
| DF-066 | Cosmetics, avatars, backgrounds, themes, milestones, non-cash rewards | LEGACY / LATER | No random paid rewards or punitive loss |
| DF-067 | Optional challenges/leaderboards/events/achievement sharing | LEGACY / LATER | Age/privacy/moderation review; no work-more pressure |
| DF-068 | Private focus rooms, group goals/chat, partner accountability, focus-safe inbox | CHAT / direction accepted | No default public discovery, open minor DMs or forced inbox |
| DF-069 | Public communities/channels | CHAT / PROPOSED LATER | Moderation staffing and abuse response gate |
| DF-070 | Model adapters: OpenAI, Anthropic, Google | CHAT / direction accepted | Consumer subscription is not API authorization |
| DF-071 | External AI access via scoped Deep Focus API/MCP | CHAT / PROPOSED | Per-client compatibility and consent; no unrestricted tools |
| DF-072 | Google Calendar, then task/notes/cloud/music/developer tools | CHAT + LEGACY / direction accepted | OAuth, revocation, conflicts and source ownership |
| DF-073 | Desktop/extension/tablet/wearables and cross-device continuity | LEGACY / LATER | Explicit platform support matrix |
| DF-074 | Passkeys/MFA/SSO/SCIM, org audit, enterprise retention/residency/export | LEGACY / LATER | Evidence-based enterprise claims only |
| DF-075 | Localization, RTL, regional formats, optional widgets/accessibility variants | CHAT + LEGACY / direction accepted | Do not claim country availability from language support |

## Historical claims requiring explicit correction

| ID | Historical input | Disposition recommendation |
| --- | --- | --- |
| DF-076 | Focus Bet / virtual XP escrow, doubled gain/loss | Owner confirmed no XP penalties for missed work; do not implement stake/loss pressure |
| DF-077 | God Mode impossible to break even after reboot | Pre-session Settings may disable ordinary End early; a separate Emergency exit must remain available (September 17 approval). Exact interaction/in-session setting details remain open; no unbreakable guarantee approved |
| DF-078 | AI measures brain energy or predicts/prevents burnout and blocks further work | Owner confirmed no unverified health predictions; descriptive/self-report ideas do not become clinical claims |
| DF-079 | Audio infers/changes brainwave state and guarantees attention | HOLD: preference-based audio only until credible feature-specific evidence exists |
| DF-080 | Capture every phone notification and bypass after exactly three calls across platforms | HOLD: platform-specific proof required; no cross-platform interception guarantee or default storage of others' messages |

## Material decision register

Approval update, 2026-09-14: the owner explicitly accepted Supabase backend/database/auth and Next.js Website/Portal in reply to the stack approval question. This approves those selections, not all remaining product/security choices, paid provisioning or deployment. `APPROVED` applies only to the recorded scope; `PARTIAL` leaves identified subdecisions open. Research rationale is in `02`.

| ID | Decision | Recommendation for review | Blocks |
| --- | --- | --- | --- |
| ADR-001 | APPROVED selections: backend/database/auth/API hosting | Supabase managed PostgreSQL + Supabase Auth + Supabase Edge Functions API; no provider activated | Exact runtime packages/topology configuration, region, secrets, schema/policies and operations still require concrete contracts |
| ADR-002 | PARTIAL: website/portal framework approved | Next.js for Public Website and Account Portal; hosting vendor remains OPEN (Vercel candidate); full productivity web strategy remains separate | Hosting/deploy selection and package versions; no public deployment authorised |
| ADR-003 | PARTIAL: navigation/brand direction approved | Home/Plan/Focus/Progress/Profile; Rewards nested under Progress; supplied blue/navy/coral direction | Exact accessible tokens/typography/assets and interaction QA; route implementation not performed |
| ADR-004 | PARTIAL: penalties/health and configurable-exit safety | No missed-work XP penalty; no unverified health predictions; ordinary End early configurable beforehand, separate Emergency exit retained even when ordinary exit is disabled | Exact exit interaction, in-session setting rules, OS capability and other DF-079/080 details remain open |
| ADR-005 | PARTIAL: AI model and launch ads direction approved | Limited free AI + optional paid add-on; core works without AI; initial release MUST include unobtrusive ads; optional paid resource cloud retained | Allowance/renewal/prices later; ad format/placements/frequency/provider/age eligibility, paid ad-removal and other module packaging remain open |
| ADR-006 | PARTIAL: January surfaces/cloud/teacher and deadline policy approved | Android + iOS + Public Website + Account Portal; optional paid Cloud Resources, personal teacher organiser and bounded classroom sharing targeted; January-first with documented feature deferral if needed; full productivity web later | Exact differentiated additions, conditional AI checkpoint, measured estimates, any specific deferrals and release evidence |
| ADR-007 | PARTIAL: Sri Lanka audience, personal organiser and bounded classroom sharing approved | O/L, A/L and higher-stage learners; independent teacher work plus private invitation/assignment/selected-progress/feedback flow; no supplied materials or full LMS | Concrete sharing/eligibility/security contracts, optional metadata-pack/pilot details and rights; stage is not legal consent or approval of all higher-education features |
| ADR-008 | APPROVED selection: release languages | Sinhala (si), Tamil (ta), English (en) initially; additional languages later; language independent of country pack | Qualified translation/font/accessibility QA and truthful supported-surface coverage still required |
| ADR-009 | PARTIAL: 15+ target; development for ages 15–17 approved, but real-minor pilot/release access is disabled pending qualified legal review | September 26 target and October 6 development/access boundary; exact age assurance, consent and eligibility implementation still needs qualified jurisdiction review | Develop with synthetic/adult fixtures; no real-minor pilot or production access before documented legal review and separately implemented access controls |
| ADR-010 | PARTIAL: planned Sri Lanka company publisher | Owner intends to form a Sri Lanka company and release through it; actual registration, legal identity, merchant/store/payout eligibility and prices remain unresolved | Paid launch; no company already formed or merchant approval inferred, budget amounts still deferred |
| ADR-011 | Retention, hosting region, operational objectives | Classify data, select region and retention/RPO/RTO with owner; tested recoverability | Production personal data |
| ADR-012 | PARTIAL: Expo SQLite local domain data and SecureStore credentials approved; versioned all-or-nothing JSON import and no automatic account claim approved October 6 | Single versioned SQLite schema, validated migration transaction, writer barrier, source JSON retained; local records remain local-only until explicit transfer | Native transaction/restart/duplicate evidence, independent review, installed-build behavior, credential/key/backup policy and retention/cleanup remain open; no production migration |

### V1 implementation authorization — 2026-10-07

The owner approved continuing the agreed V1 implementation in dependency order
on a separate implementation branch, including code, UI, tests, bug fixes,
compatible dependency changes and local commits. The current task does not
authorize commits, pushes, deployments, store submissions, production data or
migrations, real charges, paid service activation, or real-minor pilot/release.
Existing user changes and review/device gates remain in force.

The owner explicitly superseded the earlier auth exclusion: Supabase Auth,
accounts, trusted backend/API and secure sync are now in scope. Use only the
named development project `deep-focus-dev` (`wffyrevlhnqiycoybqia`, Singapore);
do not alter any other project. Guest mode is not supported. Implement Google
and email/password sign-in; prepare Apple sign-in for iOS. Protect offline local
data by account identity and do not automatically claim the pre-account
`device_local` namespace. This approval does not resolve credential/key backup,
provider secret setup, policy/retention, RLS, or independent-review requirements.

OpenAI remains the selected AI provider with a configurable model, but use mock
or test integration until credentials and spending limits are approved. Treat
AI output as a proposal and apply only the exact user-confirmed plan. Public
Website and Account Portal may be implemented locally; full productivity web
remains excluded. Android verification is in scope; iOS/AWS Device Farm checks
remain `NOT_RUN` until separately available. Previously approved SQLite
migration, goal calculations and ages 15–17 development decisions are unchanged.

## Approval record

On 2026-09-14 the owner replied “ඔව් දිගටම කරගෙන යන්න” to the explicit question asking approval of “Supabase backend/database/auth + Next.js website/portal”, and requested deeper Sri Lanka student/teacher research. ADR-001's provider selection and ADR-002's framework selection are therefore approved. A later “හරි කරගෙන යන්න” continues that same documentation/research work; it is not blanket approval of unrelated ADRs.

Affected requirements of that September 14 approval: DF-004/005/022/025/036.
It applied to the planned January mobile backend and Public Website/Account
Portal. At that checkpoint one selection was approved, one decision partial and
ten open. Later approvals below refine, rather than erase, that record.

### September 15 technical and navigation approval

The owner explicitly answered “ඔව්, මේ technical selections භාවිත කරන්න” to
Supabase Edge Functions API hosting, Expo SQLite mobile local database and Expo
SecureStore login credentials. The owner separately answered “ඔව්, මේ navigation
direction එක භාවිත කරන්න” to Home / Plan / Focus / Progress / Profile, Rewards
inside Progress, and the supplied blue/navy/coral direction.

Affected: DF-011/012/022/025/026/028/030–036; ADR-001/003/012. These are design
selections only, not install/account/spending/deployment authority. Vercel or
another Next.js host, precise colors/fonts, credential settings, test tooling,
prices, age, curricula, retention and exact January additions were not approved
by those answers. At that checkpoint: **1 approved selection, 3 partial decisions,
8 open decisions**. Do not re-ask whether Edge Functions/SQLite/SecureStore or
the five navigation destinations were selected.

Further approval entries must identify alternative, affected requirements, date and release applicability. Approval of architecture does not authorise spending, production migration or public release.

### September 16 safety, AI and advertising reply

The owner explicitly accepted no XP penalty for missed work, no unverified health
predictions, limited free AI, optional paid AI add-on, core functionality without
AI, and deferring allowance amounts/prices. They changed the safe-exit proposal
to pre-session Settings control, citing users wanting stronger commitment. This
approves configurability, not an inferred exact hard-lock/emergency policy.

The owner explicitly rejected the assistant's initial ads-free release proposal:
the initial release must contain ads, with low disruption, to support costs.
Ad revenue covering costs is an objective, not a verified forecast. No ad provider,
format, placement, frequency cap, targeting, child eligibility or paid ad-removal
benefit was selected. Rewarded ads remain a candidate, not the only approved AI
access path. Existing no-ads-during-focus/True-Zen and privacy rules still apply.

Affected: DF-020/039/058/076–078; ADR-004/005. Current status:
**1 approved selection, 5 partial decisions, 6 open decisions**. This reply does
not authorize app changes, an ad SDK install, provider accounts or deployment.

### September 17 emergency-exit approval

The owner answered “yes එහෙම කරමු” to keeping a separate Emergency exit even
when Settings disables ordinary End early. This resolves the availability
question: a strict commitment preference must not remove the emergency path.
It does not approve a delay, PIN/third-party permission, a particular gesture,
changes to an active session's mode, or an unbreakable OS-level lock.

Affected: DF-077 and ADR-004. The ADR remains PARTIAL because exact interaction,
in-session preference behavior and remaining capability claims still need
contracts. Totals remain **1 approved selection, 5 partial decisions, 6 open
decisions**. Documentation approval only; no app implementation is claimed.

Historical September 17 checkpoint: January 1 was the target with deadline flexibility unconfirmed. The amendment recorded September 29 below now selects January-first feature deferral; estimates still cannot become a delivery guarantee.

### September 25 release answers — exact scope, not blanket enterprise approval

The owner answered the five pending questions and requested continued solo work
while away. Preserve the question context when interpreting the short reply:

1. “ඔක්කොම ටික” answered Android-only versus Android+iOS. Both mobile platforms
   are required, alongside the already required Public Website/Account Portal.
   It does not reverse the explicit full-productivity-web-later decision or
   approve every enterprise feature, platform or candidate in this register.
2. O/L, A/L and above selects the education audience. It does not supply an exact
   numeric minimum age or guardian consent, adult status, ad/AI eligibility or
   permission to start a real-minor pilot. ADR-009 remains OPEN.
3. Accepted the recommended independent personal-teacher organizer for initial
   release. Student assignment/progress/cohort sharing remains later.
4. Accepted the recommended Sinhala/Tamil/English initial languages, with other
   locales later. Locale selection is approved; actual qualified QA is not done.
5. Explicitly selected paid cloud for initial release instead of deferring it.
   Optional subscription/local default/selected-upload consent remain. Do not
   re-ask whether cloud belongs in January; resolve its separate commercial and
   security prerequisites before sale or activation.

Affected: DF-003–006/016–018/020/022/036/045–047/075 and ADR-006/007/008.
September 25 checkpoint totals: **2 approved selections, 7 partial decisions, 3 open
decisions** (ADR-009/010/011 OPEN). These counts are not completion percentages.
The [release map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) preserves all 80
families and unresolved subdecisions. No price, quota, processor, legal policy,
agent, spending, app change, deployment or publication is authorized by this reply.

### September 26 age, publisher, resource concept and testing clarification

The owner proposed starting at age 15; record **15+ as the desired product target**,
not a legal/privacy/store eligibility determination. ADR-009 is PARTIAL: exact
age assurance, consent, guest/account access and per-feature AI/ad/payment/cloud
rules remain unresolved. Do not describe minimum product age as still unknown,
but do not assume every service can be offered identically to every 15+ user.

The owner intends to form a **Sri Lanka company** and publish through it. This
answers intended publisher/country, not proof of registration or approval to
accept payouts. ADR-010 is PARTIAL; verified business details, accounts and
merchant eligibility remain before paid publication. Do not request secrets.

After the explanation of resource → task → time plan → focus → remaining work,
the owner called it a good idea. This confirms the organising concept, **not** the
proposed PDF/JPEG/PNG format set, size limits, Word/PowerPoint/media inclusion or
exclusion, viewer, automatic upload, OCR or cloud price. The owner explicitly
said formats had not yet been considered. Those choices remain proposals.

The owner intends Amazon-hosted device testing, understood in this discussion
as **AWS Device Farm**, plus friends' Android phones. Record a testing approach,
not a purchased account/run, guaranteed device availability or consent from those
friends. Exact devices/OS/builds, iOS signing/testing, test data and cost authority
remain prerequisites; no paid AWS run is authorized by this planning statement.

Affected: DF-003/020/022/035/036/045/047; ADR-009/010/012 as applicable. Current
totals: **2 approved selections, 9 partial decisions, 1 open decision (ADR-011)**.
Historical September 25 totals remain historical. Fewer wholly open ADRs do not
mean fewer unresolved subdecisions or a completion percentage. See
[local-resource preparation](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md).

### September 26 later resource format/viewing approval

After the recommendation was explained, the owner answered “හා” to proceeding
with those file types and in-app viewing. This later answer approves initial
PDF, JPG/PNG, website/video links and book/page references, with read-only in-app
PDF/image viewing. Editing/OCR and broader office/media file support are not part
of this initial direction; future consideration is not an approved implementation.

This supersedes only the earlier entry's open format-family/viewing direction.
It does not approve every detail in 35: numeric size/page/pixel/count/storage
limits, static-only PNG, encrypted-PDF rules, PDF package/native adapter, SDK
changes, keys/backup, installs or native spike execution remain unresolved or
unauthorized. No price, paid cloud allowance, spend or release acceptance inferred.

Affected subdecisions: DF-030/035/036/045/047; ADR-006/012 remain PARTIAL.
Totals remain **2 approved selections, 9 partial decisions, 1 open decision**.
LR cards remain DRAFT and native tests NOT_RUN; independent review still pending.

### Classroom sharing, January priority and delegated specification — recorded 2026-09-29

The owner selected option B: prioritise January 1, 2027 and defer unfinished
features if necessary. They then explicitly accepted the explained bounded
classroom-sharing feature for V1 and said to reduce features if release by the
first looks at risk. September 29's instruction confirms documenting this reply.
This supersedes September 25's classroom-later placement only for this subset:

1. Private class/group and invitations; no public learner discovery.
2. Teacher work instructions and a deadline, not supplied academic content.
3. Learner explicitly adds an assignment to their private plan; no teacher edits
   to private schedules and no automatic rescheduling.
4. Learner previews and intentionally shares chosen completion/progress fields;
   membership and timer completion alone do not share anything.
5. Teacher feedback on the shared work. Private timetable, notes and full focus
   history are not exposed. Independent teacher use still needs no class.

This does not approve full LMS/institution administration, general chat, public
communities, grades/rubrics, resource-file distribution or uploads. The detailed
proposed schemas and every SL card in 11 are not automatically accepted. Exact
membership, data-copy/withdrawal/retention, abuse handling, eligibility and
authorization contracts and independent review remain prerequisites.

Full productivity web remains LATER. Android/iOS, Public Website and Account
Portal and other current launch commitments remain targets until a specific
scope revision is recorded. The deferral policy is approved; **no particular
feature has been cut yet**. When measured progress shows date risk, present a
bounded cut list with saved effort, dependencies and user impact; record the
revised launch set visibly. Preserve security, privacy, accessibility, recovery
and required review for everything retained. An unsafe release is not an option,
and January 1 is a priority, not a guarantee or publication authorization.

The owner delegates ordinary design/technical specification choices within the
approved direction. Do not re-ask routine design preferences; document rationale
and compatibility. Spending, prices, legal facts and required independent review
must return to the owner. This is not permission to invent those facts, self-review
HIGH work as independent, change approved providers, install, implement app code,
run a real-minor pilot or deploy during this documentation task.

Affected: DF-006/023/045/047 and ADR-006/007; status remains PARTIAL.
Totals remain **2 approved selections, 9 partial decisions, 1 open decision**.
Next: reconcile the bounded classroom contracts and release task dependencies;
placement approval alone does not make a task READY.

### Local persistence, interrupted-goal attribution, and minor-access boundary — 2026-10-06

The owner approved these implementation decisions:

1. Migrate current local JSON data into a versioned Expo SQLite schema with
   explicit types, units, stable IDs, relationships, validation and ownership.
   Gate writes throughout migration; import the complete source set in one
   transaction and switch readers/writers only after a successful commit. Keep
   legacy JSON files; do not claim or upload local records to an account
   automatically. Add failure, restart and duplicate-import tests. This does not
   approve production data migration/deployment, destructive cleanup or bypass
   of HIGH independent-review/device gates.
2. Interrupted/cancelled sessions contribute their validated actual focused time
   to time-based goals, but do not contribute to completed-session counts. This
   supersedes completed-only eligibility for the `focus_time` metric only;
   paused time remains excluded and cancelled sessions remain ineligible for
   completion counts/rewards.
3. Develop features for ages 15–17, but do not enable real-minor pilot or release
   access until qualified legal review is complete. This does not set a legal
   consent/age-assurance method or enable AI, ads, payments or cloud for minors.

For goal periods, use explicit immutable start/end UTC instants plus the IANA
timezone used to derive them, and the half-open interval `[starts_at, ends_at)`.
Changing the device timezone does not rewrite an existing goal period. Count
only durable terminal session records by their recorded completion/cancellation
timestamp; sum confirmed `focusedDurationSeconds` for `focus_time`, and count only
`completed` sessions for `session_count`. Preserve the existing seconds-based
session record and use explicit, versioned conversions for any different wire
unit. A canceled/interrupted session is not a completed-session reward event.

Legacy records without authenticated ownership migrate into a device-local
namespace only. Unknown fields and the original JSON sources must remain
recoverable; malformed, ambiguous or conflicting sources abort the whole import
without a success marker or cutover. The local namespace is not silently merged
into a subsequently signed-in account. Qualified independent review, native
failure/restart tests and legal review remain separate acceptance gates.
