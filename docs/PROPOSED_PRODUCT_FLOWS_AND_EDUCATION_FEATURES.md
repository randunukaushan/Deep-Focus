# Deep Focus — Proposed UX and Education Feature Backlog

Reconciled **2026-10-22**, against main
`adebb0fdf9ade89a551c38d15ac22c4060c1b6e4`.
Status: proposal/design exploration; no new V1 scope, UI or implementation
authorization. Existing source may already overlap parts of these ideas; that
is not evidence the whole proposed workflow has been implemented or accepted.
Decision owner: product owner. Authority: [V1 scope](V1_FEATURE_SCOPE.md),
[owner decisions](revision/01-REQUIREMENTS-AND-DECISIONS.md),
[screen map](V1_SCREEN_MAP.md), [Color System](COLOR_SYSTEM.md),
[UI specification](UI_UX_DESIGN_SPECIFICATION.md),
[components](COMPONENT_LIBRARY.md) and
[global planning reference](GLOBAL_EDUCATION_COUNTRY_PACK_ARCHITECTURE.md).
Original ideas remain traceable at [original PR head](https://github.com/randunukaushan/Deep-Focus/blob/40ff8928c4d2887a12ea8ea1f8a6a671f746186a/docs/PROPOSED_PRODUCT_FLOWS_AND_EDUCATION_FEATURES.md).

## 1. Purpose and decision boundary

This document preserves the ideas discussed for (a) a simpler daily user experience, (b) the Sri Lanka education experience, and (c) educator value and workflows so that they can be evaluated later without silently entering the protected V1 release.

- **Existing approved V1 capabilities** remain governed by `V1_FEATURE_SCOPE.md`. The proposed Today → Focus → Done presentation may reorganize how existing V1 functions are surfaced, but it is **not** an approved replacement for existing V1 navigation or features.
- Expanded Global Education/pack framework, institution dashboards, grades and
  country-aware academic AI remain later proposals. Already admitted Sri Lanka
  learner/independent-teacher/bounded-classroom work and si/ta/en are not deferred
  by this backlog. Optional reviewed metadata remains an existing candidate,
  not a required pack or automatic V1 promotion (see section 6).
- This is a feature inventory and UX concept, **not** a delivery promise, implementation specification, or confirmation that these features already work.
- No code, database schema, API contract, release date, subscription plan, or user-role permission is approved here.

## 2. Proposed minimal UX: Today → Focus → Done

### 2.1 Product intent

One calm daily journey:

```text
Today (choose one meaningful next action)
  → Focus (do the work with minimal interruption)
    → Done (see verified progress and choose what is next)
      → Today or an optional next focus session
```

The three names describe a **journey**, not new permanent tabs. Current canonical
tabs remain Home / Plan / Focus / Progress / Profile, with Tasks/Goals in their
existing routes. October 20 already authorizes current whole-app preview
alignment; this unapproved alternative does not revoke that or approve new
navigation. No screens, recovery actions or supported settings are removed.

Current five-step onboarding remains language, future focus duration, future
break duration, appearance and motion. This backlog does not add role, country,
education or institution questions, permission requests or inferred consent.

### 2.2 Screen A — Today / Home

**Primary question:** “What should I focus on now?”

**Visual hierarchy, top to bottom:**

1. Small greeting, local date, and optional accessible account/settings access.
2. **Next focus card** with one suggested or selected task, optional linked goal, and a clear `Start Focus` primary action.
3. Compact daily progress: verified focused minutes and completed tasks versus the user's configured targets. Do not show fabricated progress.
4. **Today's tasks** as a short, scannable list, with task title, optional due information, completion state, and a way to choose a task for focus.
5. Contextual secondary actions: `Add task`, `View all tasks`, `Plan My Day` when the existing approved AI action is available, and recovery of an interrupted session.
6. Optional quiet summary of recent verified activity; avoid competing hero cards.

**Interaction rules:**

- A user can start an unlinked focus session; choosing a task is optional.
- Selecting a task changes the focus context, not its completion state.
- `Plan My Day` produces a reviewable proposal; the user must confirm any changes.
- If an active or recoverable session exists, `Resume / Recover` takes priority over starting a conflicting session.
- On an empty day, show a friendly empty state with `Start Focus` and `Add task`, not a dead end.
- Offline mode should keep available local tasks and core focus actions usable according to approved synchronization rules.

**Low-fidelity layout:**

```text
┌────────────────────────────────┐
│ Today                 Settings │
│ Good morning · Thu, 15 Oct    │
│                                │
│ Your next focus                │
│ [Selected task / Free focus]   │
│ [        Start Focus        ]  │
│                                │
│ Today: 50 min focused · 2 done │
│ ────────────────────────────── │
│ Today's tasks                  │
│ ○ Read chapter 3              │
│ ○ Revise key formulas          │
│ ✓ Organize notes              │
│                                │
│ + Add task      View all →     │
│ [Existing primary navigation]  │
└────────────────────────────────┘
```

All names, dates, durations, and tasks above are **illustrative**, not app data.

### 2.3 Screen B — Focus

**Primary question:** “Can I stay with this one task?”

**Visual hierarchy:**

1. Task or `Free focus` title and optional short session intention.
2. Large, accessible remaining-time display / approved circular timer.
3. Subtle session progress and duration context.
4. Primary controls for `Pause / Resume` where supported; secondary `End / Cancel` with appropriate confirmation.
5. Minimal optional sound and focus preferences if already supported; no feeds, busy analytics, or unrelated calls to action.

**Behavior:**

- The timer follows validated persisted timestamps/lifecycle state, not visual
  interval ticks alone. Local elapsed time is not trusted server credit, proof
  of attention, academic learning or a grade.
- Backgrounding, app restart, temporary offline use, recovery, and duplicate-safe completion follow existing V1 rules.
- Do not interrupt the session with ads, AI suggestions, rewards, or nonessential notifications.
- Retain current configurable ordinary-exit and separate Emergency-exit direction;
  no unbreakable lock, missed-work XP penalty or newly approved exit interaction.
- Hide primary navigation during an immersive active session only in line with existing navigation guidance.
- Handle starting, running, paused, resuming, recovering, completing, canceling, and error states explicitly.

**Low-fidelity layout:**

```text
┌────────────────────────────────┐
│ Focus                  •••     │
│                                │
│ Revise key formulas            │
│                                │
│           24:18                │
│        [timer ring]            │
│                                │
│          Pause                 │
│                                │
│       End session              │
└────────────────────────────────┘
```

### 2.4 Screen C — Done / Session Summary

**Primary question:** “What did I actually finish, and what is the next sensible action?”

**Visual hierarchy:**

1. Calm confirmation of the actual session state (completed, ended early, or canceled), not a generic success claim.
2. Verified focus duration, task/goal association, and eligible daily progress.
3. Optional verified streak/XP/achievement details as secondary information, never pressure to continue working.
4. A clear `Back to Today` primary action and an optional `Focus again` secondary action.
5. Optional break/recovery transition using the existing True Zen Break behavior.
6. Task completion is **separate** from timer completion: offer `Mark task complete` only if the task is not already complete and the user explicitly chooses it.

**Low-fidelity layout:**

```text
┌────────────────────────────────┐
│ Session complete               │
│                                │
│ 25 minutes focused             │
│ Revise key formulas            │
│ Today: 75 minutes total        │
│                                │
│ [ ] Mark task complete         │
│                                │
│ [       Back to Today       ]  │
│ Focus again     Take a break   │
└────────────────────────────────┘
```

### 2.5 Cross-screen states and acceptance questions

- **States:** first-time/empty, normal, loading, paused, completed, canceled, interrupted/recoverable, offline/pending sync, and error/retry.
- **Accessibility:** meaningful labels, screen-reader timer/status announcements without excessive repetition, dynamic type, touch targets, contrast, reduced motion, keyboard/safe-area support where applicable.
- **Visual system:** reuse current semantic tokens/components and the dated
  Color System authority; no local hard-coded palette or new token mapping.
- **Privacy:** show only data the current user is authorized to see.
- **No silent workflow changes:** an AI proposal, timer completion, or educator assignment must not automatically mark a task completed without an approved rule and clear user control.
- **Future UX questions:** if this alternative is later selected, define the
  exact Home/Today labeling/card/break handoff without undoing current decisions.
  Task completion already remains explicit and separate from session completion;
  this is not a newly unanswered policy. Do not block existing V1 work waiting
  for approval of an unrelated redesign.

## 3. Sri Lanka education extensions — existing V1 subset retained

A Sri Lanka Country Pack supplies local academic context and references separate Curriculum, Exam, Language, and Compliance Packs; it must not absorb all their responsibilities.

This describes a possible future structured pack, not a currently shipped one.
General/Custom subjects/own work require no official pack. Existing Sri Lanka
O/L/A/L/higher-stage organization, independent teachers and bounded classroom
sharing already have V1 placement; the richer candidates below do not defer
them or automatically admit every academic feature. Education11 and owner
September25/29 decisions own exact boundaries.

### 3.1 Learner profile and localization

- School / tuition / university / other supported learning track.
- O/L, A/L, university, or generic study profile; A/L streams and relevant subjects where supported.
- Sinhala, Tamil, and English interface/content terminology as separately versioned language support.
- Subject-specific goals, target exams, academic years/terms, and user-selected study availability.
- School and tuition class timetables, including theory, revision, paper, online classes, and optional travel buffers.

### 3.2 Study execution and examination preparation

- Subject/topic progress and curriculum-version awareness when authoritative syllabus data exists.
- User-owned resource references and study tasks under the existing local/default
  resource contract, not supplied teaching content. Initial format families are
  PDF/JPG/PNG, website/video links and book/page references; recordings, OCR,
  broader file formats and classroom file distribution are not thereby admitted.
- Homework, assignments, past-paper practice, timed paper simulations, and user-recorded results.
- Error logs, weak-topic maps based on sufficient evidence, revision queues, exam countdowns, and backward study plans.
- Weekly targets, actual focused study time, backlog/catch-up plans, and task-to-focus breakdown.
- Optional country-aware AI planning that uses structured pack context and asks for confirmation before changes.

### 3.3 University extension

- Semesters, modules, credits where relevant, assignment/project milestones, lecture/lab schedules, exams, and optional grading/GPA support only where the grading model is reliable.

### 3.4 Practical constraints

- Offline/low-data access and safe sync recovery should be considered early.
- Exam dates, syllabus content, grading, and calendars require verifiable sources, versioning, and clear provenance; do not invent official information.
- Child/minor accounts, teacher access, guardian visibility, and academic records require explicit privacy, age, consent, and authorization design.
- A tuition-fee collection, QR attendance, payment, or full tuition ERP suite is **not** the initial direction.

## 4. Expanded educator dashboard — later proposal, not all teaching work

Independent personal-teacher organization and the September29 private invitation,
work-instruction/deadline, learner-confirmed private-task adoption, selected
completion/progress sharing and text-feedback subset already target V1.
Full dashboard/aggregates, grades/rubrics, paper publishing, resources/files,
institution management and AI Teacher Assistant below remain outside that subset.

**Core educator benefit:** see whether assigned independent study is being completed, which topics may need reinforcement, and what focused follow-up work is useful—without turning Deep Focus into a student-surveillance product.

**Teaching-to-focus loop:**

```text
Teach topic → Assign practice/revision
  → Learner reviews and focuses
    → Learner submits completion or assessment evidence
      → Educator sees authorized progress / aggregated gaps
        → Educator plans the next lesson or revision
```

### 4.1 Suggested educator dashboard sections

| Section | Proposed capability |
| --- | --- |
| **Classes** | Subjects, cohorts/batches, theory/revision/paper groups, class schedule, and membership permissions |
| **Assignments** | Publish homework, tutes, papers, study-hour guidance, deadlines, and controlled resources |
| **Syllabus** | Lesson/topic coverage, next topics, planned revision, and curriculum version references |
| **Papers** | Paper tasks, assessment outcomes, error themes, and topic-level review where evidence is adequate |
| **Insights** | Authorized completion summaries, aggregate weak-area signals, catch-up needs, and exam-readiness indicators with uncertainty explained |

### 4.2 Additional candidate workflows

- Student task and focus-session breakdown from teacher-published work.
- Suggested independent-study targets; learner can adapt schedules within permitted constraints.
- Student self-reported completion and assessment evidence; distinguish self-report from verified records.
- Revision planning, class announcements, and controlled resource links.
- Optional AI Teacher Assistant for drafting revision suggestions or summarizing **authorized, sufficiently aggregated** evidence; suggestions must be reviewable.
- Potential educator-facing web/tablet dashboard as a later platform option; not an approved stack decision.
- Potential educator pricing/tier as a business hypothesis only, with no approved plan or price.

### 4.3 Privacy and role boundaries

- Student-to-teacher sharing must be transparent, purpose-limited, permissioned, and appropriate to age and jurisdiction.
- Do not expose private personal focus histories, detailed activity surveillance, or sensitive learner data by default.
- Aggregates would need separately reviewed privacy controls if later admitted;
  no numeric cohort threshold or aggregate access policy is chosen here. Existing
  classroom security contracts, not this mock dashboard, govern actual sharing.
- Avoid unrestricted teacher-student direct messaging, coercive study-hour enforcement, or punitive rankings.
- Parent/guardian visibility, if ever added, should be narrow, read-only where appropriate, and reviewed independently.
- Role-based access control, account linking, revocation, auditability, and retention need approved contracts before implementation.

### 4.4 Example (illustrative, not product behavior)

A physics teacher publishes practice for a topic and recommends a reasonable study target. A learner chooses their own focus sessions, works through questions, and submits results. The educator receives only authorized completion/assessment evidence and can decide whether the next class needs revision. No real student data or analytics is implied.

This richer assessment example is not the V1 wire contract: V1 sharing is selected
completion/progress and text feedback, not marks/weak-topic dashboards, automatic
focus-history disclosure or transmission of resource files. Membership is not
sharing consent. Real-minor access remains disabled pending qualified legal
review and separately implemented controls; no real learner records used here.

## 5. How future V1 decisions should be recorded

Existing owner-approved V1 inclusions remain in force. Only a genuinely new
expansion or deferral needs an exact additional decision; do not re-ask already
recorded audience/language/teacher/classroom choices or block approved work.
This backlog does not authorize implementing its new alternatives.

For each proposed promotion, record:

1. Feature name and exact user outcome.
2. `V1`, `V1.1`, `post-V1`, or `deferred` decision and explicit owner approval.
3. Included screens/actions and explicit exclusions.
4. Dependencies on existing approved features and whether navigation changes.
5. Privacy, minor/educator permissions, offline behavior, and accessibility.
6. Data model/API changes, test criteria, and release impact.

A proposed `Today → Focus → Done` UX refinement should first be evaluated as a **presentation of existing V1 behavior**, not a license to delete existing Home, Focus, Tasks, Analytics, settings, or recovery functionality.

## 6. Current decision log

| Topic | Current status |
| --- | --- |
| Today → Focus → Done simplified UX | Proposed design, pending product-owner V1 selection |
| Sri Lanka pack framework | Future proposal; optional reviewed metadata remains an existing ADR-007 candidate, not a mandatory General-mode pack |
| O/L / A/L / higher-stage organizer | Already admitted V1 audience/work boundary; richer university/grades/mastery proposals not automatically admitted |
| Independent teacher / bounded teaching loop | Existing V1 organizer plus September29 private instruction/selected-progress/text-feedback subset; detail/review/eligibility gates open |
| Expanded educator/institution dashboard | Later proposal; no aggregate/grade/resource-file permission from current classroom scope |
| Sinhala / Tamil / English | Required launch locales; QA unverified, language does not select country or consent |
| Own resources / optional paid cloud | Local default, January optional paid-cloud capability required; no automatic upload, price or classroom sharing approval |
| Android / iOS / Website / Account Portal | Required four surfaces; full productivity web and teacher web workspace later |
| AI Teacher Assistant | Post-V1 proposal; privacy and AI contracts needed |
| V1 feature list / deadline | Unchanged; governed by existing V1 documents |

Next: follow current foundation/implementation order and scoped acceptance,
not a fresh blanket V1-selection exercise. New candidates need exact owner
admission and relevant technical/privacy/age/review gates. This merge changes
no UI, schema or provider and does not certify native/hosted/legal acceptance;
product remains NOT_READY. See [actual reconciliation checks](revision/evidence/PR17-EDUCATION-RECONCILIATION-2026-10-22.md).
