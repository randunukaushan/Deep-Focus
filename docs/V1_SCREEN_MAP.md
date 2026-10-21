# Deep Focus V1 Screen Map

This document is the canonical V1 screen and navigation map for Deep Focus. It
defines navigation structure only; feature behavior remains governed by
`V1_FEATURE_SCOPE.md` and the dedicated UI, architecture, data, API, security,
and testing specifications.

On September 15, 2026 the owner approved Home / Plan / Focus / Progress / Profile,
with Rewards inside Progress, and the supplied blue/navy/coral brand direction.
This supersedes the old Analytics/Rewards bottom tabs and mint-primary direction.
Exact production tokens, final assets and accessibility evidence remain ADR-003
gates; approving a direction is not proof that it is implemented or tested.
This map reconciles those approved mobile destinations, not the full expanded
release scope. January Website/Account Portal routes are counted separately below.

## 1. Route-count rules

The V1 navigation architecture contains **27 full-screen routes**: 24 required
routes and three conditional routes. The native splash, dialogs, bottom sheets,
overlays, and temporary states are not counted as full-screen routes.

Authentication is part of V1. Password recovery is conditional on the selected
authentication flow, email verification is conditional on the approved policy,
and session details are conditional on the supported history-detail experience.
Supabase Auth is now selected in the decision register. Exact verification,
recovery and session policies still need their contracts. Expo SecureStore is
selected for mobile credentials; its adapter/configuration still needs validation.

## 2. Canonical full-screen routes

| ID | Route | Screen | V1 status | Primary entry | Primary exit |
| --- | --- | --- | --- | --- | --- |
| 01 | `/welcome` | Welcome | Required | First launch | Onboarding or Sign In |
| 02 | `/auth/sign-in` | Sign In | Required | Welcome | Home or required onboarding |
| 03 | `/auth/sign-up` | Sign Up | Required | Welcome or Sign In | Verification or onboarding |
| 04 | `/auth/forgot-password` | Forgot Password | Conditional | Sign In | Sign In |
| 05 | `/auth/verify-email` | Email Verification | Conditional | Sign Up | Onboarding |
| 06 | `/onboarding` | Onboarding Introduction | Required | Welcome or verification | Personal Assessment or defaults to Home |
| 07 | `/onboarding/assessment` | Personal Assessment | Required route; answers optional | Onboarding or edit preferences | Productivity Profile or defaults to Home |
| 08 | `/onboarding/productivity-profile` | Productivity Profile | Required | Assessment | Confirm selected preferences to Home, or retain defaults |
| 09 | `/home` (`/` redirects here) | Home | Required tab | Main application | Contextual workflow |
| 10 | `/focus` | Focus | Required tab | Main navigation | Session Setup or recovery |
| 11 | `/progress` | Progress | Required tab | Main navigation | History, Rewards or contextual detail |
| 12 | `/progress/rewards` | Rewards | Required nested route | Progress | Contextual reward detail or Progress |
| 13 | `/profile` | Profile | Required tab | Main navigation | Settings |
| 14 | `/tasks` | Tasks | Required | Plan, Home or session setup | Task detail or previous route |
| 15 | `/tasks/[taskId]` | Task Detail | Required | Tasks or contextual task card | Tasks, edit, or Session Setup |
| 16 | `/goals` | Goals | Required | Plan, Home or Profile | Goal detail or previous route |
| 17 | `/goals/[goalId]` | Goal Detail | Required | Goals or contextual goal card | Goals, edit, or related task |
| 18 | `/focus/setup` | Session Setup | Required | Home, Focus, task, or goal | Active Session |
| 19 | `/focus/session` | Active Focus Session | Required | Session Setup or recovery | Break, Summary, or safe exit |
| 20 | `/focus/recovery` | Session Recovery | Required | Startup/resume state check | Active Session or safe resolution |
| 21 | `/focus/break` | True Zen Break | Required | Completed session | Session Summary |
| 22 | `/focus/summary` | Session Summary | Required | Completed/cancelled session or break | Home or Session Setup |
| 23 | `/progress/history` | Session History | Required | Progress | Session Detail or Progress |
| 24 | `/progress/history/[sessionId]` | Session Detail | Conditional | Session History | Session History |
| 25 | `/profile/settings` | Settings | Required | Profile | Profile |
| 26 | `/plan-my-day` | Plan My Day | Required | Home | Home or confirmed plan context |
| 27 | `/plan` | Plan | Required tab | Main navigation | Tasks, Goals or an approved planning workflow |

The five canonical bottom-navigation destinations, in order, are Home, Plan,
Focus, Progress and Profile. AI is contextual and must not become a permanent tab.
Plan composes existing task/goal entry points; the new tab does not itself approve
every proposed calendar, education or automatic planning feature. Required
onboarding routes do not make assessment answers mandatory. Users may skip to
documented defaults and edit preferences later; skipping does not grant consent.

## 3. Route groups

```text
Root Stack
├── Entry and initialization
├── Authentication
├── Onboarding
├── Main tabs
│   ├── Home
│   ├── Plan
│   ├── Focus
│   ├── Progress
│   └── Profile
├── Tasks and Goals
├── Focus-session workflow
├── Progress history and Rewards
├── Settings
└── Plan My Day
```

The native splash is an initialization presentation, not a navigable route.
Startup routing must use authoritative authentication, onboarding, and active
session recovery state when those foundations are implemented.

## 4. Non-route interfaces and states

The following should remain contextual rather than permanent full-screen
destinations unless a later approved decision changes them:

- task and goal create/edit forms may use accessible modal routes or full-height
  modal presentations selected during their screen-design work;
- session cancel/end, destructive actions, sign out, and unsaved-change handling
  use confirmation dialogs;
- task selection, simple duration selection, filters, session actions, and quick
  preferences may use bottom sheets;
- reward and achievement celebrations use temporary overlays or contextual
  detail presentation;
- loading, empty, offline, error, retry, permission-denied, paused, completing,
  and invalid-recovery conditions are states of their owning route;
- permission education appears contextually before an operating-system prompt;
- `Break Down This Task` is a conditional task-context proposal workflow;
- `Review My Day Lite` is a conditional Home or Progress review experience.

`Plan My Day` uses a dedicated route because it is a required, multi-step,
proposal-first V1 workflow. Its generation, review, editing, rejection, retry,
and explicit confirmation are states of that route rather than separate screens.

## 5. Navigation flows

```text
Launch
→ initialize
→ resolve permitted identity and its local data namespace
→ recover only that identity's valid active session
→ otherwise resolve authentication and optional personalization state
→ main application
```

```text
Welcome
→ Sign Up or Sign In
→ verification when required
→ Onboarding
→ Personal Assessment, or skip to defaults
→ Productivity Profile preview and confirmation when assessment is chosen
→ Home
```

```text
Home or Focus
→ Session Setup
→ Active Focus Session
→ pause/resume when supported
→ complete or cancel safely
→ optional True Zen Break
→ Session Summary
→ Home, details, or another setup
```

```text
Home
→ Plan My Day
→ generate a validated proposal
→ edit, reject, or retry
→ explicitly confirm exact actions
→ apply through ordinary validated services
```

## 6. Unresolved implementation decisions

The following decisions are intentionally not made by this document:

- credential implementation and exact Supabase Auth configuration (provider
  selection itself is already approved);
- whether email verification is mandatory for the selected authentication flow;
- the final modal or full-screen presentation of task and goal create/edit forms;
- dedicated presentation details for conditional AI features;
- provider, grant size, and validity period for rewarded AI access.

These decisions require their normal product, architecture, security, and design
approval. They must not block creation of the route skeleton for already approved
V1 destinations.

## 7. Scope exclusions

Voice AI, long-form AI chat, automatic rescheduling, AI weekly planning, social
leaderboards, community challenges, advanced integrations, and other capabilities
listed in `POST_V1_FEATURE_SCOPE.md` are not V1 routes.

## 8. Required separate web surfaces

The Public Website and Account Portal are required for January 1, 2027 under
[V1 scope](V1_FEATURE_SCOPE.md). They are not included in the 27 mobile routes
above. Next.js is selected, but the
[proposed web route map](revision/05-WEB-AND-INTEGRATIONS.md) still needs its
bounded route/content/configuration freeze before implementation. A full browser
focus/planning app and teacher LMS remain separate future surfaces.

## 9. Existing implementation and compatibility migration

The current source still has Home / Focus / Analytics / Rewards / Profile tabs.
This documentation change does not rename those files or migrate application data.
Keep all existing analytics, reward and history functionality when implementing
the approved navigation. Preserve old entry URLs through compatibility redirects:

| Existing entry | Approved destination |
| --- | --- |
| `/analytics` | `/progress` |
| `/rewards` | `/progress/rewards` |
| `/analytics/history` | `/progress/history` |
| `/analytics/history/[sessionId]` | `/progress/history/[sessionId]` |

Redirects are not additional full-screen destinations. Validate and preserve the
session identifier, enforce ordinary ownership checks at the destination, and
replace the old history entry so Back does not loop. Do not alter persisted
session IDs or storage keys to rename a screen. Update route files, internal links,
tab labels/accessibility labels, notification/deep-link targets and route tests
in one bounded implementation task. Verify cold/warm links, unknown IDs,
signed-out/account-switched access, Back behavior and session recovery on both
mobile platforms. None of these runtime checks has been performed by this edit.
