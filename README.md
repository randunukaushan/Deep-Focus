# Deep Focus

> A calm, privacy-conscious productivity application for protecting attention, completing reliable focus sessions, and building sustainable work habits.

Deep Focus is being developed as a cross-platform mobile application for people who want to work with greater intention without turning productivity into constant pressure. It combines focused work, thoughtful recovery, progress insights, and optional AI assistance while keeping the user in control.

## Project Status

Start with the [Final Build Guide](docs/revision/49-BUILD-ENTRY-HANDOFF-SI.md):
the first coding task, phase order, feature contracts and remaining decisions.
Use the [documentation map](docs/DOCUMENTATION_MAP.md) for authority and
the [readiness sheet](docs/revision/18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md)
for detailed prerequisite history. The broad documentation consolidation pass is
closed; complete remaining specifications within each selected feature task.
The foundation checkpoint below is historical; it is not a fresh audit of every
current feature or proof that the expanded enterprise contracts are implemented.

Recorded foundation checkpoint: **Phase 1 — Application Foundation**. Confirm
the actual current implementation against source and the readiness sheet before
selecting a new task; this checkpoint is not a current feature-completion claim.

- Phase 0 project-readiness work is complete.
- The initial React Native and Expo project foundation exists.
- Shared design tokens and the first accessible shared component are in place.
- Navigation, reusable components, services, persistence, and error-state foundations are being completed before dependent V1 features begin.
- Features listed below describe the approved V1 direction and must not be treated as implemented until they have been built and verified.

## Mission

Deep Focus exists to help people regain control over their attention and develop a healthier relationship with productivity technology.

The project is guided by five principles:

- protect attention instead of competing for it;
- support sustainable productivity and appropriate recovery;
- keep users in control of their data and decisions;
- create a calm, simple, and accessible experience;
- use AI as optional guidance rather than an authority or core dependency.

## Planned V1 Experience

The core V1 journey is designed around a reliable focus workflow:

```text
Choose a task or goal
        ↓
Configure a focus session
        ↓
Start and remain focused
        ↓
Pause or resume where supported
        ↓
Complete or cancel safely
        ↓
Persist and recover session data
        ↓
Update verified progress and insights
```

Planned V1 capabilities include:

- authentication and user settings;
- reliable focus sessions with lifecycle recovery;
- tasks and goals;
- True Zen Break recovery experiences;
- session history and productivity analytics;
- Focus XP, levels, streaks, and approved achievements;
- notifications and accessibility settings;
- personal assessment and an assessment-based Productivity Profile;
- required V1 `Plan My Day` AI assistance;
- conditional `Break Down This Task` and `Review My Day Lite` AI assistance when release guardrails are satisfied;
- offline behavior, synchronization, and duplicate-processing protection.

Deep Focus does not use real-money rewards, gambling, or cash-based focus bets. Optional AI features must remain private, transparent, dismissible, and unable to block the core focus experience.

## Technology Stack

The current mobile foundation uses:

- TypeScript;
- React Native;
- React;
- Expo SDK 56;
- Expo Router;
- functional React components and React Hooks.

The exact installed versions are defined in [`package.json`](package.json) and [`package-lock.json`](package-lock.json).

Approved direction: **Supabase PostgreSQL/Auth/Edge Functions**, **Expo SQLite**
domain data, **Expo SecureStore** credentials and **Next.js** Public Website/Account
Portal. See the [decision register](docs/revision/01-REQUIREMENTS-AND-DECISIONS.md)
for the September 14–15 approval boundaries. These selections do not establish
implemented/provisioned services. Next.js hosting, exact adapters/configuration,
test tooling, state management and AI-provider choices remain subject to their
documented gates; do not re-ask already approved platform choices.

## Architecture Direction

Deep Focus follows a modular, maintainable architecture with clear separation between:

- route and presentation composition;
- application and business logic;
- domain rules and types;
- data access and persistence;
- external services and infrastructure.

Implementation should reuse the approved design system and components, keep route files lightweight, protect user privacy, and build complete vertical feature slices rather than disconnected layers.

## Getting Started

### Prerequisites

- Git;
- Node.js LTS;
- npm;
- an Android emulator, iOS simulator where supported, Expo Go, or a compatible physical device.

### Install and start

```bash
git clone https://github.com/randunukaushan/Deep-Focus.git
cd Deep-Focus
npm install
npx expo start
```

Never commit real secrets, private credentials, access tokens, or API keys. Environment configuration must follow [`docs/SECURITY.md`](docs/SECURITY.md).

### Baseline verification

Run the checks applicable to the current project state:

```bash
npx expo-doctor
npx tsc --noEmit
npm run lint
```

Do not describe the application or a feature as tested unless the relevant checks and manual verification were actually completed.

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start Expo and open the Android development target |
| `npm run ios` | Start Expo and open the iOS development target where supported |
| `npm run web` | Start the web development target |
| `npm run lint` | Run the configured Expo lint checks |

## V1 Implementation Roadmap

Development follows the dependency order defined in [`docs/V1_IMPLEMENTATION_PLAN.md`](docs/V1_IMPLEMENTATION_PLAN.md):

- [x] Phase 0 — Project Readiness
- [ ] Phase 1 — Application Foundation *(in progress)*
- [ ] Phase 2 — Authentication and User Foundation
- [ ] Phase 3 — Core Focus Session System
- [ ] Phase 4 — Tasks and Goals
- [ ] Phase 5 — Streaks, Rewards, and Analytics
- [ ] Phase 6 — Settings, Notifications, and Accessibility
- [ ] Phase 7 — Assessment and approved AI Features
- [ ] Phase 8 — Synchronization and Recovery Hardening
- [ ] Phase 9 — Testing and Release Hardening
- [ ] Phase 10 — V1 Release

The reliable core focus-session system remains the highest implementation priority. Secondary features should not bypass incomplete foundations.

## Project Documentation

The documents in `docs/` are the primary implementation reference.

The [enterprise documentation revision](docs/revision/README.md) is a research-backed **draft for owner review** covering the expanded product, January Website/Account Portal, security, monetization and Luna task preparation. It records confirmed requests separately from proposed decisions and does not silently replace the canonical documents below. Resolve its approval gates and reconcile affected canonical contracts before implementing new scope or providers.

The revision also includes [Sri Lanka student/teacher research](docs/revision/10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) and [bounded education implementation contracts](docs/revision/11-SRI-LANKA-EDUCATION-CONTRACTS.md). These preserve the January Website/Account Portal requirement while keeping the full teacher LMS and real-user pilot behind their own scope/privacy gates.

### Product and scope

- [`PROJECT_VISION.md`](docs/PROJECT_VISION.md) — mission, long-term vision, and values;
- [`BLUEPRINT.md`](docs/BLUEPRINT.md) — product behavior, features, navigation, and roadmap;
- [`V1_FEATURE_SCOPE.md`](docs/V1_FEATURE_SCOPE.md) — canonical V1 user-facing feature list and release guardrails;
- [`V1_SCREEN_MAP.md`](docs/V1_SCREEN_MAP.md) — canonical V1 route, navigation, and route-versus-state map;
- [`POST_V1_FEATURE_SCOPE.md`](docs/POST_V1_FEATURE_SCOPE.md) — deferred V1.1 and longer-term feature directions;
- [`V1_IMPLEMENTATION_PLAN.md`](docs/V1_IMPLEMENTATION_PLAN.md) — approved V1 sequence, completion criteria, and scope control.

### Design and architecture

- [`UI_UX_DESIGN_SPECIFICATION.md`](docs/UI_UX_DESIGN_SPECIFICATION.md) — interface and interaction requirements;
- [`COMPONENT_LIBRARY.md`](docs/COMPONENT_LIBRARY.md) — approved reusable UI patterns;
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, data flow, navigation, security, and technology direction.

### Data, API, and security

- [`DATA_MODEL.md`](docs/DATA_MODEL.md) — domain entities, relationships, and lifecycle rules;
- [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — schema, constraints, and database responsibilities;
- [`API_SPEC.md`](docs/API_SPEC.md) — API contracts and endpoint behavior;
- [`SECURITY.md`](docs/SECURITY.md) — authentication, authorization, privacy, secrets, and secure-development requirements.

### Development and quality

- [`AGENTS.md`](AGENTS.md) — repository-wide instructions for AI assistants and contributors;
- [`AI_RULES.md`](docs/AI_RULES.md) — mandatory AI and project-development rules;
- [`DEVELOPMENT_GUIDE.md`](docs/DEVELOPMENT_GUIDE.md) — setup, coding standards, Git workflow, and engineering practices;
- [`TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) — testing levels and verification expectations;
- [`CONTRIBUTING.md`](docs/CONTRIBUTING.md) — contribution and review workflow;
- [`CHANGELOG.md`](docs/CHANGELOG.md) — documented project changes.

Before making a change, read [`AGENTS.md`](AGENTS.md), read [`docs/AI_RULES.md`](docs/AI_RULES.md) completely, and review every document relevant to the work.

## Contributing

Contributions should:

- stay within the approved V1 scope and current phase;
- remain small, focused, and reviewable;
- use established architecture, design tokens, and components;
- include appropriate testing and self-review;
- update affected documentation when behavior changes;
- use Conventional Commits such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`.

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the complete workflow.

## Security and Privacy

Security and privacy requirements apply from the beginning of development. Report security concerns responsibly and avoid placing sensitive details in public issues. See [`docs/SECURITY.md`](docs/SECURITY.md) for the approved project requirements.

## Author

Created by **Randunu Kaushan** while learning in public and building Deep Focus through documented, testable development stages.
