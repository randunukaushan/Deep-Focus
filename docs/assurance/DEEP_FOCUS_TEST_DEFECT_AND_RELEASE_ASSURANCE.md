# Deep Focus Test, Defect, Release, and Post-Release Assurance

## 1. Document Control

| Field | Value |
|---|---|
| Owner | Deep Focus product owner / maintainer |
| Baseline date | 2026-10-06 |
| Scope | Functional/reliability tests, defect handling, platform/store release readiness, monitoring |
| Status | Initial plan and unverified checklist |
| Classification | Internal |

## 2. Test Evidence Rules

Define the expected outcome before testing. Each test result must include app commit/build, platform, device/OS, test data, exact steps, expected and actual results, tester/date, artifact, and linked defect. Keep device-only actions marked Pending until actually completed. Do not claim a test passed based on code inspection or an open PR description.

## 3. Functional and Reliability Test Matrix

| Test ID | Area | Scenario | Expected result / acceptance intent | Platform | Status |
|---|---|---|---|---|---|
| DF-T-001 | Setup | Configure focus, short break, cycle count, and long break; inspect preview. | Valid values persist according to product rules; preview matches settings; invalid values receive understandable feedback. | Android + iOS | Pending |
| DF-T-002 | Start | Start a focus session from valid setup, with and without task association. | One active session is created with consistent IDs/timestamps and correct planned duration. | Android + iOS | Pending |
| DF-T-003 | Timer accuracy | Let a session run across multiple display ticks. | Remaining time is derived from timestamps and does not depend on render count; agreed tolerance is set before release testing. | Android + iOS | Pending |
| DF-T-004 | Pause | Pause an active session and wait. | Focused duration stops advancing; paused duration advances; state remains paused. | Android + iOS | Pending |
| DF-T-005 | Resume | Resume a paused session. | No paused time is counted as focused; timer resumes from correct remaining time. | Android + iOS | Pending |
| DF-T-006 | Early completion | Attempt completion before planned duration. | Product rule is enforced; no completed record or verified progress/reward is granted prematurely. | Android + iOS | Pending; defect candidate DF-D-001 |
| DF-T-007 | Natural completion | Allow timer to reach zero. | Exactly one completion record and summary/progress update occur; no duplicate completion after rerender/reopen. | Android + iOS | Pending |
| DF-T-008 | Cancellation | Cancel an active session early. | Session is recorded as cancelled per approved product rule; completed progress/rewards are not granted. | Android + iOS | Pending |
| DF-T-009 | Persistence | Force-stop/relaunch during active and paused states. | Recoverable session is restored with correct state and remaining time or user receives safe recovery choice. | Android + iOS | Pending |
| DF-T-010 | Background/foreground | Background during active/paused session; return after intervals. | Timer and state reflect elapsed wall time and pauses according to approved semantics; no duplicate transitions. | Android + iOS | Pending |
| DF-T-011 | Process death | OS kills app during session or break; relaunch. | Valid state restores; invalid/corrupt state fails safely without crashing or false progress. | Android + iOS | Pending |
| DF-T-012 | Break recovery | Start break, background/force-close, reopen, resume/skip. | Break uses timestamp-based remaining time; break is associated with correct session and stale state is cleared. | Android + iOS | Pending; PR #14 proposal |
| DF-T-013 | Corrupt storage | Replace or simulate malformed/missing/stale local JSON in a test build. | App handles safely; no silent false completion; recovery is diagnosable and user data loss is limited. | Android + iOS | Pending |
| DF-T-014 | Duplicate history | Repeat completion/cancel transition or relaunch around write. | History contains one authoritative terminal result per session. | Android + iOS | Pending |
| DF-T-015 | Clock/time zone | Change time zone and system clock while a session is active; test invalid timestamps. | Product behavior is defined, consistent and safe; displayed dates localize without corrupting elapsed duration. | Android + iOS | Pending |
| DF-T-016 | Low-resource/device interruption | Exercise app under low memory, battery saver, screen lock, and OS suspension. | App recovers without falsely advancing paused work or losing terminal state. | Android + iOS | Pending |
| DF-T-017 | Accessibility | Run core setup/session/recovery with TalkBack and VoiceOver. | All actions, timer states, errors, and recovery choices can be operated and understood. | Android + iOS | Pending |
| DF-T-018 | Theme/text scale | Test light/dark, large text, display scaling, and reduced motion. | Critical content/actions remain visible and operable; motion is not required to understand status. | Android + iOS | Pending |
| DF-T-019 | Install/upgrade | Fresh install and upgrade from previous supported build with active/history data. | No unexpected state loss or migration corruption; fallback is documented. | Android + iOS | Pending Future |
| DF-T-020 | Offline/permissions | Test offline use and denied/revoked optional permission paths. | Core timer behavior works offline; denied permission does not block unrelated core flows. | Android + iOS | Pending |

Define quantitative tolerances and supported OS/device coverage before executing release acceptance; do not invent them from test outcomes.

## 4. Initial Defect and Fix Log

| Defect ID | Discovery | Description | Severity | Affected baseline | Fix reference | Verification / retest | Status |
|---|---|---|---|---|---|---|---|
| DF-D-001 | 2026-10-06 source audit | On SDK 57, the session UI exposes “Complete Session” for active/paused sessions and the engine permits completion while time remains; completed sessions feed goal progress. | High; confirmed source defect against the documented completion rule | upgrade/sdk-57 commit 77682543… | Draft PR #14 proposes a fix but targets main on SDK56; no SDK57 fix is present | Retest required: unit tests for active/paused/elapsed states, lint/type-check, Android device session completion and early-end scenarios; no results yet. | Open; fix and retest pending |
| DF-D-002 | PR #14 description | Active break state/recovery may be lost or become stale across app restart/session transitions; PR proposes persisted break state and cleanup. | Medium candidate | PR branch; SDK57 applicability unknown | Draft PR #14 | Android force-close/reopen and background/foreground retests listed but not recorded. | Open / Needs Review |
| DF-D-003 | 2026-10-06 repository review | Branch/EAS project mismatch may produce builds from an unintended project configuration. | High | main vs upgrade/sdk-57 | No change made | Confirm in Expo account/build history; compare exact project and build IDs. | Open |

| DF-D-004 | 2026-10-06 source audit | Session persistence helpers swallow file write errors and expose no save outcome to the UI; durability failure may be invisible. | Medium candidate; assess expected offline/recovery behavior | upgrade/sdk-57 commit 77682543… | No fix proposed | Inject/simulate write failure and verify recovery/user feedback; no test result yet. | Open / Needs Review |

### 4.1 Defect lifecycle

New → Triaged → Assigned → Fix in reviewed change → Automated/manual retest → Closed or accepted with documented rationale. Every closed defect has a reproduction record, fix commit/PR, retest evidence, and linked release if applicable. Security/privacy issues use the vulnerability/incident path where appropriate.

## 5. Release Readiness Checklist

### 5.1 Product and engineering

- [ ] Approved release scope is current and maps to working features.
- [ ] Release branch, commit SHA, app version, package/bundle identifiers, and EAS project are confirmed.
- [ ] Dependency lockfile is reviewed; dependency/security scan and exceptions are recorded.
- [ ] Lint, typecheck, automated tests, and Expo/configuration diagnostics are run and retained against the candidate commit.
- [ ] No unresolved release-blocking defects; retests are linked.
- [ ] Timer completion/cancel, pause/resume, local persistence, restart recovery, and background/foreground tests pass on declared platforms.
- [ ] Accessibility review is completed on Android and iOS, including assistive technology.
- [ ] Performance/crash checks use approved methods and release acceptance targets.
- [ ] Production configuration contains no debug endpoints, test accounts, secrets, or verbose sensitive logs.
- [ ] Signing access, EAS permissions, artifact storage, and rollback plan are controlled.
- [ ] Release notes, support contact, incident owner, and known limitations are prepared.

### 5.2 Android / Google Play

- [ ] Verify generated target SDK in the release artifact. As checked 2026-10-06, new Google Play apps and updates must target Android 16 / API 36 or higher from 2026-08-31, with stated exceptions/extensions. Recheck live policy at submission.
- [ ] Inspect generated manifest for permissions, exported components, backup rules, debug status, and intent filters.
- [ ] Privacy policy is publicly accessible, linked in Play Console and within the app, and matches actual data behavior.
- [ ] Complete and verify Data safety disclosures for app and included SDKs.
- [ ] If account creation is offered, verify discoverable in-app and external account deletion and deletion of associated data.
- [ ] Check store listing, content rating, target audience, ads, app access instructions, and declarations.
- [ ] Record internal/closed testing track, tested version/build, tester feedback, review decision, and staged rollout/rollback plan.

### 5.3 iOS / App Store and TestFlight

- [ ] Verify supported iOS versions, bundle ID, signing, capabilities, entitlements, privacy usage strings, and release configuration.
- [ ] Review current App Review Guidelines, including accurate privacy policy and in-app account deletion when account creation is supported.
- [ ] Complete App Privacy details based on actual app and SDK behavior; review required privacy manifests/reason declarations for included SDKs and APIs.
- [ ] Verify privacy policy is available in App Store metadata and easily accessible in app.
- [ ] Create TestFlight build and record device/OS testing, crash feedback, tester notes, and disposition of defects.
- [ ] Check store metadata, age rating, app access instructions, reviewer notes, and export/compliance declarations where applicable.
- [ ] Record review decision, release date, phased-release choice, rollback/recovery plan, and support contact.

### 5.4 Release decision

The release owner records Go / No-Go, evidence reviewed, open risks accepted, unresolved defects, supported platform matrix, and rollback trigger. No declaration of certification or full framework conformity may be made without a separate substantiated external assessment.

## 6. Post-Release Metrics and Review

### 6.1 Metrics to establish

Establish a baseline before choosing thresholds for:

- crash-free sessions and crash-free active users;
- focus-session completion/cancellation/recovery defects;
- data loss or duplicate history reports;
- startup/navigation failure rates;
- performance and battery complaints;
- accessibility defects and time to remediate;
- privacy/security incidents and time to contain;
- store review rejections and resolution time;
- support response and user-feedback themes;
- dependency vulnerability age and remediation.

Only collect telemetry that has been reviewed in the privacy inventory and disclosed where required. A metric is not a reason to increase engagement in ways that conflict with Deep Focus’s sustainable-productivity principles.

### 6.2 Post-release review

Within the product owner’s defined review window after each release, compare outcomes to approved targets, review complaints/incidents/defects, identify corrective actions, assign owners and due dates, and update risks, tests, disclosures, and future release gates.

## 7. Sources

- Google Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play User Data: https://support.google.com/googleplay/android-developer/answer/10144311
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
