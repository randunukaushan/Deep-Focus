# Reward, goal-progress and confirmed-AI wire slice

2026-09-19. **DRAFT / HIGH risk / independent review pending.** This completes
wire shapes for EX-18–20/31–33, not a production backend or every V1 endpoint.
No XP amount, level threshold, allowance, price, provider, consent age or retention
TTL is selected. Approved directions remain in [01](01-REQUIREMENTS-AND-DECISIONS.md).

## 1. Bounded task and evidence contract

- Requirement families: DF-031/032/037–039; task preparation for SP-04/BX progress
  and AI, not permission to skip foundation phases or implement draft features.
- Read: AGENTS/AI rules/execution/DoD/guardrails; API_SPEC reward and §28 contracts;
  SECURITY §23, DATA_MODEL §19, DATABASE_SCHEMA §25; revision 14/16/18/20,
  strict core/extension schemas and installed checker patterns.
- Current source checkpoint: `src/features/goals/goal-progress.ts` derives totals
  from completed local sessions since goal creation, not the proposed immutable
  attribution/period service. Rewards and Plan My Day routes are local UI, not
  evidence of a trusted XP ledger, allowance provider or transactional AI apply.
- Allowed files: this contract, `rewards-ai` schema/OpenAPI/checker, shared errors,
  coverage checker and affected documentation/index/audit. No app/package/config,
  SQL execution, spending, agents, commit/push or deployment.
- Acceptance RA-01: six exact inventory mappings, strict outputs/queries/confirmation,
  bearer protection and idempotency on apply; 47 unique operations across four slices.
- RA-02: shape fixtures reject unknown fields, wrong units, fabricated unavailable
  totals and unsupported actions. Semantic-reference cases expose extra checks.
- RA-03: explicit proposal ownership/version/selection/dependency/replay/atomicity
  rules; no generation/apply double consumption or quota-based denial of paid-for apply.
- RA-04: approval gaps, runtime NOT RUN and independent REVIEW_PENDING remain visible;
  earlier canonical alternative bodies are labelled, not silently implemented.

Artifacts: [DTO schema](contracts/rewards-ai.schema.json),
[OpenAPI slice](contracts/rewards-ai.openapi.json),
[read-only checker](check-rewards-ai-contracts.mjs). Bounds such as 25 operations
and 100 history rows are proposed engineering ceilings, not product pricing.

## 2. Common wire rules

All six operations require a validated active owner/account/session. No workspace
or owner selector is accepted in queries. Browser access uses the established
Next.js server boundary. Return `Cache-Control: private, no-store`, safe errors
and no raw prompt/provider response, credentials or internal fraud/support fields.
Opaque IDs/digests never replace object-level authorization. OWASP specifically
calls for checking permission on each accessed object, not relying on an identifier
being hard to guess. [OWASP API1](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/).

GETs have no mutation body; only rewards history accepts `cursor` and `limit`,
using 16's canonical query parser and default 50 / maximum 100. Reject repeated,
unknown and malformed query keys. All other GETs accept no query fields. Route
IDs are UUIDs; inaccessible IDs return the same 404 as missing ones. Authorization
precedes existence/version/expiry disclosure. API errors reuse the shared envelope.

| Operation | Successful output | Meaning |
| --- | --- | --- |
| EX-18 `GET /rewards` | `RewardsResponse` | Projection metadata plus nullable summary; no client grant |
| EX-19 `GET /rewards/history` | `RewardHistoryResponse` | Immutable ledger entries and owner-bound page watermark |
| EX-20 `GET /goals/{id}/progress` | `GoalProgressResponse` | Owned goal identity/version/period/target plus nullable attributed progress |
| EX-31 `GET /ai/usage` | `AiUsageResponse` | Current trusted allowance/reservations or explicit unconfigured/unavailable state |
| EX-32 `POST /ai/proposals/{id}/apply` | `ProposalApplyResponse` | One atomic selected apply receipt, HTTP 200; not mixed partial outcomes |
| EX-33 `GET /ai/proposals/{id}` | `ProposalResponse` | Reviewable validated actions or minimal already-applied state |

## 3. Rewards and goal progress

EX-18 shares ProjectionMeta (`current|pending|stale|unavailable`) with analytics.
`summary:null` is required when unavailable; all as-of/rule/sequence values are
null too. Pending/stale require a genuine previous snapshot, labelled as such.
No usable snapshot means unavailable, not zero XP/level/streak. Missing configured
rule policy cannot fabricate values. True empty verified activity may yield real
zeros under an approved rule fixture; level convention is still policy-gated.

Summary fields are `totalXp, level, currentStreakDays, longestStreakDays,
lastQualifyingDate, timeZone, achievementCount`. These are non-clinical progress
values, not proof of concentration. Server validates current <= longest streak,
valid calendar zone/date and approved level/catalog calculations. No XP formula
or achievements catalog is supplied by this shape.

EX-19 sorts immutable owner-ledger sequence DESC; first page captures ledger H,
later pages stay <= H. Cursor binds owner/endpoint/last sequence/H and expires
under reviewed policy. `ledgerHighWater` and each `ledgerSequence` are canonical
decimal strings within signed-bigint range, not JS Number. Next cursor is null
only on exhaustion. New awards after H appear on a fresh first page. Expired
cursor is 410 CURSOR_EXPIRED; unavailable history is an error, not an empty page.

Real ledger-entry sequences are positive; watermark zero is allowed only for a
genuinely empty captured ledger. Never silently truncate safe-integer XP/counts.

An award has positive `deltaXp`, `correctsEntryId:null`, `reason:earned`; correction
has nonzero signed delta, a referenced earlier owned entry and a fixed safe reason
(`duplicate_grant_reversal|verified_source_correction`). No missed-day/early-exit
penalty kind exists. These correction shapes do not authorize a correction writer:
its policy, evidence, audit and uniqueness still need review. Preserve immutable
source attribution and `(owner,sourceType,sourceId,awardKind)` award uniqueness;
never regrant because ruleVersion changes. Cumulative correction integrity, source
ownership, overflow and nonnegative balance require actual trusted checks.

EX-20 uses the goal's frozen `[startsAt,endsAt)` and named zone, not a client date
override. `focus_time` uses ms; `session_count|task_completion` uses count. Target
is positive; progress `currentValue` and `contributionCount` are nonnegative safe
integers. Keep actual totals even when over target; a display ring may clamp its
ratio to 1, never stored values. Completed/active goal status remains a distinct
domain decision, not a side effect of this GET. Reuse the immutable attribution
rules in 16/20; all sessions since creation is not an acceptable implementation.
Deleted/inaccessible goals return 404; target/type/period edits remain gated.

## 4. AI allowance: availability is not spend authority

Current usage reports `policyVersion, checkedAt, unit:action, availableActions,
reservedActions, buckets, enabledActions, nextRefreshAt`. Bucket sources may be
free/paid, or rewarded **only after that format/policy is approved**; no offer or
ad-format approval is inferred from an enum. A source occurs at most once after
server aggregation. Totals equal the bucket sums. Counts describe current usable
grants and active reservations; they are not monetary credit. `nextRefreshAt` is
the next known invalidation boundary, not a promised refill or a client grant.

Unconfigured/unavailable usage has null policy/time/counts/buckets/features; never
pretend the user has zero actions or is a free user when trusted state is unknown.
`enabledActions` means admitted capability, not sufficient balance/consent. Server
rechecks consent, feature admission, ownership, limits and grant availability at
generation. Reserve atomically; concurrent requests cannot reserve the same action.

Preserve the current canonical V1 consumption rule: at most one action for a valid
completed generation/review result; terminal timeout, invalid output, internal
failure or accepted cancellation consumes no user action. Provider invoices are
a separate operator cost and never justify silently debiting the user. A lost HTTP
response is not itself a terminal failure/cancellation: recover the durable request
and replay its result, never automatically start/charge another generation. A late
provider result cannot charge a terminal failed/cancelled user request. Reservation
timeout/reconciliation and provider retry policy remain implementation gates.

## 5. Review and exact selected apply

Generation returns no domain writes. After output validation, the server stores a
minimal, short-lived versioned proposal, not a raw prompt/response archive. No
retention duration is selected here. The proposed contractVersion 1 action catalog is only
`task.create`, `task.patch`, `reminder.create`, using the existing strict domain
payloads. It does not admit goal/settings/reward/SQL/shell actions. Child-task parent
fields and full Plan My Day scheduling/adapters need further contracts; conditional
Break Down This Task is not enabled merely because its feature ID exists.

[24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md) adds a distinct proposed
contractVersion 2 for Plan My Day: exactly one plan.create and optional preceding
reminder.create operations, with the full ordered itinerary in the review digest
input through operations. v1 cannot carry plan.create. Whole-plan selection, manual
block edits/reminder bindings and persistence/sync/privacy gates are defined there;
no actual session/progress is created by saving a plan. The existing confirmation
body and atomic selected receipt remain; unsupported versions fail closed.

Reviewable output includes proposal ID/version, generationRequestId, contractVersion,
actionType, expiresAt, reviewDigest, inputVersions and ordered operations. Each
operation has stable ID, command, targetId, dependency operation IDs and validated
payload. Server pins preconditions for existing referenced tasks/goals, checks
same-owner links and personal workspace, and assigns stable create IDs. Graph
must be acyclic, dependencies earlier in execution order, unique operation/created
entity IDs, no self-reference or multiple writes to one target in this first slice.
Missing operation dependencies must be displayed and selected, not auto-applied.

Task-create proposals resolve and expose description, priority, goalId and due
before digest/review, including explicit null/none values; no unseen default is
added during apply. Patches show exactly the changed values and captured existing
version. The server assigns/validates target/workspace IDs, not arbitrary model
authority. Actual defaults and feature admission still require approved contracts.

Digest: SHA-256 over RFC 8785 canonical JSON of exactly `{contractVersion, id,
version, generationRequestId, actionType, expiresAt, inputVersions, operations}`;
exclude lifecycle state and digest field. Array order is retained; JSON object key
order is canonicalized. Use a reviewed conforming implementation, not ordinary
JSON.stringify as a crypto canonicalizer. UI displays full selected values and
dependencies as plain text; never executes provider text/HTML or follows embedded
instructions. Output validation/encoding is required even after user confirmation.
[OWASP output handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/),
[RFC 8785](https://www.rfc-editor.org/rfc/rfc8785).

EX-32 accepts only existing `ProposalConfirmation`: expectedProposalVersion,
reviewDigest, selectedOperationIds and required Idempotency-Key header. It accepts
no editable values, owner, quota or success flag. Normalize selected IDs to stored
operation order before receipt hashing; selection order is not a different intent.
Changed values require new server-validated version/digest and another full review.
[23](23-AI-GENERATION-RECOVERY-AND-REVISION.md) now proposes manual revision,
generation recovery and cancellation lifecycle details. 24 now supplies strict
revision/generation/status/cancel/plan-read DTOs and their partial OpenAPI slice.
Provider policies and plan sync/privacy/runtime integration remain pending.

Under the owner-head transaction: authenticate active account; look up matching
apply receipt first; then check live proposal version/digest/expiry, explicit
selection/dependency closure and current referenced owner/versions/permissions.
Use ordinary domain helpers without nested commits; write selected entities,
change entries, one apply receipt and proposal applied marker atomically. No
network/provider I/O inside that transaction. Failure rolls everything back;
never report skipped/partly created items as a successful apply.

Success receipt results are in stored execution order and must match the exact
selected operation IDs/commands/targets. Its mutationId equals the request key;
its proposal ID/version/digest match the reviewed contract. These equality rules
require semantic validation beyond shape checking.

One successful apply consumes the proposal (unselected operations do not silently
run later). Enforce unique `(owner,proposalId)` apply and stable per-operation
identity `(owner,proposalId,operationId)` across keys/transports. Matching key/payload
replays the original receipt after authorization, even if the proposal subsequently
expires; same key/different intent is IDEMPOTENCY_CONFLICT. Different key after
apply is AI_PROPOSAL_ALREADY_APPLIED, not another execution. Preserve durable
consumed markers when short-lived content/receipts expire; account-deletion policy
is separate. Missing old response after receipt expiry must not allow re-execution.

Apply never generates again or consumes another AI action. Empty allowance/expired
paid balance alone cannot deny applying a previously generated still-valid proposal;
current security/age/consent/feature controls still apply. Repeated/remapped keys,
stale dependencies and client-side mock success cannot bypass those checks.

Applied GET returns minimal state/selected IDs/time rather than another executable
operation list. Expired/purged owned proposal is 410 AI_PROPOSAL_EXPIRED where an
owned tombstone exists, otherwise 404; never retain sensitive content solely to
distinguish these states. Stale version/digest/selection mismatch is 409
AI_PROPOSAL_MISMATCH, missing dependency/unknown selection is 400 VALIDATION_FAILED,
changed entity version is 409 VERSION_CONFLICT; safe core errors cover others.

## 6. Remaining implementation and verification gates

This covers all 33 rows of the extension inventory together with prior slices;
47 operations across four documents is **not** the complete merged V1/enterprise
API. 24 subsequently adds five wire operations (52 across five slices) and the
v2 ordered-plan model. Plan persistence/sync/privacy integration, conditional
child-task/review results, provider callbacks,
merchant/age/retention policies, reward rules, SQL/RPCs and actual runtime remain
incomplete. No dormant feature is activated and no ad/allowance amount is chosen.

Future integration acceptance (all NOT RUN): two owners/guessed proposal IDs;
expired/revoked account; every unsupported action/field; adversarial generated
text; cyclic/missing dependencies; stale version and digest; concurrent same/different
keys; transaction failure after first write; lost response; receipt/content expiry;
account freeze during apply; one generation debit and zero apply debits; terminal
failure/late provider result; unavailable versus real zero projections; cross-midnight
goal attribution and immutable history paging. Test real DB rollback/uniqueness,
browser/mobile serialization and actual provider behavior separately from fixtures.

The checker validates shapes, references, exact wire mappings and small semantic
examples only. It is not an implementation of authorization, hashing, transactions,
rewards, quota accounting or native reminders. Independent security review remains
required before acceptance/integration. Actual run evidence goes in [09](09-COVERAGE-AND-AUDIT.md).
