# Paid Cloud Resources — admission, lifecycle and recovery packet

Date: 2026-09-25. Status: **DRAFT / REVIEW_PENDING, NOT IMPLEMENTATION-READY**.
January placement is approved; exact policies, object provider, prices and
production activation are not. [01](01-REQUIREMENTS-AND-DECISIONS.md) owns approval;
[12 §7](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) owns selected-upload/local-copy
invariants, [06](06-MONETIZATION-AND-ENTITLEMENTS.md) owns subscription semantics.
This expands R-05 preparation, not a competing catalog, API or database migration.

## Task brief — CC-00

- Outcome: make the required paid-cloud lane concrete enough to expose its next
  implementation dependencies, cost risks, failure states and real acceptance work.
- Scope: DF-020/022/036/045/047, ADR-006 September 25 placement; documentation only.
- Read: RS-01's governance reads, 06/12, 18/32, current official references below;
  no new canonical API/security rule superseded without later reconciliation.
- Risk: HIGH — private learner/teacher files, authorization, money and erasure.
  Independent qualified security/privacy/billing review remains PENDING.
- Allowed: this new file and routing/evidence in revision 06/08/09/12/18/32,
  README/check-docs.mjs, docs/DOCUMENTATION_MAP.md and CHANGELOG.md. No package,
  mobile code, SQL, bucket, purchase or provider account changes.
- Baseline: existing resource/card draft, selected database/Auth/Edge stack;
  Supabase Storage remains a candidate, not an approved object-storage selection.
- Acceptance CC-A1: separate verified source facts, design recommendations and
  unresolved owner facts. CC-A2: cover initiation/finalization races and bounded
  cleanup without exposing private bytes. CC-A3: distinguish cancellation, expiry,
  cloud deletion and local removal. CC-A4: six ordered draft cards and twenty
  NOT_RUN cases; no invented runtime or compliance evidence.
- Verification: document/card coverage checker, targeted semantic review, all
  existing contract checkers, scoped diff/source preservation. No real uploads.
- Stop: no implementation READY without provider/billing/security policies,
  actual DTO/RPC/schema and native test harness. No spending inferred from scope.

## 1. Current official research and design implications

Sources checked September 25; recheck before choosing products and submission.
This is technical planning, not legal advice or a merchant-eligibility decision.

| Source fact | Deep Focus implication — recommendation, not owner approval |
| --- | --- |
| Apple §3.1.1 generally requires IAP for in-app digital unlocks. §3.1.3 describes exceptions, including qualifying stand-alone cloud companions; external purchase-link rules vary by storefront. §3.1.2(c) requires clear subscription value/capacity disclosure. [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/) | Plan a verified iOS purchase/restore lane; assess the actual app and storefront before relying on an exception. An Account Portal does not automatically permit purchase links everywhere. No cloud capacity placeholder at checkout. |
| Google Play's payments policy includes cloud data storage/productivity services within digital purchases subject to Play billing, with specified exceptions/programs. [Google Play payments](https://support.google.com/googleplay/android-developer/answer/9858738) | Assess the chosen countries/programs and product mapping; no universal web-checkout redirect assumption or claim this is a physical service. |
| Supabase Storage access uses RLS; privileged service keys bypass RLS. [Access control](https://supabase.com/docs/guides/storage/security/access-control) | If selected, mobile/browser receive no privileged key. Broad owner-folder writes are insufficient to enforce per-operation quota; exercise direct Storage API bypass tests. |
| Supabase database backups do not contain Storage API object bytes. [Database backups](https://supabase.com/docs/guides/platform/backups) | A database restore is not a file restore. Object-byte recovery, version mapping, erasure suppression and its cost require separate proof before selling backup promises. |

Do not copy provider example policies into production unchanged. These sources
do not verify our implementation or approve Supabase Storage, an ad network,
merchant country, legal age, storage quota, encryption claim or pricing.

## 2. Minimal launch boundaries and policy ledger

Local reference/file use remains independent of a subscription. Paid cloud is
an optional private copy service for deliberately selected resources. No public
share links, learner roster, teacher access, automatic AI/OCR, thumbnail service
or library-wide background upload is included by this approval. If a preview or
scanner will inspect bytes, document its exact purpose/processors before use.

| Required policy | Must be concrete before related card becomes READY |
| --- | --- |
| Commercial | Legal publisher/business country, merchant/payout eligibility, approved store/web mappings, taxes/refunds, restore/overlap rules and support |
| Catalog/limits | Explicit capabilities, stored/reserved bytes, per-file size/count/type, concurrent operations, request/download transfer caps; no unlimited/automatic overage |
| Data | Owner mapping, region/processors, permitted file types, retention/grace/export path, privacy rights, minor eligibility; stage alone cannot decide these |
| Security | Private object service, write capability scope/expiry/replay behavior, worker identity, checks/quarantine, encryption/key responsibility, rate limits and audit minimization |
| Reliability | Immutable version semantics, retry/cancellation policy, cleanup bounds, reconciliation, object+metadata restore, RPO/RTO and deletion suppression |
| UI/locale | si/ta/en copies, large text/screen-reader status, honest local vs cloud vs pending vs unavailable; supported native import/download adapters |

The price model remains 06 §8. Count temporary objects, abandoned uploads,
retained versions, downloads/retries/scans/restore traffic, object backups,
payment deductions, fixed costs and cancelled customers' retained data. Measure
provider invoices against quota-ledger telemetry without filenames/content in logs.

## 3. Proposed operation lifecycle — internal domain, not wire schema

An implementation task must first freeze versioned request/response/error DTOs,
RPC transaction boundaries and storage policy. Names below are conceptual states,
not pre-approved endpoint paths, SQL enums or mobile dependencies.

| State | Admission / transition | Durable consequence |
| --- | --- | --- |
| LOCAL_ONLY | No selection or no paid service | No network resource queue or copied cloud metadata |
| PREVIEWED | User selects exact immutable local revisions and fields | Confirm consent intent, bytes and destination; cancel has no upload |
| RESERVED | Authenticated owner + current policy/entitlement + atomic quota check | Stable operation ID, owner, selected revision, bounded capacity, expiry, unique private destination |
| UPLOADING | Narrow operation-bound write authority | No public reads, overwrite permission or unrestricted folder upload |
| VERIFYING | Provider confirms finalized bytes; trusted checks run | Compare real size/type/integrity, scanner policy; not downloadable yet |
| AVAILABLE | Atomic idempotent publication after current-policy/ownership recheck | One immutable verified version; move quota reservation to measured usage once |
| CANCELLING / CLEANUP_PENDING | User cancel, rejection, expiry or failed verification | Stop new authority/publication; retain exposure accounting until safe cleanup |
| TERMINAL_FAILED / CANCELLED | No write can resurrect data; cleanup accounted | Safe typed failure and retry choice; no success toast, local copy retained |
| DELETE_PENDING / DELETED | Explicit cloud delete or approved retention/privacy job | Deny new access, suppress publication/restore, reconcile byte deletion and quota exactly once |

Plan-specific replication v2 is not a generic resource transport. Resource bytes,
paths and local associations remain excluded from core task sync. A separate
cloud metadata mapping must enter the source inventory/export/deletion contracts
before storage is activated; do not wedge resources into a task description.

### Concurrency and cost invariants

1. Reserve against one authoritative per-owner quota transaction; concurrent
   clients cannot both spend the same remaining bytes. Include unpublished,
   retained and cleanup-pending capacity according to the frozen ledger contract.
2. Bind operation ID to authenticated owner, selected resource revision, approved
   metadata and content identity. Same ID plus changed payload is a conflict;
   exact replay returns the prior operation result, not a second reservation.
3. Actual object size cannot exceed reserved capacity. Untrusted client length,
   MIME, filename or a callback is not proof. Enforce a provider-supported bound
   before ingestion where possible; fail closed on an unbounded direct upload
   design. Bounded temporary storage/abuse controls must be verified separately.
4. Do not issue a new write token after revocation/cancellation. Already issued
   tokens may remain usable until provider expiry; do not claim instant recall.
   Prevent publication and account/clean late bytes until authority is exhausted.
   Do not release all reservation capacity early and then permit reuse while an
   old token can still create billable bytes.
5. Verify an immutable object version and prevent later mutation of the verified
   bytes through a still-live upload token. If the provider cannot supply that
   guarantee, design a tested staging-to-final promotion/fence before READY.
6. The database and object store are not one atomic transaction. Use durable jobs,
   idempotent transitions and reconciliation for orphan objects, missing metadata,
   verified-but-unpublished versions and lost responses; no pretend two-phase commit.
7. Recheck deletion, owner, entitlement and policy at publication. If finalization
   commits before a refund/revocation, follow the disclosed lifecycle, not retroactive
   data disappearance. If revocation wins first, deny new publication and clean up.
8. A retryable status read is owner-scoped. Unauthenticated/foreign IDs must not
   reveal filename, size, existence or quota through different response details.
9. Cloud denial or an outage cannot pause the user's focus or mutate local work.
   Save cloud-operation recovery metadata separately from the focus-session commit.

## 4. Subscription, download and deletion are different operations

| Event | Required behavior |
| --- | --- |
| Purchase pending/unknown | No client-granted entitlement; show verification/restore, do not recommend duplicate purchase |
| Subscription active, no selection | Still no upload; local library stays local |
| Cancel renewal | Follow verified validity; not immediate erasure or cancellation of another store's plan |
| Expiry/downgrade/full quota | Block new excess uploads under approved policy, retain disclosed access/export/warnings; no silent tier upgrade |
| Download on another device | Explicit authenticated action, quota/rate checks and narrow access; verify file before promoting local copy |
| Download unavailable/partial | Honest error/retry; incomplete file is not a valid recovered copy; local originals unchanged |
| Cloud delete | Explicit scope and confirmation, deny new access immediately where supported, remove via idempotent job, suppress late publication/restore |
| Remove local copy | Separate explicit action, preserve cloud rights; never triggered just by payment expiry or other-device deletion |
| Account deletion | Freeze new uploads/publication, revoke where possible, erase all retained cloud families under approved policy and track processor/backups; paid subscription cancellation is separately explained |
| Recovery from backup | Restore isolated metadata and exact object versions, apply deletion suppression before serving, reconcile usage; don't resurrect revoked access |

Signed downloads are bearer capabilities; logs, crash reports, analytics and
notification payloads must exclude them. TTL/revocation limitations must be
disclosed and tested. Essential user-data access is not dependent on renewing a
subscription; the approved retained-data access path must not conceal permanent
provider costs or promise an indefinite unlimited download service.

Portal launch includes account/subscription/quota/privacy status and the approved
data-access process. A full browser resource library/editor is not silently added.
Do not use that exclusion to omit legally/policy-required access to stored data.
Exact portal download/export delivery follows an explicitly reviewed contract.

## 5. Ordered small-context cards

Each card is DRAFT. Before implementation: task brief with exact allowed source
paths, actual schema/DTO/adapters, approved policy values, real commands and
independent review. No new API count is claimed from conceptual operations.

| Card | One outcome | Depends on / acceptance |
| --- | --- | --- |
| CC-01 | Freeze owner-scoped storage/catalog/policy inventory and exact API/RPC contracts | R-01/02 and 06; approved object-provider/region/commercial/privacy facts, no placeholders; CC-T01/02/19 |
| CC-02 | Verify store/web purchases and deduplicated entitlement lifecycle | CC-01, BE identity, BX billing; genuine sandbox harness; CC-T03/04/15/16 |
| CC-03 | Enforce quota reservation and narrow private uploads | CC-01/02, R-03 recovery; actual storage/RLS bypass evidence; CC-T05–09 |
| CC-04 | Publish verified immutable versions and reconcile cancellation/orphans | CC-03; trusted worker/scanner/privacy design; CC-T08–13 |
| CC-05 | Recover/download, delete and restore without erasure reversal | CC-04, account export/deletion inventory; CC-T14/17–19 |
| CC-06 | Integrate both native clients and portal status; pass release evidence | CC-01–05 and approved UX/locales, support/cost monitoring; CC-T01/02/15/16/20 plus all prior cases |

## 6. Runtime acceptance inventory — all NOT_RUN

Use two synthetic users, at least two clients per user, a genuinely isolated
object/DB environment and sandbox payments; no student documents or real charges.
Map results to release G-02/04/05/06/07/08/11/12/16/17 as applicable.

| Test | Given / when | Observable expected result | Evidence |
| --- | --- | --- | --- |
| CC-T01 | Free/local-only library, subscription UI opened/cancelled | No resource bytes/metadata leave device; focus/manual planning work offline | NOT_RUN |
| CC-T02 | Active subscription, select none then one exact resource | No auto-upload; only previewed fields/revision eligible | NOT_RUN |
| CC-T03 | Forged client entitlement or transaction for another owner | No grant or quota authority; no foreign purchase disclosure | NOT_RUN |
| CC-T04 | Duplicate/out-of-order webhook, lost purchase acknowledgement | One convergent entitlement; restore recovers without repurchase | NOT_RUN |
| CC-T05 | Two clients reserve final remaining quota concurrently | At most allowed total reserved/used; authoritative remainder correct | NOT_RUN |
| CC-T06 | Same operation key replayed with same/different content | Same result for exact retry; changed payload conflicts; no extra charge | NOT_RUN |
| CC-T07 | Oversize, false MIME, forged path, unreserved direct Storage API write | Rejected/bounded; no quota bypass, public read or foreign overwrite | NOT_RUN |
| CC-T08 | Cancel/reservation expiry then late upload using old token | No publication; late bytes accounted/cleaned, capacity not prematurely reusable | NOT_RUN |
| CC-T09 | Guessed foreign ID for list/status/download/delete | No private metadata/existence leak or cross-owner mutation | NOT_RUN |
| CC-T10 | Malformed file, failing scanner or scanner outage | Quarantine/typed retry or rejection; no unverified download or public scan submission | NOT_RUN |
| CC-T11 | Replace bytes after verification with still-valid upload token | Verified published version unchanged, or publication denied until safe promotion | NOT_RUN |
| CC-T12 | Kill worker after object write/verification/metadata commit | Durable reconciliation, one version/usage result, bounded orphan retention | NOT_RUN |
| CC-T13 | Refund/owner deletion races with finalization and delayed callback | Winner follows explicit transaction rule; deletion suppresses later publication | NOT_RUN |
| CC-T14 | Download expiry/revocation/network failure/low local space | No false recovery, signed token not logged, existing local file retained | NOT_RUN |
| CC-T15 | Renewal cancellation, expiry or quota-full while focusing | Focus/local work continues; disclosed cloud actions, no deletion/overage surprise | NOT_RUN |
| CC-T16 | Store restore on shared device/other Deep Focus account | No automatic ownership transfer; safe conflict/support, correct original store management | NOT_RUN |
| CC-T17 | Delete cloud version with jobs/tokens still pending | Deny new access, cleanup retry idempotent, local originals unaffected | NOT_RUN |
| CC-T18 | Restore database alone, then complete object+metadata recovery | Missing object is detected; only matched versions served after deletion suppression | NOT_RUN |
| CC-T19 | Account export/deletion with active/temp/retained cloud families | Inventory complete, rights process available, no resurrection/foreign files; access policy verified | NOT_RUN |
| CC-T20 | Android/iOS/portal si/ta/en, screen reader, large text, outage | Local/pending/cloud/failed states and recovery distinguishable; no clipped mandatory consent/action | NOT_RUN |

No passing document checker changes these statuses. Byte-storage correctness,
RLS, webhook verification, billing, native backup and legal policy require real
evidence. The next safe step is CC-01's exact policy/contract draft and R-01 local
resource format/import specification, not a bucket creation or checkout launch.
