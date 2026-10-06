# Shared Button loading accessibility — L-09 reusable component state

## Task brief — 2026-10-06

Outcome: a loading shared Button preserves the action's accessible context,
includes the loading state in its accessible name, remains busy/disabled,
and allows callers to provide localized loading copy. It does not change visual
tokens, persistence, navigation, action timing or button variants.

Authority: `docs/COMPONENT_LIBRARY.md` §§4.1–4.2, 4.8, 4.15–4.17;
`docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md` §7 primary-button
row; generic loading-state behavior in `docs/UI_UX_DESIGN_SPECIFICATION.md`
§7.1 Button States and Loading Buttons. Exact brand-token, app-wide localization
and native announcement claims remain outside this slice.

Risk: MEDIUM, shared cross-platform accessibility behavior; self-review and
synthetic contract tests do not prove screen-reader platform behavior. Keep
VoiceOver/TalkBack checks `REVIEW_PENDING`/`NOT_RUN` until actual devices are
checked. No independent reviewer was available; no self-review is represented as
independent approval.

Allowed files: `src/components/ui/button.tsx`, this test, this README, and
`docs/CHANGELOG.md`. Preserve all existing dirty files. No new dependency.

Acceptance: idle button name/state remain unchanged; loading button disables
repeat activation, retains the action text, has `busy=true`, exposes a loading
accessible name, hides the redundant spinner from assistive technology, and
supports caller-provided localized loading copy.

Verification command: `node --test --test-reporter=tap tests/components/button.test.mjs`
plus timer/session/navigation regression suite, TypeScript typecheck, direct
focused ESLint and `git diff --check`. Synthetic JSX/native primitives establish
the actual component's emitted props only, not rendered focus or spoken output.

Actual checks: component test — 3/3 pass; combined timer/session/navigation/
component run — 38/38 pass (31 timer/session, four navigation, three Button);
`node node_modules/typescript/bin/tsc --noEmit` — exit 0; focused direct ESLint
over changed app/test files — exit 0; `git diff --check` — exit 0 with existing
LF/CRLF notices. VoiceOver/TalkBack and dynamic text/device interaction remain
NOT_RUN, so the UI behavior stays REVIEW_PENDING.
