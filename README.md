# Deep Focus

> A calm, privacy-conscious productivity application for protecting attention, completing reliable focus sessions, and building sustainable work habits.

Deep Focus is being developed as a cross-platform mobile application for people who want to work with greater intention without turning productivity into constant pressure. It combines focused work, thoughtful recovery, progress insights, and optional AI assistance while keeping the user in control.

## Project Status

Deep Focus is currently in **Phase 0 — Project Readiness**.

- The primary V1 documentation set is complete.
- The initial React Native and Expo project foundation exists.
- Repository, dependencies, configuration, and development environments are being verified before V1 feature implementation begins.
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
- personal assessment and approved optional AI guidance;
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

Backend, database, authentication-provider, state-management, and AI-provider choices must not be treated as approved commitments until an implementation requirement and the project documentation explicitly approve them.

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

- [ ] Phase 0 — Project Readiness *(in progress)*
- [ ] Phase 1 — Application Foundation
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

### Product and scope

- [`PROJECT_VISION.md`](docs/PROJECT_VISION.md) — mission, long-term vision, and values;
- [`BLUEPRINT.md`](docs/BLUEPRINT.md) — product behavior, features, navigation, and roadmap;
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
