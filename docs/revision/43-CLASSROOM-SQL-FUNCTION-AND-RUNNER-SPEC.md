# Classroom function and isolated runner specification — SF-00

2026-09-30. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

සිංහල: මෙහි API operations 22ට අදාළ SQL function inputs/outputs, අවසර,
migration අනුපිළිවෙළ සහ test runner එක සෑදිය යුතු විදිහ නිශ්චිතව දක්වනවා.
මෙය SQL files හෝ runnable integration runner එකක් නොවේ. ඒවා සෑදීමට පෙර
shared core contracts සහ independent review අවශ්‍යයි; tests run කිරීමට වෙනම
අවසර ලත් disposable environment එකක් අවශ්‍යයි.

Authority: the owner accepted this specification continuation under the September
29 design delegation. [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) owns scope;
[40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) owns unchanged wire/schema/TX
contracts; [41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md) owns access
predicates/SQ admission; [42](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md)
owns tombstone, verified identity and common locking. This narrows implementation
choices; it does not approve policy, grant runtime authority or close those gates.

## 1. Internal call convention

**October 1 EB-00 amendment:** [46](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md) replaces
the incompatible SQL-only placement identified by FA-00. The revised signature
rule and CW-05 internal result below are its concrete draft bridge. ADAPTER_HOLD
remains for key/nonce policy, shared DDL, independent review and real integration;
structural checker success does not lift it. Public requests/responses are unchanged.

Every candidate function in §2 has these positional arguments, in this order:

```text
p_actor_id uuid,
p_provider_session_id uuid,
p_token_expires_at timestamptz,
<the selector parameters listed in that row, in listed order>,
p_input jsonb
RETURNS jsonb
```

For all 13 MUTATION entries, append required **p_bridge jsonb** after p_input;
it must validate as 46's MutationMaterial. All nine READ entries have no p_bridge.
The additional preparation signature, owned by df_class_prepare, is exactly
`df_api.classroom_prepare_v1(p_actor_id uuid, p_provider_session_id uuid,
p_token_expires_at timestamptz, p_operation text, p_selectors jsonb, p_input jsonb)`
and RETURNS jsonb (Preparation). It is server-only, not a public API route.

All arguments are required, without SQL defaults or overloads. No argument may be
SQL NULL. The nullable expectedVersion inside a valid JSON command is different
from a NULL SQL argument. For an operation with no public body/query, p_input is
exactly `{}` (label EmptyQuery below), not SQL NULL or a new HTTP body. PageQuery
and AssignmentQuery use 40's exact parsing/default rules. Mutation inputs are the
entire unchanged command envelope, not payload alone. PreviewInvite is a read.

The first three arguments come only from 42's verified request-local Edge context.
No public DTO gains actor/session/expiry. Selectors come from validated path UUIDs;
all JSON constraints must be enforced again at the trusted operation boundary.
Edge rejects duplicate JSON keys before jsonb conversion loses that information.
Named functions are a static server allowlist, never a caller-supplied function
name, role or SQL fragment. Separate bound parameters; no SQL interpolation.

Each entry is proposed PL/pgSQL SECURITY DEFINER, owned by its constrained NOLOGIN
capability role below, not a table owner. This is necessary because the gateway
has EXECUTE only, not underlying table privileges. Use VOLATILE, PARALLEL UNSAFE,
CALLED ON NULL INPUT with explicit NULL rejection, and fixed search_path containing
only pg_catalog followed by pg_temp. Fully qualify every application relation,
function and non-built-in type; nothing resolves from public or a writable schema.
Do not mark these authorization functions LEAKPROOF or IMMUTABLE. Internal pure
helpers can be invoker functions; every additional privileged helper needs its
own reviewed owner/signature/grants, not inheritance from an entry's name.

One connection, one explicit transaction, one final entry operation. Mutations
first perform 46's separately completed read-only preparation; no locks survive
into external key loading. The Edge adapter validates the internal result, performs
CW-05's local AEAD/public projection, then validates the exact public response
before COMMIT, buffers it,
and sends HTTP 200 only after successful COMMIT. It must never stream an uncommitted
result. A failed response validation rolls back and yields safe dependency failure;
unknown commit outcome uses original command recovery. Read results also use a
completed transaction and no-store. A mutation's result is a current authorized
projection, not a cached response containing formerly shared data.

## 2. Complete entry-function signatures

Names below are in **df_api**, a non-client-exposed namespace. Every name includes
the common prefix/suffix and mutation-only bridge argument in §1. Public inputs
and ordinary results name the unchanged [schema](contracts/classroom.schema.json).
CW-05's internal BridgeInviteResult is in the [bridge schema](contracts/classroom-bridge.schema.json);
46 maps it to the unchanged public InviteViewResponse. Owner labels expand to df_class_<label>.

| Operation | Function | Selectors | Input | Result | Owner | Effect |
| --- | --- | --- | --- | --- | --- | --- |
| CW-01 | class_create | — | CreateClass | ClassViewResponse | manage | MUTATION |
| CW-02 | class_list_own | — | PageQuery | ClassList | read | READ |
| CW-03 | class_read_own | p_class_id uuid | EmptyQuery | ClassViewResponse | read | READ |
| CW-04 | class_archive | p_class_id uuid | ArchiveClass | ClassViewResponse | manage | MUTATION |
| CW-05 | invite_issue | p_class_id uuid | IssueInvite | BridgeInviteResult | invite | MUTATION |
| CW-06 | invite_revoke | p_class_id uuid, p_invite_id uuid | RevokeInvite | InviteViewResponse | invite | MUTATION |
| CW-07 | invite_preview | — | PreviewInvite | InvitePreviewResponse | invite | READ |
| CW-08 | invite_accept | — | AcceptInvite | MembershipViewResponse | invite | MUTATION |
| CW-09 | member_revoke | p_class_id uuid, p_membership_id uuid | RevokeMember | MembershipViewResponse | manage | MUTATION |
| CW-10 | class_leave | p_class_id uuid | LeaveClass | MembershipViewResponse | manage | MUTATION |
| CW-11 | assignment_publish | p_class_id uuid | PublishAssignment | AssignmentViewResponse | assignment | MUTATION |
| CW-12 | assignment_lifecycle | p_class_id uuid, p_assignment_id uuid | AssignmentLifecycle | AssignmentViewResponse | assignment | MUTATION |
| CW-13 | assignment_read | p_class_id uuid, p_assignment_id uuid | AssignmentQuery | AssignmentViewResponse | read | READ |
| CW-14 | assignment_accept | p_class_id uuid, p_assignment_id uuid | AcceptAssignment | AcceptanceViewResponse | accept | MUTATION |
| CW-15 | progress_submit | p_class_id uuid, p_assignment_id uuid | SubmitProgress | SubmissionViewResponse | share | MUTATION |
| CW-16 | progress_withdraw | p_submission_id uuid | WithdrawSubmission | SubmissionViewResponse | share | MUTATION |
| CW-17 | feedback_publish | p_class_id uuid, p_submission_id uuid | PublishFeedback | FeedbackViewResponse | feedback | MUTATION |
| CW-18 | submission_list | p_class_id uuid, p_assignment_id uuid | PageQuery | SubmissionList | read | READ |
| CW-19 | assignment_list | p_class_id uuid | PageQuery | AssignmentList | read | READ |
| CW-20 | acceptance_recover | p_command_id uuid | EmptyQuery | AcceptanceViewResponse | accept | READ |
| CW-21 | submission_read_own | p_submission_id uuid | EmptyQuery | SubmissionWithFeedbackResponse | share | READ |
| CW-22 | member_list | p_class_id uuid | PageQuery | MembershipList | read | READ |

Thus 13 mutation and nine read entries, plus one preparation signature. This
corrects the former prose count of 14/eight against the unchanged OpenAPI flags.
CW-20's command selector
is an acceptance receipt key, not a fresh command. Existing schema fields and
required authorization in 41 remain authoritative; a SQL signature is not access.

### Failure transport and transaction rules

Entries return only the success JSON shape. Domain failure raises a sanitized
exception; never return an error object after partially committing domain writes.
Proposed internal SQLSTATE allocation below is distinct from the public code.
No exception MESSAGE/DETAIL/HINT, constraint name or SQL text is forwarded to users.
Edge constructs the existing Error envelope with a server-generated requestId and
a fixed localized messageKey mapping. Unknown database errors map to 503, not a
made-up validation or foreign-object existence response.

| SQLSTATE | Public code | HTTP | retryable |
| --- | --- | --- | --- |
| DF001 | VALIDATION_FAILED | 400 | false |
| DF002 | AUTH_REQUIRED | 401 | false |
| DF003 | POLICY_REQUIRED | 403 | false |
| DF004 | NOT_FOUND | 404 | false |
| DF005 | INVITATION_UNAVAILABLE | 404 | false |
| DF006 | VERSION_CONFLICT | 409 | false |
| DF007 | INVALID_TRANSITION | 409 | false |
| DF008 | COMMAND_CONFLICT | 409 | false |
| DF009 | COMMAND_EXPIRED | 409 | false |
| DF010 | RATE_LIMITED | 429 | true |
| DF011 | DEPENDENCY_UNAVAILABLE | 503 | true |

46 additionally allocates **DF012 PREPARATION_STALE**, internal only. Roll back
and re-prepare the same intent within reviewed bounds; exhaustion maps to DF011's
public response. Never put PREPARATION_STALE in the public Error.code enum.

Only classify a constraint failure as domain conflict after current authorization
and a recognized operation-local constraint. Otherwise rollback and emit safe
dependency failure. SQLSTATE 40001/40P01 require whole-attempt rollback; bounded
retry uses fresh verified identity and the same exact command, never a new intent.
Connection loss during COMMIT is indeterminate, not proof of rollback. The adapter
must discard or safely rollback uncertain connections. Retry limits are reviewed
configuration, not invented here. Error telemetry allows case/code/request ID and
safe timing only; tokens, payloads, bindings and SQL exception text are excluded.

## 3. Capability grants and required dependencies

Only df_edge_gateway is granted runtime-caller EXECUTE on the exact 23 signatures:
22 operations with the mutation argument rule plus 46's preparation. No legacy
mutation overload without p_bridge remains callable after an authorized migration.
Function ownership remains with the constrained owners below. PUBLIC, anon and
authenticated get none, including helpers, overloads or views. Gateway has no raw
table DML/SELECT, schema CREATE, role-administration or membership enabling SET ROLE
to a capability owner. Migration/table owner is separate; all capability owners
are NOLOGIN, non-superuser, not BYPASSRLS and not table owners. Grant only required
schema/type USAGE. Default and existing function EXECUTE must be explicitly closed
in the same transaction as creation; inspect actual catalogs rather than names.

Below are maximum design capabilities, not executable broad table grants. SELECT
means named columns needed for current predicates/projections; UPDATE means only
the named lifecycle/pointer/version columns. Structural ownership/class/assignment
keys are immutable; explicitly named lifecycle pointers and invite redeemed_by
may change only through their specified transitions, never arbitrary FK reassignment.
No capability gets DELETE/TRUNCATE/TRIGGER/REFERENCES/DDL. Migrations/retention jobs
are separate authorities. Exact SQL column grants/policies must be generated from
the final shared schema and reviewed before SF-M06; absent dependencies fail closed.

| Owner label | Permitted domain capability | Explicit exclusion |
| --- | --- | --- |
| manage | Class and membership authorized columns; insert class + educator membership; update class state/version/updated_at or membership state/version/updated_at | No private acceptance/Task, invite token, report payload or feedback text |
| read | Authorized class/member/assignment/revision and permitted report/feedback projections using current membership/lifecycle | No private acceptance, Task, commands, share receipt or invite secret |
| invite | Class/member predicates; invite metadata; insert learner membership; update invite state/redeemed_by/version/updated_at | No educator role promotion, Task or progress; secret generation/delivery only through separately constrained helper |
| assignment | Class/member predicates; assignment/revision SELECT and INSERT; head current_revision/lifecycle/version/updated_at UPDATE | No learner Task, submission or acceptance mutation |
| accept | Class/member/assignment predicates; own acceptance SELECT/INSERT; restricted core Task creation capability | No educator projection, raw arbitrary Task DML, submission change or deletion-link reactivation |
| share | Class/member/assignment predicates; own acceptance identity/revision only; submission/revision INSERT; head state/current_revision/version/sharing_epoch/updated_at UPDATE; share-receipt INSERT | No Task title/notes/schedule/focus reads or writes; feedback only via current permitted projection |
| feedback | Class/member/assignment/submission predicates; permitted feedback SELECT/INSERT | No learner private data, report mutation, feedback UPDATE or deletion |

Seven operation roles above and 46's eighth preparation owner are design names,
not created roles. Scoped RLS predicates must
implement 41's E/L/M/Own distinctions, not one universal owner_id rule. Role grants
alone do not authorize a specific actor; verified transaction context plus current
row relationships do. No teacher-facing function may traverse private acceptance
or private Task. CW-20 remains own-private recovery after class membership loss.

Shared helpers required before function bodies can be accepted:

- **Identity/guard helper:** reviewed account/policy + app-session registry lookup,
  current-time expiry recheck after lock wait, transaction-local context, TI lock
  order. Executor needs only the documented lookup/lock capability. PostgreSQL
  row-lock statements can require UPDATE privilege as well as SELECT; isolate any
  necessary column grant in the helper owner, with no callable arbitrary UPDATE.
  Do not silently grant account/session updates to classroom entry owners.
- **Command helper:** exact actor/scope/operation/command + versioned semantic
  digest, immutable receipt insertion and authorized pointer recovery. Acceptance
  additionally unique actor/operation/command across assignments. No cached token
  or payload. Canonical digest encoding/test vectors must be fixed before bodies;
  this document does not pretend jsonb stringification is a portable digest spec.
- **Core Task helper:** insert into the existing owner/workspace Task + sync change
  atomic group, same connection/transaction, return new identity; no HTTP call or
  second transaction. Acceptance uniqueness is checked first. Existing delete/purge
  writers must transition 42's link under the same owner-head lock. No direct
  gateway execution grant for this internal helper; no server Task helper exists.
- **Invitation helper:** SQL lookup digest and atomic encrypted-envelope storage/
  delivery, current expiry/issuer checks; Edge does token generation and AEAD per 46.
  Key custody/rotation, nonce allocation, TTL and driver
  integration remain G2. No external network call while locks are held; if approved
  key architecture cannot satisfy atomic issuance/recovery, revisit that design
  before implementing CW-05. No plaintext in ordinary receipt storage.
- **Cursor/config helpers:** authenticated actor/scope/order-bound cursor and exact
  policy/rate limits, token/session/command horizons and safe error translation.
  Missing configuration disables affected operation, not a guessed default.

These helpers have **not** been created. Their exact shared-schema signatures and
column-level policy DDL remain upstream review inputs; the 22 entry signatures
are now specified, not a claim that runnable SQL could be safely generated without
those inputs. This distinction prevents an implementer inventing auth/key policy.

[HC-00](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md) supplies the concrete
command digest/replay, opaque cursor and invitation helper behavior candidate.
It adds a private auxiliary cursor registry and command key/closed-state fields
to SF-M02's review inventory. Cursor creation on list reads uses helper-only
auxiliary INSERT, not domain mutation or direct gateway privileges. Its local
vectors do not implement crypto. 46 places command JCS/HMAC and invitation AEAD
at Edge, with typed preparation/material/results; SQL retains lookup/cursor hashing,
current authorization and atomicity. Exact shared helper/column grants remain review inputs.

## 4. Ordered migration seams — all UNCREATED

Candidate directory: `docs/revision/contracts/classroom-sql/`. Names below are
future isolated prototype paths, not production migration IDs or commands. Start
only after core owner/session/Task/sync contracts and TI writer compatibility are
reviewed. Each file has an explicit transaction/recovery boundary; no autocommit
window exposes a newly created function. Record exact hash, not just filename.

| Step | Candidate filename | Content and prerequisite | State |
| --- | --- | --- | --- |
| SF-M01 | 01-role-boundary.sql | Verify selected versions/core schema hashes, non-client schema and NOLOGIN role boundary; close creator-specific default privileges | UNCREATED |
| SF-M02 | 02-tables-constraints.sql | Eleven tables with TI-00 tombstone fields; composite uniqueness/FKs/checks; no public grants; dependency accounts/delivery stores explicitly inventoried | UNCREATED |
| SF-M03 | 03-identity-core-helpers.sql | Reviewed identity/session guards, private Task/receipt/config helper boundaries, shared writer lock-order reconciliation | UNCREATED |
| SF-M04 | 04-rls-capabilities.sql | Enable RLS and exact capability-role/column policies; no runtime entry enabled; verify owner/BYPASS exclusions | UNCREATED |
| SF-M05 | 05-operation-functions.sql | 22 revised operation entries plus 46's preparation and internal CW-05 result; restricted EXECUTE from creation; fixed search_path; no test hooks in production variant | UNCREATED |
| SF-M06 | 06-gateway-grants.sql | Grant only exact signatures to narrow gateway after catalog review; client/helper/overload denial and authorized positive checks | UNCREATED |
| SF-M07 | 07-fixtures-and-oracles.sql | Separate synthetic-only fixtures and read-only test oracle; never a production migration or runtime grant | UNCREATED |

Head/revision cycles: create both tables and their unique keys before adding
composite head→revision constraints. Proposed DEFERRABLE INITIALLY DEFERRED head
references allow head+first-revision creation inside one transaction; revision→head
references remain immediate. All references must be valid by COMMIT. Test forced
commit failure and rollback. Do not use disabled constraints or let invalid heads
escape as successful HTTP responses. Final DDL review confirms every composite
key including class identity and sharing episode, rather than guessing from DTOs.

Migration failure rolls back the affected transaction; leave public routes disabled.
If earlier steps committed, inspect the recorded ledger/hashes before rerun; do
not mark an edited migration as already applied or DROP existing data to fix drift.
Recovery is an approved safe-forward correction or restore into a **different**
disposable target. No destructive automatic down migration. Nontransactional
operations, if later required, need their own reviewed recovery plan. Applying
SF-M06 on a test database is not permission for public endpoint activation.

## 5. Isolated runner contract

Candidate runner seam: `tests/integration/classroom/runner.ts` (UNCREATED).
No package command, runtime version or database driver is invented as installed.
Choose/pin them after read-only discovery and authority, retaining the existing
read-only documentation checker as a separate tool. A runner must not install its
own dependencies, provision a target, accept a live connection by default, or
enable classroom features in the app.

### Admission/configuration object

Required fields for a future run; current values are absent, not passing fixtures:

| Field | Type / validator | Failure behavior |
| --- | --- | --- |
| runId | Fresh UUID; bound to all fixture labels/artifacts | Reject duplicate conflicting run identity |
| targetId, targetFingerprint | Approved nonsecret ID and independently observed project/database metadata digest | Reject mismatch before any write; an environment variable saying test is insufficient |
| environment | Literal disposable-synthetic | Reject production/shared/unknown; no fallback URL |
| authorityRef, reviewRef | Nonempty evidence references naming exact target, scope and artifact hashes | Missing or stale evidence blocks run, not a fabricated approval flag |
| versions | Exact observed PostgreSQL/Supabase/Edge/driver/verifier/runner versions | Reject missing/mismatched supported combination |
| artifacts | Map of core schema, migrations, functions, policies, runner and fixtures to SHA256 digests | Reject drift or changed fixture/function after review |
| policyFixture | Versioned synthetic-only eligibility/limits/clock/retention assumptions and hash | Never copy test constants into production defaults |
| connectionRefs | Secret-manager/environment reference names for gateway, migration and read-only oracle connections | No secret values/URLs printed or included in report; no role fallback |
| selectedCases | Nonempty unique subset of the 40 IDs below | A subset is a partial run, never whole-suite PASS |
| deadlines | Explicit positive bounded statement, lock, barrier and suite timeouts | Missing values block; timeout fails case and rolls back, never skips |
| evidenceDirectory | Exact approved test-owned output directory | Reject traversal/outside-root paths; safe artifacts only |

SQ-01–05 supply admission inputs for execution; SQ-06 is the **result evidence**
gate, not an impossible prerequisite that tests must already pass before running.
Independent review of the design/migration/runner is required before acceptance;
execution also needs exact target authority. None is inferred from this document.

### Runner state machine and connection roles

`ADMISSION → CATALOG → FIXTURES → CASES → RECOVERY → REPORT` with failure entering
`ROLLBACK_AND_REPORT`. Cleanup is a separately verified test-owned action, not an
unconditional finally-block DROP. A failure retains safe evidence and reports
unattempted dependent cases as NOT_RUN. No PASS on absent fixtures or swallowed errors.

Migration principal creates only reviewed objects/fixtures. Two independent
gateway connections A/B exercise actual entry grants. Read-only oracle O captures
post-commit state on a fresh snapshot. A test coordinator observes lock barriers;
any catalog-monitor privilege belongs only to that isolated coordinator, never
to application roles. Do not SET ROLE from a superuser and assume it represents
the deployed login unless role/session/connection equivalence is separately proved.

Fixtures: synthetic E1/C1 and E2/C2, learners A/B, outsider O, frozen account,
revoked/mismatched/missing session, two assignment revisions, present and deleted
acceptance, shared/withdrawn/re-shared reports. Every denial test first proves an
authorized positive object and working allowed path. No real learner IDs/files.

### Deterministic schedules and failpoints

Each case declares barriers by name and asserts arrival/blocking within a bounded
deadline. Never infer a race from sleep duration. Use transaction locks plus
coordinator observation for acquisition order; record actual schedule. Where an
internal write boundary cannot be observed externally, use a reviewed isolated
instrumented build. Its hash/diff must be recorded; hooks must be unreachable in
shipping artifacts. Instrumented results alone cannot certify the final build.

| Schedule | Exact ordering | Post-commit oracle |
| --- | --- | --- |
| S1 Single invite winner | A starts CW-08 and holds class/invite lock; B starts CW-08 with same token; coordinator confirms B blocked; commit A, release B; repeat with winner reversed | One consumed token, one admitted learner membership, one winning receipt; loser neutral unavailable, no losing write |
| S2 Revoke versus submit | A owns revocation guard; B submits and is observed waiting; A commits then B resumes; repeat with submit holding class guard and committing first | Revoke-first: no new report/receipt. Submit-first: one durable report then no later ordinary teacher visibility; private Task unchanged |
| S3 Accept versus private delete | Establish acceptance T; hold owner sync-head in first transaction; start competing fresh acceptance or core delete; confirm wait then release; run both orders and duplicate command variant | Exactly one acceptance identity; committed delete yields deleted link, no new live Task; reminder/plan/sync effects match core deletion contract |
| S4 Withdraw versus feedback | Existing shared report r1; first actor holds class/submission guard; competitor waits; run withdrawal-first and feedback-first, then fresh re-share | No feedback created after withdrawal wins; earlier feedback becomes hidden; re-share exposes only new epoch feedback |
| S5 Revocation/expiry during wait | Hold account/session guard in coordinator; begin verified request; commit session revoke then release, or hold until trusted token expiry; also run operation-first order | Fresh state/time check denies post-revoke/expired work with no receipt; operation-first may commit once, later access denied |

Atomic failpoint labels: JOIN_MEMBERSHIP, JOIN_REDEEM, PUBLISH_REVISION,
PUBLISH_HEAD, ACCEPT_TASK, ACCEPT_LINK, ACCEPT_RECEIPT, SHARE_REVISION,
SHARE_RECEIPT, SHARE_HEAD, WITHDRAW_HEAD, FEEDBACK_ROW, COMMAND_RECEIPT,
DELETE_TASK_TOMBSTONE, DELETE_REMINDERS, DELETE_ACCEPTANCE_LINK. Inject separately
after each write before COMMIT and assert no partial atomic group. Database
exceptions prove rollback only; lost-response tests instead commit first and drop
the HTTP response. Native-save failures happen after server commit, in mobile tests.

Restore corrupt/missing-Task fixtures only in explicitly isolated corruption
tests. Do not disable constraints on ordinary suites or claim realistic insert
through a restricting FK can create an impossible state. Distinguish rejecting
corruption at constraint level from handling a deliberately corrupted backup.

## 6. Execution-surface coverage — all NOT_RUN

DB = real isolated roles/constraints/functions/concurrency; EDGE = HTTP auth,
validation, adapter and redacted logs; MOBILE = Android/iOS durable state/account
switch; RESTORE = second disposable target with quarantine/suppression; PRIVACY =
actual authorized export/access serializer. A case needs **all** listed surfaces
before PASS. These are mappings of existing cases, not 40 newly run tests.

| Case | Required surfaces | State |
| --- | --- | --- |
| TX-01 | DB, EDGE | NOT_RUN |
| TX-02 | DB, EDGE | NOT_RUN |
| TX-03 | DB | NOT_RUN |
| TX-04 | DB, EDGE | NOT_RUN |
| TX-05 | DB, EDGE | NOT_RUN |
| TX-06 | DB, EDGE | NOT_RUN |
| TX-07 | DB, EDGE | NOT_RUN |
| TX-08 | DB, EDGE | NOT_RUN |
| TX-09 | DB | NOT_RUN |
| TX-10 | DB, EDGE, MOBILE | NOT_RUN |
| TX-11 | DB, EDGE | NOT_RUN |
| TX-12 | DB, EDGE | NOT_RUN |
| TX-13 | DB, EDGE | NOT_RUN |
| TX-14 | DB, EDGE | NOT_RUN |
| TX-15 | DB, EDGE | NOT_RUN |
| TX-16 | DB, EDGE | NOT_RUN |
| TX-17 | DB, EDGE | NOT_RUN |
| TX-18 | DB, EDGE | NOT_RUN |
| TX-19 | DB, EDGE | NOT_RUN |
| TX-20 | DB, EDGE | NOT_RUN |
| TX-21 | DB, RESTORE, PRIVACY | NOT_RUN |
| TX-22 | DB, EDGE, MOBILE | NOT_RUN |
| TX-23 | DB, EDGE | NOT_RUN |
| TX-24 | DB, EDGE, PRIVACY | NOT_RUN |
| TI-T01 | DB, EDGE | NOT_RUN |
| TI-T02 | DB | NOT_RUN |
| TI-T03 | DB | NOT_RUN |
| TI-T04 | DB | NOT_RUN |
| TI-T05 | DB, EDGE | NOT_RUN |
| TI-T06 | EDGE, MOBILE | NOT_RUN |
| TI-T07 | DB, RESTORE | NOT_RUN |
| TI-T08 | DB, EDGE | NOT_RUN |
| TI-T09 | DB, EDGE | NOT_RUN |
| TI-T10 | DB | NOT_RUN |
| TI-T11 | DB, EDGE | NOT_RUN |
| TI-T12 | DB, EDGE | NOT_RUN |
| TI-T13 | DB, EDGE | NOT_RUN |
| TI-T14 | DB, EDGE | NOT_RUN |
| TI-T15 | DB | NOT_RUN |
| TI-T16 | DB | NOT_RUN |

41/42's stated oracles still apply. Extend each with exact before/after cardinality
for Task/link/membership/revision/receipt, current versions and forbidden-column
absence. For race tests record both commit orders. Assert immutable old revisions,
current sharing epoch, no teacher-private join, no duplicate Task and preserved
owner/class composite keys. Catalog assertions cover inherited grants, function
owners/search_path, RLS enabled/policies and default privileges. A read-only oracle
is evidence of state, **not** proof that the gateway/client authorization works.

Per-case future result object: caseId, runId, status (PASS/FAIL/NOT_RUN/BLOCKED),
requiredSurfaces, surfaceResults, artifact/config hashes, fixture IDs, barrier
events, expected/actual cardinalities, safe response-schema verdict, safe SQLSTATE
category, rollback/commit outcome, redacted evidence paths and limitation/reason.
PASS requires every assertion and required surface, no unresolved mismatch. Store
no raw token/JWT/SQL binding/learner content/connection string. Missing evidence
fails acceptance; evidence of failure must not be replaced by an empty report.
The existing source packets retain NOT_RUN; real execution records are separate
versioned artifacts linked to exact tested revisions, not edits fabricating PASS.

## 7. Document verification and next dependency

The existing [checker](check-classroom-contracts.mjs) cross-checks §2 against
OpenAPI paths, requests, responses and mutation/read flags; checks migration order
and all 40 surface mappings; rejects negative document mutations. This verifies
inventory consistency only. It does not parse/execute SQL or prove capabilities,
oracles, rollback, RLS, JWT verification, safe retention or native behavior.
Actual commands/evidence and self-review: [SF-00 audit](09-COVERAGE-AND-AUDIT.md).

HC-00 specifies helper behavior; FA-00 identified the SQL crypto conflict and
EB-00 now supplies its draft internal transport replacement. Next is admission
of shared schema/key/nonce dependencies and independent review, not automatic
SQL implementation or feature expansion. No deployed helper is implied.
Exact target/toolchain and owner-reserved legal/key-custody/commercial decisions
remain unresolved. No automatic provisioning or additional agent is authorized.

## 8. Primary-source checks — September 30

- Function security context, safe search_path, NULL behavior and initial EXECUTE
  permissions inform §1/3. The chosen roles/signatures are our design, not provider
  certification. [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html).
- PL/pgSQL supports explicit SQLSTATE on exceptions; the DF allocation is an
  application proposal, not PostgreSQL's built-in domain taxonomy.
  [PostgreSQL errors](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html).
- Lock observation can support deterministic test barriers; monitoring capability
  must stay out of ordinary application roles.
  [PostgreSQL administration functions](https://www.postgresql.org/docs/current/functions-admin.html).
- Row-locking SELECT needs the applicable SELECT and UPDATE privileges; the helper
  grant review must account for this without adding an arbitrary update API.
  [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html).
- Transaction-pool/driver constraints require exact deployed configuration; session
  state and unsupported prepared behavior cannot be assumed safe.
  [Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres).

Reading current provider documents does not establish a project's deployed version.
All runtime/security scenarios above remain NOT_RUN; independent review PENDING.
