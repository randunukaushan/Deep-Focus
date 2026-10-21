# PR #17 global education reconciliation — 2026-10-22

## Bounded task brief

Owner requests current-main/V1 reconciliation of global education/country-pack
direction, conflicts, necessary checks/review and main merge. Baseline main
`adebb0fdf9ade89a551c38d15ac22c4060c1b6e4`; original draft PR head
`40ff8928c4d2887a12ea8ea1f8a6a671f746186a`, branch
docs/global-education-country-packs. Original PR includes three documents, not
just its older two-file description: global direction, post-V1 list and UX backlog.

Risk MEDIUM: non-normative planning/scope cross-reference reconciliation only;
no education admission, security/privacy/ownership/safety rule, data schema,
provider, country activation or migration semantics change. Existing canonical
scope/decisions and qualified-review requirements retained exactly. Author
self-review sufficient for this bounded delta; no agent or PR14/20 waiver used.

Read: AGENTS/AI rules, execution/DoD/task template, map and engineering guardrails;
all original three PR files; V1 scope opening boundary/sections1–2/13/15 and
implementation foundations/web lane; owner September25/26/29, October6/14/20
amendments; education11 sections1–2; resources12 sections1–3; release32 current
amendment and scope definitions; color-system current authority; current matrix,
education-metadata/classroom-policy source and installed package scripts.
Existing snapshots/audits remain dated; source does not prove acceptance.

Allowed: GLOBAL_EDUCATION_COUNTRY_PACK_ARCHITECTURE.md,
PROPOSED_PRODUCT_FLOWS_AND_EDUCATION_FEATURES.md, POST_V1_FEATURE_SCOPE.md;
DOCUMENTATION_MAP.md, CHANGELOG.md, this evidence and a bounded document verifier
if needed. Preserve current-main resolution for overlapping post-V1 text.
No app/source/tests/config/SQL/dependencies, canonical V1/decisions/governance,
actual UI/navigation/onboarding, files/content import, credentials, spending,
accounts, legal conclusions, production, country rollout or real-minor access.

Acceptance E1 existing V1 Sri Lanka/general/teacher/bounded classroom/locales/
resources/cloud/four surfaces retained, not blanket-postponed. E2 future global
core/pack/institution/grading/dashboard/academic AI separated from current scope.
E3 five-step onboarding, current navigation/color/safety/AI authority preserved;
illustrations do not grant trust or infer learning outcomes. E4 pack separation,
optional metadata/no teaching content, explicit context/version/provenance and
market-order proposal remain planning, not schemas/legal or launch facts.
E5 links/tables/fences/conflict markers and docs/experience/assurance checks pass;
relevant existing education/resource/age/content tests run. E6 complete diff
self-review, no non-document delta, expected-head integration and tree identity.

Verification: installed Node docs/experience/assurance checkers, focused existing
education/classroom/teacher/resource/age plus web-content suites, bounded
Markdown and canonical/source identity checks, staged-vs-main whitespace.
No dependency installation, runtime build or private provider/device operation.
Rollback: scoped document revert; no user-data operation. Native/hosted/legal/
security/translation/store acceptance NOT_RUN; release NOT_READY.
Task status VERIFIED_FOR_DOCUMENTATION_INTEGRATION; actual results below.

## Actual verification and review — 2026-10-22

- Current main merged without textual conflicts; POST_V1 auto-merge retained
  current si/ta/en and required Website/Portal/resource clauses. Semantic stale
  blanket-post-V1 teacher/learner and approval claims were reconciled explicitly.
- `node --test --test-reporter=tap tests/domain/education-metadata.test.mjs tests/domain/classroom-policy.test.mjs tests/domain/classroom-local.test.mjs tests/domain/teacher-assignment-draft.test.mjs tests/domain/teacher-assignment-storage.test.mjs tests/domain/resource-types.test.mjs tests/domain/resource-storage.test.mjs tests/domain/resource-list-cursor.test.mjs tests/domain/cloud-resource-adapter.test.mjs tests/domain/age-eligibility.test.mjs tests/components/teacher-assignment-accessibility-locale.test.mjs tests/components/onboarding-context.test.mjs tests/navigation/navigation-contract.test.mjs web/tests/public-pages.test.mjs`
  PASS: 72/72, failures/cancelled/skipped/todos zero, 5756.6147 ms. Actual
  synthetic/local boundaries, not real classroom service, minor users, device
  accessibility, content correctness or live resource/provider evidence.
- `node docs/revision/check-docs.mjs` PASS: 670 Markdown inventoried, 979
  selected local links, 19 canonical/seven governance entries, 80/80 requirements.
- `node docs/revision/check-experience-contracts.mjs` PASS: 56 contrast pairs,
  27 routes and five aliases; document-only, not rendered acceptance.
- `node docs/revision/check-assurance-pack.mjs` PASS: 16 Markdown, 244 local
  links,14 current-pack tables and three historical bodies retained. Existing
  LF/CRLF historical-body checks and source/governance assertions unchanged.
- `node docs/revision/check-education-direction.mjs` PASS: six Markdown,
  139 local links, four tables and ten unique placement rows; fences/conflict
  markers, named baseline, current onboarding/navigation/age/scope caveats,
  unchanged canonical/source/config and post-V1 sections1–6 checked.
- `node --check docs/revision/check-education-direction.mjs` PASS. No runtime
  code/dependency or existing test/assertion changed. The new verifier checks
  planning documents, not education/security/production controls.

Author self-review completed over all three original/reconciled documents,
new verifier/evidence and routing/changelog, against named current main and
exact owner amendments. No actionable finding remains in this bounded delta.
Optional metadata is neither an implemented official pack nor automatically
postponed; broad teacher dashboards/grades/academic AI remain proposals. Existing
September29 sharing and October20 onboarding decisions are not reopened. The
market ordering is inherited research candidate direction, not a validated
commercial/academic/jurisdiction recommendation. No new external factual/legal
claims need to be invented; source/version/rights and qualified review remain
gates before actual country/pack use.

Review is self-review only; HIGH implementation acceptance still requires its
own qualified review. Prior development waivers do not apply here. Native and
browser rendering/assistive technology, qualified language/academic/legal review,
hosted authorization/sync/cloud/AI/commercial and store acceptance NOT_RUN.
No full runtime suite/typecheck/lint/Expo Doctor/build claimed for this docs task.
Product remains NOT_READY; merging a proposal is not implementation authority,
certification, real-minor access, country launch, spending or publication.

Final staging/whitespace, expected-head remote integration, candidate-tree
identity and actual original Windows checkout rerun are recorded separately in
the workspace outcome. Temporary synthetic logs remain untracked, not evidence
of private provider/device operations. No branch deletion or force-push intended.
