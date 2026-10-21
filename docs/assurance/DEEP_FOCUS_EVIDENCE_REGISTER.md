# Deep Focus product evidence register

Reconciled 2026-10-22 against main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner. Authority/status meanings: [pack](README.md),
[DoD](../ai/DEFINITION_OF_DONE.md). Original DF-EV IDs retained; old descriptions
are preserved at [original PR head](https://github.com/randunukaushan/Deep-Focus/blob/87e995e27df3e383a6fb646883a2adbc3ebb64cb/docs/assurance/DEEP_FOCUS_EVIDENCE_REGISTER.md).
CAPTURED means retrievable artifact; PARTIAL/NOT_RUN describes underlying outcome,
not certification. Review is author/document review unless explicitly identified.

## 1. Indexed evidence

All current source observations are dated 2026-10-22 at main above. Historical
runs retain their own named candidate/date; they are not fresh PR15 executions.
No personal data/credentials belong here; sensitive evidence stays access-controlled.

| ID | Evidence / exact location | Availability | Outcome / context | Remaining verification / review trigger |
| --- | --- | --- | --- | --- |
| DF-EV-001 | [V1 scope](../V1_FEATURE_SCOPE.md), [decisions](../revision/01-REQUIREMENTS-AND-DECISIONS.md), [matrix](../V1_FEATURE_MATRIX.md) | CAPTURED | Approved scope and partial source inventory, not whole-V1 acceptance | Scope/candidate change; no silent removal of required surfaces |
| DF-EV-002 | [AGENTS](../../AGENTS.md), [AI rules](../AI_RULES.md), [DoD](../ai/DEFINITION_OF_DONE.md) | CAPTURED | Current instructions; not proof every historic change followed them | Each changed task/process |
| DF-EV-003 | [package](../../package.json), [lock](../../package-lock.json) | CAPTURED | Current SDK56; historical SDK57 manifest is not selected by this pack | Actual compatibility/advisory/build review; no vulnerability pass |
| DF-EV-004 | [app](../../app.json), [EAS profiles](../../eas.json) | CAPTURED / NEEDS_REVIEW | Main EAS text now matches historical SDK57 ID; remote ownership NOT_RUN | Exact project/account/signing/build evidence before release |
| DF-EV-005 | [Engine](../../src/features/focus/session-engine.ts), [tests](../../tests/domain/session-engine.test.mjs) | CAPTURED | Historical early-completion defect superseded in current main; actual task run in DF-EV-024 | Native/device/clock interactions; not original SDK57 retest |
| DF-EV-006 | [Session adapter](../../src/features/focus/session-storage.ts), [SQLite](../../src/features/storage/local-database.ts) | CAPTURED | Owner-scoped SQLite21/transactional terminal storage; no current JSON-adapter claim | Actual platform backup/protection/migration/disk acceptance |
| DF-EV-007 | [PR14 evidence](../revision/evidence/PR14-BREAK-RECOVERY-2026-10-21.md), merge 7916d81 | CAPTURED | 2026-10-22 report: 1776/1776, nine disk cases, type/lint/docs; self-review, scoped owner exceptions | Not independently reviewed or native-release verified; no inherited waiver |
| DF-EV-008 | GitHub CLI run list and main workflow tree inspected 2026-10-22 | PENDING | No listed Actions runs or workflow files; external CI unknown | Actual run URL/commit/artifacts if CI introduced |
| DF-EV-009 | [Domain](../../tests/domain/), [component](../../tests/components/), [navigation](../../tests/navigation/), [web](../../web/tests/) | CAPTURED | Suites exist; root test-script absence is not suite absence | Record actual command, source SHA, outcome and limits each run |
| DF-EV-010 | Historical Expo Doctor 21/21 mention in original baseline | PENDING_INDEXING | Original full contextual artifact not verified; no new doctor run | Locate original log or separately authorize reproducible recapture |
| DF-EV-011 | [Release gates](../revision/08-VERIFICATION-AND-RELEASE.md) Android acceptance | PENDING | Required current-candidate device lifecycle/accessibility NOT_RUN here | Build/device/OS/scenario/tester/defect evidence |
| DF-EV-012 | [Release guide](../DUAL_PLATFORM_RELEASE_GUIDE.md) iOS acceptance | PENDING | iOS is required V1, not optional/future; device/TestFlight acceptance NOT_RUN | Exact bundle ID, signing/build and actual device results |
| DF-EV-013 | [Privacy inventory](DEEP_FOCUS_PRIVACY_DATA_INVENTORY.md) | CAPTURED / PARTIAL | Source data-family inventory, not legal/store declaration | Actual SDK/network/retention/deletion and qualified review |
| DF-EV-014 | [Security mapping](DEEP_FOCUS_MOBILE_SECURITY_AND_ACCESSIBILITY_ASSESSMENT.md) | CAPTURED / PARTIAL | Assessment plan, not penetration/MASVS pass | Pinned procedures/results, qualified review and remediation |
| DF-EV-015 | [Accessibility plan](DEEP_FOCUS_MOBILE_SECURITY_AND_ACCESSIBILITY_ASSESSMENT.md) | CAPTURED / PARTIAL | Static semantics/contrast evidence only where linked; native/browser AT NOT_RUN | TalkBack/VoiceOver, keyboard, large-text, si/ta/en layout |
| DF-EV-016 | [EAS profiles](../../eas.json), [release guide](../DUAL_PLATFORM_RELEASE_GUIDE.md) | CAPTURED / PENDING | Profiles present, no named signed release artifact verified by this task | Access/signing/artifact provenance/rollback evidence |
| DF-EV-017 | Google Play disclosures/submission | PENDING | Private console and store approval NOT_RUN | Current policy, shipped-data forms, eligible testing and owner approval |
| DF-EV-018 | Apple/TestFlight disclosures/submission | PENDING | Private console and store approval NOT_RUN | Current SDK/signing/privacy requirements and actual review records |
| DF-EV-019 | [Defect dispositions](DEEP_FOCUS_TEST_DEFECT_AND_RELEASE_ASSURANCE.md) | CAPTURED / PARTIAL | Old source findings superseded where linked; release closure not inferred | Candidate reproduction/fix/retest/review, residual native/hosted gates |
| DF-EV-020 | Production monitoring/support/metrics | PENDING | No production effectiveness evidence inspected | Approved minimal telemetry, support/incident/recovery operation |
| DF-EV-021 | [OH crosswalk](OPEN_HORIZON_PROCESS_EVIDENCE_MAPPING.md) | CAPTURED / PROPOSED | Permission-gated mapping only; no licence/IP transfer/company adoption | Separate entity/data authority and company-operated records |
| DF-EV-022 | [October 6 audit](historical/DEEP_FOCUS_IMPLEMENTATION_AUDIT-2026-10-06.md), [current disposition](DEEP_FOCUS_IMPLEMENTATION_AUDIT.md) | CAPTURED | Original SDK57 desk review preserved, main dispositions separately dated | Refresh on relevant source/config change; no backdated test |
| DF-EV-023 | [Process evidence review](DEEP_FOCUS_DEVELOPMENT_PROCESS_EVIDENCE_REVIEW.md) | CAPTURED / PARTIAL | Current dated records indexed; complete historical trail not established | Bounded historical inventory; do not invent contemporaneous records |
| DF-EV-024 | [PR15 checks](../revision/evidence/PR15-ASSURANCE-RECONCILIATION-2026-10-22.md) | CAPTURED | Actual task outcome recorded there, not predicted by this table | Any changed artifact invalidates affected checks/review |
| DF-EV-025 | [PR19 matrix/audit checks](../revision/evidence/PR19-STATUS-RECONCILIATION-2026-10-22.md), merge 60eb231 | CAPTURED | Historical task report: 132 focused tests plus docs checks, self-review | Dated local scope only; no new full suite or release acceptance |
| DF-EV-026 | [PR13 release checks](../revision/evidence/PR13-RELEASE-RECONCILIATION-2026-10-22.md), merge ecd6d34 | CAPTURED | Historical 21 content tests/docs review; four surfaces and open store gates | Refresh candidate/official policy/account facts before submission |
| DF-EV-027 | [Next.js public/Portal source](../../web/src/app/), [content tests](../../web/tests/public-pages.test.mjs) | CAPTURED / PARTIAL | Public content plus partial Portal; not live hosting/auth/privacy/billing success | Full Website/Portal browser/provider/operational acceptance |
| DF-EV-028 | [Resources](../../src/features/resources/), [education](../../src/features/education/) | CAPTURED / PARTIAL | Local/default and bounded education source; cloud adapter intentionally disabled | Native resources, classroom trusted boundary, cloud/billing/privacy gates |
| DF-EV-029 | [Onboarding amendment/evidence](../revision/evidence/ONBOARDING-AND-AUTH-POLISH-2026-10-20.md) | CAPTURED / PARTIAL | Five-step language-first preference flow, not old 7–10-question readiness | Qualified locale/native/accessibility review remains open |

## 2. Capture and freshness template

For each new artifact record: stable ID; exact requirement/risk/test; immutable
source/candidate/build/environment; date/time; device/OS/tool versions; method
and predefined expected result; actual result PASS/FAIL/BLOCKED/NOT_RUN; performer;
reviewer and actual independence; artifact/access classification; redaction;
defect/fix/retest; refresh trigger and owner. Unknown stays unknown. Do not store
secrets or user content to make a record more complete.

Review on affected source/config/data-flow/scope change and before release.
Operational review cadence and retention are owner decisions, not invented
production defaults in this pack. No table entry accepts risk or releases a build.
