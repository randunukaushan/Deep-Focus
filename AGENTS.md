# Deep Focus Agent Instructions

These instructions apply to the entire repository. Every AI assistant and contributor must follow them before planning, editing code, changing configuration, or updating documentation.

## Project Mission

Deep Focus is a calm, privacy-conscious productivity application that helps users protect their attention, complete reliable focus sessions, recover appropriately, and understand sustainable work patterns.

Every change must preserve these principles:

- protect attention and minimize distraction;
- support meaningful, sustainable productivity;
- keep users in control;
- maintain a calm, accessible, and consistent experience;
- avoid manipulative engagement, unnecessary pressure, gambling, and real-money or cash rewards.

## Mandatory Documentation Check

Before making any change:

1. Read `docs/AI_RULES.md` completely.
2. Read the documents relevant to the requested work.
3. Inspect the current implementation and configuration instead of assuming the documentation has already been implemented.
4. Confirm that the work belongs to the approved V1 scope and current implementation phase.

Use this routing guide:

| Work area | Required references |
| --- | --- |
| Product purpose, user value, or feature scope | `docs/PROJECT_VISION.md`, `docs/BLUEPRINT.md`, `docs/V1_IMPLEMENTATION_PLAN.md` |
| Architecture, folders, state, navigation, services, or dependencies | `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT_GUIDE.md` |
| UI, interaction, tokens, responsive behavior, or accessibility | `docs/UI_UX_DESIGN_SPECIFICATION.md`, `docs/COMPONENT_LIBRARY.md` |
| Domain entities or lifecycle rules | `docs/DATA_MODEL.md` |
| API contracts or remote behavior | `docs/API_SPEC.md`, `docs/SECURITY.md` |
| Database schema, constraints, ownership, or migrations | `docs/DATABASE_SCHEMA.md`, `docs/DATA_MODEL.md`, `docs/SECURITY.md` |
| Authentication, secrets, privacy, permissions, logging, or AI data | `docs/SECURITY.md` |
| Tests, verification, regression, or release quality | `docs/TESTING_STRATEGY.md`, `docs/V1_IMPLEMENTATION_PLAN.md` |
| Workflow, review, commits, or pull requests | `docs/CONTRIBUTING.md`, `docs/DEVELOPMENT_GUIDE.md` |
| Version or completed user-visible change | `docs/CHANGELOG.md` |

The approved documents are the primary implementation reference. Do not silently redefine documented behavior or treat planned functionality as already implemented.

If relevant documents conflict:

- identify the exact conflict;
- do not invent a product or architecture decision;
- ask the project owner before a breaking, irreversible, security-sensitive, or scope-changing decision;
- for safe non-breaking work, state any necessary assumption clearly.

## Current Implementation Direction

Development begins with Phase 0 and follows the dependency order in `docs/V1_IMPLEMENTATION_PLAN.md`:

1. Project Readiness
2. Application Foundation
3. Authentication and User Foundation
4. Core Focus Session System
5. Tasks and Goals
6. Streaks, Rewards, and Analytics
7. Settings, Notifications, and Accessibility
8. Assessment and approved AI Features
9. Synchronization and Recovery Hardening
10. Testing and Release Hardening
11. V1 Release

Do not skip incomplete foundation work to start an easier secondary feature. Build small, working vertical slices. The reliable focus-session flow remains the highest V1 priority:

`configure -> start -> pause/resume when supported -> complete/cancel -> persist -> recover -> update verified progress`

## Technology Rules

The primary mobile stack is:

- TypeScript;
- React Native;
- Expo SDK 57;
- Expo Router;
- functional React components;
- React Hooks.

Before writing Expo-specific code, consult the exact Expo SDK 57 documentation at <https://docs.expo.dev/versions/v57.0.0/> and verify compatibility with the versions in `package.json`.

Do not add or replace a framework, routing system, state-management solution, database, backend platform, AI provider, or major dependency without documented need and project-owner approval. Do not treat Firebase, Firestore, or Firebase Authentication as approved mandatory dependencies unless a later documented decision explicitly selects them.

Prefer project-local tooling and supported, actively maintained Expo/React Native patterns. Keep `package-lock.json` synchronized when dependencies change.

## Architecture and Code Rules

- Follow the layers, dependency direction, and project structure in `docs/ARCHITECTURE.md`.
- Keep route and presentation files focused on composition and navigation.
- Keep business rules, data access, storage, and external-service logic out of UI components when practical.
- Reuse existing components, hooks, services, repositories, types, utilities, and design tokens before creating new ones.
- Add abstractions only when they improve consistency, reuse, testing, or maintainability.
- Keep state close to its owner; do not duplicate sources of truth or persist easily derived state without a documented reason.
- Write readable, strongly typed TypeScript. Avoid unnecessary `any`, magic numbers, deep nesting, large mixed-responsibility files, dead code, circular dependencies, and unsafe type assertions.
- Handle loading, empty, success, error, retry, and interrupted states where relevant.
- Preserve Android and iOS compatibility and account for platform differences explicitly.
- Preserve existing functionality unless the requested change requires otherwise.
- Do not delete functionality, perform a large rewrite, or make a breaking/irreversible change without explicit approval.

For focus sessions, elapsed time and completion must be derived from reliable timestamps and lifecycle state, not from UI interval ticks alone. Persistence, background/foreground behavior, recovery, idempotent completion, and data integrity are part of correctness.

## UI and Accessibility Rules

- Use the approved colors, typography, spacing, radii, icon style, component states, layout patterns, animations, and tokens.
- Check `docs/COMPONENT_LIBRARY.md` before creating a component.
- Do not hard-code design values when an approved token exists.
- Keep the interface calm, clear, responsive, and low in cognitive load.
- Support light/dark behavior where specified, dynamic text, sufficient contrast, screen readers, logical focus order, keyboard behavior where applicable, and adequate touch targets.
- Do not rely on color alone to convey meaning.
- Respect reduced-motion preferences and avoid decorative effects that harm clarity or performance.

Accessibility is a requirement, not a later enhancement.

## Security and Privacy Rules

- Never commit, expose, request unnecessarily, or log secrets, API keys, access tokens, private credentials, or sensitive user data.
- Keep private provider credentials in trusted infrastructure, never in the mobile bundle or public Expo environment variables.
- Store authentication credentials only through an approved secure-storage mechanism.
- Treat all client input and external responses as untrusted; validate them at the correct boundary.
- Enforce authentication, ownership, authorization, reward processing, and protected data rules on trusted infrastructure. Never trust a client-supplied owner ID.
- Apply least privilege, secure defaults, HTTPS, data minimization, safe errors, rate limits where relevant, and duplicate/replay protection for non-idempotent operations.
- Avoid leaking implementation details, user data, tokens, or credentials through errors, analytics, screenshots, clipboard use, or logs.
- Account deletion, data deletion, retention, export, and sign-out behavior must follow `docs/SECURITY.md` and the approved data contracts.

## AI Feature Rules

AI is optional support, not a dependency for the core focus experience.

- Keep AI features private, transparent, explainable, dismissible, and user-controlled.
- Clearly distinguish AI suggestions from confirmed user data.
- Send only the minimum approved context to AI services.
- Validate AI output and fail safely.
- Never let AI make security-critical, irreversible, or silent settings decisions.
- Do not interrupt an active focus session unless the user explicitly enabled the behavior.
- Core focus functionality should continue when AI or the network is unavailable whenever practical.

## Change Workflow

For every meaningful task:

1. Inspect the repository state and relevant documents.
2. State the intended scope and affected areas.
3. Implement the smallest coherent change.
4. Add or update tests appropriate to the risk.
5. Run relevant verification.
6. Review the diff for unrelated edits, debugging output, secrets, accessibility regressions, and documentation impact.
7. Update affected documentation and `docs/CHANGELOG.md` when required.
8. Use a small Conventional Commit such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`.

Do not overwrite or discard unrelated work. Do not commit generated, temporary, secret, or unexplained experimental files.

## Verification and Definition of Done

Use the scripts actually present in `package.json`. For the current project, baseline checks include, when applicable:

```bash
npm install
npx expo-doctor
npx tsc --noEmit
npm run lint
```

Also run relevant automated tests and perform platform/manual checks required by `docs/TESTING_STRATEGY.md`. A UI-only check is insufficient for lifecycle, persistence, security, synchronization, or focus-timer changes.

Never say a change is tested, working, or complete unless the claimed verification was actually performed. If a check could not be run, state that clearly with the reason.

A change is done only when applicable requirements are satisfied:

- documented behavior is implemented;
- loading, empty, success, and error states work;
- validation and authorization are correct;
- persistence, offline, recovery, and duplicate protection work where required;
- accessibility is addressed;
- relevant tests and checks pass;
- no known critical defect remains;
- affected documentation is synchronized.

## Required Handoff

When finishing a task, report:

- documents consulted;
- files changed and the reason;
- verification commands and results;
- anything not verified;
- assumptions, known limitations, risks, or documentation conflicts;
- the next V1 implementation step when useful.

Keep every change focused, reviewable, and aligned with Deep Focus V1.
