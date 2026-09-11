# Deep Focus Color System

This document is the **canonical source of truth for Deep Focus colors and theme behavior**.

If a color value, color role, or light/dark theme rule in another document conflicts with this file, **this file takes precedence for color decisions** until the conflicting document is updated.

The goal of the Deep Focus visual system is to create an interface that feels calm, focused, motivating, accessible, and premium without becoming visually noisy or overstimulating.

---

## 1. Theme Intent

Deep Focus supports two coordinated themes that represent the same product identity.

### Light Mode

**Clean · Calm · Motivating · Productive**

Light Mode should feel bright and fresh without becoming glaring. It uses a soft cool background, white surfaces, dark slate text, and restrained blue/teal emphasis.

### Dark Mode

**Deep · Calming · Focused · Motivating**

Dark Mode should feel immersive and premium while reducing visual strain. It uses deep navy backgrounds rather than pure black and keeps the same semantic meanings as Light Mode.

### Core principle

Theme changes must not change the meaning of a color.

- Blue always represents focus, trust, and primary action.
- Teal always represents progress, growth, and balance.
- Purple always represents achievement, information, or special progress.
- Green always represents success and completion.
- Orange always represents attention, reminders, streak energy, or caution.
- Red always represents destructive, critical, overdue, or error states.
- Neutral colors carry most of the interface structure.

---

## 2. Canonical Light Mode Palette

| Semantic role | Token | Hex | Primary usage |
| --- | --- | --- | --- |
| Primary | `color.action.primary` | `#3B82F6` | Start Focus, active navigation, selected controls, key links |
| Secondary / Progress | `color.progress` | `#14B8A6` | Progress, growth, balance, healthy rhythm |
| Critical / Danger | `color.status.danger` | `#EF4444` | Destructive actions, errors, overdue states |
| Success | `color.status.success` | `#22C55E` | Completed tasks, completed sessions, success confirmations |
| Warning | `color.status.warning` | `#F59E0B` | Reminders, caution, upcoming attention, streak energy |
| Achievement / Info | `color.achievement` | `#8B5CF6` | Rewards, milestones, special informational emphasis |
| Background | `color.background` | `#F8FAFC` | Main screen canvas |
| Surface | `color.surface` | `#FFFFFF` | Cards, sheets, panels, modal surfaces |
| Text primary | `color.text.primary` | `#0F172A` | Headings, task names, important numbers, primary body copy |
| Text secondary | `color.text.secondary` | `#64748B` | Descriptions, metadata, helper copy |
| Border | `color.border.default` | `#E2E8F0` | Dividers, outlines, inactive controls |

### Light Mode supporting values

These are structural values derived from the canonical palette and may be used where a third hierarchy level is required.

| Role | Hex | Usage |
| --- | --- | --- |
| Text muted | `#94A3B8` | Low-emphasis metadata only; do not use for essential instructions |
| Primary soft tint | `#DBEAFE` | Selected backgrounds, focus chips, subtle primary emphasis |
| Secondary soft tint | `#CCFBF1` | Progress chips and restrained teal emphasis |
| Success soft tint | `#DCFCE7` | Completed-state backgrounds |
| Warning soft tint | `#FEF3C7` | Reminder/caution backgrounds |
| Danger soft tint | `#FEE2E2` | Error/destructive confirmation backgrounds |
| Achievement soft tint | `#EDE9FE` | Reward/milestone backgrounds |

Derived tints must remain subordinate to the canonical saturated colors and must not introduce a new semantic meaning.

---

## 3. Canonical Dark Mode Palette

| Semantic role | Token | Hex | Primary usage |
| --- | --- | --- | --- |
| Primary | `color.action.primary` | `#2982F6` | Start Focus, active navigation, selected controls, key links |
| Primary pressed / selected | `color.action.primaryPressed` | `#2563EB` | Pressed, selected, active-depth state |
| Secondary / Progress | `color.progress` | `#14B8A6` | Progress, growth, balance, healthy rhythm |
| Achievement / Info | `color.achievement` | `#8B5CF6` | Rewards, milestones, special informational emphasis |
| Critical / Danger | `color.status.danger` | `#EF4444` | Destructive actions, errors, overdue states |
| Success | `color.status.success` | `#22C55E` | Completed tasks, completed sessions, success confirmations |
| Warning | `color.status.warning` | `#F59E0B` | Reminders, caution, upcoming attention, streak energy |
| Background | `color.background` | `#0B1220` | Main dark screen canvas |
| Surface | `color.surface` | `#111827` | Cards, sheets, panels |
| Text primary | `color.text.primary` | `#F8FAFC` | Headings, important labels and values |
| Text secondary | `color.text.secondary` | `#94A3B8` | Descriptions, metadata, helper copy |

### Dark Mode supporting values

| Role | Hex | Usage |
| --- | --- | --- |
| Surface elevated / border | `#1F2937` | Raised surfaces, dividers, outlines |
| Text muted | `#64748B` | Low-emphasis metadata only |
| Primary soft surface | `#102A56` | Restrained selected/active surface; use sparingly |
| Teal soft surface | `#0F3D3A` | Restrained progress surface; use sparingly |

Dark Mode must **not** use pure black (`#000000`) as the normal application background. The intended visual hierarchy is deep navy background -> slightly lighter surface -> elevated/bordered surface.

---

## 4. Semantic Color Roles

### Blue — Focus and primary action

Blue is the main interaction color of Deep Focus.

Use it for:

- `Start Focus Session`;
- active primary navigation;
- selected focus controls;
- active links such as `View All`;
- active focus indicators where the emphasis is action rather than completion;
- focus-state controls and selected inputs.

Do not use primary blue on every card or icon. It must retain enough scarcity to make the primary action immediately recognizable.

### Teal — Progress, growth, and balance

Teal represents sustainable progress rather than urgency.

Use it for:

- focus progress;
- progress rings;
- healthy rhythm indicators;
- ongoing growth states;
- subtle progress iconography;
- recovery/focus balance indicators where appropriate.

Do not use teal as the main color of destructive or urgent controls.

### Purple — Achievement and special information

Purple is reserved for special, non-critical emphasis.

Use it for:

- rewards;
- achievements;
- milestones;
- special informational states;
- limited premium or celebratory emphasis where product scope permits it.

Do not use purple as the default primary CTA.

### Green — Success and completion

Use green only when the user has successfully completed or achieved something.

Examples:

- task completed;
- focus block completed;
- goal reached;
- operation succeeded.

Do not use green as generic decoration.

### Orange — Attention, reminder, and streak energy

Orange means **pay attention**, not **danger**.

Use it for:

- reminders;
- upcoming items;
- caution states;
- streak/fire indicators;
- time-sensitive but non-critical information.

### Red — Critical, error, overdue, and destructive

Red is the highest-attention semantic color and must remain scarce.

Use it for:

- End/Stop confirmation where the action is destructive;
- delete actions;
- critical errors;
- overdue states;
- failed operations requiring attention.

Do not use red as an ordinary motivation color or as the normal Start Focus CTA.

---

## 5. Theme Token Mapping

Components must consume semantic tokens rather than hard-coded palette names whenever possible.

Recommended token model:

```text
color.background
color.surface
color.surfaceElevated

color.text.primary
color.text.secondary
color.text.muted

color.action.primary
color.action.primaryPressed
color.action.secondary

color.progress
color.achievement

color.status.success
color.status.warning
color.status.danger
color.status.info

color.border.default
color.border.focus
```

Canonical mappings:

| Semantic token | Light | Dark |
| --- | --- | --- |
| `color.background` | `#F8FAFC` | `#0B1220` |
| `color.surface` | `#FFFFFF` | `#111827` |
| `color.surfaceElevated` | `#FFFFFF` | `#1F2937` |
| `color.text.primary` | `#0F172A` | `#F8FAFC` |
| `color.text.secondary` | `#64748B` | `#94A3B8` |
| `color.text.muted` | `#94A3B8` | `#64748B` |
| `color.action.primary` | `#3B82F6` | `#2982F6` |
| `color.action.primaryPressed` | `#2563EB` | `#2563EB` |
| `color.action.secondary` | `#14B8A6` | `#14B8A6` |
| `color.progress` | `#14B8A6` | `#14B8A6` |
| `color.achievement` | `#8B5CF6` | `#8B5CF6` |
| `color.status.success` | `#22C55E` | `#22C55E` |
| `color.status.warning` | `#F59E0B` | `#F59E0B` |
| `color.status.danger` | `#EF4444` | `#EF4444` |
| `color.status.info` | `#8B5CF6` | `#8B5CF6` |
| `color.border.default` | `#E2E8F0` | `#1F2937` |
| `color.border.focus` | `#3B82F6` | `#2982F6` |

---

## 6. Component Color Mapping

| UI element | Light Mode | Dark Mode |
| --- | --- | --- |
| App background | `#F8FAFC` | `#0B1220` |
| Card / sheet | `#FFFFFF` | `#111827` |
| Elevated card / selected surface | `#FFFFFF` + border/shadow | `#1F2937` or restrained selected surface |
| Primary heading | `#0F172A` | `#F8FAFC` |
| Secondary text | `#64748B` | `#94A3B8` |
| Primary CTA | `#3B82F6` | `#2982F6` |
| CTA pressed | `#2563EB` | `#2563EB` |
| Progress | `#14B8A6` | `#14B8A6` |
| Completed | `#22C55E` | `#22C55E` |
| Reminder / streak | `#F59E0B` | `#F59E0B` |
| Destructive / error | `#EF4444` | `#EF4444` |
| Achievement | `#8B5CF6` | `#8B5CF6` |
| Default divider / border | `#E2E8F0` | `#1F2937` |

---

## 7. Home Screen Rules

The Home screen must use the canonical palette without inventing independent Home colors.

### Next Focus

- heading -> text primary;
- supporting copy -> text secondary;
- Start Focus -> primary blue;
- progress/growth accent -> teal;
- selected focus state -> primary blue or a restrained primary tint.

The main focus card should not become a multi-color promotional card. The primary action must remain the strongest color signal.

### Today tasks

- normal task -> neutral;
- selected/in-progress task -> primary blue;
- completed task -> green;
- overdue task -> red;
- category labels -> subtle tints only; category color must not overpower task priority.

### Today's Focus

- progress ring/bar -> teal;
- main value -> text primary;
- metadata -> text secondary.

### Streak

- flame/attention marker -> orange;
- card surface remains neutral.

Do not fill the entire streak card with orange.

### Focus Cycles

The user-facing label is **Focus Cycles**, not Pomodoro.

Recommended compact preview:

`Focus Cycles · 25 / 5 × 4`

- inactive -> neutral surface;
- selected/enabled -> primary blue;
- break/progress accents -> teal.

### Home color stability

Time-of-day personalization may change copy such as `Good morning`, `Good afternoon`, or `Good evening`, but it must **not automatically replace the approved theme palette with morning/evening background palettes**.

Light Mode remains the canonical Light Mode palette throughout the day. Dark Mode remains the canonical Dark Mode palette throughout the day.

---

## 8. Navigation Rules

Bottom-navigation color behavior must remain consistent.

### Active item

- Light -> primary blue `#3B82F6`;
- Dark -> primary blue `#2982F6`.

### Inactive item

- Light -> text secondary `#64748B`;
- Dark -> text secondary `#94A3B8`.

Do not permanently assign a different saturated color to every navigation tab. Navigation hierarchy should come from active/inactive state, not a rainbow mapping.

---

## 9. Visual Balance

Deep Focus should remain predominantly neutral.

A useful visual target is:

- roughly 70-80% neutral background, surface, and text structure;
- roughly 15-20% blue/teal primary and progress emphasis;
- less than roughly 5-10% high-attention colors such as purple, green, orange, and red.

This is a design guideline, not a pixel-count requirement.

The purpose is to preserve a calm hierarchy and avoid making the interface feel childish, gamified, or noisy.

---

## 10. Accessibility Rules

Color is never the only carrier of meaning.

Required behavior:

- pair status colors with text, icons, shape, or state labels;
- verify sufficient contrast for text and interactive controls;
- do not lower secondary-text opacity until important content becomes difficult to read;
- ensure focus states remain visible in both themes;
- maintain readable destructive, warning, success, and selected states;
- test theme behavior with dynamic text and common color-vision deficiencies;
- use accessible touch targets independently of visual icon size.

If a canonical color does not provide sufficient contrast in a specific combination, adjust the **pairing or supporting surface**, not the semantic meaning of the color.

---

## 11. Do / Don't

### Do

- use semantic tokens;
- preserve the same color meaning across themes;
- use blue for primary action/focus;
- use teal for progress/growth;
- reserve red for high-attention destructive/error states;
- use neutrals for most of the interface;
- keep dark surfaces navy/slate rather than pure black;
- keep color hierarchy consistent across screens.

### Don't

- introduce arbitrary hex colors in feature components;
- give every feature its own saturated brand color;
- implement Dark Mode by simply inverting Light Mode;
- use pure black as the default dark background;
- use red as the normal Start Focus action;
- use green as generic decoration;
- use gradients everywhere;
- use strong colored shadows as a normal card treatment;
- change the product palette automatically according to morning/evening time;
- communicate state by color alone.

---

## 12. Implementation Rules

1. `src/theme/tokens.ts` is the implementation source for these values.
2. Feature components should consume `Colors`/semantic theme values rather than embedding hex literals.
3. Legacy token names may remain temporarily for compatibility, but new code should use semantic roles.
4. When a legacy token conflicts with this specification, migrate it toward this system instead of creating a third palette.
5. UI screenshots and concept art are references only; the documented tokens are authoritative for implementation.
6. Any deliberate project-wide palette change requires updating this document, implementation tokens, relevant design documentation, and the changelog together.

---

## 13. Canonical Summary

### Light Mode

```text
Primary       #3B82F6
Secondary     #14B8A6
Danger        #EF4444
Success       #22C55E
Warning       #F59E0B
Achievement   #8B5CF6
Background    #F8FAFC
Surface       #FFFFFF
Text Primary  #0F172A
Text Secondary#64748B
Border        #E2E8F0
```

### Dark Mode

```text
Primary       #2982F6
Primary Dark  #2563EB
Secondary     #14B8A6
Achievement   #8B5CF6
Danger        #EF4444
Success       #22C55E
Warning       #F59E0B
Background    #0B1220
Surface       #111827
Elevated      #1F2937
Text Primary  #F8FAFC
Text Secondary#94A3B8
```

This palette is intended to make Deep Focus feel focused, calm, motivating, readable, and consistent across Light and Dark Mode while preserving a clear semantic design language.
