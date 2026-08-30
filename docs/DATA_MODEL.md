# Deep Focus Data Model

This document defines the core data model for Deep Focus V1.

It describes the primary application entities, their responsibilities, relationships, lifecycle expectations, and important data rules.

The purpose of this document is to provide a consistent foundation for application state, persistence, backend APIs, database design, analytics, and future development.

This document defines logical application data.

Implementation-specific database tables, indexes, constraints, and storage details are defined separately in `DATABASE_SCHEMA.md`.

---

## 1. Data Model Goals

---

The Deep Focus V1 data model should:

- Represent the core application features clearly
- Keep entities focused on a single responsibility
- Avoid unnecessary duplication
- Support reliable local persistence
- Support future cloud synchronization where required
- Preserve important user and focus-session data
- Support analytics without storing unnecessary information
- Support rewards and streak calculations
- Support user preferences and accessibility settings
- Maintain clear relationships between entities
- Protect user privacy
- Remain simple enough to implement and maintain
- Allow future expansion without unnecessary V1 complexity

The V1 data model should prioritize actual product requirements rather than speculative future features.

---

## 2. Core V1 Entities

---

The primary Deep Focus V1 data entities are:

1. `User`
2. `FocusSession`
3. `Task`
4. `Goal`
5. `Streak`
6. `RewardProgress`
7. `UserSettings`
8. `Assessment`

Supporting types may be introduced when they simplify implementation, but unnecessary standalone entities should be avoided. The approved V1 AI scope adds `TaskReminder`, `AIActionGrant`, `AIActionRequest`, and transient `AIPlanProposal` support as defined in Section 19.

Analytics data should primarily be derived from existing session, goal, task, and reward data where practical instead of duplicating the same information in separate records.

---

## 3. Common Data Conventions

---

All entities should follow consistent data conventions where applicable.

### Identifiers

Persistent entities should use stable unique identifiers.

Example:

```ts
id: string
```

Identifiers should not depend on display names, timestamps, or mutable user information.

### Timestamps

Important records should use timestamps where appropriate.

Common fields may include:

```ts
createdAt: string
updatedAt: string
```

Timestamps should use a consistent machine-readable format.

ISO 8601 UTC timestamps are recommended for persisted and synchronized data.

Example:

```text
2026-08-18T12:30:00.000Z
```

User-facing dates and times should be formatted according to the user's locale and preferences rather than stored as formatted display strings.

### Optional Data

Optional fields should be explicitly represented in TypeScript.

Example:

```ts
description?: string
```

Required data should not be made optional simply to avoid validation.

### Enumerated Values

Fields with a limited set of valid values should use explicit types or enums rather than arbitrary strings.

Example:

```ts
type SessionStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';
```

### Derived Data

Values that can be reliably calculated from authoritative data should generally be derived rather than duplicated.

Examples may include:

- Total focus time
- Completed session count
- Goal completion percentage
- Current streak
- Analytics summaries

Persisted derived values may be introduced later when required for performance, synchronization, or backend processing.

### Data Ownership

User-specific records should be associated with the appropriate user when account-based storage is used.

User ownership must be enforceable at the persistence and backend layers rather than relying only on the user interface.

### Data Minimization

Deep Focus should store only information required for supported functionality.

Sensitive or unnecessary personal information should not be collected simply because it may become useful in the future.

---

## 4. Entity Relationships

---

At a high level, V1 data relationships should follow this model:

```text
User
 ├── FocusSessions
 ├── Tasks
 ├── Goals
 ├── Streak
 ├── RewardProgress
 ├── UserSettings
 └── Assessments

Task
 └── may be associated with FocusSessions

Goal
 └── may track progress from Tasks or FocusSessions

FocusSession
 └── contributes to Analytics, Streaks, Goals, and Rewards
```

Analytics should consume relevant application data without becoming the authoritative source for focus-session history.

Rewards should recognize completed productivity activity without modifying the original activity records.

Settings should control user preferences without being mixed into productivity-history records.

---

## 5. User

---

The `User` entity represents the primary account identity of a Deep Focus user.

It should contain only the information required to identify the account and support core application functionality.

Personal preferences, productivity history, rewards, and assessment data should remain in their respective entities rather than being unnecessarily duplicated inside the user record.

### Purpose

The `User` entity should:

- Provide a stable account identity
- Associate user-owned application data
- Support authentication where implemented
- Support profile presentation
- Track basic account lifecycle information
- Avoid storing unnecessary personal information

### V1 Model

```ts
interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the user.

```ts
id: string
```

The identifier should:

- Remain stable throughout the account lifecycle
- Be used to associate user-owned records
- Never depend on the user's display name or email address

#### `email`

The user's email address when email-based authentication or account communication is supported.

```ts
email?: string
```

Email should not be treated as the permanent internal identifier for the user.

#### `displayName`

The name displayed within the application.

```ts
displayName?: string
```

Users should be able to change their display name without affecting ownership of existing application data.

#### `avatarUrl`

An optional reference to the user's profile image.

```ts
avatarUrl?: string
```

The application should provide an appropriate placeholder when no avatar exists.

#### `createdAt`

The timestamp representing when the user account was created.

```ts
createdAt: string
```

#### `updatedAt`

The timestamp representing the most recent meaningful update to the user record.

```ts
updatedAt: string
```

### Relationships

A user may own:

```text
User
 ├── FocusSessions
 ├── Tasks
 ├── Goals
 ├── Streak
 ├── RewardProgress
 ├── UserSettings
 └── Assessments
```

User-owned records should reference the stable user identifier where account-based persistence is used.

### Authentication Data

Authentication credentials should not be stored directly inside the application-level `User` model.

Examples include:

- Passwords
- Password hashes
- Authentication tokens
- Refresh tokens
- Provider secrets

Authentication and credential handling should follow the architecture and security requirements defined separately for Deep Focus.

### Data Minimization

The V1 `User` entity should not collect additional personal information unless a supported feature genuinely requires it.

Information such as the following should not be added without a clear product requirement:

- Home address
- Date of birth
- Gender
- Employment information
- Unnecessary demographic information

Additional profile information may be introduced in future versions only when it provides clear user value and satisfies privacy requirements.

### User Model Principles

The `User` model should:

- Remain small and focused
- Use a stable unique identifier
- Avoid duplicating related application data
- Separate authentication credentials from profile data
- Minimize collection of personal information
- Support future account functionality without unnecessary V1 complexity

---

## 6. FocusSession

---

The `FocusSession` entity represents a single planned or completed period of focused work.

It is one of the most important entities in Deep Focus because session history contributes to analytics, streaks, rewards, goals, and recovery behavior.

The model should preserve enough information to reconstruct session state reliably without storing unnecessary duplicate statistics.

### Purpose

The `FocusSession` entity should:

- Represent a single focus session
- Track planned and actual session duration
- Support start, pause, resume, completion, and cancellation
- Support interruption and recovery behavior
- Associate a session with a task when applicable
- Provide reliable historical data
- Supply authoritative data for analytics, streaks, and rewards

### Session Status

```ts
type FocusSessionStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';
```

### V1 Model

```ts
interface FocusSession {
  id: string;
  userId?: string;
  taskId?: string;

  title?: string;

  status: FocusSessionStatus;

  plannedDurationSeconds: number;
  focusedDurationSeconds: number;
  pausedDurationSeconds: number;

  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  lastPausedAt?: string;
  lastResumedAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the focus session.

```ts
id: string
```

The identifier should remain unchanged throughout the session lifecycle.

#### `userId`

Associates the session with the owning user where account-based persistence is used.

```ts
userId?: string
```

Local-only or pre-authentication workflows may temporarily operate without a user association when supported by the application architecture.

#### `taskId`

Optionally associates the session with a task.

```ts
taskId?: string
```

A focus session should remain valid even when no task is selected.

The session history should not depend on the continued existence of the linked task.

#### `title`

An optional human-readable session title.

```ts
title?: string
```

Examples may include:

- Study Biology
- Complete UI Design
- Write Project Report

#### `status`

Represents the current lifecycle state of the session.

```ts
status: FocusSessionStatus
```

Valid transitions should remain predictable.

Typical flow:

```text
Created
   ↓
Active
   ↓
Paused
   ↓
Active
   ↓
Completed
```

A session may also transition to:

```text
Active / Paused
      ↓
Cancelled
```

Completed or cancelled sessions should normally be treated as final historical records.

#### `plannedDurationSeconds`

The intended session duration.

```ts
plannedDurationSeconds: number
```

Duration should be stored as a numeric value rather than a formatted string.

Example:

```text
50 minutes = 3000 seconds
```

#### `focusedDurationSeconds`

The total amount of confirmed focus time accumulated during the session.

```ts
focusedDurationSeconds: number
```

This value should exclude paused time.

It should be updated reliably when a session pauses, resumes, completes, or is recovered after interruption.

#### `pausedDurationSeconds`

The total time spent in a paused state.

```ts
pausedDurationSeconds: number
```

Paused time should not contribute to focus analytics or reward calculations unless a future feature explicitly defines otherwise.

#### `startedAt`

The timestamp representing when the session actually started.

```ts
startedAt?: string
```

A session that has not started should not require this field.

#### `completedAt`

The timestamp representing successful session completion.

```ts
completedAt?: string
```

This field should normally exist only when:

```ts
status === 'completed'
```

#### `cancelledAt`

The timestamp representing cancellation.

```ts
cancelledAt?: string
```

This field should normally exist only when:

```ts
status === 'cancelled'
```

#### `lastPausedAt`

The most recent pause timestamp.

```ts
lastPausedAt?: string
```

This field may support accurate session recovery and elapsed-time calculations.

#### `lastResumedAt`

The most recent resume timestamp.

```ts
lastResumedAt?: string
```

This field may support accurate duration calculations after pause and resume transitions.

### Timer Reliability

The visible countdown timer should not be treated as the authoritative source of session duration.

Session timing should rely on timestamps and persisted session state where practical.

This helps Deep Focus recover correctly when:

- The application moves to the background
- The device screen turns off
- The application temporarily stops rendering
- The application process is interrupted
- The user returns after a delay

When the application resumes, remaining time should be recalculated from authoritative timing data rather than assuming that every visual timer tick executed successfully.

### Session Recovery

Active or paused sessions should preserve enough state to determine what happened after an interruption.

Recovery should determine:

- Whether the session was active or paused
- How much confirmed focus time was accumulated
- Whether the planned duration has already been reached
- Whether the session should continue or complete
- Whether user confirmation is required

Recovery logic should avoid creating duplicate completed sessions.

### Task Relationship

A session may reference a task:

```text
Task
  ↓
FocusSession
```

However, important historical session information should remain understandable even if the original task is later renamed, archived, or deleted.

Future implementations may preserve a lightweight task-title snapshot when required for historical display.

### Analytics Relationship

Analytics should primarily derive session metrics from completed `FocusSession` records.

Examples include:

- Total focus time
- Session count
- Average session duration
- Daily progress
- Weekly progress
- Productivity trends

The analytics system should not modify historical focus-session records.

### Streak and Reward Relationship

Completed sessions may contribute to:

- Streak calculations
- Goal progress
- Reward progress
- Experience points
- Achievements

These systems should consume focus-session data rather than change the original historical session record.

### Validation Rules

A `FocusSession` should follow rules such as:

- `plannedDurationSeconds` must be greater than zero
- Duration values must not be negative
- A completed session should have `completedAt`
- A cancelled session should have `cancelledAt`
- A session should not be both completed and cancelled
- `focusedDurationSeconds` should represent actual confirmed focus time
- Invalid status transitions should be rejected

Additional validation may be introduced when implementation requirements become clearer.

### FocusSession Model Principles

The `FocusSession` model should:

- Remain the authoritative record of focus activity
- Preserve reliable session timing data
- Support interruption recovery
- Separate focused time from paused time
- Avoid relying on UI timer ticks
- Support optional task association
- Supply stable historical data
- Avoid duplicating analytics summaries
- Remain simple enough for reliable V1 implementation

---

## 7. Task

---

The `Task` entity represents a specific piece of work that a user intends to complete.

Tasks help users organize focused work and may be associated with focus sessions and goals.

The V1 task model should remain lightweight and should not attempt to become a complex project management system.

### Purpose

The `Task` entity should:

- Represent a clear unit of work
- Support basic task planning
- Track task completion
- Support optional due dates
- Associate tasks with goals where applicable
- Allow focus sessions to reference tasks
- Preserve useful task history
- Remain simple and focused for V1

### Task Status

```ts
type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
```

### Task Priority

```ts
type TaskPriority =
  | 'low'
  | 'medium'
  | 'high';
```

Priority should remain optional.

Users should not be required to assign a priority to every task.

### V1 Model

```ts
interface Task {
  id: string;
  userId?: string;
  goalId?: string;

  title: string;
  description?: string;

  status: TaskStatus;
  priority?: TaskPriority;

  dueAt?: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the task.

```ts
id: string
```

The identifier should remain unchanged throughout the task lifecycle.

#### `userId`

Associates the task with its owning user where account-based persistence is used.

```ts
userId?: string
```

User ownership should be enforced by the appropriate persistence and backend layers.

#### `goalId`

Optionally associates the task with a goal.

```ts
goalId?: string
```

A task should remain valid without belonging to a goal.

V1 should avoid requiring users to create goals before they can create tasks.

#### `title`

The primary human-readable description of the task.

```ts
title: string
```

Examples may include:

- Review Biology Chapter 4
- Complete Dashboard Design
- Write Project Introduction
- Prepare Weekly Study Plan

Task titles should remain concise and understandable.

#### `description`

Optional additional information about the task.

```ts
description?: string
```

The description should not be required for simple tasks.

#### `status`

Represents the current task lifecycle state.

```ts
status: TaskStatus
```

Typical lifecycle:

```text
Pending
   ↓
In Progress
   ↓
Completed
```

A task may also become:

```text
Pending / In Progress
        ↓
Cancelled
```

Task status should reflect actual task state rather than focus-session state.

Starting a focus session associated with a task may transition the task to `in_progress` where appropriate, but completing one focus session should not automatically complete the task unless the product behavior explicitly requires it.

#### `priority`

An optional indication of task importance.

```ts
priority?: TaskPriority
```

Supported V1 values are:

```text
Low
Medium
High
```

Priority should assist planning without creating unnecessary complexity.

More advanced prioritization systems should not be introduced unless required by future product behavior.

#### `dueAt`

An optional due date or deadline.

```ts
dueAt?: string
```

When stored as a timestamp, it should follow the project's timestamp conventions.

Tasks without deadlines should remain fully supported.

#### `completedAt`

The timestamp representing when the task was completed.

```ts
completedAt?: string
```

This field should normally exist only when:

```ts
status === 'completed'
```

If a completed task is reopened in future supported behavior, completion state and timestamp handling should remain consistent.

### FocusSession Relationship

A task may be associated with multiple focus sessions.

```text
Task
 ├── FocusSession
 ├── FocusSession
 └── FocusSession
```

Each `FocusSession` may reference the task through:

```ts
taskId?: string
```

This allows Deep Focus to calculate information such as:

- Focus time spent on a task
- Number of focus sessions associated with a task
- Task-related productivity history

These values should generally be derived from `FocusSession` records rather than duplicated inside the task.

### Goal Relationship

A task may optionally contribute to a goal.

```text
Goal
 ├── Task
 ├── Task
 └── Task
```

The relationship should remain optional.

Simple task creation should never require a goal.

Goal progress may use completed tasks where the goal's progress model supports task-based measurement.

### Task Completion

Task completion should remain separate from focus-session completion.

For example:

```text
Task: Complete Project Report

Focus Session 1 → Completed
Focus Session 2 → Completed
Focus Session 3 → Completed

Task → Completed only when the actual task is finished
```

This prevents Deep Focus from incorrectly treating every completed focus session as completed work.

### Deletion and Historical Data

Deleting or archiving a task should not corrupt historical focus-session records.

Existing sessions that referenced the task should remain valid.

Where historical presentation requires the original task name after deletion or modification, a lightweight snapshot strategy may be introduced during implementation.

V1 should avoid complex historical versioning unless it becomes necessary.

### Validation Rules

A `Task` should follow rules such as:

- `title` must not be empty
- `status` must contain a supported value
- `priority`, when provided, must contain a supported value
- A completed task should have `completedAt`
- Duration or productivity statistics should not be manually stored in the task when they can be derived reliably
- Invalid ownership relationships should be rejected

Reasonable title and description length limits may be defined during implementation and database design.

### Task Model Principles

The `Task` model should:

- Remain lightweight
- Represent one clear unit of work
- Support optional goal association
- Support multiple related focus sessions
- Keep task completion separate from session completion
- Avoid duplicated productivity statistics
- Support tasks without deadlines or priorities
- Preserve historical session integrity
- Avoid unnecessary project-management complexity in V1

---

## 8. Goal

---

The `Goal` entity represents a meaningful productivity target that a user wants to achieve over a defined period or through a specific type of progress.

Goals help users translate long-term intentions into measurable outcomes.

The V1 goal model should support simple and flexible progress tracking without becoming a complex project-planning system.

### Purpose

The `Goal` entity should:

- Represent a measurable productivity objective
- Support daily, weekly, monthly, or custom goals
- Track progress toward a defined target
- Support task-based or focus-time-based progress
- Support goal completion
- Provide data for analytics and rewards
- Remain understandable and easy to maintain
- Avoid unnecessary V1 complexity

### Goal Status

```ts
type GoalStatus =
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired';
```

### Goal Type

```ts
type GoalType =
  | 'focus_time'
  | 'session_count'
  | 'task_completion';
```

The goal type defines how progress is measured.

### Goal Period

```ts
type GoalPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';
```

### V1 Model

```ts
interface Goal {
  id: string;
  userId?: string;

  title: string;
  description?: string;

  type: GoalType;
  period: GoalPeriod;
  status: GoalStatus;

  targetValue: number;
  currentValue: number;

  startsAt?: string;
  endsAt?: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the goal.

```ts
id: string
```

The identifier should remain unchanged throughout the goal lifecycle.

#### `userId`

Associates the goal with the owning user where account-based persistence is used.

```ts
userId?: string
```

Goal ownership should be enforced by the appropriate persistence and backend layers.

#### `title`

The primary human-readable name of the goal.

```ts
title: string
```

Examples may include:

- Focus for 3 Hours Today
- Complete 10 Focus Sessions This Week
- Finish 5 Tasks This Week
- Study for 20 Hours This Month

Goal titles should remain concise and clear.

#### `description`

Optional additional information about the goal.

```ts
description?: string
```

Descriptions should remain optional so users can create goals quickly.

#### `type`

Defines how goal progress is measured.

```ts
type: GoalType
```

Supported V1 goal types include:

```text
focus_time
session_count
task_completion
```

##### `focus_time`

Progress is based on confirmed focus duration.

Example:

```text
Target: 10 hours
Progress: 6 hours
```

##### `session_count`

Progress is based on completed focus sessions.

Example:

```text
Target: 10 sessions
Progress: 7 sessions
```

##### `task_completion`

Progress is based on completed tasks associated with the goal or relevant goal criteria.

Example:

```text
Target: 5 tasks
Progress: 3 tasks
```

More advanced goal types should not be introduced in V1 unless required by the approved product scope.

#### `period`

Defines the goal's tracking period.

```ts
period: GoalPeriod
```

Supported values include:

```text
daily
weekly
monthly
custom
```

Daily, weekly, and monthly goals may use automatically calculated time boundaries.

Custom goals may use explicitly defined start and end timestamps.

#### `status`

Represents the current lifecycle state of the goal.

```ts
status: GoalStatus
```

Typical flow:

```text
Active
   ↓
Completed
```

A goal may also become:

```text
Active
  ↓
Cancelled
```

or:

```text
Active
  ↓
Expired
```

Completed, cancelled, and expired goals should normally be treated as historical records.

#### `targetValue`

The value required to complete the goal.

```ts
targetValue: number
```

Examples:

```text
Focus Time Goal
targetValue = 10800 seconds

Session Count Goal
targetValue = 5

Task Completion Goal
targetValue = 3
```

`targetValue` should use the unit defined by the goal type.

#### `currentValue`

Represents the current progress toward the target.

```ts
currentValue: number
```

Where practical, progress should be derived from authoritative application records such as:

- Completed `FocusSession` records
- Confirmed focus duration
- Completed `Task` records

The system should avoid allowing manually duplicated progress values to become inconsistent with authoritative data.

For V1, `currentValue` may be stored when doing so simplifies UI updates or persistence, but it should remain synchronized with its authoritative source.

#### `startsAt`

The timestamp representing when goal tracking begins.

```ts
startsAt?: string
```

This field may be calculated automatically for predefined periods.

#### `endsAt`

The timestamp representing the end of the goal period.

```ts
endsAt?: string
```

For custom goals, the end time may be selected by the user.

#### `completedAt`

The timestamp representing when the goal was completed.

```ts
completedAt?: string
```

This field should normally exist only when:

```ts
status === 'completed'
```

### FocusSession Relationship

Focus-session data may contribute to goals based on:

- Focus duration
- Completed session count

Example:

```text
Goal
"Focus for 3 Hours Today"

FocusSession 1 → 50 minutes
FocusSession 2 → 60 minutes
FocusSession 3 → 45 minutes

Goal Progress → 2h 35m
```

Only confirmed focus time should contribute to focus-time goals.

Paused time should not count unless explicitly required by future product behavior.

### Task Relationship

Tasks may contribute to task-completion goals.

Example:

```text
Goal
"Complete 5 Tasks This Week"

Task 1 → Completed
Task 2 → Completed
Task 3 → Pending

Progress → 2 / 5
```

A task may optionally reference the goal using:

```ts
goalId?: string
```

A goal should not require tasks when its progress type is based on focus time or session count.

### Goal Progress Calculation

Progress should follow the goal type.

Example logic:

```text
focus_time
→ Sum confirmed FocusSession focus duration

session_count
→ Count qualifying completed FocusSessions

task_completion
→ Count qualifying completed Tasks
```

Progress calculation should use only records that fall within the goal's defined tracking period where applicable.

### Goal Completion

A goal may automatically transition to `completed` when:

```text
currentValue >= targetValue
```

When completed:

```ts
status = 'completed'
completedAt = completion timestamp
```

Goal completion may trigger:

- Reward progress
- Experience points
- Achievements
- Analytics updates

These systems should consume the goal-completion event rather than modify historical source records.

### Goal Expiration

A time-limited goal may become `expired` when:

- The end of its tracking period is reached
- The target has not been completed
- The product behavior does not automatically create a new goal

Recurring daily, weekly, or monthly goal behavior should be implemented separately from the historical goal record where practical.

Completed historical goals should not be overwritten when a new tracking period begins.

### Progress Percentage

User interfaces may display goal completion percentage.

Example:

```text
currentValue / targetValue × 100
```

Progress percentages should normally be derived rather than stored.

Displayed progress should be limited appropriately when the value exceeds the target.

For example:

```text
Target = 3 hours
Actual = 4 hours

Goal Completion = 100%
Actual productivity data = 4 hours
```

The underlying activity data should not be reduced simply because the goal target was exceeded.

### Validation Rules

A `Goal` should follow rules such as:

- `title` must not be empty
- `targetValue` must be greater than zero
- `currentValue` must not be negative
- `type` must contain a supported value
- `period` must contain a supported value
- `status` must contain a supported value
- `endsAt` should not occur before `startsAt`
- A completed goal should have `completedAt`
- Progress should use the correct unit for the selected goal type
- User ownership relationships must remain valid

Additional validation may be introduced during implementation and database design.

### Goal Model Principles

The `Goal` model should:

- Represent measurable productivity targets
- Support multiple simple progress types
- Keep progress units consistent
- Use authoritative activity records where practical
- Support time-based tracking periods
- Preserve historical completed goals
- Avoid duplicating analytics data
- Integrate naturally with tasks, sessions, rewards, and analytics
- Remain simple enough for reliable V1 implementation
- Avoid unnecessary project-management complexity

---

## 9. Streak

---

The `Streak` entity represents a user's consistency in completing qualifying focus activity across consecutive calendar days.

The streak system should encourage sustainable productivity habits without creating unnecessary pressure.

Focus-session history remains the authoritative source of productivity activity. The `Streak` entity exists primarily to support efficient streak tracking and presentation.

### Purpose

The `Streak` entity should:

- Track the user's current focus streak
- Track the longest achieved streak
- Record the most recent qualifying day
- Support streak milestone detection
- Avoid counting multiple sessions on the same day as multiple streak days
- Support reliable streak recalculation when necessary
- Encourage consistency without punishing excessive productivity gaps
- Remain simple enough for reliable V1 implementation

### V1 Model

```ts
interface Streak {
  id: string;
  userId?: string;

  currentStreak: number;
  longestStreak: number;

  lastQualifyingDate?: string;
  currentStreakStartedAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the streak record.

```ts
id: string
```

A user should normally have one primary streak record for the standard V1 focus streak.

#### `userId`

Associates the streak with the owning user where account-based persistence is used.

```ts
userId?: string
```

User ownership should be enforced by the appropriate persistence and backend layers.

#### `currentStreak`

The number of consecutive qualifying calendar days in the user's current streak.

```ts
currentStreak: number
```

Example:

```text
Monday    → qualifying focus activity
Tuesday   → qualifying focus activity
Wednesday → qualifying focus activity

currentStreak = 3
```

Multiple qualifying focus sessions on the same calendar day should not increase the streak more than once.

#### `longestStreak`

The highest streak previously achieved by the user.

```ts
longestStreak: number
```

Whenever:

```text
currentStreak > longestStreak
```

the longest streak should be updated.

A broken current streak should not reduce `longestStreak`.

#### `lastQualifyingDate`

Represents the most recent calendar date on which the user completed qualifying focus activity.

```ts
lastQualifyingDate?: string
```

For date-based streak logic, a calendar-date representation should be used consistently.

Example:

```text
2026-08-18
```

The streak calculation should respect the user's relevant local calendar day rather than assuming that every user's day follows UTC boundaries.

#### `currentStreakStartedAt`

Represents when the current streak began.

```ts
currentStreakStartedAt?: string
```

This value may be useful for streak history, presentation, and validation.

#### `createdAt`

The timestamp representing when the streak record was created.

```ts
createdAt: string
```

#### `updatedAt`

The timestamp representing the most recent meaningful update to the streak record.

```ts
updatedAt: string
```

### Qualifying Activity

For V1, a streak day should be earned through qualifying completed focus activity.

A simple default rule is:

```text
At least one qualifying completed FocusSession during the user's calendar day
→ Day qualifies for the focus streak
```

Cancelled sessions should not qualify.

Paused time alone should not qualify.

The exact minimum session requirement, if one is introduced, should be defined consistently in product rules rather than scattered throughout the implementation.

### Streak Update Logic

When qualifying activity is completed, the system should evaluate the relevant calendar date.

Conceptually:

```text
No previous qualifying date
→ currentStreak = 1

Same calendar date as lastQualifyingDate
→ currentStreak remains unchanged

Next consecutive calendar date
→ currentStreak += 1

Gap greater than one calendar day
→ currentStreak = 1
```

After updating:

```text
if currentStreak > longestStreak
→ longestStreak = currentStreak
```

The system should prevent repeated session completion on the same day from incorrectly increasing the streak.

### Streak Breaks

A streak is considered broken when the user fails to record qualifying activity for the required consecutive-day period.

Breaking a streak should not:

- Delete previous focus-session history
- Remove earned achievements
- Reduce the recorded longest streak
- Remove previously earned rewards

The user should simply begin a new streak when qualifying activity resumes.

### Calendar and Time Zone Behavior

Streak calculations should use consistent calendar-day boundaries.

Because streaks represent user behavior by day, the system should account for the user's relevant time zone when determining whether activity occurred on consecutive dates.

For example:

```text
23:50 → Focus session completed
00:20 → Another focus session completed
```

These may belong to different calendar days even though the sessions occurred close together.

Time-zone handling should be implemented consistently to avoid unexpected streak loss or duplicate streak days.

### FocusSession Relationship

The streak system should consume qualifying `FocusSession` data.

```text
Completed FocusSession
        ↓
Check qualifying calendar day
        ↓
Update Streak
```

The streak record should not modify the original focus-session record.

Focus-session history should remain available to recalculate streak information if necessary.

### Rewards Relationship

Streak milestones may contribute to rewards or achievements.

Examples may include:

```text
3-Day Streak
7-Day Streak
30-Day Streak
```

Reward systems should respond to confirmed streak milestones rather than independently calculate conflicting streak values.

### Recalculation

Because focus-session history is the authoritative activity source, streak values should be recoverable or recalculable when necessary.

Possible reasons include:

- Data synchronization
- Recovery from corrupted derived data
- Streak calculation fixes
- Time-zone handling corrections

V1 does not need to recalculate the entire streak history during every application launch.

Stored streak values may be used for efficient operation while remaining consistent with authoritative session data.

### Validation Rules

A `Streak` should follow rules such as:

- `currentStreak` must not be negative
- `longestStreak` must not be negative
- `longestStreak` should not be lower than `currentStreak`
- The same calendar day should not increase the streak more than once
- Cancelled sessions should not qualify
- User ownership relationships must remain valid
- Calendar-day calculations should use consistent time-zone rules

### Streak Model Principles

The `Streak` model should:

- Reward consistency rather than excessive application usage
- Count qualifying calendar days rather than individual sessions
- Preserve the user's longest streak
- Use focus-session history as the authoritative activity source
- Avoid duplicate streak increments
- Handle calendar dates and time zones consistently
- Support milestone rewards
- Remain recoverable from historical activity
- Avoid unnecessary gamification complexity in V1

---

## 10. RewardProgress

---

The `RewardProgress` entity represents the user's accumulated productivity rewards and progression within Deep Focus.

The reward system should encourage consistent and healthy focus behavior without becoming the primary purpose of the application.

Reward progress should be derived from verified productivity activity such as completed focus sessions, completed goals, streak milestones, and supported achievements.

### Purpose

The `RewardProgress` entity should:

- Track accumulated experience or reward points
- Support simple progression levels
- Track unlocked achievements
- Support reward milestones
- Recognize completed productivity activity
- Avoid modifying original productivity records
- Prevent duplicate reward grants
- Remain simple enough for reliable V1 implementation

### V1 Model

```ts
interface RewardProgress {
  id: string;
  userId?: string;

  totalXp: number;
  level: number;

  unlockedAchievementIds: string[];

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the reward-progress record.

```ts
id: string
```

A user should normally have one primary `RewardProgress` record for the standard V1 progression system.

#### `userId`

Associates reward progress with the owning user where account-based persistence is used.

```ts
userId?: string
```

User ownership should be enforced by the appropriate persistence and backend layers.

#### `totalXp`

Represents the total confirmed experience points earned by the user.

```ts
totalXp: number
```

XP may be awarded for qualifying activities such as:

- Completing focus sessions
- Completing goals
- Reaching streak milestones
- Unlocking supported achievements

XP should never be awarded simply because a user opened the application or repeatedly triggered an interaction without completing meaningful productivity activity.

#### `level`

Represents the user's current progression level.

```ts
level: number
```

The level should normally be calculated from `totalXp` using a consistent progression rule.

Example:

```text
totalXp
   ↓
Level Calculation
   ↓
Current Level
```

The exact XP thresholds should be defined by the reward-system implementation rather than duplicated across multiple parts of the application.

If level can be reliably derived from `totalXp`, the stored value should remain synchronized with the authoritative XP value.

#### `unlockedAchievementIds`

Contains identifiers for achievements already unlocked by the user.

```ts
unlockedAchievementIds: string[]
```

Example:

```text
first_focus_session
three_day_streak
ten_sessions_completed
first_goal_completed
```

Achievement identifiers should remain stable even if the user-facing achievement name or description changes.

### Reward Sources

V1 rewards may originate from verified events such as:

```text
Completed FocusSession
        ↓
      XP

Completed Goal
        ↓
      XP

Streak Milestone
        ↓
  Achievement / XP
```

Reward logic should consume confirmed application events rather than modify the source records.

For example, awarding XP for a completed focus session should not change the historical duration or status of that session.

### Achievement Definitions

Achievement definitions should remain separate from individual user progress.

A definition may conceptually contain information such as:

```ts
interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  xpReward?: number;
}
```

Examples may include:

```text
first_focus_session
→ Complete the first qualifying focus session

three_day_streak
→ Reach a 3-day focus streak

first_goal_completed
→ Complete the first goal
```

Static achievement definitions may be stored in application configuration rather than duplicated for every user.

### Duplicate Reward Prevention

The reward system must prevent the same qualifying event from granting the same reward multiple times unintentionally.

Examples include:

- Reopening an already completed session
- Reprocessing synchronization data
- Recalculating streak progress
- Restarting the application after completion
- Receiving the same completion event more than once

Reward processing should therefore be idempotent where practical.

Historical source records should make it possible to determine whether a reward-triggering event was already processed when stronger duplicate protection is required.

The exact persistence mechanism for reward transactions may be defined in `DATABASE_SCHEMA.md` if required by the implementation.

### XP and Level Calculation

XP values and level thresholds should use centralized rules.

Conceptually:

```text
Verified Productivity Activity
            ↓
        XP Award
            ↓
        totalXp
            ↓
     Level Calculation
```

The V1 data model should not hard-code specific XP values into individual productivity entities.

For example, `FocusSession` should not contain:

```text
xpEarned = 50
```

unless future requirements establish a clear need to preserve historical reward snapshots.

Reward calculations should remain the responsibility of the reward system.

### FocusSession Relationship

Completed qualifying focus sessions may contribute to reward progress.

```text
Completed FocusSession
        ↓
Reward Eligibility Check
        ↓
     XP / Achievement
```

Cancelled or invalid sessions should not generate completion rewards.

### Goal Relationship

Completing supported goals may contribute to:

- XP
- Achievements
- Progress milestones

The reward system should respond to confirmed goal completion rather than independently modifying goal progress.

### Streak Relationship

Confirmed streak milestones may unlock rewards.

Example:

```text
3-Day Streak
     ↓
Achievement

7-Day Streak
     ↓
Achievement + XP
```

The streak system should remain the authoritative source for the current streak value.

The reward system should not maintain a separate conflicting streak calculation.

### Reward History

A detailed reward transaction history is not required in the primary `RewardProgress` V1 model.

If reliable duplicate prevention, synchronization, auditing, or future reward presentation requires individual reward records, a supporting reward-event or reward-transaction entity may be introduced during database design.

Such an entity should only be added when it solves a concrete implementation requirement.

### Validation Rules

A `RewardProgress` record should follow rules such as:

- `totalXp` must not be negative
- `level` must represent a valid progression level
- Achievement identifiers should be unique within `unlockedAchievementIds`
- The same achievement should not be unlocked repeatedly
- Invalid or cancelled productivity activity should not generate completion rewards
- Reward processing should prevent unintended duplicate grants
- User ownership relationships must remain valid

### Reward Model Principles

The `RewardProgress` model should:

- Reward meaningful productivity activity
- Encourage healthy consistency
- Keep XP rules centralized
- Prevent duplicate reward grants
- Keep achievement definitions separate from user progress
- Consume session, goal, and streak data without modifying historical source records
- Avoid unnecessary game-economy complexity
- Remain recoverable from authoritative productivity data where practical
- Support future expansion without overengineering V1

The reward system should support the Deep Focus productivity experience rather than compete with it for the user's attention.

---

## 11. UserSettings

---

The `UserSettings` entity represents user-configurable preferences that control how Deep Focus behaves and appears.

Settings should remain separate from the `User` profile and productivity-history entities so preferences can evolve without unnecessarily changing core user or session data.

The V1 settings model should provide sensible defaults and allow users to customize supported behavior without creating unnecessary configuration complexity.

### Purpose

The `UserSettings` entity should:

- Store user-specific application preferences
- Support appearance preferences
- Support focus-session preferences
- Support notification preferences
- Support sound and haptic preferences
- Support accessibility preferences
- Support AI-related preferences where AI features are available
- Preserve settings across application launches
- Support future synchronization where appropriate
- Provide safe and predictable defaults

### Theme Preference

```ts
type ThemePreference =
  | 'light'
  | 'dark'
  | 'system';
```

### V1 Model

```ts
interface UserSettings {
  id: string;
  userId?: string;

  theme: ThemePreference;

  defaultFocusDurationMinutes: number;
  defaultBreakDurationMinutes: number;

  notificationsEnabled: boolean;
  focusRemindersEnabled: boolean;
  breakRemindersEnabled: boolean;
  achievementNotificationsEnabled: boolean;

  soundEnabled: boolean;
  hapticsEnabled: boolean;

  reducedMotion: boolean;

  aiFeaturesEnabled: boolean;
  aiCoachingNotificationsEnabled: boolean;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the settings record.

```ts
id: string
```

A user should normally have one primary `UserSettings` record for V1.

#### `userId`

Associates settings with the owning user where account-based persistence is used.

```ts
userId?: string
```

Local settings should also remain usable where supported before authentication or without cloud synchronization.

#### `theme`

Controls the application's appearance preference.

```ts
theme: ThemePreference
```

Supported V1 values are:

```text
light
dark
system
```

`system` should follow the device appearance preference where supported.

#### `defaultFocusDurationMinutes`

The default duration suggested when creating a focus session.

```ts
defaultFocusDurationMinutes: number
```

This value represents a user preference rather than historical session data.

Changing it should not modify previously created or completed focus sessions.

#### `defaultBreakDurationMinutes`

The default duration suggested for break sessions.

```ts
defaultBreakDurationMinutes: number
```

Changing the preference should affect future relevant behavior rather than historical records.

#### `notificationsEnabled`

Controls whether Deep Focus notifications are generally enabled within the application.

```ts
notificationsEnabled: boolean
```

This preference does not override operating-system permission restrictions.

The application must still respect the device's notification permission state.

#### `focusRemindersEnabled`

Controls supported focus reminder notifications.

```ts
focusRemindersEnabled: boolean
```

#### `breakRemindersEnabled`

Controls supported break reminder notifications.

```ts
breakRemindersEnabled: boolean
```

#### `achievementNotificationsEnabled`

Controls notifications related to achievements or productivity milestones.

```ts
achievementNotificationsEnabled: boolean
```

Disabling achievement notifications should not prevent the underlying achievement from being earned.

#### `soundEnabled`

Controls supported application sound effects.

```ts
soundEnabled: boolean
```

This setting should not override device-level audio restrictions.

#### `hapticsEnabled`

Controls supported haptic feedback.

```ts
hapticsEnabled: boolean
```

Haptic behavior should also respect device capabilities and operating-system behavior.

#### `reducedMotion`

Represents the user's application-level reduced-motion preference where supported.

```ts
reducedMotion: boolean
```

Deep Focus should also respect relevant operating-system accessibility preferences.

Important functionality should remain understandable when animations are reduced or removed.

#### `aiFeaturesEnabled`

Controls optional AI-assisted functionality where such features are implemented.

```ts
aiFeaturesEnabled: boolean
```

When AI functionality is disabled, the application should avoid making unnecessary AI-related requests on behalf of the user.

Core focus functionality should not depend unnecessarily on AI being enabled.

#### `aiCoachingNotificationsEnabled`

Controls AI-assisted coaching notifications where supported.

```ts
aiCoachingNotificationsEnabled: boolean
```

This setting should only have an effect when relevant AI functionality and notifications are enabled.

### Default Settings

Deep Focus should provide sensible defaults when no saved settings exist.

Conceptually:

```ts
const defaultUserSettings = {
  theme: 'system',
  defaultFocusDurationMinutes: 25,
  defaultBreakDurationMinutes: 5,

  notificationsEnabled: true,
  focusRemindersEnabled: true,
  breakRemindersEnabled: true,
  achievementNotificationsEnabled: true,

  soundEnabled: true,
  hapticsEnabled: true,

  reducedMotion: false,

  aiFeaturesEnabled: true,
  aiCoachingNotificationsEnabled: false,
};
```

Exact defaults may be adjusted before release according to approved product behavior.

Privacy-sensitive or potentially intrusive functionality should use conservative defaults where appropriate.

### Operating-System Preferences

Application settings and operating-system settings should be treated separately.

For example:

```text
Deep Focus notificationsEnabled = true
OS notification permission = denied

Result
→ Deep Focus cannot send notifications
```

Similarly, system-level accessibility preferences may influence application behavior even when an application-level preference exists.

The application should not assume that stored preferences override device capabilities or permissions.

### Settings Persistence

Settings should be persisted automatically after successful changes.

Users should not normally need to manually save ordinary preference changes.

Settings persistence should:

- Survive application restarts
- Avoid unnecessary writes
- Recover safely when stored settings are missing
- Apply defaults for newly introduced settings
- Preserve compatible existing preferences after application updates

### Settings Synchronization

Where cloud synchronization is supported, appropriate user preferences may synchronize across devices.

Some settings may remain device-specific when synchronization would create confusing behavior.

Examples may include settings that depend on:

- Device capabilities
- Operating-system permissions
- Local notification configuration

The exact synchronization behavior should be defined during implementation and database design.

### Settings Migration

Future versions may introduce new preferences or modify existing settings.

When this occurs:

- Existing users should receive safe defaults for new settings
- Missing fields should not cause application failure
- Obsolete settings should be removed carefully
- Compatible preferences should be preserved where practical

The settings model should support gradual evolution without requiring unnecessary resets.

### Validation Rules

A `UserSettings` record should follow rules such as:

- `theme` must contain a supported value
- Focus duration must be greater than zero
- Break duration must be greater than zero
- Boolean preferences must use valid boolean values
- Missing settings should fall back to defined defaults
- Invalid persisted settings should fail safely
- User ownership relationships must remain valid where applicable

Reasonable duration limits should be defined during implementation to prevent invalid or impractical values.

### UserSettings Model Principles

The `UserSettings` model should:

- Remain separate from profile and productivity history
- Provide sensible defaults
- Preserve user preferences automatically
- Respect operating-system permissions and accessibility settings
- Support local persistence
- Support selective future synchronization
- Allow settings to evolve safely
- Avoid unnecessary configuration complexity
- Keep core focus functionality usable without optional AI features
- Preserve user control over application behavior

---

## 12. Assessment

---

The `Assessment` entity represents a completed or in-progress Deep Focus assessment used to understand relevant user preferences, habits, challenges, and productivity patterns.

Assessment data may support personalization, recommendations, onboarding, and AI-assisted features where implemented.

The V1 model should collect only information that provides clear value to supported Deep Focus functionality.

### Purpose

The `Assessment` entity should:

- Store assessment progress
- Preserve user-provided answers
- Support assessment completion
- Store a structured assessment result where required
- Support personalized recommendations
- Provide appropriate input for AI-assisted features where enabled
- Avoid collecting unnecessary personal information
- Keep assessment history separate from the primary user profile

### Assessment Status

```ts
type AssessmentStatus =
  | 'in_progress'
  | 'completed'
  | 'cancelled';
```

### Assessment Answer

Individual answers should use a flexible structure that can support different question types without requiring a separate database field for every question.

```ts
interface AssessmentAnswer {
  questionId: string;
  value: string | number | boolean | string[];
}
```

Question identifiers should remain stable even if user-facing question text changes.

### Assessment Result

Structured results may be stored when they are required for personalization.

```ts
interface AssessmentResult {
  recommendedFocusDurationMinutes?: number;
  recommendedBreakDurationMinutes?: number;
  productivityProfile?: string;
  primaryChallenges?: string[];
}
```

The result model should contain structured values that are useful to supported application behavior.

Additional result fields should only be introduced when required by an implemented feature.

### V1 Model

```ts
interface Assessment {
  id: string;
  userId?: string;

  version: string;
  status: AssessmentStatus;

  answers: AssessmentAnswer[];
  result?: AssessmentResult;

  startedAt: string;
  completedAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

### Field Definitions

#### `id`

A stable unique identifier for the assessment record.

```ts
id: string
```

Each assessment attempt should have its own identifier where multiple attempts are supported.

#### `userId`

Associates the assessment with the owning user where account-based persistence is used.

```ts
userId?: string
```

Assessment ownership should be protected by the appropriate persistence and backend layers.

#### `version`

Identifies the assessment definition used for this attempt.

```ts
version: string
```

Example:

```text
1.0
```

Assessment questions may evolve over time.

Preserving the version allows historical answers and results to remain interpretable after the assessment changes.

#### `status`

Represents the lifecycle state of the assessment.

```ts
status: AssessmentStatus
```

Typical flow:

```text
In Progress
     ↓
 Completed
```

An unfinished assessment may also become:

```text
In Progress
     ↓
 Cancelled
```

#### `answers`

Contains the user's answers to assessment questions.

```ts
answers: AssessmentAnswer[]
```

Example:

```ts
[
  {
    questionId: 'preferred_focus_duration',
    value: 25
  },
  {
    questionId: 'common_distractions',
    value: ['social_media', 'notifications']
  }
]
```

Answers should reference stable question identifiers rather than duplicating full question definitions.

#### `result`

Contains structured results produced from the completed assessment where applicable.

```ts
result?: AssessmentResult
```

Results may support:

- Focus-duration recommendations
- Break-duration recommendations
- Productivity personalization
- Relevant coaching suggestions
- AI-assisted recommendations

The assessment result should not be treated as an immutable statement about the user.

It represents guidance based on available assessment information.

#### `startedAt`

The timestamp representing when the assessment attempt began.

```ts
startedAt: string
```

#### `completedAt`

The timestamp representing successful assessment completion.

```ts
completedAt?: string
```

This field should normally exist only when:

```ts
status === 'completed'
```

### Assessment Definitions

Question definitions should remain separate from individual user answers.

Conceptually:

```ts
interface AssessmentQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'number' | 'boolean';
  prompt: string;
  required: boolean;
}
```

Static assessment definitions may be maintained in application configuration or another appropriate source.

The full question text should not need to be duplicated inside every user's assessment record.

### Assessment Versioning

Assessment definitions may change after V1.

Changes may include:

- Adding questions
- Removing questions
- Updating available options
- Changing scoring logic
- Improving recommendation logic

Historical assessment attempts should preserve their original `version`.

New assessment logic should not silently reinterpret historical answers in a way that produces misleading results.

### Assessment Completion

An assessment should transition to `completed` only when required questions and validation rules are satisfied.

Conceptually:

```text
Assessment Started
       ↓
Answers Collected
       ↓
Validation
       ↓
Result Calculation
       ↓
Completed
```

Completion may trigger personalization updates where supported.

### UserSettings Relationship

Assessment results may suggest settings such as:

- Focus duration
- Break duration
- Relevant reminders

Recommendations should not silently overwrite explicit user preferences unless the approved product behavior clearly requires and communicates that behavior.

A safer V1 flow is:

```text
Assessment Result
       ↓
Recommendation
       ↓
User Accepts
       ↓
UserSettings Updated
```

This preserves user control over application preferences.

### AI Relationship

Where AI-assisted assessment interpretation is implemented, assessment data may be used to generate personalized recommendations.

The application should:

- Send only information required for the AI task
- Respect `aiFeaturesEnabled`
- Avoid transmitting unnecessary personal information
- Handle AI request failure safely
- Avoid treating AI output as authoritative user data
- Keep core assessment functionality usable where practical without AI

Structured deterministic results should be preferred for application-critical behavior when AI output is not required.

AI-generated recommendations may supplement those results rather than replace reliable application rules.

### Privacy

Assessment questions should avoid collecting sensitive or unrelated personal information unless clearly required by an approved feature.

Assessment data should focus on information relevant to the Deep Focus experience.

Examples may include:

- Focus preferences
- Productivity habits
- Common distraction patterns
- Preferred session length
- Break preferences
- Relevant productivity challenges

The assessment should not become a general-purpose personal profiling system.

### Historical Assessments

Where users are allowed to retake an assessment, previous completed attempts may remain available for historical or personalization purposes where useful.

A new attempt should normally create a new `Assessment` record rather than overwrite the previous completed record.

V1 does not require complex assessment-history presentation unless included in the approved product scope.

### Validation Rules

An `Assessment` should follow rules such as:

- `version` must identify a valid assessment definition
- Each answer must reference a valid `questionId`
- Answer values must match the expected question type
- Duplicate answers for the same question should be prevented unless explicitly supported
- Required questions must be completed before assessment completion
- A completed assessment should have `completedAt`
- Invalid assessment status transitions should be rejected
- User ownership relationships must remain valid

### Assessment Model Principles

The `Assessment` model should:

- Collect only useful productivity-related information
- Keep question definitions separate from user answers
- Preserve assessment versions
- Support safe personalization
- Preserve explicit user control over settings
- Treat AI recommendations as supportive rather than authoritative
- Minimize unnecessary personal data collection
- Support future assessment improvements
- Avoid unnecessary psychological or personal profiling
- Remain simple enough for reliable V1 implementation

---

## 13. Data Lifecycle

---

Deep Focus data should follow predictable lifecycle rules from creation through modification, synchronization, archival, and deletion.

Each entity should have a clearly defined authoritative source and should avoid unnecessary duplication of information.

### Creation

When a new persistent record is created:

- A stable unique identifier should be assigned
- Required fields should be validated
- Ownership should be associated where applicable
- `createdAt` should be recorded
- `updatedAt` should initially reflect the creation time
- Safe defaults should be applied where required

Invalid or incomplete records should not be persisted when required data is missing.

### Updates

When persistent data changes:

- Only relevant fields should be modified
- Validation rules should be applied
- `updatedAt` should be updated
- Ownership should not change unintentionally
- Historical records should not be rewritten unnecessarily

Completed historical activity should generally remain stable.

### Historical Data

Important completed records should preserve the history required for:

- Session history
- Analytics
- Goal progress
- Streak calculation
- Reward verification
- Assessment history

Historical source records should not be modified simply to change current summaries or derived statistics.

---

## 14. Deletion and Archival

---

Deletion behavior should protect both user control and data integrity.

Different entities may require different deletion strategies.

For example:

- Tasks may be deleted or archived without invalidating historical focus sessions
- Goals may remain as historical records after completion
- Completed focus sessions should normally remain available for history and analytics
- Assessment attempts may remain historical unless deleted according to supported privacy controls
- Account deletion should follow the project's security and privacy requirements

Relationships should not create unnecessary cascading data loss.

When a referenced record is removed, dependent historical records should remain understandable where practical.

Deep Focus should not retain user data longer than required by supported functionality, legitimate operational needs, or applicable project requirements.

---

## 15. Local Persistence and Synchronization

---

Deep Focus should support reliable local application behavior.

Where cloud synchronization is implemented, synchronization should preserve data integrity across local and remote state.

Synchronization should:

- Avoid duplicate records
- Preserve stable identifiers
- Respect user ownership
- Handle temporary network loss
- Recover safely from interrupted synchronization
- Avoid silently overwriting newer valid data
- Handle conflicts predictably
- Prevent duplicate reward processing
- Preserve completed historical activity

V1 should avoid introducing complex synchronization infrastructure before it is required by implemented functionality.

The exact persistence and synchronization mechanisms should be defined in the architecture, API specification, and database schema.

---

## 16. Data Integrity Rules

---

The application should maintain consistent relationships between entities.

Important integrity rules include:

- User-owned records must belong to the correct user
- Invalid entity references should be rejected where appropriate
- Completed sessions should not become active accidentally
- Cancelled sessions should not generate completion rewards
- Task completion should remain separate from focus-session completion
- Goal progress should use the correct measurement type
- Streak days should not be counted more than once
- Rewards should not be granted repeatedly for the same qualifying event
- Settings should not modify historical productivity records
- Assessment recommendations should not silently override explicit user preferences

Derived data should remain recoverable from authoritative records where practical.

---

## 17. Data Model Evolution

---

The data model may evolve as Deep Focus develops.

Future changes may include:

- New optional fields
- New entity types
- New relationships
- New goal types
- Additional reward capabilities
- Expanded synchronization
- Additional assessment functionality

Changes should be introduced only when supported product requirements justify them.

When persisted data structures change, migration behavior should preserve compatible existing user data where practical.

Breaking changes should not be introduced casually.

The V1 model should remain intentionally smaller than the possible long-term Deep Focus data model.

---

## 18. V1 Data Model Summary

---

The Deep Focus V1 data model is built around eight primary entities:

```text
User
 ├── FocusSession
 ├── Task
 ├── Goal
 ├── Streak
 ├── RewardProgress
 ├── UserSettings
 └── Assessment
```

Their primary responsibilities are:

```text
User
→ Account identity and ownership

FocusSession
→ Authoritative focus activity history

Task
→ Individual units of work

Goal
→ Measurable productivity targets

Streak
→ Consistency tracking

RewardProgress
→ Productivity rewards and progression

UserSettings
→ User-configurable application preferences

Assessment
→ Productivity assessment and personalization data
```

Analytics should primarily derive information from authoritative application records rather than duplicate the same historical data.

Supporting entities may be introduced during database or implementation design only when they solve a concrete V1 requirement.

---

# Conclusion

---

This Data Model defines the logical data foundation for Deep Focus V1.

The model should prioritize:

- Clear entity responsibilities
- Reliable focus-session history
- Data integrity
- User ownership
- Privacy and data minimization
- Predictable lifecycle behavior
- Reliable local persistence
- Safe future synchronization
- Recoverable derived data
- Maintainable implementation

The data model should remain aligned with the approved Deep Focus product requirements and architecture.

Implementation-specific storage structures, database relationships, constraints, and indexes should be defined in `DATABASE_SCHEMA.md`.

Frontend and backend data exchange should be defined in `API_SPEC.md`.

Security-sensitive storage, authentication, authorization, and data-protection requirements should be defined in `SECURITY.md`.

The V1 data model should remain focused on functionality required to build the first usable version of Deep Focus without introducing speculative complexity.

---

## 19. V1 Planning Support and AI Action Types

The approved V1 AI scope introduces one lightweight reminder entity, an optional
task hierarchy field, and two supporting server-owned AI usage entities.

### Task Parent Relationship

To support a user-confirmed `Break Down This Task` proposal, V1 may extend `Task`
with:

```ts
parentTaskId?: string;
```

Rules:

- parent and child tasks belong to the same authenticated user;
- a task cannot be its own parent;
- V1 should prevent hierarchy cycles;
- deleting a parent should preserve child tasks and detach them where required;
- the relationship remains optional so ordinary tasks are unchanged.

### TaskReminder

`TaskReminder` represents one user-confirmed reminder for a user-owned task.

```ts
type TaskReminderSource = 'manual' | 'plan_my_day';
type TaskReminderStatus = 'scheduled' | 'cancelled';

interface TaskReminder {
  id: string;
  userId: string;
  taskId: string;
  scheduledFor: string;
  source: TaskReminderSource;
  status: TaskReminderStatus;
  createdAt: string;
  updatedAt: string;
}
```

Rules:

- the task and reminder belong to the same authenticated user;
- an AI proposal does not create a reminder until the user confirms it;
- reminder times use validated timezone-aware timestamps;
- duplicate retries must not schedule the same logical reminder more than once;
- cancelling or deleting a reminder must cancel the corresponding scheduled
  notification where possible;
- deleting a task cancels or removes its future reminders according to the
  approved retention behavior.

### AIActionGrant

`AIActionGrant` represents a trusted allowance of eligible AI actions.

```ts
type AIActionGrantSource =
  | 'introductory'
  | 'rewarded_ad'
  | 'administrative_adjustment';

interface AIActionGrant {
  id: string;
  userId: string;
  source: AIActionGrantSource;
  grantedActions: number;
  consumedActions: number;
  verificationReferenceHash?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

Rules:

- the introductory source grants five actions once per eligible user;
- `0 <= consumedActions <= grantedActions`;
- a rewarded-ad grant requires trusted verification;
- provider verification evidence must not be exposed as ordinary client-editable
  state;
- grant size and expiration remain server-configured until exact product values
  are approved.

### AIActionRequest

`AIActionRequest` records trusted lifecycle and consumption metadata without
requiring full prompt or response retention.

```ts
type AIActionType =
  | 'plan_my_day'
  | 'break_down_task'
  | 'review_my_day_lite';

type AIActionRequestStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface AIActionRequest {
  id: string;
  userId: string;
  actionType: AIActionType;
  status: AIActionRequestStatus;
  grantId?: string;
  idempotencyKey?: string;
  createdAt: string;
  completedAt?: string;
}
```

Rules:

- user ownership comes from authenticated identity;
- full user prompts and AI responses are not stored by default;
- a failed or cancelled request does not consume a grant unless a later approved
  contract explicitly defines and discloses different behavior;
- one logical completed request consumes at most one eligible action;
- repeated requests with the same supported idempotency key must not consume
  multiple actions.

### AIPlanProposal

`AIPlanProposal` is a validated application-layer type, not a trusted productivity
record.

```ts
interface AIPlanProposal {
  proposalId: string;
  actionType: 'plan_my_day' | 'break_down_task';
  items: AIProposedAction[];
  explanation?: string;
  expiresAt?: string;
}
```

The proposal remains uncommitted until the user confirms exact items. Confirmed
writes create or update ordinary V1 entities through their normal validation,
ownership, persistence, synchronization, and duplicate-protection rules.

`Review My Day Lite` should derive verified metrics from existing records and
does not require a new persisted daily-review entity for V1.

---
