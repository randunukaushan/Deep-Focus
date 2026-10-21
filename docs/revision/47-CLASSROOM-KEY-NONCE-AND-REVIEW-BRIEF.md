# Classroom key/nonce recommendation and review brief — KN-00

2026-10-02. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

සිංහල: encryption key එක ආරක්ෂිතව තැබීම පමණක් ප්‍රමාණවත් නැහැ. ඒ key එක
සමඟ එකම nonce එකෙන් නැවත encrypt නොකිරීමත්, backup restore කළ පසු පරණ
counter එකෙන් වැඩ ආරම්භ නොකිරීමත් අවශ්‍යයි. පහත recommendation සහ reviewer
brief එක සකස් කර ඇත. Reviewer කෙනෙක් දැනට නැති බව owner තහවුරු කළ නිසා
independent review එක PENDING ලෙසම තබනවා; real tests කළ බවක් නොකියනවා.

This is a decision/review packet for [EB-00](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md),
not a production key policy or adoption of additional SQL grants. The owner's
October 2 reply asks for a review brief for a later reviewer. [44](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md)
retains command identity and AEAD semantics. **ADAPTER_HOLD remains.**

## 1. Recommended custody option and explicit alternatives

Recommended candidate **K1**: separate versioned 32-byte AES delivery keys and
at-least-32-byte command-HMAC keys, provisioned through the selected Supabase
Edge secret configuration; only nonsecret key IDs/status/revisions live in SQL.
Never reuse JWT/API/database credentials as cryptographic key material. Different
environments/projects and purposes use different raw keys, not merely new labels.
Retain reviewed read-old/write-new versions needed for lawful recovery.

Supabase documents server-side secret/environment delivery to Edge Functions.
That is a usable configuration mechanism, **not proof of HSM/non-extractable key
custody, per-function isolation or protection from a compromised Edge runtime**.
Our application key rings are distinct from Supabase's own platform API keys.
[Supabase environment variables](https://supabase.com/docs/guides/functions/secrets).

| Choice | Fit / trade-off | Disposition |
| --- | --- | --- |
| K1: Edge secret key ring | Fits 46's local crypto and selected provider; no key-service call under DB locks. Runtime and authorized project operators can access secret bytes; project/function blast radius needs review | Recommended for evaluation, not enabled or security-approved |
| K2: external managed KMS with envelope keys loaded before locks | Can improve custody/audit controls but adds provider/IAM/network/latency/cost and another trusted boundary; does not remove nonce responsibility | Alternative only if K1 fails requirements; requires explicit provider/spend approval |
| Keys in app, ordinary DB table, public env, source or logs | Exposes keys outside the intended trusted boundary | Rejected |

No key is created or read in this task. Provisioning requires a named custodian,
least-privilege project access, MFA, secure recovery custody, reviewed change
procedure and test/production separation. Never paste keys into chats/documents.
Do not assume a .gitignore entry protects a key already disclosed. Import runtime
AES keys non-extractable when supported, while acknowledging the environment's
original bytes still exist. Disable environment dumps and secret-bearing traces.

Key-reference manifest (nonsecret): environment/target identity, purpose, keyId,
algorithm/version, lifecycle state, activation policyRevision and reviewed
security-budget reference. A keyId cannot later refer to different raw material;
an existing raw key cannot be relabelled as “new” with a reset nonce counter.
Application startup validates the complete required manifest/key lengths before
serving affected operations. Missing/invalid/stale configuration fails closed.

## 2. Nonce candidate N1 — one durable allocation per encryption

Recommend a centralized, transactional counter **per AES key**. All writers for
that key use this allocator; no parallel random-nonce or worker-local counter path.
One logical key context has fixed prefix 00000000 (four zero bytes). The next eight
bytes are the allocated positive counter, big-endian. No arithmetic through JS
Number: transport a canonical decimal string, compute with BigInt/exact DB integer.

`nonce = 0x00000000 || uint64be(counter)` (12 bytes).

Representation bound: 1..9223372036854775807, chosen to fit signed PostgreSQL
bigint. This is **not** an approved number of AES invocations. The independently
reviewed, smaller-or-equal per-key invocation/age/data/verification-failure budgets
must be configured before activation; exhaustion pauses issuance rather than wraps.

NIST describes deterministic IV construction with fixed and invocation fields,
and requires avoiding reuse across restart. The 32/64 split and the global
allocation service below are our candidate design, not a NIST certification or
a claim that arbitrary distributed devices can safely share a local counter.
[NIST SP 800-38D §§8.2.1, 9](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf).

### Durable order and failure semantics

1. Complete 46's authorized preparation transaction. Fresh CW-05 only proceeds
   to allocation; replay uses the stored ciphertext and performs no new encryption.
2. In a separate short allocation transaction, recheck verified actor/session,
   current class issuance authority, policyRevision and active key. Atomically
   increment its lastAllocated value within the configured budget. Validate the
   result and **COMMIT before exposing the nonce for encryption**.
3. After successful commit, encrypt exactly once with that allocated nonce.
   Then run 46's final domain transaction, which may commit, fail or lose a race.
   A failed encryption/domain transaction never decrements/recycles the counter.
4. Unknown allocation commit outcome, lost allocation reply, crash or uncertain
   prior encryption => abandon that attempt and allocate another value. Never
   “recover” an old allocation to encrypt again; gaps are expected and harmless.
   A definitely rolled-back, never-released allocation may leave the counter
   unchanged. No encryption runs on a provisional returned-but-uncommitted value.
5. Domain retry preserves the original confirmed command ID. Nonce allocation is
   deliberately **not** idempotent by that ID: each new encryption attempt burns
   another value. Replaying the committed invitation performs decryption only.

Candidate auxiliary row: private_classroom_aead_counters {key_id unique,
last_allocated bigint, max_allocations bigint, state, policy_revision}. It has no
actor/learner content, key bytes, token or ciphertext. Domain delivery retains
unique(keyId, nonce) as defense-in-depth, not the allocation mechanism. The row
must survive delivery cleanup; deleting it cannot authorize counter recreation.
No batching/range leasing, automatic reseeding or counter decrement in this slice.

The allocator needs a separately owned narrow gateway-callable signature and
reviewed column grants; ordinary entry owners must not mutate its counter. This
would add one internal call beyond 46's current 23, **not** a public endpoint.
No allocator signature or grant is adopted in 43/46 by this options packet.
After review accepts N1, reconcile the exact input/result/signature and migration
inventory in one bounded draft; do not invent a raw gateway UPDATE to fill the gap.

Proposed lock order: existing account/policy → session → class/issuance guards →
key-counter row; never hold a key row then request an earlier guard. Administrative
rotation/policy writers must use compatible order. No crypto or external network
work under those locks. Allocation is auxiliary security state, not successful
invitation issuance or a billable/user reward event. Apply reviewed abuse/rate
limits before allocation to prevent an authorized caller exhausting key budgets.

## 3. Rotation, loss and restore runbook candidate

Separate lifecycle by purpose:

| State | AES delivery | Command HMAC |
| --- | --- | --- |
| staged | Validate custody/config only; no user encryption | No new receipt digest |
| active | Allocate/encrypt and decrypt current authorized deliveries | New receipts and active replay comparisons |
| read_only | Decrypt retained deliveries; never allocate or encrypt again | Recompute only existing receipt comparisons; never create a new-key receipt |
| disabled | No use; affected operation fails safely | No comparison or fallback; affected recovery fails safely |
| destroyed | No material remains; explicit approved irreversible action | Same; never reset a command's identity to compensate |

Routine rotation: stage genuinely fresh purpose-specific keys and needed secret
versions; validate availability without logging values; atomically advance active
key references/policy revision; move old AES to read_only and retain its counter.
In-flight preparations re-prepare or fail closed. Keep old HMAC versions while
active receipts depend on them. Do not rewrite immutable delivery AAD/key IDs or
receipt digests with a new key without a separately reviewed migration.

Removal is not “rotate every N days then delete”: the custodian must inventory
unexpired delivery/recovery needs, retained receipts, backups and legal retention.
No retention duration or destruction authorization is selected here. Disabled/
missing keys never produce a replacement token, fresh mutation or empty success.
Suspected compromise: stop affected issuance/recovery, fence access, preserve
redacted incident evidence and seek qualified incident review. Key rotation alone
does not undo a leaked invitation or revoke a membership it already admitted.

### Restore/failover — key safety is outside the restored counter

Database backups can roll counters back. **Never resume AES writes with an old
key after a rollback, restore, clone or loss of acknowledged allocator durability.**
Before making the target reachable: fence all old writers, keep classroom writes
disabled outside the restored database, verify target/restore lineage, and obtain
genuinely new AES key material through approved custody. Initialize its new counter
only for that new key. Old keys can be read_only for permitted ciphertext recovery.
Staging/clones must not receive production write keys or production user data.

Key write eligibility/restore authorization must be checked against an external
deployment/custody record not rolled back with application DB state. Changing
only keyId, restoring an old “active” flag or believing a counter is high enough
is not recovery proof. Drain/fence old runtimes before re-enabling the new target.
If acknowledged allocation durability across provider failover cannot be proved,
the target stays paused until rekey/reconciliation. A DB-local boolean alone
cannot detect an arbitrary silent rollback; this candidate requires operational
fencing and independent restore evidence, not an automatic guarantee.

Preserve 44's separate closed-command markers and 42's Task suppression/erasure
rules. New AES keys do **not** make restored old data/commands authorized. Release
from restore quarantine needs both nonce safety and privacy/identity reconciliation.

## 4. Review brief — ready to hand to an independent reviewer

Owner has no reviewer yet and asked to prepare this brief. Reviewer should be
independent of this author and competent in PostgreSQL least privilege/RLS,
Supabase/Edge identity, applied AEAD, concurrent transactions and recovery.
No reviewer has been contacted, paid or credited with approval.

Give the reviewer: 39–47, the exact public/bridge schemas, reference checkers and
the bounded diffs/hashes; canonical Security and 41's reconciliation table. Do not
send secrets, real students' records or an unrestricted production connection.

Require a written disposition on each item, not a generic “looks good”:

- K1 project/runtime/operator blast radius, key recovery custody and whether K2 is
  required; exact generation, permissions, audit and destruction procedures.
- N1 single-context uniqueness, committed-before-use rule, double delivery/retry,
  invocation/age/data limits, overflow and allocation-abuse protection.
- External restore fencing, provider failover durability and proof that old
  writers/old key material cannot allocate from a rolled-back counter.
- 46's trusted gateway MAC/actor assertions, prepare/final TOCTOU, exact grants,
  historical-key selection, stored-winner projection and no-network-under-locks.
- Closed-command retention versus legal obligations, erasure/private Task
  suppression, export inventory and what failure users see when keys are unavailable.

Reviewer record: reviewer identity/qualification, review date, exact artifact
hashes, questions answered, severity-tagged findings, required fixes, evidence
reviewed, residual risks and accept/reject/conditional disposition. Acceptance of
a design is not review of future SQL/code. Changed artifacts require re-review.
Legal facts need their own qualified advice; this brief is not legal certification.

## 5. Real integration admission — observed, not assumed

October 2 read-only inspection: no tests/integration/classroom/runner.ts and no
docs/revision/contracts/classroom-sql directory. psql/docker/supabase/deno were
not found on this shell PATH; no global installation claim. Root scripts still
have no test command. Task persistence is still the ownerless best-effort file
prototype. No review evidence, approved test target or actual adapter was supplied.
Thus **real integration is NOT_RUN / not currently admitted**, not “tests passed.”

After qualified design review, use [43's existing admission contract](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md):
approve the bounded implementation work, build missing shared identity/Task/SQL
foundations and adapter/allocator/runner, review those artifacts, then name and
authorize an isolated synthetic-only target with exact versions/fingerprints.
No production secrets in chat. A test target alone does not create the missing code.

Required additions to existing TX/TI runs (all NOT_RUN):

| Probe | Actual oracle needed |
| --- | --- |
| Two independent allocator connections | Distinct committed nonce values under deterministic barriers, never based on sleep timing |
| Fail before/after allocation commit; lose reply; crash before/after encrypt | No encryption before commit, no value reuse; harmless durable gaps |
| Rotate during preparation/allocation/final entry | No new old-key allocation; same domain command recovers once with stored winner |
| Restore a counter snapshot after acknowledged encryption | Old key writes denied despite restored active flag; new key admitted only after external fencing and privacy reconciliation |
| Exhaust cap/overflow, disable/miss key, forge context/direct table calls | No wrap, fallback key, unauthorized allocation or token disclosure |
| GCM tamper and exact provider runtime | Known external vectors plus altered tag/nonce/AAD/key all checked against actual Deno adapter; model booleans are insufficient |

## 6. Local evidence and unresolved decisions

[Local checker](check-classroom-key-policy.mjs) covers literal nonce encodings,
exact-integer limits and pure allocation/rotation/restore models only. It does not
create a key, implement encryption, run SQL or establish provider durability.
Actual results and limitations are in [KN-00 audit](09-COVERAGE-AND-AUDIT.md).

Owner/reviewer inputs still needed before activation: named custodian and reviewer,
accepted custody/nonce path and evaluated key budgets, lawful retention/destruction
policy, approved isolated target/tooling/implementation scope. No new paid account
or service is recommended for purchase by this document. Research checked October
2; the cited NIST document is the 2007 publication, not a claim of latest revision
status or compliance. No claim is made that the entire app is now secure/finished.
