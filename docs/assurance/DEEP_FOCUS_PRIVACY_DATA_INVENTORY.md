# Deep Focus Privacy and Data Inventory

## 1. Document Control

| Field | Value |
|---|---|
| Owner | Deep Focus product owner / maintainer |
| Review date | 2026-10-06 |
| Scope | Data processed by the app, SDKs, backend, stores, support, and future AI capabilities |
| Status | Initial inventory; several data flows remain unverified |
| Classification | Internal; do not put real user data in this document |

## 2. Principles

Collect and retain only data needed for an explicitly approved user function. Explain collection and sharing when required, use safe defaults, limit permissions, set retention/deletion behavior, and avoid placing personal data in logs or analytics without a justified, disclosed purpose.

This inventory distinguishes repository-observed implementation from documented plans. It is not a privacy policy, legal opinion, or completed Google Play/Apple declaration.

## 3. Data Inventory

| Data ID | Data / example | Source | Purpose | Storage / recipient | Sensitivity | Current state | Retention / deletion | Disclosure / consent | Evidence / action |
|---|---|---|---|---|---|---|---|---|---|
| DF-DATA-01 | Focus session IDs, planned duration, start/pause/resume/completion/cancellation timestamps, elapsed durations | User actions and timer state | Resume session; show history/progress | Local app document directory JSON observed on main; SDK57 branch needs recheck | Personal behavioral data | Implemented on main; release baseline not confirmed | Define retention, history clearing, app uninstall/backup behavior | Disclose if collected/shared; no collection declaration yet | Inspect SDK57 storage, backup rules, file permissions and deletion UX. |
| DF-DATA-02 | Optional task name associated with focus session | User entry | Contextualize session/history | Stored with local session JSON on main | May include personal or sensitive free text depending on user | Implemented path observed; actual screen behavior to verify | User-controlled delete/edit and history retention needed | Explain local use and any sync/AI sharing if added | Test task-name persistence, logs, notification previews, export/delete. |
| DF-DATA-03 | Timer and break settings (focus duration, short/long break, cycle count) | User choices | Configure sessions | Local settings storage; exact implementation to verify per branch | Low sensitivity but user preference data | Product scope/documentation says settings; source inventory incomplete | Persist until user changes or clears app data; confirm actual rule | Store disclosure depends on remote collection/sharing | Map storage module and reset/delete behavior. |
| DF-DATA-04 | Tasks and goals, titles, due dates, progress | User entry | Planning and progress | Data model/docs describe these entities; active implementation/storage/backend status to verify | Personal productivity data; free text may contain sensitive details | Planned / partially implemented status unverified | Define export, deletion, retention and account deletion effects before launch | Must disclose any cloud/AI/analytics processing | Audit task/goal source, database/API and processor flows. |
| DF-DATA-05 | Assessment answers / productivity profile | User input | Personalization | Documented in V1 scope; processing/storage to verify | Potentially sensitive inference about behavior/wellbeing | Planned/unverified | Minimize and provide clear reset/delete path | Explain profiling and optionality; consent/legal review as needed | Establish field-level inventory and whether any health inference occurs. |
| DF-DATA-06 | Account identifiers, email, authentication/session tokens | User/account provider | Account access and sync | Sign-in routes are in scope; backend/provider/token storage not verified; visible package manifest lacks an obvious auth SDK | Personal data; credentials/tokens highly sensitive | Planned / unverified | Define account deletion, token expiry/revocation and retention before account launch | Privacy policy, platform disclosure and consent obligations apply | Trace actual network/auth implementation and secure storage; do not infer from screen routes. |
| DF-DATA-07 | AI prompt inputs, task/session context, generated recommendations | User-approved prompt/action | Optional planning/coaching | No verified AI provider/data flow in inspected dependency evidence | Can contain personal/free-text data | Planned / unverified | Provider retention and deletion must be verified before enabling | Clear just-in-time notice, purpose/recipient/retention and user confirmation | Threat model AI payload; keep API keys server-side; minimize prompt context. |
| DF-DATA-08 | Diagnostics, crash reports, analytics, device identifiers | App/SDK runtime | Reliability/support, if enabled | No direct telemetry implementation verified; transitive SDK behavior not fully inventoried | Potentially identifying | Unverified; do not assume absent | Set retention and opt-out where appropriate | Include collection by SDKs in store declarations and policy | Review lockfile, SDK privacy labels, build artifacts, network traffic and vendor terms. |
| DF-DATA-09 | Device/platform information, app version, OS, model | OS/SDK | Compatibility and diagnostics | May be processed by Expo/third-party SDKs; actual runtime usage unverified | Usually pseudonymous; can become identifying in combination | Unverified | Minimize; vendor-specific retention | Include where required by actual collection/use | Check Expo/EAS and all included SDK documentation and behavior. |
| DF-DATA-10 | Permissions and OS capabilities | User/OS | Only features requiring OS capabilities | Current app.json does not list explicit custom permissions; generated manifests and dependency-added permissions not inspected | Permission access can expose sensitive resources | Pending build inspection | Request only at point of need; revoke/disable feature safely | Just-in-time explanation and store declarations where applicable | Inspect generated Android manifest and iOS entitlements/privacy usage strings for release build. |
| DF-DATA-11 | Store and beta account data | Google Play / App Store Connect / TestFlight | Distribution and crash/feedback services | Platform-managed | Account/developer operational data | No submission evidence observed | Governed by each platform account and organization access controls | Follow platform terms | Capture submission and tester records; restrict access. |
| DF-DATA-12 | Support messages, feedback, defect reports | User or tester | Support and product improvement | No support system established in inspected evidence | May contain identifiers or screenshots with personal data | Planned/unverified | Define retention, redaction and access control | Tell users what information to include; avoid collecting unnecessary health/task details | Create safe support intake and evidence-redaction instructions. |

## 4. Data Flow Questions That Must Be Resolved

### 4.1 Before beta collection

- Which branch and build are testers receiving?
- Does any data leave the device during normal use, startup, crash reporting, or SDK initialization?
- What exact data is stored locally, and is it included in Android/iCloud backups?
- What sensitive permissions or entitlements are added by Expo modules or transitive SDKs?
- Can a tester clear individual sessions, all history, settings, and account data?
- Is crash/analytics collection enabled by default, and can it be disabled?

### 4.2 Before account, sync, or AI launch

- Identify controller/business owner, processors, data locations, subprocessors, retention periods, and deletion propagation.
- Define account deletion in-app and a functioning external deletion resource where platform rules require it.
- Confirm that AI calls contain only necessary fields and that secrets remain server-side.
- Keep generated content separate from verified user history until the user confirms an action.
- Complete privacy and jurisdiction review for intended users/markets.

## 5. Store Disclosure Controls

### 5.1 Google Play

Google Play’s User Data policy requires an accurate Data safety section covering collection, use, and sharing, including SDK behavior, and a privacy policy available in Play Console and within the app. If users can create accounts, provide a discoverable in-app deletion option and external deletion resource and delete associated account data, subject only to clearly disclosed legitimate retention.

Source checked 2026-10-06: https://support.google.com/googleplay/android-developer/answer/10144311

### 5.2 Apple

Apple requires an accessible privacy-policy link in App Store metadata and within the app, with data collection/use, third-party sharing, retention/deletion, and user requests explained. Apple privacy details should match actual behavior of the app and third-party SDKs.

Sources checked 2026-10-06:
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/app-store/app-privacy-details/

## 6. Review and Change Control

Review this inventory before beta, each store release, adding an SDK, enabling telemetry, account sync, AI, notifications involving user content, or changing retention/deletion. Keep the privacy policy and store forms synchronized with the verified build, not merely with planned documentation.
