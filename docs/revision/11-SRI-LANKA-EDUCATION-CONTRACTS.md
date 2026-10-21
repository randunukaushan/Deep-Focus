# Sri Lanka Education: Bounded Implementation Contracts

Status: **DRAFT, NOT READY FOR IMPLEMENTATION**, started 2026-09-14; current scope includes the September 25/26 owner amendments and classroom amendment recorded September 29. This expands L-12/FUT-02 using the [Sri Lanka research](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md). The owner selects O/L/A/L/higher-stage learners, independent personal-teacher organization and bounded classroom sharing for V1, with si/ta/en launch locales and optional paid cloud. The desired product target is 15+; legal consent/eligibility and age assurance remain unresolved. These choices do not approve a curriculum, real-minor pilot, every proposed cohort contract, exact dependency configuration or migration. [01](01-REQUIREMENTS-AND-DECISIONS.md) owns approval; [04](04-BACKEND-SECURITY-AND-SYNC.md) owns shared security/sync; [05](05-WEB-AND-INTEGRATIONS.md) owns web surface boundaries.

අරමුණ: Lunaට learning data, teacher permissions සහ learner-private work අතර වෙනස අනුමාන කරන්න නොදී පැහැදිලි කර දීම. “Proposed” rules implementation commands වන්නේ අදාළ ADR සහ canonical contracts අනුමත කර reconcile කළ පසුව පමණි.

## 1. Scope and decision dependencies

Confirmed owner boundary: students organise study work and teachers organise teaching work using their own resources. Deep Focus supplies no academic videos, papers, notes, books, questions or answers. Resources are local by default; optional paid cloud is January-required but awaits exact pricing/limits/security and launch acceptance. A reviewed pack is optional organisational metadata, not teaching content. The [resource contract](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) is the resource authority; bounded classroom sharing now has V1 placement, not permission to transmit private resources. See the [product-purpose clarification](01-REQUIREMENTS-AND-DECISIONS.md).

Requirement families: DF-003, DF-014–018, DF-022–025, DF-030/036, DF-045–050 and DF-053–057. No new approval is inferred from adding this detail.

| Layer | Proposed content | Release placement |
| --- | --- | --- |
| General learner | Own local resources, custom subjects, commitments, private plan, focus, optional practice/return | January O/L/A/L/higher-stage organizer selected; optional practice/return details still gated; no pack dependency |
| Verified Sri Lanka pack | Optional reviewed qualification/subject/topic/exam metadata | Candidate under ADR-007/008; no supplied teaching material |
| Independent teacher | Own local resources, private class preparation, marking batches and scheduling | January personal organizer selected September 25; detailed implementation gated; no classroom membership required |
| Teacher-lite cohort | Private invitations, work instructions/deadline, explicit private-plan acceptance, chosen completion/progress share, text feedback | V1 target per amendment recorded September 29; detailed contracts/review still gated, no real-minor pilot approved |
| Institute workspace | Membership administration, multi-teacher ownership, seat controls, audit | Future enterprise scope unless explicitly promoted |
| Full teacher web workspace | Desktop class management, bulk workflow, richer reporting | Separate future surface; account portal is not a full LMS |

### Admitted classroom subset — recorded September 29

The selected subset uses SL-F2/SL-F3 only for private invitations, assignments,
learner-confirmed personal task creation, selected completion/progress copies and
text feedback. Membership is not sharing consent; no automatic disclosure of a
private timetable, notes or full focus history. SL-F4 remains useful without a class.
Instructions/progress-only operation requires no classroom file upload.

The broader entity/permission/flow tables below remain proposals: numeric marks,
rubrics, aggregate dashboards, institution administration, general messaging,
resource-reference/file distribution and full browser classroom tools are not
promoted by this decision. In particular, the optional assessment in SL-F3 step 7
and aggregate-statistics row are outside the admitted subset. Required data
rights, revocation and access isolation are not optional extras.

SL-06–08's relevant private-class portions need concrete bounded cards, canonical
API/data/security reconciliation, privacy/eligibility policy and independent
review before implementation. No whole-card blanket approval is inferred. Apply
the January-first deferral policy in 32 if estimates do not fit; no feature cut
or removal of a safety gate has already been selected.

[Bounded classroom packet 39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) now refines
this subset into eight DRAFT CL cards and 24 NOT_RUN CT cases. It specifies
categorical selected progress (no grades/private notes), class-copy boundaries,
retry/revocation ordering, private Task acceptance recovery and privacy coverage.
These detailed engineering choices need independent review and canonical wire/
schema reconciliation; the wider tables below do not override that subset.

Supabase PostgreSQL/Auth/Edge Functions, Expo SQLite for mobile domain storage, Expo SecureStore for credentials and the Next.js Website/Portal framework are selected. Next.js hosting, exact API topology/configuration, RLS schemas, auth factors, transactional adapters/migrations and tool versions remain unresolved where noted in ADR-002/009/011/012. ADR-006 owns January feature inclusion, ADR-007 exact curriculum, ADR-008 the approved si/ta/en list with qualified QA still required, ADR-009 age/consent, ADR-011 retention/region/operations. ADR-005/010 apply where billing is introduced. Selecting a provider does not resolve these contracts automatically or establish installed integrations.

Before READY, every SL card needs: approved surface and owner; exact canonical section changes; concrete route/file paths after current-code inspection; versioned DTO/SQL definitions; approved limits/error codes; real test commands; dependency decisions; safe migration and rollback plan. The tables here define the intended behaviour but are not deployed SQL or a complete OpenAPI specification.

## 2. Context fields and invariants

| Field / concept | Proposed meaning | Must not imply |
| --- | --- | --- |
| `uiLocale` | Application text locale | Country, grade, medium or billing country |
| `learningContext` | `general` or selected pack reference | Nationality or eligibility for a legal policy |
| `qualification` | `ol`, `al`, `custom`, later reviewed types | Exact age or school membership |
| `examCohortYear` | Learner-selected intended examination cohort; optional | Verified exam date or current grade |
| `courseMedium` | Content language per subject/course | Automatic UI-language change |
| `packRef` | `{ packId, version }` or absent | Mutable latest-version lookup for historic results |
| `topicRef` | `{ packId, packVersion, topicId }` or personal custom-topic ID | A translated label used as an identity |
| `timeZone` | IANA zone for schedule interpretation; Asia/Colombo example | Country inferred from IP or immutable travel location |
| `agePolicyContext` | Approved minimum-data eligibility/consent result with policy version | Role questionnaire answer accepted as consent |

Rules:

1. General/Custom is useful without a pack or classroom. A private/repeat candidate can choose a cohort year without naming a school.
2. A person can have multiple role preferences. Workspace membership, educator permissions and guardian authority are independently verified.
3. Topic labels support per-language values; source edition and stable IDs survive rename, translation and pack removal.
4. Upgrading a pack produces a reviewed mapping preview; unmapped topics remain readable with their old label/reference. Never rewrite marks, completed sessions or personal custom topics to make an upgrade look complete.
5. Missing translation is labelled in its actual language. Do not generate an unreviewed translation and label it official.
6. `examDate` is separate from cohort year: `{ date, timeZone, status: provisional|verified, sourceUrl, verifiedAt, sourceVersion }`. Exact schema and stale-date display must be frozen before release. No unsupported exact 2027 dates in fixtures presented as facts.

## 3. Entity ownership and lifecycle proposal

Existing tasks/sessions/goals remain shared core entities; avoid a second education timer or duplicate reward ledger. New table/type names below are **proposed boundaries**, not an instruction to create all of them at once.

| Entity | Ownership / minimum content | Lifecycle and integrity |
| --- | --- | --- |
| `learning_profiles` | Private user; selected contexts and subject references | User edit; policy flags only through trusted policy flow |
| `personal_courses` / `custom_topics` | Private user; title, medium, optional pack mapping | Archive preserves historic labels; no cross-user write |
| `study_commitments` | Private user; label, start/duration/zone, recurrence/exceptions, class type | Fixed/unavailable blocks; attendance not inferred |
| `education_cohorts` | Authorised workspace; label, subject/edition, educator memberships | Draft/active/archived; transfer/delete requires approved policy |
| `cohort_memberships` | Trusted workspace membership, user, role, status, policy receipt | Invited/active/revoked/left; one active membership per user/cohort |
| `class_assignments` | Workspace; cohort, title, instructions, topic refs, due semantics, published revision | Draft/published/withdrawn/closed; published edits versioned |
| `assignment_links` | Private learner; assignment reference and private task reference | Explicit accept/ignore; unique learner+assignment link prevents retry duplicates |
| `practice_attempts` | Private learner; task/topic, attemptedAt, optional result and next action | Timer completion does not create a grade; amendments versioned |
| `class_submissions` | Class-scoped copy of learner-selected fields, author, assignment revision, revision number | Submitted/amended/withdrawn per approved retention policy; no private foreign-key traversal for teacher |
| `submission_feedback` | Class-scoped educator author, submission revision, text, optional approved rubric result | Draft/published/corrected; no silent rewrite of historical feedback |
| `sharing_receipts` | Private learner + minimal trusted audit of purpose/fields/recipient scope | Records actual confirmed share; not blanket consent to future sharing |

Server derives actor identity and authorised workspace context from validated authentication plus membership. Do not trust a client `ownerId`, `role`, `guardianApproved` or `isTeacher` flag. Constraints must enforce cross-entity cohort/workspace consistency, not merely check that a UUID exists. Personal data referencing a class does not become class-owned.

`class_submissions` is an explicitly minimised copy, not a live view over `practice_attempts`. A teacher viewing a submission cannot follow its private `taskId` or session ID to read other personal fields. Internal linkage, if retained, must be inaccessible through teacher endpoints/RLS. Avoid names of other schools/classes in the copied payload unless intentionally required and approved.

### Results are not universal grades

Optional numeric result proposal: `{ earned, possible, unit, source: self_reported|teacher_assessed, rubricVersion? }`. Require finite values, positive denominator and valid bounds according to the approved rubric. If rubric allows values outside ordinary 0..possible, explicitly version and test that rule; do not improvise. No automatic GPA, predicted exam mark, mental-energy score or topic mastery from time spent. Self-reported and teacher-assessed values remain visibly distinct.

## 4. Permission matrix

| Resource/action | Learner | Authorised cohort educator | Workspace admin |
| --- | --- | --- | --- |
| Own private plan, sessions, phrases, attempts | Read/write own | No access | No access |
| Published assignment in active cohort | Read; accept to private plan | Create/edit via published revisions | Only if explicit content role; admin is not automatic grader |
| Another learner's submission | No access | Only own authorised cohort and permitted fields | Not automatic; separate approved role required |
| Own submitted fields and feedback | Read; amend/withdraw as policy allows | Read/comment through cohort scope | Same explicit-role rule |
| Private task generated from assignment | Owner only | No read/write | No read/write |
| Membership and class invitation | Accept own eligible invitation; leave | Within approved invite role | Manage only authorised workspace |
| Aggregate statistics | Own view | Scoped class view; no cross-class surveillance | Approved aggregate scope; privacy threshold still a decision |
| Export/deletion | Own private rights and permitted class-copy export | No private-data export | No bulk private export through admin access |

Institution-paid seats do not expand data permission. Teacher subscription expiry must not erase learner work or transfer ownership. Exact read-only grace/retention follows [06](06-MONETIZATION-AND-ENTITLEMENTS.md) and approved policy, not client UI logic.

## 5. Learner flow and failure states

### SL-F1: General mode → useful first plan

1. Choose app language or keep a supported default. Skip optional questionnaire.
2. Choose General/Custom or an available reviewed pack; preview before activation.
3. Add a subject/work item, then optional school, tuition, travel and personal commitments. `classType` proposal: theory/revision/paper/practical/other. Do not force tuition use.
4. Add availability; propose only work that fits actual windows. Show unplaced work and allow manual adjustment.
5. Confirm the exact plan; create private tasks with stable IDs atomically. A failed durable write is an error, not a success toast.
6. Start the existing focus flow. After a completed/ended session, offer optional outcome and next action. Skipping both is valid.

UI states: useful empty; loading existing data; editing; unsaved draft; saving; saved locally; sync pending; retryable storage failure; damaged/migration-recovery state. Turning off education shortcuts does not delete personal data or move core navigation unexpectedly.

### SL-F2: Class assignment → private work → explicit share

1. Open invitation. Show only safe public invitation metadata before authentication; no roster/member lookup.
2. Authenticate and satisfy approved eligibility/consent policy. Validate token, cohort state, invite scope and expiry on trusted infrastructure.
3. Preview cohort and sharing rules; explicitly accept membership. Invitation acceptance does not subscribe to AI, notifications, marketing or purchases.
4. Open published assignment. Choose Add to my plan or Not now. Accepting records the published revision and creates/links one private task; repeat request returns the same link.
5. Schedule/edit private task without teacher access to personal availability. New teacher due-date revision shows a change notice; never silently moves confirmed learner appointments.
6. Work offline where supported. Store personal attempt/outcome locally with honest pending status.
7. Share preview shows recipient cohort, assignment revision and exact selected fields. Default excludes private notes, motivation, other courses, full schedule and focus history.
8. Confirm submission. Server validates active membership, policy, assignment and payload. Show received only after acknowledgement; timeout uses idempotent retry/status check.
9. Teacher feedback is read-only as received; convert a suggested next task into a preview, then require learner confirmation before changing private work.

An assignment can be informational only; accepting it is not evidence of attendance or completion. A timer ending is not an automatic class submission. Teacher feedback is not an instruction for the assistant or an AI tool to execute automatically.

## 6. Teacher-lite flow

### SL-F4: Independent teaching-work organiser

Add school/tuition commitments → link own local resource/reference → create preparation/marking/follow-up tasks → fit them around classes and personal availability → focus → record remaining work. Example: prepare next lesson for 30 minutes and mark a batch of 15 papers in a 60-minute work block. Paper contents/learner names need not be entered. Actual progress is user-reported; time alone cannot mark all papers complete. See [teacher fixtures and local storage](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md). This flow must work without a cohort, cloud resource service, class subscription or student invitations.

The next flow's bounded instructions/progress/text-feedback subset is optional for users and targeted for V1; broader assessment remains proposed future scope. It must not become a prerequisite for the independent teacher experience or silently enable resource uploads.

### SL-F3: Draft → publish → useful feedback

1. An authorised educator creates a cohort or selects one already allowed. A profile role alone cannot create institutional authority.
2. Choose subject/medium/cohort year; custom course is allowed. No false verified badge if no reviewed pack.
3. Draft a short assignment from a reusable template. Required title and instructions, optional topic references and due date; offline draft stays private to its author until published.
4. Preview learner view and data requested. Publish atomically with revision and audit event after current permission validation.
5. Invite eligible learners through scoped expiring invitations. Classroom code is an entry secret, not proof of guardian consent; rate-limit guesses and membership requests. Do not expose whether an arbitrary email has an account.
6. Open class inbox with submitted / no submission received / withdrawn states. Pending data not yet received is unknown, not evidence of inactivity. Never rank learners by focus hours.
7. Give text feedback or approved rubric assessment to a particular submission revision. New learner amendment flags older feedback as referring to an earlier revision.
8. Learner sees feedback when opening the relevant view; focus-safe notification delivery follows preferences, not forced chat interruption.

No general messenger, public student search, stranger DMs, livestream, exam auto-grader, roster scraping, payment collection for tuition or unrestricted file uploads in this slice. Full class-management web tools require a separate surface decision; do not place them into the January account portal by default.

## 7. API operation boundaries (draft)

Operation names are stable planning identifiers. URL paths, JSON-schema bounds and transport/runtime are to be frozen in canonical API contracts before READY. Mutation deduplication keys are scoped by authenticated actor + workspace/personal context + operation; conflicting reuse of a key with a different payload returns a conflict, not another action.

| Operation | Minimal input and authority | Success / important failures |
| --- | --- | --- |
| `cohort.previewInvite` | Token; limited public metadata only | Safe cohort label/policy summary; generic unavailable, no membership enumeration |
| `cohort.acceptInvite` | Token + confirmed policy receipt reference; trusted actor | One membership; expired/ineligible/revoked/full-or-closed as approved generic error |
| `assignment.publish` | Draft revision, expected version, idempotency key; educator role | One published revision; stale version, invalid topic mapping, permission revoked |
| `assignment.acceptToPlan` | Assignment ID/revision, optional selected private schedule, idempotency key | One private link/task; no duplicate if request or invitation reopened |
| `submission.submit` | Assignment/revision, explicit field payload, idempotency key, expected submission revision | Acknowledged revision + receivedAt; stale assignment/policy, membership lost, invalid fields |
| `feedback.publish` | Submission/revision, feedback draft, expected version, idempotency key | Versioned feedback; cannot silently attach to later submission or foreign cohort |
| `cohort.listSubmissions` | Cohort + bounded pagination/filter; educator scope | Sanitised class DTO only; no joins returning private tasks/history |
| `education.exportOwn` | Authenticated owner and approved scope | Scoped export/job status; no external redirect or guessed-owner export |

Server-derived metadata: actor, authorised ownership, receivedAt, audit identity, policy validation and entitlement result. Client `createdAt` may be saved as a client observation but cannot replace trusted receipt or permission checks. Raw bearer tokens, invite tokens and personal content must not enter analytics/logs.

Proposed error categories: unauthenticated, not-authorised-or-not-found, invalid-input, stale-revision, invitation-unavailable, policy-required, rate-limited, retryable-service-error. Exact status mapping/message copy belongs in frozen API spec. Retry only safe/idempotent operations; show retained drafts after rejection. Don't leak database/stack details through errors.

Local-mode resource URLs, files and association metadata stay local under `12`; the operations above must not auto-copy them into class payloads. No server previews, scraping, remote scanning or AI ingestion in local mode. Optional paid-cloud upload is a separate verified/consented flow, not generic task sync. Class-reference sharing requires its own scope and minimised data/security contracts; a storage subscription never grants a teacher access to another person's library.

## 8. Offline, conflicts, revocation and deletion

| Event | Required behaviour if feature ships |
| --- | --- |
| Offline private study | Local durable tasks/attempts continue; cloud status explicit; core timer not blocked by teacher service |
| Publish/submit while offline | Save a scoped pending operation/draft only; no claim learner joined or teacher received it |
| Retry after server committed | Same mutation returns same result; no duplicated task, submission or notification |
| Teacher revises assignment | Preserve accepted revision, show delta; learner decides private schedule change; revision policy gates submission |
| Assignment withdrawn | No new accepts; already created private task survives with withdrawn-source label; share flow explains current policy |
| Membership revoked before queued submission | Server rejects on apply even if authorised at draft time; preserve permitted private work; no silent re-enrolment |
| Permission revoked while teacher request/job runs | Validate at access/execution boundaries; stop later delivery/export; invalidate server-side subscriptions and capabilities |
| Sign out / account switch | Quarantine pending work under old owner; clear/lock cached content per approved local policy; never replay under new identity |
| Pack removed or upgraded | History readable; no silent reassignment of topics or deletion of custom work |
| Learner leaves cohort | Revoke future class access; private plan remains; disclosed class-copy retention/export follows approved policy |
| Teacher leaves organisation | Revoke role and realtime access; no automatic ownership of cohort/learner data transferred to personal account |
| Delete/export request | Apply reviewed private vs class-retention rules, audit completion and backup non-resurrection; do not promise instant deletion from every backup |

Offline revocation limitation: a server cannot remotely erase data already cached on a disconnected device. Before classroom cache is enabled, approve cache minimisation, offline access lease/expiry, local protection, purge-on-reconnect and the exact user-facing limitation. Until that is resolved, do not treat arbitrary full rosters/submissions as safe offline downloads. Previously delivered exports cannot be technically recalled; access prevention and policy are not magical copy deletion.

No numeric retention duration, region, token TTL, roster size or API quota is silently chosen here. Those values are security/operational contracts under ADR-009/011, not left for Luna to guess while coding. In particular, student withdrawal, statutory/institutional record obligations and private account deletion need an explicit conflict-resolution policy before real class data is accepted.

## 9. Authentication and provider-specific gates

Supabase Auth selection does not choose email password, link, phone OTP, passkey or social login. Evaluate learner access/recovery, shared numbers/devices, accessibility, abuse limits and support burden before selecting factors. No student account is created simply because a teacher entered an email/phone. Avoid unnecessary national identity collection.

For mobile, approved secure credential storage and per-owner local persistence must be specified and tested. For portal, explicitly choose the authenticated request/session model and its cache/CSRF protections. Do not mix a strict HttpOnly backend-for-frontend contract with a browser SDK flow that expects JavaScript-readable tokens without reconciling the design. Public Next.js caching must never contain private account/class data. Next.js selection alone does not approve a specific hosting or session topology.

Supabase schema/RLS work must include learner A/B, educator A/B and workspace A/B negative fixtures, membership revocation and service-role boundary tests. Private provider secrets stay server-side. Public starter examples or a successful sign-in are not evidence that classroom RLS is correct. Use [04](04-BACKEND-SECURITY-AND-SYNC.md) for authoritative security principles; consult current provider documentation when exact configuration is drafted.

## 10. Acceptance scenarios

These are future tests, not reported passes. `SL-T01` through `SL-T18` extend G-04/05/06/08/12/14/16. Synthetic identities/data only until policy and pilot authority are approved.

Select cases by the admitted capability, not by assuming every row ships in
January. Relevant private-cohort/invitation/selected-submission/text-feedback cases
now apply to the admitted classroom subset; broader grading/pack cases do not
become launch features merely to complete this table. All selected cases still
need implementation evidence, including negative access/revocation checks. The initial
independent-teacher workflow also uses [12 §8](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md)'s
R-T02 (no cohort needed), R-T03 (reported work versus timer completion) and R-T16
(accessible local/cloud recovery), alongside the applicable shared ownership,
offline, privacy and resource cases. None is waived or reported as run here.

| Test | Given / when | Required result |
| --- | --- | --- |
| SL-T01 | Tamil UI, English-medium custom subject; change UI to Sinhala | Subject/medium/cohort/billing and existing records unchanged |
| SL-T02 | Skip all optional questions and pack selection | Useful General planner; no forced school, tuition or paid module |
| SL-T03 | 90 minutes of proposed work and 30 minutes available | No overlap/overfill; remaining work visibly unplaced |
| SL-T04 | A recurring tuition block has one cancelled occurrence | Only that occurrence excluded; unrelated weeks and private work survive |
| SL-T05 | Accept same assignment twice, including timeout after commit | Exactly one learner-assignment link and private task |
| SL-T06 | Educator changes published due date after learner scheduled work | Revision notice; learner's schedule not silently overwritten |
| SL-T07 | Learner completes timer without submission confirmation | Personal result only; no automatic task completion, mastery or class submission |
| SL-T08 | Share one selected result from a task containing private notes/phrases | Teacher DTO includes only confirmed share fields; direct private IDs denied |
| SL-T09 | Teacher A or learner B guesses foreign cohort/submission/task ID | No access or existence leak through HTTP, realtime or export |
| SL-T10 | Membership revoked after offline draft but before sync | Submission denied; no fake received state; permitted private draft preserved |
| SL-T11 | Switch account while old account has pending work | No visible leakage or queue replay to new owner |
| SL-T12 | Pack topic renamed/removed across versions | Old attempt retains original provenance; upgrade requires explicit mapping |
| SL-T13 | Exam year known but date not officially verified | Provisional/unknown display; no confirmed countdown or invented date |
| SL-T14 | Student amends submission after teacher published feedback | Revision history preserved; feedback points to assessed revision |
| SL-T15 | Invalid marks, unsupported rubric or non-finite input | Validation error; no NaN chart, fabricated grade or inferred GPA |
| SL-T16 | Invite accepted without required policy/guardian evidence | Server denies eligibility; no workaround via profile role or invite code |
| SL-T17 | Learner/account deletion followed by isolated backup restore | Approved deletion/retention rules still hold; no unauthorised resurrection |
| SL-T18 | Small screen, Sinhala/Tamil large text, screen reader, reduced motion and interrupted network | Critical actions/validation readable and reachable; focus-safe delivery; honest local/pending/received state |

Before implementation, each applicable row becomes executable fixtures or an exact manual script with approved environment/build and expected data. Passing structural docs checks does not pass any SL-T row. Tests for invitations and shared data must also cover rate limits, token expiry, cache headers and disconnected-device limitations once exact policies are fixed.

## 11. Luna subcard map

All cards below are DRAFT. This map refines L-12/FUT-02, not a new parallel project or instruction to bypass L-02–L-10 foundations. Typical implementation cards should be split to one verifiable outcome before READY.

| Card | Single outcome | Required decisions / dependencies | Acceptance evidence |
| --- | --- | --- | --- |
| SL-01 | Freeze General/custom organiser context and data contract | ADR-006/008, local-resource contract; ADR-009 where accounts/minors apply; ADR-007 only for offered official metadata | Reviewed context/ownership fixtures; no app implementation yet |
| SL-02 | General/custom course without pack | SL-01, L-04/07/10 and approved local schema | SL-T01/02, save/restart/isolation |
| SL-03 | Commitments and bounded study plan | SL-02, L-11; recurrence/date contract | SL-T03/04, conflict/exception fixtures |
| SL-04 | Reviewed pack install/upgrade with preserved history | SL-01/02, reviewer/rights manifest | SL-T12/13, failed install leaves old valid pack |
| SL-05 | Private practice/next-action record | SL-02/03, optional result rules | SL-T07/15, no grade/AI dependence |
| SL-06 | Safe cohort membership and invite | Explicit teacher pilot/surface approval, L-05/08, age/cache/retention rules | SL-T09/10/11/16, RLS/realtime negatives |
| SL-07 | Versioned teacher assignment and private learner accept | SL-06, SL-02/03; revision/idempotency contract | SL-T05/06, foreign-cohort denial |
| SL-08 | Explicit minimised submission and feedback | SL-05/07; share/export/delete policy | SL-T08/09/10/14/15/17 |
| SL-09 | Localised teacher/learner usability and access verification | Selected implemented SL cards, approved locales/devices | SL-T18 plus teacher/learner task scripts |
| SL-10 | Approved real-user pilot and launch evidence | All selected cards verified, legal/content approval, explicit pilot authority | Research §9 metrics, incidents, owner scope acceptance |

### Example SL-07 bounded card preparation

Outcome: a published assignment accepted twice creates one learner-private task and one link. Allowed implementation files must be named after inspecting the then-current task repository, services, route composition and approved backend migrations. Do not invent paths from this document or add a second task system.

Required fixture: actor learner-A, cohort-C, membership active, assignment-X revision 2; acceptance key K returns link-L/task-T. Retrying K or reopening X returns L/T. Reusing K with a different payload is rejected. Learner-B receives no access to L/T. Teacher-C can read assignment-X but cannot read private task-T. A failure before durable commit cannot acknowledge success; a timeout after commit can recover the original result. No automatic calendar export or AI plan call is allowed in this card.

Not part of SL-07: billing, chat, arbitrary files, grading, full teacher website, notification provider, bulk roster import or deployed production infrastructure. The card remains DRAFT until exact DTOs, constraints, RLS SQL, route/files and test commands are recorded and approved; this example is not a claim those prerequisites already exist.

## 12. Launch/pilot blockers and next preparation

The legal source in [research §7](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) makes the January privacy gate especially time-sensitive; it does not supply a complete amended-law interpretation. The desired 15+ product target is recorded; age assurance, per-feature eligibility/consent, lawful basis, guardianship/institute roles, disclosure, region and retention remain unresolved. Do not collect real minors' data without those applicable policy and pilot gates being satisfied.

Next preparation: resolve the local-resource adapter/import/access/backup contract, prepare synthetic student and independent-teacher fixtures, and freeze the first General/custom organiser slice. Optional official metadata and classroom pilots do not block basic resource/task planning. Public Website/Account Portal and optional paid cloud are January-required by the recorded owner choices; exact cloud management/access/security/billing contracts remain gated. A full browser resource library or classroom is not implied. Prepare one READY card at a time after its prerequisites are resolved.
