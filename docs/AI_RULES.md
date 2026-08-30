# Deep Focus AI Rules

This document defines the rules that every AI assistant, developer, and contributor must follow while working on the Deep Focus project.

These rules ensure consistency, maintainability, scalability, and a high-quality user experience across the entire application.

---

## 1. Documentation Rules

Always review the relevant project documentation before making changes.

Core project documentation includes:

- PROJECT_VISION.md
- BLUEPRINT.md
- V1_FEATURE_SCOPE.md
- POST_V1_FEATURE_SCOPE.md
- UI_UX_DESIGN_SPECIFICATION.md
- COMPONENT_LIBRARY.md
- ARCHITECTURE.md
- DEVELOPMENT_GUIDE.md
- TESTING_STRATEGY.md
- CONTRIBUTING.md
- AI_RULES.md

Project documentation defines the product vision, architecture, design direction, development standards, and implementation expectations for Deep Focus.

Never knowingly ignore documented project decisions.

If two documents appear to conflict, identify the conflict and request clarification before introducing a breaking or irreversible change.

For non-breaking work, avoid inventing a resolution to a meaningful documentation conflict. Clearly identify relevant assumptions or uncertainties when necessary.

---

## 2. Technology Rules

The Deep Focus mobile application should use the technology stack defined by the project's approved architecture.

For the primary mobile application, use:

- TypeScript
- React Native
- Expo
- Expo Router
- Functional Components
- React Hooks

Avoid outdated or deprecated React Native patterns.

Do not introduce a new framework, navigation system, state management solution, database, backend platform, or major dependency without first verifying that it aligns with the project architecture.

Technology choices should prioritize:

- Maintainability
- Cross-platform compatibility
- Performance
- Security
- Developer experience
- Long-term support

When project requirements require technology outside the primary mobile stack, follow the relevant architecture documentation rather than forcing React Native technologies into unrelated parts of the system.

---

## 3. Architecture Rules

Implementations should follow the architecture and engineering principles defined in the approved project documentation.

Prioritize:

- Clear separation of responsibilities
- Reusable components where appropriate
- Separation of UI and business logic where practical
- Modular implementation
- Maintainable code
- Testable design
- Appropriate use of established project patterns
- Low unnecessary coupling

Follow Clean Architecture and SOLID principles where they provide practical value and align with the approved project architecture.

Avoid unnecessary duplication, but do not introduce abstractions solely to eliminate small amounts of repeated code.

Architecture decisions should reflect actual product requirements rather than speculative future complexity.

---

## 4. UI Rules

All user interface implementation must follow the approved Deep Focus design documentation and established design tokens.

Do not arbitrarily change:

- Brand colors
- Typography
- Spacing
- Border radii
- Icon style
- Component states
- Layout patterns
- Animation behavior
- Design tokens

New UI patterns should only be introduced when existing patterns cannot appropriately solve the required user experience.

UI decisions should prioritize:

- Clarity
- Consistency
- Accessibility
- Calm visual hierarchy
- Low cognitive load
- Cross-platform usability

Do not introduce visual complexity solely for decoration.

When a design change affects established project-wide patterns, review the relevant documentation before implementation.

---

## 5. Component Rules

Before creating a new component:

- Review `COMPONENT_LIBRARY.md`
- Check whether an existing component can be reused
- Extend an existing component when appropriate
- Avoid duplicating existing functionality

Components should:

- Have a clear responsibility
- Be reusable where appropriate
- Be accessible
- Support Dark Mode where applicable
- Support responsive layouts
- Avoid hard-coded design values when design tokens are available
- Be structured to support future localization
- Keep business logic separate from presentation logic where practical

Do not create abstractions only for the sake of abstraction.

A component should be extracted or generalized when doing so improves consistency, reuse, testing, or maintainability.

---

## 6. User Experience Rules

Every screen should:

- Reduce cognitive load
- Minimize distractions
- Prioritize user focus
- Be easy to understand
- Require minimal user effort

Never introduce unnecessary complexity.

---

## 7. Accessibility Rules

Always:

- Support screen readers
- Use proper touch targets
- Maintain sufficient color contrast
- Respect reduced motion settings
- Support keyboard navigation where applicable

Accessibility is never optional.

---

## 8. Performance Rules

Always:

- Optimize rendering
- Avoid unnecessary re-renders
- Lazy load when appropriate
- Minimize memory usage
- Keep animations smooth

Performance should never be sacrificed for unnecessary visual effects.

---

## 9. AI Feature Rules

AI features in Deep Focus should support users without taking unnecessary control away from them.

AI should:

- Respect user privacy
- Support user autonomy
- Provide contextual and relevant suggestions
- Avoid excessive or unnecessary notifications
- Explain important recommendations clearly
- Avoid interrupting active focus sessions unless explicitly required by the user
- Handle unavailable or failed AI services gracefully
- Clearly distinguish AI-generated recommendations from confirmed user data
- Avoid presenting uncertain recommendations as guaranteed facts
- Request only the data necessary for the intended feature
- Present generated plans, reminders, task breakdowns, and task changes as reviewable proposals
- Require explicit user confirmation before applying any proposed task, reminder, goal, schedule, or settings change
- Apply only the exact confirmed items and validate them through the normal application boundary
- Keep AI access and rewarded-unlock state server-authoritative where trusted usage limits or advertisement verification are required

AI should not:

- Manipulate users into increasing engagement
- Create unnecessary dependency on AI features
- Make irreversible decisions without appropriate user control
- Expose sensitive user information
- Silently change important user settings
- Distract users from active focus sessions
- Treat a client-only rewarded-ad completion claim as trusted proof
- Display rewarded advertising during an active Focus Session or True Zen Break

Users should remain able to ignore, dismiss, or disable optional AI recommendations where appropriate.

For the approved V1 scope, `Plan My Day` is required, while `Break Down This Task` and `Review My Day Lite` remain conditional on the release guardrails in `V1_FEATURE_SCOPE.md`. Voice AI, long-form AI chat, automatic rescheduling, and AI weekly planning remain post-V1 capabilities unless a later approved scope decision promotes them.

AI features should degrade gracefully when AI services are unavailable so that core Deep Focus functionality can continue whenever possible.

AI should help users understand and improve their productivity patterns while preserving privacy, transparency, and user control.

---

## 10. Code Style Rules

Write code that is:

- Readable
- Maintainable
- Modular
- Consistent
- Well organized

Use meaningful:

- Variable names
- Function names
- Component names

Avoid:

- Magic numbers
- Deep nesting
- Large components
- Unused code

---

## 11. Git Rules

Always:

- Use Conventional Commits
- Commit small logical changes
- Write meaningful commit messages

Never:

- Commit broken code
- Commit secrets
- Commit API keys
- Commit unfinished work without explanation

---

## 12. Documentation Maintenance Rules

Whenever functionality changes:

- Review the related project documentation
- Update documentation when necessary
- Remove outdated information
- Keep documentation synchronized with the implementation

Documentation should accurately represent the current state of the project.

Documentation updates should be included as part of the development process rather than postponed until later.

---

## 13. Future Scalability Rules

Implementations should support reasonable future evolution without unnecessarily increasing present-day complexity.

Prefer:

- Clear module boundaries
- Low unnecessary coupling
- Maintainable interfaces
- Replaceable implementations where justified
- Reuse where it provides practical value
- Architecture that can evolve with validated requirements

Do not build speculative infrastructure solely for features that may never be implemented.

Do not introduce shortcuts that create known security, reliability, privacy, or significant maintainability problems merely to reduce short-term development effort.

When a trade-off between current simplicity and future flexibility is necessary, choose the approach that best fits documented requirements and clearly identify important consequences.

---

## 14. AI Behavior Rules

AI assistants working on Deep Focus should act as careful project contributors rather than making uncontrolled project decisions.

AI assistants should:

- Review relevant project documentation before making changes
- Respect the existing architecture and design system
- Preserve existing functionality unless a change is explicitly required
- Explain important technical or architectural decisions
- Suggest improvements when they provide clear project value
- Ask for clarification when project documentation contains meaningful conflicts
- Ask before making breaking or irreversible changes
- Keep changes focused on the requested task
- Prefer small, reviewable changes over unnecessary large rewrites
- Clearly identify assumptions when requirements are incomplete
- Update related documentation when implementation decisions change documented behavior

AI assistants should not:

- Delete existing functionality without confirmation
- Rewrite large sections of the project without a clear reason
- Invent undocumented product requirements and present them as approved decisions
- Introduce major dependencies without justification
- Change established architecture without approval
- Change the Design System arbitrarily
- Expose, commit, or request secrets unnecessarily
- Claim that code has been tested when it has not actually been verified
- Hide known limitations, uncertainty, or implementation risks

When documentation conflicts, the AI assistant should identify the conflict rather than silently choosing one interpretation.

When a requested change may significantly affect architecture, security, privacy, user data, or existing functionality, the AI assistant should explain the impact before proceeding.

AI should improve Deep Focus while preserving the project's long-term vision, maintainability, and user experience.

---

## 15. Deep Focus Philosophy

Every decision should support the core philosophy of Deep Focus.

The application should aim to:

- Help users protect their attention
- Minimize unnecessary distractions
- Support meaningful productivity
- Encourage sustainable work habits
- Support appropriate recovery
- Preserve user control
- Create a calm and consistent experience
- Avoid unnecessary pressure to work longer or engage with the application more frequently

Features should be evaluated according to whether they provide meaningful user value and align with the broader Deep Focus mission.

If a feature conflicts with these principles, its design or implementation should be reconsidered.

---

## Conclusion

These rules are mandatory for all future development.

Every AI assistant, developer, and contributor should follow this document to ensure that Deep Focus remains consistent, scalable, maintainable, and user-centered throughout its development lifecycle.
