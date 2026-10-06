# Monetization and Entitlements

Status: packaging proposal for ADR-005; merchant/prices OPEN in ADR-010. Owner confirmed modular “pay for what you need” direction, not exact plans, prices or a payment provider. This is not financial/legal advice or spending authority. The September 16 approval supersedes the historical fixed-five/ad-only rule: limited free AI, optional paid AI and unobtrusive launch ads are required directions; exact numbers/provider/eligibility remain open (section 6).

## 1. User value and packaging

ගෙවන්න හේතුව useful outcome එකක් විය යුතුයි: වැඩ නැවත පටන් ගැනීම පහසු කිරීම, realistic planning, structured learning, හෝ team coordination. Privacy controls, reliable saving සහ basic accessibility “premium quality” කියලා අගුලු දාන්න එපා යන එක මගේ නිර්දේශයයි. Modular model එක සෑම button එකකටම වෙනම ගෙවීමක් නොවේ.

| Proposed module | Independently useful value | Packaging boundary |
| --- | --- | --- |
| Core Free | Reliable focus, basic tasks/history, recovery, basic preferences, accessibility and privacy controls | Exact limits and sync allowance still need approval; no trial data hostage |
| Personal Pro | Advanced planning, projects/templates, deeper personal analysis and convenience | Do not imply any unbuilt feature is already purchasable |
| Learn | Own-resource study planning, revision organisation and optional reviewed curriculum metadata | No supplied papers/notes/videos; local default; exact study-feature packaging OPEN |
| Cloud Resources | Optional private cloud storage for user-selected resources | January placement CONFIRMED September 25; entitlement, quota, price/security and launch acceptance gates remain; no automatic upload |
| Team / Institution | Shared scoped workflows, seats, admin controls and supported reporting | Workspace-scoped license, not access to private personal data |
| AI allowance | Transparent eligible actions/usage with optional purchase/allowance | Core never requires AI; no silent overage spending |
| Optional bundles | Simpler price for a useful combination | Explain overlap; no forced purchase of unrelated features |
| Static cosmetic packs, if approved | One-off licensed appearance content | No random paid reward, fake scarcity or lost purchase after missed streak |

Return Ticket/Outcome Receipt free-versus-paid placement needs product validation; do not hide all differentiation until payment and then wonder why users cannot see its value. Test module comprehension and willingness to pay with users before final catalog. No numeric conversion/revenue claim is justified by the current research.

Education refinement: [Sri Lanka strategy §8](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) separates student, independent teacher and institute value. Teacher tooling can be an offer within the capability catalog without creating another identity or silently granting institutional authority. Define learner participation rights explicitly when a teacher/institute sponsors a class; do not spring an undisclosed learner paywall on assignment acceptance. Shared-device purchase/account restoration must not transfer another learner's license or records. Exact free/paid placement remains ADR-005, not approval from this research.

## 2. Catalog model

Separate `capability` (e.g. advanced planning) from `offer` (a commercial package), `storeProductMapping` (platform/storefront product ID), `license` (verified ownership) and `effectiveEntitlement` (current scoped capability). Do not scatter hard-coded plan names through UI/business rules.

Catalog is versioned and server controlled: offer ID/version, included capabilities, scope personal/workspace, billing period, purchase type, provider/storefront mapping, supported territory, published status and disclosure text. Prices/currencies come from the authoritative provider/display contract, not a stale hard-coded conversion. A draft offer cannot be purchased. Historic purchases keep their catalog reference so changing a bundle does not silently remove promised rights.

Recommended formula: `effective access = union(valid personal licenses, valid scoped organisation grants, explicitly valid promotional grants)`. An organisation seat applies only to its approved scope; it does not grant personal use automatically. Duplicate licenses do not multiply one capability. Quota pooling and AI unit stacking require separate catalog rules and fixtures.

## 3. Trusted entitlement lifecycle

Normalised states: `pending | active | grace | expired | revoked`; trial is an explicit attribute with approved limits. Cancellation of auto-renewal is distinct from immediate revocation: access normally follows provider-confirmed validity, not a local toggle. Refund/chargeback/revocation follow verified provider lifecycle events and applicable policy, not one universal assumed transition.

Purchase flow: user sees exact offer/period/total disclosure → provider purchase → client receives pending acknowledgement → trusted verification/inbox → durable license/grant → UI refresh. A client purchase callback alone never grants premium. A timeout after purchase shows Pending verification with restore/retry, not an invitation to buy again immediately.

Webhook inbox: verify signature against raw request as required; reject invalid/replayed input; store provider+event ID uniquely; acknowledge according to provider contract after durable receipt; process idempotently. Events can be duplicated/out of order: resolve using provider authoritative transaction/subscription state, not arrival time alone. Periodic reconciliation repairs missed delivery. Never log raw payment secrets or full sensitive payloads.

## 4. Cross-platform ownership and duplicate purchase prevention

Identify verified billing ownership separately from email matching. Restore purchases is an explicit authenticated flow; do not automatically bind another person's store purchase because two accounts used one device. Account-linking conflicts need a safe support path with proof, not client-side reassignment.

Before checkout show existing overlapping access and purchase origin. “Already available through your organisation until …” is better than an unnecessary second purchase. If the user intentionally buys independent personal access, explain scope. A web bundle does not automatically cancel an Apple/Google subscription; show the correct provider management route and consequences. Do not claim cancellation succeeded from merely opening store settings.

Apple groups and Google/web products need a sandbox-proven transition matrix: free→module, module→bundle, bundle→module, multiple modules, org seat added/removed, store→web overlap, renewal failure, grace, cancel, refund, restore and account merge conflict. Catalog complexity should be reduced if the purchase story is confusing; do not promise arbitrary combinations that cannot be represented safely by store billing.

## 5. Expiry, offline access and user data

Expiry disables new premium operations according to the approved offer but preserves existing user data and a readable/exportable path. Do not delete notes, curriculum work or outcomes on subscription expiry. Separate a premium export convenience from essential privacy/data-access rights.

Offline core remains available. Premium offline authorisation needs a server-issued cached entitlement with bounded validity, scope and tamper handling; client clocks/local flags are not trustworthy. The offline validity/grace window is OPEN and must be fixed before implementation. On uncertain entitlement show truthful pending state and preserve drafts; avoid trapping an active focus session behind a paywall. No expiry screen, ad or purchase prompt interrupts active focus/recovery.

## 6. Approved AI/advertising direction and remaining metering choices

Owner reply, 2026-09-16: limited free AI allowance + optional paid AI add-on is
approved; core works without AI; allowance amounts and prices come later. The
fixed five-action/ad-only access rule is superseded. Free allowance renewal,
billable-success definition, unit costs and grant lifetimes still need contracts.

The owner explicitly requires **unobtrusive ads in the initial release**, rejecting
the assistant's ads-free proposal. This does not select rewarded/banner/native
formats, placements, frequency caps, provider, targeting or ad-free paid benefits.
Optional rewarded access is a candidate; never treat advertising as the only
route to further AI use now that paid AI is approved. Paid AI by itself does not
silently promise all ads disappear. No actual advertising SDK/service is activated.

Guardrails retained: no ads during active focus or True Zen Break; no ad blocks
save/recovery/export/deletion; no private productivity/resource/phrase content
shared for targeting. Proposed additional placement rule: no forced interstitial
between Start and the running timer, no surprise autoplay/audio, and no background
ad shown immediately on returning to recovery. Exact placements/caps, accessibility,
consent and age-safe configuration must be reviewed before implementation. An
ad failure should omit the ad and preserve the task, not loop or block core use.

Ad revenue is a cost-recovery aim, not proof that costs are covered. Add measured
eligible impressions, fill, net receipts, SDK/consent overhead and AI/backend cost
scenarios to the later model. Never promise a revenue amount or solve uncertain
economics by increasing interruptions. Unknown/minor eligibility cannot default
to adult personalized advertising; unresolved policy blocks affected ad delivery,
not the user's core focus experience. A compliant release plan must reconcile
required launch ads with the actual target-age/privacy and provider constraints.

If AI metering ships: reserve usage before request, complete/debit only under an approved billable-success definition, release reservation on qualifying failure, deduplicate by request ID, bound concurrency and provider spending. User sees remaining allowance and exact action cost before confirm. Retry of the same failed/pending logical request must not double-charge. Provider token cost, user action units and account currency are different ledgers.

If rewarded ads remain: trusted provider verification, unique grant, expiry/scope, replay protection and child/ad policy review. A client “watched” event is not proof. No ads during focus/True Zen, no mandatory ad to recover saved data, no automatic AI use from receiving a grant. Never use the advertising model to justify collecting unnecessary student data.

## 7. Cost and commercial gate without premature prices

The September 25 owner decision requires optional paid Cloud Resources in the January release target, retaining local default and revenue/cost review before pricing. Do not publish an unapproved GB allowance, price or claim of service availability. Local storage does not eliminate other backend/auth/site costs; the approved offer must account for the additional service costs and risk. No paid infrastructure or checkout activation is authorised by this documentation change.

Track cost drivers rather than invent a budget: database compute/storage/backups/egress; functions/API requests; authentication/email/SMS; media; AI input/output/tool usage; payment/store fees and refunds; support/moderation; monitoring; domains/build accounts. Forecast low/base/high usage scenarios once active-user, session, sync and AI assumptions are known. Apply provider-side operational caps and alerts; exact limits require owner approval before production.

Before paid launch: business country/entity; merchant and payout approval; storefront/program eligibility; taxes/refunds/disclosures reviewed; catalog/store product IDs; sandbox verification; support responsibility; reconciliation/incident runbook. Budget amounts can remain deferred during design, but these are real release dependencies. No workaround using a false country or misleading product classification.

Acceptance M-01…M-08: forged client premium denied; duplicate purchase/webhook gives one grant; out-of-order events converge; cancel vs expire distinguished; account/store restore conflict safe; module/bundle overlap clear; AI retry charged at most once under approved rule; expiry preserves data and active focus. No payment or entitlement code has been implemented/tested by this revision.

## 8. Cloud Resources: cost-first subscription design

The [cloud admission/recovery packet](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md)
adds current official billing/storage research, six draft cards and twenty
NOT_RUN cases. It does not select a store exception, object provider or price.

Owner-confirmed direction: optional subscription for cloud resources, with the final charge determined after comparing receipts and costs. September 25 approves January release placement, not a specific price, GB tier, free trial, cloud provider deployment or production acceptance. Local resource use is independent of this subscription. Detailed selected-upload, quota and local-copy rules are in [12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md).

### Reference input snapshot, not a customer price

Supabase is an evaluated storage candidate alongside the selected backend. The official Pro listing consulted on 2026-09-14 shows the following USD inputs; recheck the chosen contract and billing region before approval. Included allowances are provider-plan pools, **not an allowance to give every Deep Focus subscriber**. [Supabase pricing](https://supabase.com/pricing).

| Input | Published reference |
| --- | --- |
| Pro base | From USD 25/month; compute/project changes may add costs |
| File storage | 100 GB included, then USD 0.0213/GB-month equivalent |
| Uncached egress | 250 GB included, then USD 0.09/GB |
| Cached egress | 250 GB included, then USD 0.03/GB |

Illustrative marginal arithmetic beyond included allowances: 1 GB-month storage plus 10 GB uncached downloads is USD `0.0213 + 10 × 0.09 = 0.9213`, **before** base allocation, compute, scanning, backups, support, payment deductions and other costs. It is not a retail-price recommendation. Storage size is measured in GB-hours/period-average usage, so current live bytes and billed storage are different measures. [Storage billing methodology](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size).

### Inputs to collect before approving an offer

| Input | Required definition / evidence |
| --- | --- |
| `N` | Paying subscriptions active in the model period; distinguish personal and later institution licenses |
| `S` | Period-average billable stored GB, including retained versions, temporary/orphan objects and chosen backup copies where billed |
| `E_u`, `E_c` | Billable uncached/cached egress from downloads, restores, previews, retries and approved sharing |
| `I_s`, `I_u`, `I_c` | Remaining included provider allowances after other app usage; count each pool once, not once per subscriber |
| `F` | Cloud-attributable share of base/compute/monitoring/support fixed costs; document allocation to avoid double-counting core costs |
| `V` | Additional API/processing/scanning/backup/restore variable costs; a missing vendor quote is unknown, not zero |
| `H` | Support, refund/chargeback handling and operational risk reserve; avoid counting refunds both here and in net receipts |
| `P`, `g` | Display price and effective net collection fraction after applicable store/provider fees, tax treatment, FX and refunds; use actual merchant/store terms |
| `m` | Owner-approved target contribution margin on net receipts; not silently assigned by Luna |
| Tier bounds | Storage capacity, per-file/type/count limits, transfer allowance, version/retention rules, concurrency and fair-use disclosures |

Approximate monthly planning formula, with provider-specific billing reconciliation required:

```text
C = F + max(0, S - I_s) × storageRate
      + max(0, E_u - I_u) × uncachedRate
      + max(0, E_c - I_c) × cachedRate + V + H

netReceipts = N × P × g
contribution = netReceipts - C
contributionMargin = contribution / netReceipts

If N > 0, 0 < g <= 1 and 0 <= m < 1:
  requiredDisplayPrice >= C / (N × g × (1 - m))
```

The formula is a planning model, not a forecast, profit guarantee or universal tax calculation. Model annual billing/cancellation/refunds with the actual recognition and settlement policy rather than assuming every month receives a monthly payment. If N or net receipts is zero, margin/price-per-payer is undefined; report the fixed operating exposure instead. Use one currency basis and documented FX assumptions; never choose an arbitrary LKR price by converting a single GB rate.

Evaluate at least three scenarios before choosing capacities or price: small paid cohort with high fixed cost per payer; expected storage/download usage; and heavy usage near published quotas plus restore/download bursts and refunds. Repeat with included provider allowances already consumed by other app workloads. Average storage utilisation is not a safe sole basis for selling a maximum allowance to everyone. Include churn: cancelled users may still consume storage/egress during the disclosed grace/export window.

Cloud copy and backup are different service promises. Verify whether each proposed provider backup covers object bytes as well as metadata, price any additional copies and test a real isolated restore before selling “backup”. Provider billing and app quota meters must reconcile; quota uses actual current stored/reserved bytes for admission while cost modelling uses the provider's billing basis. Neither a client counter nor an invoice average alone safely limits concurrent uploads.

### Subscription acceptance and cost controls

No unlimited storage, automatic paid overage or silent tier upgrade in the proposed initial cloud offer. A hard-cap plan shows remaining bytes and blocks new uploads when full without harming existing local work. Tier changes, included traffic, grace/download/export access and eventual retention must be disclosed and tested before sale. Exact numeric values remain OPEN; optional cloud cannot go live with placeholder values.

Paid entitlement is server-authoritative. Upload quota is reserved and finalised idempotently; reject forged/oversized/cross-user operations and clean abandoned uploads under a bounded policy. A paid personal library is private, not a public file-sharing service or class-content product. No advertising/download tracking of private resource content to subsidise storage.

Freeze an approved catalog only after provider/merchant eligibility, scenario inputs, acceptable downside exposure, target margin, privacy/region/retention, trial/refund handling and R-T12–15 security/billing evidence are ready. The owner chooses the final offer/price. January placement is required, but this document does not provision services, enable payment or guarantee the target is achievable before its gates pass.
