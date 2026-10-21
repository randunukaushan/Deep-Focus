# Bounded classroom sharing — CL-00 preparation packet

Started 2026-09-29; document checks completed 2026-09-30.
**DRAFT / HIGH / REVIEW_PENDING; NOT READY FOR IMPLEMENTATION.**
The [owner amendment](01-REQUIREMENTS-AND-DECISIONS.md) admits this subset to the
V1 target. Detailed engineering choices below are the author's specification
under delegated design authority, pending technical/security review; they are
not additional owner-approved legal, commercial or production facts.

සිංහල: ගුරුවරයා වැඩක් ලබා දෙනවා → ශිෂ්‍යයා කැමැත්තෙන් තමන්ගේ plan එකට
එකතු කරනවා → තමන් තෝරාගත් progress එක පමණක් share කරනවා → ගුරුවරයා feedback
දෙනවා. Class එකට join වීමෙන් private timetable, notes හෝ focus history බලන්න
අවසර ලැබෙන්නේ නැහැ. මෙය lesson library, messenger හෝ full LMS එකක් නොවේ.

This refines the admitted portions of [11](11-SRI-LANKA-EDUCATION-CONTRACTS.md)
SL-06–09, not its future grading/institution features. Shared ownership/sync rules
remain in [04](04-BACKEND-SECURITY-AND-SYNC.md). [32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md)
owns release placement/deferral; [09](09-COVERAGE-AND-AUDIT.md) records CL-00's
task brief and actual checks. No files, dependencies, database or app routes
described as candidates below have been created by this packet.

September 30 continuation: [wire/data packet 40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md)
now supplies draft JSON Schema/OpenAPI, exact request/version notation, relational
constraints and TX-01–24 isolated-test specifications. It refines the logical
contracts below; it does not deploy them, run the CT/TX scenarios or close the
independent-review/policy gates. Candidate app/database paths remain uncreated.

## 1. Admission, implementation baseline and design choices

Included: a private class, invitations, teacher work instructions and optional
deadline, explicit learner acceptance into private tasks, selected progress
submission, text feedback, and the access/recovery/privacy controls needed to
operate those safely. Independent student/teacher planning remains useful without
membership, AI, a subscription or classroom network availability.

Excluded: classroom attachments/resource URLs, academic content supply, numeric
grades/rubrics, aggregate productivity dashboards, general chat/DMs, public
discovery, co-teacher administration, tuition payments, full browser classroom,
automatic AI analysis or automatic timetable changes. Paid Cloud Resources does
not unlock another person's library or grant classroom sharing consent.

Inspected source, not intended architecture:

| Actual file | Observation | Consequence before classroom implementation |
| --- | --- | --- |
| `src/features/tasks/task-types.ts` | Task has id/title/description/status/timestamps; no owner, version, class provenance or due date | Reconcile private Task contract first; do not add a second class task type or trust current IDs as authority |
| `src/features/tasks/task-storage.ts` | One JSON file; read errors become empty, save errors swallowed, web no-op | Cannot acknowledge a durable assignment accept; L-04/07 storage/failure/owner work is prerequisite |
| `src/app/plan-my-day.tsx` | In-memory suggested blocks composed from private tasks | Not a persisted assignment/planning integration; no teacher-triggered plan apply |
| `src/app/(tabs)/_layout.tsx` | Home/Focus/Analytics/Rewards/Profile still present | Approved five-tab migration precedes class entry; no new sixth Classroom tab |
| Package/source search | No package test script; no classroom/Supabase implementation found in src | Contract examples are not callable endpoints, installed test tooling or deployed RLS |

Choices made for this draft, not another owner questionnaire:

- Mobile-first entry under **Plan → Classes**; each class opens a bounded stack.
  Profile contains existing privacy/support controls. No new top-level tab.
- One explicitly authorized educator per class initially; other accounts join as
  learners. Profile role selection alone grants no create/invite/publish right.
  No co-teacher transfer workflow is silently added. Creator eligibility is G1.
- Personal acceptance and progress are separate: a learner may work privately and
  never share; the teacher cannot query whether an assignment was added to a plan.
- Shared progress is a learner-selected categorical statement, not a percentage,
  duration, grade or automatically inferred completion. Text feedback is bounded
  to the assignment submission, not an open conversation thread.
- Class roster/submission browsing is online-only in this initial design. Private
  accepted tasks can work offline after reliable owner-isolated storage exists.
  No classroom Realtime subscription, push content or persistent roster cache is
  required for this subset. Transient data still needs account/revocation cleanup.

## 2. Ownership, identity and payload separation

Use existing personal-workspace ownership; classroom records use a distinct
authorized education scope. Class ID in a route is an untrusted selector, never
proof of membership. Actor, role and eligibility come from trusted infrastructure.

| Record / response | Allowed content and readers | Never included or inferred |
| --- | --- | --- |
| Class | ID, label, lifecycle, current version, educator's class display identity; active members only | School accreditation, private account contact fields or public roster |
| Invitation | Server-scoped opaque token, target class, lifecycle/expiry, use receipt | Token is not age consent, teacher authority or a public class catalogue |
| Published assignment revision | Class/assignment/revision IDs, title, plain-text work instructions, optional due instant + IANA zone | Resource files/URLs, private task IDs, executable HTML, automatic schedule command |
| Private acceptance link | Learner, assignment/revision, one private Task ID, accept command ID | Educator-readable join to private Task or acceptance receipt |
| Selected submission revision | Class-scoped learner display identity, assignment/revision, categorical progress, receipt/revision timestamps | Private task/session IDs, schedule, notes, task description, resource metadata, focus minutes, grade, free-form learner note |
| Feedback revision | Educator class identity, submission ID/revision, plain text, server receipt/version | Learner schedule changes, grades, private AI context, unrelated direct messaging |
| Sharing receipt | Private owner + minimal trusted audit: class/assignment, exact submitted fields, policy version, command/result IDs | Blanket ongoing consent, secret tokens or duplicated private content in logs |

Proposed strict content shapes (not deployed JSON Schema):

```text
AssignmentContentV1 = {
  title: nonempty bounded plain text,
  instructions: nonempty bounded plain text,
  due: null | { at: UTC instant, timeZone: IANA zone }
}
ProgressSelectionV1 = {
  progress: "not_started" | "in_progress" | "completed"
}
FeedbackContentV1 = { text: nonempty bounded plain text }
```

No field is preselected for a new share. The user chooses one progress value and
confirms a preview naming class, educator, assignment revision and that value.
`completed` means self-reported work completion only. It neither mutates the
private task nor grants XP. Private task completion likewise never submits.
An amendment replaces the selected progress snapshot with a new revision; it is
not a live binding to later private activity.

Unknown request keys reject; do not accept and silently forward a private Task
object. Serialization must construct the allowlisted DTO, not spread a source
record and delete a few fields. Responses use separate learner/educator DTOs.
Class display names are previewed; email/phone/auth subject IDs are not learner
roster fields. Education-context metadata remains optional outside this payload.

Representation rules: stable UUID identities; integer versions; server-assigned
UTC receipt times distinct from user-selected due time. `due: null` means no
deadline, not local midnight. User selects a timezone explicitly where ambiguous;
changing device zone changes display, not the stored instant. Published due dates
do not create reminders/calendar events. Numeric length/request/roster/rate/TTL
limits and normalization policy need a single reviewed configuration (G2/G3);
until that exists, these shapes are not implementation-ready validation schemas.

## 3. State transitions and concurrent operations

| Entity | Permitted design transitions | Important boundary |
| --- | --- | --- |
| Class | create active → archive | Archive stops new invitations/publishing/submissions; private tasks survive; restoration/transfer not initially offered |
| Invitation | issued → consumed or revoked; expired determined by server time | Single-account redemption; fresh invitation for another learner; unknown/expired/used-by-other uniformly unavailable |
| Membership | none → active on explicit valid accept → left or revoked | No role escalation or automatic rejoin; retrying an old invite cannot revive membership |
| Assignment | private draft → published revision 1 → later published revisions; published → withdrawn or closed | Revisions immutable; new revision does not replace a learner's private task |
| Acceptance link | absent → linked once | Unique learner+assignment; repeats return existing link, not a second task; deleting task does not silently allow recreation |
| Submission | absent → submitted r1 → amended r2… or withdrawn; withdrawn → new submitted revision only through a fresh confirmed share | Compare expected revision; withdrawal hides shared content from ordinary teacher access; retention is a separate G1 policy |
| Feedback | draft → published against exact submission revision → corrected revision | Never silently retarget to a newer learner submission; no new feedback after withdrawal |

All membership-sensitive mutations validate current class state, policy and
membership **inside the atomic operation**, not only in an earlier UI request.
The eventual SQL design must serialize permission revocation against acceptance,
submission and feedback (shared locking/version strategy to be proved in G4).
If revocation commits first, later mutation cannot commit as authorized. If the
mutation commits first, later revocation stops subsequent access; it cannot recall
content already delivered. Do not claim immediate remote erasure.

Assignment revisions: publisher supplies expected current version. Two edits
from version 2 cannot both become version 3. Learner first acceptance requires
the still-current published revision shown in their preview; otherwise show the
change and re-confirm. A learner already linked to revision 2 keeps their private
work after revision 3; updating copied title/instructions/due is an explicit
private edit with diff preview, never an automatic teacher write.

Submission references the learner's accepted assignment revision. A later teacher
revision does not invalidate that history; clearly label an older revision and
allow its selected-progress report while the assignment remains open. Withdrawn/
closed assignments reject new reports or amendments; withdrawal of a previously
shared report remains available under the authenticated own-data control.
No deadline-based penalty, XP loss or automatic close at due time.

After withdrawal, a fresh share requires active membership, an open assignment,
a new explicit preview/command and the current withdrawn-record version. Only
the new selection becomes visible; old withdrawn content/feedback is not restored.
Old offline commands cannot substitute for this fresh consent.

## 4. Logical command/read contract

These names extend 11's planning identifiers. They are **not** new callable routes
or additional operations in the existing OpenAPI files. G4 must freeze HTTP paths,
full input/output/error schemas, limits and SQL grants before any card is READY.

Common mutation envelope: `{ contractVersion: 1, commandId, expectedVersion?,
payload }`. Create/first-submit uses no prior object version; versioned changes
must supply the exact version previously shown. A command ID is generated once
per confirmed intent and persisted before send. Never accept body-supplied actor,
owner, educator role or eligibility flag.

| Operation | Input / actor | Atomic success / no-success behavior |
| --- | --- | --- |
| `cohort.create` | Eligible authenticated creator, class label | Create class + scoped educator membership; no profile-role trust |
| `cohort.readOwn` | Authenticated current member, selected class | Minimal class + own membership; no public or learner-visible roster |
| `cohort.archive` | Current educator, expected class version | Stop new work/invites; leave, revoke and own-withdraw/privacy controls remain; no private Task deletion |
| `cohort.issueInvite` | Current educator, active class | Server creates single-use opaque invitation; token never becomes analytics data |
| `cohort.revokeInvite` | Current educator, invite/version | Revoked token no longer admits; do not revoke an already accepted member by accident |
| `cohort.previewInvite` | Possession of token; no account needed for generic landing | Signed-out sees only generic invitation guidance; eligible signed-in user sees minimal class/educator preview, not roster |
| `cohort.acceptInvite` | Authenticated eligible user, token, confirmed policy reference | Membership + redemption receipt atomically; no forced marketing/AI/notifications |
| `cohort.revokeMember` | Current educator, learner membership/version | Revoke class rights, not user's private account; never self-elevate |
| `cohort.leave` | Current learner, own membership/version | Revoke future class access, preserve private work; disclose class-copy handling |
| `assignment.publish` | Educator, content and optional prior assignment/version | New immutable revision + current pointer; stale edit retains author's draft |
| `assignment.closeOrWithdraw` | Educator, assignment/version, explicit action | Close or withdraw; preserve earlier private work/provenance, no cascading private delete |
| `assignment.read` | Active member, assignment, authorized revision | Published content only; no other educator's private draft |
| `assignment.acceptToPlan` | Learner, displayed published revision, confirmed private-task preview | One learner-owned Task + private link + receipt in one durable server transaction; no timetable auto-placement |
| `submission.submit` | Learner, linked assignment revision, selection, expected submission revision on amend | Exact class-scoped copy + private sharing receipt; response acknowledges receipt, not teacher reading |
| `submission.withdraw` | Authenticated author, own submission/version | Stop ordinary teacher access + recorded withdrawal; do not imply immediate backup erasure |
| `feedback.publish` | Educator, current submission/revision, text, expected feedback version on correction | Feedback tied to that revision; reject concurrent withdrawal/stale submission |
| `cohort.listSubmissions` | Educator: current authorized membership in own class, including read-only archive; learner: own reports/feedback only | Bounded authorized page; no private-task joins or cross-learner read; withdrawn content excluded |

Invitation token issuance/retrieval needs a reviewed safe lost-response strategy:
do not store plaintext tokens in general idempotency records. A retry must not
silently issue a second active token. Token storage, expiry and secure transport
are G2; do not implement this by inventing a short classroom PIN. Email/SMS
delivery and contact-list access are not included. User-mediated link sharing
must disclose that anyone possessing an unused link may attempt eligible joining;
eligibility and educator verification are not proved by the link.

Public invitation handling is isolated from protected reads/mutations. No token
in application telemetry, crash reports, referrers or public preview cards.
If a minimal generic signed-out landing cannot be made safe, keep joining behind
authenticated in-app token entry until the reviewed transport is available.

### Idempotency, permission changes and lost responses

Deduplicate by authenticated actor + class/personal scope + operation + command
ID, with immutable payload digest and result identity. Same ID/different payload
is a conflict, never a second command. Unique learner+assignment and server
revision constraints also prevent duplication after a cached response expires.
G3 fixes retention relative to the retry horizon; an expired command returns
reconciliation-required, never a blind new mutation.

Re-check current authorization before replaying a stored response. A deduplication
cache is not an access-control bypass. After revocation, return a neutral denied
result (and only permitted own-private receipt information), not old class data.
Do not reapply a previously successful submit after it has been withdrawn.
Show its current authorized lifecycle state, not a stale “currently shared” badge.

Acceptance server/client boundary: server atomically stores Task/link/receipt;
client then durably merges that owner-scoped result. These are **two commits**,
not one distributed transaction. Lost response or client crash resumes the same
command and task identity. No local provisional Task with a different ID. After
server success/local failure, say “Added to your account; device save needs retry,”
not “Available offline.” Read-only private receipt recovery does not need current
class membership and must reveal no new class content. A deleted private Task
returns an explicit deleted-link result; it is not recreated by retry.

First add-to-plan requires network in this draft; offline allows a private intent
draft only, with no “Added” acknowledgement. Once the private task has been saved,
its ordinary local planning/focus works independently. Reports queued offline
are exact confirmed snapshots, never regenerated from newer private data. A stale
report conflict requires a new preview and command; no last-write-wins overwrite.

Failure categories reuse 04's shared envelope: auth required, neutral unavailable,
validation failed, policy required, version conflict, invalid transition, rate
limited, dependency unavailable and command reconciliation required. HTTP/code
mapping is a G4 deliverable. Retry only network/transient failures with bounded
backoff; no automatic retries of revoked membership, invalid schema or stale
share content. UI preserves permitted private drafts and explains next action.

## 5. Mobile flow, access lifecycle and privacy

Screen seams, all **proposed new** after approved navigation migration:
`src/app/classes/index.tsx`, `src/app/classes/[classId]/index.tsx`,
`src/app/classes/[classId]/assignments/[assignmentId].tsx`,
`src/app/classes/join.tsx`. Submission preview and feedback remain within the
assignment stack; no general Inbox tab. Resolve exact manifest entries in G4.

Required view states: loading, no classes, no assignments, invitation unavailable,
eligibility not resolved, draft, confirming, sending, pending receipt, received,
conflict, permission lost, withdrawn, archived, device-save failure and retry.
“No report received” is not “did no work.” A private add-to-plan action must not
change any teacher-visible count/status. Back from a draft offers keep/discard;
Back is not consent to send. Save failures retain text and do not dismiss forms.

Deep links authenticate and authorize before showing class data. An active focus
session continues unchanged: show a deferred entry, not a forced classroom screen.
No ad, invitation, feedback notification or class alert interrupts active focus/
recovery. Progress sharing and privacy withdrawal cannot depend on watching ads.
si/ta/en labels, accessible confirmation/read order, large text and non-color
status cues are required. English example strings need qualified translation QA.

Sign-out/account switch cancels old requests, clears visible class data and
invalidates request-generation tokens so late responses cannot repopulate views.
Pending owner-scoped drafts/commands follow reviewed local isolation/recovery
policy. Never replay account A's command using account B's credentials. Ordinary
class GET responses and sensitive intermediary/proxy caches must not persist
rosters or submissions in this initial design; exact cache headers go in G4.

Withdrawal, leave, revoke and archive are distinct actions:

- Withdrawal removes ordinary teacher access to that submitted copy and feedback
  path; reviewed retention may keep restricted records but not a hidden live view.
- Leaving ends membership and future class access; the user sees the consequence
  for existing shares first. Design default is revoke ordinary visibility of their
  shares on leave/revocation; legal retention exceptions and own-data retrieval
  are G1 and must not be improvised by an implementer.
- Archive stops class work without deleting learner private tasks. Current-member
  read-only access to existing assignments/reports is the proposed archive view;
  revoked/left members receive no restored access. Retention follows G1.
- Previously delivered copies/screenshots cannot be recalled. No guaranteed
  remote-wipe promise; no intentional bulk exports or offline roster download.

Abuse controls are release prerequisites, not a full social-network expansion:
learner can leave/report, educator can revoke a learner, and blocked/removed
relationships cannot be silently rejoined through invite retries. Exact report
recipient, response ownership, block semantics and confidential evidence handling
are G1/G2. A public support form must not receive private class payloads by default.

Account export/deletion must inventory class memberships, authored assignments,
private links, shares/receipts and feedback. [28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md)
does not yet serialize these families. No “complete account export” claim may
omit them after classroom activation. Use a reviewed versioned extension or a
separately documented own-data artifact; no copying foreign learner submissions
into teacher personal export. Delete/restore must preserve tombstones and avoid
resurrecting withdrawn access. Class archive is not account deletion.

## 6. Eight bounded implementation cards — all DRAFT

Common prerequisites: core L-02/04–08 verified for the relevant dependency,
G1–G4 resolved for the operation, isolated synthetic test environment and reviewed
canonical contracts. Candidate paths name future seams, **not existing files or
permission to create them now**. A later implementation brief must choose exact
files, commands, migration/rollback and one verifiable outcome. Do not run all
eight cards as a single Luna prompt. UI and wire should use one reviewed contract.

| Card | One outcome / upstream requirement | Proposed file seam and verification target | Stop condition |
| --- | --- | --- | --- |
| CL-01 | Eligible educator creates/reads/archives a private class; SL-06 foundation | New `src/features/classroom/class-contract.ts`, `class-repository.ts`; server class transaction and tests after G4 names exact paths; CT-01/02/03/19 | Creator authority or class ownership unresolved; no ordinary profile self-promotion |
| CL-02 | Invitation explicitly creates one revocable learner membership; depends CL-01 | New `invitation-service.ts`, join route and isolated invitation/RLS tests; CT-04/05/06/07/20 | Token/eligibility/rate/reporting policy unresolved; no short-PIN assumption |
| CL-03 | Educator publishes immutable work revision; depends CL-01/02 | New `assignment-service.ts` and class assignment view; CT-08/09/10 | Plain-text bounds, due semantics or atomic version update untested |
| CL-04 | Learner accepts once into existing private Task; depends CL-03 plus reliable private Task adapter | New `assignment-acceptance.ts`; reviewed adapter at existing task types/storage seam, not direct JSON shortcut; CT-11/12/13/14 | Task/link/receipt atomicity, local merge recovery or deleted-task policy missing |
| CL-05 | Learner intentionally submits/amends/withdraws only categorical progress; depends CL-04 | New `submission-service.ts`, share-preview component; CT-15/16/17/18/21 | Whitelist/receipt/replay/revocation boundary or own-withdraw path unproved |
| CL-06 | Educator publishes text feedback to a received revision; depends CL-05 | New `feedback-service.ts` and assignment feedback component; CT-17/18/22 | Stale/withdrawn revision can receive feedback or private learner data is exposed |
| CL-07 | Leaving/revocation/archive and account rights preserve private work without leaking class copies; depends CL-01–06 | Shared lifecycle service, approved account export/deletion extension and class cache cleanup; CT-07/18/19/20/23 | Retention/export/block authority or restore evidence missing |
| CL-08 | Guarded Plan → Classes flow survives navigation/account/network changes; depends CL-01–07 and L-09/10 | New class routes/components plus reviewed navigation manifest delta; CT-13/20/24 and all applicable SL accessibility cases | Requires fake success, sixth tab, focus interruption or unsupported locale claim |

CL-07 privacy semantics must be designed before earlier cards are accepted; its
end-to-end verification occurs after those records exist. It is not permission
to activate CL-01–06 with privacy cleanup postponed. CL-08 is integration of the
already tested vertical operations, not a separate unbounded UI rewrite.

Each card completion packet: exact changed files; contract version; positive and
negative fixture IDs; test command/build/environment/output; self-review; required
independent reviewer/finding disposition; NOT_RUN items; rollback/forward recovery.
For a failure, retain reproduction and fix under the same boundary. Do not label
schema validation, TypeScript or a screenshot as a passing RLS/device test.

## 7. Synthetic acceptance matrix — 24 cases, all NOT_RUN

Fixture names only: educator E1/class C1 and E2/C2; learners A and B; outsider O;
assignment X revisions 1 and 2; task T owned by A. No real learner names or files.
Assertions include database state and all response fields, not merely HTTP status.

| ID | Given / when | Required independent oracle / evidence | Status |
| --- | --- | --- | --- |
| CT-01 | O sets profile role or request body role to teacher and creates/publishes | Denied without trusted creator grant; no class/role row created | NOT_RUN |
| CT-02 | E1 creates class; retry same command; another actor reuses ID | One E1-scoped class; actor scope isolated, no cross-owner receipt | NOT_RUN |
| CT-03 | E2/A/O guess C1 identifiers through API and exposed database access | Only explicitly allowed membership view; no roster/draft/task leak | NOT_RUN |
| CT-04 | Invalid/expired/revoked/other-consumed invitation, signed out | Same neutral unavailable result; no class/member/account enumeration | NOT_RUN |
| CT-05 | A accepts same invitation concurrently on two devices, response lost | One membership/redemption; replay same result without new enrollment | NOT_RUN |
| CT-06 | A and B race to consume one invite; policy missing/expired for one | At most one eligible redemption; no use consumed by failed policy transaction | NOT_RUN |
| CT-07 | Revocation races with accept/submit; old token/command replay follows | Commit order respected; no restored access or cached private response | NOT_RUN |
| CT-08 | Two educators' forged references or concurrent edits to X version 1 | Cross-class denied; one version-2 winner, losing draft retained | NOT_RUN |
| CT-09 | Due date edited; learner changes device timezone; no due provided | Stored instant stable; no-due null, no auto reminder or private reschedule | NOT_RUN |
| CT-10 | Assignment text contains markup/URLs; forged attachment/grade fields | Text inert, no fetch/embed/attachment processing; unknown fields rejected | NOT_RUN |
| CT-11 | A accepts X twice with different command IDs | Same private Task/link; uniqueness holds beyond response cache | NOT_RUN |
| CT-12 | Crash between Task/link/receipt writes in server transaction | All or none; no acknowledged partial accept or orphan private Task | NOT_RUN |
| CT-13 | Server committed but response/local save lost, restart or account switch | Same ID recovered only for A; not offline-ready until durable merge | NOT_RUN |
| CT-14 | X revised/withdrawn or linked Task deleted before accept retry | Stale first accept re-preview; prior private work survives; no recreation | NOT_RUN |
| CT-15 | Private Task holds notes/resources/schedule; send selected progress | Educator gets exact allowlist only; joins/direct IDs/exports deny private data | NOT_RUN |
| CT-16 | Timer/private task changes without explicit share confirmation | No submission, shared progress change, acceptance leak or extra XP | NOT_RUN |
| CT-17 | Reuse command with altered payload; two reports amend same revision | Payload conflict; one revision winner, preserved losing draft, no silent overwrite | NOT_RUN |
| CT-18 | Share withdrawn while feedback/read/retry happens; later fresh re-share attempted | No stale resurrection/new feedback on withdrawn content; only valid fresh preview/version can expose a new selection, not old content | NOT_RUN |
| CT-19 | Class archived, assignment closed/withdrawn, or membership left | New writes denied as specified; private Task remains; permitted own withdrawal works | NOT_RUN |
| CT-20 | Sign out A/start B; late response, pending command, copied invite, blocked relation | No UI/cache/queue leak or blocked rejoin; only explicit eligible membership | NOT_RUN |
| CT-21 | Offline confirmed report queued; private work changes; membership revoked | Queue retains exact preview; current authorization denies send, no fake receipt | NOT_RUN |
| CT-22 | Feedback for report r1 arrives after report r2 or withdrawal | Revision-specific display/conflict; no retarget, private task or schedule mutation | NOT_RUN |
| CT-23 | Own export/delete then isolated backup restore after withdrawal | Complete authorized coverage, no foreign data or resurrected access; policy evidence | NOT_RUN |
| CT-24 | si/ta/en large text/screen reader; active focus; back/deep link/network error | Reachable calm flows; no forced interrupt/sixth tab; truthful states/retained drafts | NOT_RUN |

Negative API tests alone are insufficient: test reachable table/view/function
paths and grants/RLS with the same fixture identities. Mutation tests use real
isolated transactions and forced interleavings. Device tests need actual
Android/iOS lifecycle and owner namespaces. Limits/expiry tests include exact
boundary values once G2/G3 is fixed. No current command runs these cases.

## 8. Reconciliation and remaining gates

| Gate | Next artifact / responsible decision | Blocked scope |
| --- | --- | --- |
| G1 Eligibility, educator authority and data rights | Qualified Sri Lanka age/consent/retention interpretation and owner policy; explicit creator admission, reporting/support responsibility, withdrawal/leave/export treatment | Real users/minors, trusted educator grants and production classroom activation |
| G2 Invitation/abuse controls | Reviewed token generation/storage/transport/expiry, failed-attempt limits, membership size, block/report behavior | Invitation implementation/admission until exact configuration and negative tests exist |
| G3 Bounds and recovery | Single numeric validation/rate/command-retention configuration, text policy, permitted private draft/queue protection and recovery | Complete schemas and trusted durable retry; no guessed production constants |
| G4 Wire/database/mobile reconciliation | Exact endpoint/OpenAPI/JSON Schema, scoped SQL grants/RLS/transactions, navigation entries, private Task acceptance adapter and isolated test harness | Implementation READY status; current prose is not executable migration/test coverage |
| G5 Commercial authority | Owner decides pricing/spending if classroom packaging needs it; no new class purchase or required resource subscription inferred | Selling/provisioning any unapproved classroom plan |
| G6 Independent review and release evidence | Owner-arranged qualified review of named design/diff; then real negative/provider/device/locale/restore evidence and scope forecast | Acceptance/integration/production; self-review and document checks insufficient |

Ordinary draft design work for G2–G4 can continue under delegated authority.
It must not manufacture G1 facts, approve G5 spending or self-certify G6. Request
owner involvement for those reserved decisions when preparing their evidence;
no other agent is automatically invited. Do not re-ask whether classrooms belong
in V1. No exact feature deferral has been chosen or deadline guaranteed.

Canonical destinations for the next reviewed contract patch:

- `API_SPEC.md` §§7/19–22/24 and new bounded classroom resource section: identity,
  strict per-operation inputs/outputs, replay/authorization ordering and limits.
- `DATABASE_SCHEMA.md` §§14/16–18/21/23 plus scoped classroom tables: composite
  class/reference integrity, private Task link, uniqueness, grants/RLS and migration.
- `DATA_MODEL.md` §§7/13–16: Task provenance is learner-private; no duplicate
  timer/task/reward model, separate submitted-copy and feedback versions.
- `SECURITY.md` §§6–8 and account privacy sections: class predicates, token
  handling, deny paths, data-rights/retention and revocation limitations.
- `V1_SCREEN_MAP.md`, 15's navigation manifest and testing strategy: guarded Plan
  entry, states and CT evidence; do not silently mutate the current app tabs.
- Account export 28 and privacy operations 16/17: versioned classroom-family
  coverage and deletion/restore treatment before enabling records in production.

This list names required reconciliation, not completed normative changes. No SQL,
API schema or app source is changed by CL-00. If a later scope cut defers classroom,
keep private task planning intact and record the disabled entry/service/marketing
claims; never leave partially enabled sharing without its privacy controls.

## 9. Primary-source check — 2026-09-29

Sources support specific engineering cautions, not this product's legal eligibility
or a passed audit. No live project settings were inspected or changed.

- Supabase explains that table grants and row policies are separate controls and
  that service-role authority bypasses RLS. Review both, and do not treat an Edge
  Function as protected merely because tables have policies.
  [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Supabase distinguishes authenticated user calls from privileged/public function
  patterns. Protect classroom mutations with verified user identity and explicit
  object membership checks; do not copy a public/webhook configuration into them.
  Exact runtime/library/version remains unselected here.
  [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth).
- OWASP recommends deny-by-default authorization and checking permissions on
  every request. Applying that here includes retries, receipt recovery, foreign
  identifiers and educator reads; this application is our design inference.
  [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Reviewing these pages is research evidence only. CT-01–24 remain NOT_RUN and
HIGH-risk independent review remains PENDING.
