# UI-P3 — optional onboarding prototype

2026-10-06. IMPLEMENTED / MEDIUM: isolated in-memory UI, no trust boundary, storage,
provider or production app changes. Owner authorized onboarding in the accepted
P1/P2 visual direction. One outcome: welcome → optional applicable questions →
review → personalized Home, editable again from Profile.

## Boundary and sources

Read AI_RULES, execution, DoD, guardrails, task template, documentation map;
revision 03 §§1–4, 15 §§1–5, 20 §§1–2; screen-map onboarding routes and decision
register DF-014/015/017/018, ADR-008; canonical UI card/accessibility principles.
Inspected package scripts, prototype HTML/CSS/server/tests and dirty state.
Preserve all existing unrelated docs and source/theme edits. Work alone.

Allowed: artifacts/ui-prototype (HTML integration, new onboarding.js/.css,
translation dictionary, tests, screenshots, this handoff, README, server routes),
scoped docs/CHANGELOG.md entry. No new dependency, Expo edits, auth, persistence,
AI call, cloud download, resource upload, real notifications or memberships.
This browser preview is not an alternate guest/auth/age policy. Production gates
remain as documented, including 15+ and legal eligibility handling.

## Acceptance and verification plan

- O1: Intro offers language, Reduce Motion and defaults; explicit presentation
  choices survive defaults, which grant no permissions or external actions.
- O2: 9 applicable steps (including review), 10 with education. Back retains
  draft; skip clears that question's proposal; hidden education answers cleared
  when all education roles are removed. Stable field IDs, no diagnosis.
- O3: Exit midway offers keep-in-memory/resume or discard, never partial apply.
- O4: Review shows current/proposed values, selected changes only. Existing
  explicit overrides unchecked by default; apply once. Duration affects future
  setup only. Roles never change nav, permissions, existing tasks or history.
- O5: Sri Lanka is a clearly marked organizational preview, not a verified
  syllabus/pack installation. General works with all languages; medium separate.
- O6: Reopen/edit from Profile; language preview independent of curriculum.
  Sinhala/Tamil strings are draft and require qualified QA; only onboarding and
  personalized Home card localized in this slice, other screens remain English.
- O7: Entry blocked during an active/paused session with a return-to-focus notice.
  No data is sent or persisted. Refresh resets data and warns accordingly.
- O8: Keyboard/labels/heading focus, responsive 320/390px, both themes and reduced
  motion checked in installed Edge. Native shaping, screen-reader and production
  persistence failures NOT RUN, not simulated as durable success.

Run existing verify.cjs and verify-motion.cjs plus new verify-onboarding.cjs;
inspect actual screenshots; run docs checker and diff check. Self-review scoped
changes; owner visual acceptance pending. Rollback only this P3 layer, not user
work. Exact production copy, translation QA and durable settings stay separate.

## Results

Browser acceptance O1–O8: PASS for the stated browser subset, installed headless
Microsoft Edge. `node artifacts/ui-prototype/verify-onboarding.cjs` checks intro
defaults, retained language/motion, conditional 9/10 steps, Back/Skip, deselected
education proposals, selective apply, earlier explicit focus override, in-memory
keep/resume/discard, preserved task completion/history, active/paused entry guard,
all steps at 320/390px in en/si/ta, both themes, heading keyboard focus and no page
errors. Screenshots: onboarding-welcome/roles/education/review/tamil.png. Welcome,
roles, education and Tamil screenshots visually inspected, not qualified language
certification. Existing verify.cjs and verify-motion.cjs also PASS after P3.
The onboarding suite passed again over the actual local HTTP server with
`DF_PREVIEW_URL=http://127.0.0.1:8873/`; no external HTTP requests occurred.
`node docs/revision/check-docs.mjs`, syntax checks for new scripts/server and
`git diff --check` passed. No package installation or production build was run.

Self-review: UI-only state and side effects inspected; no storage, network call,
permission grant or account mutation added. Browser prototype verification is
separate from pending owner acceptance, native-device/accessibility/translation
review and production readiness. No new independent review gate needed for this
bounded preview; no independent review claimed. Production work remains gated.

## Luna implementation reference

Entry: `?preview=onboarding`, preview toolbar or Profile. Resume retained draft
at its current question; new setup starts at introduction. Existing five tabs
do not change; they are hidden during setup to keep exit choices clear. External
preview toolbar is not proposed production navigation.

State: introduction → questions → review → Home. Exit temporarily presents keep,
discard or return. Answers are isolated from applied preferences until reviewed.
Data lives in memory only; all pages state the refresh limitation. Defaults keeps
the current applied bundle and applies chosen intro language/motion; no partial
questionnaire answers apply. Theme is left unchanged. This is not production
namespace/auth bootstrap or a transaction/persistence implementation.

Fields are stable keys matching revision 03/15 where applicable. `roles` and
`friction` are multi-select; no selection is valid. Other question choices are
single-select. Availability is coarse preview capacity only (no day picker),
preferred windows are morning/afternoon/evening/no preference (not actual time
ranges), and focus offers existing 25/45/60 presets. Custom duration, exact time
windows and day selection remain future detailed controls, not implemented here.

Only roles containing student/educator show learning context. Removing all such
roles clears uncommitted learning proposals; it does not erase previously applied
context or user work. General/Custom, Sri Lanka preview, level and medium are
independent fields. No official pack manifest/download/rights check is performed.

Review lists changed fields with current/proposed labels and checkboxes. Earlier
explicit choices are unchecked initially. Only selected rows apply together in
this single in-memory event; repeated old Apply clicks do nothing after exit.
This is not a replacement for production versions, command IDs, atomic storage,
conflict handling, storage-error recovery or identity-scoped drafts in 15/20.

Home displays applied focus/context and intent guidance; detailed density adds
roles/capacity/window labels. Roles/friction/accountability remain preferences,
not automatic projects, diagnosis, invites or workspace grants. Plan tasks are
untouched. Focus duration affects the next setup; setup entry is blocked during
running/paused sessions. Personal quote/theme changes are not reset.

Localization uses stable dictionary keys in onboarding-copy.js, with complete
message templates. Coverage is onboarding and personalization cards only; the
rest of the existing prototype stays English. No billing country, timezone,
curriculum or study medium derives from UI language. en/si/ta require qualified
translation review and real device font/large-text/screen-reader validation.

UI: existing scene, tokens, buttons and motion policy reused; semantic fieldsets,
native checkboxes/radios/selects, visible selection marks, progress label and
heading focus on step navigation. Nonessential animation respects OS/local reduce
motion. No new illustration package or remote asset. The proposed mobile port
must reuse approved native components and the real settings/domain boundaries.
