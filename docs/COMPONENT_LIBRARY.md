# Deep Focus Component Library

---

## Overview

The Deep Focus Component Library defines every reusable user interface component used throughout the Deep Focus platform.

Instead of designing every screen independently, the application is built from a collection of reusable UI components that share a common visual language, interaction behavior, accessibility standards, and design philosophy.

Using a centralized component library improves consistency, reduces development time, simplifies maintenance, and allows the platform to scale efficiently as new features are introduced.

This document serves as the primary reference for designers, frontend developers, mobile developers, QA engineers, and future contributors.

---

## 1. Design Philosophy

Every component should:

- Feel calm and distraction-free
- Be visually consistent
- Support both Light Mode and Dark Mode
- Prioritize accessibility
- Be reusable across multiple screens
- Provide clear interaction feedback
- Follow the Deep Focus design language

The component library is designed around the principle that every interface element should help users focus on meaningful work while minimizing unnecessary visual complexity.

Components should remain simple, predictable, and scalable so that future features can be added without compromising the overall user experience.

---

## 2. Component Organization

The Deep Focus component system is divided into the following categories:

- Buttons
- Input Fields
- Cards
- Navigation Components
- Focus Session Components
- Analytics Components
- Reward Components
- AI Components
- Feedback Components
- Overlay Components
- Profile Components
- Settings Components

Each category defines reusable UI elements that can be shared throughout the application to maintain consistency and reduce duplicated design and development effort.

Every component should include standardized documentation covering:

- Purpose
- Usage
- Variants
- States
- Properties
- Accessibility
- Interaction Behavior
- Future Improvements

This structure ensures that every component follows the same design language and remains easy to maintain as the platform grows.

---

## Component Development Principles

Every reusable component should follow these principles.

### Reusable

Components should be designed once and reused throughout the application whenever possible.

---

### Consistent

Visual appearance, spacing, typography, colors, and interaction behavior should remain consistent across all screens.

---

### Modular

Each component should have a single responsibility and should not depend unnecessarily on unrelated components.

---

### Accessible

Components should support users with different accessibility needs, including screen readers, sufficient touch targets, keyboard navigation where applicable, and high color contrast.

---

### Responsive

Components should adapt naturally to different device sizes, orientations, and future platforms without requiring redesign.

---

### Performant

Components should remain lightweight, responsive, and optimized for smooth animations and minimal resource consumption.

---

### Scalable

The component library should support future product expansion without requiring significant architectural changes.

New components should integrate naturally into the existing design system while maintaining consistency throughout the platform.

---

## 3. Buttons

Buttons are the primary interactive components within the Deep Focus platform.

They allow users to perform actions, confirm decisions, navigate between screens, and interact with the application.

Every button should clearly communicate its purpose while maintaining a calm, modern, and consistent visual appearance.

Buttons should always provide immediate visual feedback and remain accessible across all supported devices.

---

### Button Design Principles

All buttons should:

- Clearly indicate their purpose
- Maintain consistent sizing and spacing
- Support both Light Mode and Dark Mode
- Provide immediate interaction feedback
- Remain easily accessible
- Follow the Deep Focus color system
- Use clear and concise labels

---

### Primary Button

#### Purpose

Used for the most important action on a screen.

Only one Primary Button should typically appear within a major content section.

#### Examples

- Start Focus Session
- Continue
- Save Changes
- Complete Assessment
- Create Goal

#### Visual Characteristics

- Filled background
- Deep Indigo brand color
- Rounded corners
- High emphasis
- White text

#### States

- Default
- Pressed
- Hover (Desktop/Web)
- Focused
- Disabled
- Loading

---

### Secondary Button

#### Purpose

Used for supporting actions that are important but not the primary action.

#### Examples

- Cancel
- Skip
- Edit
- View Details

#### Visual Characteristics

- Outlined style
- Transparent background
- Deep Indigo border
- Brand-colored text

#### States

- Default
- Pressed
- Hover
- Focused
- Disabled

---

### Ghost Button

#### Purpose

Used for low-emphasis actions that should remain available without drawing unnecessary attention.

#### Examples

- Learn More
- Dismiss
- View History

#### Visual Characteristics

- No border
- Transparent background
- Text only
- Minimal emphasis

#### States

- Default
- Hover
- Pressed
- Disabled

---

### Icon Button

#### Purpose

Used when an icon communicates the action more effectively than text.

#### Examples

- Back
- Close
- Search
- Notifications
- Settings
- Refresh

#### Design Guidelines

- Use recognizable icons
- Provide accessibility labels
- Maintain consistent touch targets
- Include visual feedback on interaction

---

### Floating Action Button (FAB)

#### Purpose

Provides quick access to the application's most frequently used action.

The Floating Action Button should be used sparingly to avoid distracting users.

#### Possible Usage

- Quick Focus Session
- Quick Note
- Emergency Focus

#### Design Guidelines

- Circular shape
- Elevated appearance
- Deep Indigo background
- White icon
- Subtle shadow

---

### Loading Button

#### Purpose

Indicates that an action is currently being processed.

The button should remain visible while preventing repeated user input.

#### Behavior

- Display loading indicator
- Disable additional taps
- Preserve button dimensions
- Restore original state after completion

---

### Disabled Button

#### Purpose

Indicates that an action is currently unavailable.

Disabled buttons should communicate that the action exists while making it visually clear that interaction is not currently possible.

#### Examples

- Incomplete Form
- Locked Feature
- Unavailable Action

---

### Button Sizes

The design system supports multiple button sizes to accommodate different interface requirements.

#### Small

Used in compact layouts and secondary interfaces.

#### Medium

Default size used throughout the application.

#### Large

Used for high-priority actions and onboarding screens.

---

### Accessibility

All buttons must:

- Meet WCAG contrast requirements
- Include descriptive accessibility labels
- Maintain minimum touch target sizes
- Support screen readers
- Support keyboard navigation where applicable
- Provide visible focus indicators

---

### Future Improvements

Future versions of the component library may introduce additional button variants, including:

- AI Action Button
- Split Button
- Toggle Button
- Multi-State Button
- Voice Command Button
- Smart Recommendation Button

These components should integrate seamlessly into the existing design system while maintaining visual consistency and usability.

---