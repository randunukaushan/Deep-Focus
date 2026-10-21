# Deep Focus tests, defects and release assurance

Reconciled 2026-10-22 against main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner. [DoD](../ai/DEFINITION_OF_DONE.md),
[testing strategy](../TESTING_STRATEGY.md), [release08](../revision/08-VERIFICATION-AND-RELEASE.md)
and [web17](../revision/17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) remain authoritative.
This is an evidence index and candidate checklist, not changed test semantics,
new acceptance thresholds or permission to release. **Release NOT_READY.**

## 1. Stable functional cases and current evidence distinction

Cases below remain candidate/device obligations. Linked existing local tests
support only their executed scope; they do not set a row to device PASS.
Actual PR15 commands/results are [separate](../revision/evidence/PR15-ASSURANCE-RECONCILIATION-2026-10-22.md).

| ID | Topic / expected behavior under current contracts | Existing local evidence family | Actual Android/iOS acceptance |
| --- | --- | --- | --- |
| DF-T-001 | Setup validates supported duration/defaults/task links; full cycles not inferred | Setup/settings tests | NOT_RUN |
| DF-T-002 | Start one valid active record with consistent identity/time | Session engine/boundary tests | NOT_RUN |
| DF-T-003 | Timestamp projection, not render tick accumulation | Session engine tests | NOT_RUN |
| DF-T-004 | Pause excludes paused duration from focus | Session engine tests | NOT_RUN |
| DF-T-005 | Resume preserves validated paused/focus accounting | Session engine/break tests | NOT_RUN |
| DF-T-006 | Early completion rejected; early exit is cancellation | Engine/progression tests | NOT_RUN; old source finding superseded |
| DF-T-007 | Terminal history/local progression duplicate-safe | SQLite ownership/session boundaries | NOT_RUN; not trusted-server acceptance |
| DF-T-008 | Cancelled actual focus may count time goal, never completion count/rewards | Goal/progression tests, October 6 owner decision | NOT_RUN |
| DF-T-009 | Active/paused force-stop/relaunch restores safely | SQLite/startup synthetic tests | NOT_RUN |
| DF-T-010 | Background/foreground respects stored timestamps/state | Engine/controller substitutes | NOT_RUN |
| DF-T-011 | Process death across focus/break does not corrupt state | Disk SQLite/controller tests | NOT_RUN; Node restart is not mobile process death |
| DF-T-012 | Break deadline bound to owner/session/pause; no automatic resume | PR14 storage/controller tests | NOT_RUN; implementation merged, not a proposal |
| DF-T-013 | Malformed/unsupported SQLite or legacy import fails safely, no false success | SQLite validation/rollback tests | NOT_RUN; no destructive user-data edits |
| DF-T-014 | Repeated terminal writes do not duplicate history/credit | Session boundaries/progression | NOT_RUN |
| DF-T-015 | Clock/timezone/invalid timestamps follow current contracts | Engine/break/goal tests | NOT_RUN; no invented monotonic/cutoff policy |
| DF-T-016 | Low memory/battery saver/lock/OS suspension | No actual device evidence in this task | NOT_RUN |
| DF-T-017 | Core flows usable with TalkBack/VoiceOver | Semantic/static evidence is partial | NOT_RUN |
| DF-T-018 | Both themes, large text, reduced motion, si/ta/en | Experience checker/localized tests | NOT_RUN |
| DF-T-019 | Fresh install/upgrade migration preserves ownership/data | Synthetic SQLite migration fixtures | NOT_RUN; native install/upgrade required |
| DF-T-020 | Core offline/permission denial safe | Local boundaries only | NOT_RUN |
| DF-T-021 | Required Website truthful/public links/locales/accessibility | Public-content suite | Browser/hosted NOT_RUN |
| DF-T-022 | Required Portal identity/cache/settings/subscription/privacy | Partial source/local fixtures | Browser/provider/authorization NOT_RUN |
| DF-T-023 | Admitted classroom and local-resource/paid-cloud workflows | Local helpers, disabled cloud adapter | Native/trusted sharing/cloud/commercial NOT_RUN |
| DF-T-024 | Plan My Day exact confirmation, non-AI core, focus-safe ads | Planning/monetization boundaries | Actual provider/eligibility/grant/native NOT_RUN |

Predefine measurable candidate targets and supported platforms before executing;
do not invent tolerances from a passing result or mark required surfaces N/A.

## 2. Historical defect disposition — no blanket closure

| ID | Historical finding | Current disposition at named main | Remaining evidence |
| --- | --- | --- | --- |
| DF-D-001 | SDK57 early completion at 7768254 | Superseded in current main: engine rejects early completion, local regression tests exist | No original SDK57 fix/retest claim; native candidate completion/early-end acceptance open |
| DF-D-002 | Restart/stale break state | PR14 merged SQLite21 owner/session/pause-bound deadline recovery | Real Android/iOS force-close/reopen, account timing/Back and accessibility open |
| DF-D-003 | Branch/EAS identity mismatch | This pack retains main SDK56; main EAS ID now matches historical SDK57 text | Exact private project/signing/build provenance and iOS bundle ID still open |
| DF-D-004 | Old JSON helper silently swallowed writes | Current session adapter awaits/propagates storage errors and terminal transaction has rollback evidence | Actual disk/platform/UX failure and broader app review open |

Original finding bodies: [historical audit](historical/DEEP_FOCUS_IMPLEMENTATION_AUDIT-2026-10-06.md).
Do not claim new discovery or complete release closure from source disposition.
Future defect records need reproduction, affected candidate, fix reference,
actual retest/environment, reviewer and residual risk/owner disposition.
Qualified review and existing release-blocker rules cannot be waived by this log.

## 3. Candidate readiness — all unchecked, not this docs merge's checklist

- [ ] Named candidate and approved scope across Android, iOS, Website and Portal.
- [ ] Current installed type/lint/tests, advisories/config diagnostics, actual
  builds/artifact provenance and appropriately qualified review retained.
- [ ] Native lifecycle/disk/upgrade/clock/owner isolation and accessibility pass.
- [ ] Live trusted auth/sync/rewards/export/delete, two-owner/expiry/replay/failure
  tests where applicable; fixtures do not prove deployed service correctness.
- [ ] Web/Portal browser/provider/private-cache/privacy/commercial/operational
  acceptance; a landing page or successful mobile store review is insufficient.
- [ ] Admitted education/classroom/resources/AI/ads/locales delivered through
  their exact gates, or separately owner-approved deferral recorded.
- [ ] Real-minor access remains disabled unless qualified legal review and
  separately implemented controls authorize the exact pilot/release audience.
- [ ] Exact iOS bundle ID, EAS/signing/publisher access and separate signed
  Android/iOS artifacts verified; no credential values in evidence.
- [ ] Actual generated Android target/permissions/backup and iOS SDK/entitlements/
  privacy manifests satisfy then-current official platform requirements.
- [ ] Accurate privacy policy, Data Safety/App Privacy, account deletion, age/
  content/ads/reviewer access and listing claims reflect shipped SDK/data flows.
- [ ] Eligible Play testing/TestFlight/review evidence and release buffers;
  first Play publication cannot rely on managed publishing to hold a date.
- [ ] Technical, communication and operational readiness, monitoring/support,
  recovery/rollback and explicit owner release/publication approval recorded.

Use [dated release guide](../DUAL_PLATFORM_RELEASE_GUIDE.md) for checked official
sources, build/cost categories and open gates. December freeze/RC dates are
proposals, approved milestones unchanged, January 1 is not a review guarantee.
No paid test/build/account/store action is authorized by a checkbox.

## 4. Post-release plan — not operated evidence

Possible metrics: crash-free usage with explicit denominator, data-loss/duplicate
reports, recovery failures, startup/performance/battery, accessibility barriers,
security/privacy incidents, support/review rejection and dependency remediation.
Select exact targets, privacy-safe collection, retention, owners and review
windows before operation; do not assert a monitoring service exists.
Productivity/health outcomes cannot be inferred from local suite counts or
engagement metrics. Preserve failures and corrective-action effectiveness,
not just green screenshots.
