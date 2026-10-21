# Deep Focus competitive UI research — 2026-10-20

## Scope and status

This is a research and prioritisation note for the current calm, local-first
Deep Focus mobile experience. It is evidence for bounded UI work, not approval
for a provider change, monetisation change, social feature, or a new product
scope. The current implementation direction remains: one clear next action,
quiet focus sessions, sustainable recovery, and user control.

## Comparison

| Product | Observed pattern from its official materials | Useful lesson for Deep Focus | Deliberately not copied |
| --- | --- | --- | --- |
| Forest | Starts with a single focus action, turns elapsed focus into a visible tree, and offers a timeline of focus history. | Make the next focus block visually obvious and make progress legible without requiring a dashboard deep dive. | Competitive gamification, coins, app blocking, and emotional penalties for leaving a session. |
| Focusmate | A user chooses a time, states a concrete task, works quietly, and closes with a short progress check-in. It offers 25/50/75-minute sessions and a direct “Focus Now” path. | Keep task intention close to session start; make start-now and planned-session paths distinct; add a small, optional completion reflection. | Video matching, social accountability, public reputation, and third-party privacy surface. |
| Todoist | Uses a quick first task, natural-language dates, Today/Upcoming views, priorities, sections, and subtasks; its guidance recommends concrete tasks that are often under an hour. | Preserve a low-friction task capture path, show Today/Upcoming clearly, and encourage one concrete next step. | A full project-management hierarchy, automatic date parsing, and broad task-management scope. |
| TickTick | Connects tasks to Pomodoro/stopwatch focus, supports focus records, extra time, cross-device sync, Today Focus and Focus Distribution views. | Keep focus records tied to the selected task and make “continue/add time” understandable after a session. | Expanding into a large all-in-one calendar/habit/matrix product before core reliability and review gates are closed. |

## Prioritised recommendations

### P0 — current polish slice

1. Use one Sinhala term consistently for focus: `අවධානයේ` in user-facing
   compound phrases, instead of the unnatural `අවධානම්` form.
2. Keep onboarding questions short and conversational. Ask about a “focus time
   block” rather than an abstract “focus section”.
3. Keep authentication errors actionable and privacy-safe: say what the user can
   try next without confirming whether an email exists.
4. Keep the home screen centred on one next block, one task, and one calm primary
   action. This matches the strongest common pattern without importing pressure.

### P1 — next bounded UI slice

1. Add an optional, one-tap post-session reflection: “What helped?” with a small
   set of user-reported choices. Do not infer mood or health conditions.
2. Surface task context on the focus setup and completion screens: task name,
   planned minutes, actual focused minutes, and optional extra time.
3. Add a restrained Today/Upcoming summary to Plan My Day, retaining the existing
   proposal-and-confirm flow.

### P2 — later, only after review and device evidence

1. Consider an optional visual history treatment for protected focus blocks.
2. Consider a lightweight stopwatch mode only if the owner approves the scope and
   the persistence/recovery contract is extended first.
3. Do not add social matching, app-blocking permissions, coins, streak penalties,
   or a large calendar/habit surface as part of this research.

## Language slice applied in this revision

- Rephrased the Sinhala onboarding focus-pace question so it asks for a
  `අවධානයේ කාල කොටස`.
- Rephrased the current-focus question for natural Sinhala.
- Improved the onboarding profile suggestion title and minute phrasing.
- Clarified the Sinhala progress block labels.
- Replaced a mixed English `cloud` privacy word with `වලාකුළ` and made the
  presentation preference labels more user-facing.

## Sources

- Forest official site: https://forestapp.cc/
- Forest Google Play listing: https://play.google.com/store/apps/details?id=cc.forestapp
- Focusmate getting started: https://support.focusmate.com/en/articles/9110188-getting-started
- Focusmate Focus Now: https://support.focusmate.com/en/articles/9994509-focus-now
- Focusmate session settings: https://support.focusmate.com/en/articles/8060080-session-settings-my-task-quiet-mode-and-partner
- Todoist getting started: https://www.todoist.com/help/todoist/get-started/get-started-with-todoist-OgNNJR
- TickTick focus guide: https://help.ticktick.com/articles/7055782010496745472
- TickTick product overview: https://ticktick.com/?language=en_us

## Verification limits

This comparison used official product pages/help material and is not a usability
study, market-share ranking, or claim that competitor outcomes transfer to Deep
Focus. Rendered Sinhala typography, large text, screen-reader output, and the
phone install remain separate verification work.
