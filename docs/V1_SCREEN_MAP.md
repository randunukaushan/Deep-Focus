# Deep Focus V1 Screen Map

This document is the canonical V1 screen and navigation map for Deep Focus. It
defines navigation structure only; feature behavior remains governed by
`V1_FEATURE_SCOPE.md` and the dedicated UI, architecture, data, API, security,
and testing specifications.

The current visual token direction uses Deep Focus Navy surfaces (`#0F2537`,
`#17354A`, and `#1B3B54`) with Deep Focus Mint (`#7FE5B6`) for primary actions
and highlights. AI-only context may use the supporting Lavender accent
(`#A78BFA`) together with a label or icon.

## 1. Route-count rules

The V1 navigation architecture contains **26 full-screen routes**: 23 required
routes and three conditional routes. The native splash, dialogs, bottom sheets,
overlays, and temporary states are not counted as full-screen routes.

Authentication is part of V1. Password recovery is conditional on the selected
authentication flow, email verification is conditional on the approved policy,
and session details are conditional on the supported history-detail experience.
No authentication provider is selected by this map.

## 2. Canonical full-screen routes

| ID | Route | Screen | V1 status | Primary entry | Primary exit |
| --- | --- | --- | --- | --- | --- |
| 01 | `/welcome` | Welcome | Required | First launch | Onboarding or Sign In |
| 02 | `/auth/sign-in` | Sign In | Required | Welcome | Home or required onboarding |
| 03 | `/auth/sign-up` | Sign Up | Required | Welcome or Sign In | Verification or onboarding |
| 04 | `/auth/forgot-password` | Forgot Password | Conditional | Sign In | Sign In |
| 05 | `/auth/verify-email` | Email Verification | Conditional | Sign Up | Onboarding |
| 06 | `/onboarding` | Onboarding Introduction | Required | Welcome or verification | Personal Assessment |
| 07 | `/onboarding/assessment` | Personal Assessment | Required | Onboarding | Productivity Profile |
| 08 | `/onboarding/productivity-profile` | Productivity Profile | Required | Assessment | Home |
| 09 | `/home` (`/` redirects here) | Home | Required tab | Main application | Contextual workflow |
| 10 | `/focus` | Focus | Required tab | Main navigation | Session Setup or recovery |
| 11 | `/analytics` | Analytics | Required tab | Main navigation | History or contextual detail |
| 12 | `/rewards` | Rewards | Required tab | Main navigation | Contextual reward detail |
| 13 | `/profile` | Profile | Required tab | Main navigation | Settings |
| 14 | `/tasks` | Tasks | Required | Home or session setup | Task detail or previous route |
| 15 | `/tasks/[taskId]` | Task Detail | Required | Tasks or contextual task card | Tasks, edit, or Session Setup |
| 16 | `/goals` | Goals | Required | Home or Profile | Goal detail or previous route |
| 17 | `/goals/[goalId]` | Goal Detail | Required | Goals or contextual goal card | Goals, edit, or related task |
| 18 | `/focus/setup` | Session Setup | Required | Home, Focus, task, or goal | Active Session |
| 19 | `/focus/session` | Active Focus Session | Required | Session Setup or recovery | Break, Summary, or safe exit |
| 20 | `/focus/recovery` | Session Recovery | Required | Startup/resume state check | Active Session or safe resolution |
| 21 | `/focus/break` | True Zen Break | Required | Completed session | Session Summary |
| 22 | `/focus/summary` | Session Summary | Required | Completed/cancelled session or break | Home or Session Setup |
| 23 | `/analytics/history` | Session History | Required | Analytics | Session Detail or Analytics |
| 24 | `/analytics/history/[sessionId]` | Session Detail | Conditional | Session History | Session History |
| 25 | `/profile/settings` | Settings | Required | Profile | Profile |
| 26 | `/plan-my-day` | Plan My Day | Required | Home | Home or confirmed plan context |

The five canonical bottom-navigation destinations are Home, Focus, Analytics,
Rewards, and Profile. AI is contextual and must not become a permanent tab.

## 3. Route groups

```text
Root Stack
├── Entry and initialization
├── Authentication
├── Onboarding
├── Main tabs
│   ├── Home
│   ├── Focus
│   ├── Analytics
│   ├── Rewards
│   └── Profile
├── Tasks and Goals
├── Focus-session workflow
├── Analytics history
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
- `Review My Day Lite` is a conditional Home or Analytics review experience.

`Plan My Day` uses a dedicated route because it is a required, multi-step,
proposal-first V1 workflow. Its generation, review, editing, rejection, retry,
and explicit confirmation are states of that route rather than separate screens.

## 5. Navigation flows

```text
Launch
→ initialize
→ recover an active session when valid
→ otherwise resolve authentication and onboarding state
→ main application
```

```text
Welcome
→ Sign Up or Sign In
→ verification when required
→ Onboarding
→ Personal Assessment
→ Productivity Profile
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

- authentication provider and credential implementation;
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
