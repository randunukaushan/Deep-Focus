# Deep Focus Product Assurance Baseline and Initial Assessment

## 1. Document Control

| Field | Value |
|---|---|
| Document owner | Deep Focus product owner / maintainer |
| Baseline date | 2026-10-06 |
| Assessment scope | Product-quality, mobile security, accessibility, privacy, platform compliance, and development evidence |
| Assessment basis | Public repository records and official framework/platform sources linked in Section 4 |
| Status | Initial baseline; open gaps remain |
| Classification | Internal working document |

## 2. Purpose and Boundaries

### 2.1 Purpose

This baseline defines how Deep Focus product assurance will be assessed and evidenced. It sets an Open Horizon mobile quality and security baseline for the product and records the first repository audit findings.

The product baseline uses recognized frameworks as assessment references. It does not claim that Deep Focus has been independently certified, formally audited, or proven conformant to every requirement in those frameworks.

### 2.2 Product and company assurance remain separate

Deep Focus product assurance covers the app, its data, its mobile builds, and its user-facing obligations. Open Horizon company assurance covers organization-wide quality and information-security management processes. Deep Focus records may support the company’s process evidence when the related process is actually followed, but they do not substitute for company-wide implementation or an external certification audit.

### 2.3 Assessment rules

- A documented intention is not proof that a control is implemented.
- A repository file or pull request can prove that a record exists, but does not prove the app passed a test.
- Device-only tests require dated records identifying the build, device, OS, steps, result, and tester.
- Any unresolved branch, build, platform, or product-scope ambiguity remains a recorded risk or action.
- Controls are marked Not Applicable only with a reason tied to the product’s current architecture and scope.
- ISO text is not reproduced. Requirements are paraphrased and mapped at a practical level.

## 3. Current Assessment Baseline

### 3.1 Repository snapshot

Repository: https://github.com/randunukaushan/Deep-Focus

The user-provided active technical baseline is the SDK 57 branch. On 2026-10-06, the branch head observed was upgrade/sdk-57 at commit 77682543addf1e5bab2d110ad4d979d8e887229a. Its package manifest specifies Expo 57.0.25, Expo Router 57.0.23, React Native 0.86.3, Reanimated 4.5.1, and Worklets 0.10.1.

The default main branch observed at commit c5f2d238b882b51a009c1a24d1014bcb9a77722a specifies Expo 56.0.21 and React Native 0.85.3. This means the default branch and the stated active SDK 57 baseline differ. This assessment uses upgrade/sdk-57 as its intended product baseline, while recording main as the repository default. Reconcile the branches before treating either as the release baseline.

### 3.2 Material repository findings

| ID | Finding | Evidence observed | Assurance treatment |
|---|---|---|---|
| DF-AUD-01 | Main and the active SDK 57 branch have different Expo/React Native dependency lines. | Main package.json vs upgrade/sdk-57 package.json. | Needs owner decision and branch reconciliation before release-baseline approval. |
| DF-AUD-02 | EAS project IDs differ between main and upgrade/sdk-57. | Main app.json uses 745d3338-b0a8-4f8c-93ea-f189bc98a6e0; upgrade/sdk-57 app.json uses 4f5a788d-8977-47d1-8d77-4915b35a945d. | High-priority configuration check. Confirm the intended EAS project in the Expo account and build history before creating release builds. No config was changed. |
| DF-AUD-03 | PR #14, “Harden focus session and break recovery”, is a draft PR from fix/focus-reliability-hardening. | https://github.com/randunukaushan/Deep-Focus/pull/14 | PR description lists lint, TypeScript, and Android device tests as still required. It is not evidence that those checks passed. |
| DF-AUD-04 | PR #14's head package.json is on SDK 56, while the intended baseline is SDK 57. | PR head package.json compared with upgrade/sdk-57 package.json. | The PR must be rebased or otherwise evaluated against the approved release baseline before its evidence is used for release acceptance. |
| DF-AUD-05 | No GitHub Actions workflow runs were returned, and the inspected repository tree contains no .github/workflows files. | GitHub Actions runs endpoint returned zero runs; repository tree inspection. | CI execution evidence is Pending. Local lint/doctor output needs retained logs or a reproducible capture record. |
| DF-AUD-06 | No tagged releases were returned by the repository releases endpoint. | GitHub releases endpoint returned an empty list. | No public release or store-submission evidence observed in this audit. |
| DF-AUD-07 | The package manifest defines lint but no test, typecheck, or security-scan script. | package.json on main and upgrade/sdk-57. | Automated test/security gates are not demonstrated in repository configuration. Verify local commands and consider adding repeatable gates. |
| DF-AUD-08 | Core focus state is implemented with timestamp-based projection and local file persistence. | src/features/focus/session-engine.ts and session-storage.ts on main; implementation should be rechecked on the selected baseline branch. | Useful implementation evidence; runtime reliability, file handling, privacy, and platform tests remain unverified. |
| DF-AUD-09 | Session records are written as JSON under the app document directory; the visible implementation does not encrypt these files itself. | src/features/focus/session-storage.ts on main. | Privacy/security review required. Assess the data sensitivity, OS sandbox behavior, backup behavior, and whether encryption or data minimization is warranted. |
| DF-AUD-10 | The current main session engine allows completion while remaining time is positive; PR #14 proposes preventing premature completion. | src/features/focus/session-engine.ts and PR #14 patch/description. | Record as a reliability/logic defect candidate. Verify against the active SDK 57 branch and capture fix/retest evidence. |
| DF-AUD-11 | The repository declares broad V1 scope, including accounts, AI, and other features, while implementation and dependency evidence do not yet establish the release scope or working backends. | docs/V1_FEATURE_SCOPE.md, package.json, source tree. | Perform a feature-by-feature scope-to-implementation audit. Treat undeveloped scope as planned, not as a product capability. |
| DF-AUD-12 | Expo Doctor 21/21 and commit e7ba3c1 are reported in project history but are not yet linked to a retained evidence artifact in this repository snapshot. | Prior project record; no attached machine-readable doctor log found during this audit. | Status Pending Indexing until the exact branch, command, date, and full output are attached or reproducibly recaptured. |

### 3.3 Initial conclusion

The repository demonstrates active product development, documented design/security/testing intentions, a distinct SDK 57 branch, and a draft reliability-hardening PR. It does not yet demonstrate a complete release assurance system, automated test suite, CI run history, independent mobile security verification, app-store declarations, or Android and iOS release acceptance.

No overall pass/fail claim is made from this initial desk review. The identified evidence gaps are converted into entries in the product evidence register, risk register, and test/release assurance document.

## 4. Framework and Source Register

The following sources were checked on 2026-10-06. Platform policy and online guidance can change, so release submissions must recheck the live requirements and record the review date.

| Source | Current reference checked | Use in Deep Focus |
|---|---|---|
| ISO/IEC 25010 | ISO/IEC 25010:2023, Edition 2, published 2023-11. ISO describes a product quality model of nine characteristics for specifying, measuring, and evaluating ICT/software product quality. https://www.iso.org/standard/78176.html | Product quality model; paraphrased into measurable product requirements and acceptance checks. |
| OWASP MASVS | Official OWASP Mobile Application Security Verification Standard site and current control taxonomy, including STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY. https://mas.owasp.org/MASVS/ | Security control framework. Pin the exact MASVS release/commit used for each formal assessment snapshot. |
| OWASP MASTG | Current official OWASP Mobile Application Security Testing Guide. https://mas.owasp.org/MASTG/ | Select platform-specific manual and tool-assisted verification procedures. |
| OWASP MASWE | Current official Mobile Application Security Weakness Enumeration. https://mas.owasp.org/MASWE/ | Threat/weakness prompts for mobile risk review and defect classification. |
| WCAG | WCAG 2.2, W3C Recommendation. https://www.w3.org/TR/WCAG22/ | Accessibility concepts and testable criteria adapted to app UI where relevant. A target level must be stated before claiming conformance. |
| WCAG2ICT | W3C Group Note, “Guidance on Applying WCAG 2 to Non-Web ICT”, published 2025-12-11. It is informative guidance, not a normative standard. https://www.w3.org/TR/wcag2ict-22/ | Interpret applicable WCAG concepts for non-web software; supplement with native platform guidance. |
| Android accessibility | Android Developers, “Build accessible apps”. https://developer.android.com/guide/topics/ui/accessibility | TalkBack, semantics, touch targets, contrast, text scaling, and accessibility testing on Android. |
| Apple accessibility | Apple Developer Accessibility documentation. https://developer.apple.com/documentation/accessibility | VoiceOver, Dynamic Type, contrast, motion, and platform interaction guidance for iOS. |
| Google Play target API | Google Play Console policy page checked 2026-10-06 states that new apps and updates must target Android 16 / API 36 starting 2026-08-31, subject to the listed form factors and extension process. https://support.google.com/googleplay/android-developer/answer/11926878 | Release gate. Verify the generated native target SDK in the actual release artifact and recheck policy before submission. |
| Google Play User Data | Google Play requires an accurate Data safety section, privacy policy, and account/data deletion paths when account creation is offered. https://support.google.com/googleplay/android-developer/answer/10144311 | Store privacy disclosures, SDK inventory, deletion workflow, and permission minimization. |
| Apple App Review | Current App Review Guidelines, including privacy policy disclosure and account deletion when accounts can be created. https://developer.apple.com/app-store/review/guidelines/ | iOS submission review and product policy checks. |
| Apple privacy details | App Store privacy details instructions. https://developer.apple.com/app-store/app-privacy-details/ | App privacy labels, including relevant third-party SDK behavior. |
| ISO 9001 | ISO 9001:2026, Edition 6, published 2026-09-16; current edition on the ISO page as checked 2026-10-06. https://www.iso.org/standard/88464.html | Company-level QMS mapping only. Deep Focus records can be supporting operational examples, not company certification. |
| ISO/IEC 27001 | ISO/IEC 27001:2022, Edition 3, plus Amendment 1:2024 as listed by ISO on 2026-10-06. https://www.iso.org/standard/27001.html | Company-level ISMS mapping; map product risk and secure development records to the company system without asserting product certification. |
| NIST SSDF | NIST SP 800-218, SSDF Version 1.1, published 2022-02. https://csrc.nist.gov/pubs/sp/800/218/final | Practical secure development practices for preparing, protecting, producing, and responding to software vulnerabilities. |

### 4.1 Version-control rule for evolving sources

For every formal security review, record the MASVS/MASTG/MASWE release, tag, or commit inspected. For policy sources, store the checked date, exact page URL, relevant requirement, and affected build/release. Recheck official platform rules before every store submission.

## 5. Open Horizon Mobile Application Quality and Security Baseline

### 5.1 Quality characteristics and measurable control intent

The internal baseline uses ISO/IEC 25010:2023 as a quality model, not as a product certificate.

| Quality characteristic | Deep Focus interpretation | Minimum evidence expectation |
|---|---|---|
| Functional suitability | The declared release scope works correctly for its intended user tasks. | Requirement-to-test traceability, core flow test records, defect disposition. |
| Performance efficiency | Screen response, timer display, startup, memory, and battery use are fit for declared supported devices. | Repeatable measurements with device/OS/build, method, result, and agreed acceptance limits. |
| Compatibility | Android and iOS behavior is verified across the declared platform/device range; app can coexist with common OS conditions. | Platform matrix, device tests, permission/link/notification checks when applicable. |
| Interaction capability | Users can understand, learn, operate, and access the app through supported input and assistive technologies. | Usability task checks, accessibility tree/screen-reader tests, text scaling and motion checks. |
| Reliability | Focus state, timing, completion, cancellation, persistence, and recovery remain correct through interruption and failure. | Deterministic state-transition tests plus real-device background/restart tests and defect retests. |
| Security | Data and interfaces are protected proportionally to the product’s actual threat model. | Threat/risk review, MASVS mapping, dependency/configuration checks, security test evidence. |
| Maintainability | Changes can be understood, reviewed, tested, and safely modified. | Small reviewed changes, clear architecture, static checks, change records, repeatable builds. |
| Flexibility | The app can be adapted to supported device/OS conditions and deployment configurations without unsafe changes. | Build configuration review, compatibility matrix, documented migrations and environment separation. |
| Safety | The app avoids foreseeable harm from misleading productivity signals, coercive behavior, or inappropriate pressure. | Product risk review, user-control and break behavior checks, feedback/complaint review. |

For each metric, the product owner must approve a measurable target before it becomes a release gate. Do not invent a passing threshold after seeing results. Maintain the method and target with the test case.

### 5.2 Assurance operating chain

Every material product control should be expressed as:

Requirement → Process → Owner → Control → Evidence → Metric → Review → Improvement.

Unimplemented controls remain actions. Evidence is retained against an immutable commit/build identifier wherever possible. Evidence records identify whether an item is a design statement, implementation observation, test result, review, store submission record, or external assessment.

### 5.3 Status vocabulary

- Pending: work/evidence has not yet been completed.
- Pending Indexing: an artifact or result is believed to exist, but its source/date/branch/build cannot yet be verified or retrieved.
- Pending Future: the control only becomes applicable at a later product phase.
- Captured: a retrievable artifact exists.
- Verified: a reviewer checked the artifact and its context; this status does not automatically mean the product passed.
- Needs Review: evidence exists but needs a decision, deeper review, or retest.
- Not Applicable: not applicable to the current assessed product scope, with reason and review trigger recorded.

## 6. Priority Actions from the Initial Audit

| Priority | Action | Completion evidence |
|---|---|---|
| P0 | Confirm the authorized release baseline branch and reconcile SDK 56 main, SDK 57 upgrade branch, and the SDK 56 draft PR. | Approved baseline record naming branch, commit, and PR disposition. |
| P0 | Confirm which EAS project ID is intended for the SDK 57 app; compare Expo account/project details and any available build history. | Dated owner verification and matching app.json/EAS record; no secret values included. |
| P1 | Re-run and retain lint, TypeScript, Expo Doctor, and any existing tests against the approved commit. | Full command logs tied to commit SHA, tool versions, date, and outcome. |
| P1 | Create test evidence for timer completion/cancel rules, pause/resume, persistence, app restart recovery, and background/foreground behavior. | Test records with build, device, OS, steps, expected/actual result, tester, and linked defects. |
| P1 | Inventory actual app permissions, SDKs, local files, account/backend/AI behavior, and data flows. | Approved privacy/data inventory checked against the selected branch and release build. |
| P1 | Define Android/iOS release configurations and verify generated native targets, signing, privacy manifests, declarations, and store forms. | Release build inspection and completed platform checklists. |
| P2 | Establish repeatable automated verification and CI evidence appropriate to project capacity. | Workflow/configuration, successful run, artifacts, and failure-handling record. |
| P2 | Perform accessibility review with VoiceOver and TalkBack on real devices and resolve defects. | Screen-reader test records and defect retests. |

## 7. Review and Change Control

Review this baseline when the release scope changes, a new SDK/dependency or data flow is introduced, platform rules change, an important defect/security event occurs, or before each major store submission. Preserve previous revisions and the exact repository commit assessed.

