# Isolated plan database/RPC and migration test packet — PL-03

2026-09-20. **DRAFT / HIGH / REVIEW_PENDING.** This is an implementation/test
specification, not executable SQL, a database connection or deployment authority.

සිංහල: Luna එක වරකට කුඩා කොටසක් හදලා, ඒ කොටසේ tests පෙන්වලා පසුව ඉදිරියට
යා යුතුයි. දැනට තිබෙන SQL prototype එක සම්පූර්ණ backend එකක් ලෙස ගන්නේ නැහැ.
මෙහි සැබෑ database tests සියල්ල තවම NOT_RUN; checker එක බලන්නේ සැලැස්මේ
අනුපිළිවෙළ සහ coverage එක මිස database එක නිවැරදිව වැඩ කරනවාද යන්න නොවේ.

## 1. Task brief and authority

- Outcome: dependency-safe PL-03 packet defining relational responsibilities,
  trusted command boundaries, isolation fixtures, migration/recovery and evidence.
- Phase: document-only continuation after 25–28; existing Supabase PostgreSQL/Auth/
  Edge selection does not approve SQL, role grants, retention or production use.
- Read: root/AI rules, execution/DoD/guardrails/map/task brief; 25 §§4–7,
  26 §§4–5, 27 §§4–6, 28 §§5–7; DATABASE_SCHEMA Proposal Storage and SECURITY §23;
  complete personal-core.sql prototype, package scripts/current Plan My Day route.
- Inspected: dirty docs and owner Home/theme edits; no executable migration/test
  harness discovered by task file search. Package scripts have no test command.
- Allowed files: new 29, contracts/plan-database-test-packet.json and
  check-plan-database-packet.mjs; revision README/07/09/18/25/28/check-docs;
  documentation map/DoD and DATABASE_SCHEMA/SECURITY/TESTING_STRATEGY/CHANGELOG.
- Non-goals: editing/running SQL, app/backend code, installs, accounts, credentials,
  providers, uploads, agents, spending, commit/push/deploy or automatic model switch.
- Risk HIGH: ownership, atomic writes, migrations and privacy. Independent qualified
  review required before acceptance/integration; author checks are not independent.
- DB-A01 foundations/gates/order explicit; DB-A02 storage/command responsibilities;
  DB-A03 adversarial migration/race tests; DB-A04 traceable structural checks.
- Rollback: own documentation hunks only. Stop affected implementation on conflicts,
  unknown target/roles, data exposure, unsafe migration or unexplained regressions.

[Machine-readable packet](contracts/plan-database-test-packet.json) owns the ordered
cards, gate dependencies and detailed Given/When/Then cases. [Checker](check-plan-database-packet.mjs)
checks that inventory only. No new public operation or wire change: 60 operations
across seven partial OpenAPI files remain the checkpoint.

## 2. Foundation inventory — do not start with plan DDL

`contracts/personal-core.sql` defines nine prototype tables, not the full 16/22–28
backend. It has no plan/reminder/settings/break/job schema or complete business
RPCs. Its feed uses storage names such as focus_session and a narrower entity
allowlist; its payload column is not the v2 null-tombstone/group protocol. Its
service_role grants intentionally bypass RLS and do not prove gateway ownership.
Do not blindly append plan to an enum and declare compatibility solved.

DB-01 must inventory actual relations, columns, constraints, policies, grants,
functions, exposed schemas, callers, supported PostgreSQL version and migration
history. Map each current storage field to the relevant wire serializer. Record
missing prerequisites with owning cards in 14/16/22/23; implement/review those
foundations separately before plan writes. New SQL paths and test commands are
chosen in that later authorized harness task, not fictional runnable commands here.

Before any isolated execution: exact disposable target approved and verified;
synthetic identities only; no production credentials/backups; version-pinned test
environment with actual role behavior and auth claims; allowed migration files;
reviewed restore/safe-forward procedure. A database name containing “test” or the
prototype's session flag alone is not target verification. No automatic db reset.
Do not inspect secret environment values in logs; record redacted target identity.

## 3. Relational responsibilities (proposed, not DDL)

All IDs are UUIDs. Versions use existing positive bounded integer rules; sequences/
epochs use checked signed bigint with decimal-string wire serialization. UTC
timestamps and IANA zone are separate. No raw prompts, local URIs or resource bytes.

| Logical relation / extension | Required identity, constraints and purpose |
| --- | --- |
| plan_headers | owner, workspace, plan ID; active/archived state, version, local date/zone/window, nullable explanation, immutable source proposal reference and createdAt, updatedAt; composite owned workspace reference |
| plan_blocks | owner/workspace/plan/block ID, position, kind, start/end; focus has owned task and optional reminder, break has preceding focus block; composite owned plan/task/reminder references, unique position and block identity |
| plan_block_identities | Content-free owner/plan/block identity and kind, retaining non-reuse evidence after block removal under reviewed lifetime; blocks cannot migrate between plans or change kind |
| plan_context_dependencies | owner/plan/captured task ID; includes context tasks absent from blocks; private deletion lookup, no plaintext task snapshot; do not cascade-drop this evidence before sanitizing copies |
| plan_tombstones | Minimal owner/plan identity, final version and deletion metadata; no schedule/title/explanation; no simultaneous live header and tombstone |
| owner sync head | Existing monotonic sequence plus privacyEpoch; owner-head is the mutation serialization point, not a global lock for all users |
| transaction groups + feed | Stable owner/group ID, first/last sequence boundaries, epoch, public count, digest commitment; all writers and companion changes share one commit; private filtered changes are not public payloads |
| command receipts | Existing actor/command/key uniqueness, normalized intent hash, minimal typed result and original commit watermark; no historic schedule in replay |
| job/artifact metadata | Owned job, epoch, snapshot H, worker fence/state and private result reference; no public object locator; reviewed cleanup/suppression joins |

Do not duplicate independently owned tasks/reminders in plan rows. An optional
reminder can bind only one focus block across active/archived plans; validate its
task/zone/time compatibility through the common domain writer. Break fields must
exclude task/reminder and reference the immediately preceding focus in the same
plan. Gaps remain unallocated; no overlapping, reversed, zero-duration or
out-of-window intervals. At least one focus block, at most 100 total blocks.
Archived plans have no bound reminders under 26. New/remove/reorder operations
must check the final whole schedule, not incorrectly reject temporary positions
during an atomic replacement. Cross-row invariants need trusted transaction checks
and/or reviewed constraint triggers; row-local CHECKs alone are not a solution.

Indexes must support owned plan list order/state, task→block/context lookup,
reminder→binding lookup, group/feed scan and artifact epoch invalidation. Test query
plans with synthetic cardinalities before choosing fan-out limits. Foreign-key or
unique-constraint errors must not reveal another owner's IDs/content.

## 4. Trusted command/RPC boundary

These are logical signatures for the later adapter, not exposed SQL endpoints:

| Internal operation | Input / result contract |
| --- | --- |
| execute_plan_command | validated trusted context + command/target/key + 26 PlanEditInput or PlanActionInput → 26 MutationReceipt |
| apply_confirmed_plan | invoked only inside 22/24 exact-confirmation transaction, optional reminder creates + one plan.create → existing apply receipt; no standalone manual plan-create RPC |
| cascade_task_erasure / detach_reminder | invoked by existing direct and legacy/v2 sync writers inside their parent transaction; return affected rows to that transaction, not independent commits |
| read_owned_plan / list_owned_plans | current consistent 26/27 read DTOs; no private provenance or arbitrary owner selector |
| materialize_owned_snapshot / export | 27/28 snapshot serializers and fenced job; no external network call inside DB transaction |

Trusted context means actor/session identity established by the reviewed gateway,
not a user-supplied ownerId, arbitrary SQL GUC or JWT-shaped string. The eventual
adapter must specify how that context is authenticated and cannot be forged by
public RPC callers. If actor/session proof is absent, deny execution. Do not
assume auth.uid() will identify a user on an unrelated service connection.

Public/anon/authenticated roles get no direct mutation on private relations and no
EXECUTE on internal helpers. Use minimum grants on the trusted entry path. Decide
invoker versus any narrowly justified definer function in DB-02, reviewing owner,
schema qualification, safe search_path, grants on each signature/overload and
default privileges. Never broadly expose private schema/functions just to make
an SDK call work. BYPASSRLS/table-owner/service-role behavior must be tested explicitly;
FORCE RLS is not protection from a superuser or BYPASSRLS role. The prototype's
privileged role is not proof of a least-privilege production design.

### Atomic write order

1. Authenticate request/active app session, validate protocol and full JSON shape.
2. Lock owner's sync head; recheck account/session state under the reviewed
   serialization discipline. Freeze/revoke writers must share a compatible order.
3. Read actor+command+key receipt. Same normalized intent replays original minimal
   result; altered intent conflicts. Do not check changed entity versions before replay.
4. Pin exact plan/task/reminder versions and ownership. Lock subordinate rows in a
   deterministic documented relation/UUID order shared by every writer; validate
   entire schedule/reminder action coverage and current state, including no-op rules.
5. Apply all domain changes; increment each changed plan once; preserve unchanged
   reminders; perform erasure cascades/epoch increment where required by 25.
6. Allocate owner sequences and one durable transaction-group boundary/count/digest
   for public changes. Emit complete companion rows, not a page-dependent subset.
7. Store minimal receipt and any parent apply-consumed marker atomically; commit.
   Only then return success. No native scheduling, HTTP/AI/provider call inside.

Direct API, sync and AI apply must reuse the same internals, not recursively call
each other's HTTP routes or create nested independently committed reminders.
Each v2 batch item is its own transaction; epoch changes stop later items per 27.
Deadlock/serialization errors roll back the whole attempt; bounded retries retain
the original logical intent/key and recheck current authority. Lost commit response
uses receipt recovery; do not assume failure and replay with a new key. Retry budget
and timeouts need reviewed configuration, not an infinite loop or arbitrary numbers.

Read transactions capture plan+reminders consistently. Ordinary domain writers
serialize with owner head; snapshot/export readers materialize one consistent
view plus H, then separately revalidate current epoch before publication. Do not
hold owner locks across downloads. Races after authorization cannot recall delivered
bytes; tests must identify the linearization point, not promise global instantaneous
erasure. Lifecycle retention rules remain those of 25–28.

## 5. Migration and compatibility rehearsal

| Stage | Required stop/go evidence |
| --- | --- |
| Inventory | Actual baseline/checksums/roles/callers and foundation gaps known; no unknown live target |
| Expand | Add private structures/constraints with capability off; bound locks and validate existing rows; do not drop user data or expose tables |
| Writers | All direct/legacy/v2/AI/cascade paths emit compatible groups and use common actor/lock/receipt rules; old writer instances cannot remain active |
| Existing feed boundary | Old flat rows lack true group identity: do not invent transactions from adjacent sequence values. Establish reviewed cutover H and force safe snapshot reset for pre-cutover cursors; retain safe receipts under policy |
| Backfill | In isolated fixtures, resumable checkpoints and source counts prove preservation. Unknown provenance or malformed schedules block migration; never fabricate context IDs or silently drop rows |
| Read/compatibility | Old clients see only v1 entities with upgraded cascades; unsupported reset capability is denied. New clients bootstrap consistent v2; no half-enabled feature flag |
| Recovery | Failure before commit leaves baseline; post-commit recovery disables capability/uses reviewed safe-forward repair. Never automatically down-migrate after new-version writes or restore erased content |
| Admission | Actual tests, independent review, owner policy decisions and rollback/suppression evidence before integration; production release remains separate |

There are currently no persisted plans proved by this source inspection; a future
test plan must cover both clean baseline and populated synthetic predecessor data.
Do not treat the transient local Plan My Day preview as data already imported into
cloud plans. Personal-core.sql is not safe to run repeatedly against an existing DB.
Account deletion/restore suppression must survive chosen recovery boundaries;
ordinary task deletion is not authorization to erase separate retained session history.

## 6. Fixtures, fault injection and acceptance evidence

Use two synthetic owners A/B with separate personal workspaces and a third frozen
account; multiple active/revoked sessions; active/archived/deleted plans; standalone
and exclusively bound reminders; task-only-context dependencies; >Number-precision
sequence values; and empty/near-limit schedules. No copied production dataset.
Exercise actual anon/authenticated/trusted-role connections and the gateway, not
only a superuser transaction with pretend claims. Permission denial and successful
owned paths are both required, so “everything fails” cannot pass an isolation test.

Concurrency harness uses at least two independent database connections and
deterministic barriers around lock acquisition/commit; sleeps alone do not prove
an ordering. Capture before/after row counts, versions, group/receipt cardinality,
epoch and redacted SQLSTATE. Do not log private payloads or credentials. Verify
outcomes via an independent read transaction, not only the RPC's returned success.

Fault points: after header update, reminder changes, feed append, group commitment,
receipt insertion, before commit, after commit before response, worker lease loss
and publication after erasure. Harness hooks belong to an isolated test build and
must not be callable by production clients. Confirm fault injection actually ran.
Each test report names target/version, migration checksum, actor roles, exact
commands, fixture/fault schedule, expected/actual state and artifact path. Missing
infrastructure is NOT_RUN, never a simulated PASS.

Detailed scenarios live once in the JSON packet; this table maps their coverage:

| IDs | Required evidence area |
| --- | --- |
| DB-T01–04 | Target guard, owned success, cross-owner denial, privileged RPC/grant boundary |
| DB-T05–08 | Whole-schedule/binding constraints, non-reused IDs, full rollback and receipt replay |
| DB-T09–12 | Changed intent, concurrent edits, owner isolation and task-erasure race |
| DB-T13–16 | Context-only erasure, archive/restore, reminder cascade and atomic confirmed apply |
| DB-T17–20 | Whole groups/bigint, mid-batch epoch, coherent snapshots and stale worker/export denial |
| DB-T21–24 | Migration interruption, legacy cutover, overflow/fan-out and recovery suppression |

## 7. Small-context execution cards and open gates

Execute the seven JSON cards in dependency order; all are **DRAFT**, runtime
tests **NOT_RUN**, independent review **PENDING**. They separate baseline/harness,
role/actor design, relational migrations, common commands, cascades, replication/
exports and evidence review. Do not hand Luna the whole enterprise bundle as one
implementation prompt. Each card must name its actual allowed files and runnable
commands when its prerequisite harness exists; writing this packet creates neither.

DB-02 is a design/review deliverable: its end-to-end permission cases run with
DB-04 after tables and handlers exist. DB-03 owns migration rehearsal; full schedule/
non-reuse command cases likewise wait for DB-04. DB-07 reviews all prior results,
not an empty test suite. DB-G07 includes pre-execution contract/migration review
for DB-03 onward and final review of the resulting implementation/evidence; one
review of an earlier draft is not perpetual approval of later changes.

Remaining gate owners:

| Gate | Required fact/review before affected execution |
| --- | --- |
| DB-G01 | Owner authorizes exact disposable environment; target verification and cleanup/recovery boundary recorded |
| DB-G02 | Engineering inventory proves foundational tables/writers/harness/version compatibility, or separate prerequisite cards completed |
| DB-G03 | Security review resolves trusted actor/session adapter, privileges, lock order, definer/invoker and role tests |
| DB-G04 | Owner + privacy/engineering review resolves lifecycle details, receipt/block-ID retention, replay expiry, deletion/suppression policy |
| DB-G05 | Engineering + owner operational limits: fan-out, lock/retry/job/byte limits; synthetic test values must be labelled non-production |
| DB-G06 | Worker/storage/Auth/export adapters and coverage dispositions from 28, reviewed JCS implementation and vectors |
| DB-G07 | Independent qualified review of named contract/migration/test revision; self-review cannot satisfy it |

No owner price/credential request is needed for this draft. Do not repeatedly ask
for already approved providers. Gate facts are needed only for affected execution;
read-only inventory and continued documentation can proceed. Numeric production
policies must not be silently chosen from convenient fixture values.

Continuation [30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md) supplies the PL-04
mobile saved-plan repository/outbox/editor recovery draft, still without
implementing or bypassing PL-03. If implementation is requested first, start with DB-01 inventory/harness
admission, not plan feature code or production migration.

## 8. Primary-source research and limits

Checked 2026-09-20: [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
documents privileged bypass and integrity-check caveats;
[function security](https://www.postgresql.org/docs/current/sql-createfunction.html)
documents security context/search-path/EXECUTE concerns;
[locking](https://www.postgresql.org/docs/current/explicit-locking.html) describes
deadlocks and consistent lock acquisition. [Supabase functions](https://supabase.com/docs/guides/database/functions)
documents invoker/definer and execution privilege controls. These support the
test boundaries above, not proof our unimplemented RPCs are secure. Pin/recheck
the actual selected database version before writing executable migrations.
