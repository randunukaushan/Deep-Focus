# January release scope and owner decisions

Date: 2026-09-25. Status: **owner choices recorded; implementation freeze and
independent review PENDING**. This is a release-placement map, not a claim that
features are built, tested or production-ready. [01](01-REQUIREMENTS-AND-DECISIONS.md)
owns approval; [V1 scope](../V1_FEATURE_SCOPE.md) owns canonical product scope.

September 26 clarification: desired product target **15+**, planned Sri Lanka
company publisher, resource concept accepted, intended AWS Device Farm plus
friends' Android testing. The later same-day reply also selects PDF/JPG/PNG,
website/video links and book/page references, with read-only in-app PDF/image
viewing. Exact restrictions, numeric limits and native adapter remain gated;
the earlier format-family uncertainty is historical. See 01's dated amendments and
[34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md); legal eligibility/actual company/
merchant/test evidence are not supplied by those choices. The five-answer table
below retains September 25's exact scope; read current missing gates in §4.

September 29 record: the owner's subsequent classroom/B replies add bounded
classroom sharing to V1 and prioritise January 1 with feature deferral if needed.
The five-answer table in §1 is historical; the current amendment directly below
it and updated map govern placement. Full productivity web remains later.

## Task brief — RS-01 (historical September 25 reconciliation)

- Outcome: reconcile the owner's five answers and map all 80 requirement families
  without treating platform approval as approval of every enterprise feature.
- Deliverable/phase: documentation and read-only document verification; reopened
  enterprise planning before V1 implementation. No application implementation.
- Approvals: September 25 reply to platform, audience, teacher, language and cloud
  questions, recorded precisely in 01. Earlier exclusions and safety rules remain.
- Risk: HIGH because incorrect release/age/cloud interpretation could admit
  unsafe paid or child-facing services. Independent qualified review PENDING.
- Read: AI_RULES, execution policy, Definition of Done, engineering guardrails,
  task template and documentation map in full; 01, 06, 12, 18; affected scope
  boundaries in V1/POST_V1, education 11 §1, release 08 §§1–3, README/owner overview
  and checker sources. Consult current official sources for the cloud supplement.
- Baseline: existing dirty canonical/revision work and two owner-modified source
  files preserved. Package has no test script. Document fixtures are not app tests.
- Allowed files: this new file; revision 00, 01, 06, 07, 08, 09, 11, 12, 18,
  README and check-docs.mjs; revision 10 product-boundary paragraph (scope
  expanded after the stale-clause search, historical research unchanged);
  docs/DOCUMENTATION_MAP.md, V1_FEATURE_SCOPE.md,
  POST_V1_FEATURE_SCOPE.md, V1_IMPLEMENTATION_PLAN.md, CHANGELOG.md. A separate
  scoped supplement may add 33 and its read-only checker/fixture and routing.
- Non-goals: app/SQL edits, dependencies, real files uploaded, provider selection
  beyond existing approvals, pricing, account creation, spending, legal advice,
  commit/push/deploy, additional agents, automatic model changes.
- Acceptance RS-A1: given the platform answer, retain Android+iOS+Website+Portal,
  with full productivity web later; do not expand to every future platform.
- RS-A2: given O/L/A/L/above, record the stage audience without inventing numeric
  minimum age, consent, legal eligibility or admission of every university feature.
- RS-A3: record initial independent-teacher organization and si/ta/en; leave class
  assignment/progress/cohorts later and actual translation QA unverified.
- RS-A4: paid cloud is January-required but user-optional/local-default; prices,
  quota, processors, billing, retention and deployment remain separately gated.
- RS-A5: all DF-001–080 appear once in the map; approved baseline/conditional/
  proposed/later/prohibited meanings remain distinct. No invented READY status.
- Verification: installed Node runs all existing document/contract checkers;
  coverage and targeted stale-clause searches; inspect complete scoped changes
  including untracked files, source fingerprints and git diff --check.
- Recovery: document edits only; retain prior dated approval records and owner
  changes. No migrations or destructive recovery operation applies.
- Stop/open: do not activate a policy-dependent feature with missing facts. Keep
  useful documentation moving; bring unresolved decisions back when owner returns.

## 1. Release envelope — September 25 history and current amendment

| Choice | Confirmed January 1, 2027 target | Not approved by that answer |
| --- | --- | --- |
| Platforms | Android + iOS, Public Website + Account Portal | Full productivity web, desktop, extensions, wearables or every enterprise feature |
| Education audience | Sri Lanka O/L, A/L and higher-stage learners | Numeric minimum age, guardian consent, younger-school targeting, official curriculum accreditation |
| Teachers | Independent personal teaching-work organizer | Student invitations, assignment distribution, learner progress dashboards, institution LMS |
| Languages | Sinhala (`si`), Tamil (`ta`), English (`en`) | Unreviewed translations or other launch locales; language does not select country/consent policy |
| Resources | Local default plus optional paid Cloud Resources at launch | Automatic upload, free unlimited storage, class sharing, prices/quotas or live provisioning |

### Current amendment — recorded September 29

The table above preserves what the September 25 answer did and did not approve.
Subsequent answers now add private class invitations, teacher work instructions/
deadline, explicit learner add-to-private-plan, intentionally selected completion/
progress sharing and teacher feedback to V1. This supersedes the teacher row's
invitation/assignment/progress exclusion only for that bounded subset. No full
LMS, general chat, file distribution or private timetable/notes/history access.
Detailed classroom contracts, eligibility and independent review remain gates.

January 1, 2027 takes priority over retaining every feature. If measured progress
indicates date risk, prepare a visible deferral list with effort/dependencies/user
impact and record the revised launch set. No particular cut is selected yet;
Website/Portal remain required and full productivity web remains later. Security,
privacy, accessibility, recovery, billing correctness and applicable review/store
gates cannot be traded away. If no safe scope fits, report that rather than promise
the date. This policy is not publication authorization.

Ordinary design/technical specification is delegated within the selected direction.
Ask the owner for spending, prices, legal facts and required independent review;
do not turn delegation into blanket ADR acceptance or deployment authority.

## 2. Complete requirement placement map

`RULE` = applies whenever the relevant feature ships, not a feature count.
`JAN-MUST` = explicit launch commitment. `BASELINE` = retained V1 requirement,
not implemented evidence. `CONDITIONAL` = existing checkpoint applies.
`CANDIDATE` = release choice still needed. `DIRECTION` = accepted destination,
specific release/subfeatures unapproved. `LATER` / `HOLD` are not launch admission.
Split wording in a row prevents broad capability families from being promoted.

| ID | Placement | Bounded meaning / contract route |
| --- | --- | --- |
| DF-001 | RULE | Enterprise vision first, then V1 freeze; 01 |
| DF-002 | RULE | Personal/Professional and Education branches, shared core; 03 |
| DF-003 | JAN-MUST | Sri Lanka education launch boundary; 11 |
| DF-004 | JAN-MUST | Public Website; 05/17 |
| DF-005 | JAN-MUST | Account Portal, not just landing page; 05/17 |
| DF-006 | LATER | Full productivity Web App specification retained; 05 |
| DF-007 | RULE | 25–35 owner hours/week includes QA/release; 08 |
| DF-008 | RULE | Budget later, no spending approval; 06 |
| DF-009 | RULE | Work alone, no agents; AI_RULES |
| DF-010 | RULE | Small testable Luna task packets, no bug-free guarantee; 07 |
| DF-011 | RULE | Approved blue/navy/coral direction; exact tokens/assets gated; 15 |
| DF-012 | DIRECTION | UI redesign accepted, exact expanded launch interactions gated; 15 |
| DF-013 | DIRECTION | Day/night reference art; licensed assets and optional motion; 15 |
| DF-014 | CANDIDATE | Expanded optional 7–10-question setup; existing baseline onboarding retained; 03/15 |
| DF-015 | RULE | Skip/default/redo without deleting work when personalization ships; 15 |
| DF-016 | JAN-MUST | General/Custom education without pack; 11/12 |
| DF-017 | RULE | Language independent of country, medium and curriculum; 11/15 |
| DF-018 | JAN-MUST + LATER | si/ta/en initially; broader verified packs later; 15 |
| DF-019 | CANDIDATE | Default/custom/off motivation; private and non-obstructive; 15 |
| DF-020 | DIRECTION + JAN-MUST | Modular packaging; optional paid cloud January, catalog/prices open; 06/12 |
| DF-021 | DIRECTION | Important integrations; no individual connector admitted by platform reply; 05 |
| DF-022 | RULE | Selected backend/auth and trusted ownership before production; 04/14/16 |
| DF-023 | DIRECTION | Focus-oriented collaboration, not launch messenger; 03/11 |
| DF-024 | RULE | Sinhala explanations with English technical terms; documentation |
| DF-025 | BASELINE | Auth/account/recovery/protected routes; 14/17 |
| DF-026 | BASELINE | Home and active-session recovery; 13/15 |
| DF-027 | BASELINE | Configure/start/pause/resume/complete/cancel focus; 13 |
| DF-028 | BASELINE | Durable timestamp recovery and terminal idempotency; 13 |
| DF-029 | BASELINE | Optional True Zen Break and summary; 13/20 |
| DF-030 | BASELINE | Task CRUD/archive/priority/due/goal links; 14/16 |
| DF-031 | BASELINE | Goals, supported targets and periods; 16/20/22 |
| DF-032 | BASELINE | Streak/XP/levels/achievements with trusted deduplication; 20/22 |
| DF-033 | BASELINE | History/filter/analytics with honest unavailable states; 16/20 |
| DF-034 | BASELINE | Theme, preferences and privacy/AI controls; 15/20 |
| DF-035 | BASELINE | Accessibility across all admitted surfaces; 15/08 |
| DF-036 | BASELINE | Durable offline work and account-isolated sync; local resources excluded; 13/16/27 |
| DF-037 | BASELINE | Plan My Day and exact user confirmation; 22–31; core works without AI |
| DF-038 | CONDITIONAL | Task breakdown / Review My Day Lite checkpoint unchanged; V1 scope |
| DF-039 | JAN-MUST | Limited free AI + optional paid AI + unobtrusive launch ads; exact policies open; 06 |
| DF-040 | DIRECTION | Professional personal value retained; team/org extensions not launch approved; 03 |
| DF-041 | CANDIDATE | Specialized developer/context/handoff workflow; no repository writes; 03 |
| DF-042 | CANDIDATE | Specialized freelancer/client/capacity workflow; 03 |
| DF-043 | CANDIDATE | Specialized creator workflow; publishing connector separate; 03 |
| DF-044 | CANDIDATE | Specialized founder/team objective workflow; 03 |
| DF-045 | JAN-MUST + CANDIDATE | O/L/A/L own-resource organization; reviewed metadata optional, younger-school targeting not selected; 11/12 |
| DF-046 | DIRECTION | Higher-stage audience included; module/GPA/lab/thesis-specific features not automatically approved; 11 |
| DF-047 | JAN-MUST + LATER | Personal teacher organizer plus bounded private invitations/assignments/selected-progress/text-feedback V1; full LMS and broader assessment later; 11/12 |
| DF-048 | DIRECTION | Institution roles/seats/reporting; not initial teacher organizer; 11 |
| DF-049 | CANDIDATE | Optional reviewed country/curriculum metadata; no supplied teaching content; 11 |
| DF-050 | CANDIDATE | Standards integrations; no version/vendor selected; 05/11 |
| DF-051 | CANDIDATE | Workflow packs and reviewed templates; 03 |
| DF-052 | CANDIDATE | Smart Capture/OCR with preview; no automatic resource AI ingestion; 03/12 |
| DF-053 | CANDIDATE | Recall/revision/mistake journal; time is not mastery; 11 |
| DF-054 | CANDIDATE | Unified Capacity Planner; exact differentiated launch slice open; 03/24 |
| DF-055 | CANDIDATE | Skills/practice/project evidence, not qualifications; 03 |
| DF-056 | CANDIDATE | Return Ticket/Context Bridge; selected-copy handoff only; 03 |
| DF-057 | CANDIDATE | Outcome Receipt; user-confirmed, not AI proof; 03/12 |
| DF-058 | CANDIDATE | Intent-aware shielding; OS capability/safety proof required; 19 |
| DF-059 | CANDIDATE | Graceful Return/recovery suggestions; no health predictions; 19 |
| DF-060 | CANDIDATE | Focus Passport/team agreements; explicit sharing/revocation; 03 |
| DF-061 | LATER | Voice/long-form AI/coaching/weekly planning; 05 |
| DF-062 | LATER | Auto-replanning; existing exact-confirmation contract not bypassed; 24 |
| DF-063 | LATER | Expanded licensed soundscapes; existing baseline audio not removed; POST_V1 |
| DF-064 | LATER | Expanded wellbeing/journaling; baseline optional break unchanged; POST_V1 |
| DF-065 | LATER | Expanded projects/digests/insights; essential data rights not postponed; 28/POST_V1 |
| DF-066 | LATER | Expanded cosmetics/noncash rewards; baseline achievements unchanged; POST_V1 |
| DF-067 | LATER | Challenges/leaderboards/events require safety review; POST_V1 |
| DF-068 | DIRECTION | Private rooms/chat/accountability not admitted by the separate DF-047 bounded-classroom decision; 03/11 |
| DF-069 | LATER | Public community with moderation gates; 03 |
| DF-070 | DIRECTION | AI provider adapter architecture; exact initial provider/configuration open; 05 |
| DF-071 | CANDIDATE | Scoped external AI API/MCP; no unrestricted tools; 05 |
| DF-072 | DIRECTION | Calendar and subsequent connectors, per-connector consent/approval; 05 |
| DF-073 | LATER | Desktop/extensions/tablet-specialized/wearables; mobile continuity baseline retained; 05 |
| DF-074 | LATER | Enterprise SSO/SCIM/advanced controls; basic privacy/security required now; 04 |
| DF-075 | RULE + LATER | Launch locales/accessibility now; additional RTL/regional/widgets later; 15 |
| DF-076 | RULE | No missed-work XP penalties or wagers; 19 |
| DF-077 | RULE | Configurable ordinary exit, separate Emergency exit; no unbreakable promise; 19 |
| DF-078 | RULE | No unverified health/brain-energy/burnout predictions; 19 |
| DF-079 | HOLD | No brainwave inference/efficacy promises; preference audio only; 19 |
| DF-080 | HOLD | No universal notification interception/bypass promise; 19 |

This is 80-family **coverage**, not 80 equally sized features or a completion
percentage. Android/iOS and paid cloud are exact approval subdecisions, not new
IDs invented to inflate the existing register. Baseline clauses may contain
additional details; this routing table does not replace their complete contracts.

## 3. Dependency-safe execution lanes

1. Test harness and current-data inventory; agree exact local persistence,
   credential/recovery and identity policies. Repair reproducible core defects.
2. Durable timer/tasks/goals/offline boundaries, then trusted backend/sync and
   account isolation. Use existing CR/BE/BX cards and preserve canonical order.
3. Shared mobile navigation/UI and si/ta/en end-to-end accessibility; independent
   student/teacher personal organizer and local resource import/recovery.
   Bounded classroom work follows core/private planning and trusted identity/
   membership/authorization foundations, explicit sharing contracts and review;
   add negative cross-class/revocation tests before real learner use. It is not
   a shortcut around those foundations or a dependency for personal planning.
4. AI planning uses exact proposals, durable saved-plan lifecycle and PL-01–05
   evidence; it never becomes necessary to start focus or organize manually.
5. Paid-cloud lane: local identity/resources → merchant/catalog/entitlements →
   private object authorization/quota → upload/download/recovery → subscription
   expiry/erasure/restore → both-store and portal integration. R-05 is not READY
   merely because January placement is approved.
6. Website/Portal content and UI can be specified in parallel conceptually; the
   same owner supplies all hours. Billing/privacy operations require real shared
   services. No fake payment, deletion or subscription-success UI.
7. Ads, real-device/browser/security/locale/billing QA, operational drills and
   submission gates. Integration/QA is work, not a final automatic checkbox.

## 4. Still needed before release freeze

| Gate | Known | Still missing; safe documentation can continue |
| --- | --- | --- |
| Release detail | Four surfaces, stage audience, personal teacher plus bounded classroom, 3 locales, paid cloud; January-first deferral policy | Concrete classroom cards, measured estimates, any specific deferral set; conditional AI checkpoint |
| Age/consent | Desired product target 15+ (September 26) | Age assurance, consent, guest/account/AI/ad/storage eligibility and qualified review; target is not legal authorization |
| Localization | si/ta/en approved | Reviewers, terminology, fonts/fallback, large-text/VoiceOver/TalkBack and portal coverage evidence |
| Commercial | Cloud + paid AI/launch ads; planned Sri Lanka company publisher | Actual incorporation and merchant/payout eligibility; products; price/quotas/renewal/refunds and ad configuration |
| Cloud/privacy | Local default, selected private upload | Object provider/configuration, region, scanning, quota ledger, retention, backup/restore, data-access/deletion policy |
| Engineering | Selected stack and draft contracts | Exact adapters, harness, migrations/RPC/client code and independent review |
| Operations | January target, owner 25–35 hours/week | Support owner, monitoring, RPO/RTO, staging evidence, store approvals and explicit publication authorization |

As of September 25: 98 days = 14 weeks = **350–490 gross available hours** to
January 1 at the stated rate. This is availability arithmetic, not measured work
remaining or a guarantee. Earlier 405–700-hour estimates did not separately
estimate paid cloud/ad integration and cannot demonstrate this larger scope fits.
This September 25 arithmetic is historical, not today's remaining capacity.
Re-estimate after the first measured vertical slice, including added classroom
work and review. Apply the documented deferral policy; no silent feature cut or
invented implementation/release percentage.

## 5. Evidence boundary

Capacity refresh, **October 3, 2026 (Asia/Colombo)**: January 1, 2027 is 90
calendar days away, or 12 weeks and 6 days. At the owner's 25–35 hours/week,
that is approximately **321–450 gross hours**. Calculation: `90 / 7 * 25`
and `90 / 7 * 35`. These hours cover documentation, implementation, review,
testing and release work together; they are not all coding time. No measured
delivery velocity or external-review/store turnaround has been established.
Re-estimate after the first completed vertical slice before deciding whether
the selected launch scope fits. No feature deferral is selected by this update.

The [paid-cloud supplement](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md) now expands
the new mandatory lane; its six cards are DRAFT and twenty runtime cases NOT_RUN.

Acceptance and checker results will be recorded in 09 after execution. No app,
native, SQL, payment, upload, legal or store-submission test is performed by this
map. No task is promoted to READY and no production service activated. Independent
review of consequential privacy/security contracts remains REVIEW_PENDING.
