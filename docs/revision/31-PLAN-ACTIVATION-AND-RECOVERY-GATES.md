# Saved-plan activation, pause and recovery gates — PL-05

2026-09-25. **DRAFT / HIGH / REVIEW_PENDING.** Document-only completion of the
five PL specification packets, not implementation, acceptance or release approval.

සිංහල: Feature එක publish කිරීමට පෙර කුමන සාක්ෂි තිබිය යුතුද, ප්‍රශ්නයක්
ආවොත් අලුත් writes නවත්වන්නේ කොහොමද, userගේ දත්ත නැති නොකර නැවත සේවාව
ආරම්භ කරන්නේ කොහොමද යන්න මෙහි තිබෙනවා. PL packets පහේම drafts තිබුණත්
app එක හෝ මුළු enterprise documentation එක සම්පූර්ණ බව එයින් කියන්නේ නැහැ.

## 1. Bounded task and authority

- Outcome: PL-05 activation/containment/recovery specification and fail-closed
  evidence inventory, preserving 25–30's domain, wire and ownership boundaries.
- Requirement/phase: DF-037; documentation continuation only. Existing approved
  stack/navigation/safety direction retained; no feature flag, account or target
  is provisioned. Production execution would require its own risk/authority review.
- Read: root/AI rules, execution/DoD/guardrails/map/task brief; 08 release gates,
  17 §9, 23 §§2–3, 24 §3, 25 §8, 26 receipt rules, 27 replication/privacy,
  29 §5/gates and 30 recovery/cards; implementation-plan entry and readiness sheet.
- Inspected: HEAD a6a481e, dirty docs and unchanged owner Home/theme hashes;
  package scripts and current Plan My Day route. Preview is transient; no test
  script, production rollout system or saved-plan implementation is established.
- Allowed files: new 31, contracts/plan-activation-evidence.json and
  check-plan-activation.mjs; revision README/07/08/09/18/25/30/check-docs;
  docs/DOCUMENTATION_MAP.md, ai/DEFINITION_OF_DONE.md, TESTING_STRATEGY.md,
  V1_IMPLEMENTATION_PLAN.md and CHANGELOG.md.
- PA-A01: operation-by-operation containment and compatibility; PA-A02: evidence
  gates and candidate identity; PA-A03: safe recovery and twelve future scenarios;
  PA-A04: checker/routing and honest remaining-scope handoff.
- Risk HIGH: lifecycle, privacy and release-control design. Independent qualified
  review pending before acceptance/integration; author checks are not that review.
- Non-goals: app/API/SQL/config changes, new public wire or provider, installs,
  migrations, automatic rollout/monitoring, agents, spending, commit/push/deploy.
- Verification: document/reference checks and own diff/whitespace review. Real
  release drills remain NOT_RUN. Rollback here means reverting only own document
  hunks. Stop affected execution for missing authority, data loss or privacy risk.

[Evidence inventory](contracts/plan-activation-evidence.json) is deliberately
unfilled; [checker](check-plan-activation.mjs) expects that baseline to remain
blocked and separately tests synthetic evidence rules. A checker PASS is not
activation authorization. No production command is embedded in this packet.

## 2. One admission unit, several independent version axes

The saved-plan admission unit includes exact confirmed initial creation, current
read/edit/archive/restore/delete, all reminder/task cascades, seven-entity v2
replication/snapshot and complete account export/deletion support. Never enable
only the attractive UI/create endpoint while erasure or recovery is unfinished.
Conditional AI families and a full web planner remain separately gated.

Track proposal contract version, Plan-Contract-Version header, replication version,
entity versions, local schema, server migration revision, client native runtime
and release candidate independently. Matching a protocol header is neither proof
of compatible storage nor access permission. No new capability endpoint/header is
added here; exact control/configuration distribution needs a reviewed adapter task.

Before a candidate can enter a real cohort, record its immutable source/build,
backend/migration, wire-schema, mobile runtime/local-schema, policy/config and
portal integration revisions; target environment; supported client versions and
intended account cohort. Evidence must bind that exact tuple. Changed relevant
code/config invalidates affected evidence; an old green report cannot approve a
new migration or a different production project. Cohort assignment is trusted
server configuration and consistent across an owner's devices, not a client flag.

Compatibility rules:

- Old v1 clients receive only the declared six-entity projection, but their writes
  run upgraded cascades and grouped-feed internals. Unsupported reset clients are
  denied sync, never served stale erased content. Do not roll back those writers.
- New clients require reviewed plan/v2 support; no stripping plan operations to
  pretend v1 compatibility. Old flat cursors cannot invent transaction groups.
- A compatible backend may precede the client with capability unexposed. All
  writers, workers, serializers and policies must be upgraded before any plan
  content is accepted; mixed old writer instances are not an admissible rollout.
- UI/backend disagreement blocks new plan operations and preserves local drafts.
  Core manual tasks/focus remain independent of AI; this does not waive their own
  authorization or data-integrity controls during an unrelated serious incident.

## 3. Proposed operating modes, not deployed flags

These are internal runbook labels, not new API DTO values. Control changes require
authenticated operator authority, a candidate/config revision and redacted audit
evidence. Client cached availability never authorizes server work. Missing or
unreadable configuration denies new affected work; it must not erase stored data.

| Mode | New generation/plan writes | Safe existing-data access | Privacy and recovery duties |
| --- | --- | --- | --- |
| UNADMITTED | Denied; no new provider dispatch/reservation | No claim that feature exists; retain any approved migration/recovery path | Foundations and deletion protections cannot be bypassed |
| ENABLED | Only eligible actor/cohort, exact versions/consent/confirmed actions | Normal authorized reads and replication | Full cascades, export, deletion and reconciliation |
| WRITE_PAUSED | Deny new plan generation/apply/edit/archive/restore; retain pending local intent | Safe reads, status/minimal receipt recovery and replication remain if verified | Safe plan/task/account deletion and all cascades remain supported; no new auto-apply |
| SAFETY_HOLD | Deny affected operations including unsafe reads/jobs/artifact delivery | Only demonstrably safe minimal status/support paths | Freeze affected scope; controlled erasure/recovery continues under reviewed incident process |

Deletion is not an ordinary feature upsell or optional write: WRITE_PAUSED cannot
make users' data inaccessible indefinitely without a privacy request path. If the
deletion path itself is unsafe, escalate to SAFETY_HOLD for affected scope, block
access and track an authorized privacy job/support process; never fake completion.
No binary mode switch disables ownership, receipts, tombstones, epoch invalidation,
artifact suppression or backup deletion-journal reconciliation.

Every entry path enforces the same boundary: direct PM/PG routes, EX-32 apply,
v2 push items, legacy task/reminder writes, worker publication and export/snapshot
materialization. Gate entire confirmed apply when plan support is paused; do not
silently apply only its reminder subset. Previously completed same-key commands
may replay minimal receipts after current authorization/privacy checks; receipt
lookup must not be mistaken for a new mutation. Unsafe content reads still deny.
Use existing typed unavailable/errors under 26/27, not successful empty data or
new undocumented codes. Per-item batch outcomes remain ordered and truthful.

Control changes and accepted writes need an explicit serialization/fencing rule:
record a monotonic internal control revision, recheck at trusted acceptance and
commit/publication boundaries, and drain/fence old workers before declaring a pause
effective. Transactions committed before the pause boundary remain committed.
No claim a flag can recall an in-flight response or bytes already downloaded.
The exact distributed control adapter/locking protocol is an implementation gate.

Pending generation follows 23's existing lifecycle and reservation ledger. Stop
new external dispatch when paused; do not leave reserved allowance indefinitely.
The reviewed runner resolves each pending request through its existing deadline/
cancellation/failure rules, releases holds on terminal failure/cancel and rejects
late publication using worker/control fences. Never re-debit on retry, silently
regenerate, invent a new public status, or refund successful past requests merely
because writes are paused. Any service compensation requires separate policy.

Offline clients cannot instantly learn the new mode. On contact, retain exact
outbox identities and show pending/unavailable per 30; do not mark a rejected
upload synced. Local schema rollback, queue clearing or uninstall is not recovery.
Mode changes must not interrupt a safe ongoing ordinary focus session or insert
an ad, modal upsell or compulsory AI connection into it.

## 4. Required evidence gates — all OPEN

The JSON inventory owns gate IDs, source links and unfilled status. This table
states the required proof; no gate can be waived by a document checker count.

| Gate | Evidence before promotion |
| --- | --- |
| PA-G01 | Exact candidate/target/cohort, approved scope and policy/config values; authenticated control adapter and pause linearization defined |
| PA-G02 | Accepted PL-01/02 contracts and actual isolated PL-03 DB/RPC/role/cascade/concurrency/migration tests; all writer paths inventoried |
| PA-G03 | PL-04 real Android/iOS migration, lost-response, account switch, accessibility, native-alert and offline recovery evidence |
| PA-G04 | Tested v1/v2 compatibility and cutover, JCS integrity, task/plan/account erasure, stale worker/snapshot/export suppression and retained-family export coverage |
| PA-G05 | AI provider/consent/usage/timeout policy and actual sandbox evidence; pause/replay cannot create double charges or indefinite reservations |
| PA-G06 | Safe pause/forward-fix and isolated restore drill; deletion journal, retained receipts, local-only data boundary, measured recovery versus approved objectives |
| PA-G07 | Supported observability/incident owner, evaluated severity/thresholds and response plan; required public Website/Portal and applicable global release gates |
| PA-G08 | Independent qualified review of named candidate/evidence, resolved findings and explicit owner authority for exact target/cohort action |

Applicable DB-G/MP-G and 08 global gates must be closed with their actual evidence,
not just represented by a PASS string here. No numeric TTL/rollout percentage/
retry budget/performance SLA/age or pricing default is chosen by this packet.
Production evidence references belong in controlled records, with no tokens or
personal payloads. The shipped checker cannot authenticate those references.

## 5. Staged admission and recovery procedure

1. Inventory and freeze a named candidate. Resolve missing gates before affected
   execution. Review the plan and exact disposable environment before any drill.
2. In isolated staging, expand compatible schema with admission off; test all
   writers, roles and migration interruption. Rehearse pre-cutover cursor reset.
3. Run the complete saved-plan flow: exact proposal → confirm → current read →
   edit → offline conflict → archive/restore → task/plan deletion → sanitized
   export/snapshot. Include older supported clients and both mobile platforms.
4. Rehearse WRITE_PAUSED and SAFETY_HOLD, late worker/receipt races and approved
   forward repair. Verify no lost acknowledged work, duplicated effects or erased
   content resurrection. Record actual recovery time and data gap, not estimates.
5. Independent review and owner decision bind candidate/environment/cohort and
   allowed operator actions. Staging permission is not production permission.
6. Only a separately authorized release task may deploy/promote. Verify candidate
   identity and gate freshness immediately before action; abort on mismatch.
   Observe the approved cohort/window; no invented 1%/24-hour threshold here.
7. Expand only with measured evidence and authority for that stage. After an
   incident, no automatic re-enable on a timer: new cause/fix evidence, review and
   exact resume authorization are required. This document creates no automation.

Rollback decision boundaries:

| Situation | Safe direction / prohibited shortcut |
| --- | --- |
| Before new-version writes | Restore compatible application/config only if rehearsal proves schema/read compatibility; no assumption that down-migration is safe |
| After new-version writes | Pause affected writes, retain expanded schema/cascades/receipts and prefer tested forward repair; never overwrite real work with an old backup |
| Corrupt or exposed content path | SAFETY_HOLD affected access/jobs; preserve redacted evidence and support privacy obligations; do not keep serving unsafe cached results |
| Mobile binary/native mismatch | Gate unsupported operations, preserve local data and deliver an approved compatible build; a JS update cannot install a missing native module |
| Isolated backup restore | Quarantine traffic, reapply deletion/revocation suppression, reconcile epochs/artifacts/receipts and validate before reopening; database restore is not whole-system restore |

Plan rollback does not roll back billing ledgers, turn cancelled sessions into
completed ones, remove ads/consent obligations, or silently enable cloud resource
storage. Local-only files and unsynced drafts are not in server backups. Actual
resource bytes and external services need separate inventory/recovery if admitted.

## 6. Detection, user communication and bounded cards

Observe aggregate command failure/latency, conflict/reset/unknown-outcome counts,
receipt duplication anomalies, stalled reservations/jobs, snapshot integrity and
notification-reconciliation failures. No task text, generated explanation, tokens,
raw local URI or full request body in telemetry. Record sampling/retention/access
policy before collecting production telemetry. A quiet dashboard is not proof of
health if instrumentation is broken; test alerts with synthetic injected faults.

Known cross-owner exposure, acknowledged data loss, duplicate trusted grants or
erasure failure stops promotion and triggers the approved incident response.
Thresholds for performance/noncritical errors remain reviewed configuration. User
copy distinguishes “saved on this device”, “waiting to sync” and “temporarily
unavailable”; never claims cloud safety for an unsaved draft. Support messages
describe affected functions and safe next action without promising an unverified ETA.

| Card | Outcome and prerequisite | Cases owned |
| --- | --- | --- |
| PA-01 | Candidate/policy/control inventory after reviewed PL-01–04 prerequisites | PA-T01–03 |
| PA-02 | Isolated compatibility/containment/privacy rehearsal after PA-01 | PA-T04–08 |
| PA-03 | Recovery/observability/independent evidence review after PA-02 | PA-T09–12 |
| PA-04 | Separately authorized promotion/resume and post-action evidence after PA-03 | Reviews all prior cases; no permission granted here |

All cards DRAFT. Later tasks name exact source paths and installed commands after
inspection. PA-04 cannot promote from this document or synthetic fixture alone.

## 7. Acceptance scenarios — all NOT_RUN

| Case | Given / when / required observation |
| --- | --- |
| PA-T01 | Missing policy/control or a failed gate / activation requested / denied before new reservation, dispatch or write |
| PA-T02 | Evidence from another build/environment / promotion requested / candidate mismatch rejects; no pasted PASS bypass |
| PA-T03 | Client forges eligibility or stale control revision / any direct/batch/apply entry / trusted gate denies; ordinary safe core remains usable |
| PA-T04 | Old/new clients and pre-cutover cursor / rolling deployment / true group boundaries, safe reset and correct six/seven-entity projection; no obsolete writer survives |
| PA-T05 | WRITE_PAUSED races exact apply and manual edit / commit barriers / either one prior committed effect or no new effect; no partial reminders or lost receipt |
| PA-T06 | Accepted AI job then pause/revoke/delete / late provider callback / correct terminal/reservation accounting and no stale result publication |
| PA-T07 | Pause with archived plans and task-only context dependencies / deletion/export/snapshot / cascades and privacy suppression persist; unsafe path uses hold, not fake success |
| PA-T08 | Offline B retains draft while A deletes during pause / reconnect / quarantine erased copies, retain safe work and original pending identities; no automatic resurrection |
| PA-T09 | New-version writes followed by rollback request / recovery rehearsal / data/receipt/epoch preserved, unsupported downgrade blocked; measured safe-forward result |
| PA-T10 | Pre-deletion backup and separate artifacts / isolated restore / suppression before traffic, stale tokens/artifacts denied, uncovered systems identified |
| PA-T11 | Fault injection and absent/broken telemetry / observe/respond / real alert receipt and accountable incident action, redacted logs, accessible truthful user status |
| PA-T12 | Repaired candidate after hold / resume requested / affected cases rerun and independently reviewed; exact owner authorization before promotion |

PL-01–05 now have draft specification coverage. This does not complete every
enterprise subfeature or freeze the January scope. Next documentation work is a
consolidated release-feature/decision matrix using the existing 80-family register:
separate mandatory, proposed and later features, required owner decisions and
foundation-ready tasks. Do not silently choose scope or start production code.

## 8. Research boundary

Checked 2026-09-25. Expo ties updates to compatible native runtime versions;
its rollback mechanisms concern application updates, not undoing domain data.
Our migration/forward-repair gate is an application design inference, not an SDK
guarantee. EAS Update is not installed or selected by this document.
[Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/),
[Expo rollbacks](https://docs.expo.dev/eas-update/rollbacks/).

Supabase database backups exclude Storage API object bytes. Therefore a selected
database provider alone cannot establish complete artifact/resource restoration;
actual backup coverage and authorized restore tests remain required. No paid
backup tier or recovery objective is selected here.
[Supabase backups](https://supabase.com/docs/guides/platform/backups).
