# AI generation, recovery, cancellation and manual revision

2026-09-19. **DRAFT / HIGH risk / REVIEW_PENDING.** This is a lifecycle/design
slice for DF-037–039 and L-13, not implementation, provider approval or a completed
Plan My Day specification. [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) remains
the review/apply wire contract. The four existing OpenAPI slices still contain
47 operations; the proposed routes below are **not yet additional OpenAPI coverage**.

That sentence describes this lifecycle checkpoint. The subsequent
[24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md) now types five selected routes
and the ordered-plan model: 52 total operations across five slices. Its v2 manual
revision explicitly refines plan/reminder dependency recalculation; v1 rules below
remain unchanged. Conditional generation results and integration/policy gates remain.

සිංහල සාරාංශය: connection එක නැති වීම, request එක cancel වීම සහ AI result එක
සාර්ථක වීම වෙනස් තත්ත්ව තුනක්. කලින් වැඩේ සොයාගන්නා recovery එක අලුත් generation
එකක් නොවේ. සාමාන්‍ය proposal edit එකට හෝ apply එකට තවත් AI action එකක් නොගෙවයි.
මේ නීති නිශ්චිත කිරීමෙන් තවම app එකේ AI backend එක සෑදී ඇතැයි අදහස් නොවේ.

## 1. Bounded task brief

- Authority: continued solo documentation work; approved limited free/optional
  paid AI, core independent of AI. Required Plan My Day and conditional breakdown/
  review admission remain unchanged. Canonical phase order is not bypassed.
- Inspect: `src/app/plan-my-day.tsx` currently selects local tasks and displays
  fixed 25/5 minute blocks. It does not call a provider, reserve allowance, store
  a server proposal, recover requests or apply a transactional change set.
- Read: root/AI rules, execution/DoD/guardrails/task brief; V1 scope §§11–13;
  implementation-plan introduction/Phase 7; API_SPEC §28; SECURITY §23;
  DATA_MODEL §19; DATABASE_SCHEMA §25; TESTING_STRATEGY §13; revision 16 §§7–8,
  18, 22 and current package scripts/checker patterns. These are targeted reads,
  not a claim of rereading every large canonical document.
- Allowed changes: this new contract, `contracts/ai-generation-lifecycle.json`,
  `check-ai-generation-lifecycle.mjs`, doc-checker registration; affected canonical
  AI/API/data/security/testing/changelog and revision/map/playbook/readiness/audit
  links. No app, package, provider configuration, SQL execution or deployment.
- Risk HIGH: normative allowance, cancellation and persisted integrity rules.
  Solo draft authoring/self-review only; independent qualified review is required
  before acceptance/integration. No reviewer agent is authorized or created.
- Acceptance AG-A01: finite lifecycle with explicit reservation/debit and terminal
  races; AG-A02: recovery cannot silently regenerate; AG-A03: manual revision preserves
  exact-confirmation and consumes no action; AG-A04: executable reference fixtures,
  reconciled pointers and honest wire/runtime/policy limitations.
- Rollback: this slice is document-only. Revert only its reviewed hunks if needed;
  preserve earlier documentation and the owner's Home/theme changes. No data migration.

Artifacts: [lifecycle model](contracts/ai-generation-lifecycle.json) and
[read-only reference checker](check-ai-generation-lifecycle.mjs). They are not
server code, HTTP schemas, a queue, cryptographic canonicalization or DB tests.

## 2. Durable request identity and acceptance

Before first send, the client durably records an owner-partitioned `requestId`
(UUID), action type and exact normalized submitted intent. Use that same UUID
as `Idempotency-Key` for generation and the body `requestId`. A request ID is not
a credential. No client owner, balance, provider model, role or completion claim
is accepted. All requests require the active account/session checks in 16/22.
Sign-out/account switch stops polling and quarantines the previous account's
pending state; it cannot be reused by the next account.

Proposed generation routes retain API_SPEC's three names: `POST /v1/ai/plan-my-day`,
`POST /v1/ai/break-down-task`, `POST /v1/ai/review-my-day-lite`. The old sample
bodies are conceptual inputs; their strict schemas, field ceilings, action-specific
result schemas and requestId addition still need the wire task AG-02 below.
Only admitted features may be invoked. A conditional feature name in a type or
route table is not admission. No provider calls for disabled/unconfigured features.

Under a short transaction, after authorization:

1. Look up `(owner,requestId)` across the generation family. Same action/normalized
   intent returns the existing request; a changed action/body returns idempotency
   conflict. A retry does not need another available unit. Current account/privacy
   denial still applies; do not expose a forbidden result to enable replay.
2. For a new request, validate input, current owned task/goal references, consent,
   capability and approved policy. Pin referenced versions and the exact minimal
   input snapshot. Do not let a queued request quietly pick up different task text.
3. Atomically reserve one eligible action and create the pending request plus
   durable work record. No state where the unit is held without a recoverable job,
   or a runnable job exists without its reservation. Reject insufficient allowance
   without a job/provider call. Rate limits apply even when allowance is available.
4. Commit before dispatch. The response means accepted, not completed. Proposed
   initial HTTP 202 includes requestId, status and its status-monitor path. Replay
   returns 202 while pending, 200 for a retained terminal status. Neither is a new job.

Unique `(owner,requestId)` and `(owner,requestId,reservation-kind)` guards, a single
successful-consumption reference and transaction constraints are required. Receipt
expiry must not turn an old request ID into permission to run again: preserve a
minimal approved deduplication barrier, or reject expired recoveries under a
reviewed bounded-key protocol. **The key/metadata retention policy is unresolved**;
unbounded UUID acceptance plus deletion of all deduplication evidence is not safe.

The ephemeral context snapshot is personal data, even if called a job payload.
Store only allowlisted inputs under approved access, retention/deletion and
encryption policy; do not store a rendered prompt/raw provider-response archive.
Metadata alone cannot reconstruct a changed/deleted task's previous text. Until
this short-lived input/result-storage policy is approved, production generation
is gated, not implemented with an undocumented in-memory-only shortcut.

## 3. Lifecycle, allowance and worker fencing

Public status retains `pending|completed|failed|cancelled`; worker phase is
separate. `queued|running|reconciling` refine pending rather than changing the
legacy public status union. An HTTP disconnect does not change public status.

| Event | Allowed source | Result | User allowance effect |
| --- | --- | --- | --- |
| Atomic accept | No prior request | pending / queued | Reserve one; consume zero |
| Claim or safe re-claim | pending, valid lease rules | pending / running | No new reservation/debit |
| Provider outcome unknown | pending | pending / reconciling | Hold existing reservation only |
| Valid result publication wins | pending, live fence, active policy/account | completed | Consume reserved unit once, release hold, publish result atomically |
| Accepted cancellation wins | pending | cancelled | Release hold; consume zero |
| Terminal provider/validation/internal failure | pending | failed | Release hold; consume zero |
| Server deadline expires | pending | failed | Release hold; consume zero |
| Any late callback/worker after terminal state | completed/failed/cancelled | Same terminal state | No change and no new result |

Completion atomically stores the validated private result/proposal, one consumption
entry and the completed state. A DB error rolls all three back. Validation includes
action-specific semantics and safety; JSON that merely parses is not a success.
Successful output without an owned retrievable result pointer cannot be debited.
The result may later expire under disclosed policy; fetching/expiry does not
retroactively run generation again. Existing 22 apply never consumes another unit.

Every claim has a monotonically increasing fencing value and bounded lease. Each
checkpoint/publication checks the current fence, pending state and server deadline.
Use one consistent lock order across cancellation/completion/reconciliation:
owner head, request, reservation/grant rows in stable ID order, result/proposal.
No provider I/O while DB locks are held. Recheck account freeze/revocation, grant
validity and relevant security/consent controls at completion, not only enqueue.

An expired worker lease is **not** a terminal request timeout. Another worker may
reconcile the same operation; a stale fence cannot publish. Claiming work does
not automatically authorize another provider call. Record dispatch intent before
outbound I/O. After crash/unknown provider acceptance, use the same provider
idempotency identity/status lookup only if the selected adapter proves support.
Otherwise remain reconciling until the bounded server deadline, then fail/release;
do not blindly resend. This deliberately favors no duplicate external spend over
pretending exactly-once provider execution is possible without provider support.

Provider cost and user allowance are different ledgers. A late provider invoice
or response cannot resurrect a failed/cancelled request or debit the user. An
accepted cancellation need not mean the remote provider physically stopped.
Record minimal safe operator diagnostics, not sensitive prompts in logs.

Every accepted request needs server-assigned `createdAt`, `deadlineAt`, updated
state version, reservation reference and policy version; no client-chosen deadline.
Exact deadline/lease/retry/backoff/rate-limit/retention values remain gates. The
deadline cannot outlive the allowed reservation/grant validity unless a separately
approved hold policy permits it. A refund/revocation before completion requires
revalidation, not silently switching to a different bucket. Release does not
regrant expired/revoked actions; recalculate genuinely usable availability.

## 4. Recovery and cancellation UX/protocol

Proposed `GET /v1/ai/requests/{requestId}` has no query/body. It returns only owned
status/version/times, safe failure category and an authorized result reference
when completed. No worker fence, lease, provider ID, raw prompt, bill or secrets.
All success/error responses are private/no-store. Inaccessible IDs use 404.
Known-owned purged status may use 410 under the reviewed tombstone policy; never
retain content merely to distinguish missing versus expired. Exact DTOs/codes
remain a follow-up wire deliverable, not invented by client implementers.

On lost first response the client already knows requestId. Recover by status
lookup; if no record is yet visible, resend the **same** original generation key/
intent, never manufacture another key. Cross-device recovery requires a known
request ID or a separately authorized history/list design; this contract does
not claim to find all requests automatically on a new device.

Exception: after the user asks to cancel an acceptance-unknown request, do not
resend its generation POST merely to discover status; that could start unwanted
work. Poll the original identity and cancel when its pending record becomes
visible. A missing-status/cancel 404 is **not** a cancellation acknowledgement:
the original POST may still be in flight. Show cancellation-unconfirmed, with
bounded recovery/support handling. A pre-accept cancellation tombstone protocol
would need separate wire/storage design; it is not silently supplied here.

Offline/poll failure shows “status not yet confirmed”, not “failed” or “cancelled”.
Resume bounded polling when foreground/network/auth permits, honor server retry
guidance, and stop on terminal status, account switch or loss of access. No tight
poll loop, fake progress percentage, continuous screen-reader announcements or
interruptions during focus/break. Manual planning/core focus remain available.

Proposed `POST /v1/ai/requests/{requestId}/cancel` has required independent
Idempotency-Key and empty object body. Under the same request lock:

- If pending, commit cancelled plus reservation release; return an explicit
  cancellation acknowledgement only after commit.
- If already cancelled, acknowledge the same terminal cancellation.
- If completed/failed, return current terminal status with `already_terminal`;
  never say cancellation succeeded or refund a completed generation implicitly.
- Matching retry replays its cancellation receipt after authorization. Different
  key cannot reverse a terminal state. Losing the response means recover, not
  assume it committed. Deletion/account freeze can deny ordinary recovery and
  use its separate privacy-job channel; cancellation does not restore access.

Cancellation and completion serialize: exactly one wins. Completion first means
one consumed action and a completed result, even if Cancel was tapped earlier
locally. Cancellation first means zero consumption and no publishable late result.
Explain this before cancellation; a UI tap is not the trusted transition. Leaving
the screen does not cancel automatically. Rejecting a completed proposal is not
cancelling generation and does not reverse a previously completed action.

## 5. Manual edits, new generation and exact review

Proposed `POST /v1/ai/proposals/{id}/revisions` has its own Idempotency-Key and
`{expectedProposalVersion, reviewDigest, replacements}`. A replacement identifies
an existing operation ID and supplies its entire new typed payload, not arbitrary
JSON Patch, executable text, a new command or server metadata. Proposed first-slice
maximum remains 25 operations from 22; full strict wire definitions are pending.

Manual revision **does not call AI, reserve or consume an action, or write domain
tasks/reminders**. Preserve proposal ID, generationRequestId, actionType, expiry,
operation IDs/commands/targets/dependency edges and captured input versions.
Only supported editable payload values may change. Existing target IDs, workspace,
create IDs and expected entity versions are immutable. A referenced task/goal can
only change to an already captured, currently owned/valid input reference; adding
a new input or silently rebasing a stale entity is outside this initial revision
slice. Expose that limitation, not a “saved” success. Broader edit/rebase needs an
explicit follow-up contract, not an automatic paid regeneration.

Validation runs every ordinary payload/domain/ownership/graph rule over the entire
revised proposal, including unaffected dependencies. Duplicate replacement IDs,
unknown operations, empty replacements, changed protected fields, stale inputs,
expired/applied proposals or disallowed capabilities reject without revision.
No allowance check is used to deny an otherwise permitted manual revision.
Current auth/privacy/security checks still apply. Plain text remains untrusted.

For an effective valid edit, atomically increment proposal version, compute 22's
new digest and store a minimal revision receipt. Keep expiry fixed; editing must
not extend personal-content retention. A no-op edit is rejected as no change,
not a new version. Concurrent edits/apply serialize on the same proposal lock;
one successful edit makes the old review digest invalid for apply. Matching
revision-key retry returns its original receipt without another version increment;
same key/different normalized intent conflicts. Receipt identifies resulting
version/digest, not a promise it is still the latest version. Fetch current proposal
and explicitly review before apply. Superseded content need not be archived.

The edited review invalidates prior confirmation. Retained local selections are
only draft UI state; display current full values/dependencies and require a new
explicit confirm. Removing an item from **selected apply** means deselecting it
and explicitly resolving dependent selections; it does not delete a real task.
Deleting operations from stored proposal graphs, adding new operations, arbitrary
reparenting or new plan-block types are not secretly enabled by `replacements`.
Reject/discard may remain a local choice; do not describe it as server erasure.

“Ask AI again” is a distinct explicit new-generation intent with a new request ID,
current availability disclosure and possible one-action cost. Never silently
perform it on edit failure, expired proposal, stale input, failed polling, app
restart or rejected apply. No automatic fallback to another model/provider.

## 6. Feature-completeness gaps and bounded follow-up cards

The 22 operation catalog is only `task.create|task.patch|reminder.create`; it
does **not** encode ordered focus blocks, planned breaks and their full schedule.
The subsequent version-2 model/strict wire slice in 24 closes that DTO gap; actual
plan persistence/sync/privacy/client integration remains an explicit activation gate.
Plan My Day remains required with those canonical capabilities; this contract
does not silently reduce it to task edits. Schedule items are plans, not completed
focus sessions/break records, and cannot be serialized as those completed events.
Break Down This Task needs parent/child rules in create/apply/sync and remains
conditional. Review My Day Lite needs a strict non-clinical result and verified
analytics snapshot provenance before admission. Both stay unavailable until ready.

| Card | Outcome / prerequisites | Acceptance before implementation |
| --- | --- | --- |
| AG-01 | Durable request/reservation/fenced-job SQL/RPC design after retention, consent, deadlines and runner decisions | Real owner/lease/transaction/crash tests; no duplicate reservation or debit |
| AG-02 | Strict generation/status/cancel/revision DTOs + OpenAPI, retaining three canonical generation route names | Negative/unknown-field/timezone/idempotency fixtures; merged route coverage; no conditional admission by enum |
| AG-03 | Ordered Plan My Day block/break/reminder domain and reviewed display/apply semantics | Units/timezone/overlap/available-window, edits/deselection/references; no fictitious completed sessions |
| AG-04 | Selected provider adapter and safe output validation/evaluation corpus | Provider idempotency/unknown-outcome evidence, adversarial input, no health claims, cancellation/late response sandbox |
| AG-05 | Client pending-request recovery, review/revision/apply integration | Real storage/network/account-switch/accessibility cases; no unconfirmed writes or automatic new generation |

These are DRAFT tasks with separate allowed-file packets required when executed,
not approved implementation commands. AG-02/03 document preparation can proceed
without production accounts; AG-01/04 production specifics cannot be guessed.

## 7. Acceptance scenarios and evidence limits

All **runtime/integration scenarios below are NOT RUN**. The reference checker
exercises small synthetic serial histories for selected invariants only; it does
not prove concurrency, isolation, authentication, storage or provider behavior.

| Case | Given / when | Required observation |
| --- | --- | --- |
| AG-T01 | Same key and original intent retried before/after response loss | One request/reservation; existing status/result |
| AG-T02 | Same key, changed action or body | Conflict; no extra job/provider call |
| AG-T03 | No allowance, feature disabled or policy unconfigured | No accepted job/reservation/provider call |
| AG-T04 | Last unit reserved by simultaneous requests | Only one admitted; no overspend |
| AG-T05 | Worker commits valid result then repeats completion | One result and one debit |
| AG-T06 | Cancel commits before completion/late callback | Cancelled, zero debit, no result publication |
| AG-T07 | Completion commits before Cancel | Completed, one debit, already-terminal cancellation result |
| AG-T08 | Provider timeout/invalid output or terminal internal failure | Failed, released hold, zero debit |
| AG-T09 | Lease expires; new fence claims; old worker finishes | Old finish denied; current worker can finish only while live |
| AG-T10 | Provider accepted but outbound acknowledgement lost | Same operation reconciliation; no blind second call |
| AG-T11 | Server deadline reached during reconciliation | Failed/released once; no later resurrection |
| AG-T12 | DB fails between consumption and result publication | Whole transaction rolls back; no charge without result |
| AG-T13 | Account switch, guessed ID, revoked/frozen account | No result/allowance leak or unauthorized write |
| AG-T14 | Input edited/deleted while request queued | No silent input replacement; apply/revision conflict if stale |
| AG-T15 | Grant expires/refund revokes it during processing | Revalidation; no new bucket or resurrected entitlement |
| AG-T16 | Request/receipt/content TTL reached and old key returns | Safe expired recovery or authorized replay; never regenerate |
| AG-T17 | Valid manual revision with zero remaining allowance | New version/digest; zero extra consumption/domain writes |
| AG-T18 | Changed protected field/new reference/unknown operation | Reject whole revision; prior proposal unchanged |
| AG-T19 | Two edits or edit versus apply race | One version wins; stale digest fails; no partial effects |
| AG-T20 | Revision response lost, same key retried | Original receipt; no version increment; fetch latest before review |
| AG-T21 | Expired/applied proposal edited, or content purged | No revival/expiry extension; no automatic generation |
| AG-T22 | Deselect task but keep dependent reminder | Explicit dependency error; no auto-apply or real-task deletion |
| AG-T23 | Polling offline/429 and app restart | Unknown/recovering UI, bounded retry, retained identity, no new charge |
| AG-T24 | Screen reader/large text/active focus during recovery | Usable non-interrupting status and explicit fresh confirmation |

AG-T23 additionally covers Cancel while the first acceptance is unknown: no new
generation POST after that intent, and no false cancelled label on a 404. The
reference checker does not implement HTTP delivery timing or this UI behavior.

## 8. Research basis, not approval

Primary sources checked 2026-09-19:

- HTTP 202 indicates acceptance without completed processing and should identify
  a way to monitor status. The request-ID/polling design is our application of
  that principle, not a guarantee supplied by HTTP.
  [RFC 9110 §15.3.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3).
- Hosted Edge Functions have finite execution limits; background tasks remain
  subject to worker lifetime. **Inference for Deep Focus:** `waitUntil` by itself
  is not durable recovery; a persisted work record plus approved runner is needed.
  [Supabase limits](https://supabase.com/docs/guides/functions/limits),
  [background tasks](https://supabase.com/docs/guides/functions/background-tasks).
- Row locks serialize conflicting row writers until transaction end; inconsistent
  lock order can deadlock. The proposed lock/fencing/uniqueness design still needs
  real tests and verification against the deployed database version, which is
  not selected by this research link.
  [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html).

These sources do not decide our allowance price, retention, cancellation policy,
provider, legal consent, runner or release scope. No fixed provider fees/limits
are copied into product promises. See [09](09-COVERAGE-AND-AUDIT.md) for actual
document-check evidence and the remaining independent review gate.
