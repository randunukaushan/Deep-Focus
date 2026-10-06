# Account export artifact and coverage — AE-01

2026-09-20. **DRAFT / HIGH / REVIEW_PENDING.** Solo documentation, not a
working export service or a legal-compliance determination.

සිංහල: මෙය account export ගොනුවේ සම්පූර්ණ පිටත ආකෘතියයි. Plans පමණක් නොව,
දැනට නිශ්චිත data contracts ඇති අනෙක් account දත්තත් එකම snapshot එකකින්
එයට සම්බන්ධ කරනවා. Local-only files server එකට යවන්නේ නැහැ. අලුත් feature
එකක ගබඩා කරන දත්ත export එකෙන් නිහඬව අතහැරීමට ඉඩ නොදෙන coverage gate එකක් ඇත.

## 1. Bounded task brief

- Outcome: exact outer JSON artifact, section mapping, coverage and safe delivery/
  recovery requirements for EX-21–23. No new HTTP operation or production selection.
- Phase: documentation continuation after PL-02, before isolated SQL/RPC work.
  Approved direction is account portal, own-account privacy access, local resources
  and existing stack; detailed serialization/delivery below remains a proposal.
- Read: AGENTS, AI rules, execution/DoD/guardrails/map/task brief; 16 §§8/11.2,
  17 §6, 25 §7, 27 §7; API introduction, Security Data Export; referenced DTOs,
  personal-core focus_events and current Plan My Day source/package scripts.
- Baseline: dirty docs and owner Home/theme edits preserved. No export backend or
  portal exists just because a DTO exists; no package test script was found.
- Allowed: new 28, account-export schema/checker; revision README/07/09/16/17/18/27,
  check-docs, documentation map/DoD and canonical API/security/testing/changelog.
- Risk HIGH: broad own-account disclosure, cross-owner isolation and retained
  download artifacts. Independent qualified review before acceptance/integration.
- Non-goals: app/SQL/provider changes, new dependencies, paid accounts, uploads,
  automatic imports, agents, commit/push/deploy; no prices, TTLs or legal conclusions.
- AE-A01 strict artifact/coverage mapping; AE-A02 consistent snapshot and integrity;
  AE-A03 disclosure/delivery/reset rules; AE-A04 repeatable fixtures with limits.
- Rollback: only own reviewed documentation hunks. Policy/schema conflicts stop
  affected implementation; drafting does not resolve missing production approvals.

Artifacts: [schema](contracts/account-export.schema.json),
[reference checker](check-account-export.mjs). No new OpenAPI file: **60 operations
across seven files remain unchanged**. The outer artifact version 1 is independent
of replication v2 and the nested plans-component version 2.

## 2. Exact envelope and encoding

EX-21 still accepts `{format:"json",scope:"own_account_data"}`. EX-22 polls the
owned job and EX-23 returns its existing `{data:{jobId,url,expiresAt}}`. The URL
serves one UTF-8 JSON file, not a ZIP, HTML, JSONP, import script or live API dump:

```text
{ format:"deep-focus-account-export", contractVersion:1,
  manifest:{exportJobId,snapshotAt,generatedAt,highWater,privacyEpoch,
    timeEncoding:"UTC_with_record_time_zones", coverage:"contract_scoped",
    exclusions:[...], deferredFamilies:[...], artifactDigest},
  sections:{identity,profile,settings,tasks,goals,sessions,focusEvents,breaks,
    reminders,plans,rewardHistory,aiUsage,entitlements,accountSessions} }
```

All keys required; unknown fields reject. No owner-selected ID in the export
request. Actor comes from trusted authentication. Identity inside the artifact
describes its authenticated owner; it is data, not an authorization credential.
Use UTC instants; retain each record's IANA zone/local date rather than shifting
stored dates to download-device time. High-water/epoch are canonical decimal
strings with the signed-bigint bounds in 27; no floating-point sequence conversion.

UTF-8 without BOM, unique JSON object names and valid Unicode; do not normalize
user Sinhala/Tamil text. Do not parse with eval or inject text into HTML. Validate
decoded duplicate keys before a parser could silently discard them. Bounds on
total bytes, records, job duration, concurrency and retention require reviewed
numeric operational policy. Schema integer maxima are representation ceilings,
not approved quotas. Never truncate a large export and mark it complete.

## 3. Fourteen sections and exact inclusion

Every section key exists even when it has zero records. Except `plans`, each is
`{recordCount,pageCount,pages:[{pageIndex,records}],sectionDigest}`. Pages contain
at most 100 records; zero records use one empty page. Indices are consecutive from
0, counts exact. No embedded URLs/cursors; these are partitions inside one file,
not another pageable API. All records sort by lowercase UUID ASCII `id`, except
entitlements use `grantId`, rewardHistory uses decimal ledgerSequence, and aiUsage
is a singleton. No duplicate IDs/ledger sequences across pages. Profile, identity,
settings and aiUsage have exactly one record; missing required bootstrap data
fails the job instead of fabricating an empty account. No duplicate owner field
is added to existing DTOs.

| Section | Exact serializer / source boundary |
| --- | --- |
| identity | New Identity: own id, nullable email/phone, createdAt, updatedAt; no auth metadata blob, tokens or password hash |
| profile | Existing personal-api Profile; personalWorkspaceId scopes the personal export |
| settings | Existing AccountSettings allowlist; local-only preferences/phrases are not silently uploaded |
| tasks | Existing Task, including completed/cancelled/archived but excluding soft-deleted rows |
| goals | Existing Goal, including completed/cancelled/expired, excluding deleted rows |
| sessions | Existing Session at snapshot time; no invented live timer progress; existing retained title-snapshot policy still applies |
| focusEvents | New FocusEvent matching the prototype's id/sessionId/sequence/type/occurredAt/receivedAt; not raw mutation receipts |
| breaks | Existing Break, including its verificationState |
| reminders | Existing Reminder with deletedAt:null; disabled retained reminders included |
| plans | Exact ExportPlansSection from 27, active + archived, not deleted; nested version remains 2 |
| rewardHistory | Existing RewardEntry award/correction ledger, not only a current XP total |
| aiUsage | Existing CurrentUsage or UnknownUsage snapshot; unavailable is not fabricated zero; not a claim of full activity history |
| entitlements | Existing Entitlement, owned personal scope only; grants include pending/expired/revoked retained states |
| accountSessions | SafeAccountSession: own id/displayLabel/state/createdAt/lastSeenAt; omit request-relative `current`, raw IP, JWT and refresh tokens |

Identity reads require a reviewed narrow trusted projection from the selected
Auth storage into this snapshot; never expose auth.users wholesale or fetch live
provider identity after the snapshot. If the adapter cannot establish this, the
artifact cannot claim consistency and the job must not publish success.

Validate Profile.id = Identity.id; settings.id is the independently owned singleton
row ID returned by its API, not necessarily the actor ID. Validate workspace on
tasks/goals/sessions/plans = personalWorkspaceId,
and personal entitlement scopeId = owner. These content checks do not prove row
ownership: trusted queries must constrain every source to the actor independently.
Current plan/task/reminder/goal and break/event/session bindings must resolve in
the same snapshot. Retained session taskId or reward/provenance references may
legitimately name a deleted/pruned source under their existing history policy;
do not resurrect its content or fetch another account to fill a missing reference.
A title retained under the distinct session-history contract is not permission to
retain erased plan explanations. Unresolved retention conflicts block publishing.

## 4. Coverage gate — no silent omissions

September 30 classroom reconciliation: [41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
maps retained classroom data to shared_workspaces, consent_history and restricted
security handling. This does not add a fifteenth section or modify the current
export DTOs. Once classroom records exist, not_collected is invalid for affected
families; a reviewed serializer/version or functioning authenticated separate
process is required before activation. A teacher export cannot become a raw class
dump, and private acceptance provenance is not automatically a Task export field.

`exclusions` contains exactly these five distinct codes, in this order:
`local_only`, `credentials`, `internal_security`, `deleted_content`, `raw_ai_content`.
They describe this self-service artifact, not a determination that every excluded
personal-data category is legally exempt from access. Internal receipts, request
hashes, leases, suppression journal and fraud/support notes are not raw-table exports.
Local files/paths/resource associations, phrases and unsynced work are unavailable
to this server export. Do not collect them merely to populate it. No paid tier is
required for necessary privacy access; paid cloud is unrelated to this export.

The manifest also has exactly one entry for each registered deferred family:
`ai_activity`, `consent_history`, `billing_records`, `cloud_resources`,
`shared_workspaces`, `support_records`, `telemetry`, `connector_data`.
Each `{family,disposition,policyRef}` is either:

- `not_collected` with policyRef:null, only if the actual release's storage inventory
  establishes that no retained data for that owner exists in this family;
- `separate_process` with a reviewed, versioned public policy reference, only if
  a functioning authenticated access route/support process covers that data and
  its explicit exclusions. The portal names that route before download. A made-up
  policy slug is not evidence. This cannot be used simply because a serializer is hard.

Unknown collected families, unavailable inventory, missing policy/access path,
unmapped user data or permission failures block publication; do not turn them into
`not_collected`. Extend/version the artifact when an admitted feature needs an
automated serializer. Coverage is deliberately `contract_scoped`, never “every
byte we hold.” Product copy must say what this download includes and disclose
separately handled data. Required access beyond this serializer needs qualified
privacy review, not an invented blanket refusal or a false all-data success.

The release inventory must account for all application/Auth/storage/provider
stores and private operational tables. A CI/schema diff detects newly retained
families and requires export/access disposition before feature admission. Examples:
retained AI request/reservation history is not the current aiUsage singleton;
billing receipts are not entitlement grants; own cloud files cannot be labelled
local-only. No consent/billing/cloud subsystem is enabled by adding its registry row.

## 5. Snapshot, hashes and bounded worker

Materialize all included sections, source counts and inventory evidence from one
consistent database snapshot with owner highWater H and privacyEpoch. External
provider activity is not transactionally captured by PostgreSQL; its separately
handled scope must be disclosed, not silently merged from later network reads.
Record snapshotAt once; generatedAt is completion time and must be >= snapshotAt.
All plans-component job/time/H/epoch values must equal the outer manifest's.
H denotes the replication watermark, not a global billing/Auth event sequence.

Use 16's durable fenced job, not an unbounded Edge invocation. Materialization
restarts from scratch with a new coherent snapshot after lost DB snapshot state;
never append live pages to an old snapshot. Partial objects remain private and
unpublished, cleaned under approved retention. Publish only after full schema,
source-count, cross-reference, coverage, integrity, current epoch and account-state
checks. A stale worker cannot set succeeded or replace a newer artifact.

SHA-256 of UTF-8 RFC 8785 JCS; digest fields lowercase hex:

- Non-plan sectionDigest preimage: `{contractVersion:1,exportJobId,snapshotAt,
  privacyEpoch,section,records}` with all ordered records concatenated.
- Nested plans page/manifest digests stay exactly as specified in 27.
- artifactDigest preimage: `{format,contractVersion,manifest,sections}`, with
  **only manifest.artifactDigest omitted**. Other manifest fields, section digests
  and complete sections are included. No recursive self-hash or JSON.stringify substitute.

Hashing/serialization must stream or use reviewed bounded materialization; do not
load an arbitrarily large account into mobile/browser memory. Hashes detect
accidental inconsistency, not malicious-server edits or ownership violations.
This packet adds no JCS implementation. Official vectors and real corrupted-byte/
truncation tests are required before acceptance; reference fixtures use placeholders.

## 6. Delivery, expiration and portal behavior

Keep EX-21–23 shapes unchanged. The export job is independent of a paid cloud
subscription. On repeated same request intent/key, recover the same job; polling
returns coarse status only, never download secrets. Lost download-token response
uses existing replay rules and original expiry. Expired artifacts require a new
explicit export; never extend retention silently. Missing TTL/recent-auth/storage/
runner policy yields POLICY_UNCONFIGURED, not a guessed usable URL.

Design requirement: private revocable delivery boundary rechecks actor/session,
recent-auth admission, owned job, current epoch, artifact identity/expiry and
account state. A signed URL without tested invalidation does not satisfy 25/27.
This is not a choice of hosting/download provider. No raw bucket path or permanent
public URL; restrict destinations, avoid credentials in referrers/logs/analytics.
Serve application/json as attachment with a fixed sanitized filename such as
deep-focus-export.json, private/no-store and nosniff. Do not inline-preview private
records, cache via service workers/CDN or automatically save to a shared device.

During deletion/epoch changes deny new requests and terminate further streaming
when detected, but acknowledge bytes already delivered/in flight cannot be recalled.
Range/resume must not bypass authorization or mix artifact revisions; until a
reviewed range protocol exists, restart a failed download under fresh authorization.
An interrupted file is incomplete, not an empty successful export. Export is not
an import/restore mechanism and must never enqueue mutations, grant XP or activate
entitlements when opened. Local-resource backup needs its own user-initiated flow.

Portal: loading → requesting → queued/running → ready → downloading → downloaded,
with distinct failed, expired, access-denied and unavailable states. Announce
status accessibly, retain keyboard focus, show snapshot date/scope/local exclusions
and separately handled families. Never expose contents in telemetry or present a
completed server job as proof the browser saved the file. Browser save confirmation
is limited by the actual platform; show “download started” if completion is unknown.

## 7. Verification and next safe task

| Case | Future runtime evidence — all NOT RUN |
| --- | --- |
| AE-T01 | Two owners, frozen/revoked sessions and guessed jobs cannot disclose records |
| AE-T02 | Concurrent edits across all sources produce one coherent snapshot, not mixed pages |
| AE-T03 | New retained family/missing serializer/inventory failure blocks false complete export |
| AE-T04 | Local files/credentials/private notes never leak; separate-process access actually works |
| AE-T05 | Empty/paged/large accounts, duplicate keys, Unicode and count/digest corruption handled |
| AE-T06 | Worker loss/fence races, lost responses, TTL expiry and repeat job keys recover safely |
| AE-T07 | Epoch/deletion invalidates old URLs, unpublished parts and stale workers; restore suppression |
| AE-T08 | Memory/byte/time budgets and slow/interrupted downloads do not truncate as success |
| AE-T09 | User cannot import the export to create rewards/entitlements/another owner identity |
| AE-T10 | Screen reader/keyboard/localization and truthful browser download states verified |

Checker covers shapes, refs and synthetic counts/coverage/binding rules only.
No actual auth/SQL/storage/worker/crypto/browser/security proof or legal certification.
Continuation [29](29-PLAN-DATABASE-RPC-TEST-PACKET.md) now specifies the PL-03
isolated database/RPC test packet and remaining policy prerequisites; no DB tests
have run. Do not run migrations until authority and independent review
gates are satisfied; this outer contract does not make deferred serializers complete.

Research checked 2026-09-20: [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)
defines UTF-8 JSON interchange; [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)
defines JCS constraints. [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
supports consistent transactional reads, not cross-provider snapshots.
[Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
warns that service keys bypass RLS. Our coverage/streaming/epoch design requires
its own actor checks and tests; these sources do not certify the proposed system.
