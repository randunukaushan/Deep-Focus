# Private Task tombstones and trusted database identity — TI-00

2026-09-30. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

සිංහල: Task එක delete කිරීමෙන් පසුව පරණ request එකක් නැවත එවූවත් එය අලුතින්
හැදෙන්නේ නැහැ. ඒ සඳහා content නැති අවම private identity record එකක් යෝජනා කරනවා.
Database එකට යන user identity එක verified login එකෙන් server එක ගන්නවා;
client එක එවන ownerId එකකින් නොවේ. මෙය tested implementation එකක් නොවේ.

Authority: owner requested this next documentation slice. Ordinary design choice
under the September 29 delegation, not approval of retention/legal facts or roles.
[41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)'s SQ-02/03 now have
a selected **design candidate** below; their review/integration gates remain OPEN.
[40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) remains wire authority for
CW drafts. No DTO, source, SQL prototype, account, credential or provider changed.

## 1. Decisions and dependency fit

| ID | Selected design for review | Reason / not authorized by it |
| --- | --- | --- |
| TI-D1 | Nullable live Task FK plus immutable accepted Task UUID and deleted-link state | Allows physical Task content purge without a dangling FK or acceptance resurrection; no forever-retention permission |
| TI-D2 | Verified Edge user identity → dedicated narrow PostgreSQL gateway role → server-only operation functions | Preserves 14's server-only function boundary; no client-callable classroom RPC or service_role catch-all |
| TI-D3 | Bind actor/session/expiry afresh for each transaction; lock authoritative account/session state | An earlier JWT check alone does not handle revocation races or pooled identity reuse |
| TI-D4 | Private acceptance/delete writers share owner sync-head ordering before classroom locks | Aligns 40's class transaction proposal with 16's existing owner-head task deletion protocol |

Current Task source has only id/title/description/status/timestamps, best-effort
JSON persistence, no owner/version/tombstone/auth adapter. Do not cast it to the
proposed contract. Core owner/Task/sync/session-registry implementation and
migration remain prerequisites. SQL prototype's existing service_role grants and
auth.uid SELECT examples are not an implementation of TI-D2.

## 2. Minimal acceptance identity and deletion state

Refine 40's logical private_classroom_acceptances.task_id into these internal
fields; public AcceptanceView stays unchanged:

| Field | Proposed constraint / meaning |
| --- | --- |
| accepted_task_id | Non-null immutable UUID returned as wire taskId; private identity, not a FK to a purged row |
| live_task_id | Nullable UUID in composite FK (learner_subject_id, personal_workspace_id, live_task_id) to the same owner's Task key |
| task_link_state | present or deleted; only present → deleted in this subset |
| task_deleted_at | Null while present, server UTC timestamp while deleted |
| link_version | Positive monotonic internal version for deletion/migration/audit; no new client wire field |

Keep existing link ID, learner/workspace, class/assignment/accepted revision and
accepted_at; unique(learner_subject_id, assignment_id) remains durable independently
of short-lived command receipts. Constraints: present requires live_task_id =
accepted_task_id and task_deleted_at null; deleted requires live_task_id null and
task_deleted_at non-null. A missing Task behind a present link is integrity failure,
not an instruction to create one. No Task title, notes, schedule, file path or
copied assignment content is retained in the deleted-link identity.

Do not automatically use ON DELETE SET NULL: it cannot by itself establish the
matching lifecycle/timestamp. Use a restricting FK and an authorized delete/purge
operation that transitions the link before physical deletion. Under the same
transaction: account/session guards → owner sync head → Task/link, validate own
version, create the ordinary Task tombstone/change entries, cancel reminders and
remove live planning links per 16, mark related acceptance deleted, then commit.
If any write fails, roll back the entire atomic group. Physical purge later sees
no live acceptance FK; it must not delete the suppression identity as a cascade.
The private acceptance update is not a classroom event or educator notification.

No undo/reopen of deleted classroom acceptance is introduced here. Archiving or
completing a Task is not deletion and does not break a present link. A later
user-created manual task gets a new identity through the ordinary Task feature;
it does not reactivate the old classroom acceptance.

### Exact outcomes

| Event | Required state/result |
| --- | --- |
| First valid acceptance | Create one Task + present link + receipt atomically |
| Same command replay or new command for same assignment | Resolve unique existing link; no second Task |
| Own Task deletion commits | Acceptance becomes deleted; private work deletion does not silently withdraw an already shared progress copy |
| Accept replay after deletion, with otherwise valid authority | Return same taskId with taskState=deleted, never new Task |
| Current membership lost | CW-20 own pointer recovery remains, but CW-14 cannot fetch class content through replay |
| Receipt expired, suppression link exists | Command expiry follows 40; a fresh authorized accept still resolves deleted link rather than creating work |
| Physical Task purge | Delete permitted Task content only; deleted link still suppresses re-creation while retained |
| Present link points to absent Task unexpectedly | Fail safely as dependency/integrity fault; preserve evidence, no auto-repair by insertion |
| Lost server response / stale present response arrives | Reconcile current own Task/tombstone through versioned sync; never overwrite newer deletion |
| Account erased | Ordinary auth and recovery denied; no empty-account bootstrap from old classroom receipt |

Private Task deletion and progress withdrawal are separate actions. UI must explain
that previously shared progress remains subject to the existing sharing controls;
offer the separate explicit withdrawal action, never infer it from Task status.
Deleting Task content does not expose the private deletion to a teacher.

### Retention, offline and restore limits

Suppression identity is still personal data. Retention duration, legal treatment
and backup policy are NOT selected here. Purging it must first prove no future
fresh accept/replay can recreate work (e.g. permanently inadmissible source plus
expired retry paths under reviewed policy) or preserve an approved minimal deny
record. Receipt TTL alone is not that proof. If lawful retention and anti-replay
cannot both be satisfied, stop affected activation and obtain the policy decision;
do not keep records forever or silently reset uniqueness.

Account erasure may remove the link only through the reviewed freeze/erasure flow;
old credentials must remain unable to access/rebootstrap data. Restore follows
16's separately retained deletion/suppression journal and quarantine; never enable
logins while an older backup can resurrect a deleted account or acceptance.

Local pending deletion is not undone by a late acceptance response. Merge checks
owner/account-generation, Task version and local outbox intent. A stale pointer
has no Task snapshot to overwrite the store. Do not claim deletion is cloud-synced
before acknowledgement or offline-ready before local durable commit. Sign-out/
account switch quarantines pending work under its original owner, never transfers
it to the next account. Native tests are still required.

## 3. Server-only identity bridge

Selected path: mobile (or portal server) sends user bearer JWT to Edge application
API; Edge verifies with the supported Supabase user-auth path, then uses a dedicated
server-side PostgreSQL login via the selected Supabase transaction pool to call
one parameterized, operation-specific function. Function execution is server-only.
This preserves 14's recommendation; df_api is a function namespace, **not permission
to add it to client-exposed schemas**. REST/GraphQL/RPC client roles get no execution
or table access to the classroom functions/helpers.

No new custom token, JWT issuer, browser DB password or end-user direct SQL.
A publishable project key, merely decoded JWT, profile role, forwarded ownerId,
class ID or client-provided app-session selector is not authenticated identity.

### Verification and binding sequence

October 1 refinement: [EB-00](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md) adds one narrow
server-only preparation read before mutation key loading, then a separately
authorized final transaction. The gateway can call that exact signature as well
as operation entries, never raw tables. Mutation-only p_bridge and CW-05's internal
encrypted result refine steps 3/6; public DTOs remain unchanged. Every transaction
rebinds/rechecks identity; no preparation result conveys authorization or keeps
locks across key-service network work. The trust/lock rules below still apply.

1. Edge requires a user bearer token. Verify signature, configured issuer/audience,
   allowed signing algorithm, expiry and token type using a supported provider
   verifier; no fallback to secret/publishable/none auth modes on failure.
2. Build request-local VerifiedActor = {actorId, providerSessionId, tokenExpiresAt}
   from verified sub/session_id/exp claims. UUID/time validation still applies.
   No raw JWT, refresh token, email or claim blob is forwarded as SQL payload.
   Discard client identity fields through strict rejection, not a merge/spread.
3. Create separate bound SQL parameters for VerifiedActor, validated path selector
   and exact command/query. They are backend-internal arguments, **not additions**
   to public request schemas. Only the trusted gateway credential can call these
   entry functions. Never interpolate a role, function/table name or SQL fragment.
4. Inside the atomic function, validate actor/session mapping against the existing
   app-session registry and active account policy. ProviderSessionId identifies
   a verified Supabase session, not the app registry's arbitrary row ID. Require
   matching owner + provider session, active registry state and unfrozen account;
   missing mapping denies rather than enrolling itself from an ordinary request.
5. Acquire guards in the common order below; re-read current state and expiry after
   waiting. Use actual current time for expiry, not a stale transaction-start
   timestamp. Approved clock-skew/session-freshness configuration is required.
6. Install fresh transaction-local private actor/session context for RLS/helpers
   only after binding; entry functions never inherit a previous actor. Run explicit
   ownership/member/version predicates and the operation, commit, then return the
   strict authorized DTO. Failed auth or missing context yields no data/domain write.
7. Release only a completed/rolled-back connection. Timeout/disconnect with unknown
   outcome uses the original command's recovery, not another new intent. No user
   auth in global mutable client headers or persistent connection settings.

The DB does not independently verify the original JWT in this design: it trusts
the restricted Edge credential's validated identity assertion and checks current
registry/account/domain state. Compromise of that backend credential can impersonate
actors within its granted functions; transaction-local context is not cryptographic
proof. Least privilege, secret custody/rotation, monitoring and independent review
are therefore required. Do not market this design as end-to-end user-token RLS.

A custom PostgreSQL setting alone is not authorization: ordinary roles can often
set custom values. No public setter function, table grants or helper EXECUTE path
may turn such a value into access. Direct callers without the gateway role must
be denied even if they set a synthetic actor value. Existing auth.uid-based personal
policies need explicit reconciliation for these function roles, not silent reuse.

### Role and connection obligations

| Principal | Allowed | Forbidden |
| --- | --- | --- |
| Migration/table owner | Reviewed isolated migration/maintenance only | Runtime credential in Edge/client; routine owner-bypass execution |
| Proposed df_edge_gateway | LOGIN, minimal connection/schema usage and EXECUTE on reviewed entry functions only | Raw table reads/writes, role administration, DDL, superuser, BYPASSRLS, ownership or membership enabling SET ROLE to executor |
| Proposed per-capability function owner | NOLOGIN, only required table/column privileges and reviewed RLS; safe fixed search_path | Table ownership, BYPASSRLS, broad public helpers, dynamic SQL from request |
| anon/authenticated/PUBLIC | No classroom DB table/function privileges | Forging trusted actor context or bypassing Edge through Data API |
| Test oracle | Separate synthetic-only read-only observation | Application runtime use or authorization proof based on administrator reads |

Role names are design names, not created resources. Functions needing definer
rights use a constrained owner; others remain invoker as appropriate. Qualify
relations and restrict default/current EXECUTE privileges per creator. Core Task
insertion/deletion capability must not grant an educator function private Task
SELECT. Keep personal and classroom allowed capabilities explicit.

Use the actual project's pool endpoint/custom-role configuration and verified TLS;
no invented connection string or disabled certificate checks. Pin and test the
chosen Edge driver/verifier versions before a build. Transaction pooling cannot
rely on session-level state; disable unsupported prepared-statement/pipelining
behavior for the selected driver. No new ORM is required or selected.
These are implementation prerequisites, not instructions to install software now.

Provider sign-out and app-session revocation are distinct. An otherwise valid JWT
can outlive a refresh-session revocation; app registry checks close app access
after their authoritative commit. Provider-only changes require reviewed fresh
validation/reconciliation policy. Do not promise immediate global provider
revocation; an already authorized in-flight response cannot be recalled.

## 4. Common lock order and atomic consistency

Refine 40's order where private owner state is touched:
account/policy guards (sorted subject UUID) → app-session guards (sorted ID) →
owner sync heads (sorted owner UUID) → classes (sorted UUID) → membership/invite/
assignment → private Task/acceptance → submission/feedback/receipt as applicable.
Within each class of rows, lock stable sorted keys. Resolve candidate identities
without exposing them, then revalidate relationships after locks; retry safely if
the discovered lock set changed. Do not acquire an earlier-category lock later.

Every affected writer, including ordinary private Task deletion, acceptance,
session revocation and erasure jobs, must adopt the compatible order. Existing
prototype only says owner-head-first; that is first among **domain** locks, after
the new identity guards. Until all affected writers are reconciled/tested, do not
combine them in production. No network/provider call while DB locks are held.

Task deletion only needs its owner/private-link locks, not a class mutation.
Acceptance takes owner-head before class, so deletion and acceptance cannot race
past the same private identity. Revocation-first denies a later operation;
operation-first may commit, then revocation stops future access. Rollback never
leaves a tombstoned link with a newly recreated Task or a successful receipt
without its corresponding durable result. Retry preserves the exact command.

## 5. Focused integration scenarios — NOT_RUN

These supplement TX-01–24 and are not a second claim those cases ran. Use 41's
disposable-target admission, representative roles, positive fixtures and barriers.

| ID | Given / interleaving | Observable oracle | State |
| --- | --- | --- | --- |
| TI-T01 | Existing Task acceptance; delete then replay original and fresh accept | Same deleted taskId; zero Task recreation, one suppression link | NOT_RUN |
| TI-T02 | Failure after Task tombstone, reminder cancel or acceptance update | All domain writes/receipt roll back together | NOT_RUN |
| TI-T03 | Deleted link, physical Task purge, command receipt expiry | No dangling FK; fresh accept still cannot recreate Task | NOT_RUN |
| TI-T04 | Present link but Task missing via synthetic corruption | Integrity failure, no guessed repair or second Task | NOT_RUN |
| TI-T05 | Two devices accept while owner deletes linked work | Serialized outcome, no duplicate live Task; deletion remains authoritative | NOT_RUN |
| TI-T06 | Old present response arrives after newer local deletion/account switch | No resurrection or cross-account merge; original pending intent preserved | NOT_RUN |
| TI-T07 | Restore old synthetic backup after deletion | Quarantine and suppression applied before access; no restored sharing/work | NOT_RUN |
| TI-T08 | Erased account attempts receipt recovery with old JWT | Account/session denied; no bootstrap or private pointer | NOT_RUN |
| TI-T09 | Forged JWT, wrong issuer/audience/algorithm or injected body actor | Edge rejects before DB domain work; no identity fallback | NOT_RUN |
| TI-T10 | Verified user A but registry session belongs to B/missing/revoked | Function rejects, no new registry row or receipt mutation | NOT_RUN |
| TI-T11 | Pool handles A, then B, then missing actor; commit and rollback variants | B sees no A data; missing context denies; no inherited transaction identity | NOT_RUN |
| TI-T12 | Valid JWT waits for lock while app-session revocation commits | Recheck denies after lock; reverse order may commit once before revocation | NOT_RUN |
| TI-T13 | Token expires during lock wait; client sends fake later expiry | Trusted expiry enforced with fresh time; body value rejected | NOT_RUN |
| TI-T14 | anon/authenticated role sets actor GUC and calls entry/helper/Data API | No EXECUTE/table access despite forged setting; valid gateway positive works | NOT_RUN |
| TI-T15 | Ordinary Task delete and classroom accept take shared locks in both orders | No unsafe partial state; deadlock abort retries same intent with fresh auth | NOT_RUN |
| TI-T16 | Gateway attempts raw table SELECT/DML/DDL or SET ROLE escalation | Catalog grants and actual calls deny; required narrow function positive works | NOT_RUN |

Local checker validates document decisions/scenario inventory only. It cannot
verify JWTs, pool settings, RLS, transactions, revocation or retention. Existing
136 DTO fixtures still exercise unchanged public classroom schemas.

## 6. Handoff and source evidence

Chosen representation/path are now concrete design candidates, not accepted SQL.
Before runnable migration/RPC work: qualified review of this diff, exact shared
schema/role/verifier/driver signatures, secret custody and reviewed operational
configuration. Before execution: named authorized disposable target and tooling.
Retention/eligibility/spending remain owner-reserved; do not mark SQ gates passed
because a candidate was written. No app/DB/provider setting changed.

Continuation: [SF-00](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md) now specifies
the 22 entry signatures, capability boundary, migration order and isolated-runner
configuration/schedules. Shared helper/DDL review and real runtime evidence remain
outstanding; this does not change the NOT_RUN states above.

Relevant primary sources checked September 30:

- Supabase distinguishes user JWT verification from publishable/secret/public
  modes. The selected design requires the user path, not an admin fallback.
  [Edge authentication](https://supabase.com/docs/guides/functions/auth).
- Verified access tokens have a session_id; provider refresh-session lifecycle
  does not itself guarantee immediate rejection of all existing access tokens.
  [Auth sessions](https://supabase.com/docs/guides/auth/sessions).
- Edge can use PostgreSQL connections; Supabase documents transaction pooling
  for edge/serverless use and its driver limitations/custom-role addressing.
  [Edge database access](https://supabase.com/docs/guides/functions/connect-to-postgres),
  [connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).
- Transaction-local settings end with the transaction; session settings can persist.
  This supports choosing transaction-local context, not proof of our pool isolation.
  [PostgreSQL SET](https://www.postgresql.org/docs/current/sql-set.html).

The tombstone, trusted-argument and lock protocols are our design inferences,
not provider certification. Exact deployed versions, lawful retention, real
cryptographic verification and all TI/TX cases remain unverified.
