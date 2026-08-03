# Deep Focus AI Rules

This document defines the rules that every AI assistant, developer, and contributor must follow while working on the Deep Focus project.

These rules ensure consistency, maintainability, scalability, and a high-quality user experience across the entire application.

---

# 1. Documentation Rules

Always follow the project documentation before making any changes.

Required documentation:

- PRODUCT_REQUIREMENTS_DOCUMENT.md
- UI_UX_DESIGN_SPECIFICATION.md
- COMPONENT_LIBRARY.md
- DESIGN_SYSTEM.md
- DEVELOPMENT_GUIDE.md
- AI_RULES.md

Never ignore project documentation.

If documentation conflicts, ask before making changes.

---

# 2. Technology Rules

Always use:

- TypeScript
- React Native
- Expo
- Expo Router
- Functional Components
- React Hooks

Avoid outdated React Native patterns.

---

# 3. Architecture Rules

Always:

- Follow Clean Architecture
- Follow SOLID Principles
- Use reusable components
- Separate UI and business logic
- Keep components modular
- Write scalable code

Never duplicate code.

---

# 4. UI Rules

Always follow the Design System.

Never:

- Change brand colors
- Change typography scale
- Change spacing rules
- Change icon style
- Change design tokens

Always maintain visual consistency.

---

# 5. Component Rules

Before creating a new component:

- Check COMPONENT_LIBRARY.md
- Reuse existing components whenever possible

Every component should:

- Be reusable
- Be accessible
- Support Dark Mode
- Support future localization
- Support responsive layouts

---

# 6. User Experience Rules

Every screen should:

- Reduce cognitive load
- Minimize distractions
- Prioritize user focus
- Be easy to understand
- Require minimal user effort

Never introduce unnecessary complexity.

---

# 7. Accessibility Rules

Always:

- Support screen readers
- Use proper touch targets
- Maintain sufficient color contrast
- Respect reduced motion settings
- Support keyboard navigation where applicable

Accessibility is never optional.

---

# 8. Performance Rules

Always:

- Optimize rendering
- Avoid unnecessary re-renders
- Lazy load when appropriate
- Minimize memory usage
- Keep animations smooth

Performance should never be sacrificed for unnecessary visual effects.

---

# 9. AI Feature Rules

AI should:

- Respect user privacy
- Never interrupt focus sessions
- Provide contextual suggestions
- Avoid excessive notifications
- Explain recommendations clearly

AI should help users focus, not distract them.

---

# 10. Code Style Rules

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

# 11. Git Rules

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

# 12. Documentation Rules

Whenever functionality changes:

Update documentation if necessary.

Documentation must always stay synchronized with the implementation.

---

# 13. Future Scalability Rules

Every implementation should:

- Support future features
- Be easy to extend
- Avoid unnecessary coupling
- Keep architecture clean

Never implement shortcuts that reduce long-term maintainability.

---

# 14. AI Behavior Rules

AI assistants should:

- Explain important decisions
- Suggest improvements
- Respect existing architecture
- Ask before making breaking changes
- Never delete existing functionality without confirmation
- Never rewrite large sections unless requested

AI should improve the project while preserving its long-term vision.

---

# 15. Deep Focus Philosophy

Every decision should support the core philosophy of Deep Focus.

The application should always:

- Help users focus
- Reduce stress
- Minimize distractions
- Improve productivity
- Encourage healthy work habits
- Create a calm and consistent experience

If a feature does not support these goals, reconsider its implementation.

---

# Conclusion

These rules are mandatory for all future development.

Every AI assistant, developer, and contributor should follow this document to ensure that Deep Focus remains consistent, scalable, maintainable, and user-centered throughout its development lifecycle.