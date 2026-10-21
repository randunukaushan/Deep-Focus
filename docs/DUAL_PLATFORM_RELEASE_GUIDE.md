# Android, iOS, Website and Account Portal release guidance

Reconciled **2026-10-22, Asia/Colombo**, against main
`60eb2318027c314b74e9f7ed47958ee3e089a10a`. This is documentation, not a named
release candidate, live account check, build result or permission to publish.
Scope authority: [V1 scope](V1_FEATURE_SCOPE.md), dated
[owner decisions](revision/01-REQUIREMENTS-AND-DECISIONS.md) and
[January release map](revision/32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md).
Evidence/status: [feature matrix](V1_FEATURE_MATRIX.md), [core audit](V1_CORE_FOCUS_AUDIT.md)
and [this reconciliation](revision/evidence/PR13-RELEASE-RECONCILIATION-2026-10-22.md).

## 1. Four required release surfaces, not mobile-only V1

| Surface | Existing direction | Release evidence still required |
| --- | --- | --- |
| Android | Shared React Native/Expo source; separate signed Android `.aab` for Play production | Tested native build, supported devices, signing, store acceptance and owner release approval |
| iOS | Same mobile source; separate signed iOS `.ipa`, not an Android binary conversion | Approved bundle identifier, compatible build image/signing, TestFlight/device/store evidence |
| Public Website | Required January surface; isolated Next.js web project | Approved truthful content, localization/accessibility, hosting/domain/config, monitoring and explicit publication gate |
| Account Portal | Required authenticated surface, not replaced by a landing page | Supported identity/settings/subscription/privacy contracts and real authorization/cache/provider/recovery evidence |

The full productivity Web App, desktop and wearable experiences remain later;
this exclusion does **not** apply to the required Public Website/Account Portal.
Website/Portal do not automatically admit a browser focus workspace or classroom
LMS. Education, local-default resources, optional paid cloud, si/ta/en, AI/ads,
minor-access and commitment safety retain their existing boundaries. This guide
selects no deferral or new paid feature. Use the
[web runbook](revision/17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) and
[release gates](revision/08-VERIFICATION-AND-RELEASE.md); store approval alone is
not evidence that the Website/Portal or the whole release is ready.

## 2. Shared source, platform-specific artifacts and evidence

Develop mobile features in the existing TypeScript/React Native/Expo stack.
Fix portable defects in shared code; isolate genuine OS behavior behind narrow,
documented boundaries. Do not split codebases or upgrade SDKs to merge this guide.
The inspected package uses Expo SDK56; store submission's then-current build/SDK,
target API, signing and supported-device requirements still need verification on
the actual candidate. A dependency version does not prove store eligibility.

Windows can support frequent Android local/emulator/device checks. iOS native
tooling runs on macOS; an authorized EAS cloud build can use a macOS worker
without the contributor owning a Mac. EAS Submit can run from Windows, Linux or
macOS, but uploading is not TestFlight approval, public App Review or publishing.
Simulator artifacts and Expo Go previews are not signed production iPhone builds.
See [Expo iOS build process](https://docs.expo.dev/build-reference/ios-builds/)
and [iOS submission](https://docs.expo.dev/submit/ios/) (checked 2026-10-22).

Record each artifact's commit, version/build number, dependency/build image,
environment and test evidence. Android and iOS production candidates should map
to the same intended source revision; record justified platform-only differences.
Link Website/Portal revision/environment and shared-contract compatibility too;
do not infer that one native artifact contains or deploys the separate Next.js app.
Keep signing keys and provider secrets outside source/public bundles.

## 3. Dates, capacity and decision status

The owner-confirmed capacity is **25–35 hours/week**, including decisions,
review, testing, rework and release work; no extra contributor/agent assumed.
The [implementation plan](V1_IMPLEMENTATION_PLAN.md) owns dependency order.

| Checkpoint | Date | Status |
| --- | --- | --- |
| V1 scope/stability checkpoint | 2026-11-15 | Existing owner-approved target, not proof of completion |
| Beta | 2026-11-30 | Existing target; build/testing/eligibility prerequisites still apply |
| Feature-freeze planning option | 2026-12-01 | Original PR proposal; not a new owner-approved milestone |
| Release-candidate planning option | 2026-12-08 | Original PR proposal; contingent on actual evidence, not automatic readiness |
| Store submission | 2026-12-15 | Existing target, not the first day to investigate accounts/testing |
| Public V1 availability | 2027-01-01 | Existing Android+iOS+Website+Portal target; not a guaranteed same-day review outcome |

Use the freeze/RC options only as planning inputs until explicitly adopted in
the decision/release record. Calendar passage never closes an acceptance gate.
November preparation should establish authorized publisher/account/identifier,
signing and representative test access early enough for applicable store tests.
Schedule the Website/Portal lane alongside shared foundations, not after mobile
is complete. Reserve review, rejection-fix and renewed regression time in December.

If measured effort/dependencies show date risk, follow the existing owner-approved
January-first deferral process with user impact and a revised release map. Do
not silently drop Website/Portal, required AI/cloud placement, or weaken recovery,
security/privacy/accessibility/review. Report an infeasible safe scope rather
than promise the date or silently move mandatory features.

## 4. Validation progression — proposed work, not executed checks

1. Per feature: current installed typecheck/lint/tests plus frequent Android
   validation. Design for iOS safe area, keyboard, permissions, background clocks,
   storage, auth callbacks and native dependency differences from the start.
2. Periodically build/test iOS once the exact environment/credentials/budget are
   authorized; do not defer first native iOS validation until Android is complete.
3. Stabilize native candidates, then test actual Android and iOS interruption,
   process restart, account switch, save failure, clock, accessibility and Back/
   deep-link paths. Local SQLite/VM tests are not native lifecycle proof.
4. Use appropriate Play testing tracks and internal/external TestFlight. Gather
   release-candidate feedback and reverify fixes on the affected platforms.
5. Test Website public links/locales/claims/mobile browsers/keyboard and Portal
   identity, private-cache isolation, recovery, settings, supported subscription/
   privacy operations against real approved environments. No fake billing success.
6. Use selected cloud devices only when risk justifies them and after spending/
   data-upload authority. Select representative devices, bounded timeouts and a
   stop/retest budget; never upload private credentials/customer data by default.
7. Assemble technical, communication and operational evidence, qualified reviews,
   rollback/support/monitoring and exact owner release approval. A merged guide,
   passing check or successful store upload does not deploy or publish anything.

Physical-device evidence remains a release requirement when hardware is absent;
do not mark it passed or silently substitute a screenshot/emulator/cloud build.
Full matrix: [testing strategy](TESTING_STRATEGY.md),
[DoD](ai/DEFINITION_OF_DONE.md), release08 and web17 above.

## 5. Platform submission preparation — current official inputs

Checked **2026-10-22**; reverify in the actual authorized accounts and official
requirements at submission. These public facts do not prove this project's
account type, enrollment, production access, eligibility or approval.

- Google Play: verify publisher/account identity, package/signing and current
  target-API/device policy; prepare `.aab`, listing/media, privacy/Data Safety,
  permissions, content/age declarations and safe reviewer access as applicable.
  New personal accounts covered by the current rule need at least 12 opted-in
  testers continuously for 14 days before applying for production access; meeting
  that threshold is not automatic approval. Do not assume it applies or is waived
  for a planned company publisher. See [account setup](https://support.google.com/googleplay/android-developer/answer/6112435),
  [personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465)
  and [Android App Bundles](https://developer.android.com/guide/app-bundle).
- Google publishing: allow review/rejection buffer. **Managed publishing cannot
  be used for the first publication**; do not promise a first launch can be held
  for an exact date with it. Check account/app eligibility and supported release
  controls. See [Google publishing controls](https://support.google.com/googleplay/android-developer/answer/9859654).
- Apple: verify authorized publisher enrollment, permanent bundle ID and App Store
  Connect record/signing before finalizing builds. Prepare screenshots/metadata,
  age rating, privacy answers/policy, applicable export-compliance declarations
  and safe review access. External TestFlight needs beta/review information and
  approval of the first external build. See [enrollment](https://developer.apple.com/programs/enroll/),
  [TestFlight](https://developer.apple.com/testflight/) and
  [App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/).
- Upload/processing, beta review, production review, release selection and store
  availability are separate. Apple offers release options but visibility can lag
  a manual release; no exact simultaneous availability guarantee. See
  [Apple release options](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/select-an-app-store-version-release-option/).

## 6. Cost categories — dated inputs, no purchase authorization

| Category | Planning input checked 2026-10-22 | Boundary |
| --- | --- | --- |
| One-time | Google Play registration: USD25 | Verify local checkout/account requirements before any payment |
| Yearly recurring | Apple Developer Program: USD99/membership year; regional pricing can vary | Publisher/legal enrollment, local currency and eligibility remain separate |
| Optional subscription | EAS has limited free low-priority builds; paid plans add credits/limits | No unlimited/free-build promise or automatic upgrade; check actual plan |
| Usage-based | Eligible EAS paid-plan overages; selected AWS Device Farm runs | Budget/device minutes/timeouts and account eligibility first; promotional free allowances are not permanent entitlement |
| Separate web operations | Website/Portal domains, hosting and backend operational usage | Existing provider/hosting/commercial decisions govern; mobile fees do not cover all V1 surfaces |

Sources: [Google registration](https://support.google.com/googleplay/android-developer/answer/6112435),
[Apple membership](https://developer.apple.com/programs/enroll/),
[Expo plans](https://docs.expo.dev/billing/plans/) and
[AWS Device Farm pricing](https://aws.amazon.com/device-farm/pricing/).
Prefer existing authorized local tools/devices and scoped checks. Neither the
existence of a free tier nor this guide authorizes account creation, paid builds,
cloud uploads, tester recruitment, purchases or store submission.

## 7. Repository facts and open gates at 60eb231

- [app.json](../app.json) has Android package `com.randunukaushan9.DeepFocus`;
  `ios.bundleIdentifier` is absent. Preserve Android ID and obtain the exact owner-
  approved iOS value before dependent signing/store records. Do not invent it.
- An iOS icon path and Apple-sign-in/plugin configuration are present now; the
  original PR's blanket missing-iOS-icon concern is not a current source fact.
  Asset presence does not prove correct rendered icon/splash, entitlement or iOS
  safe-area/auth/build compatibility; those checks remain unperformed here.
- Source/config inspection cannot certify every dependency as cross-platform.
  Reassess actual native builds and plugins rather than reusing the September
  claim that no Android-only assumptions were found as a present compatibility pass.
- [web/](../web/) source includes public content and a partial Portal candidate.
  Required surface presence is not deployed/production-ready evidence. Actual
  hosting, identity/provider, privacy, billing, accessibility and ops gates remain.
- No production native build, TestFlight/Play track, store submission, hosted web
  deployment or real-device test was performed by this documentation task.
  Product release remains **NOT_READY**; choosing the iOS ID, publisher/account
  setup and proposed freeze/RC adoption are not silently resolved by merging it.
