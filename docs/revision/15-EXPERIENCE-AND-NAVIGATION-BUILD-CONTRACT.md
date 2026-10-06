# Experience and Navigation Build Contract

මෙහි අරමුණ ලස්සන screenshot එකක් පමණක් නොව, Skip/Back/offline/save failure/
recovery ඇතුළු සම්පූර්ණ user flow එක Lunaට පැහැදිලි කිරීමයි. App code හෝ
production UI වෙනස් කර නැත. Colours ගණනය කිරීම device accessibility test එකක් නොවේ.

Status, 2026-09-16: **navigation and brand direction approved; detailed values and
new interaction contracts proposed for review**. [01](01-REQUIREMENTS-AND-DECISIONS.md)
owns approval. The [screen map](../V1_SCREEN_MAP.md) owns mobile routes, [03](03-PRODUCT-AND-EXPERIENCE.md)
owns product behavior, [13](13-CORE-RELIABILITY-CONTRACTS.md) owns session reliability,
and [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) owns the proposed backend slice.
This file refines L-09/10; it does not promote all enterprise modules into January.

## 1. Artifacts and implementation baseline

- [Navigation manifest](contracts/mobile-navigation.json): five ordered tabs,
  27 full-screen destinations, 24 required/three conditional, five URL aliases
  including root. Required assessment route does not mean mandatory answers.
- [Candidate token sheet](contracts/experience-tokens.json): exact proposed
  opaque sRGB colors, intended pairs, spacing, targets and motion durations.
- [Read-only checker](check-experience-contracts.mjs): contrast arithmetic and
  navigation/screen-map agreement. It does not import or change app code.

Current `src/app/(tabs)/_layout.tsx` still defines Home/Focus/Analytics/Rewards/
Profile. Current `src/app/onboarding/assessment.tsx` has three in-memory
questions, not the proposed durable questionnaire contract. The existing blue
`mintPrimary` value in `src/theme/tokens.ts` is an owner working-tree edit, not
an approved final semantic token migration. Preserve that file and
`src/features/home/home-screen.tsx` changes when implementing later.

## 2. Navigation, ownership and session continuity

| Tab | First useful view | Empty / unavailable behavior | Primary action |
| --- | --- | --- | --- |
| Home | Own recoverable session first; otherwise one next-action card | No fake plan, graph or greeting-generated achievement | Resume or Start Focus, never both competing as primary |
| Plan | Own tasks/goals and approved planning tools | Create first task; optional education/project templates only when enabled | Add task or continue selected plan |
| Focus | Current session or editable setup | Offline-ready configuration; no AI/network prerequisite | Resume or Start |
| Progress | Completed/pending history with explicit period | Explain no records yet; no fabricated positive comparison | View history; Rewards is nested |
| Profile | Preferences, account/privacy and support | Signed-out controls explain their real availability | Contextual account/settings action |

Use approved labels even when personalization suggests different templates. Roles
do not rearrange tabs, grant access, or change the identity. Map labels to stable
localization IDs, not array positions. Tabs may retain their ordinary navigation
state, but an account/workspace change clears data-bearing views from the previous
identity before showing the new one. Private previews must not flash on startup.

Startup order: hydrate permitted identity/namespace → validate that identity's
local active record → recovery if necessary → optional onboarding or main view.
Network refresh must not block a locally permitted ongoing session indefinitely;
expired remote auth disables remote operations, not invents a different identity.
Guest availability remains an ADR-009/006 policy gate, not authorized by this flow.

Old URLs use replacement redirects in the screen map; preserve and validate
`sessionId`. An invalid/not-owned object returns a neutral unavailable state with
a safe parent destination; never display another user's cached data. Back from
a session screen changes presentation only. End early is a separate explicit
command with confirmation and reliable persistence under [13](13-CORE-RELIABILITY-CONTRACTS.md).
Visiting Focus twice must not instantiate two timers. A mini Resume entry reads
the same session state; it is not a second engine or clock.

Notification/deep links must pass through identity and object validation, not
trust embedded task/user identifiers. A legacy alias may redirect before auth,
but it must not load private data before the destination guard. Do not auto-open
an unrelated message, upsell, assessment or new plan over an active session.

## 3. Personalization data and defaults

The ten-step question outline in [03 §3](03-PRODUCT-AND-EXPERIENCE.md) remains the
proposal. Stable keys, not displayed text or question indexes, identify answers:
`roles`, `intent`, `friction`, `availability`, `preferred_windows`,
`focus_preference`, `experience_density`, `learning_context`, `accountability`,
`review`. Conditional questions are recomputed from current answers; hidden stale
answers cannot be applied without appearing in review. The progress denominator
reflects applicable steps, not a claim that every person must answer ten questions.

Proposed stored contract:

```text
PersonalisationDraftV1
  schemaVersion: 1
  namespaceId: authenticated owner/local namespace resolved by trusted session layer
  revision: positive integer
  currentStepId: stable applicable step key
  answers: validated optional values from the question schema
  updatedAt: UTC instant

PreferenceValue<T>
  value: T
  source: default | questionnaire | explicit
  updatedAt: UTC instant

ApplyPreferencesCommand
  commandId: stable UUID
  expectedPreferencesVersion: positive integer
  expectedDraftRevision: positive integer
  selectedChanges: exact reviewed key/value pairs only
```

These types are proposals, not existing exports. Before a cloud settings API is
READY, define the complete field JSON Schema and server ownership/version checks;
the backend prototype does not yet implement settings/assessment endpoints.
Keep optional answers local by default until their approved synchronization and
retention policy is specified. Never send answers to AI, analytics or an employer
because the user pressed Apply. Do not infer health, personality or ability scores.

Default bundle proposal: system theme; General/Custom education; 25-minute focus
and optional five-minute break; simple density; default motivation. No social
sharing, permission grants, AI transmission, paid module, country-pack download
or notification schedule. Existing explicit preferences win. Locale is selected
independently; unsupported system locale falls back to a reviewed supported locale
with a visible selector. Do not advertise a locale before its release gate passes.

[20](20-SETTINGS-PROGRESS-AND-UNITS.md) separates the current 25-minute setup/
5-minute break baseline from unapproved notification/AI/feedback defaults and
details device/account precedence, truthful storage failure and unit adapters.
Use its freeze sheet; accepting defaults is never consent or an OS grant.

## 4. Questionnaire state machine and write behavior

| State / action | Required result | Failure / interruption rule |
| --- | --- | --- |
| Loading draft | Render neutral loading and a safe exit | Failure offers Retry or continue with defaults; no false saved claim |
| Answer / Next | Validate only this answer; snapshot immutable draft revision | Serialize writes; an older delayed save cannot overwrite a newer revision |
| Skip question | Preserve unrelated answers; clear skipped field from proposed changes | No fabricated default answer attributed to the user |
| Back | Previous applicable question; retain selections | No automatic Apply or reset |
| Use defaults at introduction | Show/use defaults, preserving explicit language/accessibility choices | No grant of legal consent, payment or sharing |
| Skip remaining midway | Explicit choice: keep draft for later or discard draft | Does not apply partial answers; storage failure disclosed |
| Review | Show old/new values and selectable replacements | Existing explicit values unselected for replacement by default |
| Apply | Validate latest draft + expected preferences version; one atomic local transaction | Keep draft until settings commit succeeds; failure stays on review |
| Duplicate Apply / lost response | Stable command ID; one committed result | Re-read durable state before retrying; no repeated permission prompts |
| Concurrent settings edit | Conflict with latest values and refreshed diff | Never silently overwrite with stale assessment defaults |
| Restart after commit | Read applied settings and completion marker | No re-application because draft cleanup/UI navigation was interrupted |
| Redo from Profile | New draft based on current settings | Old sessions/tasks/memberships unchanged |
| Reset personalization | Review selected preference reset and separately offered draft removal | Never equivalent to delete account/all tasks/history |

An in-memory continuation is allowed only with an explicit temporary/unsaved
notice and a documented default-mode path. It cannot be described as durable.
Do not clear the old committed preferences before successfully saving replacement
values. Sign-out/account switching invalidates in-flight draft writes; do not
complete a delayed callback into a different user's namespace. The exact draft
retention/sync policy must be settled before cloud persistence, not guessed here.

## 5. Languages, country packs and presentation

Separate `uiLocale`, `contentLanguage`, `timeZone`, optional `curriculumPackId`
and billing/legal country. Changing one changes only that field and presentation
derived from it. Language preview uses translated messages; Save is atomic and
reversible from Profile. Missing essential/legal translations block support for
that locale; do not silently mix machine-translated consent into an approved UI.
Country packs are optional organizational metadata; General/Custom remains usable
without download. Pack removal preserves own work, IDs and readable old labels.

Use stable message IDs, plural/date/number formatting and complete sentences,
with review screenshots. Custom motivational text is not automatically translated.
Start with platform font families that can render the supported scripts; validate
Sinhala/Tamil shaping and fallback on actual Android/iOS builds before approving
fonts. Large text uses wrapping/scrolling rather than shrinking user text or
hiding controls. Long task names may truncate in a compact card only when the
detail and accessible label retain the whole name. Never truncate safety messages.

## 6. Personal motivation contract

Proposed resource shape: `id`, private namespace, `text`, integer `order`,
`createdAt`, `updatedAt`, positive `version`. Settings contain
`mode: default | personal | off` and enabled placements. Proposed limits:
50 active phrases per person, 1–240 Unicode code points after trimming outer
whitespace; plain text only, no markup/embeds. Preserve internal spacing/script;
reject over-limit input with a visible counter, never silently cut a grapheme.
Reject unsafe control characters while preserving necessary script-joining marks.
IDs are stable UUIDs, not phrase text. These limits are proposed design defaults.

Placements: Home encouragement area, setup footer and summary footer. Active
session footer is separately opt-in; its selected phrase is snapshotted once at
session start. No rotation, refresh animation or mid-session quote notification.
Off hides motivational decoration without hiding errors or functional help.
Default mode uses reviewed/licensed or original non-shaming copy. No claims that
missing a day ruins progress, no punishment, pseudo-medical diagnosis or streak debt.

Add/edit/delete/reorder flows preview the exact text and persist transactionally.
On failure, keep the previous committed collection and show Retry. Reordering must
have move-up/down controls as well as any drag gesture. Delete offers confirmation
or a persisted undo strategy specified before implementation; do not promise Undo
when the state cannot be recovered. If the last personal phrase is removed, retain
personal mode with a useful empty state offering Add, Default or Off; do not switch
mode silently. Phrase edits do not rewrite previous session snapshots. Off and
explicit deletion hide/remove an active decorative snapshot too; historical
snapshots, if stored at all, require a clear privacy/deletion policy. Prefer not
persisting phrase text into session history because the feature does not need it.

Personal text stays on device unless an approved explicit preference-sync policy
is accepted. No third-party analytics events containing phrases, no automatic
public sharing or AI processing. A sponsored seat gives no employer access.

## 7. Visual tokens, components and assets

Blue arcs/path, coral centre, Deep Focus wordmark and “Focus on What Matters.”
follow the owner's [brand references](evidence/Brand-Reference.md). This task does
not create replacement logos or generate bitmap assets. Reuse licensed/original
light and dark landscapes only after asset ownership and export QA are recorded.

The candidate token JSON is **not installed or owner-approved exact values**.
Use semantic roles, not historic color names such as `mintPrimary`. Migrate
aliases only in an approved implementation with a complete reference inventory.
Avoid a broad token rename that discards the user's Home/theme working changes.

Text pairs target at least 4.5:1, including secondary/muted/action/status text;
normal-text criteria are used even for large labels to simplify this contract.
Do not round ratios up to pass. Alpha, gradients, imagery and actual rendered
states require separate evaluation.[^1] Interactive boundaries and focus indicators
target 3:1 against their adjacent surface; decorative borders are not substitutes
for usable input/control outlines.[^2] Coral is decorative branding here, not
approved white-on-coral body text or a color-only danger cue.

Suggested spacing steps are 4-based, as listed in JSON. Radii and motion timings
are proposed exact values, not established by the static screenshots. Minimum
product targets: 44 pt iOS, 48 dp Android, 44 CSS px web, including usable hit areas
without overlapping neighbors. The web minimum is our stronger target, not a
claim that WCAG 2.2 AA universally requires 44 pixels; SC 2.5.8 uses 24 CSS pixels
with stated exceptions.[^3] Follow platform sizing and text scaling, not screenshot
pixels copied one-for-one. Candidate motion is 120/180 ms, zero nonessential motion
when reduced motion is enabled. Ambient scenery is off during focus by default.
Disable nonessential interaction animation when requested.[^4]

| Component | Concrete behavior | Required state/accessibility notes |
| --- | --- | --- |
| Primary button | One main action per local area; explicit verb | Default/pressed/focus/disabled/loading; duplicate command guarded in controller; loading announces once |
| Form field | Label persists independently of placeholder | Error linked to field; preserve input after server failure; keyboard never covers actions |
| Choice group | Stable option IDs and explicit selection | Radio or multi-select semantics; skip separate; not color-only |
| Task/goal card | Title, meaningful status, optional due label | Open and complete are separate targets; offline/pending badge truthful |
| Session clock | Timestamp-derived text and state from domain layer | Announce state changes, not every second; progress ring has textual equivalent |
| Progress view | Metric, period/timezone and provenance | Empty/error/pending states; chart has accessible text/table alternative |
| Motivation card | Ordinary selectable/readable text as appropriate | Off/empty/long-script states; decorative image hidden from accessibility tree |
| Sheet/dialog | Named purpose, explicit safe close | Focus moves in and returns to trigger; escape/Back handling; no irreversible default |
| Feedback region | State-changing success/error message | Polite announcement except genuinely urgent errors; no repeated toast storm |
| Theme surfaces | Approved role pairs in both themes | System change handled; no flash of wrong/private content; custom theme not a paid accessibility requirement |

Text stays real UI text, not baked into landscapes. Use decorative scenes on
welcome/Home or optional session footer, not behind dense lists/forms. Static
fallback appears immediately if an asset fails; no remote image needed to start
a session. Respect reduced motion and silent audio defaults. No parallax/ring
loop competing with the timer. Asset/battery/startup measurements on a low-end
Android and supported iPhone are still required, not performed by token arithmetic.

## 8. Bounded Luna implementation cards

All cards remain DRAFT pending relevant exact values, test tooling and scope.
Approved navigation does not approve every palette value, preference schema,
extra January capability or a dependency install. Apply [07](07-LUNA-IMPLEMENTATION-PLAYBOOK.md)
READY rules per card; an unrelated billing decision need not block a local UI test.

| Card | Outcome / inspected or proposed boundary | Prerequisites and evidence |
| --- | --- | --- |
| UX-01 | Approve token sheet and reuse inventory; inspect `src/theme/tokens.ts`, `src/constants/theme.ts`, `src/components/ui` | ADR-003 exact values/fonts; preserve dirty edits; contrast pairs and component-state review |
| UX-02 | Implement navigation aliases/tab composition in `src/app/(tabs)`, existing history routes and internal link callers | Screen-map contract; Expo 56 Router compatibility; cold/warm links, Back and account tests |
| UX-03 | Implement validated versioned draft/preferences repository; proposed non-UI personalization module | Approved storage adapter, field schema, age/guest policy, transaction tests; no remote transmission |
| UX-04 | Connect optional questionnaire/review/reset in `src/app/onboarding` and Profile/settings | UX-03; skip/redo/conflict/save/crash scenarios; no fabricated profile scores |
| UX-05 | Locale dictionary boundary and independent country-pack selector | ADR-008 reviewed release locales; font/plural/date/large-text evidence; no automatic syllabus install |
| UX-06 | Motivation CRUD/settings and stable placement; proposed feature module, reuse cards | Approved limits/privacy policy; keyboard/screen-reader/reorder/error tests |
| UX-07 | Apply approved visuals to Home/Plan/Focus/Progress/Profile composition | UX-01/02; CR session invariants; exact asset/license inventory; no unrelated engine rewrite |
| UX-08 | Device/browser interaction and accessibility pass with evidence | Installed builds, supported locale matrix, screen-reader/keyboard/reduced-motion, no private screenshots |

Split UX-07 by destination when implementation exceeds one focused session.
Before coding, convert each folder boundary to an explicit allowed-file list and
real test commands. Do not invent file paths/test scripts as existing tools.
Mock data is restricted to labelled test fixtures, never a shipping success path.

## 9. Required acceptance scenarios — not performed tests

| Test | Given / when / expected evidence |
| --- | --- |
| UX-T01 | Fresh authorized entry; skip optional questions → useful Home without social/AI/notification consent |
| UX-T02 | Two rapidly saved answers with delayed first write → latest draft wins after restart |
| UX-T03 | Storage failure at Next → input retained, unsaved notice and truthful default continuation |
| UX-T04 | Apply commits then app closes before navigation → one settings update and no duplicate side effect |
| UX-T05 | Explicit settings edited during assessment → version conflict and review, no overwrite |
| UX-T06 | Redo changes one selected preference → old tasks/sessions/memberships and other overrides unchanged |
| UX-T07 | Change roles hides learning question → hidden stale pack answer is not silently applied |
| UX-T08 | Switch Sinhala UI to English → curriculum, medium, timezone and billing country unchanged |
| UX-T09 | Missing legal translation/unsupported locale → not advertised as supported; clear reviewed fallback |
| UX-T10 | Delete pack → user work remains with readable old labels and General/Custom available |
| UX-T11 | Add/edit/reorder phrases offline and restart → intended durable order/text or explicit save failure |
| UX-T12 | Remove final phrase → helpful personal empty state; no silent switch to default |
| UX-T13 | Off during active session → decorative phrase hidden; timer/persistence unaffected |
| UX-T14 | 240/241-code-point input and Sinhala/Tamil joining text → defined boundary, no silent truncation |
| UX-T15 | Each old URL cold/warm opens → validated new destination, same ID, no Back loop |
| UX-T16 | Unknown/not-owned session URL after account switch → no private data flash or cached detail |
| UX-T17 | Repeated Focus tab/Resume while session active → exactly one underlying session |
| UX-T18 | Android Back / iOS navigation away → timer not silently cancelled; end-early remains explicit |
| UX-T19 | Large text, long localized labels and keyboard → visible reachable primary/escape actions |
| UX-T20 | Screen reader on timer → meaningful state announcements, not per-second chatter |
| UX-T21 | Reduced motion / failed scene asset → static usable screen, no mandatory download/audio |
| UX-T22 | Both themes default/pressed/loading/disabled/focus/error → rendered contrast and non-color cues verified |
| UX-T23 | Sign-out during pending draft save → no write or phrase leak to another namespace |
| UX-T24 | Empty Progress + offline pending sessions → no fake trends or claim of server-verified rewards |

Link eventual UX evidence into release gates G-06/G-07/G-08 and applicable privacy
gates. Use [08](08-VERIFICATION-AND-RELEASE.md) for the authoritative gate meanings.
Document-only checks cannot pass any of these runtime cases. Whole-app release
readiness still needs backend/security, store, privacy and scope evidence.

## Sources and limits

[^1]: W3C WAI, [Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), accessed 2026-09-16. Opaque token arithmetic is one input, not WCAG conformance certification.
[^2]: W3C WAI, [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), accessed 2026-09-16. Relevant visible control/state information needs an appropriate adjacent contrast relationship.
[^3]: W3C WAI, [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), accessed 2026-09-16. Web criterion differs from the proposed mobile/product target sizes.
[^4]: W3C WAI, [Understanding Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), accessed 2026-09-16. SC 2.3.3 is Level AAA; respecting reduced motion is nevertheless an explicit Deep Focus product requirement.
