# Deep Focus interactive UI preview

## Task / boundary

UI-P2 (2026-10-04), IMPLEMENTED, scoped browser checks PASS: owner requested richer scenery and clearer animation
in this same isolated prototype. MEDIUM, reversible visual-only changes; no new
dependencies, production timer changes, storage, provider or Expo edits. Allowed:
this directory and scoped changelog entry. Self-review plus browser evidence;
final visual approval remains with owner. Acceptance: richer day/night scene,
finite replayable scene entrance, start/pause feedback, completion check reveal,
no ambient movement during sessions, system/manual reduced-motion honored;
existing interactions and 320/390px checks remain passing. Verify with existing
verify.cjs and new motion checks, inspect screenshots. Rollback: revert only P2
visual additions, preserving P1 and unrelated work. No installations or spending.

UI-P1, October 4, 2026. Owner authorized the first Home/Plan/Focus clickable
prototype, both themes, motivation and subtle motion. MEDIUM, isolated preview.
Read: repository AI/execution/DoD/guardrails/map/template; UI motion guidance,
revision 15 sections 6–9, current theme/package and dirty work.
Allowed: this folder; scoped evidence in revision audit/changelog and a link in
build guide 49. Existing Expo source and user edits remain untouched.

Acceptance: navigate three primary views; add/complete/select a sample task;
start/pause/resume/end a preview session; theme and phrase controls visibly
apply; reduced motion; 320px layout; actual browser interactions and screenshots.
All data is in memory and resets on reload. No account, server, real history,
payments, downloads, analytics or provider integration. Visual review remains
owner-pending; this is not a production timing/storage implementation.

## Open

**New: [onboarding flow and Luna handoff](ONBOARDING.md).** Use the `Try onboarding`
preview control or open `http://127.0.0.1:8873/?preview=onboarding`. Optional 9/10
step flow, conditional education, defaults, review/apply and Profile re-entry.
Draft translations cover onboarding/cards only; no persistent settings or pack
installation. All sample data still resets on refresh.

Open `index.html` in a browser, or serve this directory with a local static server.
For the local-only preview run `node artifacts/ui-prototype/serve.cjs` from the
repository root, then open http://127.0.0.1:8873. Stop with Ctrl+C.
There are no npm dependencies or network resources. `brand-reference.png` is an
unchanged copy of the owner's supplied logo; the mark is framed with CSS. Scenery
is original vector artwork in the HTML, not a modified screenshot.

## Interaction reference for Luna

- Home: scene hero, current priority, next task rows; Start opens Focus with the
  selected task. Plan opens the same sample collection.
- Plan: sample Today/Upcoming filter; Add form validates nonblank title and
  positive minutes; selected work opens Focus; explicit checkbox completes work.
- Focus: 25/45/60 min setup, timestamp-based preview countdown, pause/resume,
  end confirmation, summary. Navigation preserves the in-memory running session.
  Selecting other work or duration during a session is blocked visibly.
- Profile: light/dark, reduced motion, default/personal/off motivation. Custom
  plain text is rendered with textContent and limited to 240 Unicode code points.
  Active-session phrases are separately opt-in and stable at session start;
  switching Off hides the current phrase. No private phrase is stored in history.
- Progress: preview sessions only, completion and early end distinguished.
- Motion: view enter 180ms, controls 120ms, theme transitions 300ms;
  layered scenery entrance 1200–2100ms once, timer action feedback 360ms,
  completion mark 460ms and check stroke 650ms after 120ms. No ambient loops.
  Scenery stays static while a session exists (including paused). System reduced
  motion or the explicit setting removes nonessential transitions.

Candidate CSS tokens and layout are for owner visual review. Port components
into the existing React Native layers after approval; never transplant the
in-memory demo timer/repository as production recovery or auth infrastructure.

## Verification

2026-10-04: `node artifacts/ui-prototype/verify.cjs` passed in headless installed
Microsoft Edge using bundled Playwright. Checks: navigation, task add/plain-text
escaping/completion/filtering; timer countdown/pause/resume/navigation/early-end;
theme switch; Sinhala custom phrase, 240-character validation, phrase Off;
explicit reduced-motion class; 320/390px overflow across five views; reload reset;
no page errors. Home/Plan/Focus screenshots are in this directory. Home and Focus
were visually inspected; scenery sizing was adjusted after inspection.

The test runner uses this machine's bundled Playwright module by default; override
`PLAYWRIGHT_MODULE` with your installed module path on another machine. It does
not install dependencies. Initial bundled Chromium launch was unavailable; tests
use existing Edge instead. One exact-text test selector was corrected to account
for the quote's nested label; this was not an application failure.

P1 did not verify full-duration completion. P2 now checks completion using a
controlled browser clock; this is not native lifecycle/recovery evidence.
Not verified: real-time full-duration device completion, screen-reader experience, native-device
behavior, persistence/recovery, localization coverage, production security or
release readiness. This is a single personal phrase preview, not the complete
phrase library/editor. Off hides the configurable phrase, not all fixed UI copy.
Final artwork, full app screens and owner visual approval remain outstanding.

### UI-P2 evidence and Luna motion handoff

- `node artifacts/ui-prototype/verify.cjs`: PASS after P2, existing interactions
  and narrow-screen regression checks retained.
- `node artifacts/ui-prototype/verify-motion.cjs`: PASS in installed headless Edge.
  Checks finite entrance/replay, running AND paused scenery freeze, timer action
  feedback, completion sample without progress mutation, timed completion with
  controlled clock, OS/manual reduced motion, Escape/focus return, no page errors.
  Initial timed test installed its fake clock after page timers existed and failed;
  installing before page reload corrected the harness, not product timing rules.
- `node docs/revision/check-docs.mjs`: PASS; `git diff --check`: PASS.
- Home light/dark and completion screenshots visually inspected. Self-review only;
  owner visual acceptance for P2 pending. No native performance/battery, full
  accessibility or production-readiness claim. No provider/data boundary changed.
- `motion.css` owns candidate illustration palette and visual states. SVG layers
  remain code-native and local; text is real UI, not baked into artwork. No asset
  fetch/download or new package is required.
- Port finite transforms/opacity and check-stroke reveal into approved mobile
  animation tooling only after visual approval. Do not port the demo timer as a
  production engine. Session existence gates scenery; reduced motion bypasses
  effects, live OS changes cancel them. Start/pause feedback never delays controls.
- Preview controls outside the phone replay Home scenery or show a sample dialog;
  they are review tools, not proposed production features. Completion sample adds
  no history, XP or task completion. Real session summary uses the same check mark.
- Preserved unrelated source/theme/docs work. Next: owner visual review, then the
  remaining approved screen flows; no Expo integration in this slice.
