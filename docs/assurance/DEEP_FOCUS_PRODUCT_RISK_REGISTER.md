# Deep Focus Product Risk Register

## 1. Document Control

| Field | Value |
|---|---|
| Owner | Deep Focus product owner / maintainer |
| Review date | 2026-10-06 |
| Scope | Product, engineering, privacy, security, platform, accessibility, and release risks |
| Status | Initial qualitative assessment; ratings require owner review |
| Classification | Internal |

## 2. Rating Method

Likelihood and impact are qualitative initial judgements, not measured probabilities. Priority reflects plausible user/product harm and release impact. Reassess after mitigation and whenever scope, data flows, architecture, dependency set, or platform policies change. Do not close a risk merely because a document exists.

## 3. Initial Risk Register

| Risk ID | Risk and cause | Likelihood | Impact | Initial priority | Existing evidence / control | Treatment and owner action | Residual status |
|---|---|---|---|---|---|---|---|
| DF-R-001 | Release work may target the wrong branch or Expo project because main is SDK56, upgrade/sdk-57 is SDK57, and their EAS project IDs differ. | Possible | Major build/release confusion, wrong project configuration, lost or misattributed build evidence. | High | Branch manifests and app configs inspected; no project was changed. | Product owner confirms release branch and EAS project in Expo account; document intended project; reconcile PRs; capture build metadata. | Open; Needs Review before release builds. |
| DF-R-002 | Focus sessions may be marked complete early or progress/rewards may be credited incorrectly if state transitions are not constrained and verified. | Possible | Misleading history/progress and loss of user trust. | High | Main session engine allows a completion transition without a minimum-duration guard; PR #14 proposes hardening. | Confirm active SDK57 implementation; define state invariants; automated transition tests; device verification; retest PR changes. | Open until code and tests are verified on release baseline. |
| DF-R-003 | Active session/history JSON may be exposed through backup, device access, diagnostics, or file handling because app-level encryption/backup behavior is not evidenced. | Possible | Exposure of behavioral/productivity data or session labels. | High | Local document-directory JSON implementation observed on main; effective OS sandbox/backup configuration not verified. | Inventory exact data and backup behavior per platform; minimize stored fields; decide encryption/exclusion based on threat model; inspect artifacts and test backup/restore. | Open. |
| DF-R-004 | State can be lost, duplicated, corrupted, or become inconsistent across app kill, OS suspension, disk errors, or repeated transitions. | Possible | Lost sessions or inaccurate history/progress. | High | Timestamp model and JSON history exist; no automated or device recovery results located. | Define atomic write/corruption recovery and idempotency requirements; execute fault/interruption matrix on Android and iOS. | Open. |
| DF-R-005 | Advertised V1 capabilities may exceed implemented or operational functionality, especially account, cloud, AI, and deletion flows. | Possible | Users may rely on features that do not work or submit inaccurate store statements. | Major | V1 scope documentation includes broader capabilities; implementation and backend status not fully mapped. | Perform screen/API/backend feature audit; label planned vs functional; make store declarations from shipped behavior only. | Open. |
| DF-R-006 | Third-party SDKs or future AI services may collect, share, or retain data not reflected in privacy notices and store declarations. | Possible | Privacy breach, inaccurate declarations, user harm, store rejection. | Possible-to-major | Direct dependency list and privacy documents are available; runtime SDK/data-flow inventory not complete. | Review lockfile, SDK telemetry and AI payloads; document processors/retention; minimize data; obtain required consent; update notices and store labels. | Open. |
| DF-R-007 | Account creation without working in-app and external deletion could violate platform rules and undermine user control. | Possible if account creation is shipped | Account/data cannot be removed as promised; store rejection. | Major | Account flows are in V1 scope, but implementation/backend/deletion evidence has not been verified. | Before enabling account creation, implement and test in-app deletion and external request path; cascade data deletion and document legitimate retention. | Pending Future until account creation is shipped; then release blocker. |
| DF-R-008 | Accessibility defects may prevent users relying on screen readers, larger text, reduced motion, or platform accessibility services from using core focus controls. | Possible | Exclusion, errors, inability to start/pause/end sessions. | Major | Project instructions require accessibility; no device accessibility test evidence found. | Run TalkBack and VoiceOver tests; audit labels, roles, focus order, contrast, scaling, targets and motion; log and retest defects. | Open. |
| DF-R-009 | SDK upgrades or platform defaults may introduce compatibility/performance regressions and unreviewed native permissions. | Possible | Crashes, broken navigation/timer, extra permissions, store issues. | Major | Expo 57 branch exists, but default main remains SDK56; no CI or cross-platform acceptance evidence. | Reconcile baseline; inspect generated Android/iOS projects and manifests; run supported-device matrix and release build checks. | Open. |
| DF-R-010 | Dependency vulnerabilities, compromised packages, or stale transitive dependencies may enter release builds. | Possible | App compromise, data exposure, service outage. | Major | package-lock.json and package manifests exist; no automated audit/SBOM evidence observed. | Add repeatable dependency review, vulnerability scan and lockfile change review; record exceptions and remediation deadlines. | Open. |
| DF-R-011 | Secrets, signing material, EAS credentials, or AI API keys could be committed or exposed through client config/logs. | Unassessed | Critical if a privileged credential is exposed. | Critical | No secret scan or release credential evidence located in this assessment. | Inspect repo history/config/CI and build credentials using approved secret tools; never put secrets in the app bundle; rotate exposed credentials; restrict access. | Open; inspect before external release. |
| DF-R-012 | Timer display can drift or recovery can misinterpret wall-clock changes, time zones, or malformed timestamps. | Possible | Incorrect duration/history and user mistrust. | Major | Timestamp-based projection observed; edge behavior is untested. | Define monotonic/UTC policy; test clock changes, invalid timestamps, timezone changes, background/foreground and boundary conditions. | Open. |
| DF-R-013 | Productivity insights, goals, streaks, or notifications may create unhealthy pressure contrary to the product philosophy. | Possible | User distress, reduced trust, harmful engagement design. | Moderate | Mission and AI rules prioritize sustainable habits/user control. | Review scoring, copy, notification frequency, break behavior and feedback; avoid coercive metrics; retain user control and opt-outs. | Open; review each relevant feature. |
| DF-R-014 | Store disclosure mismatch can occur if Data Safety/App Privacy answers, policy, app behavior, and SDK behavior diverge. | Possible | Rejection, forced correction, privacy harm. | Major | No store declarations or completed data inventory observed. | Generate disclosures only from verified shipped behavior and SDK inventory; independently cross-check before each submission. | Pending Future until store submission; preparation remains open. |
| DF-R-015 | No repeatable CI/test history increases chance a regression reaches testers or production undetected. | Likely based on inspected repository state | Major | High | Zero GitHub Actions runs returned; package manifest has no test/typecheck/security script; no workflow files observed. | Establish minimum repeatable local and CI gates; save results per commit; block release on agreed critical failures. | Open. |

## 4. Risk Review and Acceptance

### 4.1 Required review triggers

Review this register after a material feature/data-flow change, SDK or backend change, security/privacy defect, store-policy update, beta feedback trend, or before release approval.

### 4.2 Risk acceptance

Only the designated product owner may accept residual product risk. Security/privacy risks involving personal data or privileged credentials require documented rationale, mitigation, expiry/review date, and any necessary expert/legal review. Acceptance is not a substitute for mandatory platform or legal requirements.

## 5. Linked Records

- DEEP_FOCUS_EVIDENCE_REGISTER.md
- DEEP_FOCUS_PRIVACY_DATA_INVENTORY.md
- DEEP_FOCUS_MOBILE_SECURITY_AND_ACCESSIBILITY_ASSESSMENT.md
- DEEP_FOCUS_TEST_DEFECT_AND_RELEASE_ASSURANCE.md
