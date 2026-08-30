# Deep Focus UI/UX Design Specification

---

## Overview

This document defines the visual design principles, user experience standards, interaction patterns, navigation behavior, screen structure, reusable interface patterns, motion guidance, color system, typography, accessibility expectations, and responsive behavior of the Deep Focus platform.

It serves as the primary UI/UX reference for designers, developers, AI assistants, reviewers, and future contributors working on the Deep Focus user experience.

The objective is to create a calm, clear, accessible, distraction-conscious, and trustworthy interface that helps users perform meaningful work without making the application itself a source of unnecessary cognitive load.

Every screen, component, interaction, animation, and visual state should follow a consistent design language and remain aligned with the broader Deep Focus product philosophy.

UI/UX decisions should also remain consistent with the relevant project documentation, including:

- `PROJECT_VISION.md`
- `BLUEPRINT.md`
- `COMPONENT_LIBRARY.md`
- `ARCHITECTURE.md`
- `AI_RULES.md`

When a proposed design conflicts with an established project-wide decision, the conflict should be reviewed before implementation rather than resolved through an undocumented assumption.

---

## 1. Design Philosophy

The Deep Focus interface is built around one central principle:

> **The interface should help users focus on their work—not on the application itself.**

Every visual element, interaction, transition, notification, recommendation, and screen should support meaningful user goals while reducing unnecessary cognitive effort.

Deep Focus should not compete for attention through excessive animation, visual noise, artificial urgency, manipulative engagement patterns, or unnecessary interface complexity.

Instead, the application should provide a calm and predictable environment that helps users protect their attention, understand their current state, and complete important actions with minimal friction.

The design philosophy is guided by the following principles.

---

### Calm by Default

Every screen should feel balanced, intentional, and visually comfortable.

Whitespace, typography, color, spacing, hierarchy, and motion should work together to reduce unnecessary stimulation and support sustained attention.

Calm design does not mean removing useful information. It means presenting information with clear prioritization and without unnecessary visual competition.

---

### Clarity Over Complexity

Users should be able to understand the purpose of a screen and its primary actions without unnecessary learning.

Important actions should be easy to discover and understand.

Secondary actions should remain accessible without competing visually with the user's primary task.

When a simpler interaction can achieve the same user goal without reducing capability or accessibility, the simpler interaction should generally be preferred.

---

### Purposeful Design

Every interface element should provide meaningful value.

Components, text, icons, animations, notifications, and decorative elements should exist because they improve:

- Understanding
- Navigation
- Feedback
- Accessibility
- Decision-making
- Task completion
- Focus

Elements that provide no meaningful user value should not be introduced solely for decoration or engagement.

---

### Focus First

The interface should protect user attention before attempting to increase interaction with the application.

During active focus experiences, unnecessary controls, recommendations, animations, notifications, and secondary information should be minimized.

The application should avoid interrupting active focus unless:

- The user explicitly requested the interruption
- An important session event requires feedback
- A safety, security, or critical system condition requires attention

Focus-related interfaces should make the current task and session state immediately understandable.

---

### Intelligent Assistance

Artificial Intelligence should behave as supportive guidance rather than an authority over the user's workflow.

AI recommendations should be:

- Relevant
- Understandable
- Clearly identifiable
- Dismissible where appropriate
- Optional where appropriate
- Respectful of user preferences
- Non-disruptive during active focus

Important AI recommendations should provide sufficient context for users to understand why the suggestion was generated whenever practical.

Users should remain responsible for decisions that meaningfully affect their goals, schedules, settings, productivity data, or work habits.

---

### Consistency Builds Confidence

Design patterns should remain predictable throughout the application.

Consistency should apply to:

- Navigation
- Terminology
- Typography
- Spacing
- Colors
- Icons
- Component behavior
- Feedback states
- Gestures
- Motion
- Error handling
- Accessibility behavior

Equivalent actions should behave similarly across different areas of the product.

Consistency reduces cognitive effort and helps users build familiarity with the application over time.

---

### Accessibility for Everyone

Accessibility is a core design requirement.

Deep Focus interfaces should be designed to support users with different visual, motor, auditory, and cognitive needs.

Design decisions should consider:

- Screen-reader compatibility
- Sufficient color contrast
- Appropriate touch targets
- Clear focus states where applicable
- Reduced-motion preferences
- Text scaling
- Understandable labels
- Logical navigation order
- Alternatives to color-only communication

Accessibility should be considered during design and implementation rather than added only after a feature is completed.

---

### User Control and Predictability

Users should understand what will happen before important actions are performed.

The interface should avoid unexpected changes to:

- User settings
- Focus sessions
- Goals
- Stored data
- Notifications
- AI preferences
- Account information

Destructive or difficult-to-reverse actions should provide appropriate confirmation.

The interface should provide clear feedback after meaningful user actions so users understand whether an operation succeeded, failed, or requires additional attention.

---

### Progressive Disclosure

Deep Focus should avoid displaying every available option at once.

Primary information and actions should receive visual priority, while advanced or less frequently used controls may be revealed when they become relevant.

Progressive disclosure should reduce complexity without hiding information that users reasonably need to complete their current task.

---

### Continuous Evolution

The Deep Focus design system should evolve as the product grows while preserving familiarity and consistency.

New interface patterns should first consider whether existing components or interaction patterns can solve the requirement.

New patterns should be introduced when they provide clear user value and cannot be appropriately represented by the established design system.

Significant design-system changes should be documented and reviewed before they become project-wide standards.

---

### Design Philosophy Summary

The Deep Focus interface should feel:

- Calm
- Clear
- Predictable
- Accessible
- Purposeful
- Supportive
- Trustworthy
- Consistent

The interface should provide enough guidance to help users act confidently while remaining visually quiet enough to keep attention on meaningful work.

The goal is not to make Deep Focus visually impressive at the expense of usability.

The goal is to create an experience that becomes naturally understandable and unobtrusive, allowing users to focus more on their work and less on operating the software.

---

## 2. Design Principles

The Deep Focus interface follows a consistent set of design principles that guide every screen, component, interaction, and future user experience.

These principles translate the broader Deep Focus design philosophy into practical standards that should inform design and implementation decisions throughout the platform.

When design decisions involve competing priorities, clarity, accessibility, user control, and support for meaningful focus should take priority over unnecessary visual complexity.

---

### 1. Simplicity First

Interfaces should present the information and actions necessary for the user's current task without unnecessary complexity.

Designs should:

- Prioritize primary actions
- Reduce unnecessary choices
- Avoid visual clutter
- Use familiar interaction patterns where appropriate
- Keep workflows as short as reasonably possible
- Avoid requiring users to remember information unnecessarily between steps

Simplicity should not remove important functionality, context, accessibility, or user control.

---

### 2. Clear Visual Hierarchy

Users should be able to quickly understand what deserves their attention and what actions are available.

Visual hierarchy should be established through intentional use of:

- Typography
- Spacing
- Position
- Scale
- Contrast
- Color
- Component grouping

Primary content and actions should receive appropriate emphasis without making secondary information difficult to discover.

Visual hierarchy should remain understandable without relying on color alone.

---

### 3. Consistency Across the Platform

Equivalent elements and interactions should behave consistently throughout Deep Focus.

Consistency should apply to:

- Colors
- Typography
- Spacing
- Icons
- Buttons
- Inputs
- Cards
- Navigation
- Gestures
- Component states
- Feedback patterns
- Motion behavior
- Terminology

Existing design-system patterns and reusable components should be preferred before introducing new patterns.

Consistency should reduce learning effort without preventing justified improvements to the design system.

---

### 4. Focus-Oriented Design

Every screen should support the user's current goal while minimizing unnecessary competition for attention.

During active focus sessions, the interface should reduce nonessential information, controls, recommendations, animations, and interruptions.

Notifications, visual effects, or AI suggestions should not interrupt active focus unless:

- The user explicitly enabled or requested them
- A relevant session event requires feedback
- A critical system, security, or safety condition requires attention

Focus protection should take priority over unnecessary engagement.

---

### 5. Meaningful Feedback

Important user actions should produce clear and timely feedback.

The interface should communicate relevant system states such as:

- Loading
- Success
- Empty
- Offline
- Disabled
- In progress
- Recoverable error
- Blocking error

Feedback should explain what happened and, when appropriate, what the user can do next.

The interface should avoid excessive confirmations, alerts, or success messages for routine actions when the resulting state is already obvious.

---

### 6. Progressive Disclosure

Advanced options and secondary actions should appear when they become relevant rather than competing with primary tasks.

Progressive disclosure should:

- Keep common workflows simple
- Reduce initial cognitive load
- Preserve access to advanced functionality
- Reveal additional complexity intentionally
- Avoid hiding information required for informed decisions

Users should not be forced through unnecessary steps simply to maintain a visually minimal interface.

---

### 7. Accessibility by Design

Accessibility should be considered throughout design, implementation, testing, and future refinement.

Interfaces should support, where applicable:

- Screen readers
- Sufficient color contrast
- Appropriate touch targets
- Text scaling
- Clear labels
- Logical reading and navigation order
- Keyboard navigation
- Visible focus indicators
- Reduced-motion preferences
- Alternatives to color-only communication

Accessibility should remain compatible with the calm and simple Deep Focus experience rather than being treated as a separate design mode.

---

### 8. Responsive and Adaptive Experience

Deep Focus should remain usable and visually balanced across supported screen sizes, orientations, and device configurations.

Responsive behavior should:

- Preserve content hierarchy
- Maintain readable text
- Maintain usable touch targets
- Avoid clipped or overlapping content
- Adapt spacing and layout where necessary
- Respect safe areas and platform-specific interface constraints
- Support accessibility-driven text scaling

Responsive design should adapt the experience rather than simply scaling every element proportionally.

---

### 9. Performance-Oriented Design

Design decisions should support a responsive and reliable application.

Interfaces should avoid unnecessary visual or interaction patterns that create excessive rendering, memory usage, battery consumption, or processing work.

Performance-sensitive experiences should prioritize:

- Responsive interactions
- Efficient rendering
- Lightweight visual effects
- Appropriate asset sizes
- Efficient animations
- Stable focus-session timing

Visual polish should not compromise reliability or responsiveness.

---

### 10. Human-Centered AI

Artificial Intelligence should support user decisions rather than replace user judgment or control.

AI experiences should be:

- Clearly identifiable
- Relevant
- Explainable where practical
- Optional where appropriate
- Dismissible where appropriate
- Respectful of privacy
- Non-disruptive
- Easy to understand

AI recommendations should not be presented as guaranteed facts when uncertainty exists.

AI should not silently change important user settings, goals, schedules, or productivity data.

---

### 11. Scalable Design System

The Deep Focus design system should support future product growth without requiring unnecessary redesign of established experiences.

Components and patterns should:

- Be reusable where appropriate
- Support predictable variants and states
- Use established design tokens
- Remain accessible
- Support responsive behavior
- Support future localization
- Avoid unnecessary feature-specific duplication

Not every component needs to be generalized.

Reusable abstractions should be introduced when they improve consistency, maintainability, accessibility, or meaningful reuse.

---

### 12. Delight Through Subtlety

A polished experience should come from thoughtful details rather than excessive decoration.

Micro-interactions, transitions, animation, haptic feedback, and sound may be used when they improve:

- Understanding
- Feedback
- Orientation
- Perceived continuity
- Task completion

These effects should remain calm, purposeful, and optional where user preferences or accessibility requirements make that appropriate.

Reduced-motion preferences should always be respected.

If a decorative effect competes with focus, accessibility, performance, or clarity, those priorities should take precedence.

---

### Design Principle Application

These principles should guide the creation and review of every Deep Focus screen, component, workflow, and interaction.

When introducing a new design pattern, contributors should consider:

- Does it help the user complete a meaningful task?
- Does it preserve clarity and focus?
- Is an established pattern already suitable?
- Is it accessible?
- Does it preserve user control?
- Does it perform reliably on supported devices?
- Does it remain consistent with the Deep Focus design system?

New design decisions should strengthen the overall experience rather than introduce complexity without meaningful user value.

---

## 3. Color System

The Deep Focus color system is designed to create a calm, modern, accessible, and distraction-free environment that supports sustained attention and healthy productivity.

Color should establish visual hierarchy, communicate meaningful states, reinforce the Deep Focus identity, and provide clear feedback without unnecessarily competing for the user's attention.

Highly saturated or attention-demanding colors should be used intentionally rather than decoratively.

The color system should be implemented through reusable design tokens rather than repeated hard-coded values throughout application components.

---

### 1. Design Goals

The color system should:

- Reduce visual fatigue during extended use
- Promote a calm and distraction-free experience
- Create a recognizable and modern visual identity
- Clearly communicate actions and application states
- Maintain sufficient accessibility contrast
- Support both Light Mode and Dark Mode
- Remain consistent across screens and components
- Scale across future features
- Avoid relying on color alone to communicate meaning

---

### 2. Primary Brand Color

**Deep Indigo**

```text
#4F46E5
```

Deep Indigo is the primary Deep Focus brand color.

**Represents**

- Focus
- Trust
- Intelligence
- Purposeful technology

**Used for**

- Primary buttons
- Active navigation states
- Focus session accents
- Progress indicators
- Selected controls
- Important interactive highlights

Deep Indigo should not be applied to large areas unnecessarily when doing so increases visual intensity or reduces readability.

---

### 3. Secondary Color

**Calm Teal**

```text
#14B8A6
```

Calm Teal represents recovery, balance, and sustainable productivity.

**Represents**

- Balance
- Recovery
- Calmness
- Sustainable productivity

**Used for**

- Recovery screens
- Break-related interfaces
- Wellness-oriented indicators
- Positive recovery guidance
- Supporting visual accents

Calm Teal should remain visually distinct from semantic Success states when both meanings appear within the same context.

---

### 4. AI Accent Color

**Soft Purple**

```text
#8B5CF6
```

Soft Purple provides a recognizable accent for AI-assisted experiences.

**Represents**

- Artificial Intelligence
- Personalization
- Smart coaching
- Intelligent insights

**Used for**

- AI recommendations
- AI Assistant experiences
- AI-generated insights
- Personalized suggestions
- Intelligent guidance indicators

Color alone should not identify AI-generated content.

AI-assisted information should also include appropriate labels, icons, or supporting context.

---

### 5. Semantic Colors

Semantic colors communicate application states and should maintain consistent meaning throughout Deep Focus.

#### Success Color

```text
#22C55E
```

**Used for**

- Successful actions
- Completed sessions
- Goal completion
- Confirmed operations
- Positive status feedback

Success color should not be used merely as decoration.

#### Warning Color

```text
#F59E0B
```

**Used for**

- Actions requiring attention
- Recovery reminders
- Potentially problematic conditions
- Important non-critical notices

Warnings should communicate caution without creating unnecessary alarm.

Well-being-related warnings should not imply medical certainty or diagnosis.

#### Error Color

```text
#EF4444
```

**Used for**

- Failed operations
- Validation errors
- Destructive-action warnings
- Critical application states

Error states should normally include understandable text or another accessible indication in addition to color.

#### Achievement Accent

```text
#FBBF24
```

**Used for**

- Milestones
- Achievement indicators
- Reward progression
- Celebratory states

Achievement styling should remain subtle enough that rewards do not compete with the application's focus-oriented experience.

---

### 6. Light Theme

#### Background

```text
#F8FAFC
```

Used for the primary application background.

#### Surface

```text
#FFFFFF
```

Used for cards, panels, dialogs, inputs, and other foreground surfaces where appropriate.

#### Border

```text
#E2E8F0
```

Used for subtle structural separation.

#### Primary Text

```text
#0F172A
```

Used for headings, primary content, and important information.

#### Secondary Text

```text
#475569
```

Used for supporting information and secondary content.

#### Muted Text

```text
#64748B
```

Used for lower-emphasis information when accessibility requirements remain satisfied.

---

### 7. Dark Theme

#### Background

```text
#0F172A
```

Used for the primary dark-theme background.

#### Surface

```text
#1E293B
```

Used for cards, panels, dialogs, and other foreground surfaces.

#### Elevated Surface

```text
#334155
```

Used to distinguish elevated or nested surfaces where additional separation is required.

#### Primary Text

```text
#F8FAFC
```

Used for headings, primary content, and high-emphasis information.

#### Secondary Text

```text
#CBD5E1
```

Used for supporting information.

#### Muted Text

```text
#94A3B8
```

Used for lower-emphasis information when accessibility requirements remain satisfied.

Dark Mode should be designed intentionally rather than created by automatically inverting Light Mode colors.

---

### 8. Semantic Design Tokens

Application components should use semantic color tokens instead of directly depending on raw hexadecimal values wherever practical.

Example semantic roles include:

```text
color.background
color.surface
color.surfaceElevated

color.textPrimary
color.textSecondary
color.textMuted

color.border
color.borderStrong

color.primary
color.secondary
color.aiAccent

color.success
color.warning
color.error
color.achievement
```

Additional tokens may be introduced when actual component requirements justify them.

Raw palette values should remain centralized within the theme system.

This allows visual values to evolve without requiring widespread component-level changes.

---

### 9. Interactive Color States

Interactive components should define predictable visual states.

Relevant states may include:

- Default
- Pressed
- Focused
- Selected
- Disabled
- Loading
- Error

State differences should remain visible without creating excessive visual change.

Disabled controls should remain identifiable and readable while clearly communicating that interaction is unavailable.

Focus indicators should remain sufficiently visible where applicable.

Color should not be the only indicator distinguishing important interaction states.

---

### 10. State-Based Color Language

Deep Focus may adapt supporting accent colors according to the user's current context while preserving the underlying design system.

#### Focus Session

**Primary Accent:** Deep Indigo

Focus session interfaces should minimize competing colors and emphasize only information required for the active session.

Typical emphasized elements may include:

- Timer
- Session progress
- Primary session controls
- Current session status

#### Recovery Mode

**Primary Accent:** Calm Teal

Recovery experiences may use Calm Teal to create visual distinction from active focus periods.

The interface should remain calm and avoid unnecessary stimulation during recovery.

#### AI-Assisted Experiences

**Primary Accent:** Soft Purple

AI-generated recommendations and insights may use Soft Purple as a supporting identifier.

AI content should also be explicitly identified through text, icons, or other accessible indicators.

#### Achievements and Rewards

**Primary Accent:** Achievement Accent

Achievement styling may highlight meaningful milestones without turning the interface into an engagement-driven reward system.

Celebratory color should remain secondary to the user's actual productivity goals.

---

### 11. Surface and Elevation Colors

Surface differences should communicate structure rather than decoration.

Background, surface, and elevated-surface colors may distinguish:

- Application backgrounds
- Cards
- Dialogs
- Bottom sheets
- Menus
- Input areas
- Elevated controls

Elevation should not depend exclusively on shadows.

Surface contrast, borders, and spacing may also establish hierarchy, particularly in Dark Mode.

---

### 12. Borders and Dividers

Borders and dividers should provide subtle structural separation.

They should:

- Remain visually quiet
- Maintain sufficient visibility
- Avoid unnecessary use
- Adapt appropriately between Light and Dark themes
- Support component state communication where necessary

Spacing should be preferred over dividers when separation can be communicated clearly without additional visual elements.

---

### 13. Overlays

Dialogs, sheets, menus, and other temporary layers may use overlays to separate active content from the underlying interface.

Overlays should:

- Preserve sufficient context
- Avoid excessive darkness
- Maintain readable foreground content
- Support accessible modal interaction
- Remain consistent throughout the application

Overlay values should be defined through design tokens rather than selected independently for individual screens.

---

### 14. Accessibility and Contrast

Color usage should satisfy applicable WCAG accessibility requirements.

Design and implementation should verify contrast for important combinations including:

- Text against backgrounds
- Text inside buttons
- Icons against surfaces
- Input borders and states
- Focus indicators
- Error messages
- Disabled controls
- Interactive elements

Normal text should generally target a contrast ratio of at least:

```text
4.5:1
```

Large text should generally target a contrast ratio of at least:

```text
3:1
```

Where applicable, meaningful non-text interface elements should also maintain sufficient contrast against adjacent colors.

Contrast should be verified using the actual foreground and background combinations used in the interface rather than assuming that an individual palette color is accessible.

---

### 15. Never Rely on Color Alone

Important information should never be communicated exclusively through color.

Meaning should also be reinforced using appropriate combinations of:

- Text
- Icons
- Labels
- Shapes
- Position
- Component states

For example, a validation error should not be communicated only by changing an input border to red.

An understandable error message or another accessible indication should also be provided.

---

### 16. Color Usage Rules

Color should be applied intentionally throughout Deep Focus.

Avoid:

- Excessive accent colors on a single screen
- Decorative use of semantic colors
- Unnecessary gradients
- Highly saturated backgrounds during focus experiences
- Inconsistent meanings for the same semantic color
- Hard-coded component colors when an appropriate token exists
- Color combinations that fail accessibility requirements

When multiple accent colors appear together, the primary task should retain the strongest visual emphasis.

---

### 17. Color System Governance

New colors should not be introduced simply to differentiate individual features.

Before adding a new color, contributors should determine whether:

- An existing semantic token already represents the required meaning
- The new color has a reusable purpose
- The color works appropriately in both Light Mode and Dark Mode
- Required contrast can be maintained
- The color remains consistent with the Deep Focus visual identity
- The addition introduces unnecessary visual complexity

Approved colors and semantic tokens should be documented and maintained centrally.

---

### 18. Color System Principles

Every use of color in Deep Focus should:

- Support clarity
- Preserve accessibility
- Reduce unnecessary visual stimulation
- Maintain semantic consistency
- Work across supported themes
- Reinforce meaningful hierarchy
- Use centralized design tokens where practical
- Support the user's current task
- Remain scalable as the product evolves

Color should guide attention carefully rather than compete for it.

---

## 4. Typography

Typography plays a critical role in creating a calm, readable, accessible, and distraction-free Deep Focus experience.

The typography system should establish clear information hierarchy while remaining comfortable during extended focus sessions.

Typography should be implemented through reusable design tokens rather than repeated hard-coded values throughout individual components.

---

### 1. Typography Goals

The typography system should:

- Maximize readability
- Create clear visual hierarchy
- Reduce visual fatigue during extended use
- Maintain consistency across screens and components
- Support different screen sizes
- Support accessibility settings
- Remain readable in both Light Mode and Dark Mode
- Support future localization
- Scale consistently as the product grows

Typography should communicate importance through size, weight, spacing, and placement rather than relying primarily on color.

---

### 2. Primary Font Family

**Inter**

Inter is the primary Deep Focus typeface.

It provides a modern and neutral visual appearance while maintaining strong readability across interface sizes.

Inter may be used for:

- Screen titles
- Section headings
- Body content
- Buttons
- Labels
- Navigation
- Statistics
- Timer displays
- Analytics
- Supporting information

The font should be loaded and managed centrally rather than configured independently within individual components.

---

### 3. Fallback Fonts

When Inter is unavailable or when platform requirements make a system font more appropriate, the application should use a reliable fallback stack.

Possible fallback fonts include:

- System UI
- SF Pro / San Francisco on Apple platforms
- Roboto on Android
- Segoe UI where applicable
- Arial
- Sans-serif

Platform-specific font behavior should be tested rather than assuming identical rendering across operating systems.

Fallback fonts should preserve readability and hierarchy as closely as practical.

---

### 4. Font Weights

Deep Focus should use a limited and intentional set of font weights.

| Weight | Recommended Usage |
|---|---|
| 400 | Body text and supporting content |
| 500 | Labels and medium-emphasis information |
| 600 | Buttons, card headings, and secondary headings |
| 700 | Primary headings and important information |
| 800 | Hero statistics and highly emphasized metrics |

Excessive variation in font weight should be avoided.

Font weight should communicate hierarchy rather than decoration.

---

### 5. Type Scale

The following type scale provides the initial typography foundation for Deep Focus.

| Element | Size | Weight |
|---|---:|---:|
| Display | 40px | 800 |
| H1 | 32px | 700 |
| H2 | 28px | 700 |
| H3 | 24px | 600 |
| H4 | 20px | 600 |
| H5 | 18px | 600 |
| Body Large | 18px | 400 |
| Body | 16px | 400 |
| Body Small | 14px | 400 |
| Caption | 12px | 400 |
| Button | 16px | 600 |
| Label | 14px | 500 |

These values should act as design tokens rather than arbitrary component-level values.

Specific screens may require carefully approved variations when accessibility, layout, or platform behavior requires them.

---

### 6. Semantic Typography Tokens

Components should use semantic typography tokens wherever practical.

Example roles may include:

```text
typography.display

typography.heading1
typography.heading2
typography.heading3
typography.heading4
typography.heading5

typography.bodyLarge
typography.body
typography.bodySmall

typography.caption
typography.button
typography.label
```

Each semantic token may define:

- Font family
- Font size
- Font weight
- Line height
- Letter spacing

Centralizing these values allows the typography system to evolve without requiring widespread component-level changes.

---

### 7. Line Height

Line height should provide comfortable reading without creating excessive vertical spacing.

Initial guidelines include:

| Text Type | Line Height |
|---|---:|
| Headings | 120% |
| Body Text | 150% |
| Captions | 140% |

Long-form content may require additional line spacing depending on context and screen size.

Line height should be tested using actual application layouts rather than treated only as a theoretical value.

---

### 8. Letter Spacing

Letter spacing should remain subtle and purposeful.

| Element | Letter Spacing |
|---|---:|
| Headings | -0.02em |
| Body Text | 0em |
| Buttons | 0.02em |
| Captions | 0.03em |

Letter spacing should not reduce readability.

Platform rendering differences should be considered when translating design specifications into React Native implementation.

---

### 9. Text Hierarchy

The interface should clearly communicate different levels of information.

A typical hierarchy should follow:

1. Screen Title
2. Section Heading
3. Card Heading
4. Primary Content
5. Secondary Content
6. Supporting Information
7. Caption

Not every screen requires every hierarchy level.

The number of competing typography styles visible at the same time should remain limited.

Users should be able to understand information importance without relying on color alone.

---

### 10. Screen Titles

Screen titles should:

- Clearly identify the current destination
- Use consistent placement
- Maintain predictable spacing
- Avoid unnecessary wording
- Remain readable at supported accessibility text sizes

Screen titles should not compete visually with the primary task of the screen.

---

### 11. Headings

Headings should divide information into understandable sections.

They should:

- Follow a predictable hierarchy
- Remain concise
- Use consistent spacing
- Avoid excessive weight
- Maintain sufficient contrast
- Preserve hierarchy under text scaling

Heading levels should not be selected solely because a particular size looks visually convenient.

---

### 12. Body Text

Body text should prioritize comfortable reading.

Standard body text should generally use:

```text
Font Size: 16px
Font Weight: 400
Line Height: approximately 150%
```

Body content should:

- Use clear language
- Avoid unnecessarily long paragraphs
- Maintain comfortable line spacing
- Avoid excessive use of bold or uppercase text
- Remain readable across supported themes

Dense information should be divided into meaningful sections where appropriate.

---

### 13. Labels and Captions

Labels should identify controls, values, and supporting interface information clearly.

Captions may be used for:

- Supporting explanations
- Timestamps
- Metadata
- Secondary status information
- Contextual guidance

Small text should never become so small that readability is sacrificed merely to fit more content on screen.

Important information should not be placed exclusively in caption-sized text.

---

### 14. Buttons and Interactive Text

Interactive text should remain easy to identify and read.

Button typography should generally use:

```text
Font Size: 16px
Font Weight: 600
```

Interactive text should:

- Use clear action-oriented labels
- Avoid unnecessary uppercase styling
- Remain readable in disabled states
- Support text scaling
- Avoid truncation where the action would become unclear

Labels such as `Continue`, `Start Focus Session`, or `Save Changes` should communicate the resulting action clearly.

---

### 15. Numerical and Timer Typography

Deep Focus frequently displays numerical information such as:

- Focus timers
- Session duration
- Focus statistics
- Streaks
- Productivity metrics
- Progress values

Important numerical information should remain easy to scan.

Timer displays may use larger typography than standard interface text when required by the active focus experience.

Where supported by the selected font implementation, tabular numerals may be considered for rapidly changing values such as timers to reduce visual movement.

Numerical emphasis should remain consistent with the importance of the information.

---

### 16. Dynamic Type and Text Scaling

Deep Focus should respect supported operating-system text-size and accessibility preferences.

Layouts should remain usable when text becomes larger.

Implementation should:

- Avoid fixed-height containers that clip scaled text
- Allow important labels to wrap where appropriate
- Test larger accessibility text sizes
- Preserve button usability
- Prevent important information from disappearing
- Maintain understandable hierarchy

Text scaling should not be disabled merely to preserve a preferred visual layout.

---

### 17. Responsive Typography

Typography should adapt gracefully across supported screen sizes.

Responsive behavior may require adjustments to:

- Display typography
- Large headings
- Timer displays
- Analytics metrics
- Line length
- Layout spacing

Body text should remain readable rather than being aggressively reduced on smaller screens.

Responsive typography should preserve hierarchy and readability instead of attempting to make every layout visually identical.

---

### 18. Localization Considerations

The typography system should support future localization.

Design and implementation should account for:

- Longer translated strings
- Different word lengths
- Different line-breaking behavior
- Languages requiring different font support
- Right-to-left layouts where introduced
- Character sets not fully supported by the primary font

Components should avoid assuming that translated text will occupy the same amount of space as English text.

Alternative fonts may be required for languages or writing systems that are not adequately supported by the primary typeface.

---

### 19. Text Truncation

Text truncation should be used carefully.

Truncation may be appropriate for:

- Non-critical metadata
- Long filenames
- Secondary labels
- Compact list content

Critical information and primary actions should remain understandable without requiring users to guess hidden text.

Where important text may be truncated, an appropriate method of accessing the complete information should be considered.

---

### 20. Accessibility

Typography should follow accessibility best practices throughout the application.

The interface should:

- Maintain readable text sizes
- Maintain sufficient text-to-background contrast
- Support text scaling
- Avoid using color alone to communicate importance
- Avoid excessive uppercase text
- Avoid overly condensed typography
- Preserve readable line spacing
- Provide sufficient space for translated and enlarged text
- Remain usable with assistive technologies

A standard body size of approximately `16px` provides the baseline for normal content, while smaller sizes should be reserved for genuinely secondary information.

Accessibility should be validated using real application screens rather than typography values alone.

---

### 21. Typography Usage Rules

Typography should remain intentional and consistent.

Avoid:

- Arbitrary font sizes
- Unapproved font families
- Excessive font weights
- Excessive bold text
- Long sections of uppercase text
- Extremely small supporting text
- Hard-coded typography values when semantic tokens exist
- Inconsistent heading hierarchy
- Fixed layouts that break when text scales
- Using typography only for decorative effect

When visual hierarchy can be established through spacing and placement, additional typography variation may not be necessary.

---

### 22. Typography System Governance

New typography styles should not be introduced simply to make individual screens appear unique.

Before adding a new style, contributors should determine whether:

- An existing semantic typography token can be reused
- The new style has a clear reusable purpose
- Accessibility remains preserved
- The style works across supported screen sizes
- The style supports future localization
- The addition maintains the Deep Focus visual identity

Approved typography tokens should remain centrally documented and implemented through the design system.

---

### 23. Typography Principles

Every typography decision in Deep Focus should:

- Prioritize readability
- Maintain clear hierarchy
- Reduce unnecessary cognitive load
- Support accessibility
- Support text scaling
- Remain consistent across the application
- Work across supported screen sizes
- Support future localization
- Use centralized design tokens where practical
- Reinforce the calm Deep Focus experience

Typography should help users understand information immediately without drawing unnecessary attention to itself.

---

## 5. Spacing System

The Deep Focus spacing system defines how space is used between interface elements to create a calm, organized, readable, and predictable visual experience.

Consistent spacing helps establish hierarchy, reduce visual clutter, improve usability, and make related information easier to understand.

Spacing should be implemented through reusable design tokens rather than repeated hard-coded values throughout individual components.

---

### 1. Spacing Goals

The spacing system should:

- Create a clean and organized interface
- Establish consistent visual rhythm
- Improve readability and visual hierarchy
- Reduce visual clutter
- Clearly communicate relationships between elements
- Maintain consistency across screens and components
- Support responsive layouts
- Support accessibility and larger text sizes
- Scale efficiently as the platform grows
- Reduce unnecessary one-off layout values

Spacing should communicate structure without requiring additional decorative elements.

---

### 2. Base Spacing System

Deep Focus uses an **8-point spacing system** as its primary layout foundation.

Most margins, padding, gaps, and layout measurements should use values derived from this system whenever practical.

A `4px` value may be used for small adjustments and tightly related elements.

| Token | Value |
|---|---:|
| XS | 4px |
| SM | 8px |
| MD | 16px |
| LG | 24px |
| XL | 32px |
| XXL | 48px |
| XXXL | 64px |

The spacing system should guide layout decisions rather than become an inflexible mathematical restriction.

Exceptions may be introduced when accessibility, platform behavior, component dimensions, safe areas, or visual alignment require them.

---

### 3. Semantic Spacing Tokens

Application components should use semantic or centralized spacing tokens rather than directly depending on raw numerical values wherever practical.

Example spacing tokens may include:

```text
spacing.xs   = 4
spacing.sm   = 8
spacing.md   = 16
spacing.lg   = 24
spacing.xl   = 32
spacing.xxl  = 48
spacing.xxxl = 64
```

Components should reference these tokens through the approved theme or design-system implementation.

This allows spacing values to evolve without requiring widespread component-level changes.

---

### 4. Screen Padding

Primary screen content should maintain predictable horizontal spacing from device edges.

Recommended starting values are:

| Device Category | Recommended Padding |
|---|---:|
| Mobile | 16px |
| Tablet | 24px |
| Large Layouts | 32px |

These values are layout guidelines rather than assumptions based solely on device type.

Actual implementation should also account for:

- Safe areas
- Device dimensions
- Orientation
- Navigation structures
- Content width
- Accessibility text scaling

Screen padding should remain visually consistent across related screens.

---

### 5. Safe Area Spacing

Mobile layouts should respect platform safe areas.

Content should not unintentionally overlap:

- Display notches
- Dynamic system areas
- Status bars
- Home indicators
- Navigation areas
- Other operating-system UI

Safe-area insets should be handled separately from normal design spacing when necessary.

A fixed spacing token should not be assumed to replace actual device safe-area information.

---

### 6. Section Spacing

Major content sections should have enough separation to communicate that they represent different groups of information.

Recommended default spacing between major sections:

```text
32px
```

Smaller section relationships may use:

```text
24px
```

The exact value should depend on information hierarchy rather than being applied mechanically to every layout.

---

### 7. Component Spacing

Spacing between components should reflect their relationship.

Recommended starting values include:

| Relationship | Spacing |
|---|---:|
| Very closely related elements | 4px |
| Closely related elements | 8px |
| Related components | 16px |
| Separate content groups | 24px |
| Major sections | 32px |

Elements that belong together should generally appear closer than elements representing separate concepts.

This principle should remain more important than applying the same gap everywhere.

---

### 8. Content Spacing

Text and supporting content should maintain consistent internal rhythm.

Recommended starting values include:

#### Heading to Related Content

```text
16px
```

#### Section Title to Section Content

```text
16px–24px
```

#### Paragraph Spacing

```text
12px–16px
```

#### List Item Spacing

```text
8px
```

#### Label to Supporting Text

```text
4px–8px
```

Typography line height should remain responsible for spacing within individual text blocks.

Layout spacing should not be used to compensate for incorrect typography settings.

---

### 9. Card Layout

Cards are frequently used throughout Deep Focus to organize related information.

Recommended card spacing includes:

| Element | Recommended Spacing |
|---|---:|
| Card Internal Padding | 16px |
| Card Header to Content | 12px–16px |
| Content to Actions | 16px |
| Card to Card | 16px |

Larger or information-dense cards may use:

```text
24px
```

of internal padding where the available screen space allows it.

Cards should not use excessive padding simply to create a premium appearance.

Content density, readability, screen size, and accessibility should determine the appropriate spacing.

---

### 10. Button Spacing

Buttons should provide sufficient internal space for readability and touch interaction.

Recommended starting padding:

| Direction | Value |
|---|---:|
| Vertical | 12px |
| Horizontal | 20px |

Button dimensions should also satisfy the project's touch-target accessibility requirements.

Internal padding may need to adapt when:

- Text scaling increases
- Icons are included
- Labels wrap
- Platform requirements differ
- Minimum touch-target dimensions require additional space

Button height should not depend only on text size.

---

### 11. Button Groups

Buttons displayed together should maintain enough separation to prevent accidental interaction and preserve visual hierarchy.

Recommended spacing between related buttons:

```text
12px
```

Primary and secondary actions should remain visually distinguishable.

Destructive actions should receive sufficient separation from common actions when accidental activation could cause meaningful data loss or another significant consequence.

---

### 12. Form Spacing

Forms should maintain predictable relationships between labels, inputs, helper text, and validation messages.

Recommended starting values include:

| Relationship | Spacing |
|---|---:|
| Label to Input | 8px |
| Input to Helper Text | 4px–8px |
| Input Group to Input Group | 16px |
| Form Section to Form Section | 24px–32px |
| Final Field to Primary Action | 24px |

Validation messages should appear close enough to the related input that their relationship remains obvious.

Form spacing should continue to work when text scales or error messages wrap across multiple lines.

---

### 13. Navigation Spacing

Navigation spacing should provide comfortable interaction while preserving screen space.

For bottom navigation, initial design guidance may include:

#### Top Padding

```text
12px
```

#### Bottom Content Padding

```text
16px
```

#### Navigation Item Internal Spacing

```text
8px
```

Actual bottom spacing must also account for device safe-area insets.

Navigation items should prioritize adequate touch targets and clear separation over rigid adherence to fixed padding values.

---

### 14. Dashboard Layout

The Home Dashboard uses modular sections and cards to communicate personalized information.

Recommended starting spacing includes:

| Element | Spacing |
|---|---:|
| Header to First Major Card | 24px |
| Card to Card | 16px |
| Section to Section | 32px |
| Widget to Widget | 16px |

Spacing should help users distinguish:

- Primary recommendations
- Current focus information
- Progress
- Tasks
- Insights
- Supporting content

The dashboard should avoid reducing spacing merely to display more information above the fold.

Clarity should take priority over information density.

---

### 15. Modal and Dialog Spacing

Dialogs, sheets, and modal surfaces should use consistent internal spacing.

Recommended starting values include:

| Element | Spacing |
|---|---:|
| Container Padding | 24px |
| Title to Description | 8px–12px |
| Description to Content | 16px |
| Content to Actions | 24px |
| Action to Action | 12px |

On smaller screens, spacing may adapt to preserve usable content space.

Modal layouts should remain usable with larger accessibility text sizes.

---

### 16. Icon Spacing

Icons should maintain predictable spacing from adjacent labels or content.

Recommended starting spacing between an icon and related text:

```text
8px
```

Tighter compact controls may use:

```text
4px
```

Icons should not be positioned so closely that they become visually merged with text or so far away that their relationship becomes unclear.

---

### 17. Touch Target Spacing

Visual dimensions and interactive dimensions are not always the same.

Interactive elements should provide sufficiently large touch targets even when their visible content is smaller.

Deep Focus should generally target a minimum touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance may require different minimums.

Touch targets should also have enough separation to reduce accidental activation.

Small icons should receive an appropriately larger interactive area rather than requiring users to tap the exact visible icon.

---

### 18. Responsive Spacing

Spacing should adapt according to available layout space rather than simply multiplying every value by a fixed percentage.

Mobile layouts should generally use the standard spacing scale.

Larger layouts may increase:

- Screen gutters
- Section separation
- Card padding
- Multi-column gaps

However, internal component spacing should remain consistent unless additional space provides a clear usability benefit.

Responsive behavior should consider:

- Screen width
- Screen height
- Orientation
- Device category
- Content density
- Text scaling
- Safe areas

Large screens should not automatically receive proportionally larger spacing everywhere.

---

### 19. Content Width

On wider displays, content should not expand indefinitely.

Readable content areas may use maximum-width constraints where appropriate.

This is especially important for:

- Long-form text
- Settings
- Forms
- Reports
- AI recommendations
- Analytics explanations

Additional screen width may instead be used for:

- Larger gutters
- Multi-column layouts
- Supporting panels
- Contextual information

Readable line length and clear hierarchy should take priority over filling all available horizontal space.

---

### 20. Accessibility and Spacing

Spacing should support accessibility rather than only visual appearance.

Layouts should:

- Provide adequate touch targets
- Separate interactive controls sufficiently
- Allow text to scale without overlapping nearby elements
- Avoid fixed heights that clip content
- Preserve relationships between labels and controls
- Maintain clear grouping
- Support screen orientation changes where required

Spacing should be tested using larger accessibility text settings.

A layout that works only at the default text size should not be considered complete.

---

### 21. Spacing and Visual Grouping

Spacing should communicate relationships between information.

The general principle is:

```text
Related elements stay closer together.
Unrelated elements receive greater separation.
```

For example:

```text
Card Title
    ↓ 8px
Supporting Text
    ↓ 16px
Primary Content
    ↓ 24px
Next Independent Section
```

This creates hierarchy without requiring unnecessary borders, dividers, backgrounds, or decorative elements.

---

### 22. Spacing and Dividers

Spacing should be preferred over visible dividers when whitespace alone can communicate grouping clearly.

Dividers may be appropriate when:

- Multiple dense items require stronger separation
- Scrolling content makes boundaries difficult to identify
- Accessibility or comprehension benefits from explicit structure

The interface should avoid adding dividers simply because empty space appears visually unused.

Whitespace is an intentional part of the Deep Focus design system.

---

### 23. Spacing Tokens in Components

Reusable components should define their spacing through shared tokens.

For example:

```text
Button
- Horizontal Padding: spacing.md + spacing.xs
- Vertical Padding: spacing.sm + spacing.xs

Card
- Internal Padding: spacing.md
- Section Gap: spacing.md

Screen
- Horizontal Padding: spacing.md
- Major Section Gap: spacing.xl
```

Implementation does not need to calculate token combinations exactly as shown above if a dedicated semantic token provides clearer and more maintainable code.

The objective is to avoid arbitrary one-off values across the application.

---

### 24. Spacing Exceptions

The spacing scale should provide consistency without preventing necessary exceptions.

Exceptions may be appropriate for:

- Safe-area calculations
- Platform-specific controls
- Accessibility requirements
- Optical alignment
- Complex data visualization
- Animation positioning
- Device-specific layouts

Exceptions should have a clear reason.

Repeated exceptions may indicate that the design system requires a new approved token or pattern.

---

### 25. Spacing Usage Rules

Avoid:

- Arbitrary spacing values without clear reason
- Different spacing for visually identical components
- Excessively compressed layouts
- Excessive empty space that separates related information
- Using margins to compensate for incorrect component structure
- Fixed dimensions that break with text scaling
- Ignoring safe-area requirements
- Increasing all spacing proportionally on large screens
- Hard-coded spacing when approved tokens are available

Spacing decisions should reflect information relationships and interaction requirements.

---

### 26. Spacing System Governance

Before introducing a new spacing value, contributors should determine whether:

- An existing token can solve the requirement
- The value is required for accessibility
- The value represents a reusable pattern
- The value is caused by an underlying layout problem
- The same requirement appears elsewhere
- A semantic component token would be more appropriate

Frequently repeated new values should be reviewed for possible inclusion in the official spacing system.

---

### 27. Spacing System Principles

Every spacing decision in Deep Focus should:

- Support clarity
- Reinforce visual hierarchy
- Reduce cognitive load
- Preserve accessibility
- Maintain consistent rhythm
- Communicate relationships between elements
- Support responsive layouts
- Respect safe areas
- Support text scaling
- Use centralized tokens where practical
- Avoid unnecessary visual clutter
- Remain scalable and maintainable

Whitespace should be treated as a functional part of the interface rather than unused space.

A consistent spacing system helps Deep Focus remain calm, understandable, and comfortable throughout extended use.

---

## 6. Iconography

Icons are a functional part of the Deep Focus interface.

Rather than acting primarily as decorative elements, icons should help users quickly recognize actions, navigation destinations, application states, categories, and important information.

The icon system should remain simple, recognizable, accessible, and visually consistent across the application.

Icons should support the interface without competing for attention.

---

### 1. Iconography Goals

The icon system should:

- Improve usability
- Reduce cognitive load
- Support quick recognition
- Maintain visual consistency
- Complement the calm Deep Focus design language
- Remain understandable at common interface sizes
- Support accessibility
- Scale across future features
- Avoid unnecessary visual complexity
- Remain consistent across supported platforms

Icons should provide functional value rather than being added only for decoration.

---

### 2. Primary Icon Style

Deep Focus uses a modern **outline-based icon style** as its primary visual language.

The default icon style should feel:

- Lightweight
- Calm
- Modern
- Recognizable
- Balanced
- Consistent

Outline icons should be preferred for normal interface states unless another approved state requires a filled treatment.

Icons should avoid excessive detail that becomes difficult to recognize at smaller sizes.

---

### 3. Icon Characteristics

Icons used throughout Deep Focus should generally maintain:

- Simple geometric construction
- Consistent stroke treatment
- Balanced proportions
- Rounded visual characteristics where appropriate
- Minimal visual noise
- Clear silhouettes
- Strong recognition at small sizes
- Consistent visual weight

Icons displayed together should feel as though they belong to the same visual family.

Mixing significantly different icon styles should be avoided.

---

### 4. Primary Icon Library

The primary icon library for Deep Focus should be **Lucide Icons**, using a React Native-compatible implementation approved by the project.

Lucide is suitable for the Deep Focus visual language because it provides:

- Consistent outline styling
- A large icon collection
- Customizable size and color
- A reusable visual system
- Open-source availability
- Support for modern application interfaces

Using one primary icon library reduces visual inconsistency and unnecessary custom icon development.

The exact package and implementation should remain documented in the project's approved technology configuration.

---

### 5. Platform-Specific Icons

Native or platform-specific icons may be used when they provide stronger familiarity or better platform integration.

Examples may include system-level concepts where users already expect a particular platform convention.

Platform-specific icons should only be introduced when they:

- Improve usability
- Preserve familiar platform behavior
- Integrate better with native functionality
- Do not create unnecessary visual inconsistency

A platform-specific icon should not replace the standard Deep Focus icon simply because an alternative exists.

---

### 6. Icon Selection Rules

Icons should be selected according to meaning rather than appearance alone.

When selecting an icon:

1. Prefer commonly recognized symbols
2. Prefer an existing approved Lucide icon
3. Use the same icon for the same concept throughout the application
4. Avoid using one icon for multiple unrelated meanings
5. Avoid visually ambiguous symbols when a clearer alternative exists
6. Pair unfamiliar icons with text where necessary
7. Avoid creating custom icons unless the existing system cannot communicate the required concept effectively

Consistency of meaning is more important than variety.

---

### 7. Icon Naming

Implementation should use predictable icon naming.

Names should describe the icon's semantic purpose rather than its visual appearance whenever practical.

For example:

```text
Focus
Analytics
Rewards
Settings
Pause
Play
Close
Back
Notification
AIInsight
Recovery
Achievement
```

Feature-specific wrappers or mappings may be introduced when doing so prevents the application from depending directly on library-specific names throughout the codebase.

This can make future icon-library changes easier to manage.

---

### 8. Icon Sizes

The following sizes provide the initial icon sizing system for Deep Focus.

| Usage | Recommended Size |
|---|---:|
| Navigation Tabs | 24px |
| Toolbar Icons | 24px |
| Standard Buttons | 20px |
| Cards | 20px |
| Small Actions | 16px |
| Large Feature Icons | 32px |
| Large Decorative or Hero Icons | 48–64px |

These values should be treated as design-system guidelines rather than arbitrary component-level values.

Icons should use centralized size tokens where practical.

---

### 9. Semantic Icon Size Tokens

Reusable icon sizes may be represented through centralized tokens.

For example:

```text
icon.size.sm = 16
icon.size.md = 20
icon.size.lg = 24
icon.size.xl = 32
icon.size.hero = 48–64
```

The final token naming should remain consistent with the project's broader Design System.

Individual components should avoid introducing random icon sizes without a clear requirement.

---

### 10. Optical Sizing and Alignment

Icons with identical numerical dimensions may not always appear visually identical.

Some symbols naturally occupy more or less visual space.

Implementation should consider:

- Optical balance
- Alignment with text
- Alignment inside buttons
- Alignment inside navigation items
- Visual weight
- Baseline relationships

Small optical adjustments may be appropriate when required for visual consistency.

However, repeated manual adjustments may indicate that the selected icon or component structure should be reconsidered.

---

### 11. Icon Colors

Icons should use colors from the approved Deep Focus color system.

Typical semantic usage includes:

| Meaning | Recommended Color Role |
|---|---|
| Primary Action | Primary Brand Color |
| AI-Assisted Feature | AI Accent Color |
| Recovery | Secondary / Calm Teal |
| Success | Success Color |
| Warning | Warning Color |
| Error | Error Color |
| Achievement | Achievement Accent |
| Inactive / Secondary | Secondary or Muted Text Color |

Icons should not introduce arbitrary colors outside the approved design system.

Color should reinforce meaning rather than provide decoration.

---

### 12. Icon State Colors

Interactive icons may require different visual states.

Relevant states may include:

- Default
- Pressed
- Focused
- Selected
- Disabled
- Loading
- Error

State colors should use approved semantic design tokens.

Disabled icons should remain visible enough to be understood while clearly communicating that interaction is unavailable.

Selected states should remain recognizable without relying exclusively on color.

---

### 13. Outline and Filled Icons

The default Deep Focus icon style is **Outline**.

Filled variants may be used selectively when they provide meaningful state distinction.

Possible uses include:

- Selected navigation items
- Active states
- Completed states
- Important achievements

Filled icons should not be introduced simply for decoration.

Where filled and outline variants are used together, they should represent a consistent state relationship throughout the application.

---

### 14. Navigation Icons

Bottom navigation icons should remain simple and immediately recognizable.

Navigation icons should:

- Use consistent dimensions
- Maintain consistent visual weight
- Include readable labels
- Clearly distinguish selected and unselected states
- Maintain sufficient touch-target size
- Avoid unnecessary animation
- Preserve accessibility

The icon and label should behave as a single navigation target.

Navigation meaning should not depend solely on icon interpretation.

---

### 15. Icons Inside Buttons

Icons may appear inside buttons when they improve action recognition.

Examples include:

```text
Start Session + Play Icon
Pause + Pause Icon
Save + Save Icon
Add Task + Plus Icon
```

Icon placement should remain consistent.

For left-aligned icons, a typical icon-to-label gap may use:

```text
8px
```

Compact controls may use smaller approved spacing where necessary.

Icons should not make button labels harder to scan.

---

### 16. Icon-Only Buttons

Icon-only buttons may be used for familiar, compact actions when visible text would create unnecessary interface clutter.

Examples may include:

- Close
- Back
- More options
- Play
- Pause

Every icon-only button should:

- Have an accessible name
- Provide an adequate touch target
- Use a recognizable symbol
- Provide state feedback
- Avoid ambiguous meaning

If the icon's meaning is not immediately recognizable, a visible text label should be preferred.

---

### 17. Touch Targets

The visible icon size should not determine the full interactive area.

An icon may visually appear at:

```text
20px
```

while its interactive container provides a minimum touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

Touch targets should have enough separation to reduce accidental activation.

Users should not be required to tap precisely on the visible icon.

---

### 18. Icons in Cards

Card icons may help users recognize:

- Categories
- Status
- Analytics
- Recommendations
- Rewards
- Actions

Card icons should remain secondary to the primary information unless the icon itself represents the card's main function.

Large decorative icons should not reduce the amount of useful information visible on the card.

---

### 19. Status Icons

Status icons may communicate conditions such as:

- Completed
- Warning
- Error
- Offline
- Synchronized
- Locked
- Active
- Paused

Important statuses should not rely on the icon alone.

Where necessary, icons should be combined with:

- Text
- Labels
- Status descriptions
- Accessible names

This ensures that meaning remains understandable across different users and accessibility conditions.

---

### 20. AI Iconography

AI-assisted experiences should use a consistent icon treatment.

AI icons may identify:

- AI recommendations
- AI insights
- Personalized suggestions
- AI-generated summaries
- AI coaching

AI-related icons should use the approved AI visual language and may use the AI Accent Color where appropriate.

However, an icon or color alone should not be used to identify AI-generated content.

AI-assisted content should also include clear textual or contextual identification where necessary.

---

### 21. Reward and Achievement Icons

Achievements and rewards may use more expressive iconography than standard utility interfaces.

However, they should remain consistent with the overall Deep Focus design language.

Reward icons should:

- Remain recognizable
- Avoid excessive visual complexity
- Use approved achievement colors
- Avoid unnecessary animation
- Avoid competing with primary productivity actions

Gamification visuals should support progress without turning the interface into an attention-seeking reward system.

---

### 22. Decorative Icons

Decorative icons should be used sparingly.

An icon should not be added simply because an area of the interface appears empty.

Decorative icons may be appropriate when they:

- Reinforce a meaningful concept
- Improve empty states
- Support onboarding
- Improve comprehension
- Contribute to a carefully designed illustration

Purely decorative icons should not create unnecessary accessibility noise.

Where appropriate, decorative elements should be hidden from screen readers.

---

### 23. Accessibility

Icon accessibility should be considered according to the icon's function.

Interactive icons should provide:

- Accessible names
- Appropriate roles
- Sufficient touch targets
- Clear interaction states

Informational icons should provide supporting text or another accessible explanation when their meaning is important.

Decorative icons should not be announced unnecessarily by assistive technologies.

Icons should also remain understandable for users with color-vision differences.

Meaning should never depend solely on icon color.

---

### 24. Tooltips and Supporting Labels

Tooltips may be useful where pointer or keyboard interaction exists and an icon requires additional explanation.

However, tooltips should not be the only method of making an essential action understandable.

On mobile interfaces, visible labels or accessible names should be preferred when an icon is unfamiliar.

Important functionality should remain discoverable without requiring hover behavior.

---

### 25. Reduced Motion

Icon animations should respect the user's reduced-motion preferences.

When icons animate, the animation should:

- Communicate meaningful state
- Remain subtle
- Complete quickly
- Avoid unnecessary looping
- Avoid distracting users during focus sessions

Animation should never be required to understand the icon's meaning.

---

### 26. Localization and RTL Support

Icons should be reviewed when future localization introduces right-to-left languages.

Directional icons may require mirroring.

Examples may include:

- Back
- Forward
- Previous
- Next
- Directional navigation arrows

Non-directional icons should generally remain unchanged.

Icon behavior should follow the meaning of the action rather than blindly mirroring every symbol.

---

### 27. Custom Icons

Custom icons should only be created when the approved icon library cannot adequately represent a required Deep Focus concept.

Before creating a custom icon, contributors should verify that:

- No suitable approved icon already exists
- The new icon represents a meaningful reusable concept
- The visual style matches the primary icon family
- Stroke weight remains consistent
- Proportions remain compatible
- The icon works at required sizes
- Accessibility requirements remain supported

Custom icons should become part of the documented design system rather than existing as isolated assets.

---

### 28. Icon Consistency Rules

The same concept should use the same icon throughout the application whenever practical.

For example, if a specific symbol represents:

```text
Analytics
```

that symbol should not later represent:

```text
History
```

unless the contexts clearly justify the distinction.

Likewise, multiple unrelated icons should not be used for the same action without a documented reason.

Consistency helps users learn the interface more quickly.

---

### 29. Icon Usage Rules

Avoid:

- Mixing unrelated icon styles
- Random stroke widths
- Arbitrary icon colors
- Excessive decorative icons
- Unnecessarily detailed icons
- Very small interactive targets
- Using unfamiliar icons without supporting context
- Using different icons for the same action
- Using the same icon for unrelated actions
- Relying only on color to communicate state
- Hard-coded icon values when approved tokens exist
- Excessive icon animation

Icons should simplify interaction rather than create additional visual information users must interpret.

---

### 30. Icon System Governance

Before introducing a new icon or icon pattern, contributors should determine whether:

- An existing approved icon already communicates the concept
- The icon follows the Deep Focus visual language
- The meaning is understandable
- Accessibility requirements are satisfied
- The icon remains readable at its intended size
- The icon is likely to be reusable
- The addition creates unnecessary inconsistency

Frequently used icon mappings should be centralized where practical.

---

### 31. Future Expansion

The icon system should support future Deep Focus capabilities without requiring a new visual language.

Future areas may include:

- AI tools
- Wearable integrations
- Collaboration
- Team workspaces
- Calendar integrations
- Smart scheduling
- Marketplace functionality
- Cross-device experiences

New feature icons should continue using the established icon system unless a documented design-system change is approved.

---

### 32. Iconography Principles

Every icon decision in Deep Focus should:

- Improve recognition
- Reduce cognitive load
- Preserve visual consistency
- Support accessibility
- Use familiar symbols where practical
- Maintain adequate touch targets
- Use approved design tokens
- Avoid unnecessary decoration
- Remain understandable across supported platforms
- Support future localization
- Remain scalable as the product evolves
- Reinforce the calm Deep Focus experience

Icons should help users understand and operate the interface faster without becoming another source of distraction.

---

## 7. Components

The Deep Focus interface is built using reusable, scalable, accessible, and consistent UI components.

Components should provide predictable interaction patterns throughout the application while reducing unnecessary cognitive load and implementation duplication.

Every reusable component should follow:

- `UI_UX_DESIGN_SPECIFICATION.md`
- `COMPONENT_LIBRARY.md`
- Approved design tokens
- Accessibility requirements
- Light and Dark theme behavior

Components should be designed around clear responsibilities rather than individual screens.

Where an approved reusable component already exists, it should be reused or extended instead of creating a visually or behaviorally duplicated implementation.

---

### Component Design Principles

Every Deep Focus component should:

- Have a clear purpose
- Maintain consistent visual behavior
- Use approved design tokens
- Support accessibility
- Support Light Mode and Dark Mode
- Support responsive layouts
- Support text scaling
- Remain reusable where appropriate
- Provide predictable interaction states
- Avoid unnecessary visual complexity
- Remain testable
- Support future localization where applicable

Components should not introduce their own independent visual language.

---

### Component States

Interactive components should define the states relevant to their behavior.

Possible states include:

- Default
- Pressed
- Focused
- Selected
- Disabled
- Loading
- Success
- Warning
- Error

Not every component requires every state.

States should only be implemented when they represent meaningful component behavior.

---

### Component Composition

Complex interfaces should be created by composing smaller reusable components where doing so improves consistency and maintainability.

However, components should not be divided into unnecessarily small abstractions.

A component should generally be extracted when it:

- Appears in multiple locations
- Represents a reusable design pattern
- Contains meaningful reusable behavior
- Benefits from independent testing
- Simplifies a complex parent component

Component abstraction should solve an actual maintainability or consistency problem.

---

### Component Token Usage

Components should use centralized design tokens for properties such as:

- Color
- Typography
- Spacing
- Border radius
- Icon size
- Elevation
- Animation timing

Hard-coded design values should be avoided when an appropriate approved token exists.

---

## 7.1 Buttons

Buttons are one of the primary interaction elements throughout Deep Focus.

Every button should clearly communicate what will happen when the user activates it.

Button hierarchy should help users distinguish primary actions from secondary or lower-priority actions without creating unnecessary visual competition.

---

### Button Design Principles

Buttons should:

- Be easy to recognize
- Clearly communicate their action
- Maintain consistent dimensions and spacing
- Provide immediate interaction feedback
- Support Light Mode and Dark Mode
- Support text scaling
- Maintain adequate touch targets
- Remain visually consistent across features
- Prevent accidental duplicate actions
- Use concise and understandable labels
- Respect reduced-motion preferences
- Remain usable with assistive technologies

Buttons should emphasize actions according to importance rather than making every available action visually dominant.

---

### Button Hierarchy

A screen should normally have one clearly identifiable primary action for the current workflow.

Supporting actions should use lower visual emphasis.

A typical hierarchy is:

```text
Primary
    ↓
Secondary
    ↓
Ghost / Text
```

Destructive actions should use semantic styling appropriate to their risk rather than competing with normal primary actions.

Multiple visually dominant primary buttons should be avoided unless the workflow clearly requires equally important choices.

---

### Primary Button

The Primary Button represents the most important action in the current context.

Examples include:

- Start Focus Session
- Continue
- Save Changes
- Complete Session
- Create Goal

Primary Buttons should normally use the approved Primary Brand Color.

A screen should generally avoid presenting multiple competing Primary Buttons within the same immediate action area.

---

### Secondary Button

The Secondary Button represents an important supporting action that should remain available without competing with the primary action.

Examples include:

- Edit
- View Details
- Retry
- Change Settings
- Review Session

Secondary Buttons may use:

- Outlined treatment
- Lower-emphasis surface treatment
- Secondary semantic styling

The exact treatment should remain consistent throughout the application.

---

### Ghost Button

Ghost Buttons represent low-emphasis actions.

Examples include:

- Cancel
- Skip
- Close
- Not Now
- Dismiss

Ghost Buttons should remain clearly interactive while using less visual emphasis than Primary or Secondary Buttons.

Ghost styling should not make important actions difficult to discover.

---

### Destructive Button

Destructive Buttons represent actions that may remove important information or produce significant consequences.

Examples include:

- Delete Account
- Delete Goal
- Clear History
- Remove Saved Data

Destructive actions should use the approved Error semantic styling where appropriate.

High-impact destructive actions should normally require confirmation before execution.

Destructive styling should not be used for ordinary cancellation or navigation actions.

---

### Icon Button

Icon Buttons may be used when a familiar symbol communicates the action clearly and visible text would create unnecessary interface clutter.

Examples include:

- Settings
- Notifications
- Search
- Close
- Back
- More Options
- Play
- Pause

Icon Buttons should:

- Use approved icons
- Provide an accessible name
- Maintain an adequate touch target
- Provide interaction feedback
- Avoid ambiguous symbols

The visible icon may be smaller than the actual interactive area.

For example:

```text
Visible Icon: 20–24px
Minimum Touch Area: approximately 44px × 44px
```

If an icon is not sufficiently recognizable, a text label should be preferred.

---

### Floating Action Button

A Floating Action Button (FAB) may be used when a screen has one highly important contextual action that benefits from persistent access.

Example:

- Quick Start Focus Session

A FAB should not be introduced simply to make an action more visually prominent.

FAB usage should:

- Remain limited
- Avoid covering important content
- Respect safe areas
- Maintain sufficient contrast
- Provide an accessible label
- Avoid competing with bottom navigation
- Remain consistent with the calm Deep Focus visual language

Screens without a clear persistent primary action should not use a FAB.

---

### Button Sizes

Buttons may support a limited number of standardized sizes when required by the interface.

Possible size categories include:

```text
Small
Medium
Large
```

The default application button should use a consistent standard size.

Size variations should only be introduced when a genuine layout or interaction requirement exists.

Button size should account for:

- Label size
- Icon size
- Internal padding
- Touch-target requirements
- Text scaling

Very small interactive buttons should be avoided.

---

### Button Internal Spacing

Standard button spacing should follow the approved Spacing System.

A typical button may use:

```text
Vertical Padding: 12px
Horizontal Padding: 20px
```

When a button contains an icon and label, a typical gap may be:

```text
8px
```

Exact implementation should use approved spacing tokens wherever practical.

---

### Button Labels

Button labels should describe the resulting action clearly.

Prefer action-oriented labels such as:

```text
Start Focus Session
Save Changes
Create Goal
Try Again
Delete Goal
```

Avoid vague labels when a more specific action can be communicated.

For example, prefer:

```text
Save Changes
```

instead of:

```text
Yes
```

when the action can be described directly.

Button labels should remain concise without sacrificing clarity.

---

### Full-Width Buttons

Full-width buttons may be appropriate for:

- Authentication flows
- Onboarding
- Mobile forms
- Primary setup actions
- Important single-action screens

Full-width buttons should not be used automatically on every screen.

The layout should determine whether full-width presentation improves clarity and usability.

---

### Button States

Buttons should support the states required by their behavior.

Common states include:

#### Default

The normal interactive state.

#### Pressed

Provides immediate feedback while the user is activating the button.

#### Focused

Provides a visible focus indication where keyboard, assistive, or platform interaction requires it.

#### Disabled

Communicates that the action is currently unavailable.

Disabled buttons should:

- Remain identifiable
- Maintain readable labels
- Prevent interaction
- Avoid appearing identical to active controls

Where useful, the interface should explain why an important action is unavailable rather than leaving users to guess.

#### Loading

Indicates that an initiated action is still being processed.

#### Success

May provide brief contextual confirmation after certain completed operations.

Success should not become a permanent generic button state unless the workflow specifically requires it.

#### Error

May be used when an operation fails and the button remains relevant for recovery or retry.

Error feedback should normally include understandable supporting information rather than relying only on button color.

---

### Loading Buttons

Actions that require noticeable processing time may enter a Loading state.

Examples include:

- Creating an account
- Saving remote data
- Synchronizing data
- Requesting AI analysis
- Processing a subscription action

While loading, the button should:

- Prevent duplicate activation
- Clearly indicate progress
- Preserve enough context for users to understand the active operation
- Avoid unexpected layout changes
- Return to an appropriate state after success or failure

A loading indicator should not cause the button width or surrounding layout to jump unnecessarily.

---

### Duplicate Action Prevention

Actions that should execute only once must protect against rapid repeated activation.

Examples include:

- Creating an account
- Starting a focus session
- Claiming a reward
- Submitting a form
- Saving data
- Making a remote request

Disabling or locking the action during execution may be appropriate.

Duplicate-action prevention should exist in the appropriate application logic rather than relying only on visual button state.

---

### Button Feedback

Buttons should provide immediate and understandable interaction feedback.

Feedback may include:

- Pressed-state styling
- Subtle scale feedback
- Color or surface transition
- Loading indicator
- Success confirmation
- Error feedback
- Platform-appropriate haptic feedback where intentionally designed

Feedback should remain subtle and should not distract users from the current workflow.

---

### Button Animation

Button animations should remain fast, calm, and purposeful.

Possible effects include:

- Subtle press scaling
- Short color transitions
- Loading indicator animation
- Carefully controlled elevation changes

Animations should avoid:

- Large bouncing effects
- Excessive spring motion
- Long transitions
- Continuous decorative movement
- Effects that delay interaction

Animations should respect reduced-motion accessibility preferences.

Removing or simplifying an animation should not make the control state impossible to understand.

---

### Button Elevation

Elevation should be used sparingly.

Buttons should not require heavy shadows to communicate interactivity.

Where elevation is used, it should:

- Follow the Design System
- Remain subtle
- Work appropriately in Light and Dark themes
- Avoid unnecessary visual noise

Pressed states may adjust elevation when appropriate, but interaction should remain understandable without relying exclusively on shadow changes.

---

### Buttons With Icons

Buttons may combine icons and labels when the icon improves recognition.

Examples include:

```text
[▶] Start Session
[+] Add Task
[✓] Complete
```

Icon and label combinations should:

- Use approved icons
- Maintain consistent icon size
- Maintain approved spacing
- Preserve text readability
- Avoid unnecessary icons when the label already communicates the action clearly

Icon placement should remain consistent for equivalent button patterns.

---

### Destructive Action Safety

High-impact destructive buttons should protect users from accidental activation.

Depending on the consequence, protection may include:

- Confirmation dialog
- Explicit confirmation text
- Secondary confirmation step
- Undo where technically appropriate

Examples include:

```text
Delete Account
Clear All Focus History
Delete Synced Data
```

Routine low-risk actions should not receive unnecessary confirmation dialogs.

---

### Button Error Handling

When a button-triggered operation fails, the interface should provide understandable recovery guidance.

Possible responses include:

- Restore the button to an interactive state
- Display an inline error
- Provide a Retry action
- Preserve user-entered data
- Explain connectivity problems
- Avoid duplicate operations

Technical error messages should not be exposed directly to users.

---

### Responsive Behavior

Buttons should remain usable across supported screen sizes.

Layouts may adapt by:

- Allowing labels to wrap where appropriate
- Switching button groups between horizontal and vertical arrangements
- Using full-width actions on smaller layouts
- Preserving minimum touch targets
- Maintaining adequate spacing

Important button labels should not be truncated to the point that their action becomes unclear.

---

### Text Scaling

Buttons should remain usable when accessibility text scaling is enabled.

Implementation should:

- Avoid fixed heights that clip text
- Allow sufficient vertical expansion
- Preserve touch-target requirements
- Allow labels to wrap where appropriate
- Prevent icons from overlapping labels
- Maintain understandable hierarchy

Text scaling should not be disabled simply to preserve a preferred button shape.

---

### Accessibility

Buttons must:

- Provide an appropriate accessibility role
- Provide a descriptive accessible name
- Maintain adequate touch targets
- Maintain sufficient contrast
- Expose disabled state correctly
- Expose loading or state changes where relevant
- Support screen readers
- Support keyboard or equivalent navigation where applicable
- Remain understandable without relying solely on color
- Respect reduced-motion preferences

Deep Focus should generally target a minimum touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

---

### Button Usage Rules

Avoid:

- Multiple competing primary actions without clear reason
- Ambiguous button labels
- Very small touch targets
- Excessive button animations
- Heavy decorative shadows
- Using color alone to communicate button state
- Random button dimensions
- Arbitrary colors outside the Design System
- Unapproved typography
- Duplicate button implementations
- Disabling text scaling solely for visual consistency
- Icon-only buttons with unclear meaning

Buttons should make the next available action easier to understand rather than increasing decision complexity.

---

### Button Governance

Before introducing a new button variant, contributors should determine whether:

- An existing button type already supports the requirement
- The new variant represents a reusable interaction pattern
- The new design remains accessible
- The new variant follows approved design tokens
- The variant works across supported themes
- The addition creates unnecessary complexity

Frequently repeated button patterns should become part of the shared component system rather than being implemented independently by individual features.

---

### Button Principles

Every Deep Focus button should:

- Communicate a clear action
- Maintain predictable hierarchy
- Provide immediate feedback
- Support accessibility
- Use approved design tokens
- Prevent accidental duplicate operations
- Support text scaling
- Remain consistent across the application
- Avoid unnecessary visual stimulation
- Support the calm Deep Focus experience

Buttons should make interaction feel clear and effortless without drawing unnecessary attention away from the user's primary task.

---

### 7.2 Cards

Cards are reusable information containers used throughout the Deep Focus application.

They group related content, actions, status information, and insights into visually structured sections while preserving a calm and distraction-free interface.

Cards should improve information hierarchy rather than divide every piece of content into separate containers.

A card should only be used when grouping information provides meaningful visual or functional value.

---

#### Card Design Principles

Cards should:

- Group closely related information
- Maintain clear visual hierarchy
- Use consistent internal spacing
- Follow approved design tokens
- Use subtle visual separation
- Support Light Mode and Dark Mode
- Remain responsive across supported screen sizes
- Support accessibility and text scaling
- Avoid unnecessary visual complexity
- Clearly distinguish interactive and non-interactive behavior
- Remain reusable where appropriate

Cards should help users scan information quickly without creating excessive visual fragmentation.

---

#### Card Usage

Cards are appropriate when content represents a meaningful grouped unit.

Examples include:

- Focus session information
- AI recommendations
- Analytics summaries
- Goals
- Achievements
- Recovery guidance
- Statistics
- Upcoming tasks

Cards should not be used simply to place a border or background around every section.

When normal layout spacing can communicate hierarchy clearly, an additional card may not be necessary.

---

#### Card Types

Deep Focus may use several semantic card types depending on the information being presented.

Card types should share the same underlying design system rather than becoming completely independent visual components.

---

##### AI Recommendation Card

Displays recommendations, insights, or suggestions generated through AI-assisted functionality.

Examples include:

- Recommended Focus Session
- Energy Insight
- Recovery Recommendation
- Smart Schedule Suggestion
- Productivity Pattern
- Workload Suggestion

AI Recommendation Cards should clearly identify AI-assisted content.

Recommendations should remain optional and dismissible where appropriate.

AI-generated information should not visually resemble confirmed user data when the distinction is important.

Important recommendations should include enough context for users to understand why the suggestion is being presented.

---

##### Focus Session Card

Displays information about a current, upcoming, recent, or configured focus session.

Possible content includes:

- Session Duration
- Current Mode
- Remaining Time
- Selected Task
- Session Goal
- Progress Indicator
- Session Status

When representing an active session, the card should prioritize the most important session information and avoid unnecessary secondary details.

High-frequency timer updates should not cause unrelated card content or surrounding screens to re-render unnecessarily.

---

##### Analytics Card

Displays productivity insights, trends, charts, or analytical summaries.

Examples include:

- Daily Focus Time
- Weekly Trends
- Focus Consistency
- Energy Patterns
- Distraction Trends
- Recovery Patterns

Analytics Cards should:

- Present one primary insight whenever practical
- Avoid overcrowding charts
- Use understandable labels
- Provide meaningful context
- Avoid relying only on color
- Remain readable at smaller screen sizes

Complex analytical information should use progressive disclosure rather than attempting to display every available metric inside a single card.

---

##### Achievement Card

Displays milestones, progress, achievements, or rewards.

Examples include:

- New Badge
- Level Progress
- Daily Streak
- XP Reward
- Focus Milestone

Achievement Cards may use slightly more celebratory visual treatment than standard cards.

However, celebration should remain consistent with the calm Deep Focus experience.

Achievement Cards should avoid:

- Excessive animation
- Manipulative reward patterns
- Unnecessary urgency
- Visual effects that compete with focus-related functionality

---

##### Recovery Card

Provides recovery-related guidance during appropriate moments in the productivity workflow.

Examples include:

- Hydration Reminder
- Stretch Reminder
- Breathing Exercise
- Eye Relaxation
- Break Suggestion
- Recovery Recommendation

Recovery Cards should use calm visual treatment and avoid language that pressures or shames users.

Recommendations should remain supportive and optional unless a specific workflow requires otherwise.

---

##### Statistics Card

Displays concise numerical summaries.

Examples include:

- Total Focus Hours
- Completed Sessions
- Current Streak
- Average Session Length
- Weekly Focus Total

A Statistics Card should normally emphasize:

```text
Primary Metric
      ↓
Metric Label
      ↓
Optional Context or Trend
```

Large statistics should remain readable without overwhelming surrounding information.

Supporting context should explain the metric where interpretation may otherwise be unclear.

---

#### Card Anatomy

A standard card may contain:

```text
Card
├── Header
│   ├── Optional Icon
│   ├── Title
│   └── Optional Status / Action
│
├── Supporting Content
│
├── Primary Content
│
├── Optional Visualization
│
├── Optional Actions
│
└── Optional Footer
```

Not every card requires every element.

Only elements necessary for the card's purpose should be displayed.

---

#### Card Header

The Card Header may contain:

- Icon
- Title
- Subtitle
- Status
- Badge
- Contextual Action

The title should clearly describe the card's primary purpose.

Header actions should remain secondary to the card's main information.

Too many actions should not be placed inside the header.

---

#### Card Content

Card content should prioritize the information users are most likely to need.

Content should:

- Remain concise
- Follow typography hierarchy
- Use understandable labels
- Maintain sufficient spacing
- Avoid unnecessary repetition
- Use progressive disclosure for secondary information

Large amounts of text should not be placed inside cards when a dedicated detail screen would provide a better experience.

---

#### Card Actions

Cards may contain actions such as:

- View Details
- Start Session
- Accept Recommendation
- Dismiss
- Edit
- Retry

The number of visible actions should remain limited.

A card should not become a replacement for a full action menu.

Primary and secondary actions should follow the button hierarchy defined in `7.1 Buttons`.

---

#### Interactive Cards

Some cards may behave as a single interactive control.

Examples include:

- Opening session details
- Opening an analytics report
- Selecting a focus mode
- Opening an achievement

Interactive cards should:

- Clearly communicate interactivity
- Provide pressed feedback
- Provide visible focus states where applicable
- Expose an appropriate accessibility role
- Maintain an adequate touch target
- Avoid ambiguous interaction behavior

A non-interactive card should not visually imitate an interactive card.

---

#### Whole-Card Interaction

When the entire card performs one primary action, the complete card surface may act as the interaction target.

For example:

```text
Weekly Analytics Card
        ↓
Open Weekly Analytics
```

The interaction should remain predictable.

Cards with multiple independent actions should generally avoid making the entire card perform another unrelated action.

---

#### Nested Interactive Elements

Interactive elements inside an interactive card require careful handling.

Examples include:

- Favorite button
- Overflow menu
- Dismiss button
- Toggle
- Secondary action

Nested controls should not accidentally trigger the parent card action.

If interaction becomes difficult to understand, the card should be redesigned rather than adding additional nested controls.

---

#### Card States

Cards should support only the states required by their behavior.

Possible states include:

- Default
- Pressed
- Focused
- Selected
- Expanded
- Collapsed
- Loading
- Empty
- Disabled
- Error

Not every card requires every state.

---

##### Default State

Displays the normal card appearance and content.

---

##### Pressed State

Interactive cards should provide subtle immediate feedback when activated.

Pressed feedback should remain calm and should not create excessive movement.

---

##### Focused State

Interactive cards should provide a visible focus indicator when keyboard or equivalent navigation requires it.

Focus indication should remain visible in both Light Mode and Dark Mode.

---

##### Selected State

Selectable cards should clearly communicate selection.

Selection should not rely solely on color.

Possible supporting indicators include:

- Border treatment
- Check indicator
- Icon state
- Label
- Surface change

---

##### Expanded State

Expandable cards may reveal additional information or controls.

Expansion should only be used when progressive disclosure improves the experience.

Expanded cards should preserve context and avoid sudden layout instability.

---

##### Collapsed State

Collapsed cards should retain enough information for users to understand what the card represents.

Critical information should not become hidden unintentionally.

---

##### Loading State

Cards waiting for asynchronous information may display a loading state.

Loading states should:

- Preserve approximate layout structure
- Avoid unnecessary movement
- Prevent misleading interaction
- Transition smoothly to loaded content

Skeleton placeholders may be used where they improve perceived continuity.

---

##### Empty State

When a card has no information to display, the interface should provide useful context where necessary.

Examples include:

```text
No focus sessions yet.
Start your first session to see your progress here.
```

Empty cards that provide no useful information or action may be omitted entirely.

---

##### Disabled State

Disabled cards should clearly communicate unavailable interaction without making content unreadable.

Where appropriate, the interface should explain why an important feature is unavailable.

---

##### Error State

If card content cannot be loaded, the card should display understandable recovery information.

Possible content includes:

- Short error explanation
- Retry action
- Offline state
- Previously cached information where appropriate

Technical error details should not be shown directly to users.

---

#### Visual Style

Cards should follow the approved Deep Focus visual system.

The default card treatment may include:

```text
Border Radius: 16px
Internal Padding: 16px
Card-to-Card Gap: 16px
```

Exact implementation should use approved design tokens rather than duplicated hard-coded values.

Cards may use:

- Surface color
- Subtle border
- Subtle elevation
- Semantic accent where appropriate

Visual treatment should remain consistent across related card types.

---

#### Border Radius

The standard card border radius is:

```text
16px
```

Alternative radii should only be introduced when documented by the Design System.

Random border-radius variations should be avoided.

---

#### Card Spacing

Default card spacing should follow the Deep Focus Spacing System.

Recommended values include:

```text
Card Padding: 16px
Header to Content: 12px
Content to Actions: 16px
Card to Card: 16px
```

More complex cards may require additional spacing, but changes should continue using approved spacing tokens.

---

#### Card Elevation

Elevation should remain subtle.

Cards should not depend on large shadows to separate content.

Depending on theme and context, separation may use:

- Surface contrast
- Border
- Subtle shadow
- Elevation

Dark Mode may require different visual separation from Light Mode.

Heavy shadows should be avoided.

---

#### Card Density

Cards should avoid excessive information density.

A card should normally communicate one primary purpose.

If a card contains:

- Multiple unrelated metrics
- Many buttons
- Large paragraphs
- Several charts
- Multiple independent workflows

the content should be reconsidered or divided into a more appropriate structure.

However, cards should not be split unnecessarily when the information naturally belongs together.

---

#### Nested Cards

Cards should generally not be placed inside other cards.

Nested cards can create:

- Excessive visual boundaries
- Unclear hierarchy
- Increased cognitive load
- Complicated spacing

When grouped information is required inside a card, internal sections, dividers, spacing, or list structures should normally be preferred.

Nested cards should only be used when there is a clear documented UX reason.

---

#### Responsive Behavior

Cards should adapt to available screen space.

On smaller screens, cards may:

- Use full available width
- Stack vertically
- Simplify secondary content
- Move actions into appropriate layouts

On larger screens, cards may:

- Appear in responsive grids
- Use controlled maximum widths
- Display additional supporting information
- Place related cards side by side

Card content should never become excessively wide simply because additional screen space is available.

---

#### Text Scaling

Cards should support accessibility text scaling.

Implementation should:

- Avoid fixed heights that clip content
- Allow vertical expansion
- Preserve readable spacing
- Allow labels to wrap
- Prevent text from overlapping icons or actions
- Preserve meaningful hierarchy

Card height should normally adapt to content rather than forcing content into a fixed visual frame.

---

#### Analytics Visualization Accessibility

Charts and visual analytics inside cards should not rely only on visual interpretation.

Where appropriate, analytics should provide:

- Text labels
- Numerical values
- Accessible descriptions
- Alternative summaries
- Sufficient contrast

Color alone should not distinguish important datasets or states.

Users who cannot interpret the chart visually should still be able to understand its important meaning.

---

#### Card Animations

Card animations should remain subtle and purposeful.

Possible animations include:

- Short fade-in
- Small entrance transition
- Gentle pressed feedback
- Smooth expansion and collapse
- Loading placeholder transition

Animations should not be added to every card simply because animation is technically possible.

Avoid:

- Large bouncing effects
- Excessive scaling
- Continuous animation
- Long entrance sequences
- Multiple cards animating aggressively at once

Animations should support comprehension rather than decoration.

---

#### Reduced Motion

Card animations should respect reduced-motion accessibility settings.

When reduced motion is enabled:

- Large movement should be removed or simplified
- Expansion should remain understandable
- State changes should remain visible
- Essential information should not depend on animation

Reduced motion should preserve functionality.

---

#### AI Card Transparency

AI Recommendation Cards should make AI involvement understandable.

Where appropriate, the card should communicate:

- That the content is AI-assisted
- Why the recommendation was generated
- Whether the recommendation is optional
- What action the user can take

AI cards should not imply certainty when the underlying recommendation is probabilistic or inferred.

---

#### Accessibility

Cards should support accessibility according to their function.

Cards should:

- Maintain sufficient contrast
- Support screen readers
- Support text scaling
- Maintain readable spacing
- Expose meaningful labels
- Clearly identify interactive elements
- Provide visible focus states where applicable
- Avoid relying only on color
- Respect reduced-motion preferences

Interactive cards should expose appropriate accessibility semantics.

Non-interactive cards should not unnecessarily behave like buttons or other controls.

---

#### Card Performance

Cards should remain efficient when displayed in lists, dashboards, and analytics screens.

Implementation should:

- Avoid unnecessary re-renders
- Avoid expensive calculations during rendering
- Optimize large card lists
- Load heavy content only when appropriate
- Keep animations lightweight
- Avoid updating unrelated cards for high-frequency state changes

Timer-driven Focus Session Cards require particular care because frequent timer updates should not cause the entire dashboard to re-render every second.

---

#### Card Usage Rules

Avoid:

- Excessive card nesting
- Overcrowded card layouts
- Too many actions in one card
- Arbitrary card colors
- Random border-radius values
- Heavy shadows
- Fixed heights that clip scaled text
- Decorative cards without meaningful grouping
- Large paragraphs inside compact cards
- Multiple unrelated purposes inside one card
- Making non-interactive cards look interactive
- Relying solely on color for state
- Excessive entrance animations
- Duplicating existing card patterns

Cards should simplify information architecture rather than create additional layers of interface complexity.

---

#### Card Governance

Before introducing a new card type, contributors should determine whether:

- An existing card pattern already supports the requirement
- The content genuinely benefits from card grouping
- The new pattern is reusable
- The card follows approved design tokens
- Accessibility requirements are satisfied
- The card works in Light Mode and Dark Mode
- The card supports responsive layouts
- The new type creates unnecessary design-system complexity

Repeated card patterns should be documented and implemented through the shared component system.

---

#### Card Principles

Every Deep Focus card should:

- Represent a clear information group
- Maintain strong visual hierarchy
- Remain easy to scan
- Use approved design tokens
- Support accessibility
- Support responsive layouts
- Support text scaling
- Keep interactions predictable
- Avoid unnecessary visual boundaries
- Use animation purposefully
- Remain efficient in large interfaces
- Preserve the calm Deep Focus experience

Cards should organize information in a way that helps users understand what matters without making the interface feel fragmented or overloaded.

---

### 7.3 AI Components

Artificial Intelligence is integrated throughout the Deep Focus experience as a supporting capability rather than as the center of the product.

AI components should help users understand productivity patterns, make informed decisions, and build healthier work habits while preserving user autonomy, privacy, and control.

The AI experience should feel like a calm and supportive productivity coach rather than a traditional chatbot that constantly demands interaction.

AI-generated information should remain clearly distinguishable from confirmed user data, measured statistics, and user-entered information.

---

#### AI Component Design Principles

AI components should:

- Provide useful and relevant guidance
- Remain context-aware
- Explain important recommendations
- Preserve user control
- Respect user privacy
- Avoid unnecessary interruptions
- Encourage sustainable productivity
- Communicate uncertainty appropriately
- Avoid presenting estimates as confirmed facts
- Remain optional where appropriate
- Handle unavailable AI services gracefully
- Use clear and supportive language
- Avoid manipulative engagement patterns

AI should assist decision-making rather than replace it.

---

#### AI Interaction Philosophy

AI interactions should follow a simple principle:

```text
Observe
   ↓
Understand
   ↓
Suggest
   ↓
Explain
   ↓
User Decides
```

The user should remain responsible for important decisions.

AI components should not silently change:

- Focus duration
- Goals
- Schedules
- Notification preferences
- Recovery settings
- User data
- Important application settings

When an AI recommendation would modify meaningful user data or behavior, the user should explicitly choose whether to apply it.

---

#### AI Information Hierarchy

An AI recommendation should generally communicate information in the following order:

```text
Recommendation
      ↓
Short Explanation
      ↓
Supporting Context
      ↓
Optional Action
```

For example:

```text
Consider a 15-minute recovery break.

Your recent focus sessions have been longer than your usual pattern.

[Start Break]    [Not Now]
```

Users should be able to understand the recommendation without reading a large amount of supporting information.

---

#### AI Component Types

Deep Focus may use several reusable AI component patterns.

These components should share a consistent visual and interaction language.

---

##### AI Recommendation Card

Displays a personalized suggestion based on available productivity context.

Examples include:

- Recommended focus-session duration
- Suggested break duration
- Suggested focus period
- Recovery recommendation
- Workload adjustment
- Daily productivity suggestion

A recommendation should clearly communicate:

- What is being suggested
- Why it may be useful
- Whether action is required
- What the user can do next

Possible actions may include:

```text
Apply
Start Session
Start Break
View Details
Not Now
Dismiss
```

Recommendations should remain suggestions rather than commands.

---

##### AI Insight Card

Presents useful observations generated from available productivity data.

Examples include:

```text
Your focus sessions were most consistent during the morning this week.
```

```text
Your recorded distraction attempts were lower than last week.
```

```text
You completed more planned recovery breaks this week.
```

Insights should distinguish between:

- Recorded data
- Calculated metrics
- AI interpretation
- Estimated patterns

AI interpretations should not be presented as objective facts when uncertainty exists.

---

##### Fatigue and Recovery Guidance Card

Provides supportive guidance when recent behavioral patterns may suggest increased workload or insufficient recovery.

Possible signals may include:

- Repeated long focus sessions
- Reduced session completion
- Increased distraction attempts
- Reduced recovery consistency
- User-reported low energy
- User-reported mood changes

The component should avoid diagnostic language.

Avoid wording such as:

```text
High burnout risk detected.
```

Prefer supportive wording such as:

```text
Your recent work pattern may suggest increased fatigue.
```

or:

```text
You've completed several long focus sessions recently.
A longer recovery break may be helpful.
```

The component may offer actions such as:

```text
Take a Break
Adjust Next Session
View Recent Patterns
Dismiss
```

Deep Focus should not present behavioral signals as medical or psychological diagnoses.

---

##### Energy Status Card

Displays an estimated or user-reported representation of current energy when the feature has enough information to provide one.

Possible states may include:

- High Energy
- Moderate Energy
- Low Energy
- Recovery Suggested
- Not Enough Data

The component should clearly distinguish whether the value is:

```text
User Reported
```

or:

```text
Estimated by Deep Focus
```

Estimated energy should never be presented as a precise physiological measurement unless supported by an appropriately validated data source.

---

##### AI Coach Panel

The AI Coach Panel provides deeper explanations and personalized productivity guidance.

Users may review:

- Weekly insights
- Productivity summaries
- Focus patterns
- Personalized suggestions
- Habit improvement strategies
- Recovery guidance
- Goal-related recommendations

The panel should prioritize structured guidance over unrestricted conversation when structured information provides a clearer experience.

The AI Coach should not attempt to keep users engaged in unnecessary conversation.

Its purpose is to help users return to meaningful work with greater clarity.

---

##### AI Explanation Panel

When a recommendation requires additional context, users may access an explanation.

The explanation may include:

- Why the recommendation appeared
- What information contributed to it
- What period of data was considered
- Whether the result is estimated
- What action the user may take

For example:

```text
Why am I seeing this?

Your morning focus sessions during the past seven days had a higher
completion rate than your afternoon sessions.

Deep Focus therefore suggests scheduling demanding work earlier when
your schedule allows.
```

Explanations should remain concise and understandable.

---

##### AI Loading State

Whenever AI processing requires noticeable time, the interface should communicate that activity clearly.

Examples include:

```text
Analyzing recent focus patterns...
```

```text
Preparing your weekly insights...
```

```text
Generating a personalized recommendation...
```

Loading states should:

- Remain subtle
- Avoid exaggerated claims
- Prevent duplicate requests where necessary
- Avoid unnecessary animation
- Preserve surrounding layout stability
- Allow the rest of the application to remain usable where practical

The application should not imply that AI analysis is more precise or sophisticated than the actual feature supports.

---

##### AI Empty State

AI features may occasionally have insufficient information to provide a meaningful recommendation.

In these situations, Deep Focus should communicate the limitation clearly.

Example:

```text
Not enough focus history yet.

Complete a few focus sessions and Deep Focus can begin identifying
useful patterns.
```

The system should prefer displaying no recommendation over generating a weak or misleading one simply to fill the interface.

---

##### AI Unavailable State

AI services may become temporarily unavailable because of:

- Network problems
- Service outages
- Rate limits
- Invalid responses
- Provider failures

The interface should provide calm feedback.

Example:

```text
AI insights are temporarily unavailable.

Your focus sessions and other core Deep Focus features will continue
to work normally.
```

AI failure should not block core productivity functionality.

---

##### AI Error State

When an AI request fails, the interface may provide:

- Short explanation
- Retry action
- Dismiss action
- Previously available information where appropriate

Technical provider errors should not be displayed directly to users.

Repeated automatic retries should be avoided when they provide no meaningful benefit.

---

#### Recommendation Priority

When multiple AI recommendations compete for user attention, they should be prioritized according to user value and well-being.

A general priority order is:

1. Safety-related guidance within the supported product scope
2. Fatigue and recovery guidance
3. Active focus-session relevance
4. Focus optimization
5. Recovery suggestions
6. Productivity improvements
7. Habit suggestions
8. Motivation and rewards

Higher priority does not automatically mean more intrusive presentation.

Even important recommendations should avoid unnecessary interruption.

---

#### Active Focus Session Behavior

AI should remain especially quiet during active focus sessions.

During an active focus session, AI components should generally avoid:

- Pop-up recommendations
- Coaching messages
- Animated suggestions
- Non-essential notifications
- New productivity advice
- Reward prompts

Non-urgent recommendations should normally wait until:

```text
Session Completion
        ↓
Session Summary
        ↓
Optional Recommendation
```

Only functionality explicitly enabled by the user or required for the active workflow should interrupt this principle.

---

#### Recommendation Actions

AI recommendations should provide clear actions when action is useful.

Possible actions include:

- Apply
- Start Session
- Start Break
- Adjust Session
- View Details
- Save Suggestion
- Not Now
- Dismiss

Users should not be forced to accept a recommendation before continuing normal application usage.

Dismissed recommendations should not repeatedly reappear without meaningful new context.

---

#### Recommendation Dismissal

Optional AI recommendations should generally support dismissal.

Dismissal behavior should:

- Remove unnecessary visual pressure
- Respect the user's decision
- Avoid immediately presenting the same recommendation again
- Allow future recommendations when meaningful new information exists

Where appropriate, users may also be able to disable specific categories of AI recommendations.

---

#### AI Confidence and Uncertainty

Confidence indicators may be used only when they provide meaningful and understandable information.

Avoid presenting arbitrary percentages such as:

```text
93% Confidence
```

unless the value has a defined and defensible meaning.

In many cases, plain-language uncertainty is preferable.

Examples include:

```text
Based on a limited amount of recent data
```

```text
A consistent pattern is beginning to appear
```

```text
Not enough information yet
```

```text
Based on your recent sessions
```

The interface should never create false precision.

---

#### AI Data Freshness

Recommendations based on historical information should communicate relevant time context when useful.

Examples include:

```text
Based on the past 7 days
```

```text
Based on your last 10 completed sessions
```

```text
Updated today
```

Old recommendations should not continue appearing as current guidance when the underlying information is no longer relevant.

---

#### AI Transparency

Users should be able to understand why meaningful AI recommendations appear.

Where appropriate, AI components should communicate:

- The source of the recommendation
- The type of information considered
- The relevant time period
- Whether the result is estimated
- Whether AI interpretation was involved

Example:

```text
Based on your completed focus sessions during the past seven days,
your morning sessions had a higher completion rate than your
afternoon sessions.
```

Transparency should improve understanding without exposing internal system prompts, private implementation details, or sensitive infrastructure information.

---

#### AI-Generated vs Recorded Data

Deep Focus should visually and semantically distinguish AI interpretation from recorded user information.

For example:

```text
Recorded
Focus Time: 3h 20m
```

and:

```text
AI Insight
Your recent pattern suggests that morning sessions may be more
consistent for you.
```

An AI-generated conclusion should never silently replace the underlying measured information.

---

#### Visual Identity

AI-related components should use a consistent visual identity based on the approved Deep Focus Design System.

Possible AI visual elements include:

- AI Accent Color
- Approved AI icon
- Subtle accent border
- Context label
- Light surface treatment
- Carefully controlled gradient where approved

AI styling should remain subtle.

The interface should not make AI components appear more important than the user's actual work, goals, or focus session.

---

#### AI Accent Usage

The approved AI Accent Color may identify AI-assisted content.

However, color alone should never communicate that content was AI-generated.

A textual or semantic indicator should be provided where the distinction matters.

Examples include:

```text
AI Insight
```

```text
AI Recommendation
```

```text
Suggested by Deep Focus
```

---

#### AI Gradients

Soft gradients may be used selectively for AI surfaces when they are part of the approved Design System.

Gradients should:

- Remain subtle
- Maintain text contrast
- Work in Light Mode and Dark Mode
- Avoid bright or highly saturated combinations
- Avoid making AI content visually dominant

AI components do not require gradients to be recognizable.

---

#### AI Language

AI-generated interface language should remain:

- Calm
- Clear
- Concise
- Supportive
- Non-judgmental
- Non-manipulative
- Uncertainty-aware where necessary

Avoid language such as:

```text
You failed to stay focused.
```

Prefer:

```text
This session had more interruptions than your recent average.
```

Avoid:

```text
You need to work harder tomorrow.
```

Prefer:

```text
A shorter session may help you rebuild consistency tomorrow.
```

The interface should describe patterns without judging the user.

---

#### AI and Health-Related Language

Deep Focus may provide productivity and recovery guidance, but AI components should not present themselves as medical or mental-health diagnostic tools.

AI components should avoid claiming to diagnose:

- Burnout
- Mental health conditions
- Sleep disorders
- Clinical fatigue
- Stress disorders
- Other medical conditions

Behavioral patterns may be described as signals or observations when appropriate.

Recommendations should remain within the productivity and digital well-being scope of Deep Focus.

---

#### Privacy-Aware AI UI

AI components should request or display only information necessary for the feature.

The interface should not encourage users to provide sensitive information unnecessarily.

Where an AI feature requires additional data, users should understand:

- What information is being used
- Why it is useful
- Whether participation is optional

Privacy-related controls should remain understandable and accessible.

---

#### AI Personalization Controls

Where appropriate, users should be able to control AI personalization.

Possible controls may include:

- Enable or disable AI recommendations
- Disable specific recommendation categories
- Manage relevant data permissions
- Clear AI-related history where supported
- Control optional personalization features

Core Deep Focus functionality should remain usable without optional AI personalization.

---

#### AI Component States

Depending on the component, AI interfaces may support:

- Default
- Loading
- Ready
- Expanded
- Dismissed
- Insufficient Data
- Offline
- Error
- Unavailable
- Outdated

Not every AI component requires every state.

Each state should communicate clearly what is happening and what the user can do next.

---

#### AI Animation

AI animations should remain minimal.

Possible uses include:

- Loading indication
- Short content appearance
- Expansion and collapse
- Subtle state transition

Avoid:

- Constant glowing effects
- Continuous pulsing
- Excessive gradient movement
- Large animated AI symbols
- Attention-seeking effects

AI should not visually compete with the user's work.

---

#### Reduced Motion

AI components should respect reduced-motion accessibility preferences.

When reduced motion is enabled:

- Non-essential movement should be removed
- Loading states should remain understandable
- State transitions should remain clear
- Functionality should remain unchanged

AI meaning should never depend on animation.

---

#### Accessibility

AI components must:

- Support screen readers
- Use understandable language
- Maintain sufficient contrast
- Support text scaling
- Provide accessible names for interactive controls
- Avoid relying solely on color
- Provide textual equivalents for meaningful visual information
- Expose loading and relevant state changes appropriately
- Maintain adequate touch targets
- Respect reduced-motion preferences

AI insights represented through charts, status colors, or visual indicators should also provide understandable textual information.

---

#### AI Component Performance

AI components should not reduce application responsiveness.

Implementation should:

- Avoid unnecessary repeated AI requests
- Cache reusable results where appropriate
- Prevent duplicate submissions
- Avoid blocking unrelated application functionality
- Keep loading animations lightweight
- Avoid repeatedly rendering unchanged recommendations

AI processing should remain separated from high-frequency focus-session updates where practical.

---

#### AI Component Usage Rules

Avoid:

- Presenting AI estimates as confirmed facts
- Diagnostic health claims
- False precision
- Excessive AI notifications
- Interrupting active focus sessions unnecessarily
- Forcing users to accept recommendations
- Repeatedly showing dismissed recommendations
- AI-generated guilt or pressure
- Unnecessary conversational engagement
- Bright attention-seeking AI visuals
- Unexplained recommendations
- Sending unnecessary user information for AI processing
- Blocking core functionality when AI is unavailable
- Automatically changing important user data without appropriate confirmation

AI should remain a supporting layer of Deep Focus rather than becoming another source competing for user attention.

---

#### AI Component Governance

Before introducing a new AI component, contributors should determine whether:

- AI provides meaningful value for the interaction
- A deterministic feature could solve the problem more reliably
- The required data is appropriate and necessary
- The recommendation can be explained clearly
- The user remains in control
- Failure can be handled gracefully
- The feature works without unnecessary interruption
- Accessibility requirements are satisfied
- Privacy implications have been considered
- The component aligns with `AI_RULES.md` and `ARCHITECTURE.md`

AI should not be added simply because a feature can technically use AI.

---

#### AI Component Principles

Every Deep Focus AI component should:

- Provide meaningful user value
- Preserve user autonomy
- Respect privacy
- Remain transparent
- Communicate uncertainty appropriately
- Distinguish AI interpretation from recorded data
- Avoid unsupported diagnostic claims
- Remain dismissible where appropriate
- Avoid unnecessary interruptions
- Fail gracefully
- Support accessibility
- Maintain the calm Deep Focus visual language
- Encourage sustainable productivity
- Keep the user's actual work more important than the AI itself

Artificial Intelligence in Deep Focus should help users understand their productivity and make better decisions while allowing them to remain fully in control of how they work.

---

### 7.4 Navigation Components

Navigation should remain simple, predictable, accessible, and distraction-free.

Users should always be able to understand where they are, how to return, and how to access important features with minimal effort.

The navigation system should prioritize focus and clarity over unnecessary feature discovery.

Navigation components should remain aligned with the navigation architecture defined in `ARCHITECTURE.md`.

---

#### Navigation Principles

Navigation should:

- Minimize cognitive load
- Reduce unnecessary navigation steps
- Maintain consistent behavior
- Preserve user context where practical
- Support comfortable reach on mobile devices
- Respect platform conventions
- Support accessibility
- Avoid unnecessary visual complexity
- Scale according to actual product requirements
- Remain compatible with Expo Router
- Avoid interrupting active focus sessions unnecessarily

Navigation should remain predictable enough that users do not need to learn different patterns for different features.

---

#### Primary Navigation

The current primary mobile navigation destinations are:

- Home
- Focus
- Analytics
- Rewards
- Profile

These destinations should remain stable unless an approved product-level navigation change is made.

New features should not automatically receive a primary navigation destination.

Contextual access should be preferred when a feature does not require permanent navigation visibility.

---

#### Bottom Navigation Bar

The Bottom Navigation Bar is the primary navigation component during normal mobile application usage.

Primary tabs include:

- Home
- Focus
- Analytics
- Rewards
- Profile

Only one primary destination should be active at a time.

The Bottom Navigation Bar should:

- Clearly identify the active destination
- Maintain consistent icon and label placement
- Preserve adequate touch targets
- Respect device safe areas
- Avoid unnecessary animation
- Remain visually calm
- Support screen readers
- Preserve tab context where practical

The active tab may use the Primary Brand Color while inactive tabs use an approved secondary or muted text color.

Active state should not rely solely on color.

Supporting indicators may include:

- Icon state
- Label emphasis
- Shape or surface treatment
- Accessible selected state

---

##### Bottom Navigation Visibility

The Bottom Navigation Bar should remain visible during normal primary navigation.

However, it may be hidden when a workflow benefits from reduced distraction or requires a focused full-screen experience.

Examples may include:

- Active Focus Session
- Onboarding
- Authentication flows
- Full-screen recovery experiences
- Critical confirmation workflows
- Other approved immersive tasks

Hiding navigation should have a clear UX reason.

Users should still have a predictable way to leave or complete the current workflow.

---

##### Navigation Item Structure

A primary navigation item should normally contain:

```text
Icon
  ↓
Label
```

The icon and label should behave as one interaction target.

Labels should remain short, familiar, and easy to understand.

Primary navigation should not rely on icons alone when visible labels provide clearer and more accessible navigation.

---

##### Navigation Badges

Navigation badges may be used when information genuinely requires user awareness.

Possible examples include:

- Unread notifications
- Available rewards
- Important account actions

Badges should not be used to create artificial urgency or unnecessary engagement.

Avoid:

- Excessive badge counts
- Low-value attention indicators
- Reward pressure
- Constant notification markers

Badges should remain accessible and should not rely only on color.

---

#### Top App Bar

The Top App Bar provides screen identity and relevant screen-level actions.

Depending on the screen, it may include:

- Screen Title
- Back Button
- Search
- Settings
- Notifications
- Profile Avatar
- Contextual Actions

The Top App Bar should prioritize the screen title and current navigation context.

It should remain visually uncluttered.

Too many actions should not appear directly in the app bar.

Less frequently used actions may move into an overflow menu or another appropriate contextual interface.

---

##### Top App Bar Layout

A typical Top App Bar may follow:

```text
Leading Action
      ↓
Screen Title
      ↓
Optional Contextual Actions
```

Examples:

```text
[Back]     Goal Details        [More]
```

or:

```text
Deep Focus                 [Notifications]
```

Layout may adapt according to platform conventions and screen requirements.

---

##### Safe Area Behavior

Navigation components should respect platform safe areas.

Content should not unintentionally overlap:

- Status bars
- Device cutouts
- Dynamic system areas
- Home indicators
- System navigation regions

Safe-area spacing should use actual device information rather than fixed assumptions.

---

#### Back Navigation

Secondary screens should provide predictable back behavior.

Back navigation should:

- Return to the previous logical destination
- Preserve important user input where appropriate
- Warn before discarding meaningful unsaved changes
- Close temporary overlays before leaving the underlying screen where appropriate
- Respect native platform behavior
- Avoid unexpected redirects

Back behavior should follow navigation state rather than relying only on a visible back icon.

---

#### Focus Session Navigation

Navigation during an active Focus Session should minimize unnecessary opportunities to leave the session accidentally.

During an active session:

- Primary navigation may be hidden
- Non-essential navigation actions should be minimized
- Exit behavior should follow the selected Focus Mode
- Important session state should remain preserved
- Users should retain an appropriate safe exit path
- Accidental gestures should not corrupt or terminate the session

Navigation should protect focus without trapping users in an unsafe or confusing workflow.

---

#### Floating Action Button (FAB)

A Floating Action Button may be used when a screen has one clear contextual primary action that benefits from persistent access.

Possible examples include:

- Quick Start Focus Session
- Create Goal
- Add Task

There should generally be no more than one FAB visible within the same screen context.

A FAB should:

- Respect safe areas
- Avoid covering important content
- Avoid conflicting with bottom navigation
- Provide an accessible label
- Maintain an adequate touch target
- Follow approved design tokens
- Remain visually consistent with Deep Focus

A FAB should not be introduced simply to make an action appear more important.

---

#### Tabs

Tabs organize closely related views within the same destination.

Examples include:

```text
Daily
Weekly
Monthly
```

or:

```text
Statistics
Trends
History
```

Tabs should be used when users frequently switch between related content views.

Tabs should not replace primary navigation.

---

##### Tab Behavior

Tabs should:

- Clearly identify the selected tab
- Maintain understandable labels
- Preserve adequate touch targets
- Avoid excessive numbers of visible tabs
- Support screen readers
- Support keyboard navigation where applicable
- Preserve relevant content state where practical
- Avoid unexpected resets

If too many tabs are required, the information architecture should be reconsidered.

---

##### Tab Transitions

Tabs may use subtle animated transitions when they improve continuity.

Possible transitions include:

- Short fade
- Small content transition
- Controlled horizontal movement

Transitions should remain fast and unobtrusive.

When reduced motion is enabled, large sliding transitions should be removed or simplified.

Tab functionality should never depend on animation.

---

##### Swipe Navigation

Swipe gestures may support switching between closely related views when they remain predictable and do not conflict with platform gestures.

Swipe navigation should:

- Have an equivalent non-gesture control
- Avoid conflicting with system back gestures
- Preserve accessibility
- Avoid accidental activation
- Remain consistent across similar screens

Essential navigation should never require gesture discovery.

---

#### Segmented Controls

Segmented Controls allow quick switching between a small number of closely related options.

Examples may include:

```text
Daily | Weekly
```

```text
Study | Work
```

or:

```text
Summary | Details
```

Only one option should normally be selected at a time.

Segmented Controls should change a local mode or view rather than navigate between unrelated application destinations.

---

##### Segmented Control Rules

Segmented Controls should:

- Contain a small number of options
- Use concise labels
- Clearly communicate selection
- Avoid relying solely on color
- Support text scaling
- Maintain adequate touch targets
- Remain usable in Light Mode and Dark Mode

If labels become long or numerous, another interaction pattern should be considered.

---

#### Contextual Navigation

Not every feature requires a permanent navigation destination.

Contextual navigation may be used for:

- AI recommendation details
- Session summaries
- Reward details
- Goal details
- Recovery guidance
- Analytics drill-down

Contextual navigation helps prevent the primary navigation structure from becoming overloaded.

---

#### AI Quick Access

The AI Assistant should remain contextually available rather than occupying a permanent Bottom Navigation destination under the current product direction.

Possible access points include:

- Dashboard recommendations
- Analytics insights
- Session summaries
- Recovery guidance
- Productivity-pattern suggestions

AI access should appear when it provides meaningful value to the current context.

A persistent AI control should not be added to every screen merely to increase AI visibility.

---

##### AI Navigation Behavior

AI-assisted navigation should remain optional and non-disruptive.

AI components should not:

- Automatically navigate users away from their current task
- Interrupt active focus sessions unnecessarily
- Force users into AI workflows
- Open unrelated screens without user action

When AI recommends another destination, users should choose whether to follow the recommendation.

---

#### Modal Navigation Components

Temporary navigation surfaces may include:

- Dialogs
- Bottom Sheets
- Full-screen Modals

Dialogs are appropriate for:

- Confirmations
- Short decisions
- Critical notices

Bottom Sheets are appropriate for:

- Contextual actions
- Quick preferences
- Lightweight options

Full-screen Modals may be appropriate for more involved temporary workflows.

Temporary navigation should preserve the user's previous context.

---

#### Overflow Menus

Overflow menus may contain secondary actions that do not require constant visibility.

Examples include:

- Edit
- Archive
- Share
- Delete
- Additional Settings

Overflow menus should:

- Contain secondary actions
- Use understandable labels
- Avoid hiding frequently used primary actions
- Support accessibility
- Position destructive actions carefully

Overflow menus should not become a dumping ground for unrelated functionality.

---

#### Navigation Feedback

Interactive navigation elements should provide immediate feedback.

Feedback may include:

- Active-state styling
- Pressed state
- Focus state
- Selected icon state
- Short transition
- Platform-appropriate haptic feedback where intentionally designed

Feedback should remain subtle.

Navigation should feel responsive without becoming unnecessarily animated.

---

#### Navigation State Preservation

Navigation components should preserve useful user context where practical.

Examples include:

- Selected analytics tab
- Scroll position
- Current filter
- Draft input
- Active session context

Preserved state should not restore invalid or expired information.

Current authoritative application state should take priority over stale navigation state.

---

#### Responsive Navigation

The primary current experience uses mobile Bottom Navigation.

If future approved layouts include larger screens or additional platforms, navigation may adapt.

Possible future patterns may include:

- Navigation Rail
- Sidebar Navigation
- Expanded Navigation Layout

These patterns should only be introduced when supported platform requirements justify them.

Current mobile navigation should not become unnecessarily complex in preparation for hypothetical future platforms.

---

#### Platform Behavior

Navigation should respect supported platform conventions.

Android and iOS may differ in areas such as:

- Back behavior
- Gestures
- Safe areas
- System navigation
- Modal presentation
- Transition behavior

Deep Focus should preserve a consistent product identity without forcing identical behavior when native platform conventions differ.

Future Web or Desktop navigation should be defined when those platforms become approved product scope.

---

#### Navigation Labels

Navigation labels should remain:

- Short
- Clear
- Familiar
- Consistent
- Easy to translate

Avoid unnecessary abbreviations.

A navigation label should describe the destination rather than an implementation detail.

For example:

```text
Analytics
```

is preferable to:

```text
DataView
```

---

#### Navigation Accessibility

Navigation components must:

- Support screen readers
- Expose appropriate navigation roles
- Provide descriptive accessibility labels
- Expose selected state
- Maintain adequate touch targets
- Support text scaling
- Preserve high contrast
- Provide visible focus states where applicable
- Remain usable without relying solely on color
- Support keyboard navigation where applicable
- Avoid gesture-only essential navigation

Deep Focus should generally target a minimum interactive touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

---

#### Reduced Motion

Navigation transitions should respect reduced-motion preferences.

When reduced motion is enabled:

- Large sliding transitions should be removed or simplified
- Decorative motion should be reduced
- Navigation state changes should remain understandable
- Functionality should remain unchanged

Navigation meaning should never depend on animation.

---

#### Navigation Performance

Navigation interactions should remain responsive.

Implementation should avoid:

- Heavy synchronous work during transitions
- Loading unnecessary destination data in advance
- Duplicate route pushes
- Repeated navigation caused by rapid taps
- Excessively nested navigation structures
- Heavy animations during screen transitions

Optional remote data should not unnecessarily delay basic route rendering where an appropriate loading state can be used.

---

#### Navigation Usage Rules

Avoid:

- Adding primary tabs for low-frequency features
- Excessive navigation depth
- More than one competing FAB
- Icon-only primary navigation without labels
- Hidden essential navigation
- Gesture-only critical navigation
- Unnecessary navigation animations
- Automatically opening AI experiences
- Resetting user context without reason
- Platform-inconsistent back behavior
- Using color as the only active-state indicator
- Overloading app bars with actions
- Treating future platform navigation as a current mobile requirement

Navigation should help users reach meaningful work quickly rather than encourage unnecessary exploration.

---

#### Navigation Component Governance

Before introducing a new navigation component or pattern, contributors should determine whether:

- An existing navigation pattern already solves the requirement
- The pattern reduces rather than increases complexity
- The interaction follows `ARCHITECTURE.md`
- Accessibility is preserved
- Platform behavior has been considered
- The pattern works with Expo Router
- The pattern remains consistent with Deep Focus terminology
- The new pattern provides meaningful user value

Major changes to primary navigation should be treated as product-level decisions and documented accordingly.

---

#### Navigation Component Principles

Every Deep Focus navigation component should:

- Remain predictable
- Minimize cognitive load
- Preserve user context
- Support accessibility
- Maintain adequate touch targets
- Respect platform conventions
- Support reduced motion
- Remain responsive
- Avoid unnecessary navigation depth
- Protect active focus workflows
- Use contextual access instead of permanent destinations where appropriate
- Remain aligned with the Deep Focus navigation architecture

Navigation should make Deep Focus easier to use while remaining quiet enough that users can focus more on their work than on navigating the application.

---

### 7.5 Input Components

Input components allow users to provide information, configure preferences, and interact with personalized features throughout Deep Focus.

Every input should feel simple, predictable, responsive, and easy to complete while minimizing unnecessary effort and preventing avoidable errors.

Input components should follow the approved Design System and should reuse established patterns rather than introducing different interaction styles for similar tasks.

---

#### Design Principles

Input components should:

- Be easy to understand
- Minimize typing whenever practical
- Use the most appropriate input type for the information required
- Provide clear labels
- Provide timely validation
- Maintain visual consistency
- Support accessibility
- Reduce user errors
- Preserve user-entered information where practical
- Support Light Mode and Dark Mode
- Support future localization
- Respect user privacy
- Avoid requesting unnecessary information

Inputs should ask users only for information that provides clear product value.

---

#### Input States

Input components should support the states required by their interaction.

Possible states include:

- Default
- Focused
- Filled
- Disabled
- Read-only
- Loading
- Error
- Success

Not every input requires every state.

State changes should remain visually clear without relying solely on color.

---

#### Labels

Inputs should normally use persistent, descriptive labels.

Labels should:

- Clearly describe the requested information
- Remain visible when the field contains a value
- Support screen readers
- Avoid unnecessary technical terminology
- Remain concise
- Support future localization

Placeholder text should not replace a required field label.

For example:

```text
Goal Name

[ Read 20 pages                    ]
```

is preferable to relying only on:

```text
[ Enter goal name...               ]
```

---

#### Required and Optional Inputs

Required fields should be clearly identifiable.

Optional fields may be identified when doing so reduces uncertainty.

Examples:

```text
Goal Name
```

```text
Notes (Optional)
```

Forms should avoid requiring information that is not necessary for completing the user's task.

---

#### Text Fields

Text fields are used for short user input.

Examples include:

- Session Name
- Goal Name
- Task Title
- Profile Information
- Short Notes

Text fields may include:

- Persistent label
- Placeholder or example text where useful
- Supporting text
- Error message
- Character limit where appropriate
- Clear action where appropriate

Text fields should use the appropriate keyboard and input configuration for the expected data.

Examples may include:

- Standard text keyboard
- Email keyboard
- Numeric keyboard
- URL keyboard where applicable

Automatic capitalization, correction, and keyboard behavior should match the type of information being entered.

---

#### Multiline Text Fields

Multiline fields may be used for longer optional content.

Examples include:

- Session Notes
- Goal Description
- Reflection Notes

Multiline fields should:

- Provide adequate readable space
- Expand within reasonable limits where appropriate
- Preserve entered content
- Support text scaling
- Avoid becoming unnecessarily large
- Clearly communicate character limits when limits exist

Long-form input should not be required when a simpler interaction can achieve the same purpose.

---

#### Sensitive Inputs

Sensitive information should receive appropriate protection.

Sensitive input fields may require:

- Masked content
- Secure keyboard behavior where supported
- Visibility controls where appropriate
- Clear accessibility labels
- Protection from unnecessary logging or analytics collection

Sensitive information should never be requested unless the feature genuinely requires it.

---

#### Search Field

Search fields help users locate existing information quickly.

Possible examples include:

- Search Goals
- Search Focus History
- Search Achievements

A Search Field may provide:

- Search icon
- Clear action
- Appropriate placeholder
- Instant filtering where efficient
- Empty result state
- Loading state when remote data is involved

Search behavior should remain responsive.

Instant filtering should be used only when it does not create unnecessary performance or network cost.

Remote search should avoid sending unnecessary requests for every keystroke.

---

##### Search Results

Search results should clearly communicate:

- Matching results
- No results
- Loading
- Search failure where applicable

An empty result should not appear as an application error.

Example:

```text
No matching goals found.

Try another search term.
```

---

##### Recent Searches

Recent searches may be introduced when they provide meaningful user value.

If implemented, users should be able to clear stored search history where appropriate.

Sensitive search information should not be retained unnecessarily.

---

#### Selection Controls

Selection controls should match the number and type of available choices.

Possible controls include:

- Dropdowns
- Radio Buttons
- Checkboxes
- Segmented Controls
- Native Pickers

The simplest appropriate control should be preferred.

---

#### Dropdown Menu

Dropdowns may be used when users select one option from a predefined list and displaying every option directly would create unnecessary visual complexity.

Examples may include:

- Subject
- Category
- Work Type
- Focus Mode

Dropdowns should:

- Clearly display the current selection
- Provide an accessible label
- Avoid excessive scrolling
- Support keyboard interaction where applicable
- Support screen readers
- Close predictably
- Preserve selection until intentionally changed

If only a small number of choices exist, Radio Buttons or Segmented Controls may provide a clearer experience.

---

#### Toggle Switch

Toggle switches enable or disable a setting that takes effect independently.

Examples include:

- Notifications
- AI Suggestions
- Adaptive Music
- Recovery Guidance

The current state should always be understandable.

Toggle controls should:

- Use clear labels
- Communicate On and Off states
- Avoid relying solely on color
- Provide immediate feedback
- Maintain adequate touch targets
- Avoid requiring a separate Save action when the setting can safely apply immediately

A toggle should not be used when users must choose between several different options.

---

##### Toggle Labels

Toggle labels should describe the setting rather than the action of changing it.

For example:

```text
AI Suggestions        [On]
```

is preferable to:

```text
Enable AI             [On]
```

when the first wording more clearly describes the persistent setting.

---

#### Radio Buttons

Radio Buttons allow users to choose one option from a set of mutually exclusive choices.

Examples may include:

- Focus Mode
- Session Preference
- Productivity Goal Type

Only one option within the same group may be selected at a time.

Radio groups should:

- Have a clear group label
- Keep related options together
- Make the selected state obvious
- Support screen readers
- Avoid relying solely on color
- Maintain adequate spacing

Radio Buttons are most appropriate when users benefit from seeing the available choices simultaneously.

---

#### Checkboxes

Checkboxes allow users to select zero, one, or multiple independent options.

Examples may include:

- Notification Preferences
- Connected Services
- Optional Goal Categories

Checkboxes should:

- Clearly communicate selected state
- Use understandable labels
- Maintain adequate touch targets
- Support screen readers
- Avoid relying solely on color

Checkboxes should not be used when only one option may be selected.

---

#### Sliders

Sliders may be used for adjusting values within a continuous or stepped range.

Possible examples include:

- Music Volume
- Soundscape Intensity
- Session Duration where appropriate

Sliders should:

- Clearly communicate the current value
- Define meaningful minimum and maximum values
- Use meaningful step sizes
- Support accessible value adjustment
- Maintain adequate touch targets
- Provide alternatives when precise input is required

Example:

```text
Music Volume

────────●────────  60%
```

Users should not be required to estimate an exact value from visual position alone.

---

##### Real-Time Slider Updates

Values may update while the slider moves when immediate feedback provides meaningful value.

Examples include:

- Audio volume
- Soundscape intensity

Expensive operations, network requests, or persistent storage writes should not execute unnecessarily for every small slider movement.

---

#### Mood Selector

The Mood Selector may allow users to record a self-reported emotional state before or after a focus session.

Possible options may include:

- Excellent
- Good
- Neutral
- Tired
- Exhausted

Emoji or visual indicators may accompany text labels, but should not replace them.

For example:

```text
😊 Excellent
🙂 Good
😐 Neutral
😴 Tired
😞 Exhausted
```

Mood information should always be treated as user-reported information rather than an AI measurement.

Mood tracking should remain optional unless an approved feature has a clear reason to require it.

---

##### Mood Data Usage

When mood information contributes to personalization or AI recommendations, users should understand how the information is being used.

Mood information may contribute to:

- Recovery suggestions
- Productivity-pattern insights
- Session recommendations
- User-controlled well-being reflections

Mood information should not be used to claim diagnosis of a medical or psychological condition.

Deep Focus should not infer a clinical condition from a mood selection.

---

#### Energy Level Selector

Users may optionally report their current energy level before or after a session.

Possible values include:

- High
- Moderate
- Low

Additional states may be introduced only when they provide meaningful value.

Energy selections should be clearly identified as user-reported information.

Example:

```text
How is your energy right now?

[ High ]   [ Moderate ]   [ Low ]
```

Energy information may contribute to personalized recommendations, but should not be presented as a precise physiological measurement.

---

##### Energy Data Usage

Energy information may support:

- Suggested focus duration
- Recovery guidance
- Productivity-pattern analysis
- Personalized session recommendations

Users should remain able to ignore optional recommendations generated from this information.

---

#### Date & Time Picker

Date and Time Pickers are used for scheduling and planning.

Possible examples include:

- Focus Schedule
- Daily Reminder
- Weekly Planning
- Goal Deadline

Native platform controls should be preferred when they provide the clearest and most accessible experience.

Pickers should:

- Display the selected value clearly
- Respect locale preferences
- Respect device time format where appropriate
- Prevent impossible values
- Support screen readers
- Preserve selections when navigating temporarily away
- Handle time-zone behavior predictably when relevant

---

##### Date Validation

Date-related inputs should prevent invalid combinations where practical.

Examples include:

- End time before start time
- Invalid reminder time
- Impossible calendar dates
- Dates outside an allowed range

Error messages should explain how the user can correct the problem.

---

#### Numeric Inputs

Numeric inputs should be used when an exact number is required.

Possible examples include:

- Custom focus duration
- Goal quantity
- Session target

Numeric inputs should:

- Use an appropriate keyboard
- Define valid ranges
- Prevent unsupported values
- Explain units clearly
- Avoid requiring unnecessary precision

Example:

```text
Custom Focus Duration

[ 45 ] minutes
```

When a small set of common values exists, presets may reduce typing.

---

#### Input Presets

Preset values may help users complete common actions faster.

For example:

```text
Focus Duration

[ 25 min ] [ 45 min ] [ 60 min ] [ Custom ]
```

Presets should:

- Represent useful common choices
- Avoid overwhelming users with too many options
- Allow custom input when the feature requires flexibility

Presets should reduce effort rather than restrict meaningful user choice.

---

#### Validation

Inputs should validate information at an appropriate time.

Validation should:

- Prevent invalid submissions
- Clearly explain errors
- Identify fields requiring attention
- Preserve valid user-entered information
- Avoid exposing technical implementation details
- Avoid unnecessary interruption while the user is still typing

Not every field should display an error after every keystroke.

Validation timing should depend on the interaction.

Possible validation points include:

- During input when immediate feedback is useful
- When leaving the field
- When submitting the form

---

##### Validation Messages

Validation messages should explain:

- What is wrong
- How the user can correct it

Avoid:

```text
Invalid input.
```

Prefer:

```text
Session duration must be between 5 and 180 minutes.
```

Error messages should remain concise and non-judgmental.

---

##### Error State

An input error may use:

- Error text
- Error icon
- Approved error styling
- Accessible error announcement

Color should not be the only indication that an error exists.

The user's entered value should remain available whenever safe and practical.

---

##### Success State

Success indicators should only be shown when confirmation provides meaningful value.

They should not create unnecessary visual noise for ordinary valid input.

---

#### Form Submission

Forms should clearly identify their primary completion action.

Examples include:

- Save
- Continue
- Create Goal
- Update Profile

Submission should:

- Validate required information
- Prevent accidental duplicate submission
- Preserve entered information if a recoverable failure occurs
- Communicate loading when necessary
- Provide clear success or failure feedback

Long-running submissions should not leave users uncertain about whether their action was received.

---

#### Loading State

When an input-dependent operation is processing:

- Relevant controls may temporarily become unavailable
- Duplicate submission should be prevented
- Existing user input should remain visible
- Loading feedback should remain subtle
- Unrelated parts of the application should remain usable where practical

Loading should not silently erase user-entered information.

---

#### Disabled State

Disabled inputs should be used only when interaction is genuinely unavailable.

When practical, users should be able to understand why an important input is disabled.

Disabled controls should remain readable and visually distinguishable without appearing like missing content.

---

#### Read-Only State

Read-only fields may display information that users can view but cannot currently modify.

Read-only content should remain visually distinct from editable input without appearing disabled or inaccessible.

---

#### Keyboard Behavior

Input screens should behave predictably when the software keyboard appears.

The interface should:

- Keep the active field visible
- Avoid covering important controls
- Allow users to dismiss the keyboard predictably
- Move between fields efficiently where appropriate
- Use suitable return-key actions
- Avoid unexpected layout jumps

Keyboard behavior should be tested on supported mobile platforms.

---

#### Input Persistence

Important user-entered information should not disappear unnecessarily.

Where appropriate, Deep Focus may preserve:

- Draft goals
- Session setup
- Notes
- Partially completed forms

Temporary input should not be persisted indefinitely without meaningful value.

Sensitive information should not be persisted unnecessarily.

---

#### Privacy

Input components should follow data-minimization principles.

Deep Focus should:

- Request only necessary information
- Explain unusual data requests where appropriate
- Avoid collecting sensitive information without clear value
- Protect sensitive inputs
- Avoid logging private input values unnecessarily
- Respect user consent for optional personalization data

Inputs used for AI features should send only the information required for the requested capability.

---

#### Localization

Input components should support future localization.

Implementation should account for:

- Longer translated labels
- Different date formats
- Different time formats
- Different number formats
- Right-to-left layouts where future localization requires them

Layouts should not depend on fixed English text lengths.

---

#### Input Accessibility

Input components must:

- Support screen readers
- Use descriptive labels
- Associate error messages with the relevant input
- Expose required state where applicable
- Expose selected and checked states
- Maintain adequate touch targets
- Support text scaling
- Maintain sufficient contrast
- Provide visible focus indicators where applicable
- Avoid relying solely on placeholder text
- Avoid relying solely on color
- Support keyboard navigation where applicable

Deep Focus should generally target a minimum interactive touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility requirements should also be respected.

---

#### Reduced Motion

Input feedback should respect reduced-motion preferences.

When reduced motion is enabled:

- Decorative transitions should be reduced
- Selection changes should remain understandable
- Validation feedback should remain clear
- Functionality should remain unchanged

Input meaning should never depend on animation.

---

#### Input Performance

Input interactions should remain responsive.

Implementation should avoid:

- Expensive work on every keystroke
- Unnecessary global state updates
- Repeated network requests while typing
- Repeated persistence writes without meaningful value
- Heavy animations during input
- Re-rendering unrelated screen areas

High-cost operations should be delayed, debounced, or triggered at an appropriate interaction point when necessary.

---

#### Input Usage Rules

Avoid:

- Using placeholder text as the only label
- Requesting unnecessary information
- Excessive required fields
- Showing errors too aggressively while users are typing
- Using Dropdowns when a simpler control is clearer
- Using Toggles for multi-option decisions
- Using Checkboxes for mutually exclusive options
- Using Sliders when precise values cannot be determined accessibly
- Clearing valid input after recoverable errors
- Using color as the only validation indicator
- Persisting sensitive input unnecessarily
- Treating self-reported mood or energy as clinical measurements
- Using productivity data to claim medical or psychological diagnoses

Input components should reduce effort rather than create additional work for the user.

---

#### Input Component Governance

Before introducing a new input pattern, contributors should determine whether:

- An existing component already solves the requirement
- The requested information is genuinely necessary
- A simpler interaction could reduce user effort
- The component follows `COMPONENT_LIBRARY.md`
- Accessibility requirements are satisfied
- Privacy implications have been considered
- Validation behavior is clear
- The component supports supported mobile platforms
- The pattern remains compatible with future localization

New input patterns should not be introduced solely for visual novelty.

---

#### Input Component Principles

Every Deep Focus input component should:

- Remain clear
- Minimize user effort
- Prevent avoidable errors
- Preserve user-entered information where appropriate
- Support accessibility
- Respect privacy
- Use appropriate validation
- Support localization
- Remain responsive
- Avoid unnecessary complexity
- Distinguish user-reported information from AI estimates
- Follow the approved Design System
- Remain consistent across the application

Input components should help users provide the minimum information necessary to accomplish their goal and return quickly to meaningful work.

---

### 7.6 Session Components

The Focus Session is the central productivity experience of Deep Focus.

Every session should create a calm, focused, and distraction-conscious environment that helps users remain engaged with meaningful work while minimizing unnecessary interaction with the application itself.

Session components should provide only the information and controls necessary for the current session state.

The session experience should remain visually simple, reliable, accessible, and consistent with the Focus Session Architecture defined in `ARCHITECTURE.md`.

---

#### Design Principles

Session components should:

- Minimize unnecessary distractions
- Support sustained concentration
- Reduce cognitive load
- Communicate session state clearly
- Provide meaningful progress feedback
- Preserve user control
- Remain reliable during long-running sessions
- Support accessibility
- Respect reduced-motion preferences
- Remain usable without continuous network connectivity
- Avoid unnecessary dependence on AI
- Respect platform and operating-system limitations

The session interface should prioritize the user's work rather than encouraging continuous interaction with Deep Focus.

---

#### Session Visual Hierarchy

The active session interface should prioritize information in approximately this order:

```text
Remaining Time / Session Progress
            ↓
Current Task or Session Goal
            ↓
Focus Mode / Session State
            ↓
Essential Controls
            ↓
Optional Supporting Information
```

Secondary information should not visually compete with the timer or current task.

The number of simultaneously visible metrics should remain limited.

---

#### Circular Focus Timer

The Circular Focus Timer may serve as the primary visual element during an active focus session.

The timer may display:

- Remaining Time
- Current Session Name or Task
- Current Focus Mode
- Session State

A surrounding progress ring may provide a visual representation of elapsed or remaining session progress.

The timer should remain readable at a glance without requiring users to interact with the screen.

---

##### Timer Accuracy

The visual timer is not the authoritative source of session timing.

Timing accuracy should follow the Focus Session Architecture and should be based on reliable timestamps and session state.

The displayed timer may update regularly for visual feedback, but rendering frequency should not determine session correctness.

This helps prevent timer drift and improves recovery after application backgrounding or interruption.

---

##### Timer Typography

Timer text should:

- Remain highly readable
- Use clear numerical typography
- Maintain sufficient contrast
- Support accessibility settings
- Avoid unnecessary visual effects

Where supported, tabular numerals may be used to reduce visual movement as timer values change.

---

#### Session Progress Ring

The Session Progress Ring provides a secondary visual representation of session completion.

It should:

- Communicate progress clearly
- Reflect the current session state
- Use approved design tokens
- Remain visually calm
- Avoid unnecessary rendering work
- Remain understandable when animation is reduced

The progress ring may animate smoothly during normal use.

However, animation should not be required for accurate progress representation.

---

##### Progress Ring Motion

Progress animation should remain subtle.

Avoid:

- Rapid pulsing
- Continuous glowing effects
- Aggressive color cycling
- Large scaling effects
- Motion that competes with the user's work

A subtle glow or emphasis may be used only when it provides meaningful state feedback and remains consistent with the Design System.

Reduced-motion preferences should remove or simplify non-essential progress animation.

---

#### Focus Mode Indicator

Users should be able to identify the currently active Focus Mode.

Supported product modes may include:

- Soft Shield
- Deep Focus Shield
- God Mode

Each mode may use a distinct supporting visual treatment while remaining within the shared Deep Focus Design System.

Focus Mode identity may use combinations of:

- Label
- Icon
- Accent treatment
- Supporting description

Mode identity should not rely solely on color.

---

##### Focus Mode Clarity

The selected mode should clearly communicate what level of distraction protection is active.

Descriptions should remain understandable and should not imply technical capabilities that the operating system cannot reliably provide.

For example, the interface should distinguish between:

```text
Selected apps will be blocked where supported.
```

and:

```text
All distractions are completely disabled.
```

The second statement should not be used unless the platform can actually guarantee that behavior.

---

#### Live Session Status

The interface may display a limited amount of live session information.

Possible information includes:

- Remaining Time
- Current Task
- Active Focus Mode
- Session Progress
- Pause State
- Relevant soundscape status

Optional gamification information such as XP should remain secondary.

The active session screen should not become an analytics dashboard.

Only information useful during the current session should remain visible.

---

#### Session Controls

Only essential controls should remain visible during an active session.

Possible controls include:

- Pause Session
- Resume Session
- End Session
- Emergency Exit where required
- Sound controls where enabled

Control availability may depend on the selected Focus Mode.

Controls should:

- Remain easy to understand
- Maintain adequate touch targets
- Avoid accidental activation
- Use clear labels or recognizable icons
- Preserve session state correctly
- Provide immediate feedback

Secondary controls should not compete visually with the session itself.

---

##### Pause and Resume Controls

Where pausing is supported, the Pause control should clearly communicate the resulting state.

Paused sessions should visibly indicate that focus-time accumulation has stopped according to session rules.

The Resume control should return users to the active session without resetting valid progress.

---

##### End Session Control

Ending a session early should follow the defined cancellation rules.

Where accidental activation could cause loss of progress, confirmation may be appropriate.

The interface should clearly distinguish:

```text
Complete Session
```

from:

```text
End Early
```

when the underlying outcomes differ.

---

##### Emergency Exit

High-commitment Focus Modes should still provide a safe way to exit when necessary.

Emergency exit behavior should:

- Remain accessible
- Avoid accidental activation
- Clearly explain consequences
- Preserve valid session information where possible
- Respect platform safety and usability expectations

A focus mode should never make necessary device use unsafe or impossible.

---

#### Distraction Shield Status

When distraction-protection features are active, users should receive clear confirmation of what protection is currently enabled.

Possible status information may include:

- Shield Active
- Notification Reduction Active
- Selected App Restrictions Active
- High-Commitment Mode Active

The wording should reflect actual platform capabilities.

The interface should not claim that notifications, applications, or operating-system behavior are fully blocked when Deep Focus cannot technically guarantee that result.

---

##### Shield Capability Transparency

Where platform limitations apply, Deep Focus should explain them clearly without overwhelming the session interface.

For example:

```text
Selected distractions are restricted where supported by your device.
```

More detailed limitations may be available through setup or settings rather than displayed constantly during a session.

The goal is to preserve trust without creating unnecessary anxiety or technical clutter.

---

#### Adaptive Soundscape Controls

When soundscapes are enabled, users should have lightweight access to relevant controls.

Possible controls include:

- Play
- Pause
- Volume
- Soundscape Selection

Soundscape controls should:

- Remain secondary to the focus timer
- Avoid opening complex interfaces unnecessarily
- Avoid interrupting session timing
- Preserve audio state where practical
- Respect platform audio behavior
- Maintain accessible controls

Frequent sound adjustments should not require leaving the active session screen.

---

##### Adaptive Soundscape Behavior

If future AI-assisted or adaptive soundscapes are implemented, changes should remain subtle.

Automatic changes should:

- Avoid sudden volume changes
- Avoid disruptive sound transitions
- Respect user preferences
- Allow manual override where appropriate
- Avoid claiming precise psychological effects without evidence

Core soundscape functionality should remain usable without AI where practical.

---

#### True Zen Break Screen

After a completed focus session, Deep Focus may offer the True Zen Break recovery experience.

The recovery screen may include:

- Completion acknowledgment
- Hydration reminder
- Eye relaxation guidance
- Breathing exercise
- Stretch suggestion
- Short walking suggestion
- Calm soundscape

The visual treatment should feel noticeably calmer than the active focus session.

---

##### Recovery User Control

Recovery should support sustainable work habits without unnecessarily forcing interaction.

Depending on the workflow, users may be able to:

- Start the suggested break
- Choose another recovery activity
- Skip or dismiss the suggestion
- End the break early where appropriate

Recovery guidance should remain supportive rather than judgmental.

It should not be presented as medical treatment.

---

#### Session Summary Card

After a completed session, users may receive a concise session summary.

Possible information includes:

- Focus Duration
- Session Task
- Completion Status
- Focus Mode
- Recovery Activity
- Relevant distractions or interruptions
- XP earned where enabled
- Streak progress where enabled
- Selected analytics or insights

The summary should encourage reflection rather than competition.

---

##### Summary Metrics

Only metrics that can be meaningfully measured or derived should be displayed.

A `Productivity Score` should not be treated as mandatory.

If a score is introduced, its meaning should be clearly defined and should not imply an objective measurement of personal worth or total productivity.

Similarly, an `Energy Change` should not be presented as a measured physiological change unless supported by a validated source.

User-reported before-and-after energy may be displayed as user-reported information when that feature is enabled.

---

##### Session Reflection

Optional reflection may allow users to record information such as:

- How focused the session felt
- Whether the task was completed
- Current energy
- Notes
- Recovery preference

Reflection should remain quick and optional where practical.

The application should not require unnecessary self-reporting after every session.

---

#### Reward Animation

Completing an eligible session may trigger subtle gamification feedback.

Possible examples include:

- XP increase
- Level progress
- Badge unlock
- Streak update
- Milestone completion

Reward feedback should remain secondary to the session accomplishment itself.

---

##### Reward Animation Rules

Reward animations should:

- Remain short
- Remain subtle
- Avoid repeated celebration
- Avoid excessive confetti or flashing
- Respect reduced-motion preferences
- Avoid delaying access to the session summary
- Avoid pressuring users to start another session immediately

Gamification should reinforce healthy consistency rather than encourage excessive work.

---

#### Session States

Session components should visually represent the authoritative session states defined by the Focus Session Architecture.

Possible primary states include:

- Idle
- Preparing
- Ready
- Running
- Paused
- Completed
- Cancelled
- Interrupted
- Failed

Recovery or break experiences may use their own related state where appropriate.

Only one primary session state should be authoritative at a time.

---

##### Preparing State

The Preparing state may appear while the session is being initialized.

The interface should:

- Confirm selected configuration
- Complete required setup
- Avoid unnecessary delay
- Provide clear feedback if initialization fails

---

##### Ready State

The Ready state may allow users to confirm the session before timing begins.

This state should remain simple.

Possible content includes:

- Task
- Duration
- Focus Mode
- Start action

---

##### Running State

The Running state should provide the most distraction-minimized interface.

It should prioritize:

- Timer
- Task
- Session state
- Essential controls

Non-essential content should be minimized.

---

##### Paused State

Paused sessions should clearly communicate that the session is not currently progressing according to focus-time rules.

The interface may reduce visual intensity and emphasize the Resume action.

---

##### Completed State

The Completed state should clearly confirm successful session completion.

It may transition into:

- Session Summary
- Recovery Experience
- Reward Feedback

The transition should remain calm and predictable.

---

##### Cancelled State

Cancelled sessions should remain visually and semantically different from completed sessions.

The interface should avoid presenting completion rewards when cancellation rules do not qualify for them.

---

##### Interrupted State

An Interrupted state may be used when the application detects a recoverable interruption that requires reconciliation.

The interface should explain what happened in clear user-facing language.

---

##### Failed State

A Failed state should be used only when the session cannot continue or recover safely.

The interface should:

- Preserve valid progress where possible
- Provide understandable feedback
- Offer recovery or safe exit actions
- Avoid exposing raw technical errors

---

#### Background and Resume Experience

When the application returns from the background, session components should restore the correct visible state based on authoritative session timing and persisted data.

The interface should not assume the JavaScript timer continued running continuously while the application was backgrounded.

On resume, the UI should:

- Recalculate remaining time
- Restore the current session state
- Avoid duplicate completion
- Restore relevant controls
- Communicate unusual recovery conditions where necessary

The user should not need to manually reconstruct the session state.

---

#### Offline Experience

Core active session components should remain functional without continuous internet access.

Offline state should not interrupt:

- Local session timing
- Local session controls
- Local session persistence
- Supported local soundscapes

Optional AI, cloud, or synchronization capabilities may display an unavailable or deferred state.

The active focus experience should not fail simply because an optional remote service is unavailable.

---

#### Session Notifications

Session-related notification feedback should remain consistent with the Notification and Focus Session Architecture.

Possible notifications may include:

- Session completion
- Break completion
- User-configured reminders

Notifications should not be treated as the authoritative session timer.

The active session screen should remain correct even if notification delivery is delayed or unavailable.

---

#### Visual Style

Session components should use a restrained visual language.

The active session screen should prioritize:

- Strong readability
- Minimal color competition
- Limited visible controls
- Calm surfaces
- Clear session state
- Consistent typography
- Subtle progress indication

Decorative elements should remain limited.

The session screen should not become visually busier as more optional features are enabled.

---

#### Session Animations

Session animation may be used for:

- Progress
- State transitions
- Pause and resume feedback
- Session completion
- Reward feedback

Animations should:

- Remain subtle
- Avoid flashing
- Avoid continuous unnecessary motion
- Avoid distracting users from external work
- Remain efficient during long sessions
- Respect reduced-motion preferences

The focus experience should remain understandable when non-essential motion is removed.

---

#### Accessibility

Session components must:

- Support screen readers
- Maintain sufficient contrast
- Provide readable timer text
- Maintain adequate touch targets
- Use descriptive accessibility labels
- Expose session state appropriately
- Support text scaling
- Avoid flashing or rapidly changing visual effects
- Avoid relying only on color
- Respect reduced-motion preferences
- Preserve usable controls when accessibility settings change

Deep Focus should generally target a minimum interactive touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

---

#### Screen Reader Behavior

The timer should not overwhelm screen-reader users by announcing every second automatically.

Instead, the experience should provide accessible access to the current remaining time without creating constant announcements.

Important state changes may be announced when appropriate, such as:

- Session started
- Session paused
- Session resumed
- Session completed
- Session failed

Announcements should remain useful and non-disruptive.

---

#### Session Performance

Session components should remain efficient during extended use.

Implementation should:

- Avoid application-wide re-renders every second
- Keep high-frequency timer updates localized
- Avoid unnecessary background work
- Avoid unnecessary network requests
- Release unused audio resources
- Keep animations lightweight
- Avoid repeatedly calculating unchanged information

Long-running sessions should not cause steadily increasing memory or battery consumption.

---

#### Session Component Usage Rules

Avoid:

- Overcrowding the active session screen
- Displaying unnecessary analytics during focus
- Making XP or rewards visually dominant
- Claiming unsupported distraction-blocking capabilities
- Using animation as the source of timer accuracy
- Requiring continuous internet access for core timing
- Interrupting sessions with non-essential AI recommendations
- Forcing recovery activities without user control
- Presenting estimated energy as a physiological measurement
- Presenting undefined productivity scores as objective truth
- Excessive reward animations
- Small or ambiguous session controls
- Using color alone to communicate session state

The active session interface should remain one of the simplest experiences in Deep Focus.

---

#### Session Component Governance

Before introducing a new active-session component, contributors should determine whether:

- The information is genuinely useful during the session
- It needs to remain visible continuously
- It could instead appear during setup or summary
- It introduces distraction
- It affects session performance
- It supports accessibility
- It works offline where necessary
- It respects platform capabilities
- It remains consistent with `ARCHITECTURE.md`
- It supports the core Deep Focus philosophy

Features should not automatically appear on the active session screen simply because they relate to productivity.

---

#### Session Component Principles

Every Deep Focus session component should:

- Protect user attention
- Communicate session state clearly
- Preserve timing reliability
- Maintain user control
- Respect operating-system limitations
- Remain usable offline where practical
- Support accessibility
- Support long-running sessions efficiently
- Avoid unnecessary AI dependency
- Avoid unsupported health or productivity claims
- Keep rewards secondary
- Respect reduced motion
- Remain calm and predictable

The Focus Session interface should help users start their work, understand their progress when necessary, and otherwise allow the application to fade into the background of the experience.

---

### 7.7 Analytics Components

Analytics help users understand their focus patterns, work habits, recovery routines, and long-term progress.

Rather than displaying large amounts of raw data, the Analytics experience should transform available information into clear, meaningful, and understandable patterns that help users reflect on and improve their productivity habits.

Analytics should support reflection without creating pressure, guilt, or unnecessary competition.

The interface should prioritize clarity, simplicity, accessibility, transparency, and user control.

---

#### Design Principles

Analytics components should:

- Be easy to understand
- Highlight meaningful patterns and trends
- Support long-term reflection
- Avoid overwhelming users with excessive data
- Distinguish measured data from estimates and AI-generated interpretations
- Present AI-generated insights only when they provide meaningful value
- Support both beginner and advanced users through progressive disclosure
- Avoid encouraging unhealthy productivity behavior
- Avoid unnecessary comparison or competition
- Maintain consistent visual hierarchy
- Support accessibility
- Respect user privacy
- Remain useful without AI services

Analytics should help users understand their habits rather than judge their performance.

---

#### Analytics Information Hierarchy

Analytics screens should prioritize information approximately in this order:

```text
Key Summary
     ↓
Important Trends
     ↓
Meaningful Insights
     ↓
Supporting Details
     ↓
Advanced Analysis
```

Users should be able to understand the most important information without reviewing every available metric.

Advanced information may be progressively disclosed when needed.

---

#### Statistics Cards

Statistics Cards provide a concise overview of important productivity information.

Possible examples include:

- Total Focus Time
- Sessions Completed
- Average Session Length
- Current Streak
- Goal Progress
- Recovery Breaks Completed
- XP Earned where gamification is enabled

Statistics should remain easy to scan.

Each card should communicate:

- Metric name
- Current value
- Relevant comparison where useful
- Time period where necessary
- Supporting context where the value could otherwise be misunderstood

---

##### Statistics Updates

Statistics should update when the underlying authoritative data changes.

The interface should not require continuous real-time updates when they provide no meaningful user value.

For example, completed-session statistics may update after a session is successfully recorded rather than continuously during the active session.

Analytics calculations should remain consistent with stored session data and domain rules.

---

##### Metric Context

Metrics should provide enough context to prevent misinterpretation.

For example:

```text
Focus Time

8h 20m
This week
```

is preferable to displaying:

```text
8h 20m
```

without identifying the measured period.

---

#### Progress Charts

Charts may help users visualize patterns over time.

Possible chart types include:

- Bar Charts
- Line Charts
- Progress Rings
- Heatmaps
- Other approved visualizations where appropriate

Pie or donut charts may be used only when they clearly communicate part-to-whole relationships and remain accessible.

The chart type should be selected according to the information being communicated rather than for visual variety.

---

##### Chart Design

Charts should:

- Remain visually simple
- Use approved design tokens
- Avoid unnecessary decoration
- Use readable labels
- Provide clear time periods
- Avoid excessive data density
- Maintain sufficient contrast
- Support Light Mode and Dark Mode
- Remain understandable without animation
- Avoid relying solely on color

Interactive chart behavior should provide meaningful value rather than unnecessary complexity.

---

##### Chart Interaction

Where interaction is useful, charts may support:

- Selecting a data point
- Viewing exact values
- Switching time periods
- Reviewing additional context
- Exploring trends

Interactions should maintain adequate touch targets and should not require precise gestures that are difficult to perform.

Important information should not be available only through hover behavior.

---

#### Focus Trend Chart

The Focus Trend Chart displays focus activity across selected periods.

Possible views include:

- Daily
- Weekly
- Monthly

Depending on available data, the chart may display:

- Focus duration
- Completed sessions
- Average session duration
- Goal completion patterns

The primary purpose is to help users identify patterns and consistency over time rather than encourage continuous increases in work duration.

---

##### Focus Trend Interpretation

The interface should avoid automatically treating more focus time as better productivity.

For example, increasing total focus hours should not automatically be presented as positive if the application also has evidence of reduced recovery or inconsistent habits.

Analytics should support balanced interpretation rather than maximizing work duration.

---

#### Energy Trend

Energy-related analytics should be based primarily on information users intentionally report.

Possible information may include:

- Self-reported energy before sessions
- Self-reported energy after sessions
- Time-of-day patterns
- Relationship between reported energy and focus sessions

Energy information should be clearly identified as user-reported or estimated where applicable.

---

##### Energy Trend Presentation

Possible states may include:

- Higher reported energy
- Moderate reported energy
- Lower reported energy
- Insufficient data

The interface should avoid presenting energy as a precise physiological measurement unless a future validated data source supports such measurement.

For example:

```text
You reported higher energy during morning sessions this week.
```

is preferable to:

```text
Your body performs best at 8:00 AM.
```

---

##### Energy and Mood Data

Mood and energy information should remain distinguishable.

Self-reported mood should not automatically be converted into a measured energy value.

AI may identify possible patterns across user-provided information, but those patterns should be presented as interpretations rather than confirmed facts.

---

#### Distraction Analysis Card

The Distraction Analysis Card may summarize distraction-related information that Deep Focus can reliably observe or record.

Possible information includes:

- Interrupted Sessions
- User-recorded distractions
- Notification-related events where available
- Supported app-restriction events
- Session recovery patterns

The exact information available may vary according to platform capabilities and user permissions.

---

##### Distraction Data Accuracy

Deep Focus should not claim to have detected or blocked activity that the operating system does not expose reliably.

For example, `Blocked App Attempts` should only be displayed when the platform and implemented feature can reliably provide that information.

Unavailable information should not be estimated and presented as measured data.

---

##### Distraction Insights

Distraction-related insights should remain supportive.

Avoid:

```text
You failed to stay focused 8 times.
```

Prefer:

```text
Most interruptions occurred during your afternoon sessions.
```

The purpose of distraction analytics is to help users identify useful patterns rather than create guilt.

---

#### Productivity Indicators

Deep Focus may provide productivity-related indicators when they offer clear user value.

Any combined indicator should have a documented definition and should be based on understandable inputs.

Possible contributors may include:

- Session completion
- Focus consistency
- Goal progress
- Recovery habits
- User-reported experience

A combined productivity indicator should not automatically be treated as an objective measurement of a person's overall productivity.

---

##### Productivity Score

If a `Productivity Score` is introduced, it should:

- Have a clearly documented calculation
- Use only appropriate available data
- Explain the factors that influence it
- Avoid implying scientific precision
- Avoid becoming the primary measure of user success
- Avoid encouraging excessive work
- Avoid comparing users unnecessarily
- Remain understandable without AI

The score should support reflection rather than judgment.

If the project cannot define a meaningful and transparent calculation, the interface should prefer individual understandable metrics instead.

---

#### Recovery Analytics

Recovery analytics may help users understand their break and recovery habits.

Possible information includes:

- Breaks completed
- Average break duration
- Break consistency
- User-reported post-break energy
- Focus patterns following breaks

Recovery analytics should not claim that a break medically improved the user's health or mental condition.

---

##### Recovery Effectiveness

The application should avoid presenting `Recovery Effectiveness` as an objective measurement unless the metric has a clearly defined and validated basis.

Where information is based on user reports, wording should reflect that.

For example:

```text
You reported better energy after longer breaks this week.
```

is preferable to:

```text
Your recovery effectiveness increased by 32%.
```

unless that percentage has a transparent and meaningful calculation.

---

#### Well-Being Signals

Deep Focus may present non-clinical well-being or workload signals based on available productivity patterns and user-reported information.

Possible signals may include:

- Longer-than-usual work periods
- Reduced break frequency
- Lower self-reported energy
- Increased session interruption
- Changes in normal focus patterns

These signals should remain supportive and informational.

---

##### Burnout-Related Language

Deep Focus should not present productivity analytics as a medical or psychological diagnosis.

Avoid definitive labels such as:

```text
Burnout Detected
```

or:

```text
You have high burnout.
```

Prefer supportive language such as:

```text
Your recent work pattern includes longer sessions and fewer breaks than usual.
```

or:

```text
You have reported lower energy across several recent sessions. Consider additional recovery time if helpful.
```

Any stronger burnout-related feature should require appropriate validation before stronger claims are introduced.

---

#### AI Insight Panel

AI-generated insights may appear alongside analytics when they provide useful interpretation.

Possible examples include:

```text
Your morning sessions were longer and more consistently completed this week.
```

```text
You reported higher energy after longer breaks on several recent days.
```

```text
Your focus-session consistency increased compared with last week.
```

AI insights should explain patterns rather than merely repeat statistics.

---

##### AI Insight Identification

AI-generated interpretations should be visually or textually distinguishable from confirmed application data.

Users should be able to understand the difference between:

- Recorded data
- Calculated metrics
- User-reported information
- AI-generated interpretation

AI-generated interpretations should never be presented as directly measured facts.

---

##### AI Insight Explanations

Where practical, AI insights should explain the basis for the recommendation or observation.

For example:

```text
AI Insight

Your morning sessions were more consistently completed this week.

Based on 6 completed morning sessions during the past 7 days.
```

Explanations should remain concise and should not overwhelm the primary insight.

---

##### AI Uncertainty

AI should use appropriately cautious language when the available data is limited or uncertain.

For example:

```text
Your recent sessions suggest that morning focus may work well for you.
```

is preferable to:

```text
Morning is your perfect productivity time.
```

When insufficient data exists, Deep Focus should say so rather than generate a confident conclusion.

---

#### Weekly Summary

Deep Focus may provide a concise weekly summary that helps users reflect on recent patterns.

Possible information includes:

- Total Focus Time
- Sessions Completed
- Average Session Length
- Goal Progress
- Recovery Activity
- Streak Progress where enabled
- XP Earned where enabled
- Notable patterns
- Optional AI recommendations

The summary should focus on useful reflection rather than performance pressure.

---

##### Weekly Reflection

A weekly summary may highlight:

```text
What went well
```

```text
Patterns you may want to review
```

```text
A possible focus for next week
```

The language should remain supportive and optional.

Deep Focus should avoid implying that every week must outperform the previous week.

---

##### Weekly AI Recommendations

AI-generated weekly recommendations may suggest:

- Adjusting session timing
- Trying a different session duration
- Scheduling more recovery
- Reviewing unfinished goals
- Maintaining a successful existing routine

Recommendations should remain suggestions.

Users should be able to ignore or dismiss them without affecting core functionality.

---

#### Comparison Views

Analytics may allow users to compare periods when comparison provides meaningful context.

Possible comparisons include:

- This week vs previous week
- This month vs previous month
- Current average vs personal historical average

Comparisons should focus on the user's own patterns.

Deep Focus should avoid unnecessary social comparison or competitive ranking unless a future approved feature explicitly requires it.

---

##### Comparison Language

Changes should be described neutrally.

For example:

```text
Focus time decreased by 12% from last week.
```

should not automatically be labeled as negative.

A reduction may reflect:

- Additional recovery
- Different workload
- Completed goals
- Personal schedule changes

Analytics should provide information without automatically judging every increase or decrease.

---

#### Empty States

When insufficient information is available, Analytics should display clear and encouraging empty states.

Examples include:

```text
Complete a focus session to start building your focus history.
```

```text
More sessions are needed before a meaningful trend can be shown.
```

```text
No recovery data is available for this period.
```

Empty states should explain what information is missing without pressuring users to generate more data.

---

##### Insufficient Data

AI-generated analytics should not invent insights when insufficient data exists.

When necessary, the interface should explicitly communicate:

```text
Not enough data yet
```

and explain what information is required before the insight becomes meaningful.

---

#### Loading States

Analytics may require time to load, calculate, or synchronize.

Loading states should:

- Remain visually calm
- Avoid large distracting animations
- Preserve existing information where appropriate
- Avoid unnecessary layout shifts
- Distinguish loading from an empty state

Previously available data may remain visible while updated information is being retrieved when appropriate.

---

#### Error States

Analytics failures should not prevent access to unrelated Deep Focus functionality.

Possible errors include:

- Local data unavailable
- Synchronization failure
- Remote analytics unavailable
- AI service unavailable
- Invalid or incomplete data

The interface should provide clear recovery actions where appropriate.

AI failure should not prevent non-AI analytics from remaining available.

---

#### Offline Analytics

Analytics that can be calculated from locally available information should remain accessible offline where practical.

Remote-only information may display:

```text
Available when you're back online.
```

Core historical information should not unnecessarily depend on an active network connection.

---

#### Analytics Privacy

Analytics should follow privacy-by-design principles.

Deep Focus should:

- Collect only information required for approved features
- Avoid unnecessary behavioral tracking
- Keep sensitive productivity information protected
- Explain optional data usage where appropriate
- Respect user consent
- Avoid transmitting unnecessary information to AI services
- Support future data deletion and export requirements

Analytics should primarily exist to benefit the user rather than maximize application engagement.

---

#### Analytics Accessibility

Analytics components must:

- Support screen readers
- Provide text alternatives for charts
- Maintain sufficient contrast
- Avoid relying solely on color
- Support text scaling
- Provide understandable labels
- Maintain adequate touch targets
- Remain usable with reduced motion
- Expose meaningful chart values accessibly
- Avoid requiring precise gestures
- Maintain logical reading order

Charts should never be the only representation of important information.

---

##### Chart Text Alternatives

Important charts should provide an accessible summary.

For example:

```text
Weekly Focus Summary

Monday: 45 minutes
Tuesday: 60 minutes
Wednesday: 30 minutes
Thursday: 75 minutes
Friday: 50 minutes

Highest focus duration: Thursday, 75 minutes.
```

The exact presentation may vary, but equivalent information should remain available without requiring visual chart interpretation.

---

#### Reduced Motion

Analytics animations should respect reduced-motion preferences.

When reduced motion is enabled:

- Chart entrance animations should be removed or simplified
- Number-count animations should be reduced
- Transitions should remain understandable
- Information should remain fully available

Analytics meaning should never depend on animation.

---

#### Analytics Performance

Analytics components should remain efficient as user history grows.

Implementation should:

- Avoid recalculating unchanged historical data unnecessarily
- Load only required information
- Aggregate large datasets appropriately
- Avoid rendering excessive chart points
- Cache safe derived information where appropriate
- Avoid unnecessary network requests
- Keep expensive calculations away from high-frequency UI updates
- Support large focus-history datasets gracefully

Analytics performance should remain predictable as the user's history increases.

---

#### Analytics Component Usage Rules

Avoid:

- Displaying excessive metrics on one screen
- Treating more work time as automatically better
- Presenting undefined scores as objective truth
- Presenting AI interpretations as measured facts
- Diagnosing burnout from productivity data
- Treating self-reported energy as physiological measurement
- Creating guilt through distraction analytics
- Using social comparison unnecessarily
- Using charts without accessible alternatives
- Relying solely on color
- Generating confident insights from insufficient data
- Blocking analytics because AI is unavailable
- Collecting unnecessary behavioral data
- Using analytics primarily to increase engagement

Analytics should support understanding rather than surveillance or pressure.

---

#### Analytics Component Governance

Before introducing a new analytics metric, chart, score, or AI insight, contributors should determine:

- What user question does this information answer?
- Is the underlying data reliable?
- Is the metric measured, calculated, user-reported, or AI-generated?
- Can users understand how the value was produced?
- Could the metric create unhealthy pressure?
- Does the visualization improve understanding?
- Is an accessible non-visual representation available?
- Does the feature require additional personal data?
- Can the feature work without AI where appropriate?
- Is the metric consistent with `ARCHITECTURE.md` and `AI_RULES.md`?

Analytics should not expand simply because additional data can be collected.

---

#### Analytics Component Principles

Every Deep Focus analytics component should:

- Provide meaningful user value
- Remain understandable
- Distinguish facts from AI interpretations
- Distinguish user-reported information from measured information
- Avoid unsupported health claims
- Avoid unnecessary productivity pressure
- Respect user privacy
- Support accessibility
- Remain useful without AI
- Handle insufficient data honestly
- Support offline access where practical
- Scale with growing user history
- Follow the approved Design System

Analytics should help users understand their productivity patterns and make more intentional decisions without turning productivity into constant measurement or competition.

---

### 7.8 Reward Components

The Deep Focus reward system is designed to reinforce sustainable productivity habits through meaningful progress, recognition, and optional personalization.

Rewards should celebrate consistency, recovery, personal growth, and meaningful achievement without encouraging excessive work, unhealthy competition, or compulsive application engagement.

Reward components should remain secondary to the user's actual goals and productivity experience.

The purpose of rewards is to acknowledge progress rather than create pressure to continue working.

---

#### Design Principles

Reward components should:

- Celebrate meaningful achievements
- Encourage long-term consistency
- Reinforce sustainable work habits
- Recognize healthy recovery behavior
- Remain motivating without becoming distracting
- Avoid unnecessary competition
- Avoid manipulative engagement patterns
- Preserve user autonomy
- Integrate naturally into the overall Deep Focus experience
- Remain understandable and transparent
- Support accessibility
- Respect reduced-motion preferences

Rewards should support intrinsic motivation rather than replace it.

---

#### Reward Hierarchy

Reward information should generally remain secondary to the user's actual work.

A typical hierarchy may be:

```text
Meaningful Achievement
        ↓
Progress Recognition
        ↓
Optional Reward Feedback
        ↓
Cosmetic or Collection Progress
```

Gamification should not visually dominate:

- Focus Sessions
- Recovery experiences
- Goal completion
- Analytics
- Core productivity workflows

---

#### Focus XP

Focus XP represents progress within the Deep Focus gamification system.

Users may earn XP through eligible activities such as:

- Completing focus sessions
- Completing meaningful tasks
- Maintaining sustainable consistency
- Completing optional recovery activities
- Reaching personal milestones
- Completing approved challenges

XP should reward meaningful behavior rather than raw time spent inside the application.

---

##### XP Rules

XP calculations should follow documented domain rules.

The system should avoid:

- Unlimited XP for excessively long sessions
- Rewarding repeated low-value actions
- Encouraging users to skip recovery
- Rewarding unnecessary application interaction
- Creating pressure to maintain constant activity

Where appropriate, XP may use limits, diminishing returns, or eligibility rules to prevent unhealthy optimization of the reward system.

---

##### XP Transparency

Users should be able to understand why XP was earned.

For example:

```text
Focus Session Completed
+50 XP

True Zen Break Completed
+10 XP
```

Reward calculations do not need to expose complex internal formulas, but users should understand the meaningful action that produced the reward.

---

#### XP Counter

The XP Counter displays the user's accumulated Focus XP.

The counter should:

- Remain easy to understand
- Use clear numerical typography
- Update predictably
- Avoid unnecessary animation
- Remain secondary during active focus sessions
- Support accessibility

XP should not become a persistent attention-demanding element on every screen.

---

##### XP Update Feedback

When XP is awarded, feedback may use:

- Short count-up animation
- Small progress movement
- Subtle confirmation message

Feedback should remain brief.

Large celebratory effects should be reserved for meaningful milestones rather than ordinary XP changes.

---

#### Level Progress Card

Users may progress through levels as they accumulate eligible Focus XP.

The Level Progress Card may display:

- Current Level
- Current XP
- XP Required for the Next Level
- Progress toward the next level
- Optional unlocked rewards

Level progression should represent long-term consistency rather than productivity intensity.

---

##### Level Progress Design

The progress card should clearly communicate:

```text
Current Level
      ↓
Progress
      ↓
Next Milestone
```

For example:

```text
Level 8

1,420 / 1,800 XP

380 XP until Level 9
```

Progress should feel understandable without creating artificial urgency.

---

##### Level Progression Rules

Levels should not:

- Require unhealthy amounts of daily work
- Reset unexpectedly
- Pressure users into excessive focus sessions
- Provide unfair productivity advantages
- Become necessary for core application functionality

Level rewards should remain primarily cosmetic, motivational, or recognition-based.

---

#### Daily Streak Card

The Daily Streak Card recognizes consistency over time.

Possible information includes:

- Current Streak
- Longest Streak
- Weekly Consistency
- Recent Activity
- Streak Protection where implemented

Streaks should reward sustainable habit formation rather than punish users for normal interruptions in life.

---

##### Streak Philosophy

Missing a day should not create excessive frustration or guilt.

The interface should avoid language such as:

```text
You lost everything.
```

Prefer supportive language such as:

```text
Your previous streak ended at 12 days.

Start again whenever you're ready.
```

A streak should represent progress history rather than user worth.

---

##### Streak Protection

Future versions may introduce optional streak-protection mechanisms.

Possible examples include:

- Streak Freeze
- Grace Day
- Recovery Day

These features should not create financial or psychological pressure.

Streak protection should not require unhealthy engagement to obtain or maintain.

---

#### Achievement Cards

Achievement Cards recognize meaningful milestones within the user's Deep Focus journey.

Possible achievements include:

- First Focus Session
- 7-Day Consistency Streak
- 100 Focus Hours
- Deep Focus Master
- Recovery Champion
- Goal Finisher
- Early Routine Builder
- Focus Consistency Milestone

Achievements should celebrate observable productivity or habit milestones.

---

##### Health-Related Achievement Language

Achievements should not imply that Deep Focus has diagnosed, prevented, or treated a medical or psychological condition.

Avoid achievement names such as:

```text
Burnout Preventer
```

Prefer names such as:

```text
Recovery Champion
```

```text
Balanced Routine
```

```text
Healthy Break Habit
```

Achievement wording should remain within the validated productivity and digital well-being scope of Deep Focus.

---

##### Achievement Content

Each achievement may include:

- Badge Icon
- Title
- Description
- Unlock Date
- Progress where appropriate
- Related milestone information

Achievement descriptions should explain why the milestone was earned.

---

#### Badge Collection

Badges represent optional long-term recognition of meaningful accomplishments.

Users may browse:

- Unlocked Badges
- Locked Badges
- In-Progress Badges
- Recently Earned Badges

Badge designs should remain:

- Clean
- Recognizable
- Visually consistent
- Accessible
- Aligned with the Deep Focus icon system

---

##### Locked Badge Behavior

Locked badges should not create unnecessary pressure.

The interface may show:

- Badge name
- Unlock requirement
- Progress toward completion

However, hidden or difficult achievements should not manipulate users into excessive application use.

A locked collection should not make users feel that normal use is incomplete.

---

#### Avatar and Cosmetic Rewards

Users may unlock optional cosmetic customization through continued progress.

Possible rewards include:

- Profile Frames
- Background Themes
- Avatar Decorations
- Achievement Borders
- Profile Accents

Cosmetic rewards should never provide productivity advantages.

---

##### Cosmetic Reward Rules

Cosmetic rewards should:

- Remain optional
- Avoid distracting visual effects
- Support accessibility
- Maintain performance
- Respect the Deep Focus visual identity
- Avoid changing core functionality

Highly animated cosmetics should be limited or disabled during active focus experiences.

---

#### Reward Unlocks

When a reward becomes available, the interface should clearly communicate:

- What was unlocked
- Why it was unlocked
- Whether action is required
- Where it can be viewed or applied

Example:

```text
Achievement Unlocked

Recovery Champion

Complete 20 healthy recovery breaks.

[View Achievement]
```

Users should not be forced to open reward details before continuing normal application usage.

---

#### Reward Animations

Reward animations may provide brief positive feedback.

Possible examples include:

- XP count-up
- Level progress animation
- Badge unlock
- Streak update
- Milestone transition

Animations should remain subtle and should not interrupt the user's workflow.

---

##### Reward Animation Rules

Reward animations should:

- Remain brief
- Avoid flashing
- Avoid excessive particle effects
- Avoid large bouncing motion
- Avoid repeated celebration
- Respect reduced-motion preferences
- Avoid delaying important navigation
- Avoid interrupting active focus sessions

A routine reward should receive less visual emphasis than a major milestone.

---

#### Milestone Celebrations

Major personal milestones may receive enhanced visual feedback.

Examples may include:

- Level 10
- 30-Day Consistency Streak
- 100 Focus Hours
- 500 Focus Hours
- First Year Milestone
- Major Goal Completion

Celebrations should emphasize personal progress rather than competition.

---

##### Milestone Celebration Rules

Major celebrations should:

- Remain optional to dismiss
- Complete quickly
- Respect reduced motion
- Avoid sound unless user settings allow it
- Avoid blocking normal application use
- Avoid pressuring users to continue immediately

The celebration should acknowledge the achievement and then allow users to move on.

---

#### Reward Summary

A session or weekly summary may display relevant reward progress.

Possible content includes:

- XP Earned
- Level Progress
- Achievement Progress
- Streak Update
- Newly Unlocked Reward

Reward information should remain secondary to:

- Session completion
- Reflection
- Recovery
- Useful productivity insights

---

#### Reward Notifications

Reward notifications should be used sparingly.

Possible notifications may include:

- Important achievement unlocked
- Meaningful milestone reached

Low-value reward notifications should generally remain inside the application rather than generating external notifications.

Reward notifications should respect user preferences.

---

#### Reward Accessibility

Reward components must:

- Support screen readers
- Provide descriptive achievement text
- Maintain sufficient contrast
- Support text scaling
- Maintain adequate touch targets
- Avoid relying solely on color
- Avoid relying solely on animation
- Respect reduced-motion preferences
- Provide meaningful labels for progress indicators
- Remain understandable without decorative effects

Badge meaning should not depend only on its visual artwork.

---

#### Reduced Motion

When reduced motion is enabled:

- XP count-up animation may be shortened or removed
- Badge unlock movement should be simplified
- Level-up transitions should avoid large motion
- Progress changes should remain understandable
- Functional information should remain unchanged

Reward meaning should never depend on animation.

---

#### Reward Sound and Haptics

Reward feedback may use subtle sound or haptic feedback where intentionally designed.

Such feedback should:

- Respect user preferences
- Respect device settings
- Remain optional
- Avoid occurring during active focus unless explicitly appropriate
- Avoid repeated or excessive feedback

Visual information should remain sufficient when sound or haptics are unavailable.

---

#### Reward Performance

Reward components should remain lightweight.

Implementation should:

- Avoid heavy animation libraries solely for rewards
- Avoid loading large cosmetic assets unnecessarily
- Cache appropriate visual assets
- Avoid frequent global state updates
- Prevent duplicate reward processing
- Prevent duplicate achievement unlocks
- Keep large badge collections efficient

Reward presentation should not reduce focus-session performance.

---

#### Reward Integrity

Rewards should be generated from authoritative application state and domain rules.

The system should prevent:

- Duplicate XP awards
- Duplicate achievement unlocks
- Repeated milestone processing
- Invalid reward claims
- Client-only assumptions for future remotely protected rewards

Reward calculations should remain testable and predictable.

---

#### Reward Privacy

Reward features should not require unnecessary personal data.

Public sharing should remain optional.

If future community or leaderboard functionality is introduced, users should control whether their:

- Name
- Profile
- XP
- Streak
- Achievements
- Focus statistics

are visible to other users.

Private productivity progress should remain private by default unless approved product requirements define otherwise.

---

#### Social Comparison

Reward components should prioritize personal progress over comparison with others.

If future leaderboards or community challenges are introduced, participation should remain optional.

Social reward systems should avoid:

- Shame-based ranking
- Pressure to work excessive hours
- Rewarding unhealthy intensity
- Exposing private productivity data
- Making competition necessary for core rewards

Consistency and personal improvement should remain more important than ranking.

---

#### Future Reward Expansion

The reward architecture may support future additions such as:

- Seasonal Challenges
- Community Events
- Team Achievements
- Cosmetic Collections
- Marketplace Unlocks
- Optional Virtual Currency
- Community Milestones

These are potential future capabilities rather than requirements for the initial release.

---

##### Future Virtual Currency

If virtual currency is introduced, its design should be reviewed separately.

It should not:

- Create gambling-like mechanics
- Require monetary spending to maintain productivity progress
- Provide unfair productivity advantages
- Create manipulative scarcity
- Encourage unhealthy work patterns

The relationship between XP, rewards, premium purchases, and any future currency should remain clear to users.

---

##### Marketplace Rewards

Future marketplace functionality should remain consistent with the Deep Focus monetization philosophy.

Marketplace items should primarily provide:

- Cosmetic customization
- Optional visual experiences
- Non-essential personalization

Core productivity functionality should not depend on marketplace purchases.

---

#### Reward Empty States

If a user has not earned achievements yet, the interface should remain encouraging without creating pressure.

Example:

```text
Your achievements will appear here as you build your focus routine.
```

Avoid language that implies failure or incompleteness.

---

#### Reward Usage Rules

Avoid:

- Rewarding excessive work duration
- Punishing users for taking recovery days
- Shame-based streak messaging
- Medical or psychological achievement claims
- Excessive celebratory animation
- Constant reward notifications
- Artificial urgency
- Manipulative scarcity
- Making cosmetic rewards affect productivity fairness
- Making rewards visually dominant during focus
- Duplicate reward processing
- Mandatory social comparison
- Using rewards primarily to increase time spent in the application

Gamification should reinforce sustainable habits rather than create dependency on external rewards.

---

#### Reward Component Governance

Before introducing a new reward, achievement, progression system, or reward mechanic, contributors should determine whether:

- It reinforces a meaningful habit
- It supports sustainable productivity
- It could create unhealthy pressure
- It rewards measurable behavior fairly
- It respects user privacy
- It remains optional where appropriate
- It introduces manipulative engagement patterns
- It remains accessible
- It aligns with `BLUEPRINT.md`
- It aligns with `AI_RULES.md`
- It aligns with the Deep Focus monetization philosophy

Reward features should not be introduced solely because gamification can increase engagement.

---

#### Reward Component Principles

Every Deep Focus reward component should:

- Celebrate meaningful progress
- Support long-term consistency
- Encourage sustainable work habits
- Keep recovery valuable
- Avoid unhealthy pressure
- Remain transparent
- Preserve user privacy
- Support accessibility
- Respect reduced motion
- Remain secondary to real productivity goals
- Avoid manipulative engagement
- Keep cosmetic rewards fair
- Remain technically reliable
- Align with the calm Deep Focus experience

Rewards should help users recognize progress without making productivity feel like an endless game that must constantly be played.

---

### 7.9 Feedback Components

Feedback components communicate the results of user actions, system processes, application states, and AI-generated recommendations throughout the Deep Focus platform.

Every piece of feedback should be timely, understandable, calm, and proportional to the importance of the event.

Feedback should reduce uncertainty without unnecessarily interrupting the user's workflow or competing for attention.

---

#### Design Principles

Feedback components should:

- Respond appropriately to user actions
- Provide clear and concise messages
- Reduce uncertainty
- Maintain visual consistency
- Avoid unnecessary interruptions
- Match the importance of the event
- Provide useful recovery actions where appropriate
- Preserve user-entered information whenever possible
- Avoid judgmental or alarming language
- Support accessibility
- Respect reduced-motion preferences
- Remain consistent across supported platforms

Feedback should communicate useful information rather than simply create additional visual activity.

---

#### Feedback Priority

Feedback should be presented according to its importance.

A general priority model is:

```text
Critical or Blocking Error
        ↓
Important Warning
        ↓
Actionable Feedback
        ↓
Success Confirmation
        ↓
Informational Feedback
```

Higher-priority feedback may temporarily interrupt the user when necessary.

Low-priority feedback should remain non-intrusive.

Active focus sessions should receive only feedback that is necessary for the current session or explicitly enabled by the user.

---

#### Toast Messages

Toast messages provide brief, non-intrusive feedback for completed actions that do not require additional user interaction.

Examples include:

- Settings Saved
- Goal Updated
- Preferences Updated
- Session Restored

Toast messages should:

- Remain concise
- Appear without blocking interaction
- Disappear automatically after an appropriate duration
- Avoid stacking excessively
- Avoid displaying critical information
- Remain readable with accessibility settings enabled

Important information should not disappear before users have a reasonable opportunity to understand it.

---

#### Snackbars

Snackbars communicate temporary events that may require a simple user action.

Examples include:

- Internet connection lost
- Session paused
- Changes saved
- Synchronization failed
- AI recommendation available

A snackbar may include one contextual action such as:

- Retry
- Undo
- View Details
- Dismiss

Snackbars should not contain multiple competing actions.

---

##### Snackbar Behavior

Snackbars should:

- Remain visible long enough to understand
- Avoid covering important controls
- Avoid unnecessary repetition
- Support screen-reader announcements where appropriate
- Provide accessible action controls
- Avoid interrupting active focus unless the information is relevant to the session

Persistent or blocking problems should use a more appropriate feedback pattern rather than repeatedly displaying snackbars.

---

#### Success Messages

Success messages confirm that an action completed successfully.

Examples include:

- Focus Session Completed
- Goal Achieved
- Profile Updated
- Achievement Unlocked
- Preferences Saved

Success feedback should feel encouraging without becoming excessively celebratory.

Routine actions should receive lightweight feedback.

Major milestones may receive stronger feedback according to the Reward Component rules.

---

#### Warning Messages

Warnings communicate situations that may require user attention but do not necessarily prevent continued use.

Examples include:

- Your recent sessions suggest that additional recovery may be helpful.
- A longer break may be useful before your next focus session.
- Your focus session was interrupted.
- Some changes have not synchronized yet.
- Notification permission is disabled.

Warnings should:

- Explain the situation clearly
- Avoid unnecessary alarm
- Provide an appropriate next step
- Remain dismissible when the situation is non-critical
- Avoid presenting uncertain information as fact

Warnings related to productivity or well-being should remain supportive and non-diagnostic.

---

##### Well-Being Feedback Language

Deep Focus should not present behavioral patterns as confirmed medical or psychological conditions.

Avoid wording such as:

```text
Burnout detected.
```

or:

```text
Your burnout risk is dangerously high.
```

Prefer supportive wording such as:

```text
Your recent activity suggests that additional recovery may be helpful.
```

or:

```text
You've completed several long sessions recently. Consider taking a longer break before continuing.
```

The interface should communicate observed productivity patterns without making unsupported medical claims.

---

#### Error Messages

Error messages should explain problems clearly and help users recover whenever possible.

Examples include:

- Unable to connect. Check your connection and try again.
- AI recommendations are temporarily unavailable.
- Your session could not be started.
- Progress could not be synchronized.
- Notification permission is required for this feature.

Error messages should:

- Explain what happened
- Avoid unnecessary technical terminology
- Provide a useful next step where possible
- Preserve user-entered data
- Avoid exposing internal implementation details
- Avoid blaming the user
- Distinguish recoverable and blocking failures

Technical exception messages, stack traces, provider errors, or internal identifiers should not be displayed directly to users.

---

#### Recoverable Errors

Recoverable failures should provide an appropriate action.

Possible actions include:

- Retry
- Continue Offline
- Restore Session
- Review Settings
- Try Again Later

For example:

```text
Unable to sync your progress.

Your changes are saved on this device and can be synchronized when you're online again.

[Retry]
```

Users should understand whether their data has been preserved.

---

#### Blocking Errors

Blocking errors prevent the user from completing the current workflow.

Examples may include:

- Required data cannot be loaded
- Authentication has expired
- Required permission is unavailable
- Session state cannot be safely restored

Blocking errors should:

- Clearly explain the problem
- Provide the safest available next step
- Avoid trapping users
- Preserve recoverable information
- Provide navigation away from the failed state where appropriate

---

#### Offline Feedback

Deep Focus should remain useful without constant internet access.

When connectivity is unavailable, the interface should clearly distinguish between:

- Features that continue working offline
- Data waiting to synchronize
- Features that require an internet connection

Example:

```text
You're offline.

Your focus session will continue normally.
Progress will sync when your connection returns.
```

Offline feedback should reassure users without repeatedly interrupting them.

---

#### Synchronization Feedback

Synchronization feedback should clearly communicate meaningful states such as:

```text
Saved on device
```

```text
Syncing...
```

```text
Synced
```

```text
Waiting for connection
```

```text
Sync failed
```

Users should not need to understand technical synchronization details.

Low-priority synchronization should occur quietly in the background.

---

#### Empty States

Empty states appear when a section contains no relevant data.

Examples include:

- No completed sessions yet
- No analytics available yet
- No achievements unlocked
- No saved goals
- No AI insights available yet

Empty states should:

- Explain why the area is empty
- Provide a useful next action when appropriate
- Remain visually simple
- Avoid making users feel unsuccessful
- Avoid creating unnecessary pressure

Example:

```text
No focus sessions yet.

Complete your first session to begin building your focus history.
```

---

#### Loading States

Loading states communicate that an operation is currently in progress.

Examples include:

- Preparing Focus Session
- Loading Analytics
- Syncing Progress
- Generating AI Recommendations
- Restoring Session

Loading feedback should:

- Remain subtle
- Avoid unnecessary animation
- Avoid blocking unrelated functionality
- Communicate meaningful progress where possible
- Provide cancellation when appropriate
- Handle long-running operations gracefully

The interface should not display indefinite loading states without eventual recovery or error handling.

---

#### Skeleton Screens

Skeleton screens may improve perceived performance while structured content is loading.

Skeleton layouts should resemble the expected content structure without displaying false information.

Skeleton screens should:

- Remain visually subtle
- Avoid excessive animation
- Match the approximate final layout
- Respect reduced-motion settings
- Avoid being used for extremely short operations

A standard loading indicator may be more appropriate when the final content structure is unknown.

---

#### Progress Feedback

Operations with meaningful measurable progress may use progress indicators.

Examples include:

- Data restoration
- Large synchronization operations
- Downloading required resources
- Account data export

When reliable progress information exists, the interface may display:

```text
Restoring your data...

65%
```

False or artificial progress percentages should not be displayed.

---

#### Confirmation Dialogs

Confirmation dialogs should prevent accidental destructive or difficult-to-reverse actions.

Examples include:

- End Focus Session
- Delete Goal
- Delete Session History
- Reset Progress
- Sign Out
- Delete Account

Confirmation dialogs should clearly explain:

- The action being performed
- Important consequences
- Whether the action can be reversed

---

##### Confirmation Dialog Actions

Action labels should describe the actual action.

Prefer:

```text
[Keep Session]    [End Session]
```

instead of:

```text
[No]    [Yes]
```

For destructive actions, the destructive option should remain visually distinguishable without relying solely on color.

---

##### Confirmation Usage

Confirmation dialogs should not appear for routine, easily reversible actions.

Overusing confirmation dialogs increases cognitive load and reduces their effectiveness.

Use confirmation primarily when an action:

- Deletes important information
- Ends meaningful progress
- Changes important account state
- Cannot easily be reversed
- Has significant consequences

---

#### AI Feedback Messages

AI-generated feedback should remain supportive, transparent, contextual, and optional.

Examples include:

- Your recent sessions show stronger consistency this week.
- A longer recovery period may be useful before your next session.
- Your focus history suggests that morning sessions have recently been more consistent.

AI-generated feedback should never be presented as guaranteed fact when uncertainty exists.

---

##### AI Identification

Users should be able to distinguish AI-generated recommendations from confirmed application data.

For example:

```text
AI Suggestion

Your recent session pattern suggests that a short recovery break may be helpful.
```

Confirmed system information may instead appear as:

```text
Session Summary

Focus Duration: 45 minutes
```

AI interpretation and recorded application data should not be visually or linguistically confused.

---

##### AI Feedback Actions

Where appropriate, AI recommendations may provide actions such as:

- Apply Suggestion
- View Reason
- Dismiss
- Not Helpful

Users should remain free to ignore AI recommendations without losing access to core functionality.

---

#### AI Failure Feedback

AI service failures should not block normal Deep Focus functionality.

Example:

```text
AI recommendations are temporarily unavailable.

You can continue using your focus tools normally.
```

The application should avoid repeatedly retrying AI operations in ways that consume unnecessary battery, network resources, or attention.

---

#### Focus Session Feedback

Feedback during an active focus session should be extremely limited.

Appropriate feedback may include:

- Session paused
- Session resumed
- Session completed
- Critical session recovery information
- Required permission failure
- Important timer state changes

Avoid displaying during active focus:

- Reward promotions
- General AI recommendations
- Unrelated analytics
- Low-priority synchronization messages
- Marketing messages
- Non-essential notifications

The active focus experience should remain protected from unnecessary feedback.

---

#### Feedback Duration

Feedback duration should depend on message importance and complexity.

Short informational feedback may disappear automatically.

Messages requiring reading, decision-making, or recovery should remain available until the user has sufficient opportunity to respond.

Accessibility settings should be considered when determining timing behavior.

---

#### Feedback Motion

Feedback animations should remain subtle.

Possible transitions include:

- Fade
- Short slide
- Gentle scale where appropriate

Avoid:

- Flashing
- Large bouncing motion
- Excessive vibration
- Repeated animation
- Attention-demanding effects

Reduced-motion preferences should simplify or remove non-essential motion.

---

#### Haptic Feedback

Haptic feedback may be used for meaningful interactions where supported.

Possible examples include:

- Session started
- Session completed
- Important confirmation
- Successful primary action

Haptics should:

- Remain subtle
- Respect device and user preferences
- Avoid repeated activation
- Never be required to understand feedback

---

#### Sound Feedback

Sound feedback should be optional.

Sound may be appropriate for:

- Session completion
- Break completion
- User-enabled timer events

Sound should not:

- Play unexpectedly
- Override device preferences
- Become necessary for understanding an event
- Interrupt focus unnecessarily

---

#### Feedback Accessibility

Feedback components must:

- Support screen readers
- Provide appropriate accessibility announcements
- Maintain sufficient contrast
- Include descriptive text
- Avoid relying solely on color
- Avoid relying solely on icons
- Avoid relying solely on animation
- Respect reduced-motion preferences
- Support text scaling
- Maintain appropriate touch targets
- Remain understandable when sound is disabled

Important transient messages should remain available long enough for assistive technologies to communicate them.

---

#### Feedback Consistency

The same event should use the same general feedback pattern throughout the application.

For example:

```text
Routine success
→ Toast

Recoverable event with one action
→ Snackbar

Important warning
→ Inline Warning or appropriate Dialog

Destructive confirmation
→ Confirmation Dialog

Blocking failure
→ Persistent Error State

Background loading
→ Inline Loading or Skeleton

AI recommendation
→ Clearly identified AI Feedback Component
```

Consistent patterns help users understand application behavior without relearning interactions on every screen.

---

#### Feedback Anti-Patterns

Avoid:

- Excessive toast messages
- Multiple simultaneous snackbars
- Unnecessary modal dialogs
- Technical error messages
- Alarmist well-being language
- Judgmental productivity messages
- Fake progress indicators
- Infinite loading states
- Repeated AI recommendations
- Feedback that interrupts active focus unnecessarily
- Using only color to communicate status
- Disappearing critical information too quickly
- Showing success before an operation has actually completed
- Claiming synchronization succeeded before confirmation

Feedback should always represent the actual application state.

---

#### Feedback Component Principles

Every Deep Focus feedback component should:

- Reduce uncertainty
- Communicate actual system state
- Remain calm and understandable
- Match feedback intensity to importance
- Provide recovery actions where appropriate
- Preserve user progress whenever possible
- Avoid unnecessary interruption
- Distinguish AI recommendations from confirmed data
- Avoid unsupported health claims
- Protect active focus sessions
- Respect accessibility preferences
- Remain consistent across the application
- Preserve user autonomy
- Align with the Deep Focus philosophy

Feedback should help users understand what happened and what they can do next without becoming another source of distraction.

---

### 7.10 Overlay Components

Overlay components temporarily appear above the primary interface to communicate important information, request confirmation, present contextual actions, or support focused temporary workflows.

Overlays should be used intentionally.

They should capture attention only when necessary and should avoid becoming the default solution for information that could be presented more naturally within the current screen.

The visual treatment should remain calm, clear, accessible, and consistent with the Deep Focus Design System.

---

#### Design Principles

Overlay components should:

- Capture attention only when necessary
- Minimize unnecessary interruption
- Clearly communicate their purpose
- Preserve user context
- Maintain visual consistency
- Support accessibility
- Respect reduced-motion preferences
- Provide predictable dismissal behavior
- Avoid unnecessary nesting
- Respect safe areas
- Preserve important user input
- Avoid blocking core workflows unnecessarily

Overlays should not be used simply to make information appear more important.

---

#### Overlay Hierarchy

Different overlay types should be selected according to the complexity and importance of the task.

A general hierarchy is:

```text
Tooltip / Lightweight Context
        ↓
Bottom Sheet
        ↓
Modal Dialog
        ↓
Full-Screen Temporary Workflow
        ↓
Blocking Critical State
```

The least disruptive component capable of supporting the interaction should generally be preferred.

---

#### Modal Dialogs

Modal Dialogs temporarily block interaction with the underlying interface while users review or confirm an important action.

Examples may include:

- End Focus Session
- Delete Goal
- Sign Out
- Reset Progress
- Remove Connected Account
- Delete History

Dialogs should clearly explain the consequence of the action.

---

##### Dialog Structure

A typical dialog may contain:

```text
Title
  ↓
Description
  ↓
Optional Supporting Information
  ↓
Primary / Confirm Action
  ↓
Secondary / Cancel Action
```

Not every dialog requires every element.

Dialog content should remain concise.

Large amounts of information should use a more appropriate full-screen or detail interface.

---

##### Dialog Actions

Action labels should describe the actual action.

Prefer:

```text
[Keep Session]    [End Session]
```

instead of:

```text
[No]    [Yes]
```

For destructive actions, the destructive option should remain clearly distinguishable.

Color should not be the only indication that an action is destructive.

---

##### Confirmation Usage

Dialogs should be used when an action:

- Deletes meaningful information
- Ends meaningful progress
- Changes important account state
- Cannot easily be reversed
- Has significant consequences

Routine or easily reversible actions should not receive unnecessary confirmation dialogs.

Excessive confirmation increases cognitive load and reduces the effectiveness of truly important warnings.

---

#### Bottom Sheets

Bottom Sheets present contextual information, lightweight actions, or short selection workflows while preserving the current screen context.

Possible uses include:

- Focus Mode Selection
- Session Settings
- Soundscape Selection
- Share Options
- Quick Goal Creation
- Contextual AI Explanation
- Quick Preferences

Bottom Sheets should remain lightweight.

Complex multi-step workflows should generally use a dedicated screen instead.

---

##### Bottom Sheet Dismissal

Bottom Sheets may support:

- Swipe dismissal
- Close button
- Back action
- Tapping the backdrop where appropriate

However, swipe-to-dismiss should not be enabled blindly.

Dismissal gestures may be restricted when the sheet contains:

- Unsaved important input
- Destructive confirmation
- Security-sensitive operations
- A required decision

Users should not accidentally lose meaningful work through an unintended swipe.

---

##### Bottom Sheet Height

Bottom Sheets should use only the amount of screen space required by their content.

Possible behaviors include:

- Content-based height
- Partial-height sheet
- Expandable sheet
- Near-full-screen sheet

If a sheet consistently requires nearly the entire screen and complex navigation, a full-screen route may provide a clearer experience.

---

#### Full-Screen Temporary Workflows

Full-screen temporary interfaces may be used for immersive or high-attention workflows.

Examples may include:

- Active Focus Session
- True Zen Break
- Session Recovery
- Focus Mode Setup
- Critical account workflow

Full-screen temporary interfaces should minimize unrelated interface elements.

---

##### Active Focus Session

The Active Focus Session may use an immersive full-screen presentation.

The interface should prioritize:

- Remaining Time
- Current Task
- Session State
- Focus Mode
- Essential Session Controls

Primary navigation may be hidden when doing so supports focus.

Users should retain an appropriate safe exit path according to the selected Focus Mode and session rules.

---

##### True Zen Break

True Zen Break may use an immersive recovery interface.

Possible content includes:

- Break Timer
- Hydration Reminder
- Breathing Guidance
- Stretch Suggestion
- Eye Relaxation
- Calm Soundscape

The interface should remain visually quieter than the active focus session.

Recovery should remain supportive rather than mandatory unless the user has chosen a workflow that specifically requires it.

---

#### Permission Education Screens

Deep Focus should explain why a permission is useful before requesting access when the reason is not already obvious.

Possible permissions may include:

- Notification Permission
- Usage-related Permission where supported
- Calendar Access
- Future Health Data Access
- Future Device Integration Permissions

Permission education should explain:

- What capability requires the permission
- Why the permission is useful
- Whether the feature can work without it
- What the application will and will not access

---

##### Permission Request Timing

Permissions should be requested only when the user reaches a feature that requires them.

Avoid requesting multiple permissions immediately after application launch without context.

For example:

```text
User enables Focus Completion Notifications
        ↓
Explain Notification Benefit
        ↓
Request Notification Permission
```

is preferable to requesting notification access before the user has interacted with notification functionality.

---

##### Permission Denial

If users deny an optional permission:

- Unrelated functionality should continue working
- The interface should avoid repeatedly pressuring the user
- The feature should explain any resulting limitation
- A Settings shortcut may be provided when appropriate

Permission denial should not be treated as user failure.

---

##### Platform-Specific Permissions

Permission capabilities differ across Android, iOS, Expo environments, and operating-system versions.

Deep Focus should only request permissions actually supported and required by the implemented feature.

The interface should not promise capabilities that the operating system cannot provide.

---

#### AI Processing Overlay

An AI Processing Overlay may be used when AI processing temporarily requires user attention and another less intrusive loading pattern would not be sufficient.

Possible tasks include:

- Building an initial productivity profile
- Generating a requested detailed recommendation
- Preparing a requested report

The overlay should clearly communicate that processing is occurring.

---

##### AI Processing Behavior

AI processing overlays should:

- Remain visually calm
- Avoid exaggerated loading effects
- Avoid false precision
- Provide cancellation where appropriate
- Handle network failure gracefully
- Avoid blocking unrelated functionality unless necessary
- Clearly distinguish processing from completion

For many AI operations, inline loading inside the relevant component should be preferred over a blocking overlay.

A full overlay should only be used when the workflow genuinely requires temporary focus.

---

##### AI Processing Language

Avoid exaggerated wording such as:

```text
Deeply analyzing your brain patterns...
```

Prefer clear wording such as:

```text
Analyzing your recent focus patterns...
```

or:

```text
Preparing your weekly insights...
```

The interface should accurately represent what the feature is doing.

---

#### High-Commitment Focus Protection Screen

When a high-commitment Focus Mode is active, Deep Focus may present a dedicated protection screen when an applicable distraction-related event occurs and the supported platform allows such behavior.

Possible information may include:

- Remaining Session Time
- Current Task
- Active Focus Mode
- Short Focus Reminder
- Safe Exit Option where required

The design should remain calm and encouraging rather than punitive.

---

##### Platform Capability Transparency

Deep Focus should not imply that it can universally intercept or block all external applications.

The exact behavior may vary according to:

- Operating System
- Device capabilities
- Granted permissions
- App-store policies
- Expo / React Native capabilities
- User configuration

The interface should communicate only functionality that the current platform can actually provide.

---

##### High-Commitment Mode Language

Avoid punitive language such as:

```text
You are not allowed to leave.
```

Prefer:

```text
Your focus session is still active.

18 minutes remaining.
```

The purpose is to remind users of their commitment rather than shame or trap them.

---

#### Recovery Guidance Overlay

Deep Focus may present recovery guidance when available productivity patterns or user-reported information suggest that additional recovery could be useful.

Possible information may include:

- Recent long-session pattern
- Reduced break frequency
- Self-reported lower energy
- Suggested recovery duration
- Optional recovery activities

The overlay should remain supportive and should not present the guidance as a medical diagnosis.

---

##### Recovery Guidance Language

Avoid:

```text
High burnout risk detected.
```

or:

```text
Burnout recovery required.
```

Prefer:

```text
You've completed several long sessions with limited breaks recently.

Consider taking additional recovery time before starting another session.
```

The interface should explain relevant observations without claiming diagnosis of burnout or another medical or psychological condition.

---

##### Recovery Guidance Actions

Possible actions may include:

- Start Recovery Break
- Adjust Next Session
- View Recent Patterns
- Continue Anyway
- Dismiss

The exact actions should depend on the product workflow.

Users should normally remain in control of whether they follow optional recovery guidance.

---

#### Emergency Confirmation Screen

Certain high-impact actions may require an additional confirmation step.

Examples include:

- Ending a high-commitment focus session early
- Cancelling a long active session
- Resetting productivity history
- Disconnecting a service
- Deleting account data

Emergency confirmation should:

- Explain the consequence
- Avoid manipulative language
- Provide clear actions
- Preserve valid user progress where possible
- Avoid unnecessary friction for actual emergencies

---

##### Emergency Exit Design

Emergency exit controls should remain discoverable without being easy to activate accidentally.

The interface should not create a situation where necessary device access becomes practically impossible.

Safety and user control should take priority over gamification or commitment mechanics.

---

#### Overlay Backdrop

Overlay backdrops help visually separate temporary content from the underlying interface.

Backdrops may use:

- Semi-transparent surface
- Approved overlay color token
- Optional subtle blur where supported

Backdrop treatment should:

- Maintain sufficient foreground contrast
- Avoid excessive darkness
- Avoid creating unnecessary GPU or battery cost
- Work across Light Mode and Dark Mode

Blur should not be required for overlay functionality.

---

#### Overlay Stacking

Deep Focus should avoid displaying multiple overlays simultaneously.

For example, avoid:

```text
Modal
  ↓
Bottom Sheet
  ↓
Another Dialog
```

Nested overlays create:

- Confusing back behavior
- Difficult accessibility focus management
- Visual clutter
- Increased cognitive load

When another important overlay is required, the current overlay should normally be resolved or replaced first.

---

#### Overlay Focus Management

When a modal overlay opens, interaction focus should move appropriately into the overlay.

While the overlay is active:

- Underlying controls should not receive unintended interaction
- Screen-reader focus should remain within the relevant modal context where appropriate
- Keyboard focus should remain controlled where applicable

When the overlay closes, focus should return to a logical previous element when practical.

---

#### Overlay Dismissal

Dismissal behavior should remain predictable.

Possible dismissal methods include:

- Explicit close action
- Cancel action
- Back navigation
- Backdrop press
- Swipe gesture

The appropriate method depends on the overlay type.

Critical or destructive confirmation overlays should not dismiss accidentally through casual gestures if dismissal would create ambiguity or data loss.

---

#### Unsaved Content

If an overlay contains meaningful unsaved information, accidental dismissal should not silently discard it.

Possible approaches include:

- Preserve draft automatically
- Ask for confirmation
- Disable casual gesture dismissal
- Restore input if reopened

Minor temporary controls do not require unnecessary confirmation.

---

#### Overlay Animations

Overlay animation should remain subtle and purposeful.

Possible animations include:

- Fade In
- Fade Out
- Slide Up
- Slide Down
- Small Scale Transition

The selected animation should reflect the component.

For example:

```text
Bottom Sheet
→ Slide Up

Dialog
→ Fade / Small Scale

Backdrop
→ Fade
```

Animation should reinforce spatial understanding rather than provide decoration.

---

##### Animation Duration

Overlay animation should remain short enough that the interface feels responsive.

Transitions should not delay important actions.

Exact timing should use approved animation tokens rather than arbitrary per-screen durations.

---

##### Background Blur

Soft background blur may be used when:

- Supported efficiently
- Accessibility remains clear
- Performance remains acceptable
- The Design System approves it

Blur should degrade gracefully when unsupported or expensive.

A semi-transparent overlay surface should remain an acceptable fallback.

---

#### Reduced Motion

Overlay components should respect reduced-motion accessibility settings.

When reduced motion is enabled:

- Large slide animations should be simplified
- Scale effects should be reduced or removed
- Fade transitions may be used where appropriate
- Functionality should remain unchanged

The relationship between overlay and underlying content should remain understandable without significant motion.

---

#### Safe Areas

Full-screen overlays and Bottom Sheets should respect:

- Status bars
- Device cutouts
- Home indicators
- System navigation areas

Actions should not be placed underneath inaccessible system regions.

Safe-area spacing should use actual platform information rather than fixed values.

---

#### Overlay Accessibility

Overlay components must:

- Support screen readers
- Provide descriptive labels
- Use appropriate modal semantics where applicable
- Manage focus appropriately
- Maintain sufficient contrast
- Support text scaling
- Maintain adequate touch targets
- Avoid relying solely on color
- Avoid relying solely on animation
- Provide clear dismissal methods where appropriate
- Respect reduced-motion preferences

Deep Focus should generally target a minimum interactive touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

---

#### Overlay Text Scaling

Overlay layouts should remain usable when accessibility text scaling increases.

Implementation should:

- Avoid fixed heights that clip content
- Allow dialog content to expand
- Allow scrolling when necessary
- Preserve action visibility
- Avoid overlapping text and controls
- Maintain usable spacing

A dialog should not become unusable simply because text is larger.

---

#### Overlay Performance

Overlay effects should remain lightweight.

Implementation should avoid:

- Heavy blur on unsupported devices
- Multiple simultaneous animated layers
- Repeated unnecessary overlay mounting
- Expensive animations
- Large assets loaded only for temporary effects
- Unnecessary background processing

Overlay presentation should remain responsive on supported lower-powered devices.

---

#### Overlay Usage Rules

Avoid:

- Using overlays for information that belongs naturally on the screen
- Displaying multiple overlays simultaneously
- Using full-screen overlays for trivial actions
- Forcing users through unnecessary confirmations
- Swipe-to-dismiss for destructive unsaved workflows
- Blocking the application for routine AI requests
- Claiming unsupported app-blocking capabilities
- Presenting burnout as an AI-detected diagnosis
- Punitive high-commitment mode language
- Requesting permissions before users understand why they are needed
- Repeatedly pressuring users after permission denial
- Heavy blur or animation purely for visual effect
- Hiding essential exit controls

Overlays should solve a clear interaction problem rather than simply increase visual emphasis.

---

#### Overlay Component Governance

Before introducing a new overlay pattern, contributors should determine whether:

- Existing screen content can handle the interaction
- A Bottom Sheet, Dialog, or full-screen route is most appropriate
- The interruption is justified
- The overlay preserves accessibility
- User input can be preserved
- Safe dismissal behavior is defined
- Platform limitations have been considered
- The interaction follows `ARCHITECTURE.md`
- The design follows `COMPONENT_LIBRARY.md`
- The overlay supports the Deep Focus philosophy

A new overlay pattern should not be introduced solely for visual novelty.

---

#### Overlay Component Principles

Every Deep Focus overlay should:

- Have a clear purpose
- Minimize unnecessary interruption
- Preserve user context
- Support accessibility
- Provide predictable dismissal
- Preserve important user data
- Respect platform capabilities
- Avoid unsupported health claims
- Respect reduced motion
- Respect safe areas
- Remain responsive
- Avoid excessive visual effects
- Maintain user control
- Align with the calm Deep Focus experience

Overlays should temporarily guide attention when necessary and then allow users to return to their primary task with as little friction as possible.

---

## 8. Navigation

The Deep Focus navigation system defines how users move between the major areas, workflows, and supporting experiences of the platform.

Navigation should help users reach meaningful actions with minimal cognitive effort while preserving context and reducing unnecessary interaction.

Rather than exposing every feature at once, the navigation structure should prioritize the most important destinations and reveal secondary functionality when it becomes relevant.

Navigation should remain aligned with the navigation architecture defined in `ARCHITECTURE.md` and the component behavior defined in `7.4 Navigation Components`.

The navigation system should evolve according to actual product requirements rather than attempting to expose every possible future capability from the beginning.

---

### 8.1 Navigation Principles

Navigation should:

- Be simple and predictable
- Minimize unnecessary navigation steps
- Reduce cognitive load
- Preserve user context where practical
- Keep important actions easy to reach
- Minimize distractions
- Maintain consistent terminology
- Respect platform conventions
- Support accessibility
- Protect active focus workflows
- Avoid unnecessary navigation depth
- Scale according to validated product needs
- Remain compatible with Expo Router

Navigation should help users reach their intended destination quickly rather than encourage unnecessary exploration.

---

### 8.2 Navigation Hierarchy

Deep Focus should maintain a clear navigation hierarchy.

A typical hierarchy may include:

```text
Root Application Flow
        ↓
Primary Navigation
        ↓
Feature Navigation
        ↓
Contextual or Temporary Navigation
```

For example:

```text
Main Application
      ↓
Analytics
      ↓
Weekly View
      ↓
Insight Details
```

Navigation depth should remain limited where practical.

If users repeatedly need to move through many intermediate screens to reach common functionality, the information architecture should be reconsidered.

---

### 8.3 Primary Navigation

The primary mobile application uses a Bottom Navigation Bar for access to the five main destinations:

- Home
- Focus
- Analytics
- Rewards
- Profile

Each destination represents a major product area.

Only one primary destination should be active at a time.

Primary navigation should remain stable and predictable throughout normal application use.

New functionality should not automatically receive a new primary navigation destination.

Before adding another primary destination, contributors should consider whether the feature can be accessed through:

- An existing primary area
- Contextual navigation
- A secondary screen
- A dashboard card
- A settings or profile workflow

Primary navigation should remain intentionally limited.

---

### 8.4 Home Navigation

Home acts as the primary personalized entry point for normal application usage.

Depending on implemented features, Home may provide contextual access to:

- Today's focus information
- Recommended session
- Goals
- Recent activity
- Recovery guidance
- AI-assisted recommendations
- Progress summaries
- Relevant upcoming tasks

Home should not become a menu containing links to every feature in the application.

Its purpose is to surface the most relevant information and actions for the current context.

---

### 8.5 Focus Navigation

The Focus destination provides access to focus-related workflows.

A typical flow may include:

```text
Focus
   ↓
Session Setup
   ↓
Ready
   ↓
Active Session
   ↓
Session Completion
   ↓
Optional Recovery
   ↓
Session Summary
```

Focus navigation should minimize unnecessary branching during an active session.

Once a session begins, navigation should prioritize maintaining the session context.

---

### 8.6 Analytics Navigation

Analytics navigation may organize productivity information through related views such as:

- Daily
- Weekly
- Monthly
- Trends
- History
- Insight Details

Analytics should use progressive disclosure rather than placing every metric and report on a single screen.

Users should be able to move from summary information to additional detail without losing their selected period or relevant context unnecessarily.

---

### 8.7 Rewards Navigation

Rewards navigation may provide access to:

- XP Progress
- Levels
- Achievements
- Badges
- Streak History
- Cosmetic Rewards

Reward navigation should remain secondary to productivity workflows.

Reward-related destinations should not create excessive navigation prompts or repeatedly redirect users away from focus-related tasks.

---

### 8.8 Profile Navigation

Profile may provide access to user-specific information and application preferences.

Possible destinations include:

- Personal Profile
- Productivity Goals
- Focus Preferences
- Notification Settings
- Theme Settings
- Privacy Settings
- Account Security
- Connected Services where implemented
- Subscription Management where implemented

Settings should be grouped clearly rather than presented as one large undifferentiated list.

---

### 8.9 Secondary Navigation

Secondary navigation may be used where additional structure is required.

Possible patterns include:

- Top App Bar
- Back Navigation
- Tabs
- Segmented Controls
- Bottom Sheets
- Contextual Menus
- Detail Screens
- Modal Workflows

The selected pattern should match the complexity and frequency of the task.

Secondary navigation should not create a competing primary navigation system.

---

### 8.10 Contextual Navigation

Some functionality should appear only when relevant to the current workflow.

Contextual navigation may be used for:

- Session Summary
- Goal Details
- Achievement Details
- Analytics Drill-Down
- Recovery Guidance
- AI Recommendation Details
- Notification Destinations
- Temporary Settings

Contextual navigation reduces pressure to expose every feature permanently.

---

### 8.11 AI Navigation

The AI Assistant should not occupy a permanent Bottom Navigation destination under the current product direction.

AI-assisted functionality should appear contextually where it provides meaningful value.

Possible access points include:

- Dashboard Recommendations
- Analytics Insights
- Session Summaries
- Recovery Guidance
- Goal Suggestions
- Weekly Summaries
- Planning Assistance

This approach keeps navigation simple while allowing AI assistance to appear when relevant.

---

### 8.12 AI Navigation Rules

AI navigation should remain optional and non-disruptive.

AI should not:

- Automatically navigate users away from their current workflow
- Force users into an AI screen
- Interrupt active focus sessions unnecessarily
- Open unrelated destinations without user action
- Require users to interact with AI before continuing core functionality

When an AI recommendation links to another destination, the user should decide whether to follow it.

---

### 8.13 Application Entry Flow

The exact application entry flow should depend on the current user's state and the features enabled by the product.

A simplified flow may be:

```text
Application Launch
        ↓
Initialization
        ↓
Required State Checks
        ↓
Main Application
```

When onboarding is required:

```text
Application Launch
        ↓
Onboarding Check
        ↓
Onboarding
        ↓
Optional Assessment
        ↓
Main Application
```

When account authentication is required:

```text
Application Launch
        ↓
Authentication Check
        ↓
Authentication
        ↓
Required Onboarding
        ↓
Main Application
```

Authentication should not be assumed to be mandatory for local-only core functionality unless approved product requirements require it.

---

### 8.14 Typical Productivity Journey

A typical productivity journey may follow:

```text
Home Dashboard
      ↓
Choose or Create Task
      ↓
Session Setup
      ↓
Focus Session
      ↓
Optional True Zen Break
      ↓
Session Summary
      ↓
Analytics / Rewards / Home
```

Users should not be forced through analytics, rewards, or AI screens after every session.

Post-session destinations should support the user's next meaningful action.

---

### 8.15 Focus Session Navigation Behavior

Active focus sessions require intentionally restricted navigation.

During an active focus session:

- Primary navigation may be hidden
- Non-essential destinations should be minimized
- Accidental navigation should be reduced
- Session state should remain preserved
- Exit behavior should follow the selected Focus Mode
- Users should retain an appropriate safe exit path
- Non-critical AI or reward navigation should remain unavailable or deferred

Navigation should protect focus without trapping the user.

---

### 8.16 Post-Session Navigation

After a completed session, the workflow may offer:

```text
Session Completed
        ↓
Optional Recovery
        ↓
Session Summary
        ↓
Return to Home / Start Another Task / View Details
```

The interface should avoid automatically pushing users toward another focus session solely to increase engagement.

Recovery, reflection, or leaving the application may be equally valid outcomes.

---

### 8.17 Navigation State Preservation

Navigation state may be preserved when doing so improves continuity.

Possible examples include:

- Selected Analytics View
- Current Filters
- Scroll Position
- Draft Goal
- Session Setup
- Previous Primary Destination

State preservation should remain intentional.

The application should not restore:

- Invalid routes
- Expired content
- Deleted entities
- Stale session state
- Security-sensitive state that should have been cleared

Current authoritative application state should take priority over previously stored navigation state.

---

### 8.18 Application Resume Behavior

When the application returns from the background, navigation should preserve the most relevant valid context where practical.

For example:

```text
Application Backgrounded During Active Session
        ↓
Application Reopened
        ↓
Restore Active Session
```

rather than automatically returning users to Home.

If the previous destination is no longer valid, the application should return to an appropriate safe destination.

---

### 8.19 Back Navigation

Back navigation should remain predictable.

Back actions should:

- Return to the previous logical destination
- Preserve meaningful unsaved information where practical
- Close temporary overlays before leaving underlying content where appropriate
- Confirm before discarding significant unsaved work
- Respect platform-native back behavior
- Avoid unexpected redirection

Users should not become trapped inside a workflow.

---

### 8.20 Navigation Feedback

Navigation interactions should provide immediate and understandable feedback.

Possible feedback includes:

- Active tab indication
- Pressed state
- Selected state
- Short screen transition
- Loading state
- Navigation error state
- Platform-appropriate haptic feedback where intentionally designed

Feedback should remain subtle.

Navigation should feel responsive without becoming visually demanding.

---

### 8.21 Navigation Loading States

When a destination requires data that is not immediately available, the route itself should generally remain accessible while appropriate loading feedback is displayed.

Navigation should not appear frozen simply because remote information is loading.

Where practical:

```text
Navigate
   ↓
Render Destination Structure
   ↓
Load Required Data
```

is preferable to blocking navigation unnecessarily before the screen can appear.

Core local workflows should not depend on optional remote data before navigation can continue.

---

### 8.22 Navigation Failure Handling

Navigation may fail because of:

- Invalid route
- Missing content
- Deleted entity
- Expired link
- Missing permission
- Unauthorized access
- Invalid route parameter
- Unsupported notification destination

The application should:

- Avoid blank screens
- Provide understandable feedback
- Redirect to an appropriate safe destination
- Preserve unrelated user context
- Avoid exposing technical routing errors
- Allow recovery where practical

Navigation failures should not crash unrelated parts of the application.

---

### 8.23 Deep Linking

Deep linking may be introduced when external entry into specific application destinations provides meaningful value.

Potential examples include:

- Notification destination
- Password reset
- Email verification
- Goal details
- Weekly summary
- Shared achievement
- Future collaboration invitation

Deep links should:

- Validate incoming parameters
- Verify required access
- Handle unavailable content safely
- Avoid exposing sensitive information
- Avoid assuming external input is trusted

Deep linking should be implemented when product requirements justify it rather than treated as mandatory for every route.

---

### 8.24 Notification Navigation

Notifications may link users to relevant destinations.

Possible examples include:

- Focus Reminder
- Session Completion
- Goal Reminder
- Weekly Summary
- Achievement
- Optional AI Recommendation

Notification navigation should open the most relevant supported destination.

It should not:

- Interrupt an active focus session unnecessarily
- Navigate to unrelated content
- Assume stale notification content is still valid
- Bypass authentication or authorization requirements

Notification payloads should be validated before use.

---

### 8.25 Widget Navigation

Future platform widgets may provide navigation shortcuts into Deep Focus.

Potential examples include:

- Start Focus Session
- Open Today's Goal
- View Current Session
- Open Weekly Summary

Widget navigation should only be introduced when widget functionality becomes approved product scope.

Widget shortcuts should preserve the same route validation and access rules as other external navigation sources.

---

### 8.26 Navigation and Permissions

Navigation should not lead users into unusable screens when required permissions are unavailable without explaining the limitation.

When a feature requires permission:

```text
Open Feature
      ↓
Explain Requirement
      ↓
Request Permission if Needed
      ↓
Continue or Provide Alternative
```

Users who deny optional permissions should still be able to navigate through unrelated functionality.

---

### 8.27 Safe Areas and Reachability

Primary mobile navigation should respect device safe areas and comfortable interaction zones.

Important controls should not be placed beneath:

- System navigation regions
- Home indicators
- Display cutouts
- Other inaccessible device areas

Frequently used mobile actions should remain reasonably reachable where layout allows.

Reachability should be considered without forcing every control into the same screen region.

---

### 8.28 Gesture Navigation

Gestures may supplement navigation when they remain predictable.

Possible examples include:

- Swipe between closely related tabs
- Swipe to dismiss a supported Bottom Sheet
- Platform-native back gestures

Gesture navigation should:

- Have an accessible non-gesture alternative
- Avoid conflicting with operating-system gestures
- Avoid accidental activation
- Never be required to discover essential functionality

---

### 8.29 Navigation Accessibility

Navigation must:

- Support screen readers
- Expose selected state
- Provide descriptive accessibility labels
- Maintain sufficient touch targets
- Support text scaling
- Maintain sufficient contrast
- Avoid relying solely on color
- Support keyboard navigation where applicable
- Preserve logical focus order
- Avoid gesture-only essential navigation
- Respect reduced-motion preferences

Deep Focus should generally target a minimum interactive touch area of approximately:

```text
44px × 44px
```

Platform-specific accessibility guidance should also be respected.

---

### 8.30 Reduced Motion

Navigation transitions should respect reduced-motion accessibility settings.

When reduced motion is enabled:

- Large sliding transitions should be reduced or removed
- Decorative movement should be minimized
- Screen changes should remain understandable
- Functionality should remain unchanged

Navigation meaning should never depend on animation.

---

### 8.31 Navigation Performance

Navigation should remain responsive across supported devices.

Implementation should avoid:

- Heavy synchronous work during route transitions
- Duplicate navigation caused by rapid interaction
- Excessively deep route nesting
- Loading unnecessary screens or data
- Heavy transition animations
- Repeated remounting without reason

Navigation performance should support immediate interaction even when optional remote information is still loading.

---

### 8.32 Future Navigation Expansion

The navigation architecture should support future product growth without reserving permanent navigation space for hypothetical features.

Potential future capabilities may include:

- Smart Planning
- Calendar Integration
- Team Collaboration
- Knowledge Management
- Wearable Integration
- External Productivity Tools
- Marketplace Functionality
- Additional AI-Assisted Workflows

These are potential future capabilities rather than approved primary navigation destinations.

A future feature should receive permanent navigation placement only when its usage, importance, and product role justify it.

---

### 8.33 Future Integrations

Potential future integrations may include services such as:

- Google Calendar
- Microsoft Outlook
- Apple Calendar
- Notion
- Trello
- ClickUp
- Jira
- Apple Health
- Google Fit

These integrations should not automatically appear as navigation destinations.

Where implemented, they may be accessed through:

- Settings
- Connected Services
- Contextual workflows
- Relevant feature areas

Integration design should follow the same privacy, permission, security, and navigation principles as native Deep Focus functionality.

---

### 8.34 Cross-Platform Navigation

The current primary Deep Focus experience is focused on mobile platforms.

Android and iOS may use slightly different navigation behavior when platform conventions require it.

Potential future larger-screen or additional-platform navigation patterns may include:

- Navigation Rail
- Sidebar Navigation
- Expanded Multi-Pane Layout
- Keyboard Shortcuts
- Multi-Window Workflows

These patterns should be introduced only when those platforms become approved product scope.

The mobile application should not become unnecessarily complex in anticipation of hypothetical future platforms.

---

### 8.35 Navigation Governance

Before introducing a new destination, route group, permanent navigation item, or navigation pattern, contributors should determine whether:

- The destination represents meaningful user value
- An existing destination can contain the feature
- Contextual navigation would be sufficient
- The change increases cognitive load
- Active focus workflows remain protected
- Accessibility is preserved
- Platform behavior has been considered
- The pattern remains compatible with Expo Router
- The change aligns with `ARCHITECTURE.md`
- The change aligns with the Deep Focus product direction

Major changes to primary navigation should be reviewed and documented as product-level decisions.

---

### 8.36 Navigation Principles Summary

Deep Focus navigation should:

- Remain simple
- Remain predictable
- Minimize unnecessary interaction
- Preserve user context
- Protect active focus sessions
- Support accessibility
- Respect platform conventions
- Avoid unnecessary navigation depth
- Use contextual access where appropriate
- Avoid exposing hypothetical future features prematurely
- Remain responsive
- Scale according to validated requirements
- Support the calm Deep Focus experience

Navigation should help users reach meaningful work quickly and then remain unobtrusive enough that the application itself does not become another source of distraction.

---

## 9. Screen Specifications

This section defines the primary screens and screen-level experience requirements within the Deep Focus platform.

Each screen should have a clear purpose, user journey, interaction model, and relationship to the wider Deep Focus experience while maintaining the overall philosophy of creating a calm, intelligent, accessible, and distraction-free productivity environment.

Screens should not be treated as isolated pages. They should work together as part of coherent workflows that help users move naturally between setup, focused work, recovery, reflection, and long-term progress.

Each screen specification may include:

- Purpose
- User Goals
- Main Components
- Layout Structure
- Visual Design
- Navigation
- User Flow
- Interaction Behavior
- States
- Accessibility
- Future Improvements

The screen specifications defined in this document serve as a primary reference for UI design, prototyping, and application development.

Implementation should remain aligned with `ARCHITECTURE.md`, `COMPONENT_LIBRARY.md`, and the other design principles defined in this specification.

---

### 9.1 Screen List

The initial Deep Focus product may include the following primary screens and workflows:

1. Splash Screen
2. Welcome Screen
3. Sign In
4. Sign Up
5. Forgot Password
6. Onboarding
7. Personal Assessment
8. Home Dashboard
9. Focus Session
10. True Zen Break
11. Session Summary
12. Analytics
13. Rewards
14. Profile
15. Settings

Some screens may be conditional depending on product requirements, authentication state, onboarding state, enabled features, and platform capabilities.

Authentication-related screens should not automatically be treated as mandatory for local-only core functionality unless approved product requirements require authentication.

---

### 9.2 Splash Screen

#### Purpose

The Splash Screen is the first visual experience users encounter when launching Deep Focus.

Its purpose is to establish the application identity while the application performs only the initialization work required before determining the user's appropriate starting destination.

The screen should feel calm, modern, lightweight, and distraction-free.

The Splash Screen should not intentionally delay application entry for branding or animation purposes.

---

#### User Goals

Users should be able to:

- Understand that Deep Focus is launching
- Recognize the Deep Focus brand
- Reach the appropriate application destination without unnecessary delay

No explicit user interaction should normally be required.

---

#### Main Components

The Splash Screen may contain:

- Deep Focus Logo
- Brand Name
- Optional Tagline
- Optional Loading Indicator
- Background or subtle brand treatment

The interface should remain intentionally minimal.

---

#### Layout Structure

```text
────────────────────────────

            Logo

         Deep Focus

     "Focus with Purpose"

     Loading Indicator
        (if required)

────────────────────────────
```

The primary content should remain visually centered with generous spacing and minimal visual noise.

---

#### Visual Design

The Splash Screen should:

- Use the official Deep Focus color system
- Maintain strong brand recognition
- Use minimal visual elements
- Avoid unnecessary information
- Support Light Mode and Dark Mode where applicable
- Maintain sufficient contrast
- Avoid visually intensive effects

A subtle background treatment or gradient may be used when consistent with the approved design system.

---

#### Interactions

No user interaction should normally be required.

The application should automatically continue when required initialization and routing checks are complete.

If initialization encounters a blocking problem that prevents safe application entry, the interface should provide understandable recovery feedback rather than remaining indefinitely on the Splash Screen.

---

#### Navigation

The destination after the Splash Screen should depend on the current authoritative application state.

A simplified routing flow may be:

```text
Splash Screen
      ↓
Initialization
      ↓
Determine Required Destination
```

For a new user:

```text
Splash Screen
      ↓
Welcome / Onboarding
```

For a returning user with completed onboarding:

```text
Splash Screen
      ↓
Home Dashboard
```

If authentication is required by the implemented product configuration:

```text
Splash Screen
      ↓
Authentication Check
      ↓
Authentication Flow or Main Application
```

The Splash Screen should not assume that authentication is mandatory for every user or every supported product mode.

---

#### Loading Tasks

During application startup, Deep Focus should perform only initialization tasks required before safe application entry.

Possible tasks include:

- Restore essential application settings
- Restore required persistent state
- Determine onboarding status
- Determine authentication state where authentication is enabled
- Validate recoverable active focus-session state
- Restore theme and accessibility preferences
- Determine the appropriate initial route

Optional or non-blocking work should generally occur after the application becomes usable.

Examples may include:

- Cloud synchronization
- Analytics initialization
- Optional AI service preparation
- Non-critical remote configuration
- Update checks that do not require immediate blocking behavior

Startup should not be delayed unnecessarily by optional network operations.

---

#### Loading Behavior

Initialization should remain fast and predictable.

The application should:

- Avoid unnecessary network dependency
- Avoid indefinite loading
- Restore safe defaults when appropriate
- Handle corrupted persisted state gracefully
- Continue functioning offline where supported
- Avoid blocking application entry for optional AI functionality
- Preserve recoverable active focus sessions

If initialization requires additional time, the loading state should clearly communicate that the application is still working.

---

#### Animation

Appropriate Splash Screen animation may include:

- Logo Fade In
- Gentle Scale Animation
- Subtle Opacity Transition
- Smooth Fade Out

Animations should remain short and purposeful.

Decorative animation should never intentionally increase startup duration.

When reduced motion is enabled, non-essential animation should be reduced or removed.

---

#### Error and Recovery States

The Splash Screen should not become a permanent loading screen when initialization fails.

Possible initialization problems may include:

- Corrupted persisted state
- Authentication restoration failure
- Storage access failure
- Invalid saved navigation state
- Recoverable session restoration failure

Where practical, Deep Focus should:

- Recover using safe defaults
- Preserve valid user data
- Avoid blocking unrelated functionality
- Display user-friendly feedback when action is required
- Provide an appropriate retry or recovery path

Technical error details should not be displayed directly to users.

---

#### Accessibility

The Splash Screen should:

- Support screen readers where meaningful
- Maintain sufficient color contrast
- Avoid flashing effects
- Respect reduced-motion preferences
- Support text scaling where text is displayed
- Avoid communicating important state through animation alone

Because the screen is temporary, accessibility announcements should avoid unnecessary repetition or interruption.

---

#### Performance

The Splash Screen should remain lightweight.

Implementation should:

- Minimize startup rendering work
- Avoid loading unnecessary large assets
- Avoid blocking on optional remote services
- Keep animations lightweight
- Transition to the application as soon as required initialization is complete

Splash Screen performance contributes directly to perceived application responsiveness.

---

#### Future Improvements

Potential future improvements may include:

- Improved offline startup recovery
- More efficient state restoration
- Enhanced session recovery
- Carefully designed contextual branding

Features such as seasonal branding, dynamic messages, or personalized greetings should only be introduced if they provide meaningful value without increasing startup time, distraction, or unnecessary complexity.

---

### 9.3 Welcome Screen

#### Purpose

The Welcome Screen introduces new users to the Deep Focus platform and communicates the core value of the experience before they begin onboarding or authentication-related workflows.

Rather than immediately requiring users to create an account, the screen should briefly explain what Deep Focus helps users achieve and provide a clear path into the application.

The experience should feel welcoming, calm, trustworthy, and focused.

---

#### User Goals

Users should be able to:

- Understand the primary purpose of Deep Focus
- Understand the value of continuing
- Begin the onboarding experience
- Access Sign In when they already have an account
- Continue without unnecessary decisions or distractions

---

#### Main Components

The Welcome Screen may contain:

- Deep Focus Logo
- Welcome Illustration or Visual
- Welcome Headline
- Short Product Description
- Primary `Get Started` Button
- Secondary `Sign In` Action

The screen should avoid unnecessary secondary content.

---

#### Layout Structure

```text
────────────────────────────

        Illustration

       Deep Focus Logo

      Welcome Headline

   Short Product Description

      [ Get Started ]

          Sign In

────────────────────────────
```

The layout should remain clean, visually balanced, and easy to scan.

Content should maintain sufficient spacing while adapting safely to smaller screens and larger accessibility text sizes.

---

#### Visual Design

The Welcome Screen should:

- Create a calm and trustworthy first impression
- Use the official Deep Focus color system
- Follow the established typography and spacing systems
- Keep written content concise
- Maintain a clear visual hierarchy
- Avoid excessive decoration
- Support Light Mode and Dark Mode where applicable
- Avoid unnecessary animation or visual stimulation

Illustrations should support the meaning of the screen rather than function as decoration without purpose.

---

#### Primary Action

`Get Started` is the primary action.

Selecting it should begin the appropriate onboarding flow for a new user.

```text
Welcome Screen
      ↓
Get Started
      ↓
Onboarding
```

Account creation, authentication, assessment, or other setup steps may appear later according to approved product requirements and the user's application state.

The Welcome Screen should not require account creation before onboarding unless authentication is explicitly required by the implemented product configuration.

---

#### Secondary Action

`Sign In` should be available for users who already have an account when account functionality is enabled.

```text
Welcome Screen
      ↓
Sign In
      ↓
Sign In Screen
```

The Sign In action should remain visually secondary to `Get Started`.

If authentication is not enabled in the current product configuration, the Sign In action may be omitted.

---

#### Interaction Behavior

Users may:

- Tap `Get Started` to begin onboarding
- Tap `Sign In` when existing-account authentication is available

The screen should avoid presenting unnecessary actions.

Interactive elements should provide immediate visual feedback without excessive animation.

Repeated taps should not create duplicate navigation actions.

---

#### Navigation

The default new-user flow should be:

```text
Splash Screen
      ↓
Welcome Screen
      ↓
Get Started
      ↓
Onboarding
```

When existing-account authentication is available:

```text
Welcome Screen
      ↓
Sign In
      ↓
Sign In Screen
```

The exact destination after onboarding should depend on the user's current application state and approved product requirements.

Navigation should remain consistent with the rules defined in Section 8.

---

#### States

The Welcome Screen normally requires only a small number of states.

Possible states include:

- Default
- Navigation in progress
- Recoverable navigation error

The screen should not require a traditional loading state unless information required for the experience is genuinely unavailable.

Optional remote content should not block the primary `Get Started` action.

---

#### Empty States

The Welcome Screen does not depend on user-generated content and therefore does not require a traditional empty state.

If optional remote content cannot be loaded, the core Welcome Screen should remain usable.

---

#### Error Handling

Failure of optional services should not prevent users from beginning the Deep Focus experience.

If navigation or another required operation fails, the application should:

- Keep the screen usable
- Preserve the user's current context
- Provide understandable feedback
- Allow the action to be retried where appropriate
- Avoid exposing technical error details

---

#### Accessibility

The Welcome Screen should:

- Support screen readers
- Maintain sufficient color contrast
- Support dynamic text scaling
- Maintain logical reading order
- Provide descriptive accessibility labels
- Provide sufficiently large touch targets
- Avoid relying solely on visual imagery to communicate meaning
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

The layout should remain usable when system text size is increased.

---

#### Performance

The Welcome Screen should remain lightweight.

Implementation should:

- Avoid unnecessarily large illustration assets
- Avoid blocking on optional network requests
- Keep animations lightweight
- Respond immediately to user interaction
- Avoid unnecessary re-rendering

The screen should remain usable offline when the selected next workflow supports offline usage.

---

#### Future Improvements

Potential future improvements may include:

- Language selection when localization is implemented
- Improved onboarding personalization
- Context-aware introductory content
- Accessibility enhancements
- Alternative introductory experiences based on validated user needs

Seasonal illustrations, promotional announcements, or personalized messages should only be introduced when they provide meaningful user value without increasing distraction, startup friction, or interface complexity.

---

### 9.4 Sign In Screen

#### Purpose

The Sign In Screen allows returning users to securely access an existing Deep Focus account with minimal friction.

The experience should feel fast, calm, intuitive, and trustworthy while following the established Deep Focus design language.

Authentication should remain a gateway to account-based functionality rather than creating unnecessary friction for functionality that does not require an account.

---

#### User Goals

Users should be able to:

- Sign in securely to an existing account
- Recover access when they forget their password
- Use supported authentication providers where available
- Continue from the appropriate application state after authentication
- Navigate to account creation when they do not yet have an account

---

#### Main Components

The Sign In Screen may contain:

- Welcome Back Heading
- Supporting Description
- Email Address Field
- Password Field
- Show / Hide Password Control
- Sign In Button
- Forgot Password Link
- Supported Social Sign-In Options
- Create Account Link
- Loading State
- Authentication Error Feedback

Provider-specific authentication options should appear only when they are implemented and available on the current platform.

---

#### Layout Structure

```text
────────────────────────────

        Welcome Back

     Sign in to continue

       Email Address

          Password
      [ Show / Hide ]

        [ Sign In ]

     Forgot Password?

─────────── OR ───────────

 [ Continue with Google ]
       (if available)

 [ Continue with Apple ]
       (if available)

 Don't have an account?

       Create Account

────────────────────────────
```

The layout should prioritize the primary authentication action while keeping secondary options visually clear but unobtrusive.

On smaller screens or when the keyboard is visible, the layout should remain scrollable and usable.

---

#### Visual Design

The Sign In Screen should:

- Follow the official Deep Focus color system
- Follow the established typography system
- Use consistent input components
- Maintain generous but practical spacing
- Provide a clear visual hierarchy
- Keep authentication actions easy to identify
- Support Light Mode and Dark Mode
- Avoid unnecessary visual decoration
- Remain usable with larger accessibility text sizes

Authentication screens should communicate trust through clarity and consistency rather than excessive security-themed visual elements.

---

#### Email Input

The email field should:

- Display a persistent or clearly associated label
- Use an email-appropriate keyboard where supported
- Support platform autofill where appropriate
- Avoid automatic capitalization
- Validate basic input structure
- Preserve entered information after recoverable authentication failures

Placeholder text should not replace the accessible field label.

---

#### Password Input

The password field should:

- Mask password characters by default
- Provide a Show / Hide Password control
- Support password-manager autofill where available
- Avoid modifying the entered password
- Preserve input appropriately after recoverable failures
- Never expose the password through logs or analytics

The Show / Hide control should have an accessible label describing its current action.

---

#### Session Persistence

Authentication session persistence should be handled securely by the authentication architecture rather than relying on a custom `Remember Me` checkbox unless a validated product requirement requires that option.

Users should normally remain authenticated according to the approved authentication and security policy.

Authentication tokens and other sensitive credentials should use appropriate secure storage mechanisms.

---

#### Primary Action

`Sign In` is the primary action.

When selected, the application should:

```text
Validate Required Input
        ↓
Begin Authentication
        ↓
Prevent Duplicate Submission
        ↓
Authenticate
        ↓
Determine Required Destination
```

The button should provide a clear loading state while authentication is in progress.

Repeated taps should not create multiple authentication requests.

---

#### Social Authentication

Supported external authentication providers may include:

- Google
- Apple

Provider options should only appear when:

- The provider is implemented
- The provider is available on the current platform
- Required configuration is valid
- The authentication method is approved for the current product release

Provider-specific behavior should follow applicable platform requirements.

The interface should not display authentication methods that cannot currently be completed.

---

#### Interaction Behavior

Users may:

- Enter an email address
- Enter a password
- Show or hide the password
- Submit authentication credentials
- Use an available supported authentication provider
- Open password recovery
- Navigate to account creation

Interactions should provide immediate visual feedback.

Authentication should not begin until the minimum required input is available.

---

#### Navigation

The entry path may be:

```text
Welcome Screen
      ↓
Sign In
      ↓
Sign In Screen
```

After successful authentication, the application should determine the correct destination from the user's current authoritative state.

For a user who has completed all required setup:

```text
Sign In Screen
      ↓
Authentication Success
      ↓
Home Dashboard
```

If required onboarding or setup remains incomplete:

```text
Sign In Screen
      ↓
Authentication Success
      ↓
Required Onboarding / Setup
```

Successful authentication should not automatically bypass incomplete required application setup.

---

#### Forgot Password Navigation

When the user selects `Forgot Password`:

```text
Sign In Screen
      ↓
Forgot Password Screen
```

Entered email information may be carried into the recovery workflow where appropriate and privacy-safe.

---

#### Account Creation Navigation

When the user selects `Create Account`:

```text
Sign In Screen
      ↓
Sign Up Screen
```

Navigation should preserve appropriate context without carrying sensitive password information between screens.

---

#### Validation

Before authentication, the screen should validate only information necessary to prevent clearly invalid requests.

Validation may include:

- Email is present
- Password is present
- Email structure is reasonably valid

Sign-in should generally avoid enforcing account-creation password rules such as current minimum password length before sending authentication.

Existing accounts may have been created under different historical password policies.

---

#### Authentication Errors

Possible authentication outcomes may include:

- Invalid credentials
- Account unavailable
- Network unavailable
- Authentication service unavailable
- Provider authentication cancelled
- Provider authentication failed
- Too many attempts
- Session or configuration error

User-facing messages should remain understandable and should not expose unnecessary security-sensitive information.

Where revealing whether an account exists could create a security or privacy risk, error messages should remain appropriately generic.

---

#### Loading State

While authentication is processing:

- The Sign In action should indicate progress
- Duplicate submissions should be prevented
- Form state should remain stable
- Navigation actions that could create conflicting authentication requests should be controlled
- The interface should remain responsive

Loading feedback should remain subtle and clear.

---

#### Offline Behavior

If authentication requires a network connection and the device is offline, the screen should:

- Explain that authentication is currently unavailable
- Preserve non-sensitive entered information where appropriate
- Allow retry when connectivity returns
- Avoid presenting the failure as invalid credentials

Existing authenticated sessions should follow the separate session-restoration rules defined by the application architecture.

---

#### Security and Privacy

The Sign In Screen should:

- Never log passwords
- Never expose authentication tokens
- Use secure communication
- Avoid storing passwords directly
- Use secure authentication session handling
- Avoid revealing unnecessary account information through errors
- Support password managers and secure platform autofill
- Prevent accidental duplicate authentication requests

Sensitive authentication responsibilities should remain outside presentation components.

---

#### Accessibility

The Sign In Screen should:

- Support screen readers
- Provide persistent and descriptive form labels
- Maintain sufficient color contrast
- Support dynamic text scaling
- Maintain logical focus order
- Provide accessible validation feedback
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Avoid relying solely on color for errors
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Error messages should be programmatically associated with the relevant input where supported.

---

#### Performance

The Sign In Screen should remain lightweight.

Implementation should:

- Avoid unnecessary network requests
- Avoid loading unavailable authentication providers
- Prevent duplicate authentication submissions
- Keep validation lightweight
- Avoid blocking rendering on optional services
- Respond quickly to user input

Authentication-related loading should not freeze unrelated interface rendering.

---

#### Future Improvements

Potential future improvements may include:

- Passkey Authentication
- Biometric Re-Authentication
- Multi-Factor Authentication (MFA)
- Passwordless Authentication
- Enterprise Single Sign-On (SSO)
- Additional approved authentication providers

Future authentication methods should be introduced only when they provide meaningful security or usability benefits and remain compatible with the Deep Focus security architecture.

---

### 9.5 Sign Up Screen

#### Version Availability

V1, when account functionality is enabled for the release.

---

#### Purpose

The Sign Up Screen allows new users to create a Deep Focus account when account-based functionality is enabled.

The registration experience should remain simple, secure, accessible, and privacy-conscious while collecting only the information required to create and operate the account.

Account creation should not introduce unnecessary friction or request personal information without a clear product requirement.

---

#### User Goals

Users should be able to:

- Create a new Deep Focus account
- Understand the information required for registration
- Register securely with minimal effort
- Use supported authentication providers where available
- Understand applicable Terms and Privacy information
- Continue to the appropriate onboarding or application workflow after registration
- Navigate to Sign In when they already have an account

---

#### Main Components

The Sign Up Screen may contain:

- Create Account Heading
- Supporting Description
- Email Address Field
- Password Field
- Confirm Password Field
- Show / Hide Password Controls
- Create Account Button
- Terms of Service Acknowledgement
- Privacy Policy Link
- Supported Social Sign-Up Options
- Already Have an Account / Sign In Link
- Validation Feedback
- Loading State

A Full Name field should only be included when the product genuinely requires the user's name during account creation.

Information that can be collected later should generally not be required during initial registration.

---

#### Layout Structure

```text
────────────────────────────

       Create Account

   Start your focus journey

       Email Address

          Password
      [ Show / Hide ]

      Confirm Password
      [ Show / Hide ]

  Terms acknowledgement
   Terms of Service
    Privacy Policy

     [ Create Account ]

─────────── OR ───────────

 [ Continue with Google ]
       (if available)

 [ Continue with Apple ]
       (if available)

 Already have an account?

          Sign In

────────────────────────────
```

If a Full Name field is required by approved product requirements, it may appear before the Email Address field.

The layout should remain simple, visually balanced, scrollable where necessary, and usable when the keyboard or larger accessibility text reduces available screen space.

---

#### Visual Design

The Sign Up Screen should:

- Follow the official Deep Focus color system
- Follow the established typography and spacing systems
- Use consistent input components
- Maintain a clear visual hierarchy
- Minimize cognitive load
- Maintain a welcoming and trustworthy appearance
- Support Light Mode and Dark Mode
- Avoid unnecessary visual decoration
- Remain usable with dynamic text scaling

Security and trust should be communicated through clarity and predictable behavior rather than excessive security-themed visuals.

---

#### Email Input

The email field should:

- Have a clearly associated label
- Use an email-appropriate keyboard where supported
- Avoid automatic capitalization
- Support platform autofill where appropriate
- Validate basic email structure
- Preserve entered information after recoverable errors where appropriate

Placeholder text should not replace an accessible field label.

---

#### Password Input

The password field should:

- Mask password characters by default
- Provide an accessible Show / Hide Password control
- Support password managers and secure autofill where available
- Clearly communicate the currently applicable password requirements
- Avoid unnecessary password restrictions
- Never expose the password through logs or analytics

Password requirements should remain aligned with the authentication provider and approved security policy.

---

#### Confirm Password Input

When password confirmation is used, the field should:

- Confirm that both entered passwords match
- Provide clear feedback when they differ
- Avoid clearing both fields unnecessarily after a validation error
- Support accessible error announcements

If the selected authentication architecture makes password confirmation unnecessary, this field may be removed.

---

#### Terms and Privacy

Registration should provide clear access to applicable legal and privacy information.

Where acceptance of Terms of Service is required, the interface should clearly communicate that requirement before account creation.

For example:

```text
By creating an account, you agree to the Terms of Service
and acknowledge the Privacy Policy.
```

`Terms of Service` and `Privacy Policy` should be individually accessible.

The interface should not imply that users are providing consent for optional data processing merely by accepting general Terms of Service.

Any consent that must legally or ethically remain optional should be requested separately.

---

#### Primary Action

`Create Account` is the primary action.

A simplified registration flow is:

```text
Validate Required Input
        ↓
Create Account Request
        ↓
Prevent Duplicate Submission
        ↓
Account Creation
        ↓
Required Verification if Applicable
        ↓
Determine Next Destination
```

The button should provide a clear loading state while registration is in progress.

Repeated taps should not create duplicate account-creation requests.

---

#### Social Registration

Supported external authentication providers may include:

- Google
- Apple

Provider-specific options should only appear when:

- The provider is implemented
- The provider is available on the current platform
- Required configuration is valid
- The provider is approved for the current release

The interface should not display authentication methods that cannot currently be completed.

Social authentication should still provide access to required Terms, Privacy, onboarding, and account setup information.

---

#### Interaction Behavior

Users may:

- Enter required registration information
- Show or hide password values
- Review Terms of Service
- Review the Privacy Policy
- Create an account
- Use an available supported authentication provider
- Navigate to Sign In

Input validation should provide timely and understandable feedback without creating unnecessary interruption.

The application should preserve valid non-sensitive input after recoverable failures where practical.

---

#### Navigation

A possible account-creation entry flow is:

```text
Welcome Screen
      ↓
Get Started
      ↓
Onboarding
      ↓
Account Creation
```

Account creation may also be reached from another approved onboarding or account workflow.

When registration is initiated directly:

```text
Sign Up Screen
      ↓
Account Creation
      ↓
Required Verification if Applicable
      ↓
Determine Required Destination
```

If onboarding or required setup remains incomplete:

```text
Account Creation Success
      ↓
Required Onboarding / Setup
```

If all required setup is already complete:

```text
Account Creation Success
      ↓
Home Dashboard
```

The exact flow should follow the approved product requirements rather than assuming that account creation always occurs before onboarding.

---

#### Sign In Navigation

If the user already has an account:

```text
Sign Up Screen
      ↓
Sign In
      ↓
Sign In Screen
```

Sensitive password information should not be carried between authentication screens.

---

#### Email Verification

Email verification should follow the selected authentication and security policy.

When verification is required:

```text
Account Created
      ↓
Verification Required
      ↓
Verification Flow
      ↓
Verification Success
      ↓
Determine Required Destination
```

The application should clearly explain:

- Why verification is required
- What the user should do next
- How to resend verification where supported
- How to recover from an incorrect or inaccessible email address

Email verification should not be described as optional if the authentication configuration requires it.

---

#### Validation

Registration validation may include:

- Required fields
- Reasonably valid email structure
- Current password requirements
- Password confirmation where used
- Required Terms acknowledgement where applicable

Validation should occur at appropriate moments without aggressively displaying errors before users have had an opportunity to complete a field.

Validation messages should be:

- Clear
- Concise
- Specific
- Accessible
- Non-judgmental

---

#### Registration Errors

Possible registration failures may include:

- Invalid input
- Email already associated with an account
- Network unavailable
- Authentication service unavailable
- Provider authentication cancelled
- Provider authentication failed
- Password rejected by the authentication policy
- Too many attempts
- Configuration failure

Error messages should help users recover without exposing unnecessary internal or security-sensitive information.

When appropriate, users who already have an account may be guided toward Sign In or password recovery.

---

#### Loading State

While account creation is processing:

- The primary action should indicate progress
- Duplicate submissions should be prevented
- Existing form input should remain stable
- Conflicting authentication actions should be controlled
- The interface should remain responsive

Optional services should not block account creation unnecessarily.

---

#### Offline Behavior

If account creation requires network access and the device is offline, the application should:

- Explain that registration currently requires a connection
- Preserve non-sensitive entered information where appropriate
- Allow the user to retry
- Avoid treating connectivity failure as invalid registration information

Core local functionality should follow the separate product rules governing whether an account is required.

---

#### Security and Privacy

The Sign Up Screen should:

- Collect only required information
- Never log passwords
- Never store passwords directly
- Use secure communication
- Protect authentication credentials
- Avoid unnecessary personal-data collection
- Use secure authentication session handling
- Prevent duplicate account creation requests
- Avoid exposing sensitive implementation details through errors

Authentication and credential-handling logic should remain outside presentation components.

---

#### Accessibility

The Sign Up Screen should:

- Support screen readers
- Provide persistent and descriptive form labels
- Maintain sufficient color contrast
- Support dynamic text scaling
- Maintain logical focus order
- Provide accessible validation feedback
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Avoid relying solely on color for validation
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Terms, Privacy, validation messages, and form controls should remain accessible when larger text sizes are enabled.

---

#### Performance

The Sign Up Screen should remain lightweight.

Implementation should:

- Keep client-side validation efficient
- Avoid unnecessary network requests
- Prevent duplicate registration requests
- Avoid loading unavailable authentication providers
- Avoid blocking rendering on optional services
- Keep authentication interactions responsive

Registration should not depend on unrelated AI, analytics, or synchronization services.

---

#### Future Improvements

Potential future improvements may include:

- Passkey Registration
- Passwordless Account Creation
- Additional approved authentication providers
- Enterprise Account Creation
- Invitation-Based Registration
- Magic Link Authentication
- Enhanced account recovery options

Biometric authentication may later be used for appropriate authentication or re-authentication workflows, but should not automatically be treated as a replacement for secure account identity creation.

Future authentication methods should be introduced only when they provide meaningful security or usability benefits and remain aligned with the Deep Focus Security Architecture.

---

### 9.6 Forgot Password Screen

#### Version Availability

V1, when email-and-password authentication is enabled.

---

#### Purpose

The Forgot Password Screen helps users recover access to an existing Deep Focus account when password-based authentication is enabled.

The recovery process should remain simple, secure, reliable, and reassuring while protecting account privacy.

The interface should provide enough guidance for users to understand the next step without revealing whether a particular email address is associated with an account.

---

#### User Goals

Users should be able to:

- Request password recovery
- Understand what happens after submitting the request
- Recover account access securely
- Retry when a recoverable failure occurs
- Return to the Sign In Screen

---

#### Main Components

The Forgot Password Screen may contain:

- Forgot Password Heading
- Instruction Text
- Email Address Field
- Send Reset Link Button
- Back to Sign In Link
- Submission Loading State
- Confirmation Feedback
- Error Feedback

The screen should remain intentionally simple.

---

#### Layout Structure

```text
────────────────────────────

       Forgot Password

 Enter your email address and
 we'll send password recovery
 instructions if an account
 is associated with it.

        Email Address

    [ Send Reset Link ]

       Back to Sign In

────────────────────────────
```

The layout should remain clean, focused, and easy to understand.

It should remain usable when the keyboard is visible and when larger accessibility text sizes are enabled.

---

#### Visual Design

The Forgot Password Screen should:

- Follow the official Deep Focus color system
- Follow the established typography and spacing systems
- Use consistent input and button components
- Maintain a clear visual hierarchy
- Minimize distractions
- Provide concise instructions
- Reinforce user confidence
- Support Light Mode and Dark Mode
- Avoid unnecessary visual decoration

The screen should feel reassuring without implying that recovery has succeeded before the request has been processed.

---

#### Email Input

The email field should:

- Have a clearly associated label
- Use an email-appropriate keyboard where supported
- Avoid automatic capitalization
- Support platform autofill where appropriate
- Validate basic email structure
- Preserve the entered email after recoverable failures where appropriate

Placeholder text should not replace an accessible field label.

---

#### Primary Action

`Send Reset Link` is the primary action.

A simplified request flow is:

```text
Enter Email
      ↓
Validate Input
      ↓
Submit Recovery Request
      ↓
Prevent Duplicate Submission
      ↓
Display Generic Confirmation
```

The button should provide a clear loading state while the request is processing.

Repeated taps should not create unnecessary duplicate recovery requests.

---

#### Interaction Behavior

Users may:

- Enter an email address
- Submit a password recovery request
- Retry after a recoverable failure
- Return to the Sign In Screen

Input validation should provide helpful feedback when the email field is empty or clearly malformed.

After a successful recovery request, the interface should display a privacy-preserving confirmation rather than revealing whether the email belongs to an existing account.

---

#### Confirmation State

After the recovery request has been accepted for processing, the application should display a generic confirmation such as:

```text
If an account is associated with this email address,
password recovery instructions will be sent shortly.
```

The confirmation may also provide:

- Check Email guidance
- Check Spam or Junk guidance
- Resend option where appropriate
- Back to Sign In action

The interface should not confirm whether a specific account exists.

---

#### Navigation

The entry flow is:

```text
Sign In Screen
      ↓
Forgot Password
      ↓
Forgot Password Screen
```

After submission:

```text
Forgot Password Screen
      ↓
Recovery Request
      ↓
Generic Confirmation
      ↓
Check Email
```

When the user follows a valid password-reset link, the authentication system may continue through:

```text
Password Reset Link
      ↓
Validate Recovery Request
      ↓
Create New Password
      ↓
Password Reset Success
      ↓
Sign In
```

The exact external-link and password-reset flow should follow the selected authentication provider and security architecture.

---

#### Back Navigation

When the user selects `Back to Sign In`:

```text
Forgot Password Screen
      ↓
Sign In Screen
```

Where appropriate, the entered email address may be preserved when returning to Sign In.

No sensitive recovery credentials should be transferred through normal navigation parameters.

---

#### Validation

Before submitting the recovery request, the screen should validate:

- Email field is present
- Email structure is reasonably valid

Validation should prevent clearly invalid requests without attempting to determine whether an account exists.

Messages should remain:

- Clear
- Concise
- Accessible
- Non-judgmental

---

#### Account Privacy

The password recovery experience should avoid account enumeration.

The application should not display messages such as:

```text
No account exists with this email.
```

Instead, successful recovery requests should use a generic response regardless of whether the submitted email address is registered.

This helps prevent unauthorized users from determining which email addresses are associated with Deep Focus accounts.

---

#### Recovery Link Security

Password recovery links should be handled by the selected authentication system and security policy.

Recovery mechanisms should:

- Use secure links or equivalent secure recovery mechanisms
- Expire according to the authentication policy
- Reject invalid or expired recovery requests
- Prevent unauthorized password changes
- Avoid exposing sensitive recovery credentials
- Validate incoming recovery links before allowing password changes

The application should provide understandable feedback when a recovery link is invalid or expired.

---

#### Resend Behavior

If resend functionality is supported, it should:

- Prevent excessive repeated requests
- Provide appropriate cooldown behavior where required
- Avoid revealing account existence
- Provide clear feedback
- Respect authentication-provider rate limits

Users should not be encouraged to repeatedly request recovery emails unnecessarily.

---

#### Error Handling

Possible recovery failures may include:

- Invalid email structure
- Network unavailable
- Authentication service unavailable
- Rate limit exceeded
- Invalid recovery link
- Expired recovery link
- Configuration failure

The application should:

- Preserve the entered email where appropriate
- Provide understandable feedback
- Allow retry for recoverable failures
- Avoid exposing internal technical details
- Avoid revealing whether an account exists

---

#### Loading State

While a recovery request is processing:

- The primary action should indicate progress
- Duplicate submissions should be prevented
- Entered information should remain stable
- The interface should remain responsive

The loading state should end with either recoverable error feedback or the generic confirmation state.

---

#### Offline Behavior

If password recovery requires network access and the device is offline, the screen should:

- Explain that a connection is required
- Preserve the entered email address
- Allow retry when connectivity returns
- Avoid presenting the failure as an invalid account or email

The application should not pretend that a recovery request was successfully submitted while offline unless an approved architecture explicitly supports queued recovery requests.

---

#### Security and Privacy

The Forgot Password Screen should:

- Avoid account enumeration
- Never expose authentication tokens
- Never expose recovery credentials through logs
- Use secure communication
- Avoid logging sensitive recovery URLs
- Validate incoming recovery links
- Respect authentication-provider rate limits
- Avoid unnecessary personal-data collection
- Keep recovery logic outside presentation components

Password recovery should follow the rules defined in the Deep Focus Security Architecture.

---

#### Accessibility

The Forgot Password Screen should:

- Support screen readers
- Provide a persistent and descriptive email label
- Maintain sufficient color contrast
- Support dynamic text scaling
- Maintain logical focus order
- Provide accessible validation and confirmation feedback
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Avoid relying solely on color for errors
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Important confirmation and error messages should be announced appropriately to assistive technologies where supported.

---

#### Performance

The Forgot Password Screen should remain lightweight.

Implementation should:

- Keep validation lightweight
- Avoid unnecessary network requests
- Prevent duplicate recovery submissions
- Avoid blocking rendering on unrelated services
- Respond quickly to user input

Password recovery should not depend on AI, analytics, cloud synchronization, or other unrelated optional services.

---

#### Future Improvements

Potential future improvements may include:

- Passwordless Account Recovery
- Passkey Recovery Support
- Multi-Factor Recovery
- Additional Secure Recovery Methods
- Improved Recovery Link Handling

SMS-based recovery should only be introduced when there is a validated product and security requirement, with appropriate consideration for privacy, operational cost, account-takeover risk, and regional availability.

Future recovery methods should remain aligned with the Deep Focus Security Architecture and should not weaken existing account protections.

---

### 9.7 Email Verification Screen

#### Version Availability

V1, when email verification is required by the selected authentication flow.

---

#### Purpose

The Email Verification Screen confirms ownership of a user's email address before the user continues through protected parts of the Deep Focus account flow.

Email verification helps improve account security, supports reliable password recovery, and reduces misuse of accounts created with email addresses that the user does not control.

Whether verification is mandatory before onboarding should be defined by the approved authentication policy.

---

#### User Goals

Users should be able to:

- Understand why email verification is required
- Verify ownership of their email address
- Open their email application where supported
- Request another verification email
- Change an incorrect email address
- Continue after successful verification

---

#### Main Components

The Email Verification Screen may contain:

- Verification Illustration
- Verification Heading
- Instruction Text
- Email Address Display
- Open Email App Action (where supported)
- Resend Verification Email Button
- Resend Cooldown Indicator
- Change Email Address Link
- Check Verification Status Action
- Verification Success State
- Error Feedback
- Continue Button after successful verification

Only actions supported by the selected authentication implementation should be displayed.

---

#### Layout Structure

```text
────────────────────────────

       Verify Your Email

 We've sent verification
 instructions to:

      user@example.com

     [ Open Email App ]

     [ Resend Email ]

        Change Email

────────────────────────────
```

After successful verification:

```text
────────────────────────────

        Email Verified

 Your email address has been
 successfully verified.

        [ Continue ]

────────────────────────────
```

The layout should remain clean, simple, and reassuring.

---

#### Visual Design

The Email Verification Screen should:

- Follow the official Deep Focus Design System
- Follow established typography and spacing rules
- Use a calm and appropriate verification illustration
- Clearly explain the verification process
- Reduce user uncertainty
- Maintain strong visual hierarchy
- Support Light Mode and Dark Mode
- Avoid unnecessary visual decoration

Verification status should be communicated using both text and visual indicators rather than color alone.

---

#### Email Address Display

The destination email address should be displayed clearly enough for the user to identify mistakes.

Example:

```text
Verification instructions were sent to:

user@example.com
```

The interface should provide a clear `Change Email` action when the authentication architecture supports changing the address safely.

Sensitive account information beyond what is necessary for verification should not be displayed.

---

#### Verification Flow

A simplified verification flow is:

```text
Account Created
      ↓
Verification Required
      ↓
Verification Email Sent
      ↓
User Opens Verification Link
      ↓
Authentication Provider Validates Link
      ↓
Verification Status Updated
      ↓
Application Confirms Status
      ↓
Continue
```

The application should not treat the account as verified merely because the user tapped a verification-related button.

Verification status should be confirmed through the approved authentication system.

---

#### Interaction Behavior

Users may:

- Review the destination email address
- Open their email application where supported
- Follow the verification link
- Return to Deep Focus
- Request another verification email
- Change an incorrect email address where supported
- Check verification status when automatic detection is unavailable
- Continue after successful verification

The application should automatically refresh verification status when practical, particularly when returning to the foreground after the user has opened their email application.

---

#### Automatic Verification Detection

When the application returns to the foreground, it may refresh the authenticated user's verification status.

A simplified flow is:

```text
App Returns to Foreground
        ↓
Refresh Authentication State
        ↓
Check Verified Status
        ↓
Verified?
   ↙           ↘
 Yes           No
  ↓             ↓
Success      Remain on
State        Verification
```

The application should avoid excessive verification-status requests.

If automatic detection is unavailable or unreliable, a manual `Check Verification Status` action may be provided.

---

#### Navigation

The standard account flow may be:

```text
Sign Up
      ↓
Email Verification
      ↓
Onboarding
```

If verification is mandatory, users should not bypass the verification requirement through normal navigation.

After successful verification:

```text
Email Verification
        ↓
Verification Confirmed
        ↓
Continue
        ↓
Onboarding
```

If verification is optional according to the approved authentication policy, navigation behavior should be documented separately.

---

#### Resend Verification

Users should be able to request another verification email when necessary.

Resend behavior should:

- Prevent duplicate submissions
- Apply an appropriate cooldown
- Respect authentication-provider rate limits
- Display loading feedback
- Display clear success or recoverable error feedback
- Avoid excessive network requests

A temporary disabled state may be used during the cooldown period.

Example:

```text
Resend available in 30 seconds
```

The exact cooldown should follow the selected authentication provider and product requirements rather than being permanently hard-coded into the design specification.

---

#### Change Email Address

If the user entered an incorrect email address, the application may provide a `Change Email` action.

The change-email flow should:

- Require appropriate authentication validation
- Validate the new email address
- Update the account safely
- Send verification to the new address
- Invalidate outdated verification state where required
- Return the user to the verification flow

The implementation should follow the capabilities and security requirements of the selected authentication provider.

---

#### Verification Success

After successful verification, the screen should provide clear confirmation.

Example:

```text
Email Verified

Your email address has been successfully verified.

[ Continue ]
```

The success state should be based on confirmed authentication state rather than a local UI assumption.

---

#### Validation

The application should validate:

- Current authentication state
- Email verification status
- Verification-link validity where applicable
- Required authentication-provider responses
- Resend eligibility

Invalid or unexpected verification data should not automatically unlock protected application flows.

---

#### Expired or Invalid Verification Links

Verification links may become invalid or expire according to the authentication provider's rules.

When this occurs, the application should:

- Explain the problem clearly
- Avoid displaying unnecessary technical details
- Allow the user to request a new verification email
- Preserve the account safely
- Return the user to the verification flow

Example feedback:

```text
This verification link is no longer valid.

Request a new verification email to continue.
```

---

#### Loading States

Loading feedback may be required while:

- Sending the initial verification email
- Resending verification
- Refreshing verification status
- Processing a verification result
- Updating an email address

Loading states should:

- Prevent duplicate actions
- Keep the interface responsive
- Preserve relevant user information
- End with clear success or error feedback

---

#### Error Handling

Possible failures include:

- Network unavailable
- Verification email could not be sent
- Authentication session expired
- Verification link invalid
- Verification link expired
- Rate limit exceeded
- Verification status could not be refreshed
- Authentication provider unavailable

The application should:

- Provide understandable feedback
- Allow retry for recoverable failures
- Avoid exposing internal technical details
- Preserve account state where appropriate
- Prevent accidental verification bypass

---

#### Offline Behavior

Email verification generally requires network access.

If the device is offline, the screen should:

- Explain that an internet connection is required
- Preserve the current account state
- Avoid repeated automatic requests
- Allow retry when connectivity returns
- Prevent the application from falsely reporting successful verification

Previously confirmed verification status may be restored according to the authentication architecture, but new verification should not be assumed while offline.

---

#### Security and Privacy

The Email Verification Screen should:

- Confirm verification through the approved authentication provider
- Never expose authentication tokens
- Never expose verification credentials
- Avoid logging complete verification URLs
- Avoid storing verification secrets in insecure storage
- Use secure communication
- Respect authentication-provider rate limits
- Prevent verification bypass
- Handle expired authentication sessions safely
- Minimize displayed personal information

Verification links and authentication credentials should be treated as sensitive security information.

---

#### Accessibility

The Email Verification Screen should:

- Support screen readers
- Maintain sufficient color contrast
- Support dynamic text sizing
- Maintain logical focus order
- Provide descriptive accessibility labels
- Announce important verification status changes where supported
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Avoid relying solely on color
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Verification success and error states should remain understandable without relying on illustrations or animations.

---

#### Performance

The Email Verification Screen should remain lightweight.

Implementation should:

- Avoid unnecessary verification-status polling
- Avoid repeated resend requests
- Refresh status only when appropriate
- Prevent duplicate network operations
- Keep visual animations lightweight
- Avoid depending on unrelated services

Email verification should not depend on AI, analytics, rewards, or other optional Deep Focus services.

---

#### Future Improvements

Potential future enhancements include:

- Improved Deep Link Verification
- One-Tap Verification where securely supported
- Better Cross-Device Verification Continuity
- Passkey-Based Account Flows
- Improved Automatic Verification Status Refresh

Future verification improvements should remain compatible with the Deep Focus Security Architecture and the selected authentication provider.

---

### 9.8 Onboarding Introduction

#### Version Availability

V1

---

#### Purpose

The Onboarding Introduction familiarizes new users with the core purpose and experience of Deep Focus before personalization begins.

Rather than presenting a large list of features, onboarding should introduce the platform's philosophy, explain its primary value, and prepare users for the personalization process that follows.

The experience should remain calm, concise, welcoming, and easy to complete.

---

#### User Goals

Users should be able to:

- Understand the purpose of Deep Focus
- Understand the value of focused and sustainable productivity
- Understand that personalization may adapt the experience to their preferences and usage
- Understand that AI-assisted guidance remains supportive and optional where applicable
- Move through onboarding with minimal effort
- Continue to the Personal Assessment

---

#### Main Components

The Onboarding Introduction may contain:

- Full-Screen Illustration
- Feature Title
- Short Description
- Progress Indicator
- Skip Action
- Back Action where appropriate
- Next Button
- Get Started Button on the final screen

The number of onboarding steps should remain limited.

---

#### Layout Structure

A standard onboarding step may use:

```text
────────────────────────────

        Illustration

       Feature Title

     Short Description

          ● ○ ○

         [ Next ]

           Skip

────────────────────────────
```

The final onboarding step may use:

```text
────────────────────────────

        Illustration

       Ready to Begin?

   Let's personalize your
    Deep Focus experience.

          ● ● ●

     [ Get Started ]

────────────────────────────
```

The layout should remain clean, visually balanced, and distraction-free.

Content should remain usable on smaller displays and when larger accessibility text sizes are enabled.

---

#### Onboarding Content

##### Screen 1 — Focus on What Matters

**Focus on What Matters**

Deep Focus helps users protect their attention and dedicate time to meaningful work with fewer unnecessary distractions.

The illustration should reinforce calm concentration without introducing excessive visual detail.

---

##### Screen 2 — Personalized Guidance

**Your Personal Productivity Coach**

Deep Focus can adapt recommendations and insights using relevant preferences, goals, and productivity patterns.

Personalized guidance should remain transparent and should not imply that AI can guarantee productivity outcomes.

---

##### Screen 3 — Sustainable Focus

**Build Sustainable Focus Habits**

Deep Focus encourages consistent focus, intentional recovery, and healthier long-term productivity habits.

The experience should communicate that sustainable progress is more important than excessive work.

---

#### Visual Design

The onboarding experience should:

- Follow the official Deep Focus Design System
- Use illustrations consistent with the product's visual identity
- Maintain generous whitespace
- Keep written content concise
- Use clear typography hierarchy
- Use the official color system
- Support Light Mode and Dark Mode
- Use subtle transitions
- Avoid unnecessary visual effects
- Maintain consistency between onboarding steps

Illustrations should support the message rather than become the primary source of information.

---

#### Progress Indicator

The onboarding flow should clearly communicate progress.

Example:

```text
Screen 1    ● ○ ○

Screen 2    ● ● ○

Screen 3    ● ● ●
```

The progress indicator should:

- Reflect the current onboarding step
- Remain visually subtle
- Be understandable without relying solely on color
- Remain accessible to assistive technologies where appropriate

---

#### Interaction Behavior

Users may:

- Swipe between onboarding screens where supported
- Tap `Next`
- Navigate back to a previous onboarding step where appropriate
- Select `Skip`
- Select `Get Started` on the final screen

Swipe gestures should not be the only available navigation method.

Primary buttons should always provide an explicit alternative.

---

#### Next Behavior

Selecting `Next` should move the user to the following onboarding step.

A simplified flow is:

```text
Screen 1
   ↓
Screen 2
   ↓
Screen 3
   ↓
Get Started
```

The transition should remain quick and predictable.

Repeated taps should not cause multiple navigation transitions.

---

#### Back Behavior

Where a Back action is available, selecting it should return to the previous onboarding step without losing relevant onboarding state.

Example:

```text
Screen 3
   ↓
Screen 2
```

Platform back-navigation behavior should remain consistent with the application's navigation architecture.

---

#### Skip Behavior

Selecting `Skip` should skip the introductory slides rather than bypass required account, privacy, consent, or personalization steps.

The V1 flow should be:

```text
Onboarding Introduction
        ↓
Skip
        ↓
Personal Assessment
```

If future versions allow optional assessment steps, their skip behavior should be documented separately.

The meaning of `Skip` should always remain clear to the user.

---

#### Get Started Behavior

On the final onboarding screen, the primary action should change from `Next` to:

```text
Get Started
```

Selecting `Get Started` should continue to the Personal Assessment.

```text
Final Onboarding Screen
        ↓
Get Started
        ↓
Personal Assessment
```

The action should not silently grant permissions, enable AI features, or provide consent for unrelated data processing.

---

#### Navigation

The standard V1 flow is:

```text
Email Verification
        ↓
Onboarding Introduction
        ↓
Personal Assessment
```

If the introductory slides are skipped:

```text
Onboarding Introduction
        ↓
Skip
        ↓
Personal Assessment
```

Users should not accidentally return to authentication screens after entering the normal onboarding flow unless the account or authentication state requires it.

---

#### Onboarding State

The application should track enough onboarding state to provide predictable navigation.

Possible state may include:

- Current onboarding step
- Introduction completed or skipped
- Personal Assessment status
- Overall onboarding completion status

Temporary presentation state should remain separate from persistent onboarding completion state.

---

#### Persistence

Important onboarding progress should be persisted where appropriate.

The application should:

- Avoid repeatedly showing completed introductory onboarding on every launch
- Restore the appropriate flow after an unexpected application closure
- Validate persisted onboarding state
- Avoid marking the entire onboarding process complete before required steps are finished

A simplified flow may be:

```text
Onboarding Step
      ↓
Progress Update
      ↓
Persist Required State
      ↓
Continue
```

---

#### Returning Users

Users who have already completed onboarding should normally bypass the introductory onboarding flow.

Example:

```text
Application Launch
      ↓
Authentication Restored
      ↓
Onboarding Already Complete
      ↓
Home Dashboard
```

If onboarding was interrupted before completion, the application should restore the appropriate incomplete flow where practical.

---

#### Loading and Transition States

Navigation between onboarding screens should remain responsive.

The experience should:

- Avoid unnecessary loading indicators
- Prevent duplicate navigation actions
- Keep transitions lightweight
- Preserve the current step during recoverable interruptions
- Avoid depending on remote services for basic onboarding presentation

The introductory onboarding screens should load quickly using local application resources wherever practical.

---

#### Offline Behavior

The Onboarding Introduction should remain usable without a network connection whenever its content is stored locally.

The introductory slides should not depend on:

- AI availability
- Analytics services
- Cloud synchronization
- Remote recommendations

If a later onboarding step requires network access, that requirement should be communicated at that specific step rather than blocking the introductory experience unnecessarily.

---

#### AI Communication

When onboarding introduces AI-assisted capabilities, messaging should remain accurate and transparent.

The interface should:

- Present AI as supportive assistance
- Avoid guaranteeing productivity improvements
- Avoid implying that AI has complete knowledge of the user
- Explain personalization in understandable language
- Preserve user control
- Avoid enabling optional AI data processing merely because onboarding was completed

Any required AI consent or privacy explanation should occur through the appropriate dedicated flow.

---

#### Privacy

The Onboarding Introduction should not collect unnecessary personal information.

It should:

- Avoid requesting permissions before they are needed
- Avoid treating navigation actions as privacy consent
- Explain personalization before requesting relevant information
- Follow the Deep Focus privacy and security architecture

Data collection should occur only within the appropriate assessment, permission, or settings workflow.

---

#### Accessibility

The onboarding experience should:

- Support screen readers
- Provide meaningful text alternatives for important illustrations
- Maintain sufficient color contrast
- Support dynamic text scaling
- Maintain logical focus order
- Provide descriptive accessibility labels
- Support accessibility navigation controls
- Avoid relying solely on swipe gestures
- Avoid relying solely on color for progress
- Respect reduced-motion accessibility settings

Interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Important information communicated visually should also be available in textual form.

---

#### Reduced Motion

When reduced motion is enabled:

- Large page animations should be minimized or removed
- Decorative motion should be disabled where practical
- Essential state changes should remain understandable
- Simple fades or immediate transitions may replace more complex movement

Reduced motion should not prevent users from understanding onboarding progress.

---

#### Error Recovery

If onboarding state cannot be restored or persisted correctly, the application should:

- Avoid losing account information
- Restore a safe onboarding state
- Avoid incorrectly marking onboarding as complete
- Provide understandable feedback when user action is required
- Allow the user to continue when recovery is safe

Technical storage errors should not be displayed directly to users.

---

#### Performance

The Onboarding Introduction should remain lightweight.

Implementation should:

- Optimize illustrations
- Avoid unnecessarily large assets
- Keep animations efficient
- Avoid unnecessary network requests
- Preload only resources required for the immediate experience
- Maintain smooth transitions on supported devices

A visually premium onboarding experience should not come at the cost of slow startup or excessive memory usage.

---

#### Completion Rule

Completing or skipping the introductory slides does not necessarily mean that the entire onboarding process is complete.

Overall onboarding should only be marked complete after all required V1 onboarding steps have been successfully completed.

A simplified distinction is:

```text
Introduction Completed
        ≠
Full Onboarding Completed
```

This distinction should remain clear in application state and persistence logic.

---

#### Future Improvements

Potential future enhancements include:

- Personalized onboarding based on user-selected goals
- Occupation-aware onboarding
- Adaptive onboarding paths
- Multi-Language Onboarding
- Optional Interactive Tutorials
- Contextual Feature Education
- Improved Cross-Device Onboarding Continuity

Short introduction videos or AI-guided onboarding should only be introduced when they provide measurable user value without making onboarding slower, more intrusive, or unnecessarily complex.

---

### 9.9 Personal Assessment

#### Version Availability

V1

---

#### Purpose

The Personal Assessment is the first structured personalization experience within Deep Focus.

Its purpose is to understand relevant user goals, work or study patterns, focus preferences, common distractions, and recovery preferences so that Deep Focus can personalize the experience appropriately.

Rather than presenting a long questionnaire, the assessment should use a guided multi-step flow that remains concise, understandable, and easy to complete.

Only information that provides clear personalization value should be requested.

---

#### User Goals

Users should be able to:

- Define their primary productivity goals
- Share relevant work or study preferences
- Identify common focus challenges
- Provide useful personalization information
- Understand why relevant information is being requested
- Review and correct their responses
- Complete the assessment without feeling overwhelmed

---

#### Main Components

The Personal Assessment may contain:

- Step Indicator
- Progress Indicator
- Question Title
- Supporting Description
- Single-Select Options
- Multi-Select Options
- Time or Schedule Inputs where required
- Continue Button
- Back Button
- Skip Option for optional questions
- Review and Edit Controls
- Save or Resume State where supported

Each step should display only the controls required for the current question.

---

#### Layout Structure

A standard assessment step may use:

```text
────────────────────────────

          Step 2 of 7

        ━━━━━○○○○○

         Question Title

       Short Description

        ○ Option 1

        ○ Option 2

        ○ Option 3

        ○ Option 4

          [ Continue ]

             Back

────────────────────────────
```

For multi-select questions:

```text
────────────────────────────

          Step 5 of 7

      Biggest Distractions

 Select all that apply.

        □ Social Media

        □ Notifications

        □ Multitasking

        □ Procrastination

          [ Continue ]

             Back

────────────────────────────
```

The layout should focus on one logical question group at a time to reduce cognitive load.

---

#### Assessment Flow

The V1 assessment consists of seven primary steps.

---

##### Step 1 — About You

This step collects only basic information that provides meaningful personalization value.

Possible inputs include:

- Primary Activity or Occupation
- Experience Level
- Age Group, only if an approved personalization requirement justifies collecting it

Examples of primary activity may include:

- Student
- Professional
- Freelancer
- Entrepreneur
- Other

Age-related information should remain optional unless a documented product requirement makes it necessary.

The application should avoid collecting demographic information merely because it may be useful in the future.

---

##### Step 2 — Your Goals

Users identify what they primarily want Deep Focus to help them improve.

Possible goals include:

- Improve Concentration
- Reduce Distractions
- Build Better Study Habits
- Improve Work Consistency
- Manage Time More Effectively
- Build Sustainable Productivity Habits
- Improve Recovery Habits

Users may select multiple goals where appropriate.

The interface should avoid suggesting that Deep Focus can guarantee specific productivity or well-being outcomes.

---

##### Step 3 — Work Style

This step identifies general work or study preferences.

Possible options include:

- Morning Preference
- Evening Preference
- Flexible Schedule
- Structured Routine
- Variable Schedule

Questions should describe preferences rather than assign permanent labels to users.

Users should be able to update these preferences later.

---

##### Step 4 — Daily Schedule

This step collects schedule information only when it provides clear value for planning or recommendations.

Possible inputs include:

- Typical Work or Study Period
- Preferred Focus Period
- Typical Free Time
- Preferred Reminder Window

Sleep-related information should only be requested when required by an approved feature and should remain optional where practical.

Time inputs should use platform-appropriate controls.

Users should not be required to provide an exact daily schedule when approximate information is sufficient.

---

##### Step 5 — Biggest Distractions

Users identify common factors that make concentration difficult.

Possible options include:

- Social Media
- Notifications
- Multitasking
- Procrastination
- Meetings
- Environmental Noise
- Messaging
- Other

Multiple selections may be allowed.

The wording should remain neutral and should not shame users for their habits.

---

##### Step 6 — Focus and Energy Preferences

This step collects information that may help personalize focus and recovery recommendations.

Possible inputs include:

- Preferred Focus Time
- Preferred Session Duration
- Preferred Break Duration
- Self-Reported Energy Pattern
- Recovery Preferences

The application should distinguish between user-reported information and system-generated estimates.

Deep Focus should not present self-reported energy information as a medical assessment.

---

##### Step 7 — Final Review

Before completing the assessment, users should be able to review the information they provided.

The review may display:

```text
Your Goals
Improve Concentration
Reduce Distractions

Work Style
Morning Preference

Preferred Focus Duration
45 Minutes

Common Distractions
Social Media
Notifications

[ Edit Answers ]

[ Continue ]
```

Users should be able to return to relevant steps and correct information before continuing.

The application should not create a final personalized profile from answers the user has not had a reasonable opportunity to review.

---

#### Required and Optional Questions

Every assessment question should have a clearly defined requirement level.

Required questions should:

- Be necessary for the V1 personalization flow
- Have a clear product purpose
- Prevent continuation only when genuinely required

Optional questions should:

- Be clearly identified as optional
- Provide a visible Skip action where appropriate
- Never use confusing or coercive wording

Example:

```text
Age Group
Optional
```

The application should collect the minimum information required to provide useful personalization.

---

#### Selection Behavior

Questions may use either single-select or multi-select behavior.

Single-select example:

```text
○ Morning Preference
● Evening Preference
○ Flexible Schedule
```

Multi-select example:

```text
☑ Social Media
☑ Notifications
☐ Meetings
☐ Noise
```

The interaction model should remain consistent for questions of the same type.

Selected states should not rely solely on color.

---

#### Continue Behavior

Selecting `Continue` should:

- Validate the current required response
- Preserve the selected answer
- Update assessment progress
- Move to the next step

A simplified flow is:

```text
Answer Question
      ↓
Validate
      ↓
Save Assessment State
      ↓
Update Progress
      ↓
Next Step
```

Repeated taps should not create duplicate navigation or persistence operations.

---

#### Back Behavior

Users should be able to return to previous steps without losing completed responses.

Example:

```text
Step 4
   ↓
Back
   ↓
Step 3
```

Previously selected responses should remain visible and editable.

Changing a previous response should update dependent assessment information where necessary.

---

#### Skip Behavior

Only optional questions should normally provide a Skip action.

Selecting `Skip` should:

- Leave the optional value unset
- Preserve other assessment progress
- Continue to the next appropriate step
- Avoid inserting fabricated default information

Skipping an optional question should not reduce unrelated application functionality unless that information is genuinely required for a specific personalized feature.

---

#### Progress Indicator

The assessment should clearly communicate progress.

Example:

```text
Step 1 of 7
Step 2 of 7
Step 3 of 7
...
Step 7 of 7
```

Progress indicators should:

- Reflect actual assessment progress
- Remain understandable with screen readers
- Avoid relying solely on color
- Update predictably when navigating backward or forward

The interface should not display misleading progress percentages.

---

#### Assessment State

Assessment state may include:

- Current Step
- Completed Steps
- Selected Responses
- Optional Skipped Responses
- Review Status
- Assessment Completion Status

Each response should have one authoritative source within the assessment state.

Temporary UI state should remain separate from persisted assessment data.

---

#### Save and Resume

Where practical, incomplete assessment progress should be preserved.

A simplified persistence flow is:

```text
Assessment Response
        ↓
Validation
        ↓
Local State Update
        ↓
Persist Draft
        ↓
Continue
```

If the application closes unexpectedly, users should be able to resume from an appropriate point rather than restarting the entire assessment.

Draft assessment data should be validated before restoration.

---

#### Navigation

The standard V1 flow is:

```text
Onboarding Introduction
          ↓
Personal Assessment
          ↓
Personalization Processing
          ↓
AI Productivity Profile
```

If AI processing is unavailable, the application should not become unusable.

A safe fallback should allow onboarding to continue using available user preferences and non-AI personalization where appropriate.

---

#### Completion Behavior

When the user confirms the Final Review:

```text
Final Review
      ↓
Validate Required Responses
      ↓
Save Assessment
      ↓
Mark Assessment Complete
      ↓
Begin Personalization
```

The application should only mark the Personal Assessment as complete after required V1 responses have been successfully validated and preserved.

Assessment completion alone should not imply consent to unrelated data processing.

---

#### Personalization Use

Assessment responses may be used to personalize appropriate Deep Focus features.

Examples may include:

- Suggested Focus Duration
- Suggested Break Duration
- Dashboard Priorities
- Reminder Preferences
- Focus Recommendations
- Relevant Productivity Insights

Personalization should remain understandable and should use only information relevant to the feature being personalized.

Users should be able to update important preferences later.

---

#### AI Use

If assessment responses are used for AI-assisted personalization, the application should:

- Send only information required for the requested AI operation
- Avoid transmitting unnecessary personal information
- Follow applicable user consent and privacy rules
- Validate AI-generated output
- Clearly distinguish AI-generated recommendations from user-provided information
- Continue functioning when AI services are unavailable

The interface should not describe AI as fully understanding the user.

AI-generated personalization should remain a recommendation layer rather than an authoritative judgment about the user.

---

#### Privacy

The Personal Assessment should follow data-minimization principles.

The application should:

- Request only information with a defined purpose
- Identify optional information clearly
- Avoid unnecessary sensitive questions
- Explain relevant personalization use
- Avoid collecting information solely for unspecified future use
- Protect stored assessment responses
- Allow important preferences to be updated later

Completing the assessment should not automatically authorize unrelated analytics, marketing, AI processing, or external data sharing.

---

#### Validation

Validation should occur before moving forward when a required response is missing or invalid.

Validation should:

- Explain what information is required
- Preserve existing responses
- Avoid technical error messages
- Keep the user on the relevant step
- Move focus appropriately for accessibility where supported

Example:

```text
Select at least one primary goal to continue.
```

Validation language should remain clear and supportive.

---

#### Loading States

Most assessment interactions should not require visible loading states.

Loading feedback may be required when:

- Persisting critical remote data
- Completing the assessment
- Preparing personalization
- Recovering saved assessment state

Loading states should not prevent users from reviewing already available local information unnecessarily.

---

#### Offline Behavior

The core Personal Assessment should remain usable offline whenever practical.

The application should:

- Store draft responses locally
- Allow users to continue through locally available questions
- Preserve incomplete assessment progress
- Defer optional remote synchronization
- Clearly communicate when an online-only personalization service is unavailable

Loss of connectivity should not automatically erase assessment progress.

---

#### Error Recovery

Possible failures include:

- Draft persistence failure
- Invalid stored assessment state
- Synchronization failure
- Personalization service unavailable
- Authentication session changes

The application should:

- Preserve user responses whenever possible
- Avoid silently losing completed answers
- Restore safe defaults only when necessary
- Provide understandable feedback
- Allow retry for recoverable failures
- Avoid incorrectly marking the assessment as complete

---

#### Accessibility

The Personal Assessment should:

- Support screen readers
- Maintain sufficient color contrast
- Support dynamic text sizing
- Maintain logical focus order
- Provide accessible labels for every input
- Clearly communicate selected states
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Avoid relying solely on color
- Respect reduced-motion accessibility settings

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Progress, validation errors, and selection changes should be communicated appropriately to assistive technologies.

---

#### Performance

The Personal Assessment should remain lightweight and responsive.

Implementation should:

- Avoid unnecessary network requests
- Keep transitions lightweight
- Persist responses efficiently
- Avoid repeated storage writes without value
- Load only required assessment resources
- Avoid blocking basic navigation on AI processing

The assessment should remain responsive on representative supported mobile devices.

---

#### Updating Assessment Information

Important assessment preferences should not become permanently fixed after onboarding.

Users should later be able to update relevant information through appropriate Profile or Settings experiences.

When a relevant preference changes:

```text
User Updates Preference
        ↓
Validate Change
        ↓
Save Updated Preference
        ↓
Refresh Relevant Personalization
```

Existing historical productivity data should not be silently rewritten simply because current preferences changed.

---

#### Future Improvements

Potential future enhancements include:

- Adaptive Questioning
- Optional AI-Generated Follow-Up Questions
- Voice-Assisted Assessment
- Goal-Specific Assessment Paths
- Improved Personalization Refinement
- Cross-Device Assessment Continuity
- Optional Integration with Approved External Data Sources

Wearable or health-related integrations should only be introduced through dedicated permission, privacy, and consent flows.

Future assessment expansion should avoid making onboarding unnecessarily long or intrusive.

---

### 9.10 AI Productivity Profile

#### Version Availability

V1 includes a basic assessment-based productivity profile.

Advanced AI-driven behavioral analysis, adaptive recommendations, predictive insights, and long-term personalization are Future Enhancements.

---

#### Purpose

The AI Productivity Profile transforms relevant Personal Assessment responses into a clear and useful personalization summary.

In V1, the profile should primarily reflect information provided directly by the user and recommendations derived from approved personalization rules or available AI-assisted processing.

The profile should help users understand how Deep Focus intends to personalize their experience without presenting uncertain predictions or limited onboarding data as established facts.

As sufficient behavioral data becomes available in future versions, the profile may gradually incorporate additional evidence-based productivity insights.

---

#### User Goals

Users should be able to:

- Review their initial productivity profile
- Understand how their assessment responses influence personalization
- See useful starting recommendations
- Distinguish user-provided information from generated recommendations
- Understand that the profile may evolve over time
- Continue to the Home Dashboard
- Maintain control over personalized recommendations

---

#### Main Components

The V1 profile may contain:

- Profile Summary
- Primary Productivity Goal
- Focus Preference
- Preferred Focus Period
- Recommended Starting Session Length
- Common Distractions
- Recovery Preference
- Personalized Recommendation
- Personalization Explanation
- Edit Preferences Action
- Continue to Dashboard Button

Future versions may introduce additional components when sufficient supporting data exists.

---

#### Layout Structure

A V1 profile may use:

```text
────────────────────────────

     Your Profile Is Ready

      Focus Preference

      Structured Routine

   Preferred Focus Period

          Morning

 Recommended Starting Session

         45 Minutes

    Common Distraction

       Social Media

    Suggested Approach

 Start with a focused morning
 session and adjust the duration
 based on what works for you.

   Based on your assessment

      [ Continue ]

      Edit Preferences

────────────────────────────
```

The layout should acknowledge completion without exaggerating the accuracy or intelligence of the initial profile.

---

#### V1 Profile Model

The V1 profile should primarily use information collected during the Personal Assessment.

Possible profile fields include:

- Primary Goal
- Work or Study Preference
- Preferred Focus Time
- Preferred Session Duration
- Common Distractions
- Recovery Preferences
- Initial Focus Recommendation

The application should not claim that onboarding responses alone establish long-term behavioral patterns.

For example, if a user reports that they prefer working in the morning, the interface may display:

```text
Preferred Focus Period
Morning
```

It should not automatically transform that response into:

```text
Your Peak Productivity Hours
9:00 AM – 12:00 PM
```

unless sufficient supporting data exists.

---

#### Assessment-Based Information

Information directly provided by the user should be represented accurately.

Examples include:

```text
Your Preference
Morning Focus

Your Selected Goal
Improve Concentration

Common Distraction
Social Media
```

The interface should distinguish these values from system-generated recommendations.

---

#### Generated Recommendations

Deep Focus may generate initial recommendations using available assessment information.

Examples include:

- Suggested Starting Session Duration
- Suggested Break Pattern
- Suggested Focus Routine
- Relevant Distraction-Reduction Strategies
- Recommended Dashboard Priorities

Recommendations should be presented as suggestions rather than facts.

Preferred wording includes:

```text
Suggested Starting Session

45 Minutes
```

rather than:

```text
Your Perfect Session Length

45 Minutes
```

Recommendations should remain adjustable.

---

#### Recommendation Explanation

Where practical, generated recommendations should include a concise explanation.

Example:

```text
Suggested Starting Session
45 Minutes

Based on the focus duration and work style
you selected during your assessment.
```

Another example:

```text
Morning Focus Suggested

You selected morning as your preferred
focus period during onboarding.
```

This helps users understand where personalization comes from.

---

#### Productivity Score

A generalized Productivity Score should not be presented during the initial V1 profile unless the project defines:

- The inputs used to calculate it
- The calculation rules
- The minimum amount of required data
- The meaning of the score
- Appropriate validation and testing

Assessment answers alone should not be converted into an arbitrary productivity score.

If a Productivity Score is introduced later, it should be documented separately within the analytics and domain architecture.

---

#### Focus Style

A Focus Style may be displayed when it is based on clearly defined assessment rules.

Example:

```text
Focus Style

Structured Planner
```

If labels such as `Structured Planner` are used, Deep Focus should:

- Define how each label is assigned
- Avoid negative or judgmental labels
- Explain the label when appropriate
- Allow the underlying preferences to change
- Avoid presenting the label as a permanent personality classification

Focus Style should support personalization rather than categorize users unnecessarily.

---

#### Productivity Hours

V1 should distinguish between:

```text
Preferred Focus Period
```

and:

```text
Observed Productive Period
```

A preferred period may come directly from the Personal Assessment.

An observed productive period should require sufficient behavioral data.

Example:

```text
Preferred Focus Period
Morning
```

Future versions may display:

```text
Observed Focus Pattern
8:00 AM – 11:00 AM
```

only when sufficient session history supports the observation.

---

#### Common Distractions

Distractions reported during the assessment may be summarized.

Example:

```text
Common Distractions

Social Media
Notifications
```

The application should describe these as user-selected or reported information rather than automatically detected behavior.

Future behavioral features may provide additional observed distraction insights when appropriate permissions and supporting data exist.

---

#### Recovery Recommendations

V1 may provide general recovery suggestions based on user-selected preferences and focus configuration.

Recommendations should remain supportive and non-medical.

Examples include:

- Consider a short break after longer focus sessions
- Adjust session duration if concentration decreases
- Use intentional recovery periods between demanding sessions

The profile should not diagnose fatigue, burnout, or medical conditions.

---

#### Profile Generation Flow

A simplified V1 flow is:

```text
Personal Assessment
        ↓
Validate Responses
        ↓
Map Relevant Preferences
        ↓
Apply Personalization Rules
        ↓
Optional AI-Assisted Processing
        ↓
Validate Generated Output
        ↓
Create Initial Profile
        ↓
Display Profile
```

AI availability should not be required for basic profile creation.

A deterministic fallback should remain available when AI processing cannot be completed.

---

#### AI Processing State

If AI-assisted processing is used, the application may temporarily display:

```text
Preparing your personalized experience...
```

The processing state should:

- Remain brief where practical
- Avoid exaggerated claims
- Provide clear feedback
- Handle service failure gracefully
- Avoid blocking onboarding indefinitely

The interface should not use misleading messages implying complex analysis when only simple assessment mapping is occurring.

---

#### AI Unavailable Fallback

Deep Focus should remain usable if the AI service is unavailable.

A fallback flow may be:

```text
Assessment Complete
        ↓
AI Service Unavailable
        ↓
Generate Basic Profile
from Assessment Preferences
        ↓
Continue Onboarding
```

Users should not be prevented from reaching the Home Dashboard because an optional AI service failed.

Advanced recommendations may become available later when the service is restored.

---

#### Interaction Behavior

Users may:

- Review their profile
- Review recommendation explanations
- Expand supported insight details
- Edit relevant preferences
- Continue to the Home Dashboard

The screen should not require users to accept every recommendation before continuing.

---

#### Edit Preferences

Users should be able to correct relevant assessment information.

A simplified flow is:

```text
AI Productivity Profile
        ↓
Edit Preferences
        ↓
Relevant Assessment Step
        ↓
Save Changes
        ↓
Refresh Profile
```

Updating preferences should refresh affected recommendations without unnecessarily changing unrelated information.

---

#### Navigation

The standard V1 flow is:

```text
Personal Assessment
          ↓
AI Productivity Profile
          ↓
Home Dashboard
```

After successful completion:

```text
AI Productivity Profile
          ↓
Continue
          ↓
Mark Required Onboarding Complete
          ↓
Home Dashboard
```

The application should prevent duplicate onboarding completion operations.

---

#### Onboarding Completion

Reaching the AI Productivity Profile should not automatically mark onboarding as complete.

Onboarding should be marked complete only after the user successfully finishes the required final onboarding action.

A simplified flow is:

```text
Profile Displayed
      ↓
User Selects Continue
      ↓
Validate Required State
      ↓
Persist Onboarding Completion
      ↓
Home Dashboard
```

If persistence fails, the application should avoid creating inconsistent onboarding state.

---

#### Profile Evolution

The profile may evolve as users interact with Deep Focus.

Future personalization may incorporate appropriate information such as:

- Completed Focus Sessions
- Session Duration Patterns
- User-Reported Preferences
- Goal Progress
- Recovery Patterns
- Recommendation Feedback
- Time-Based Focus Patterns

Profile evolution should occur gradually and should not silently reinterpret limited data as reliable behavioral conclusions.

---

#### Confidence and Data Sufficiency

Future behavioral insights should only be displayed when sufficient supporting information exists.

When data is limited, the interface should communicate that limitation.

Examples include:

```text
Building your focus pattern

Complete more focus sessions to unlock
personalized timing insights.
```

or:

```text
Not enough data yet

We'll show this insight after enough
session history becomes available.
```

Deep Focus should prefer displaying no conclusion over displaying an unsupported conclusion.

---

#### User Control

Users should remain in control of personalization.

Where applicable, users should be able to:

- Update preferences
- Dismiss recommendations
- Ignore suggestions
- Disable optional AI-assisted features
- Review relevant personalization settings

AI recommendations should never automatically modify important goals, schedules, or account data without appropriate user action.

---

#### Transparency

The profile should clearly distinguish between:

- User-Provided Information
- Rule-Based Recommendations
- AI-Generated Recommendations
- Future Behavior-Based Insights

Where practical, the interface should explain why a recommendation exists.

Example:

```text
Why this recommendation?

You selected morning focus and shorter
sessions during your assessment.
```

Transparency should remain concise and understandable.

---

#### Privacy

The AI Productivity Profile should follow Deep Focus privacy and AI architecture rules.

The application should:

- Use only necessary personalization information
- Minimize information transmitted to external AI services
- Avoid transmitting unnecessary personal information
- Respect applicable user consent
- Protect stored profile information
- Avoid unnecessary AI conversation storage
- Allow relevant preferences to be updated

Assessment completion should not automatically authorize unrelated data collection or external processing.

---

#### AI Safety

Profile recommendations should:

- Encourage sustainable productivity
- Avoid promoting excessive working hours
- Avoid shame or judgment
- Avoid medical conclusions
- Avoid presenting uncertain predictions as facts
- Preserve user decision-making

Well-being should take priority over maximizing focus time.

---

#### Loading States

Loading feedback may be required while:

- Restoring profile data
- Generating optional recommendations
- Updating preferences
- Persisting onboarding completion

Existing profile information should remain visible where practical while non-critical recommendations refresh.

---

#### Error Handling

Possible failures include:

- Invalid assessment data
- Profile-generation failure
- AI service unavailable
- Network failure
- Persistence failure
- Invalid generated response

The application should:

- Preserve valid assessment information
- Fall back to basic personalization where possible
- Provide understandable feedback
- Allow retry for recoverable failures
- Avoid exposing technical provider errors
- Avoid blocking access to core Deep Focus functionality unnecessarily

---

#### Offline Behavior

Basic V1 profile generation should work offline where practical when required assessment information and personalization rules are available locally.

Offline behavior should:

- Preserve the assessment
- Generate available rule-based personalization
- Defer optional AI processing
- Allow onboarding to continue
- Synchronize appropriate data later

The application should clearly distinguish unavailable online insights from failed core functionality.

---

#### Visual Design

The AI Productivity Profile should:

- Follow the official Deep Focus Design System
- Use the AI Accent Color selectively
- Present information through clear cards or sections
- Maintain generous spacing
- Keep visual hierarchy simple
- Avoid excessive gradients or effects
- Support Light Mode and Dark Mode
- Celebrate onboarding completion subtly

AI visual styling should identify generated assistance without making it appear more authoritative than user-provided information.

---

#### Animation

The initial profile may use subtle animations such as:

- Gentle Fade In
- Progressive Card Appearance
- Lightweight Completion Feedback

Animations should not imply that more sophisticated analysis occurred than the system actually performed.

When reduced motion is enabled, equivalent information should appear with minimal or no animation.

---

#### Accessibility

The AI Productivity Profile should:

- Support screen readers
- Maintain sufficient color contrast
- Support dynamic text sizing
- Maintain logical focus order
- Provide descriptive accessibility labels
- Provide textual explanations for important visual information
- Avoid relying solely on color
- Support keyboard navigation where applicable
- Provide sufficiently large touch targets
- Respect reduced-motion accessibility settings

Important profile information should remain understandable without animation, icons, or decorative graphics.

---

#### Performance

The profile experience should remain responsive.

Implementation should:

- Avoid unnecessary AI requests
- Cache reusable recommendations where appropriate
- Avoid regenerating unchanged profile information
- Keep animations lightweight
- Avoid blocking navigation on non-essential processing
- Load core profile information before optional enhancements where practical

AI processing should not reduce the responsiveness of the onboarding experience.

---

#### Future Improvements

Future versions may introduce:

- Behavioral Pattern Learning
- Evidence-Based Focus Timing Insights
- Adaptive Focus Recommendations
- Recommendation Feedback Learning
- Calendar-Assisted Planning
- Cross-Device Productivity Analysis
- AI-Generated Weekly Coaching Summaries
- Optional Wearable-Assisted Insights
- Long-Term Productivity Pattern Analysis

Predictive features such as burnout-risk estimation or real-time productivity prediction should only be introduced after their inputs, limitations, safety requirements, privacy implications, and validation methods are clearly defined.

Future intelligence should improve personalization without reducing transparency or user control.

---

### 9.11 Home Dashboard

#### Version Availability

✅ V1 (Core Features)

V1 provides the core daily dashboard experience using available user preferences, focus-session data, goals, and supported personalization.

Advanced behavioral insights, adaptive AI recommendations, external integrations, and predictive features are Future Enhancements.

---

#### Purpose

The Home Dashboard serves as the primary daily entry point of Deep Focus.

Its purpose is to help users quickly understand their current focus progress, identify the next useful action, and begin or continue meaningful work with minimal friction.

Rather than overwhelming users with statistics or recommendations, the dashboard should prioritize the most relevant information for the current moment.

The experience should remain calm, focused, and easy to scan.

---

#### User Goals

Users should be able to:

- Understand today's focus progress
- Start a focus session quickly
- Review today's focus goal
- View relevant recommendations
- Review recent focus activity
- Monitor consistency
- Access important application areas
- Continue unfinished work where supported

---

#### Main Components

The V1 Home Dashboard may include:

- Personalized Welcome Header
- Primary Recommendation Card
- Today's Focus Goal
- Start Focus Session Button
- Daily Progress
- Current Streak
- Recent Session Summary
- Quick Actions
- Bottom Navigation

Optional components may appear only when the required feature and supporting data are available.

---

#### Layout Structure

A typical V1 dashboard may use:

```text
────────────────────────────

👋 Good Morning, Alex

Ready for your next focus session?

────────────────────────────

Suggested Next Step

Start with a 45-minute
focus session.

Based on your current
focus preferences.

[ Start Focus Session ]

────────────────────────────

Today's Focus Goal

████████░░ 80%

2h 40m / 3h

────────────────────────────

Current Streak

12 Days

────────────────────────────

Today's Progress

Focus Time
2h 40m

Sessions Completed
3

────────────────────────────

Recent Session

45 Minutes

Completed

[ View Details ]

────────────────────────────

Quick Actions

Start Focus
View Analytics
View Goals

────────────────────────────

Bottom Navigation

Home | Focus | Analytics | Rewards | Profile

────────────────────────────
```

The exact content should adapt to available data without creating unnecessary visual density.

---

#### Dashboard Information Hierarchy

Dashboard information should generally follow this priority:

1. Active or Recoverable Focus Session
2. Important Recovery or Safety Guidance
3. Primary Focus Action
4. Today's Focus Goal
5. Relevant Recommendation
6. Daily Progress
7. Current Streak
8. Recent Activity
9. Secondary Actions

The dashboard should not give every card equal visual importance.

The most useful current action should remain easy to identify.

---

#### Personalized Welcome

The dashboard may greet users according to the current local time.

Examples include:

```text
Good Morning, Alex
```

```text
Good Afternoon, Alex
```

```text
Good Evening, Alex
```

The greeting should remain brief and should not create unnecessary interruption.

If the user's preferred display name is unavailable, a generic greeting should be used.

Example:

```text
Good Morning
```

---

#### Primary Recommendation

The Primary Recommendation Card displays the most relevant supported suggestion available to the user.

In V1, recommendations may use information such as:

- User-selected preferences
- Today's focus goal
- Current session state
- Recent completed sessions
- Recovery configuration
- Available profile information

Examples include:

```text
Suggested Next Step

Start with a 45-minute focus session.

Based on the session duration selected
in your preferences.
```

or:

```text
Today's Goal Is Almost Complete

30 minutes remain in your daily
focus goal.
```

Recommendations should be presented as suggestions rather than commands.

---

#### Recommendation Accuracy

The dashboard should not present unsupported behavioral conclusions as facts.

For example:

```text
Your energy is highest right now.
```

should only be displayed if Deep Focus has a defined, validated, and sufficiently supported mechanism for determining current energy.

Otherwise, V1 should use wording such as:

```text
Morning Focus Suggested

You selected morning as your preferred
focus period.
```

or:

```text
Ready for another session?

Your preferred session length is
45 minutes.
```

The interface should clearly distinguish user preferences from observed behavioral insights.

---

#### Recommendation Priority

When multiple recommendations are available, priority should generally follow:

1. Recovery or Safety Guidance
2. Active Session Recovery
3. Today's Focus Goal
4. Focus Session Recommendation
5. Goal Progress
6. General Productivity Suggestion
7. Motivation or Reward Information

Productivity optimization should never override meaningful recovery guidance.

---

#### Today's Focus Goal

The dashboard should display the user's current daily focus target when configured.

Information may include:

- Daily Target
- Completed Focus Time
- Remaining Focus Time
- Progress Percentage

Example:

```text
Today's Focus Goal

2h 40m / 3h

80% Complete
```

Progress should be calculated from valid completed focus-session data according to domain rules.

If no daily goal exists, the dashboard may provide a lightweight setup action.

Example:

```text
Set a Daily Focus Goal

Create a simple target to track
your daily progress.

[ Set Goal ]
```

---

#### Start Focus Session

Starting a focus session should remain one of the most prominent dashboard actions.

The primary action may display:

```text
Start Focus Session
```

If appropriate session preferences already exist, Deep Focus may provide a faster action such as:

```text
Start 45-Minute Session
```

Selecting the action should navigate to session setup or begin an approved quick-start flow.

The application should prevent multiple active focus sessions from being created simultaneously.

---

#### Active Session State

If a focus session is currently active, the dashboard should prioritize the active session instead of displaying a normal Start Focus Session action.

Example:

```text
Focus Session Active

32 Minutes Remaining

[ Return to Session ]
```

The dashboard should not allow another focus session to begin while an active session exists.

---

#### Recoverable Session State

If an unfinished session is detected after application restart or interruption, recovery should receive high priority.

Example:

```text
Session Available to Restore

We found an unfinished focus session.

[ Restore Session ]
```

The session should be validated before restoration.

Invalid or corrupted session information should not be presented as an active session.

---

#### Daily Progress

The dashboard may provide a concise summary of today's validated activity.

V1 metrics may include:

- Focus Time
- Sessions Completed
- Goal Progress

Example:

```text
Today's Progress

Focus Time
2h 40m

Sessions Completed
3
```

The dashboard should avoid displaying metrics that cannot be measured reliably.

---

#### Productivity Score

A generalized Productivity Score should not appear on the V1 dashboard unless its calculation model has been explicitly defined and validated.

If introduced later, the score should have:

- Defined inputs
- Defined calculation rules
- Minimum data requirements
- Clear user-facing meaning
- Appropriate validation
- Documented limitations

The dashboard should prefer understandable metrics over arbitrary composite scores.

---

#### Distraction Metrics

Metrics such as:

```text
Distractions Avoided
```

should only be displayed when Deep Focus has a reliable and appropriately permissioned method for measuring them.

The application should not estimate or invent distraction counts.

Where distraction-protection functionality exists, more precise labels should be preferred.

Examples may include:

```text
Blocked Attempts
```

or:

```text
Interrupted Sessions
```

only when those events are actually recorded.

---

#### Current Streak

The Current Streak component displays validated consistency progress.

It may include:

- Current Streak
- Longest Streak
- Relevant Streak Status

Example:

```text
Current Streak

12 Days
```

Streak calculations should follow documented domain rules.

The interface should encourage consistency without creating guilt when a streak ends.

---

#### Recent Activity

The dashboard should display a concise summary of recent relevant activity.

Example:

```text
Recent Session

45 Minutes

Completed Today

[ View Details ]
```

The dashboard should avoid displaying excessive session history.

Detailed historical information belongs in the appropriate history or analytics experience.

---

#### Upcoming Tasks

Upcoming Tasks should appear only if task management is included in the implemented product scope.

If available, the section may display a small number of relevant tasks.

Example:

```text
Upcoming Tasks

Complete UI Design
Review Architecture
Prepare Study Notes
```

The dashboard should not become a full task-management interface.

External task integrations should remain separate Future Enhancements until their integration architecture and permissions are defined.

---

#### Quick Actions

Quick Actions should provide access to frequently used functionality.

V1 actions may include:

- Start Focus Session
- View Analytics
- View Goals
- View Rewards

Only implemented and relevant actions should be displayed.

The number of Quick Actions should remain limited to avoid visual clutter.

---

#### AI Quick Access

AI should remain contextual rather than becoming a dominant dashboard element.

Where supported, users may access additional information through actions such as:

```text
Why this recommendation?
```

or:

```text
View Insight
```

A generic `Ask AI Assistant` action should only appear if the corresponding AI interaction experience has been defined and implemented.

---

#### Empty State

New users may not yet have focus history or meaningful dashboard data.

The dashboard should remain useful in this state.

Example:

```text
Ready for Your First Focus Session?

Start a session to begin building
your focus history.

[ Start Focus Session ]
```

Secondary sections with no meaningful information may remain hidden rather than displaying multiple empty cards.

---

#### Loading State

During dashboard initialization, the interface should:

- Restore required local state
- Load relevant persisted information
- Display lightweight loading placeholders
- Avoid blocking available actions unnecessarily

Skeleton components may be used for sections that are still loading.

The entire dashboard should not remain blocked because a non-essential remote service is unavailable.

---

#### Offline State

The Home Dashboard should remain useful without an internet connection.

Core offline functionality should include access to available:

- Focus Session Controls
- Daily Goal Progress
- Local Focus History
- Current Streak Data
- Stored Preferences

Remote-only information may display an appropriate unavailable or stale state.

Example:

```text
You're Offline

Your local focus data is still available.
Online insights will update when your
connection returns.
```

Core focus functionality should not depend on AI or cloud availability.

---

#### AI Unavailable State

If AI functionality is unavailable, the dashboard should continue operating normally.

The application may:

- Display rule-based recommendations
- Use locally available preferences
- Hide unavailable AI-specific content
- Allow retry later

The dashboard should never become unusable because an AI provider cannot be reached.

---

#### Refresh Behavior

Dashboard information should refresh when relevant events occur.

Examples include:

- Focus Session Completed
- Goal Updated
- Session Restored
- Streak Updated
- Application Returned to Foreground
- Synchronization Completed
- User Preferences Changed

The application should update only affected sections where practical rather than unnecessarily rebuilding the entire dashboard.

---

#### Data Sources

Dashboard sections should obtain information through the appropriate application and repository interfaces.

A simplified flow is:

```text
Home Dashboard
      ↓
Dashboard Hook / Controller
      ↓
Application Services
      ↓
Repositories / Use Cases
      ↓
Domain Models
      ↓
Dashboard View State
```

The screen should not directly access:

- Async Storage
- Secure Storage
- Firebase
- External AI APIs
- Device services

This preserves architectural boundaries.

---

#### Dashboard View State

The dashboard should receive a presentation-friendly view state.

A conceptual state may contain:

```text
Dashboard State

├── Greeting
├── Session State
├── Primary Action
├── Recommendation
├── Daily Goal
├── Daily Progress
├── Streak
├── Recent Activity
├── Connectivity State
└── Loading / Error States
```

The Presentation Layer should focus on rendering this state and forwarding user actions.

---

#### Interaction Behavior

Users may:

- Start or return to a focus session
- Restore an interrupted session
- Review today's progress
- View relevant recommendations
- Open analytics
- View goals
- View rewards
- Open profile
- Navigate through primary destinations

Interactions should provide immediate feedback.

Duplicate actions should be prevented where necessary.

---

#### Navigation

The onboarding flow reaches the dashboard through:

```text
Authentication
        ↓
Onboarding
        ↓
Personal Assessment
        ↓
AI Productivity Profile
        ↓
Home Dashboard
```

For returning authenticated users:

```text
Application Launch
        ↓
Session Restoration
        ↓
Home Dashboard
```

The Home Dashboard serves as the default primary destination when no higher-priority recovery workflow requires attention.

---

#### Bottom Navigation

The Home Dashboard should use the primary Bottom Navigation Bar defined by the Navigation specification.

Primary destinations are:

```text
Home | Focus | Analytics | Rewards | Profile
```

`Home` should appear as the active destination.

The navigation bar should follow all established accessibility, sizing, active-state, and interaction rules.

---

#### Visual Design

The Home Dashboard should:

- Follow the Deep Focus Design System
- Use a clear card-based hierarchy
- Maintain generous spacing
- Keep the primary action visually obvious
- Avoid excessive information density
- Support Light Mode and Dark Mode
- Use AI Accent styling only for genuine AI-related content
- Avoid unnecessary decorative elements
- Remain calm and easy to scan

The dashboard should feel useful without feeling busy.

---

#### Animation

Dashboard animations may include:

- Gentle Card Fade In
- Progress Indicator Animation
- Lightweight State Transitions
- Subtle Press Feedback

Animations should remain short and purposeful.

Frequently changing metrics should not trigger distracting repeated animations.

Reduced-motion preferences must be respected.

---

#### Accessibility

The Home Dashboard should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Maintain logical reading and focus order
- Provide descriptive accessibility labels
- Use sufficiently large touch targets
- Avoid relying solely on color
- Provide textual alternatives for progress indicators
- Support keyboard navigation where applicable
- Respect reduced-motion accessibility settings

Dashboard information should remain understandable without animation or decorative graphics.

---

#### Performance

The Home Dashboard should remain lightweight because it is one of the most frequently accessed screens.

Implementation should:

- Avoid unnecessary re-renders
- Subscribe only to required state
- Avoid repeated AI requests
- Cache appropriate information
- Load local information quickly
- Defer non-essential remote requests
- Avoid unnecessary storage reads
- Update individual sections efficiently
- Keep animations lightweight

The dashboard should prioritize immediate access to core focus functionality.

---

#### Privacy

The dashboard should display only information appropriate for the current authenticated user.

It should:

- Avoid exposing sensitive information unnecessarily
- Minimize AI context transmission
- Respect analytics and personalization preferences
- Avoid unnecessary external requests
- Follow Deep Focus logging and privacy rules

Personal productivity information should remain under user control.

---

#### Error Handling

Possible dashboard failures include:

- Local data loading failure
- Synchronization failure
- AI recommendation failure
- Invalid session state
- Analytics loading failure

Failures should be isolated where practical.

For example, an AI recommendation failure should not prevent users from starting a focus session.

The interface should provide meaningful recovery actions such as:

- Retry
- Continue Offline
- Refresh

Technical error details should not be displayed directly to users.

---

#### Future Improvements

Future versions may introduce:

- Adaptive Dashboard Prioritization
- Evidence-Based Behavioral Insights
- Context-Aware Recommendations
- Calendar Integration
- Smart Scheduling
- Cross-Device Synchronization
- Wearable-Assisted Insights
- Advanced Recovery Guidance
- Personalized Dashboard Layouts
- Voice Interaction
- External Task Integrations
- Calendar-Based Focus Suggestions

Potential external integrations may include services such as Google Calendar, Microsoft Outlook, Apple Calendar, Notion, Trello, ClickUp, and Jira.

Health or wearable integrations should only be introduced after appropriate permission, privacy, platform, and data-handling requirements are defined.

Future dashboard intelligence should improve relevance without increasing unnecessary complexity or reducing user control.

---

### 9.12 Focus Session

#### Version Availability

✅ V1 (Core Features)

V1 provides the core focus-session experience, including reliable session timing, pause and resume behavior, session persistence, background recovery, optional sound controls, and session completion.

Advanced adaptive coaching, live AI recommendations, distraction detection, and intelligent session optimization are Future Enhancements.

---

#### Purpose

The Focus Session is the core experience of Deep Focus.

Its purpose is to provide users with a calm, distraction-free environment that supports sustained attention, meaningful work, and healthy productivity habits.

The Focus Session should prioritize reliability, timing accuracy, minimal interaction, and preservation of user progress.

Rather than functioning only as a visual countdown timer, the experience should provide a focused workspace that remains predictable during interruptions, background transitions, and temporary connectivity loss.

---

#### User Goals

Users should be able to:

- Begin a planned focus session
- Maintain concentration with minimal distraction
- Understand remaining session time
- Monitor session progress
- Pause when necessary
- Resume accurately
- End or cancel a session intentionally
- Recover an interrupted session
- Complete the planned focus period
- Continue into an optional recovery break

---

#### Main Components

The V1 Focus Session may include:

- Session Title
- Circular Focus Timer
- Remaining Time Display
- Session Progress Ring
- Current Task or Goal
- Focus Mode Status
- Background Sound Controls
- Pause / Resume Control
- End Session Control
- Session State Indicator
- Optional Minimal Guidance

Only essential controls should remain visible during an active focus session.

---

#### Layout Structure

A typical active Focus Session may use:

```text
────────────────────────────

        Deep Focus

       Current Task

      Design UI System


        ◜────────◝
       │  24:35   │
        ◟────────◞

       51% Complete


       Focus Mode

       Deep Focus


       Rain Sounds

     [ Pause Session ]

       End Session

────────────────────────────
```

The exact layout may adapt according to session configuration and available features.

The timer and current task should remain the primary visual elements.

---

#### Information Hierarchy

Focus Session information should generally follow this priority:

1. Remaining Time
2. Current Task or Session Goal
3. Session Progress
4. Current Session State
5. Focus Mode
6. Essential Session Controls
7. Optional Sound Controls
8. Optional Supporting Guidance

Secondary information should never compete visually with the timer or current task.

---

#### Visual Design

The Focus Session should:

- Use a large and readable timer
- Use a calm circular progress indicator
- Minimize unnecessary interface elements
- Maintain generous spacing
- Use subtle visual feedback
- Avoid excessive animations
- Reduce visual intensity during long sessions
- Support Light Mode and Dark Mode
- Maintain a distraction-free atmosphere

The screen should feel noticeably simpler than the Home Dashboard.

---

#### Session States

The Focus Session should support clearly defined states.

```text
Preparing
    ↓
Ready
    ↓
Running
    ↓
Paused
    ↓
Running
    ↓
Completed
```

Alternative transitions may include:

```text
Ready
   ↓
Cancelled
```

```text
Running
   ↓
Cancelled
```

or:

```text
Running
   ↓
Interrupted
   ↓
Recovered
   ↓
Running
```

Only valid state transitions should be allowed.

---

#### Preparing State

The Preparing state occurs while required session information and resources are being initialized.

The application may:

- Validate session configuration
- Create the session record
- Restore required preferences
- Prepare notification scheduling
- Prepare optional background audio
- Validate required permissions

The Preparing state should remain brief.

If preparation fails, the application should provide a clear recovery action instead of entering an invalid Running state.

---

#### Ready State

The Ready state confirms that the session is prepared but has not yet started.

It may display:

- Session Duration
- Current Task
- Focus Mode
- Background Sound
- Break Configuration

The user should have a clear action such as:

```text
[ Start Session ]
```

The timer should not begin until the session officially enters the Running state.

---

#### Running State

The Running state represents an active focus session.

During this state, the interface should prioritize:

- Remaining Time
- Current Task
- Session Progress
- Focus Mode
- Pause Control
- End Session Control

Unnecessary navigation and secondary actions should be reduced.

---

#### Session Timing

Session timing should remain accurate regardless of UI rendering frequency.

The timer should use timestamps and calculated elapsed time rather than relying only on repeated countdown callbacks.

A simplified timing model is:

```text
Session Start Timestamp
        ↓
Current Timestamp
        ↓
Elapsed Duration
        ↓
Pause Adjustment
        ↓
Remaining Duration
```

This approach should help prevent timer drift and support reliable background recovery.

---

#### Timer Rendering

The visual timer may update regularly for user readability, but UI rendering frequency should not become the authoritative source of session time.

The application should:

- Calculate time from authoritative timestamps
- Avoid unnecessary global state updates every second
- Update only required timer-related components
- Recalculate accurately after foreground restoration

Timer accuracy should take priority over animation frequency.

---

#### Session Progress

Session progress should communicate how much of the planned focus period has been completed.

It may be represented using:

- Circular Progress Ring
- Percentage
- Remaining Time

Example:

```text
24:35 Remaining

51% Complete
```

Progress should be derived from validated session timing data.

---

#### Current Task

If the session has an associated task or goal, it should remain visible without dominating the screen.

Example:

```text
Current Task

Design UI System
```

If no task is selected, the session should remain fully usable without requiring one.

---

#### Focus Mode Status

The active Focus Mode should be displayed clearly where supported.

Possible modes may include:

- Soft Shield
- Deep Focus Shield
- God Mode

Only modes that are actually implemented and supported on the current platform should be displayed.

Platform limitations should be handled gracefully.

---

#### Pause Behavior

Users should be able to pause a session when the active configuration permits it.

When Pause is selected, the application should:

- Record the pause timestamp
- Preserve completed focus time
- Preserve remaining duration
- Change the session state to Paused
- Prevent the timer from continuing incorrectly
- Update persistence where required

The interface should clearly indicate that the session is paused.

Example:

```text
Session Paused

24:35 Remaining

[ Resume Session ]

End Session
```

---

#### Resume Behavior

When the user resumes a paused session, the application should:

- Validate the current session state
- Record the resume timestamp
- Account for paused duration
- Restore the Running state
- Continue from the correct remaining duration

Resuming should never reset previously completed progress.

---

#### End Session

Users should be able to intentionally end an active session.

Because ending a session may affect progress, statistics, and rewards, confirmation should be required where appropriate.

Example:

```text
End Focus Session?

Your planned focus period has not
been completed.

[ Continue Focusing ]

[ End Session ]
```

The application should clearly distinguish an intentionally ended or cancelled session from a successfully completed session.

---

#### Session Cancellation

If a session is cancelled before successful completion, the application should:

- Stop active timing safely
- Cancel unnecessary scheduled operations
- Release temporary resources
- Preserve useful partial information where appropriate
- Mark the session as Cancelled
- Avoid recording it as successfully completed

Cancelled sessions should not incorrectly contribute to completed-session statistics or rewards.

---

#### Session Completion

A session should be marked Completed only after the required focus duration has been successfully reached according to domain rules.

When completion occurs, the application should:

- Stop active timing
- Validate session completion
- Persist the completed session
- Update eligible statistics
- Update streak information
- Update eligible rewards
- Cancel obsolete notifications
- Release temporary resources
- Provide completion feedback

The completion process should avoid creating duplicate session records.

---

#### Completion Flow

A typical successful flow is:

```text
Focus Session
      ↓
Required Duration Reached
      ↓
Completion Validation
      ↓
Session Saved
      ↓
Statistics / Rewards Updated
      ↓
Optional True Zen Break
      ↓
Session Summary
```

If breaks are disabled, the user may proceed directly to the Session Summary.

---

#### Background Behavior

The Focus Session should remain accurate when Deep Focus moves into the background.

The application should not assume that continuous background execution is available.

Instead, it should:

- Preserve session timestamps
- Persist required session state
- Schedule supported notifications
- Avoid unnecessary background processing
- Restore the correct remaining duration when reopened
- Respect operating-system background restrictions

The timer should not depend on continuous JavaScript execution while the application is backgrounded.

---

#### Foreground Recovery

When Deep Focus returns to the foreground during an active session, the application should:

1. Load the authoritative session state
2. Read the relevant timestamps
3. Calculate elapsed time
4. Apply pause information where necessary
5. Determine the correct remaining duration
6. Validate whether the session has already completed
7. Restore the appropriate UI state

The application should not simply continue from the last displayed timer value.

---

#### Session Persistence

Important active-session information should be persisted safely.

Persisted information may include:

- Session ID
- Session State
- Planned Duration
- Start Timestamp
- Pause Timestamp
- Accumulated Pause Duration
- Current Task or Goal Reference
- Focus Mode
- Break Configuration
- Sound Configuration where required

Only information required for reliable restoration should be persisted.

---

#### Unexpected Application Closure

If Deep Focus closes unexpectedly during an active session, the application should attempt to recover the session when reopened.

A simplified recovery flow is:

```text
Application Launch
       ↓
Detect Unfinished Session
       ↓
Validate Persisted Data
       ↓
Calculate Current Session State
       ↓
Restore or Safely Recover
```

Corrupted or invalid session information should never create duplicate or impossible session states.

---

#### Interrupted State

The Interrupted state may be used when normal session continuity cannot be guaranteed.

Possible causes include:

- Invalid persisted session state
- Required permission changes
- Unexpected platform interruption
- Recoverable storage issue

The interface should clearly explain available recovery options.

Technical implementation details should not be exposed directly to users.

---

#### Background Sounds

Background sound should remain optional.

When enabled, lightweight controls may include:

- Play
- Pause
- Volume
- Sound Selection

Sound controls should remain visually secondary to focus controls.

Audio should stop or release resources appropriately when the session ends.

---

#### Notifications

Focus Session notifications may include:

- Session Completion
- Break Start
- Break Ending Soon

Notifications should:

- Respect user preferences
- Avoid excessive frequency
- Avoid interrupting active focus unnecessarily
- Use platform-supported scheduling
- Be cancelled or updated when session state changes

Notification failure should not invalidate an otherwise functional focus session.

---

#### AI Guidance

AI should not be required for V1 Focus Session operation.

V1 may provide lightweight guidance using approved static or rule-based content.

Example:

```text
Focus Tip

Stay with one task until the
session is complete.
```

Such content should not be presented as AI-generated unless it was actually generated by an AI service.

---

#### Live AI Coaching

Live AI coaching is a Future Enhancement.

If introduced later, it should:

- Remain optional
- Avoid unnecessary interruptions
- Respect privacy preferences
- Minimize API requests
- Avoid sending unnecessary session data
- Never automatically modify session state
- Never interrupt active focus unless explicitly enabled

The Focus Session must remain fully functional when AI services are unavailable.

---

#### Offline Behavior

Core Focus Session functionality should work without an internet connection.

Offline functionality should include:

- Session Timing
- Pause and Resume
- Session Progress
- Session Persistence
- Local Completion
- Available Local Sounds
- Session Recovery

Remote synchronization and AI functionality may resume when connectivity returns.

---

#### Error Handling

Possible Focus Session failures include:

- Storage Failure
- Notification Failure
- Audio Failure
- Invalid Session State
- Persistence Failure
- Background Recovery Failure

Errors should be isolated where practical.

For example, an audio failure should not terminate an otherwise valid focus session.

The application should preserve user progress whenever possible.

---

#### Performance

The Focus Session is a long-running experience and should remain lightweight.

Implementation should:

- Avoid unnecessary re-renders
- Avoid global timer updates every second
- Use timestamp-based calculations
- Minimize background processing
- Limit unnecessary storage writes
- Keep animations lightweight
- Reduce battery consumption
- Release audio and temporary resources correctly

The timer should remain accurate without requiring excessive processing.

---

#### Battery Efficiency

During long focus sessions, the application should:

- Avoid continuous unnecessary background work
- Avoid excessive timer callbacks
- Limit network activity
- Avoid unnecessary AI requests
- Reduce non-essential animations
- Avoid repeated persistence writes without meaningful state changes

Battery-intensive behavior should only be introduced when it provides clear user value.

---

#### Navigation

A standard session flow is:

```text
Home Dashboard
        ↓
Session Setup
        ↓
Focus Session
        ↓
Session Completed
        ↓
True Zen Break
        ↓
Session Summary
```

If breaks are disabled:

```text
Focus Session
        ↓
Session Completed
        ↓
Session Summary
```

If the session is cancelled:

```text
Focus Session
        ↓
Cancellation Confirmation
        ↓
Session Cancelled
        ↓
Previous Screen
```

---

#### Navigation Restrictions

During an active Focus Session:

- Unnecessary navigation should be reduced
- Accidental exits should be prevented
- Critical exit actions should require confirmation where appropriate
- Navigation should not destroy session state
- Returning from background should restore the active session

The user should never lose focus progress simply because they navigated away or minimized the application.

---

#### Accessibility

The Focus Session should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Provide large touch targets
- Provide descriptive accessibility labels
- Avoid flashing visual effects
- Avoid relying solely on color
- Provide textual timer information
- Respect reduced-motion preferences
- Keep essential controls accessible during all session states

The timer should remain understandable without relying solely on the circular progress visualization.

---

#### Privacy

Focus Session information belongs to the user.

The application should:

- Store only required session information
- Avoid unnecessary cloud transmission
- Avoid sending session context to AI without a valid reason
- Respect user privacy preferences
- Protect sensitive productivity information
- Allow session history deletion according to application data controls

Core session operation should not require unnecessary external data sharing.

---

#### Future Improvements

Future versions may include:

- Adaptive Session Length
- Personalized Focus Recommendations
- AI-Powered Optional Coaching
- Smart Break Recommendations
- Advanced Distraction Protection
- Supported Distraction Detection
- Cross-Device Session Synchronization
- Wearable Integration
- Voice-Guided Focus Sessions
- Adaptive Soundscapes
- Calendar-Aware Session Suggestions
- Context-Aware Focus Modes

Future functionality should preserve the reliability, privacy, accessibility, and distraction-free nature of the core Focus Session experience.

---

### 9.13 True Zen Break

#### Version Availability

✅ V1 (Basic Recovery Experience)

V1 provides a simple recovery experience with a configurable break timer and basic recovery suggestions.

Personalized AI-powered recovery recommendations, adaptive break duration, wearable-assisted insights, and advanced guided recovery experiences are Future Enhancements.

---

#### Purpose

The True Zen Break helps users pause intentionally after a completed focus session and create space for mental and physical recovery before continuing with additional work.

Rather than functioning only as a countdown timer, the experience may provide simple recovery guidance such as hydration, stretching, breathing, or stepping away from the screen.

The recovery experience should remain calm, optional, supportive, and easy to leave when necessary.

Deep Focus should encourage sustainable work patterns without presenting the break experience as medical treatment or claiming that it prevents specific health conditions.

---

#### User Goals

Users should be able to:

- Take an intentional break after focused work
- Understand the suggested break duration
- Follow a simple optional recovery activity
- End or skip the break when necessary
- Continue to the Session Summary
- Begin another session later when appropriate
- Maintain sustainable focus and recovery habits

---

#### Main Components

The V1 True Zen Break may include:

- Recovery Illustration
- Recovery Heading
- Short Recovery Message
- Break Timer
- Suggested Recovery Activity
- Break Progress Indicator
- End Break / Skip Break Action
- Continue to Session Summary Action
- Optional Sound Controls where supported

A `Start Next Session` action should not become the dominant action during the recovery experience.

---

#### Layout Structure

A typical V1 recovery screen may use:

```text
────────────────────────────

       🌿 Time to Recharge

 You completed your focus session.

 Take a few minutes away from
 the screen if that feels useful.

          05:00

     Suggested Activity

      Take a Short Walk

    [ End Break Early ]

────────────────────────────
```

When the break finishes:

```text
────────────────────────────

       Break Complete

 Take a moment to notice
 how you feel before continuing.

   [ View Session Summary ]

────────────────────────────
```

The interface should remain visually calm and significantly less stimulating than the active Focus Session.

---

#### Recovery Information Hierarchy

The True Zen Break should generally prioritize:

1. Break Time Remaining
2. Recovery Activity
3. Calm Supporting Guidance
4. Essential Controls
5. Optional Secondary Information

Gamification, analytics, and AI content should not visually dominate the recovery experience.

---

#### Recovery Activities

V1 may provide a small set of simple, non-medical recovery suggestions.

Possible activities include:

- Take a Short Walk
- Drink Water
- Look Away from the Screen
- Gentle Stretching
- Slow Breathing
- Sit Quietly for a Few Minutes

The activity should be presented as an optional suggestion.

For example:

```text
Suggested Activity

Look away from the screen and
focus on something farther away
for a few moments.
```

Users should not be told that completing a specific activity will guarantee improved productivity or health.

---

#### V1 Recovery Selection

V1 may choose a recovery activity using:

- User-selected preferences
- Break configuration
- Simple deterministic rules
- A rotating approved activity list

AI should not be required for V1 recovery suggestions.

The experience should remain functional when AI services are unavailable.

---

#### Future Personalized Recovery

Future versions may personalize recovery using appropriate and consented information such as:

- Recent focus duration
- Consecutive session patterns
- User-reported energy
- User-selected recovery preferences
- Time of day
- Recent break history

Future recommendations should remain explainable and should not present inferred fatigue or well-being states as medical diagnoses.

---

#### Break Timer

The break timer should:

- Display remaining break time clearly
- Use the same reliable timing principles as the Focus Session
- Remain accurate after background transitions
- Avoid timer drift
- Recover correctly after temporary interruption
- Avoid unnecessary global re-renders

The timer should use timestamps or equivalent authoritative timing data rather than relying only on repeated UI countdown callbacks.

---

#### Break Timer States

The break experience may use states such as:

```text
Ready
  ↓
Running
  ↓
Completed
```

Alternative paths may include:

```text
Running
  ↓
Ended Early
```

or:

```text
Running
  ↓
Interrupted
  ↓
Recovered
```

Only valid transitions should be allowed.

---

#### Break Start

When the True Zen Break begins, the application should:

- Record the break start time
- Record the planned duration
- Persist required state
- Schedule supported completion notification where appropriate
- Start optional local sound where enabled

The break should begin only after an eligible completed session unless the product explicitly supports manually started recovery sessions.

---

#### End Break Early

Users should be able to end the break early when the workflow allows it.

An early end should:

- Stop the active break timer
- Preserve useful break information
- Mark the break appropriately
- Avoid presenting the break as fully completed when domain rules distinguish early termination
- Continue to the next appropriate destination

A confirmation dialog is not necessary for a routine early break exit unless there is a meaningful consequence.

---

#### Skip Behavior

If the break has not yet begun, users may be allowed to skip it.

Example:

```text
Start Recovery Break

[ Start Break ]

Skip for Now
```

Skipping should not:

- Shame the user
- Block access to the application
- Remove unrelated rewards or functionality
- Present the user as having failed

The experience should encourage recovery while preserving user autonomy.

---

#### Break Completion

When the timer reaches the planned duration, the application should:

- Validate completion
- Mark the break as completed
- Persist the completed state
- Cancel obsolete notifications
- Release temporary resources
- Provide calm completion feedback

A completed recovery break may contribute to relevant rewards or analytics according to documented domain rules.

---

#### Completion Feedback

Break completion feedback should remain subtle.

Example:

```text
Break Complete

You're ready to continue whenever
you choose.

[ View Session Summary ]
```

The interface should not immediately pressure users to begin another focus session.

---

#### Session Summary Navigation

The standard V1 flow is:

```text
Focus Session
      ↓
Session Completed
      ↓
True Zen Break
      ↓
Session Summary
```

If the break is skipped:

```text
Focus Session
      ↓
Session Completed
      ↓
Skip Break
      ↓
Session Summary
```

The user should not be forced into another focus session directly from the break screen.

---

#### Start Next Session

If a `Start Next Session` action is introduced, it should appear only after the break has ended or from the Session Summary.

It should remain secondary to:

- Completing recovery
- Reviewing the session
- Returning to Home
- Leaving the application

Deep Focus should not use recovery screens to push users into continuous work loops.

---

#### Navigation

The True Zen Break should normally be entered from a successfully completed Focus Session.

```text
Focus Session
      ↓
True Zen Break
```

The default exit destination is:

```text
True Zen Break
      ↓
Session Summary
```

Users may also return to an appropriate safe destination where product requirements allow it.

---

#### Background Behavior

The break should remain accurate if the application enters the background.

The application should:

- Preserve break timing information
- Avoid relying on continuous background execution
- Restore the correct remaining duration when reopened
- Schedule supported completion notifications
- Respect operating-system background restrictions

The timer should not depend on continuous JavaScript execution while the application is backgrounded.

---

#### Foreground Recovery

When the application returns to the foreground during an active break:

```text
Restore Break State
      ↓
Read Break Timestamps
      ↓
Calculate Elapsed Time
      ↓
Determine Remaining Duration
      ↓
Restore Running or Completed State
```

If the planned break duration has already passed, the application should restore the Completed state rather than restarting the break.

---

#### Persistence

Active recovery state may persist:

- Break ID
- Associated Session ID
- Break State
- Planned Duration
- Start Timestamp
- Selected Recovery Activity
- Optional Sound Configuration

Only information required for reliable recovery should be stored.

---

#### Unexpected Application Closure

If the application closes unexpectedly during a break, Deep Focus should attempt to restore the correct state when reopened.

A simplified flow is:

```text
Application Launch
      ↓
Detect Active Break
      ↓
Validate Stored Data
      ↓
Calculate Current Break State
      ↓
Restore or Complete
```

Invalid break data should not create duplicated or impossible recovery records.

---

#### Recovery Messages

Recovery messages should remain:

- Calm
- Supportive
- Concise
- Non-judgmental
- Non-medical
- Optional in tone

Avoid:

```text
You must recover now.
```

Prefer:

```text
A short break may help you reset before continuing.
```

Avoid:

```text
This break will prevent burnout.
```

Prefer:

```text
Regular breaks can support a more balanced work routine.
```

---

#### Health and Well-Being Language

The True Zen Break should not claim to:

- Diagnose fatigue
- Treat burnout
- Prevent medical conditions
- Measure physiological recovery
- Replace professional health guidance

Deep Focus may encourage general healthy work habits within its productivity scope.

Recovery guidance should remain informational and supportive.

---

#### Optional Reflection

After or near the end of a break, V1 may optionally allow a lightweight reflection such as:

```text
How is your energy now?

[ Higher ] [ Similar ] [ Lower ]
```

If implemented, this information should be clearly identified as self-reported.

Users should be able to skip the reflection.

It should not become a required step after every break.

---

#### Soundscape

Optional calming sounds may be available during the break.

Examples include:

- Rain
- Nature Sounds
- Soft Ambient Sound

Sound should:

- Remain optional
- Respect user volume preferences
- Stop appropriately when the break ends
- Avoid sudden transitions
- Work without AI

The recovery experience should remain fully usable without sound.

---

#### Notifications

Optional break notifications may include:

- Break Completed
- Break Ending Soon

Notifications should:

- Respect user preferences
- Avoid unnecessary frequency
- Use platform-supported scheduling
- Be cancelled when the break ends early
- Avoid becoming the authoritative source of break timing

Notification delivery failure should not invalidate the break.

---

#### Offline Behavior

The V1 True Zen Break should remain fully usable offline.

Offline functionality should include:

- Break Timer
- Recovery Activity Display
- Local State Persistence
- Break Completion
- Available Local Sounds
- Session Summary Navigation

Optional cloud synchronization and AI personalization may resume later.

---

#### Loading State

The basic V1 break experience should not require a visible loading state under normal conditions.

If optional remote personalization is introduced later, the current break should begin using locally available guidance rather than waiting for a remote response.

Users should not be forced to wait before taking a break because an optional service is loading.

---

#### Error Handling

Possible failures include:

- Persistence Failure
- Notification Failure
- Audio Failure
- Invalid Break State
- Recovery Restoration Failure

Failures should be isolated where practical.

For example:

- Audio failure should not end the break
- Notification failure should not invalidate the timer
- AI failure should not prevent recovery guidance

The application should preserve valid break progress whenever possible.

---

#### Visual Design

The True Zen Break should:

- Use calm approved colors
- Use the Recovery / Calm Teal accent where appropriate
- Reduce visual intensity
- Maintain generous spacing
- Use readable typography
- Avoid unnecessary interface elements
- Support Light Mode and Dark Mode
- Use subtle illustrations
- Avoid overly bright achievement or reward visuals

The design should create a clear emotional distinction between focused work and recovery.

---

#### Animation

Animations may include:

- Gentle Fade In
- Slow Progress Transition
- Subtle Breathing Guidance where explicitly used
- Calm Completion Transition

Animations should remain lightweight.

Avoid:

- Rapid pulsing
- Flashing
- Large bouncing effects
- Constant attention-seeking movement

Reduced-motion preferences should simplify or remove non-essential animation.

---

#### Accessibility

The True Zen Break should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Maintain logical reading order
- Provide descriptive accessibility labels
- Provide clear text for the remaining break time
- Use sufficiently large touch targets
- Avoid relying solely on color
- Avoid relying solely on animation
- Respect reduced-motion preferences

Primary interactive controls should generally maintain a minimum touch area of approximately:

```text
44px × 44px
```

Recovery instructions should remain understandable without illustrations or motion.

---

#### Performance

The True Zen Break should remain lightweight.

Implementation should:

- Avoid unnecessary re-renders
- Use timestamp-based timing
- Minimize background processing
- Avoid repeated network requests
- Keep animations lightweight
- Avoid unnecessary storage writes
- Release audio resources appropriately

Recovery should not become a battery-intensive experience.

---

#### Privacy

The True Zen Break should:

- Store only required recovery information
- Avoid unnecessary collection of mood or energy data
- Treat optional self-reported information as private user data
- Avoid transmitting recovery information to AI services unnecessarily
- Respect user personalization and privacy settings

Users should remain in control of optional recovery-related data.

---

#### Future Improvements

Future versions may include:

- AI-Personalized Recovery Suggestions
- Adaptive Break Duration
- Guided Breathing Sessions
- Optional Stretching Guidance
- Optional Mindfulness Exercises
- Smart Hydration Reminders
- Advanced Nature Soundscapes
- Recovery Preference Learning
- Calendar-Aware Recovery Suggestions
- Cross-Device Recovery State
- Optional Wearable-Assisted Signals

Wearable-assisted or health-related features should only be introduced after appropriate privacy, consent, platform, validation, and data-handling requirements are defined.

Future recovery intelligence should remain supportive, transparent, and user-controlled.

---

### 9.14 Session Summary

#### Version Availability

✅ V1 (Core Features)

V1 provides a clear summary of completed focus-session information, progress, and eligible rewards.

Advanced AI-powered productivity analysis, behavioral insights, personalized coaching, and deeper reflection features are Future Enhancements.

---

#### Purpose

The Session Summary provides users with a clear reflection after a completed focus session and, where applicable, its associated recovery break.

Rather than displaying only elapsed time, the summary presents verified session information, relevant progress, and meaningful achievements in a calm and encouraging format.

The experience should help users recognize completed work without creating unnecessary pressure to immediately begin another session.

---

#### User Goals

Users should be able to:

- Review completed session information
- Understand how much focused time was completed
- Review relevant goal and streak progress
- View earned rewards where applicable
- Review completed recovery information where applicable
- Receive optional supportive insights
- Return to the Home Dashboard
- Start another session when they choose

---

#### Main Components

The V1 Session Summary may include:

- Completion Illustration
- Session Result Card
- Completed Focus Duration
- Planned Focus Duration
- Session Completion Status
- Break Summary where applicable
- Daily Goal Progress
- Current Streak
- Earned XP or Rewards where applicable
- Achievement Information where applicable
- Optional Insight Card
- Start Another Session Action
- Return Home Action

Only information supported by actual session data should be displayed.

---

#### Layout Structure

A typical V1 Session Summary may use:

```text
────────────────────────────

       Session Complete

   Nice work. You completed
     your focus session.

────────────────────────────

       Focus Summary

Focus Time
50 Minutes

Planned Duration
50 Minutes

Status
Completed

────────────────────────────

       Today's Progress

2h 40m / 3h

Current Streak
12 Days

────────────────────────────

       XP Earned

         +50 XP

────────────────────────────

   [ Start Another Session ]

       Return Home

────────────────────────────
```

If the user completed a recovery break, the summary may also display:

```text
Recovery Break

5 Minutes
Completed
```

If no reward, achievement, break, or insight exists, the corresponding component should be omitted rather than displaying placeholder information.

---

#### Information Hierarchy

The Session Summary should generally prioritize:

1. Session Completion Status
2. Completed Focus Duration
3. Goal Progress
4. Recovery Information
5. Earned Rewards
6. Achievements
7. Optional Insights
8. Next Actions

The screen should not become overloaded with analytics.

Detailed historical analysis belongs in the Analytics experience.

---

#### Session Result

The Session Result Card should display verified information from the completed session.

Possible information includes:

- Session Name
- Planned Duration
- Completed Focus Duration
- Completion Status
- Completion Time
- Focus Mode
- Associated Goal or Task

Only information relevant to the user should be displayed.

---

#### Focus Duration

Focus duration should be calculated from authoritative session timing data.

The displayed value should:

- Match the completed session record
- Account for valid pauses according to session rules
- Avoid relying on UI timer update frequency
- Remain consistent with stored session history

The Session Summary should never estimate completed focus duration when authoritative session data is available.

---

#### Break Summary

If the user completed or ended a True Zen Break before reaching the Session Summary, the summary may display relevant recovery information.

Possible information includes:

- Planned Break Duration
- Completed Break Duration
- Break Status
- Recovery Activity where appropriate

Example:

```text
Recovery

5 Minute Break
Completed
```

If the break was skipped:

```text
Recovery

Break Skipped
```

The interface should not shame or penalize users for skipping an optional break.

---

#### Daily Goal Progress

If the user has an active daily focus goal, the completed session may update its progress.

Example:

```text
Today's Focus Goal

2h 40m / 3h

89% Complete
```

Goal progress should be derived from authoritative completed-session data.

The summary should not duplicate or independently maintain goal totals.

---

#### Streak Progress

If the completed session qualifies for streak progression according to documented reward rules, the Session Summary may display the updated streak.

Example:

```text
Current Streak

12 Days
```

Streak progression should be calculated by the appropriate domain or reward logic rather than by the Session Summary UI.

The interface should display the result without owning the calculation.

---

#### XP and Rewards

If the completed session qualifies for rewards, the Session Summary may display:

- XP Earned
- Level Progress
- Achievement Progress
- Newly Unlocked Badge
- Milestone Progress

Example:

```text
XP Earned

+50 XP
```

Reward calculations should follow the Reward System domain rules.

The Session Summary should consume the calculated result rather than calculate rewards independently.

---

#### Achievements

New achievements may be displayed when legitimately unlocked by the completed session.

Example:

```text
Achievement Unlocked

7-Day Focus Streak
```

Achievements should only appear when their documented unlock requirements have been satisfied.

The same achievement should not be awarded multiple times unless explicitly designed as repeatable.

---

#### Productivity Score

A Productivity Score should only be displayed if Deep Focus has a documented, deterministic, and testable method for calculating it from available data.

V1 should not display arbitrary values such as:

```text
Productivity Score
92%
```

unless the score has an implemented and documented calculation model.

If such a model is not available in V1, the Productivity Score component should be omitted.

Advanced productivity scoring may be introduced as a Future Enhancement.

---

#### AI Insight

AI-generated session insights are optional and should not be required for the Session Summary to function.

When available, an insight may provide supportive guidance based on appropriate user data.

Examples include:

```text
You completed your planned
focus duration today.
```

or:

```text
You've made steady progress
toward today's focus goal.
```

Future AI-generated insights may include broader behavioral observations when sufficient data exists.

---

#### AI Insight Rules

AI insights should:

- Use only appropriate available context
- Remain supportive
- Remain concise
- Avoid unsupported claims
- Avoid presenting guesses as facts
- Explain recommendations where appropriate
- Never shame users
- Never make medical conclusions
- Never block access to the Session Summary

If AI is unavailable, the Session Summary should continue functioning normally.

---

#### Insight Validation

AI-generated content should be validated before display.

The application should verify:

- Expected response structure
- Required fields
- Supported content length
- Safe display format
- Successful parsing

Invalid AI output should be discarded or replaced with approved local fallback content.

Raw provider responses should not be displayed directly.

---

#### Local Fallback Insight

V1 may provide deterministic local messages when AI is unavailable or unnecessary.

Examples include:

```text
Session complete.
You reached your planned duration.
```

```text
Nice progress.
You're closer to today's focus goal.
```

```text
Recovery complete.
Continue whenever you're ready.
```

Fallback messages should be based on known application state rather than inferred behavior.

---

#### Reflection

V1 may optionally allow lightweight reflection after a session.

Possible inputs include:

```text
How did this session feel?

[ Good ] [ Okay ] [ Difficult ]
```

or:

```text
Energy after this session

[ Higher ] [ Similar ] [ Lower ]
```

Reflection should:

- Remain optional
- Be quick to complete
- Allow skipping
- Clearly represent self-reported information
- Avoid creating unnecessary friction

Advanced mood analysis is a Future Enhancement.

---

#### Personal Notes

Personal session notes may be introduced as a Future Enhancement.

If implemented, users may record short reflections such as:

- What went well
- What caused difficulty
- What to continue next time

Notes should remain private user data and follow Deep Focus storage, synchronization, and privacy rules.

---

#### Interaction Behavior

Users may:

- Review session information
- Review goal progress
- Review rewards or achievements
- Review recovery information
- Read an available insight
- Add optional reflection where supported
- Start another focus session
- Return to the Home Dashboard

No secondary action should prevent users from leaving the summary.

---

#### Start Another Session

Users may choose to begin another focus session after reviewing the summary.

Selecting:

```text
Start Another Session
```

should normally navigate to Session Setup rather than immediately beginning a timer.

Example:

```text
Session Summary
      ↓
Session Setup
      ↓
Ready
      ↓
Focus Session
```

This allows users to intentionally choose the next duration, goal, sound, and other session configuration.

The application should not pressure users into continuous focus sessions.

---

#### Return Home

Selecting:

```text
Return Home
```

should navigate to the Home Dashboard.

The completed session should already be safely persisted before navigation occurs.

The Home Dashboard should reflect updated:

- Daily Focus Progress
- Completed Sessions
- Streak Information
- Rewards
- Recent Activity

where applicable.

---

#### Navigation

The standard V1 flow should remain consistent with the Focus Session and True Zen Break specifications.

When a recovery break is used:

```text
Focus Session
      ↓
Session Completed
      ↓
True Zen Break
      ↓
Session Summary
      ↓
Home Dashboard
```

If the recovery break is skipped:

```text
Focus Session
      ↓
Session Completed
      ↓
Skip Break
      ↓
Session Summary
      ↓
Home Dashboard
```

If the user chooses another session:

```text
Session Summary
      ↓
Session Setup
      ↓
Focus Session
```

The Session Summary should not create conflicting navigation paths with the True Zen Break specification.

---

#### Data Consistency

The Session Summary should consume finalized session data rather than maintain a separate version of session results.

A simplified flow is:

```text
Session Completion
      ↓
Validate Session
      ↓
Persist Session Record
      ↓
Update Domain Progress
      ↓
Update Eligible Rewards
      ↓
Display Session Summary
```

The screen should remain a presentation layer over authoritative application data.

---

#### Duplicate Protection

Opening or refreshing the Session Summary should not:

- Save the session again
- Award XP again
- Increment streaks again
- Unlock the same achievement again
- Duplicate analytics records

Completion side effects should be idempotent or otherwise protected from repeated execution.

---

#### Loading State

The Session Summary should display locally available session information immediately whenever practical.

Optional remote operations such as:

- Cloud synchronization
- AI insight generation
- Remote analytics updates

should not unnecessarily block the entire screen.

If an optional insight is loading, only the relevant component should display a loading state.

---

#### Offline Behavior

The Session Summary should remain usable without internet access.

Offline functionality should include:

- Session Result
- Focus Duration
- Locally Available Goal Progress
- Locally Available Streak Information
- Local Rewards where supported
- Navigation
- Local Reflection

Remote synchronization and AI features may resume when connectivity returns.

---

#### Error Handling

Possible failures include:

- Session Persistence Failure
- Reward Update Failure
- Analytics Update Failure
- AI Insight Failure
- Cloud Synchronization Failure

Failures should be isolated whenever possible.

For example:

- AI failure should not hide the session result
- Cloud sync failure should not remove locally preserved progress
- Reward failure should not invalidate a completed focus session

Important unsynchronized changes should remain recoverable.

---

#### Visual Design

The Session Summary should:

- Feel calm and rewarding
- Use the official Deep Focus Design System
- Maintain generous spacing
- Use clear information hierarchy
- Highlight verified progress
- Avoid excessive celebration
- Support Light Mode and Dark Mode
- Use success colors intentionally
- Keep AI styling visually distinct where applicable

The screen should encourage reflection rather than competition.

---

#### Animation

Optional animations may include:

- Completion Fade In
- XP Count-Up
- Goal Progress Transition
- Achievement Reveal
- Subtle Success Illustration

Animations should:

- Remain short
- Avoid blocking interaction
- Avoid excessive simultaneous effects
- Respect reduced-motion preferences

Important information should remain understandable without animation.

---

#### Accessibility

The Session Summary should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Maintain logical reading order
- Provide descriptive accessibility labels
- Use sufficiently large touch targets
- Avoid relying solely on color
- Avoid relying solely on animation
- Respect reduced-motion accessibility settings

Charts or progress indicators should include equivalent textual information.

---

#### Privacy

The Session Summary should display only information appropriate to the current user.

Session information, reflections, AI insights, and productivity data should follow Deep Focus privacy and storage rules.

Sensitive productivity information should not be transmitted to external AI services unless required for an enabled feature and handled according to the AI Architecture and privacy requirements.

---

#### Performance

The Session Summary should remain lightweight.

Implementation should:

- Reuse finalized session data
- Avoid unnecessary recalculation
- Avoid repeated storage writes
- Avoid duplicate network requests
- Load optional AI content independently
- Keep animations lightweight
- Avoid unnecessary global state updates

Opening the summary should not trigger completion logic repeatedly.

---

#### Future Improvements

Future versions may include:

- AI-Generated Session Coaching
- Advanced Productivity Scoring
- Behavioral Pattern Analysis
- Mood Tracking
- Focus Trend Comparison
- Weekly Performance Comparison
- Personal Journal Integration
- Voice Reflections
- Calendar-Based Productivity Context
- Cross-Device Session Summaries
- Optional Achievement Sharing
- More Advanced Recovery Insights

Future enhancements should preserve user control, privacy, accessibility, and the calm Deep Focus experience.

---

### 9.15 Analytics

#### Version Availability

✅ V1 (Core Features)

V1 provides core productivity analytics based on validated focus-session, goal, streak, and locally available progress data.

Advanced AI analytics, behavioral interpretation, predictive insights, and long-term adaptive trends are Future Enhancements.

---

#### Purpose

The Analytics screen helps users understand their productivity patterns through clear visualizations, historical data, and meaningful summaries.

Rather than overwhelming users with raw statistics, Deep Focus should present understandable information that supports reflection, consistency, and sustainable work habits.

The objective is to help users learn from their productivity data rather than simply monitor it.

Analytics should remain informative without creating pressure to constantly increase work time or performance.

---

#### User Goals

Users should be able to:

- Review productivity trends
- Track focus progress over time
- Understand session history
- Review goal progress
- Identify useful patterns
- Compare recent periods
- Read optional AI-assisted insights
- Reflect on sustainable work habits

---

#### Main Components

The V1 Analytics screen may include:

- Productivity Overview
- Daily Summary
- Weekly Progress Chart
- Monthly Summary
- Focus History
- Streak Overview
- Goal Progress
- Recovery Summary where available
- Optional AI Insight Card
- Time-Period Filters
- Empty, Loading, Offline, and Error States

Only metrics supported by reliable data should be displayed.

---

#### Layout Structure

A typical V1 Analytics screen may use:

```text
────────────────────────────

          Analytics

   [ Daily ] [ Weekly ] [ Monthly ]

────────────────────────────

        Today's Summary

Focus Time
3h 20m

Sessions Completed
4

Goal Progress
80%

────────────────────────────

        Weekly Progress

           Chart

────────────────────────────

        Current Streak

          14 Days

────────────────────────────

        Goal Progress

████████░░ 80%

────────────────────────────

        Recent Sessions

45 min    Completed
30 min    Completed
60 min    Completed

────────────────────────────
```

If a valid AI-assisted insight is available, it may appear as a separate secondary component.

The layout should prioritize readability, visual hierarchy, and quick understanding.

---

#### Analytics Information Hierarchy

The Analytics screen should generally prioritize information in this order:

1. Current Period Summary
2. Focus Trend
3. Goal Progress
4. Session History
5. Streak or Consistency Information
6. Recovery Information
7. Optional AI Insights
8. Advanced Detail

The screen should not present every available metric with equal visual weight.

---

#### Daily Overview

The Daily Overview summarizes validated activity for the current day.

Possible metrics include:

- Total Focus Time
- Sessions Completed
- Daily Goal Progress
- Recovery Breaks Completed where supported

Example:

```text
Today's Summary

Focus Time
3h 20m

Sessions Completed
4

Goal Progress
80%
```

Metrics should update from authoritative application data rather than maintaining duplicate analytics state.

---

#### Productivity Score

A generalized Productivity Score should not appear in V1 unless the project has a documented, deterministic, testable, and explainable calculation model.

The interface should not display arbitrary values such as:

```text
Productivity Score
91%
```

without defined inputs and meaning.

If a Productivity Score is introduced later, it should have:

- Defined Inputs
- Defined Calculation Rules
- Minimum Data Requirements
- Clear User-Facing Meaning
- Documented Limitations
- Appropriate Validation

Until then, Deep Focus should prefer understandable individual metrics.

---

#### Weekly Progress

The Weekly Progress section displays focus activity across the previous seven-day period or current calendar week according to the product's defined reporting model.

Possible data includes:

- Daily Focus Duration
- Sessions Completed
- Goal Progress
- Recovery Activity where supported

A simple visualization may use:

- Bar Chart
- Line Chart
- Another approved accessible chart

The chart should emphasize consistency and patterns rather than maximum work time.

---

#### Monthly Summary

The Monthly Summary provides a broader view of recent activity.

Possible information includes:

- Total Focus Time
- Total Completed Sessions
- Average Session Duration
- Goal Completion Patterns
- Streak History
- Recovery Activity where available

Monthly summaries should avoid implying that every increase is automatically positive.

Lower focus time may reflect completed goals, additional recovery, schedule changes, or reduced workload.

---

#### Focus History

Focus History displays previous session records.

Possible information includes:

- Date
- Session Name
- Completed Duration
- Planned Duration
- Completion Status
- Focus Mode
- Associated Goal or Task

Example:

```text
Today

Design UI System
45 Minutes
Completed

Yesterday

Read Research Notes
30 Minutes
Completed
```

The history should use authoritative stored session records.

---

#### Focus History Score Handling

A Productivity Score should not appear in individual session history unless the score system has been explicitly implemented and defined.

Session history should prefer verifiable information such as:

- Duration
- Status
- Goal
- Task
- Session Time
- Focus Mode

---

#### Goal Progress

Goal Progress tracks progress toward configured productivity goals.

Possible goal types include:

- Daily Focus Goal
- Weekly Focus Goal
- Task Completion Goal
- Personal Focus Milestone

Progress should be calculated through domain logic.

The Analytics UI should display the result rather than independently calculate or mutate goal state.

---

#### Streak Overview

The Streak Overview may display:

- Current Streak
- Longest Streak
- Recent Consistency
- Relevant Streak History

Example:

```text
Current Streak

14 Days
```

Streaks should be presented as consistency history rather than a measure of personal worth.

A broken streak should not be presented with shame-based language.

---

#### Recovery Analytics

Where supported, Analytics may summarize recovery behavior.

Possible information includes:

- Breaks Completed
- Average Break Duration
- Break Consistency
- User-Reported Post-Break Energy where available

Recovery analytics should remain supportive and non-medical.

The application should not claim that a break objectively improved physiological or psychological health.

---

#### Time-Period Filters

Users should be able to switch between relevant reporting periods.

Possible V1 filters include:

```text
Daily
Weekly
Monthly
```

The selected filter should:

- Remain visually obvious
- Preserve accessible selected state
- Avoid relying solely on color
- Update only relevant analytics content
- Preserve context where practical

---

#### Focus Trend Interpretation

Analytics should avoid treating higher focus duration as automatically better.

For example:

```text
Focus time increased by 20%.
```

should not automatically be labeled:

```text
Excellent improvement.
```

The meaning of a change may depend on:

- Goal completion
- Recovery patterns
- Schedule changes
- Workload
- User preference

The interface should present data neutrally unless sufficient context supports a recommendation.

---

#### AI Insights

AI-assisted insights may appear when they provide useful interpretation of available data.

Examples include:

```text
Your morning sessions were completed
more consistently this week.
```

```text
Your average session duration increased
compared with last week.
```

```text
You completed more recovery breaks
this week than last week.
```

AI insights should remain optional.

---

#### AI Insight Rules

AI-generated insights should:

- Use sufficient supporting data
- Distinguish interpretation from recorded facts
- Explain the basis where practical
- Avoid overconfident conclusions
- Avoid unsupported health claims
- Remain concise
- Remain non-judgmental
- Remain dismissible where appropriate

Example:

```text
AI Insight

Your morning sessions were more
consistently completed this week.

Based on 6 completed morning sessions.
```

---

#### Data Sufficiency

Deep Focus should not generate behavioral conclusions when insufficient data exists.

If a meaningful pattern cannot yet be supported, the interface should display:

```text
Not enough data yet.

Complete more focus sessions to
unlock trend insights.
```

No insight is better than an unsupported insight.

---

#### Morning Productivity Claims

The interface should not display statements such as:

```text
Your focus sessions are most effective
during the morning.
```

unless the product has enough validated historical data to support that conclusion.

If the information comes from onboarding preferences rather than observed behavior, use wording such as:

```text
You selected morning as your
preferred focus period.
```

Preference and observed behavior should remain distinct.

---

#### Chart Design

Charts should:

- Follow the Deep Focus Design System
- Use clear labels
- Maintain sufficient contrast
- Avoid unnecessary decoration
- Avoid excessive data density
- Support Light Mode and Dark Mode
- Avoid relying only on color
- Remain understandable without animation

The selected chart type should match the information being communicated.

---

#### Chart Interaction

Where useful, users may:

- Select a data point
- View exact values
- Change time period
- Open additional details

Important information should not require hover-only interaction.

Touch interactions should not require excessive precision.

---

#### Chart Accessibility

Every meaningful chart should have a non-visual equivalent.

For example:

```text
Weekly Focus Summary

Monday: 45 minutes
Tuesday: 60 minutes
Wednesday: 30 minutes
Thursday: 75 minutes
Friday: 50 minutes

Highest focus duration:
Thursday, 75 minutes
```

Users should be able to understand important analytics without interpreting the visual chart.

---

#### Empty State

New users may not have enough analytics data.

Example:

```text
No Analytics Yet

Complete your first focus session
to begin building your focus history.

[ Start Focus Session ]
```

Sections without meaningful data may remain hidden rather than displaying multiple empty containers.

---

#### Insufficient Data State

Some analytics components may require more historical data than others.

Example:

```text
Building Your Focus Trends

Complete more sessions to unlock
weekly pattern insights.
```

The application should distinguish `No Data` from `Not Enough Data for Analysis`.

---

#### Loading State

When analytics data is being loaded or calculated:

- Locally available information should appear quickly
- Skeleton components may be used
- Existing cached data may remain visible
- Optional AI loading should not block core analytics
- Large layout shifts should be avoided

The entire Analytics screen should not remain blocked because one optional component is loading.

---

#### Offline Behavior

Analytics that can be calculated from local data should remain available offline.

Offline functionality may include:

- Local Focus History
- Daily Focus Time
- Weekly Focus Summary
- Streak Information
- Goal Progress

Remote-only content may display:

```text
Online insights will update when
your connection returns.
```

AI failure or network loss should not remove locally available analytics.

---

#### Error Handling

Possible failures include:

- Local Data Load Failure
- Analytics Calculation Failure
- Cloud Synchronization Failure
- AI Insight Failure
- Invalid Stored Data

Failures should be isolated where practical.

For example:

- AI failure should not hide charts
- Cloud sync failure should not remove local history
- One failed metric should not blank the entire screen

The interface should provide appropriate retry or recovery actions.

---

#### Data Consistency

Analytics should derive information from authoritative session, goal, streak, and reward data.

A simplified flow is:

```text
Stored Session Data
      ↓
Analytics Use Cases
      ↓
Derived Metrics
      ↓
Analytics View State
      ↓
Analytics UI
```

The Analytics screen should not maintain a separate competing source of truth.

---

#### Interaction Behavior

Users may:

- View current statistics
- Switch reporting periods
- Review previous sessions
- Explore focus trends
- Review goal progress
- Review streak information
- Read available AI-assisted insights
- Open relevant session details

Interactions should remain responsive and predictable.

---

#### Navigation

The Analytics screen is a primary application destination.

```text
Bottom Navigation
      ↓
Analytics
```

When Analytics is active, the Analytics tab should display the selected state.

Users may navigate into detail screens such as:

```text
Analytics
      ↓
Session History
      ↓
Session Details
```

or:

```text
Analytics
      ↓
Insight Details
```

Back navigation should restore the previous analytics context where practical.

---

#### Bottom Navigation

The Analytics screen should use the primary Bottom Navigation Bar during normal application use.

Primary destinations remain:

```text
Home | Focus | Analytics | Rewards | Profile
```

`Analytics` should appear as the active destination.

---

#### Visual Design

The Analytics screen should:

- Use clean and uncluttered charts
- Prioritize readability
- Maintain generous spacing
- Use clear card hierarchy
- Avoid excessive metrics
- Highlight meaningful trends
- Support Light Mode and Dark Mode
- Follow the approved color system
- Use AI Accent styling only for genuine AI content

The screen should feel informative rather than data-heavy.

---

#### Animation

Analytics may use subtle animation for:

- Chart appearance
- Progress transitions
- Filter changes

Animations should:

- Remain short
- Avoid distracting users
- Avoid repeated number-count effects
- Respect reduced-motion settings

Analytics meaning should never depend on animation.

---

#### Accessibility

The Analytics screen should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Use accessible chart labels
- Provide textual chart alternatives
- Maintain logical reading order
- Provide sufficiently large touch targets
- Avoid relying solely on color
- Support keyboard navigation where applicable
- Respect reduced-motion accessibility settings

All key analytics information should remain understandable without visual chart interpretation.

---

#### Performance

The Analytics screen should remain efficient as user history grows.

Implementation should:

- Avoid recalculating unchanged history unnecessarily
- Aggregate large datasets appropriately
- Load only required time periods
- Avoid rendering excessive chart points
- Cache safe derived metrics where appropriate
- Avoid repeated AI requests
- Keep filtering responsive
- Avoid blocking rendering on remote data
- Support large local focus-history datasets

Analytics performance should remain predictable over long-term usage.

---

#### Privacy

Analytics should follow privacy-by-design principles.

Deep Focus should:

- Use only necessary productivity data
- Avoid unnecessary behavioral tracking
- Protect focus history
- Respect analytics and AI personalization preferences
- Minimize external data transmission
- Avoid sending full historical datasets to AI when unnecessary
- Support future data deletion and export requirements

Analytics exist primarily to benefit the user, not to maximize engagement.

---

#### Future Improvements

Future versions may include:

- Advanced Behavioral Trend Analysis
- Predictive Focus Recommendations
- Evidence-Based Productivity Pattern Insights
- Energy Pattern Analysis Using Appropriate User-Reported Data
- Calendar-Based Productivity Reports
- Team Productivity Dashboards
- Wearable-Assisted Insights
- Exportable Productivity Reports
- AI-Generated Weekly Coaching Summaries
- Cross-Device Analytics
- Advanced Recovery Pattern Analysis

Burnout-related predictive features should only be introduced after their inputs, validation methods, safety boundaries, privacy implications, and limitations are clearly defined.

Future analytics should improve understanding without introducing surveillance, unsupported health claims, or unnecessary productivity pressure.

---

### 9.16 Rewards

#### Version Availability

✅ V1 (Core Features)

V1 provides core reward functionality including XP, levels, streak progress, achievement tracking, milestone progress, and locally available reward history.

Advanced achievements, seasonal challenges, social rewards, community features, cosmetic collections, and personalized milestone systems are Future Enhancements.

---

#### Purpose

The Rewards screen helps users recognize meaningful progress and build sustainable productivity habits through achievements, XP, streaks, milestones, and optional challenges.

Rather than rewarding users simply for working longer, Deep Focus should recognize consistency, meaningful focus, healthy recovery, goal progress, and long-term personal improvement.

The reward experience should remain motivating without creating unhealthy productivity pressure, compulsive engagement, or unnecessary competition.

---

#### User Goals

Users should be able to:

- View earned achievements
- Track XP and level progress
- Review streak progress
- Monitor milestone progress
- Explore available achievements
- Review reward history
- Participate in optional healthy challenges where supported
- Celebrate personal progress without social pressure

---

#### Main Components

The V1 Rewards screen may include:

- Level Progress
- Experience Points (XP)
- Current Streak
- Achievement Collection
- Milestone Progress
- Reward History
- Optional Challenge Progress
- Recently Unlocked Rewards
- Reward Details
- Empty, Loading, Offline, and Error States

Only implemented reward systems should appear.

---

#### Layout Structure

A typical V1 Rewards screen may use:

```text
────────────────────────────

          Rewards

────────────────────────────

          Level 5

       XP Progress

      ███████░░░

      720 / 1000 XP

────────────────────────────

       Current Streak

          14 Days

────────────────────────────

        Achievements

🏆 First Focus Session

🏅 Seven-Day Consistency

⭐ Morning Routine

🌿 Recovery Champion

────────────────────────────

       Milestone Progress

       100 Sessions

      ████░░░░░░

         42 / 100

────────────────────────────

        Recent Rewards

+50 XP    Focus Session
Badge     Recovery Champion

────────────────────────────
```

If V1 challenges are implemented, they may appear below core reward progress.

The screen should feel rewarding without becoming visually overstimulating.

---

#### Information Hierarchy

The Rewards screen should generally prioritize:

1. Current Level and XP
2. Current Streak
3. Newly Earned Achievements
4. Milestone Progress
5. Achievement Collection
6. Reward History
7. Optional Challenges
8. Future Cosmetic or Social Features

Core productivity actions should remain more important than reward browsing.

---

#### Level Progress

The Level Progress section displays long-term XP progression.

Possible information includes:

- Current Level
- Current XP
- XP Required for Next Level
- Progress Bar
- Next Milestone

Example:

```text
Level 5

720 / 1000 XP

280 XP until Level 6
```

Level progression should be based on documented reward rules.

The Rewards screen should display the calculated result rather than calculate XP requirements independently.

---

#### Experience Points

Users may earn XP through eligible actions such as:

- Completing focus sessions
- Completing defined goals
- Maintaining sustainable consistency
- Completing optional recovery activities
- Reaching approved milestones
- Completing approved challenges

XP should reward meaningful activity rather than raw application usage.

---

#### XP Rules

XP rules should:

- Be deterministic
- Be testable
- Prevent duplicate awards
- Avoid rewarding excessive work duration
- Avoid rewarding repeated low-value actions
- Avoid encouraging users to skip recovery
- Avoid rewarding unnecessary application interaction
- Remain understandable to users

Where appropriate, limits or diminishing returns may be used to discourage unhealthy optimization of XP.

---

#### XP Transparency

Users should be able to understand why XP was earned.

Example:

```text
Focus Session Completed
+50 XP
```

```text
Recovery Break Completed
+10 XP
```

The interface does not need to expose every internal formula, but the meaningful action behind each reward should remain clear.

---

#### Current Streak

The Current Streak section recognizes consistency.

Possible information includes:

- Current Streak
- Longest Streak
- Recent Consistency
- Grace or Protection Status where implemented

Example:

```text
Current Streak

14 Days
```

Streaks should represent habit history rather than user worth.

---

#### Streak Behavior

When a streak ends, the interface should remain supportive.

Avoid:

```text
You lost your streak.
```

Prefer:

```text
Your previous streak reached 14 days.

Start again whenever you're ready.
```

The reward system should not create guilt around normal breaks, illness, travel, or changing schedules.

---

#### Achievement Collection

The Achievement Collection displays unlocked and in-progress milestones.

Possible states include:

- Unlocked
- Locked
- In Progress
- Recently Earned

Each achievement may include:

- Badge Icon
- Title
- Description
- Unlock Date
- Progress where applicable

---

#### Focus Achievements

Examples may include:

- First Focus Session
- 10 Completed Sessions
- 100 Completed Sessions
- Deep Focus Master
- Long Session Milestone

Achievement requirements should be clearly documented.

Long-session achievements should not encourage unsafe or excessive working hours.

---

#### Consistency Achievements

Examples may include:

- 3-Day Consistency
- 7-Day Consistency
- 30-Day Consistency
- 100-Day Consistency

Consistency achievements should recognize repeated healthy participation rather than uninterrupted overwork.

---

#### Recovery Achievements

Examples may include:

- Recovery Champion
- Balanced Routine
- Consistent Breaks
- Recovery Habit Builder

Avoid achievement names such as:

```text
Burnout Preventer
```

because Deep Focus should not imply that it diagnoses or prevents burnout or another health condition.

Recovery achievements should remain within the productivity and habit-building scope of the product.

---

#### Goal Achievements

Examples may include:

- Daily Goal Completed
- Weekly Goal Completed
- Monthly Goal Completed
- Goal Consistency Milestone

Goal achievements should not encourage unrealistic target setting.

If a user reduces or changes their goals, the system should not treat that decision as failure.

---

#### Milestone Progress

Milestones represent long-term personal progress.

Possible examples include:

- 10 Focus Sessions
- 100 Focus Sessions
- 100 Focus Hours
- 500 Focus Hours
- 30 Recovery Breaks
- 50 Goals Completed

Example:

```text
100 Focus Sessions

42 / 100
```

Milestones should remain understandable and should not require excessive work intensity.

---

#### Reward History

Reward History may display previously earned rewards.

Possible information includes:

- XP Award
- Achievement Unlock
- Level Up
- Milestone Completion
- Reward Date

Example:

```text
Today

Focus Session Completed
+50 XP

Yesterday

Achievement Unlocked
Recovery Champion
```

The history should use authoritative reward records.

---

#### Challenge System

Challenges are optional productivity objectives.

V1 should only include challenges if the challenge system is implemented and documented.

Possible healthy challenges include:

- Complete one planned focus session today
- Reach your selected daily focus goal
- Complete three planned sessions this week
- Take an intentional recovery break after a long session
- Review your weekly progress

Challenges should remain optional.

---

#### Challenge Rules

Challenges should:

- Support sustainable productivity
- Avoid excessive work targets
- Avoid unnecessary urgency
- Avoid requiring every AI recommendation to be followed
- Avoid punishing missed days
- Avoid manipulative countdown pressure
- Remain clearly optional
- Use measurable and reliable criteria

Avoid challenges such as:

```text
Complete every recommended recovery break.
```

because recommendations should remain optional.

Prefer:

```text
Take two intentional recovery breaks this week.
```

where such a target is appropriate and user-controlled.

---

#### Challenge Progress

When challenges are available, progress should clearly show:

- Challenge Goal
- Current Progress
- Completion Requirement
- Remaining Time only when genuinely relevant

Example:

```text
Weekly Focus Challenge

Complete 3 Planned Sessions

2 / 3
```

Challenge progress should be derived from authoritative application data.

---

#### Challenge Completion

Completing a challenge may provide:

- XP
- Achievement Progress
- Cosmetic Reward
- Milestone Progress

Challenge completion should not provide unfair productivity advantages.

Users should not lose core functionality by choosing not to participate.

---

#### Recently Unlocked Rewards

Recently earned achievements or milestones may receive temporary emphasis.

Example:

```text
Recently Unlocked

Recovery Champion
```

Recent unlocks should not permanently dominate the Rewards screen.

---

#### Reward Details

Selecting an achievement or milestone may open a detail view containing:

- Title
- Description
- Unlock Requirement
- Unlock Date
- Progress
- Related Reward

Locked rewards should explain requirements without pressuring users.

---

#### Locked Achievement Behavior

Locked achievements may display:

```text
Locked

Complete 10 Focus Sessions

4 / 10
```

Hidden achievements may be used sparingly.

The application should avoid manipulative mystery mechanics that encourage excessive app usage.

---

#### Visual Design

The Rewards screen should:

- Follow the Deep Focus Design System
- Feel motivating and premium
- Maintain clear hierarchy
- Use generous spacing
- Highlight meaningful milestones
- Avoid excessive decorative effects
- Support Light Mode and Dark Mode
- Keep rewards secondary to productivity
- Use celebratory color intentionally

The screen should feel rewarding without resembling a high-stimulation game interface.

---

#### Reward Animations

Possible animations include:

- XP Count-Up
- Level Progress Transition
- Badge Unlock
- Milestone Completion
- Streak Update

Animations should:

- Remain brief
- Avoid flashing
- Avoid excessive particle effects
- Avoid repeated celebration
- Avoid blocking navigation
- Respect reduced-motion preferences

Routine XP changes should receive lighter feedback than major milestones.

---

#### Interaction Behavior

Users may:

- View XP progress
- Review level progress
- View streak information
- Browse achievements
- Open reward details
- Review milestone progress
- Review reward history
- Track optional challenge progress

Reward browsing should never prevent users from returning quickly to core productivity workflows.

---

#### Navigation

The Rewards screen is a primary application destination.

```text
Bottom Navigation
      ↓
Rewards
```

When Rewards is active:

```text
Home | Focus | Analytics | Rewards | Profile
```

`Rewards` should appear as the selected destination.

Users may navigate to detail views such as:

```text
Rewards
      ↓
Achievement Details
```

or:

```text
Rewards
      ↓
Milestone Details
```

Back navigation should restore the previous Rewards context where practical.

---

#### Bottom Navigation

The Rewards screen should use the primary Bottom Navigation Bar during normal application use.

The navigation bar should follow the rules defined in Section 8 and `7.4 Navigation Components`.

---

#### Empty State

A new user may not yet have unlocked rewards.

Example:

```text
Your Rewards Journey Starts Here

Complete focus sessions and build
healthy consistency to unlock
achievements over time.
```

The empty state should encourage without implying failure.

---

#### Loading State

When reward information is loading:

- Locally available progress should appear quickly
- Skeleton components may be used
- Existing cached data may remain visible
- Optional remote reward content should not block core reward data

The entire screen should not remain blocked because one optional remote component is unavailable.

---

#### Offline Behavior

Locally available reward information should remain accessible offline where practical.

Offline functionality may include:

- XP
- Level Progress
- Streak
- Local Achievements
- Milestone Progress
- Reward History

Remote-only community or synchronized reward features may update later.

---

#### Error Handling

Possible failures include:

- Reward data load failure
- Invalid reward state
- Synchronization failure
- Achievement processing failure
- Duplicate reward attempt

The application should:

- Preserve valid local reward data
- Prevent duplicate awards
- Provide understandable retry options
- Avoid hiding all reward information because one component failed
- Avoid exposing technical implementation details

A reward-system error should not invalidate an otherwise completed focus session.

---

#### Reward Integrity

Reward state should be generated through authoritative domain logic.

A simplified flow is:

```text
Eligible User Action
      ↓
Reward Rules
      ↓
Validate Eligibility
      ↓
Award XP / Progress
      ↓
Persist Reward State
      ↓
Rewards UI
```

The Rewards screen should not independently award:

- XP
- Achievements
- Streaks
- Milestones

The UI should display finalized reward state.

---

#### Duplicate Protection

The reward system should prevent:

- Duplicate XP
- Duplicate achievement unlocks
- Duplicate challenge completion
- Duplicate level progression events
- Repeated reward processing after screen refresh

Opening the Rewards screen should never trigger reward awards by itself.

---

#### Accessibility

The Rewards screen should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Use icons together with text
- Provide accessible progress descriptions
- Maintain logical reading order
- Provide sufficiently large touch targets
- Avoid relying solely on color
- Avoid relying solely on animation
- Respect reduced-motion accessibility settings

Example accessible progress description:

```text
Level 5.
720 of 1000 experience points.
72 percent complete.
```

---

#### Reduced Motion

When reduced motion is enabled:

- XP Count-Up may become an immediate value update
- Badge unlock animations should be simplified
- Progress animations should be reduced
- Large celebration effects should be removed

Reward information should remain fully understandable without motion.

---

#### Privacy

Reward progress should remain private by default.

Deep Focus should not automatically expose:

- XP
- Streaks
- Achievements
- Focus Hours
- Challenge Progress
- Productivity History

to other users.

Future sharing or social functionality should require explicit user action or appropriate opt-in controls.

---

#### Social Features

Future social reward functionality may include:

- Team Challenges
- Community Challenges
- Achievement Sharing
- Optional Leaderboards

These features should remain opt-in.

Social reward systems should avoid:

- Shame-based ranking
- Pressure to work excessive hours
- Public exposure of private productivity information
- Required competition
- Reward structures that favor unhealthy intensity

Personal growth should remain more important than ranking.

---

#### Statistics Overview

If a reward-related Statistics Overview is included, it should display only information relevant to reward progress.

Possible examples include:

- Total XP
- Current Level
- Achievements Unlocked
- Milestones Completed

Detailed productivity statistics should remain in Analytics rather than being duplicated unnecessarily in Rewards.

---

#### Performance

The Rewards screen should remain efficient as achievement and reward history grows.

Implementation should:

- Avoid recalculating completed rewards unnecessarily
- Load large achievement collections efficiently
- Cache static badge assets appropriately
- Avoid excessive animations
- Avoid duplicate reward processing
- Use pagination or virtualization where required
- Avoid unnecessary global state updates

Reward visuals should not reduce application responsiveness.

---

#### Future Improvements

Future versions may include:

- Seasonal Challenges
- Team Challenges
- Community Events
- Optional Leaderboards
- Achievement Sharing
- Collectible Themes
- Custom Avatars
- Digital Trophies
- Premium Cosmetic Collections
- Personalized Achievement Suggestions
- Community Milestones
- Optional Virtual Currency

Future reward features should remain aligned with the Deep Focus monetization philosophy.

Core productivity functionality should never depend on premium reward purchases, marketplace items, or competitive participation.

---

#### Future Reward Safety

Before introducing future reward mechanics, contributors should evaluate whether the feature:

- Encourages excessive work
- Creates artificial urgency
- Introduces manipulative scarcity
- Creates gambling-like behavior
- Pressures users to maintain streaks
- Exposes private productivity data
- Makes paid rewards affect productivity fairness

Reward expansion should support healthy motivation without creating dependency on gamification.

---

### 9.17 Profile & Settings

#### Version Availability

✅ V1 (Core Features)

V1 provides core profile management, productivity preferences, focus settings, notification preferences, appearance settings, privacy controls, account management, help, and application information.

Advanced personalization, third-party integrations, multi-language support, subscription management, connected-device management, and enterprise settings are Future Enhancements unless explicitly included in the approved V1 scope.

---

#### Purpose

The Profile & Settings screen provides a central location for managing personal information, productivity preferences, application behavior, privacy controls, security options, and account-related settings.

The experience should remain organized, predictable, and easy to navigate.

Settings should help users control how Deep Focus works without exposing unnecessary technical complexity.

---

#### User Goals

Users should be able to:

- Manage personal profile information
- Update productivity preferences
- Configure focus behavior
- Manage notification preferences
- Change appearance settings
- Review privacy controls
- Manage account security
- Access help and support
- Sign out securely
- Delete or manage account data where supported
- Review connected services when available

---

#### Main Components

The Profile & Settings screen may include:

- Profile Header
- Personal Information
- Productivity Preferences
- Focus Settings
- Notification Settings
- Appearance
- Language where implemented
- Privacy & Security
- Data Management
- Connected Services where implemented
- Subscription where implemented
- Help & Support
- About Deep Focus
- Sign Out
- Account Deletion

Only features currently implemented should appear as active settings.

Future features should not appear as functional controls before they are supported.

---

#### Layout Structure

A typical V1 layout may use:

```text
────────────────────────────

          Profile

────────────────────────────

        Alex Johnson

     Software Developer

      [ Edit Profile ]

────────────────────────────

    Productivity Preferences
              >

         Focus Settings
              >

         Notifications
              >

          Appearance
              >

      Privacy & Security
              >

       Data Management
              >

       Help & Support
              >

       About Deep Focus
              >

────────────────────────────

           Sign Out

────────────────────────────
```

Future sections such as Language, Connected Services, and Subscription should appear only when those capabilities are implemented.

---

#### Information Architecture

Settings should be grouped into logical categories.

A possible structure is:

```text
Profile

├── Personal Information
│
├── Productivity
│   ├── Productivity Preferences
│   └── Focus Settings
│
├── Application
│   ├── Notifications
│   ├── Appearance
│   └── Language
│
├── Privacy & Account
│   ├── Privacy & Security
│   ├── Data Management
│   └── Connected Services
│
├── Billing
│   └── Subscription
│
└── Support
    ├── Help & Support
    └── About Deep Focus
```

The exact structure may evolve, but related settings should remain grouped consistently.

---

#### Profile Header

The Profile Header may display:

- Profile Picture
- Display Name
- Occupation or Primary Activity
- Account Status where relevant
- Edit Profile Action

The header should remain simple and should not become a social-profile dashboard.

---

#### Personal Information

Users may manage:

- Display Name
- Email Address
- Profile Picture
- Occupation or Primary Activity
- Productivity Goals

Only information required by the implemented product should be collected.

Changes to sensitive information such as email address should follow the approved authentication and verification flow.

---

#### Profile Picture

Profile pictures should remain optional.

If implemented, users should be able to:

- Add a picture
- Replace a picture
- Remove a picture

The application should not require a profile picture for normal productivity functionality.

Image storage and upload should follow privacy, security, and storage rules.

---

#### Productivity Preferences

Users may configure:

- Daily Focus Goal
- Default Session Duration
- Preferred Break Duration
- Preferred Focus Period
- Recovery Preferences
- Productivity Goals

Preferences should remain editable after onboarding.

Updating preferences should refresh relevant personalization without rewriting historical productivity data.

---

#### Focus Settings

Focus Settings may include:

- Default Focus Mode
- Background Sound Preference
- Timer Preferences
- Break Preferences
- Auto Start Breaks where implemented
- Auto Start Sessions where implemented

Settings that affect session behavior should clearly explain their effect.

Potentially disruptive automation should remain opt-in.

---

#### Notification Settings

Users may configure supported notification categories such as:

- Session Completion
- Focus Reminders
- Goal Reminders
- Weekly Summary
- Achievement Alerts
- AI Recommendations where enabled

Notification controls should:

- Respect system permission state
- Avoid excessive frequency
- Allow category-level control where practical
- Avoid pressuring users to enable notifications

If system notification permission is disabled, the interface should explain the limitation clearly.

---

#### Appearance

Users may select:

- Light Theme
- Dark Theme
- System Theme

The selected appearance should:

- Persist across application restarts
- Apply consistently
- Support accessibility
- Avoid unexpected resets

Theme selection should use the approved Deep Focus color and design tokens.

---

#### Language

Language settings should appear only when localization is implemented.

Future language support may include:

- Localized Interface
- Localized Notifications
- Localized AI Guidance
- Regional Date and Time Formats

The application should not expose non-functional language options before translations are available.

---

#### Privacy & Security

Privacy & Security may include:

- Password Management
- Authentication Status
- Session Security
- Privacy Preferences
- AI Personalization Controls
- Biometric Re-Authentication where implemented
- Multi-Factor Authentication where implemented

Security settings should remain understandable and should not expose unnecessary technical details.

---

#### Password Management

When password-based authentication is enabled, users may access flows such as:

- Change Password
- Forgot Password
- Re-Authentication when required

Password changes should follow the authentication provider's security requirements.

Passwords should never be displayed or stored directly by the UI layer.

---

#### Data Management

Users should have clear controls for their stored information.

Possible controls include:

- View Stored Data Categories
- Clear Local History
- Delete Focus History
- Export Data where supported
- Delete AI-Related History where supported
- Manage Cloud Backup where implemented
- Delete Account

Destructive data operations should clearly explain their consequences.

---

#### Account Deletion

Account deletion is a high-impact action.

The flow should:

- Explain what data will be deleted
- Explain what may remain temporarily due to legal or technical requirements where applicable
- Require appropriate confirmation
- Require re-authentication where required
- Avoid accidental activation
- Provide clear final feedback

A simplified flow may be:

```text
Account Settings
      ↓
Delete Account
      ↓
Explain Consequences
      ↓
Re-Authenticate if Required
      ↓
Final Confirmation
      ↓
Delete Account
```

The interface should not hide account deletion unnecessarily.

---

#### Sign Out

Sign Out should:

- End the authenticated session securely
- Clear sensitive session data
- Preserve appropriate local non-sensitive data only if allowed by product rules
- Prevent accidental access to the previous account state

A confirmation dialog may be used when signing out could interrupt unsynchronized or important user activity.

Routine sign out should not require excessive confirmation.

---

#### Connected Services

Connected Services should appear only when integrations are implemented.

Potential future integrations may include:

- Google Calendar
- Microsoft Outlook
- Apple Calendar
- Notion
- Trello
- ClickUp
- Jira
- Apple Health
- Google Fit
- Wearable Devices

Each integration should clearly communicate:

- What data is accessed
- Why access is required
- What permissions are needed
- Whether the connection is optional
- How to disconnect the service

External services should not receive unnecessary Deep Focus data.

---

#### Integration Permissions

External integrations should follow least-privilege principles.

Deep Focus should request only the permissions required for the selected feature.

For example:

```text
Connect Calendar
      ↓
Explain Required Access
      ↓
Request Permission
      ↓
User Approves or Declines
```

Declining an optional integration should not reduce unrelated Deep Focus functionality.

---

#### Subscription

Subscription settings should appear only when subscription functionality is implemented.

Possible controls may include:

- Current Plan
- Upgrade Plan
- Restore Purchases
- Manage Subscription

Billing and subscription management should use approved platform purchase systems and should not request payment information directly unless the architecture explicitly requires and securely supports it.

---

#### Subscription Transparency

Subscription settings should clearly communicate:

- Current Plan
- Included Features
- Renewal Behavior
- Applicable Price Information
- How to Manage or Cancel

Core productivity functionality should remain aligned with the Deep Focus ethical monetization principles.

---

#### Help & Support

Help & Support may provide access to:

- Help Center
- Frequently Asked Questions
- Contact Support
- Send Feedback
- Report a Problem

Support flows should avoid requiring unnecessary personal information.

Diagnostic information should only be collected when necessary and should follow privacy rules.

---

#### Feedback

Users may be able to submit product feedback.

Feedback forms should:

- Remain optional
- Avoid collecting unnecessary sensitive information
- Clearly explain whether diagnostic information is included
- Allow users to report technical problems separately from general feedback

---

#### About Deep Focus

The About section may display:

- Application Version
- Product Information
- Terms of Service
- Privacy Policy
- Open Source Licenses where required
- Copyright Information

Version information may help users provide useful support reports.

---

#### Interaction Behavior

Users may:

- Edit profile information
- Update productivity preferences
- Change focus settings
- Manage notifications
- Change theme
- Review privacy controls
- Manage account security
- Connect or disconnect supported services
- Manage subscription where available
- Access support
- Sign out
- Delete their account

Changes should provide clear feedback.

Settings that can safely update immediately may do so without requiring a separate Save action.

---

#### Save Behavior

Settings should use one of two consistent patterns.

For immediate settings:

```text
Change Setting
      ↓
Validate
      ↓
Update State
      ↓
Persist
      ↓
Feedback if Needed
```

Examples may include:

- Theme
- Notification Toggle
- Sound Preference

For form-based settings:

```text
Edit Information
      ↓
Validate
      ↓
Save
      ↓
Persist
      ↓
Confirmation
```

The same setting should not behave unpredictably across different screens.

---

#### Persistence

User preferences should persist across application restarts where appropriate.

Persistent settings may include:

- Theme
- Notification Preferences
- Focus Preferences
- Default Session Duration
- Break Duration
- Personalization Preferences

Sensitive values should use secure storage where required.

---

#### Synchronization

If cloud synchronization is enabled, settings should synchronize predictably.

The application should:

- Preserve local changes
- Track pending synchronization
- Avoid silent data loss
- Resolve conflicts according to documented rules
- Continue using local settings when offline

Not every preference needs cloud synchronization.

---

#### Navigation

The Profile & Settings screen is accessed through the primary Profile destination.

```text
Bottom Navigation
      ↓
Profile
```

From Profile, users may navigate to individual setting screens.

Example:

```text
Profile
      ↓
Privacy & Security
```

or: 

```text
Profile
      ↓
Focus Settings
```

The Profile destination should not require every setting to appear on one long screen.

---

#### Bottom Navigation

The Profile screen should use the primary Bottom Navigation Bar during normal application use.

Primary destinations remain:

```text
Home | Focus | Analytics | Rewards | Profile
```

`Profile` should appear as the selected destination.

Secondary setting screens may use a Top App Bar and Back Navigation instead of displaying the entire settings hierarchy.

---

#### Active Focus Session Behavior

Profile and Settings should not unnecessarily interrupt an active focus session.

If users navigate to settings during an active session through an allowed workflow:

- Session state should remain preserved
- Settings changes should not silently terminate the session
- Changes affecting active-session behavior should be applied safely
- Some settings may require the next session before taking effect

The interface should explain delayed-effect settings where appropriate.

---

#### Empty States

Some sections may not contain information.

Examples include:

- No connected services
- No subscription
- No profile picture

Empty states should remain simple.

Example:

```text
No Connected Services

Connect supported services when
you want to extend Deep Focus.
```

Future-only sections should generally remain hidden rather than displaying empty placeholders.

---

#### Loading State

Most local settings should load quickly from persisted state.

Remote sections such as subscription or connected services may use isolated loading states.

The entire Profile screen should not remain blocked because one remote service is unavailable.

---

#### Offline Behavior

Core settings should remain available offline where practical.

Offline functionality may include:

- Theme
- Focus Preferences
- Notification Preferences
- Local Profile Information
- Local Data Controls

Remote-only functionality may display an appropriate offline message.

Example:

```text
You're Offline

Connected service settings will
be available when your connection returns.
```

---

#### Error Handling

Possible failures include:

- Preference Save Failure
- Profile Update Failure
- Authentication Error
- Cloud Sync Failure
- Integration Failure
- Subscription Load Failure

Failures should be isolated where practical.

The application should:

- Preserve previous valid values
- Roll back failed optimistic changes where required
- Provide understandable feedback
- Avoid exposing technical details
- Allow retry for recoverable failures

---

#### Privacy

The Profile & Settings area should provide users with meaningful control over their information.

Deep Focus should:

- Clearly explain privacy-sensitive settings
- Avoid unnecessary data collection
- Keep optional integrations opt-in
- Allow AI personalization controls
- Support data deletion controls
- Avoid hidden data-sharing settings
- Keep privacy-sensitive defaults conservative

Privacy controls should remain understandable rather than being buried in technical terminology.

---

#### Accessibility

The Profile & Settings screen should:

- Support screen readers
- Maintain WCAG-compliant contrast
- Support dynamic text sizing
- Maintain logical navigation order
- Provide descriptive labels
- Expose toggle states accessibly
- Use sufficiently large touch targets
- Avoid relying solely on color
- Support keyboard navigation where applicable
- Respect reduced-motion accessibility settings

Setting descriptions should remain readable with larger text sizes.

---

#### Reduced Motion

Settings transitions should respect reduced-motion preferences.

When reduced motion is enabled:

- Decorative page transitions should be reduced
- Toggle animations should remain subtle
- Functional state changes should remain clear

Settings functionality should never depend on animation.

---

#### Performance

The Profile & Settings experience should remain responsive.

Implementation should:

- Load local settings efficiently
- Avoid unnecessary remote requests
- Avoid re-rendering unrelated settings
- Persist changes efficiently
- Avoid repeated synchronization
- Lazy-load future integration sections when appropriate

The screen should remain responsive even when optional connected services are unavailable.

---

#### Security

Sensitive settings should follow the Deep Focus Security Architecture.

Security-sensitive operations may require:

- Re-Authentication
- Secure Storage
- Confirmation
- Server-Side Authorization
- Provider-Specific Security Checks

The UI should never be the sole authority for sensitive account actions.

---

#### Future Improvements

Future versions may include:

- Multi-Language Interface
- Localized AI Guidance
- Regional Personalization
- Voice Preferences
- Smart Device Synchronization
- Cloud Backup
- Cross-Platform Preferences
- Advanced Connected Services
- Family Accounts
- Enterprise Account Management
- Advanced Security Controls
- Connected Device Management
- Personalized Settings Recommendations

Future settings should be introduced only when they provide clear user value and remain aligned with privacy, security, accessibility, and the Deep Focus philosophy.

---

## 10. Animations

Animations in Deep Focus are designed to enhance the user experience without creating unnecessary distractions.

Rather than using decorative motion, animations should communicate state changes, guide user attention, and provide meaningful feedback while preserving a calm and focused environment.

Every animation should feel smooth, natural, purposeful, and consistent with the Deep Focus design philosophy.

Animations should never become necessary for understanding important information or completing essential actions.

---

### 10.1 Animation Principles

Animations should:

- Support user understanding
- Reinforce interactions
- Communicate meaningful state changes
- Maintain visual calmness
- Reduce cognitive load
- Never interrupt active focus unnecessarily
- Avoid excessive or decorative motion
- Respect accessibility preferences
- Remain responsive and lightweight

If an animation does not improve clarity, feedback, or usability, it should generally be avoided.

---

### 10.2 Motion Style

The overall motion language should be:

- Smooth
- Minimal
- Responsive
- Consistent
- Premium
- Calm
- Purposeful

Large, aggressive, repetitive, or attention-grabbing animations should be avoided.

During active focus sessions, motion should be reduced to only what is necessary to communicate session progress and important state changes.

---

### 10.3 Animation Timing

Animations should remain short enough to preserve a responsive interface.

Recommended timing ranges include:

| Animation Type | Duration |
|---|---:|
| Button Feedback | 100–150ms |
| Small State Changes | 150–200ms |
| Card Transitions | 150–250ms |
| Screen Transitions | 200–300ms |
| Modal Transitions | 200–300ms |
| Bottom Sheet Transitions | 250–350ms |

These values are guidelines and may be adjusted when platform-native behavior provides a better experience.

Animations should never make users wait unnecessarily before continuing an interaction.

---

### 10.4 Standard Animations

The application may include:

- Screen transitions
- Button press feedback
- Card elevation or state transitions
- Modal transitions
- Bottom sheet animations
- Navigation transitions
- Progress animations
- Loading indicators
- Toggle transitions
- Expand and collapse animations

Similar components should use consistent animation behavior throughout the application.

---

### 10.5 Focus Session Animations

The Focus Session experience should include only subtle animations that reinforce concentration without becoming distracting.

Examples include:

- Circular timer progress
- Smooth countdown presentation
- Session start transition
- Pause and resume transitions
- Session completion animation
- Progress ring animation

Animations should remain lightweight to avoid unnecessary battery usage.

Focus session timing must never depend on animation frames or rendering frequency.

The timer should use the underlying session timing system as its source of truth, while animation only represents that state visually.

---

### 10.6 AI Interaction Animations

AI-generated content should appear naturally through subtle visual feedback.

Examples include:

- AI processing indicators
- Fade-in recommendations
- Recommendation card transitions
- Insight generation states

These animations should communicate that processing is occurring without making the AI experience feel overly playful or distracting.

Artificial delays should not be introduced solely to make AI responses appear more intelligent.

---

### 10.7 Reward Animations

Achievements should be celebrated with restrained visual feedback.

Examples include:

- Badge unlock animation
- Streak celebration
- Progress milestone animation
- XP progress animation
- Reward collection animation

Celebrations should feel satisfying while remaining consistent with the application's calm design philosophy.

Reward animations should never interrupt an active focus session.

---

### 10.8 Loading States

Deep Focus should use lightweight loading feedback appropriate to the expected waiting time and content.

Examples include:

- Skeleton placeholders
- Progress indicators
- Activity indicators
- Subtle pulse animations

Loading feedback should clearly communicate that the application is processing a request.

Skeleton placeholders should be preferred when the structure of the incoming content is already known.

Loading animations should not create unnecessary visual flicker for operations that complete almost immediately.

---

### 10.9 Reduced Motion

Deep Focus should respect the device's reduced-motion accessibility preference where supported.

When reduced motion is enabled:

- Decorative animations should be reduced or disabled
- Large movement should be replaced with simpler transitions
- Continuous motion should be minimized
- Reward animations should be simplified
- Screen transitions may use simple fades or immediate state changes

Important information and functionality must remain fully available without animation.

Reduced-motion support is an accessibility requirement rather than a future enhancement.

---

### 10.10 Interaction and Interruption

Animations should not unnecessarily block user interaction.

Where practical:

- Users should be able to continue interacting while animations complete
- Navigation should remain responsive
- New state changes should safely interrupt outdated animations
- Decorative animations should never delay important actions

Application state should always take priority over visual animation state.

---

### 10.11 Background Behavior

Animations should not continue unnecessarily when Deep Focus enters the background.

When the application is backgrounded:

- Decorative animations should stop
- Unnecessary rendering should stop
- Focus timing should continue through timestamps rather than animation
- Visual progress should be recalculated when the application returns to the foreground

Background animation behavior should follow the Focus Session and Performance Architecture rules.

---

### 10.12 Performance

Animations should maintain smooth performance across supported devices.

Animation implementation should:

- Avoid unnecessary simultaneous animations
- Minimize expensive layout calculations
- Avoid unnecessary continuous animation loops
- Stop animations that are no longer visible
- Remain lightweight during long focus sessions
- Minimize unnecessary battery consumption
- Be tested on representative supported devices

Motion should never reduce application responsiveness, compromise focus-session accuracy, or negatively affect battery life without meaningful user value.

If an animation causes measurable performance problems, usability and responsiveness should take priority over preserving the visual effect.

---

### 10.13 Future Improvements

Future versions may introduce:

- Adaptive animations based on user preferences
- Personalized motion intensity
- Additional motion accessibility controls
- Device-performance-aware animation adjustment
- Context-aware transitions
- Seasonal celebration animations

Future animation features should continue following the same accessibility, performance, and distraction-reduction principles.

---

### 10.14 Animation Principles Summary

Every animation in Deep Focus should:

- Have a clear purpose
- Improve understanding or feedback
- Remain calm and predictable
- Avoid distracting active focus
- Respect reduced-motion preferences
- Preserve application responsiveness
- Avoid unnecessary battery usage
- Remain consistent across similar components
- Never control application timing or business logic

Motion should support the Deep Focus experience without becoming the focus of the experience.

---

## 11. Accessibility

Deep Focus is committed to creating an inclusive experience that is usable by as many people as possible, regardless of their abilities, devices, or environments.

Accessibility is considered a core design requirement rather than an optional feature or future enhancement.

Every screen, interaction, component, animation, and piece of content should support clarity, usability, and equal access.

The application should follow internationally recognized accessibility standards, including the Web Content Accessibility Guidelines (WCAG), where applicable to the supported platforms.

Accessibility should be considered during design and implementation rather than added after features are completed.

---

### 11.1 Accessibility Principles

The interface should:

- Be easy to read and understand
- Support screen readers
- Support keyboard navigation where applicable
- Maintain sufficient color contrast
- Avoid relying solely on color to communicate information
- Provide clear and predictable interactions
- Minimize unnecessary cognitive load
- Respect system accessibility preferences
- Support scalable text
- Provide sufficiently large interactive targets
- Avoid unnecessary motion
- Maintain accessibility across light and dark themes

Important functionality should remain usable without depending on a single visual, auditory, motion-based, or color-based cue.

---

### 11.2 Visual Accessibility

The interface should provide:

- Sufficient color contrast
- Clear typography
- Readable font sizes
- Consistent spacing
- Large touch targets
- Distinct interactive elements
- Clear visual hierarchy
- Visible state changes
- Predictable layouts

Users should be able to distinguish important information, actions, navigation elements, and application states without unnecessary visual effort.

Decorative elements should never reduce readability or interfere with important content.

---

### 11.3 Color Accessibility

Color should enhance communication but should never be the only indicator of meaning.

Whenever color communicates information such as:

- Success
- Warning
- Error
- Selection
- Progress
- Session state
- Reward status
- AI recommendation priority

The interface should also provide another indicator such as:

- Icons
- Labels
- Supporting text
- Shapes
- Patterns
- State descriptions

This ensures that information remains understandable for users with color vision deficiencies.

Color contrast should follow applicable WCAG requirements.

Contrast should be verified in both Light Mode and Dark Mode.

---

### 11.4 Typography Accessibility

Text should remain readable across supported screen sizes and devices.

Typography should:

- Use readable font sizes
- Maintain adequate line height
- Maintain appropriate spacing
- Avoid decorative fonts for essential content
- Preserve strong contrast against backgrounds
- Support dynamic text scaling
- Avoid unnecessarily long text blocks
- Maintain clear heading hierarchy

Body text should generally follow the minimum size defined by the Deep Focus Typography System.

Important information should not depend on unusually small text.

---

### 11.5 Dynamic Text Scaling

Deep Focus should respect supported operating-system text-size and accessibility preferences.

Layouts should adapt when users increase text size.

When text scaling occurs:

- Important content should remain visible
- Text should not overlap other content
- Buttons should expand where necessary
- Cards should adapt vertically
- Labels should not become clipped unnecessarily
- Navigation should remain understandable
- Important actions should remain accessible

Fixed-height containers should be avoided where they prevent accessible text scaling.

---

### 11.6 Touch Target Accessibility

Interactive elements should provide sufficiently large touch areas.

Primary interactive elements should generally provide a minimum touch target of:

```text
44 × 44 points/pixels or the applicable platform accessibility minimum
```

This includes:

- Buttons
- Icon Buttons
- Navigation Items
- Checkboxes
- Radio Buttons
- Toggles
- Close Controls
- Timer Controls
- Card Actions

Visible icons may be smaller than the touch target if the interactive area surrounding them remains sufficiently large.

Interactive elements should also maintain enough spacing to reduce accidental activation.

---

### 11.7 Screen Reader Support

Important interface elements should provide meaningful accessibility information.

Components should expose appropriate:

- Accessibility labels
- Roles
- States
- Values
- Hints where necessary

For example, a timer should communicate meaningful information such as:

```text
Focus session, 24 minutes 35 seconds remaining.
```

rather than exposing unrelated visual elements individually.

Decorative icons and illustrations that provide no meaningful information should not create unnecessary screen-reader noise.

---

### 11.8 Semantic Structure

Screens should use meaningful structural hierarchy wherever supported.

Content should clearly distinguish:

- Screen Titles
- Section Headings
- Navigation
- Buttons
- Inputs
- Lists
- Dialogs
- Status Information

Visual appearance alone should not determine semantic meaning.

Correct semantics help assistive technologies understand the structure and purpose of the interface.

---

### 11.9 Focus Order

Keyboard and assistive-technology focus should follow a logical order.

Focus should generally follow the visual and reading sequence of the screen.

The application should avoid:

- Unexpected focus jumps
- Hidden elements receiving focus
- Focus becoming trapped unintentionally
- Important controls being skipped
- Focus moving without a meaningful reason

When a modal or critical overlay opens, focus should move appropriately into that interface.

When it closes, focus should return to a logical location whenever practical.

---

### 11.10 Keyboard Accessibility

Where keyboard interaction is supported, users should be able to access important functionality without requiring touch input.

Keyboard navigation should support:

- Logical focus movement
- Activation of controls
- Form completion
- Dialog interaction
- Navigation
- Dismissal of appropriate overlays

Visible focus indicators should remain clear and should not be removed purely for visual reasons.

---

### 11.11 Input Accessibility

Input components should provide:

- Persistent or clearly associated labels
- Appropriate input types
- Clear instructions
- Accessible validation messages
- Required-field identification
- Understandable error recovery

Placeholder text should not be used as the only label for important inputs.

When validation fails, users should understand:

- What went wrong
- Which field requires attention
- How the problem can be corrected

User-entered information should be preserved whenever practical after validation errors.

---

### 11.12 Motion Accessibility

Users who are sensitive to motion should be able to use Deep Focus comfortably.

The application should respect the operating system's reduced-motion preference where supported.

When reduced motion is enabled:

- Decorative motion should be reduced or disabled
- Large transitions should be simplified
- Continuous animation should be minimized
- Reward animations should be simplified
- Parallax-style effects should be avoided
- Essential information should remain available without animation

No important functionality should depend entirely on motion.

Reduced-motion support should follow the rules defined in the Animation section.

---

### 11.13 Haptic and Audio Accessibility

Haptic feedback and sound may reinforce interactions where appropriate.

However, neither should be the only method used to communicate important information.

Important feedback should also have a visual or textual representation.

Users should remain able to understand application state when:

- Device sound is disabled
- Haptic feedback is unavailable
- Haptic feedback is disabled
- The environment makes audio difficult to hear

Audio and haptic feedback should remain optional where appropriate.

---

### 11.14 Focus Session Accessibility

The Focus Session is a core Deep Focus experience and should remain fully accessible.

The Focus Session should:

- Provide readable remaining time
- Expose timer information to screen readers
- Provide accessible Pause, Resume, and End controls
- Maintain large touch targets
- Avoid unnecessary motion
- Avoid flashing visual effects
- Maintain sufficient contrast
- Support dynamic text scaling
- Respect reduced-motion preferences

The circular progress ring should not be the only representation of session progress.

Remaining time should also be available through text and accessibility information.

---

### 11.15 AI Accessibility

AI-generated recommendations should remain accessible and understandable.

AI content should:

- Use clear language
- Avoid unnecessary technical terminology
- Support screen readers
- Maintain readable formatting
- Avoid relying solely on visual presentation
- Clearly distinguish recommendations from required actions

AI recommendations should remain suggestions and should never create inaccessible workflows that prevent users from completing actions manually.

---

### 11.16 Analytics Accessibility

Charts and visual analytics should provide meaningful non-visual alternatives.

Important charts should include:

- Descriptive titles
- Accessible labels
- Text summaries
- Important values
- Trend descriptions where appropriate

For example, instead of relying only on a line chart, the interface may also communicate:

```text
Your total focus time increased by 18% compared with last week.
```

Users should not need to interpret color alone to understand chart categories or trends.

---

### 11.17 Feedback Accessibility

Success, warning, loading, and error states should be communicated accessibly.

Important state changes should provide understandable feedback through appropriate combinations of:

- Text
- Icons
- Accessibility announcements
- Visual state changes
- Haptic feedback where appropriate

Temporary feedback such as Toasts and Snackbars should remain available long enough to be understood.

Critical information should not disappear before users can reasonably perceive it.

---

### 11.18 Overlay Accessibility

Modals, Bottom Sheets, confirmation dialogs, and other overlays should remain accessible.

Overlays should:

- Provide descriptive titles
- Expose appropriate accessibility semantics
- Move focus appropriately
- Prevent unintended interaction with hidden background content
- Provide accessible dismissal controls where dismissal is allowed
- Return focus appropriately after closing

Critical actions should remain understandable without depending on visual layout alone.

---

### 11.19 Cognitive Accessibility

Deep Focus should reduce unnecessary cognitive effort.

Interfaces should:

- Use clear and consistent language
- Keep navigation predictable
- Avoid unnecessary choices
- Break complex workflows into manageable steps
- Provide clear progress indicators
- Maintain consistent component behavior
- Avoid excessive notifications
- Avoid unnecessarily complex instructions

Error messages should explain recovery rather than simply report failure.

The overall experience should remain calm and predictable.

---

### 11.20 Internationalization and Localization

Deep Focus is designed to support a global audience.

The architecture and design system should support future:

- Multiple languages
- Regional date formats
- Regional time formats
- Localized numbers
- Localized content
- Right-to-left (RTL) layouts where applicable
- Longer translated text
- Regional accessibility requirements

Layouts should avoid assumptions that all translated text will occupy the same amount of space as English.

Localization should preserve usability, accessibility, and the overall Deep Focus design language.

---

### 11.21 Accessibility and Notifications

Notifications should remain understandable and non-disruptive.

Notification content should:

- Use clear language
- Avoid unnecessary urgency
- Avoid relying solely on emoji or symbols
- Provide meaningful context
- Respect notification preferences
- Avoid unnecessary interruption during active focus sessions

Important notification actions should have understandable labels where supported.

---

### 11.22 Accessibility Testing

Accessibility should be tested throughout development rather than only before release.

Testing should include, where applicable:

- Screen reader navigation
- Dynamic text scaling
- Reduced-motion mode
- Color contrast
- Color vision considerations
- Touch target sizes
- Keyboard navigation
- Focus order
- Form validation
- Modal and overlay behavior
- Light and Dark Modes

Core workflows should receive particular attention.

These include:

```text
Authentication
      ↓
Onboarding
      ↓
Home Dashboard
      ↓
Focus Session
      ↓
Session Summary
```

Automated accessibility checks may support development, but they should not replace manual testing of important user journeys.

---

### 11.23 Accessibility Regression

New features and design changes should not unintentionally reduce existing accessibility.

When shared components are modified, developers should verify that accessibility behavior remains correct across screens that use those components.

Accessibility regressions should be treated as product-quality issues rather than cosmetic defects.

---

### 11.24 Continuous Improvement

Accessibility should be continuously reviewed throughout the product lifecycle.

Future improvements may include:

- Advanced screen reader optimization
- Voice navigation
- Additional text customization
- High-contrast themes
- Dyslexia-friendly reading options
- Additional keyboard controls
- Expanded accessibility preferences
- AI-assisted accessibility features

Future accessibility features should complement rather than replace strong baseline accessibility.

---

### 11.25 Accessibility Principles Summary

Every Deep Focus experience should:

- Remain understandable
- Remain perceivable
- Remain operable
- Support assistive technologies
- Maintain sufficient contrast
- Support scalable text
- Provide accessible touch targets
- Avoid relying solely on color
- Avoid relying solely on motion, sound, or haptics
- Respect accessibility preferences
- Maintain predictable navigation
- Provide accessible feedback
- Support cognitive clarity
- Be tested throughout development

Accessibility should remain part of the definition of a complete Deep Focus feature rather than an optional improvement added later.

---

## 12. Future UI Improvements

Deep Focus is designed with long-term scalability in mind.

While the first release focuses on delivering a simple, calm, accessible, and highly effective user experience, future versions may gradually introduce more advanced interface capabilities as the platform evolves.

Future UI improvements should be introduced only when they provide meaningful user value.

New capabilities should not increase interface complexity, cognitive load, or distraction without a clear benefit.

Every improvement should continue to support the core philosophy of Deep Focus: helping users achieve meaningful work through intelligent, user-controlled, and distraction-free design.

---

### 12.1 Future UI Principles

Future interface improvements should:

- Solve a meaningful user problem
- Preserve simplicity and clarity
- Avoid unnecessary interface complexity
- Maintain consistency with the Design System
- Respect accessibility requirements
- Protect user privacy
- Preserve user control
- Remain performant across supported devices
- Integrate naturally with existing workflows
- Avoid disrupting active focus sessions
- Support gradual platform growth

New functionality should not be introduced simply because the technology is available.

The user experience should remain the primary reason for introducing any new interface capability.

---

### 12.2 Personalization

Future versions may provide increasingly personalized interfaces based on user preferences, work habits, goals, and behavioral patterns.

Potential improvements include:

- Personalized dashboard layouts
- Adaptive home screen widgets
- Frequently used action shortcuts
- Personalized content prioritization
- Dynamic focus recommendations
- Context-aware quick actions
- AI-assisted interface customization

Personalization should remain predictable and user-controlled.

The interface should not change dramatically without explanation or create uncertainty about where important functionality is located.

Users should be able to override or disable adaptive interface behavior where appropriate.

---

### 12.3 AI-Powered Interface

As Deep Focus evolves, Artificial Intelligence may become more deeply integrated into the user experience.

The proposal-first `Plan My Day` experience is now part of the approved V1
scope. `Break Down This Task` and `Review My Day Lite` are conditional V1 targets
under `V1_FEATURE_SCOPE.md`. The enhancements below refer to deeper adaptive or
post-V1 versions unless that scope document explicitly includes them.

Possible enhancements include:

- Advanced adaptive AI-generated daily planning
- Context-aware recommendations
- Smart notification prioritization
- Predictive productivity insights
- Personalized workflow suggestions
- Natural language interactions
- Intelligent goal assistance
- Context-aware productivity coaching

AI-generated interface changes and recommendations should remain transparent and optional.

AI should not:

- Remove important functionality automatically
- Reorganize critical navigation unpredictably
- Make irreversible decisions without confirmation
- Interrupt active focus sessions unnecessarily
- Reduce user control over the interface

AI should enhance the interface without making normal application functionality dependent on AI availability.

---

### 12.4 Advanced Focus Experience

The focus environment may continue evolving through features such as:

- Dynamic ambient themes
- Adaptive soundscapes
- Personalized focus modes
- Smart recovery experiences
- Intelligent session recommendations
- Context-aware focus environments
- Adaptive session interfaces

Advanced focus experiences should remain visually calm and lightweight.

Personalization should never introduce unnecessary animation, information, or controls during active focus sessions.

The core Focus Session should remain usable even when advanced features are disabled or unavailable.

---

### 12.5 Cross-Platform Experience

Future versions should provide a consistent Deep Focus experience across multiple platforms.

Potential platforms include:

- Android
- iOS
- Tablet devices
- Web application
- Desktop application
- Wearable devices

The experience should preserve the same:

- Visual identity
- Core terminology
- User expectations
- Productivity philosophy
- Accessibility principles

Platform-specific interaction patterns may differ where appropriate.

Examples may include:

- Navigation Rail on tablets
- Sidebar Navigation on desktop
- Keyboard shortcuts on desktop and web
- Compact session controls on wearable devices
- Platform-native gestures and controls

Cross-platform consistency should not require ignoring established platform conventions.

---

### 12.6 Cross-Device Continuity

Future versions may allow users to continue productivity workflows across supported devices.

Possible capabilities include:

- Synchronized preferences
- Shared focus history
- Goal synchronization
- Cross-device session visibility
- Continued productivity workflows
- Shared AI recommendations
- Notification coordination

Cross-device experiences should avoid duplicated notifications, conflicting session states, and unexpected synchronization behavior.

Users should clearly understand which device or session is currently active when relevant.

---

### 12.7 Productivity Ecosystem

Deep Focus may gradually integrate with third-party productivity services to reduce context switching and create a more unified productivity experience.

Potential integrations include:

- Calendar applications
- Task management platforms
- Note-taking applications
- Cloud storage services
- Team collaboration tools
- Health and wellness platforms

Integrations should remain optional.

Before connecting a service, users should understand:

- What information will be accessed
- Why the information is required
- What functionality the integration enables
- How the integration can be disconnected

Third-party integrations should never compromise the privacy, simplicity, or reliability of the core Deep Focus experience.

---

### 12.8 Global Experience

As the platform expands internationally, future improvements may include:

- Additional language support
- Regional localization
- Right-to-left (RTL) interface support
- Local date and time formats
- Local number formats
- Region-specific onboarding experiences
- Cultural design adaptations
- Localized AI experiences

Layouts should support different text lengths and writing directions without requiring major redesign.

Localization should preserve:

- Accessibility
- Meaning
- Navigation clarity
- Visual hierarchy
- Brand consistency

Cultural adaptation should improve usability without creating inconsistent product experiences.

---

### 12.9 Advanced Accessibility Enhancements

Baseline accessibility requirements defined in the Accessibility section should remain part of the core product experience.

Future versions may introduce additional accessibility capabilities beyond those baseline requirements.

Potential enhancements include:

- Advanced screen reader experiences
- Voice navigation
- Expanded accessibility customization
- Additional high-contrast options
- Dyslexia-friendly reading options
- Advanced keyboard navigation
- Personalized motion controls
- AI-assisted accessibility features

AI-powered accessibility features should supplement standard accessibility support rather than replace it.

Essential application functionality should never depend on AI accessibility assistance.

---

### 12.10 Design System Evolution

The Deep Focus Design System should evolve alongside the product while preserving consistency and familiarity.

Future improvements may include:

- Expanded component library
- Additional UI patterns
- Enhanced design tokens
- Expanded semantic color tokens
- Improved motion tokens
- Responsive layout enhancements
- Advanced theming capabilities
- Platform-specific component adaptations

New components should reuse existing patterns whenever practical.

A new component or pattern should generally be introduced only when existing components cannot solve the requirement clearly and effectively.

Design System changes should be documented so that future screens continue using consistent behavior and visual language.

---

### 12.11 Future Feature Introduction

Future UI features should be introduced through a controlled process.

A simplified evaluation flow may follow:

```text
User Need
    ↓
Product Requirement
    ↓
UX Evaluation
    ↓
Accessibility Review
    ↓
Privacy Review
    ↓
Design System Review
    ↓
Prototype
    ↓
Usability Testing
    ↓
Implementation
    ↓
Performance Validation
    ↓
Release
```

Not every future concept should automatically become part of the product.

Before introducing a significant interface feature, the project should consider:

- Does this solve a real user problem?
- Does it simplify or complicate the experience?
- Does it align with the Deep Focus philosophy?
- Can users understand it easily?
- Is it accessible?
- Does it preserve privacy?
- Does it perform reliably?
- Can it integrate with the existing Design System?
- Can it be removed or changed later without major disruption?

Future expansion should remain deliberate rather than feature-driven.

---

### 12.12 Long-Term Vision

The long-term vision is to evolve Deep Focus from a productivity application into an intelligent productivity ecosystem that adapts to each user, supports sustainable high performance, and integrates naturally with the tools people already use.

As the interface evolves, Deep Focus should become more capable without becoming more difficult to use.

Advanced intelligence, personalization, integrations, and cross-platform capabilities should remain largely invisible when they are not needed.

Every future enhancement should strengthen the product while preserving the qualities that define Deep Focus:

- Simplicity
- Calmness
- Clarity
- Accessibility
- Privacy
- Reliability
- User control
- Sustainable productivity

The interface should evolve with the platform without losing the simplicity that makes Deep Focus effective.

---

## 13. Approved V1 AI Experience Addendum

This section defines the screen-level requirements introduced by the V1 AI scope
decision. Existing screens and workflows remain unchanged unless this addendum
explicitly extends them.

### 13.1 Shared Proposal-First Flow

`Plan My Day` and `Break Down This Task` must use a proposal-first interaction:

```text
Request
  ↓
AI Processing
  ↓
Validated Proposal Preview
  ↓
Edit / Reject / Retry / Confirm
  ↓
Apply Only Confirmed Items
  ↓
Success or Recoverable Error
```

The preview must clearly distinguish:

- existing user data;
- AI-generated suggestions;
- items that will be created or changed after confirmation;
- items that the user removed or edited;
- any unsupported item that cannot be applied.

The primary confirmation button should state the real outcome, such as `Add 4
Tasks and 3 Reminders`, instead of using a vague label such as `Continue`.

### 13.2 Plan My Day

#### Version Availability

✅ V1 (Required AI Feature)

The entry point may appear on Home or in another approved planning surface. It
must not become a permanent chatbot tab merely to expose one workflow.

The request experience may include:

- available-time input;
- selection of relevant existing tasks;
- optional new task text within approved limits;
- supported planning preferences;
- clear AI processing disclosure;
- current AI action availability.

The proposal preview may include:

- ordered task blocks;
- proposed focus durations;
- proposed breaks;
- proposed reminders;
- short explanations where useful;
- per-item edit or removal controls;
- `Reject`, `Retry`, and explicit `Confirm` actions.

No task or reminder should appear as saved before confirmation succeeds. If only
part of a confirmed apply operation succeeds, the interface must identify the
exact applied and unapplied items and provide safe recovery.

### 13.3 Break Down This Task

#### Version Availability

Conditional V1 target after core stability.

The user selects one task and receives a structured list of smaller proposed
steps. Each step should be editable and removable. The interface may display a
suggested order or focus-session estimate without presenting it as guaranteed.

The confirmation action must state how many supported subtasks will be created.
Rejecting the proposal leaves the original task unchanged.

### 13.4 Review My Day Lite

#### Version Availability

Conditional V1 target when release capacity remains.

The review should be a concise, secondary surface rather than a long chat. It may
present:

- verified completed tasks;
- verified completed sessions and focus time;
- goal, streak, and reward progress;
- one short generated summary;
- one practical suggestion for the next day.

The UI must visually separate verified metrics from generated interpretation and
must not display medical, psychological, fatigue, attention, or burnout claims.

### 13.5 AI Action Availability

Before an AI request begins, the interface should make unavailable access states
understandable.

The first five eligible AI actions are introductory free actions. When none
remain, the user may be offered a rewarded unlock with:

- a clear explanation of what is being unlocked;
- an optional `Watch Ad to Unlock` action;
- a cancel action;
- advertisement loading, unavailable, cancelled, verification, success, and
  failure states;
- no false grant before trusted verification succeeds.

The exact action count and validity granted by one advertisement remain
server-configured until approved. Rewarded advertising must not appear during an
active Focus Session or True Zen Break.

### 13.6 Accessibility and Failure Behavior

All V1 AI flows must:

- support screen readers and logical focus order;
- provide accessible processing and result announcements without excessive
  repetition;
- use adequate touch targets and clear labels;
- remain usable with larger text and reduced motion;
- preserve user edits when a safe retry is possible;
- provide manual paths when AI or rewarded access is unavailable;
- avoid blocking unrelated navigation or core productivity features.

---
