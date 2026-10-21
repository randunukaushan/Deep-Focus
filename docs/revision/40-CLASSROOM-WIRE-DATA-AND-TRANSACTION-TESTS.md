# Classroom API/data schemas and transaction-test plan — CW-00

2026-09-30. **DRAFT / HIGH / REVIEW_PENDING. Not deployed or implementation-ready.**

සිංහල: මෙය classroom requests/responses වල නිශ්චිත fields, ඒවා ගබඩා කරන
relational structure සහ concurrent requests/failed saves පරීක්ෂා කරන සැලැස්මයි.
Local schema checker එක run කළ හැක; ඒක database security හෝ app tests කළා
කියන අදහස නොවේ. මුදල්/legal facts සහ independent review තවම වෙනම gates වේ.

Scope/authority: [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) and the exact
[owner amendment](01-REQUIREMENTS-AND-DECISIONS.md). This concretizes G3 and part
of G4 under delegated engineering design; it does not resolve G1/G2/G5/G6 or
accept a new security policy. Canonical reconciliation/review precedes integration.

## 1. Artifacts, task boundaries and current evidence

- [Strict JSON schemas](contracts/classroom.schema.json): 57 draft definitions.
- [OpenAPI](contracts/classroom.openapi.json): 22 named draft operations under
  `/v1`; every API operation requires user authentication. No server URL selected.
- [Transaction scenarios](contracts/classroom-transaction-tests.json): TX-01–24
  all NOT_RUN, empty evidence and executionAuthorized=false.
- [Read-only checker](check-classroom-contracts.mjs): installed Node + existing
  transitive Ajv, no install, API request, SQL transaction or app import.
- Task brief/evidence: CW-00 in [09](09-COVERAGE-AND-AUDIT.md).
  Allowed changes are documentation and these contract/testing artifacts only.

Current Task source still uses a best-effort ownerless JSON array; the schemas
below are not compatible by simply casting that data. No classroom handler,
PostgreSQL migration, RLS policy, mobile outbox or identity adapter is implemented.
Existing core/private-task and migration prerequisites in 39 remain unchanged.

The 17 logical operations in 39 are represented plus five necessary read seams:
own class list, assignment list, private acceptance recovery, own submission read
and educator membership list. These are support for the same admitted feature,
not extra analytics, public roster, general messaging or classroom uploads.

## 2. Exact wire choices and limits

JSON Schema draft-07 definitions are referenced from OpenAPI 3.1.1. Request and
response objects reject unknown fields. A mutation body has exactly
`{contractVersion:1,commandId,expectedVersion,payload}`; commandId is a UUID
persisted with the confirmed intent. Do not add a second independently varying
Idempotency-Key header. Dedupe key is actor + resolved scope + operation +
commandId; digest binds path identifiers, contract version, expected version
and exact validated payload. Whitespace/JSON-key order alone does not change the
semantic digest; duplicate JSON names reject before ordinary parsing. Publish the
canonical encoding/version with the eventual handler, not an ad-hoc JSON hash.

Raw-decoding guard: reject decoded U+0000 in every object key or string value
before jsonb conversion with VALIDATION_FAILED (400), without stripping/replacing
it. Literal backslash-u text is not a decoded NUL and stays unchanged. This
PostgreSQL storage-profile constraint is additional to JSON Schema validation;
the raw parser, not an already parsed object, must also reject duplicate names.
See [FA-00 feasibility findings](45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md).

[HC-00 helper candidate](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md) now
specifies digest version 1 encoding/key references, closed-command denial markers,
opaque cursor handles and invitation lookup/delivery behavior. Public DTOs remain
unchanged; synthetic vectors are not runtime security or production policy.

`expectedVersion:null` explicitly denotes first creation/no prior target version,
refining 39's optional notation. Archive/leave/revoke/lifecycle/withdraw requires a
positive target version. First publication has assignmentId=null and
expectedVersion=null; revision publication requires existing assignmentId and
positive expectedVersion. Submit and feedback use null for first creation,
positive version for amend/correction/re-share; server enforces absence versus
existence. Unknown/private owner/role fields reject at every object boundary.

Engineering draft caps, **not measured safe production quotas**:

| Item | Exact draft representation/bound | Additional rule |
| --- | --- | --- |
| IDs | UUID strings; positive integer version up to 2147483647 | IDs are selectors, never proof of access; overflow rejects, never wraps |
| Title/class label | 1–240 Unicode code points; at least one non-whitespace | Plain text; preserve Sinhala/Tamil; no automatic normalization/truncation |
| Instructions | 1–4000 code points; non-whitespace | Task instructions only; no attachment payload, embed or automatic URL fetch |
| Feedback | 1–2000 code points; non-whitespace | Plain text tied to selected report revision; no grades |
| Class display name | 1–100 code points; non-whitespace | Explicit class identity; do not substitute email/phone/auth ID |
| Timestamp | Valid date-time with UTC Z suffix | Calendar validity enforced; server receipt separate from due time |
| Due zone | 1–100 characters, timezone-shaped syntax | Runtime must validate actual supported IANA zone; regex alone does not |
| Token | Exactly 43 base64url characters | Proposed 32 cryptographically random bytes, not classroom PIN; key/storage/TTL review outstanding |
| Cursor | 1–512 base64url characters | Opaque authenticated token; bind actor/scope/filter/ordering/expiry |
| Page | 1–50 entries, omitted limit=20 | No response total/acceptance/focus count; current rights checked every page |
| Body transport | Proposed 32768 UTF-8 bytes before parsing | Enforce at edge/server, not only decoded character bounds |
| Retry-After | Decimal delay seconds, 1–86400 when present | Transport ceiling, not selected rate policy or retry budget |

GET query decoding: only declared names, at most one value per name; unknown,
duplicate, empty, malformed or out-of-range values reject. Parse limit/revision
from ASCII positive-decimal digits once, then apply the JSON schema. Do not rely
on Ajv coercion/default insertion. UUID path values validated before lookup.
All successful/error API responses are JSON with `Cache-Control: private, no-store`.
No sensitive content in URL query, log, crash breadcrumb or metrics. Invite
preview receives token in an authenticated POST body, not a public GET query.
Signed-out invite landing shows generic guidance only; authenticated preview
reveals only allowed class identity. Deep-link/token transport still needs G2.

No prices, roster caps, requests-per-minute, TTL, retention duration or legal age
policy are selected by these representation limits. A production configuration
must supply those separately and fail closed if missing. Performance/locale/
abuse testing can revise these draft bounds with explicit schema versioning.

## 3. Complete operation map

Paths below are relative to /v1; schema file owns field shapes. Every result is
HTTP 200 only after the relevant durable result or authorized read. No 202 fake
success for a save. Server commit does not claim mobile durable persistence.

| ID | Method / route | Request definition | Response definition | Effect |
| --- | --- | --- | --- | --- |
| CW-01 | POST `/classrooms` | CreateClass | ClassViewResponse | Mutation |
| CW-02 | GET `/classrooms` | —; query PageQuery | ClassList | Read |
| CW-03 | GET `/classrooms/{classId}` | — | ClassViewResponse | Read |
| CW-04 | POST `/classrooms/{classId}/archive` | ArchiveClass | ClassViewResponse | Mutation |
| CW-05 | POST `/classrooms/{classId}/invitations` | IssueInvite | InviteViewResponse | Mutation |
| CW-06 | POST `/classrooms/{classId}/invitations/{inviteId}/revoke` | RevokeInvite | InviteViewResponse | Mutation |
| CW-07 | POST `/classroom-invitations/preview` | PreviewInvite | InvitePreviewResponse | Read |
| CW-08 | POST `/classroom-invitations/accept` | AcceptInvite | MembershipViewResponse | Mutation |
| CW-09 | POST `/classrooms/{classId}/memberships/{membershipId}/revoke` | RevokeMember | MembershipViewResponse | Mutation |
| CW-10 | POST `/classrooms/{classId}/leave` | LeaveClass | MembershipViewResponse | Mutation |
| CW-11 | POST `/classrooms/{classId}/assignments` | PublishAssignment | AssignmentViewResponse | Mutation |
| CW-12 | POST `/classrooms/{classId}/assignments/{assignmentId}/lifecycle` | AssignmentLifecycle | AssignmentViewResponse | Mutation |
| CW-13 | GET `/classrooms/{classId}/assignments/{assignmentId}` | —; query AssignmentQuery | AssignmentViewResponse | Read |
| CW-14 | POST `/classrooms/{classId}/assignments/{assignmentId}/accept` | AcceptAssignment | AcceptanceViewResponse | Mutation |
| CW-15 | POST `/classrooms/{classId}/assignments/{assignmentId}/submissions` | SubmitProgress | SubmissionViewResponse | Mutation |
| CW-16 | POST `/me/classroom-submissions/{submissionId}/withdraw` | WithdrawSubmission | SubmissionViewResponse | Mutation |
| CW-17 | POST `/classrooms/{classId}/submissions/{submissionId}/feedback` | PublishFeedback | FeedbackViewResponse | Mutation |
| CW-18 | GET `/classrooms/{classId}/assignments/{assignmentId}/submissions` | —; query PageQuery | SubmissionList | Read |
| CW-19 | GET `/classrooms/{classId}/assignments` | —; query PageQuery | AssignmentList | Read |
| CW-20 | GET `/me/classroom-acceptances/{commandId}` | — | AcceptanceViewResponse | Read |
| CW-21 | GET `/me/classroom-submissions/{submissionId}` | — | SubmissionWithFeedbackResponse | Read |
| CW-22 | GET `/classrooms/{classId}/memberships` | —; query PageQuery | MembershipList | Read |

CW-03 uses active membership, including a read-only archived class. CW-22 is
educator-only, includes minimal permitted learner membership/display identity,
and never reveals private acceptance or scheduling. CW-18 is role-filtered:
educator sees authorized reports for current class members; learner sees only
their own. Absent reports are not evidence of inactivity or failure. No report
payload is needed to enumerate private tasks.

CW-20 is an own-private receipt lookup independent of current class membership;
CW-21 and CW-16 are own-data controls independent of current membership, subject
to the reviewed retention/eligibility policy. They must not fetch fresh class
content or foreign feedback through old references. A revoked account/session is
not authenticated merely because a receipt exists.

CW-20 returns a pointer to the same existing/deleted private Task, not a full
Task snapshot. Use the canonical owner-only Task read/sync to obtain current
content. This prevents stale acceptance responses overwriting subsequent private
edits. First acceptance copies the server-published title/instructions and, only
if copyDue=true, the due instant into the existing private Task contract. The
original assignment zone/revision remains private provenance. No availability,
calendar event, reminder or public acceptance metric is created.

Because CW-20 looks up only commandId, acceptance receipts additionally require
unique(actor, operation, command_id) across assignment scopes. Reusing an accept
command ID for another assignment must return COMMAND_CONFLICT, not create a
second receipt or ambiguously choose one. Other commands retain scoped dedupe.

CW-11 revisions are immutable; AssignmentView.version is the current mutable
assignment lifecycle version and revision identifies the returned content edition.
A historical read must not present old content as current. Future editing uses
the current version and an explicit preview; first acceptance still checks the
shown revision is current. CW-12 closed/withdrawn assignment cannot accept new
reports/work; own withdrawal remains allowed.

CW-15 has only `selection:{progress:...}`, assignmentRevision and policyVersion;
no private Task ID, note, schedule, duration or resource metadata. Server checks
that the learner's private acceptance belongs to this assignment and revision.
Sending a report does not complete Task or grant XP. After withdrawal, only a
fresh command with current withdrawn version and explicit preview can re-share.
Old content/feedback never becomes visible merely because state becomes shared.

Feedback on an older report remains labelled with that report version while the
share is otherwise visible. New feedback must target the current shared revision.
After withdrawal, response has no selection and feedback=null; after re-share,
only feedback belonging to the new sharing episode may be exposed. Do not use a
broad latest-feedback join that restores withdrawn text. Minimal tombstones do not
include learner names/IDs; educator mapping, if needed, must be a separately
reviewed class display projection, not private-data expansion.

### HTTP error semantics

| HTTP | Code(s) | Retry meaning |
| --- | --- | --- |
| 400 | VALIDATION_FAILED | Correct request; never strip unknown fields silently |
| 401 | AUTH_REQUIRED | Authenticate/recover valid session; do not switch owner silently |
| 403 | POLICY_REQUIRED | Only own known policy eligibility; no foreign object disclosure |
| 404 | NOT_FOUND, INVITATION_UNAVAILABLE | Neutral missing/inaccessible/expired invite; do not distinguish foreign ownership |
| 409 | VERSION_CONFLICT, INVALID_TRANSITION, COMMAND_CONFLICT, COMMAND_EXPIRED | Explicit reconciliation/new preview, not automatic overwrite or new command |
| 429 | RATE_LIMITED | Honor bounded Retry-After; preserve original command ID |
| 503 | DEPENDENCY_UNAVAILABLE | Bounded retry/status recovery; no success acknowledged |

Schema Error is a safe envelope, not proof the code matches HTTP status. Handler
mapping must enforce this table and retryable=true only for 429/503. No stack,
SQL, received token, conflicting foreign IDs or provider error passthrough.
Maximum attempts and command retry horizon remain reviewed operational policy.

## 4. Relational data schema — logical, not an executable migration

Use PostgreSQL UUID identity columns, integer version CHECK >=1, timestamptz
for instants and explicit text zone; table/column names below are proposed private
domain structures. Foreign references need class/owner composite integrity.
All mutable records have created_at/updated_at/version; immutable revisions have
created_at and their revision key. No secrets or invite delivery token in DTO tables.

| Table / key | Minimum columns and constraints | Visibility / important exclusion |
| --- | --- | --- |
| classrooms / id | education_scope_id unique, educator_subject_id, label, state(active/archived), version | Trusted creator admission; no normal direct client role changes |
| classroom_memberships / id | class_id, subject_id, role, state, display_name, policy_version, version; unique(class_id,subject_id), unique(class_id,id) | One current educator; role membership not profile preference; learner cannot list peers |
| classroom_invites / id | class_id, token_digest unique, state, expires_at, issuer, redeemed_by nullable, version; single-use invariant | Trusted-only digest; isolated encrypted delivery record, not general response cache |
| classroom_assignments / id | class_id, current_revision, lifecycle, version; unique(class_id,id) | Latest pointer and content revision update atomically; closed/withdrawn not privately destructive |
| classroom_assignment_revisions / (assignment_id,revision) | class_id, title, instructions, due_at nullable, due_zone nullable; both due fields null or both present | Composite FK(class_id,assignment_id); immutable content |
| private_classroom_acceptances / id | learner_subject_id, personal_workspace_id, class_id, assignment_id, accepted_revision, task_id, accepted_at; unique(learner_subject_id,assignment_id) | Private owner only; task owner composite FK; no educator SELECT or cascade to Task |
| classroom_submissions / id | class_id, assignment_id, learner_membership_id, current_revision, state, version, sharing_epoch; unique(assignment_id,learner_membership_id) | Require composite class/membership/assignment consistency; no private Task FK in teacher read projection |
| classroom_submission_revisions / (submission_id,revision) | class_id, assignment_revision, progress, sharing_epoch, received_at | Values copied from exact confirmed selection; no live private-data view |
| classroom_feedback / (submission_id,submission_revision,feedback_revision) | id UUID unique, class_id, educator_membership_id, sharing_epoch, text, received_at | Same class and sharing episode; feedbackId identifies this immutable row, wire version equals feedback_revision; select latest permitted revision atomically |
| private_classroom_commands / (actor,scope,operation,command_id) | payload_digest, digest_version, digest_key_id, replay_state(active/closed), result_kind/result_id, committed_at, expires_at | HC-00 refines expiry into closed denial identity; no plaintext token/notes; purging requires reviewed anti-replay/privacy proof |
| private_classroom_share_receipts / id | learner_subject_id, submission_id/revision, sharing_epoch, selected_fields, policy_version, command_id, received_at | Own-private/minimal audit; not continuous consent or a second private-resource store |

Assignment content revision and mutable lifecycle version are distinct counters.
Submission version increases on edit/withdraw/re-share; immutable payload revision
records capture those states without rewriting old selections. sharing_epoch
increments on fresh re-share after withdrawal; feedback from a prior epoch is
never restored. A receipt cannot be the only enforcement of consent: mutation
authorization and exact selected field validation are still required.

No client DML grants on membership/invite/command/receipt/revision tables.
Approved handlers enforce actor/object authority and reviewed RLS/function grants
must independently protect every reachable path. Avoid security-definer views
over private Task tables. Teacher reads come from class-safe projections, never
a join that traverses the learner's private link. Role/ownership/policy columns
are not ordinary patch fields. Exact SQL privileges/search_path/RLS policies and
function-execution grants require the next reviewed SQL packet.

Account erasure/retention must not cascade through a class to erase unrelated
learners' Tasks. Tombstone deleted private Task links to prevent accept replay
recreation; do not infer a new task because a FK is missing. Legal retention of
class copies, account export serialization and restore tombstone application
remain G1/G4 gates; these structures do not establish a lawful retention period.

[TI-00](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) refines logical task_id
into immutable accepted_task_id plus nullable live_task_id and deleted-link state.
The wire taskId/taskState is unchanged; no executable schema or retention duration
is selected by that mapping. Use its deletion/physical-purge constraints before DDL.

## 5. Transaction and concurrency protocol

This is a proposed implementation protocol requiring isolated proof, not a
database setting change. Use one transaction per confirmed mutation, with no
provider call, user interaction or network retry while holding database locks.

Lock discipline for the selected small-class slice (refined by TI-00 §4):

1. Verify authenticated identity and input shape; determine referenced subject/
   class keys without disclosing existence. No trusted authorization outcome yet.
2. Lock affected account/policy guards, app-session guards, owner sync heads,
   then class rows, each category in stable key order. Re-read eligibility and
   session/expiry after waiting. All affected private Task, session-revocation
   and erasure writers must adopt TI-00's common order before integration.
3. Within a class, serialize mutations on the class row (FOR UPDATE candidate),
   then lock affected membership, invitation/assignment, private Task/link and
   submission/feedback/receipt rows in TI-00's order. Revalidate all relationships,
   current states and versions. This is intentionally conservative contention,
   not a proven large-enterprise throughput strategy.
4. Under those guards resolve the actor-scoped command receipt. Same payload is
   replay, different payload conflict. Fresh command performs one atomic domain
   write plus receipt/audit metadata. Unique constraints catch competing creates.
5. Commit before success. Rebuild response from currently authorized result,
   excluding now-withdrawn/forbidden fields; never replay a raw cached JSON body.
   Private receipt recovery is separately owner-authorized.
6. On transaction abort/deadlock/serialization failure, roll back the whole attempt.
   Retry the same confirmed command within approved bounds, with fresh authority.
   Do not synthesize a new intent or alter payload to bypass conflict.

Creation has no preexisting class row: serialize through creator/account guard
and unique command receipt; no nonexistent-row lock is assumed. Invite redemption
and versioned edits resolve the same class guard even through different routes.
Task deletion/edit and acceptance must use compatible owner/task ordering; the
future shared task adapter cannot take locks in reverse order.

Revocation-first prevents the subsequent protected write. Write-first can commit,
then revocation closes later access; it cannot revoke bytes already delivered.
Reads must evaluate membership/privacy state in the same statement/snapshot that
selects projected content, and re-check between pages. A read authorized before
revocation commits may finish delivery afterward; do not promise zero in-flight
disclosure or immediate disconnected-cache erasure.

PostgreSQL documents row-lock blocking and potential deadlocks; consistent lock
ordering reduces that hazard. These facts motivate, but do not validate, our
class-guard protocol. [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).
Its Read Committed isolation can use different snapshots for successive commands,
so an earlier permission read alone is not sufficient for the later write.
[PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).
Deployed PostgreSQL version/configuration is not established by reading current docs.

### Specific atomic groups and failpoints

- Join: validate fresh eligibility/token/class → membership → token redemption →
  command receipt. Failure at any point rolls back all; denied join does not
  consume a valid invitation.
- Publish: authorized expected version → immutable content revision → current
  pointer/version → command receipt. No private learner work update.
- Accept: fresh valid assignment preview → existing unique link lookup → private
  Task/create link/private receipt atomically. Multiple new commands still return
  the same linked Task; a deleted link does not recreate it.
- Share/amend/re-share: active membership + accepted revision + expected submission
  state/version → exact payload revision + share receipt + head/epoch + command
  receipt. No reward update, task completion or private analytics projection.
- Withdraw/leave/revoke: versioned visibility state + dependent access closure +
  receipt commit together. Restricted retention/purge jobs do not leave ordinary
  visibility enabled while waiting. They remain separately observable/retryable.
- Feedback: same-class authorized educator + current shared submission revision/
  epoch → versioned feedback + receipt. Concurrent withdrawal blocks or hides it.

Mobile persistence is another commit: server success → own pointer recovery →
canonical current private Task merge → durable local save. Failed mobile save
cannot undo or duplicate a successful server transaction. Account A's late
response never enters account B's store. No claim of offline availability until
local commit succeeds; no local provisional task with a second ID.

### Invitation delivery and replay proposal

Generate 32 random bytes using a trusted cryptographic generator; encode base64url.
Store a digest for lookup and a separate encrypted delivery copy with restricted
key access only while the invite is usable. Same command may recover the same
token only for the still-authorized issuer while issued; expired/revoked/consumed
responses have token=null. Do not log/cache the raw body. Encryption/key custody,
expiry, issue/rate limits and transport remain G2; absent configuration disables
issuance. The wire shape is not approval of a key provider or token-retention TTL.

HC-00 also inventories private_classroom_cursor_handles as auxiliary security
storage alongside encrypted invite delivery and account/session dependencies,
outside the eleven domain tables above. Its owner-bound immutable cursor records,
helper-only privileges, expiry/cleanup and export/erasure treatment must enter the
reviewed DDL/storage inventory before activation; no auxiliary table exists yet.

## 6. Isolated transaction-test execution plan — NOT_RUN

The JSON packet is the exact TX-01–24 scenario inventory with given,
interleaving, expected oracle, CW operation and CT source cases. It authorizes
no execution and names no live database. The local checker validates the packet
and rejects invented PASS/evidence/production targets; it does not run transactions.

Required future harness: disposable authorized PostgreSQL/Supabase test target,
synthetic identities E1/E2/A/B/O, representative RLS/database roles, two or more
independent connections, deterministic barriers/failpoints and a read-only
post-commit oracle. Inspect installed tools and obtain setup authority before
naming an executable SQL command; none is invented in this document.

| Cases | Required schedule/evidence |
| --- | --- |
| TX-01–04 | Duplicate create, two-learner single-token race, denied-policy rollback, revoke-versus-join in both orders |
| TX-05–08 | Revoke-before/after-submit, concurrent teacher revisions, two-device accept with different command IDs |
| TX-09–12 | Rollback at each Task/link/receipt write, lost response/private recovery, deleted-task replay, competing report amendments |
| TX-13–16 | Withdraw/feedback in both orders, old replay versus fresh re-share, stale feedback target, archive versus new writes |
| TX-17–20 | Direct/API foreign access, token delivery replay/closure, auth/policy change before replay, scoped pagination |
| TX-21–24 | Privacy restore/export coverage, newer private edit during mobile merge, deadlock/account-revocation ordering, payload/log leakage |

For each: test version, exact build/migration hash, database/runtime configuration,
role/session identity, barrier order, expected/actual rows/DTOs and redacted
evidence. Both race orders must be run; a sequential happy path is not equivalent.
Assert cardinality, owner/class FKs, immutable revisions and absence of unintended
writes, not merely HTTP 200/403. Show an authorized positive row exists so empty
fixtures cannot make isolation tests vacuously green. Restore testing is isolated,
never production teardown. Cleanup only verified test-owned schemas/data.

Native offline/store/account-switch and accessible UI scenarios remain 39's CT
and 11's SL tests; database tests cannot substitute for them. No real children,
personal files, paid runs or production datasets are authorized.

## 7. Repeatable checks and handoff

[Canonical/access reconciliation 41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
now maps every CW operation and logical table to permissions/integrity obligations,
export limitations and isolated SQL admission gates. This completes the reference
mapping slice, not SQL implementation or independent design acceptance.

From repository root, using installed Node (absolute runtime path if needed):

```text
node docs/revision/check-classroom-contracts.mjs
node docs/revision/check-docs.mjs
git diff --check
```

The first check compiles JSON schemas with existing Ajv and validates positive/
negative synthetic DTOs, OpenAPI refs/auth/cache/queries and test inventory.
It performs no SQL, HTTP, RLS, migration, identity, invitation, app or device test.
No package script was added and no dependency installed.

Independent review must inspect schema + API + this transaction/data design as
one versioned packet, including application of G1/G2/G3 operational policy and
the canonical reconciliation list in 39 §8. Schema PASS is not review approval.
Eight CL cards remain DRAFT; the new 22 wire operations are not deployed and
do not alter historical operation counts in earlier packets.

Remaining work before affected implementation: exact operational/security
configuration; reviewed canonical API/data/database/security and export changes;
actual isolated migrations/RPC/test harness; qualified independent review and
relevant policy approval. Ordinary specification work can continue without
re-asking classroom placement; money/legal facts/review stay with the owner.
