# Deep Focus product assurance baseline

## 1. Document control and authority

Reconciled 2026-10-22 against main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner/maintainer. Scope: all required V1 surfaces.
Status: **captured evidence inventory; product NOT_READY**.
See [pack authority](README.md); no new normative control or acceptance rule.
The [October 6 baseline](historical/DEEP_FOCUS_PRODUCT_ASSURANCE_BASELINE-2026-10-06.md)
is historical, not this assessment's selected branch.

This is a practical product quality/security/privacy/accessibility evidence
baseline, not an Open Horizon-owned product policy. Company QMS/ISMS evidence
and product acceptance are distinct. No certificate, complete standards
conformity, independent security audit or legal conclusion is claimed.

## 2. Current repository baseline

- main uses Expo `~56.0.23`, React Native `0.85.3`; the pack does not upgrade
  dependencies. SDK57 remains historical branch context, not release selection.
- Main app.json now has the same EAS project ID as the historical SDK57 snapshot.
  That resolves the observed text mismatch only; remote project ownership,
  signing permissions and build provenance were not checked.
- Android package remains `com.randunukaushan9.DeepFocus`; iOS icon/sign-in config
  exists, but `ios.bundleIdentifier` is absent. Exact owner-approved ID is OPEN.
- PR #20/#14 are merged; focus storage is owner-scoped SQLite21, not the old JSON
  session adapter. Original JSON import and retained sources remain governed by
  the October 6 migration decision; storage/backup protections are not certified.
- Engine rejects early completion; break recovery persists original deadline and
  session/pause binding. Automated suites exist even without a root test script.
- Auth adapters, backend/SQL modules and partial Next.js Portal source exist.
  This is not hosted provider, authorization, complete sync/privacy or billing
  acceptance. Do not reopen already selected providers or imply mock success.
- Read-only GitHub CLI on 2026-10-22 returned no listed Actions runs or releases.
  No workflow files are present at this baseline. This does not rule out external
  CI/builds or prove store status; none was inspected in private accounts.

Implementation details/dispositions: [audit](DEEP_FOCUS_IMPLEMENTATION_AUDIT.md).
Actual current task runs: [PR15 evidence](../revision/evidence/PR15-ASSURANCE-RECONCILIATION-2026-10-22.md).
Earlier PR14 full-suite/type/lint evidence remains dated, not rerun by this text.

## 3. Framework/source register — checked 2026-10-22

References support assessment planning, not automatic applicability or adoption.
Pin exact versions/commits in each formal assessment; mutable online pages are
not a promise that these are the latest versions at a later release.

| Reference | Observed source / use | Assessment limitation |
| --- | --- | --- |
| ISO/IEC 25010:2023 | [Official product quality model](https://www.iso.org/standard/78176.html), edition 2; nine quality characteristics | Quality reference, not a product certificate or reproduced standard |
| OWASP MASVS | [v2.1.0 tag](https://github.com/OWASP/masvs/releases/tag/v2.1.0) and [control catalog](https://mas.owasp.org/MASVS/) | Tagged reference and control families; no latest-tag or verified-control claim |
| OWASP MASTG / MASWE | [MASTG v2.0.0](https://github.com/OWASP/mastg/releases/tag/v2.0.0), [MASWE catalog](https://mas.owasp.org/MASWE/) | Select actual test/weakness IDs and pinned source at assessment time; no invented MASWE version or performed procedure |
| WCAG 2.2 | [W3C Recommendation](https://www.w3.org/TR/WCAG22/) | Web criteria; no whole-app conformance claim |
| WCAG2ICT | [11 December 2025 Group Note](https://www.w3.org/TR/wcag2ict-22/) | Informative non-web guidance, not normative requirements or native acceptance |
| ISO 9001:2026 | [Official edition 6 page](https://www.iso.org/standard/9001) | Company crosswalk only; no certification/adoption/transition deadline inferred |
| ISO/IEC 27001:2022 / Amd1:2024 | [Official standard](https://www.iso.org/standard/27001) and [amendment](https://www.iso.org/standard/88435.html) | Company ISMS context only; licensed text/qualified review for clause-level work |
| NIST SSDF | [SP800-218 v1.1 final](https://csrc.nist.gov/pubs/sp/800/218/final) | Secure-development reference, not proof of completed practices |
| Google Play | [Target API](https://support.google.com/googleplay/android-developer/answer/11926878), [User Data](https://support.google.com/googleplay/android-developer/answer/10144311) | Current policy inputs; actual generated artifact/account eligibility and disclosures remain gates |
| Apple | [Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App Privacy](https://developer.apple.com/app-store/app-privacy-details/) | Verify shipped SDK/data handling, deletion and candidate/platform requirements before submission |

Original `27001.html` source URL returned 404 during this check; use the official
extensionless page above. Historical source claims remain historical rather than
silently restated as freshly verified facts.

## 4. Product-quality evidence dimensions

| Dimension | Relevant evidence to link, not a new threshold |
| --- | --- |
| Functional suitability | Approved V1 requirement → implemented surface → actual acceptance test |
| Performance efficiency | Named build/device measurements and pre-approved limits; no invented benchmark |
| Compatibility | Separate Android/iOS and Website/Portal browser evidence |
| Interaction capability | si/ta/en, real assistive technology, text scale, errors/recovery and user tasks |
| Reliability | Timestamp/domain tests plus actual disk/process/lifecycle and clock behavior |
| Security | Existing security contracts, threat-based assessment, real trusted-boundary negatives and qualified review |
| Maintainability | Actual bounded diff, scripts, tests, review, reproducibility and retained failures |
| Flexibility | Supported-platform/build configurations and migration compatibility evidence |
| Safety | No coercion/false credit, Emergency exit, focus-safe ads and existing age/AI boundaries |

No new numerical target or risk acceptance is selected here. Existing DoD and
release gates take precedence over a proposed metric or mapping.

## 5. Evidence and next gates

Use [register](DEEP_FOCUS_EVIDENCE_REGISTER.md) and [risk inventory](DEEP_FOCUS_PRODUCT_RISK_REGISTER.md).
Distinguish captured artifact, PASS/FAIL/NOT_RUN outcome, review scope and owner
release decision. Review again on code/config/provider/data-flow/scope change
and before the next named candidate. Next dependency-safe work remains actual
native recovery/accessibility and qualified high-risk review, then bounded
hosted/surface integration under existing contracts; not an SDK57 upgrade,
retroactive historical pass or permission to release.
