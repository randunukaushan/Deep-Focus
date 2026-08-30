# Deep Focus Database Schema

This document defines the database structure for Deep Focus V1.

It translates the logical entities defined in `DATA_MODEL.md` into persistent database structures, relationships, constraints, and indexes required by the application.

The schema should support reliable focus-session history, user-owned data, synchronization, analytics, goals, streaks, rewards, settings, and assessments while remaining simple enough for V1 implementation.

API behavior is defined in `API_SPEC.md`.

Security-sensitive database requirements should follow `SECURITY.md`.

---

## 1. Database Goals

---

The Deep Focus V1 database should:

- Preserve reliable user data
- Maintain clear relationships between entities
- Protect user ownership boundaries
- Support efficient focus-session history
- Support tasks and goals
- Support streak and reward progression
- Store user preferences
- Preserve assessment data
- Support analytics queries
- Prevent invalid or duplicate records
- Support reliable synchronization
- Maintain data integrity during updates and deletion
- Remain scalable without unnecessary V1 complexity

The database should prioritize correctness and maintainability over premature optimization.

---

## 2. Schema Principles

---

The database schema should follow these principles:

- Use stable unique identifiers
- Enforce important relationships
- Use appropriate database constraints
- Avoid unnecessary duplication
- Preserve important historical records
- Index fields used frequently for filtering and relationships
- Store timestamps consistently
- Separate authoritative data from derived data
- Protect user-owned records
- Support safe future migrations

Database constraints should enforce important invariants where practical rather than relying entirely on application code.

---

## 3. Primary Tables

---

The V1 database should contain the following primary tables:

```text
users
focus_sessions
tasks
goals
streaks
reward_progress
user_settings
assessments
```

These tables correspond to the primary logical entities defined in `DATA_MODEL.md`.

Conceptually:

```text
users
 ├── focus_sessions
 ├── tasks
 ├── goals
 ├── streaks
 ├── reward_progress
 ├── user_settings
 └── assessments
```

Supporting tables may be introduced where required for:

- Authentication
- Achievement tracking
- Reward-event deduplication
- Assessment answers
- Synchronization
- Task reminders
- AI action grants and request accounting
- Database-provider requirements

Supporting tables should only be introduced when they solve a concrete implementation requirement.

---

## 4. Common Database Conventions

---

### Identifiers

Primary records should use stable unique identifiers.

Conceptually:

```text
id
```

The exact identifier type may depend on the selected database technology.

Suitable approaches may include:

- UUID
- Provider-generated stable identifiers

Identifiers should not depend on mutable information such as email addresses or display names.

### User Ownership

User-owned tables should reference the owning user through:

```text
user_id
```

Ownership relationships should be enforced where applicable.

The backend should determine trusted ownership from authenticated identity rather than accepting arbitrary ownership claims from the client.

### Timestamps

Persistent records should use consistent timestamps.

Common fields include:

```text
created_at
updated_at
```

Lifecycle-specific timestamps may include:

```text
started_at
completed_at
cancelled_at
last_paused_at
last_resumed_at
```

Timestamps should use a consistent storage standard.

UTC should normally be used for absolute timestamps.

Calendar-day concepts such as streak dates should preserve the information required for correct user-local date calculations.

### Naming

Database names should use a consistent naming convention.

This specification uses:

```text
snake_case
```

Examples:

```text
focus_sessions
planned_duration_seconds
created_at
user_id
```

Application models may use different naming conventions such as camelCase and map them at the persistence boundary.

### Nullability

Fields should be nullable only when the data model allows the value to be absent.

For example:

```text
task_id
completed_at
cancelled_at
```

may be nullable depending on record state.

Required identity, status, and creation fields should not be nullable without a clear reason.

### Numeric Values

Duration and progress values should use numeric database types.

Examples:

```text
planned_duration_seconds
focused_duration_seconds
paused_duration_seconds
target_value
current_value
total_xp
```

Values that must never be negative should be protected through validation and database constraints where supported.

---

## 5. Users Table

---

The `users` table stores the primary account identity for Deep Focus users.

Authentication credentials should remain managed by the selected authentication system and should not be duplicated unnecessarily inside the application-level user table.

### Table: `users`

```text
users
```

Recommended columns:

```text
id
email
display_name
avatar_url
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the user.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null
- Used by user-owned records as the ownership reference

#### `email`

Optional application-level email reference where required.

```text
email
```

Requirements:

- Nullable when the authentication model allows users without email
- Validated by the authentication layer
- Should normally be unique when email-based accounts are used

The email address should not be used as the permanent primary key.

#### `display_name`

Optional user-facing name.

```text
display_name
```

Changing the display name should not affect ownership or relationships.

#### `avatar_url`

Optional profile-image reference.

```text
avatar_url
```

This field may remain null when the user has no custom avatar.

#### `created_at`

Timestamp representing account-record creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent meaningful user-record update.

```text
updated_at
```

Should be non-null.

### Constraints

Recommended constraints include:

```text
PRIMARY KEY (id)

UNIQUE (email)
```

The email uniqueness constraint should only be applied when the selected authentication architecture requires application-level email uniqueness.

### Indexes

Recommended indexes may include:

```text
users_email_idx
```

An email index is useful when application workflows legitimately query users by email.

Unnecessary indexes should not be created when the authentication provider already handles the required lookup behavior.

---

## 6. Focus Sessions Table

---

The `focus_sessions` table stores authoritative historical focus activity.

This is one of the most important tables in Deep Focus because analytics, streaks, goals, rewards, and session recovery may depend on its data.

Completed historical sessions should remain stable and should not be rewritten unnecessarily.

### Table: `focus_sessions`

```text
focus_sessions
```

Recommended columns:

```text
id
user_id
task_id
title
status
planned_duration_seconds
focused_duration_seconds
paused_duration_seconds
started_at
completed_at
cancelled_at
last_paused_at
last_resumed_at
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the focus-session record.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

#### `user_id`

References the user who owns the session.

```text
user_id
```

Relationship:

```text
focus_sessions.user_id
        ↓
users.id
```

This field should be non-null for authenticated persisted sessions.

The exact nullability may depend on whether V1 supports local pre-authentication session creation.

#### `task_id`

Optional reference to a related task.

```text
task_id
```

Relationship:

```text
focus_sessions.task_id
        ↓
tasks.id
```

This field should remain nullable.

A focus session should remain valid without a task.

Deleting a task should not automatically delete historical focus sessions.

#### `title`

Optional session title.

```text
title
```

This field may remain nullable.

#### `status`

Represents the current session state.

```text
status
```

Supported V1 values:

```text
active
paused
completed
cancelled
```

The database should reject unsupported status values where the selected database supports appropriate constraints.

#### `planned_duration_seconds`

The intended duration of the focus session.

```text
planned_duration_seconds
```

Requirements:

- Non-null
- Greater than zero

#### `focused_duration_seconds`

Confirmed focus time accumulated during the session.

```text
focused_duration_seconds
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative

Paused time should not be included.

#### `paused_duration_seconds`

Total accumulated paused duration.

```text
paused_duration_seconds
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative

#### `started_at`

Timestamp representing when the session began.

```text
started_at
```

Should be populated once the session becomes active.

#### `completed_at`

Timestamp representing successful completion.

```text
completed_at
```

Nullable unless:

```text
status = completed
```

#### `cancelled_at`

Timestamp representing cancellation.

```text
cancelled_at
```

Nullable unless:

```text
status = cancelled
```

#### `last_paused_at`

Timestamp of the most recent pause.

```text
last_paused_at
```

Nullable.

#### `last_resumed_at`

Timestamp of the most recent resume.

```text
last_resumed_at
```

Nullable.

#### `created_at`

Timestamp representing record creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent session-state update.

```text
updated_at
```

Should be non-null.

### Relationships

Primary relationship:

```text
users
  │
  └── focus_sessions
```

Optional task relationship:

```text
tasks
  │
  └── focus_sessions
```

Conceptually:

```text
users.id
   ↓
focus_sessions.user_id

tasks.id
   ↓
focus_sessions.task_id
```

### Foreign Key Behavior

Recommended relationship behavior:

```text
user deletion
→ handled according to account-deletion policy

task deletion
→ should not delete focus-session history
```

For `task_id`, an appropriate strategy may be:

```text
ON DELETE SET NULL
```

or equivalent behavior provided by the selected database architecture.

Historical focus-session data should remain intact.

### Session State Constraints

Where supported, database and application validation should maintain rules such as:

```text
planned_duration_seconds > 0

focused_duration_seconds >= 0

paused_duration_seconds >= 0
```

Lifecycle consistency should also be protected.

Examples:

```text
status = completed
→ completed_at should exist

status = cancelled
→ cancelled_at should exist
```

A session should not logically contain both a completion timestamp and cancellation state.

Complex lifecycle validation may remain partly in the application/service layer when database constraints would become unnecessarily difficult to maintain.

### Active Session Constraint

If Deep Focus V1 allows only one active or paused focus session per user, this invariant should be protected as reliably as practical.

Conceptually:

```text
One user
→ maximum one active/paused session
```

Depending on the selected database, this may be enforced through:

- A partial unique index
- Transactional backend validation
- Another equivalent consistency mechanism

The client interface alone should not be trusted to enforce this rule.

### Recommended Indexes

Recommended indexes include:

```text
focus_sessions_user_id_idx
focus_sessions_user_created_at_idx
focus_sessions_user_status_idx
focus_sessions_task_id_idx
```

Conceptually:

```text
INDEX (user_id)

INDEX (user_id, created_at)

INDEX (user_id, status)

INDEX (task_id)
```

These indexes support common operations such as:

- Retrieving session history
- Finding active sessions
- Filtering sessions by status
- Calculating analytics by user and date
- Finding sessions associated with a task

### Analytics Queries

The `focus_sessions` table should support analytics such as:

```text
Total focus time
Completed session count
Average session duration
Daily focus time
Weekly focus time
Task-related focus history
```

Analytics queries should primarily use completed authoritative session records.

Cancelled sessions should not contribute to completed productivity metrics unless a future feature explicitly requires separate cancellation analytics.

### Historical Integrity

Completed focus-session records should normally be treated as historical records.

After completion, updates should be limited to legitimate correction, synchronization, or migration scenarios.

Routine settings or task changes should not rewrite historical session duration.

### Focus Session Table Principles

The `focus_sessions` table should:

- Preserve authoritative focus history
- Support reliable session recovery
- Separate focus time from paused time
- Protect valid lifecycle states
- Preserve history when related tasks are removed
- Support efficient user and date queries
- Support analytics without duplicating summary data
- Prevent invalid duplicate active sessions where required
- Remain simple enough for reliable V1 implementation

---

## 7. Tasks Table

---

The `tasks` table stores lightweight user-defined work items.

Tasks should remain simple in V1 and should not introduce unnecessary project-management complexity.

### Table: `tasks`

```text
tasks
```

Recommended columns:

```text
id
user_id
goal_id
title
description
status
priority
due_at
completed_at
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the task.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

#### `user_id`

References the user who owns the task.

```text
user_id
```

Relationship:

```text
tasks.user_id
   ↓
users.id
```

Ownership should be enforced by the backend.

#### `goal_id`

Optional reference to a related goal.

```text
goal_id
```

Relationship:

```text
tasks.goal_id
   ↓
goals.id
```

This field should remain nullable.

Tasks should remain valid even when they are not associated with a goal.

#### `title`

Primary human-readable task name.

```text
title
```

Requirements:

- Non-null
- Must not be empty
- Should have a reasonable maximum length

#### `description`

Optional additional task information.

```text
description
```

Nullable.

#### `status`

Represents the task lifecycle state.

```text
status
```

Supported V1 values:

```text
pending
in_progress
completed
cancelled
```

Unsupported values should be rejected.

#### `priority`

Optional task priority.

```text
priority
```

Supported V1 values:

```text
low
medium
high
```

This field should remain nullable.

#### `due_at`

Optional due date or deadline.

```text
due_at
```

Nullable.

#### `completed_at`

Timestamp representing task completion.

```text
completed_at
```

Should normally exist only when:

```text
status = completed
```

#### `created_at`

Timestamp representing task creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent meaningful task update.

```text
updated_at
```

Should be non-null.

### Relationships

Conceptually:

```text
users
  │
  └── tasks

goals
  │
  └── tasks

tasks
  │
  └── focus_sessions
```

A task may:

- Belong to one user
- Optionally belong to one goal
- Be referenced by multiple focus sessions

### Foreign Key Behavior

Recommended behavior:

```text
user deletion
→ handled according to account-deletion policy

goal deletion
→ task should remain valid where practical

task deletion
→ historical focus sessions should remain valid
```

For `goal_id`, an appropriate strategy may be:

```text
ON DELETE SET NULL
```

For `focus_sessions.task_id`, the same historical-preservation principle should apply.

### Task Constraints

Recommended validation rules include:

```text
title must not be empty

status must be supported

priority must be supported when present
```

Lifecycle consistency should also be preserved.

For example:

```text
status = completed
→ completed_at should exist
```

### Recommended Indexes

Recommended indexes include:

```text
tasks_user_id_idx
tasks_user_status_idx
tasks_goal_id_idx
tasks_user_due_at_idx
```

Conceptually:

```text
INDEX (user_id)

INDEX (user_id, status)

INDEX (goal_id)

INDEX (user_id, due_at)
```

These indexes support:

- Task lists
- Active or completed task filtering
- Goal-related task queries
- Upcoming task queries

### Task Historical Integrity

Deleting or modifying a task should not invalidate historical focus-session records.

Completed focus sessions should remain usable for analytics even if the original task no longer exists.

If historical display requires the original task title after deletion, a lightweight snapshot approach may be introduced later if required.

### Task Table Principles

The `tasks` table should:

- Remain lightweight
- Support optional goal association
- Preserve user ownership
- Support efficient task filtering
- Keep task completion separate from focus-session completion
- Avoid duplicated productivity statistics
- Preserve historical session integrity
- Avoid unnecessary project-management complexity

---

## 8. Goals Table

---

The `goals` table stores measurable productivity targets.

Goals should support simple V1 progress types without introducing complex planning or project-management behavior.

### Table: `goals`

```text
goals
```

Recommended columns:

```text
id
user_id
title
description
type
period
status
target_value
current_value
starts_at
ends_at
completed_at
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the goal.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

#### `user_id`

References the user who owns the goal.

```text
user_id
```

Relationship:

```text
goals.user_id
   ↓
users.id
```

Ownership should be enforced by the backend.

#### `title`

Primary human-readable goal name.

```text
title
```

Requirements:

- Non-null
- Must not be empty

#### `description`

Optional goal description.

```text
description
```

Nullable.

#### `type`

Defines how goal progress is measured.

```text
type
```

Supported V1 values:

```text
focus_time
session_count
task_completion
```

Unsupported goal types should be rejected.

#### `period`

Defines the tracking period.

```text
period
```

Supported V1 values:

```text
daily
weekly
monthly
custom
```

#### `status`

Represents the goal lifecycle state.

```text
status
```

Supported V1 values:

```text
active
completed
cancelled
expired
```

#### `target_value`

Represents the amount required for goal completion.

```text
target_value
```

Requirements:

- Non-null
- Greater than zero

The unit depends on `type`.

Examples:

```text
focus_time
→ seconds

session_count
→ count

task_completion
→ count
```

#### `current_value`

Represents current goal progress.

```text
current_value
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative

Where practical, this value should be derived from authoritative records.

If persisted for performance or convenience, it must remain synchronized with its authoritative sources.

#### `starts_at`

Optional timestamp representing when the goal period begins.

```text
starts_at
```

May be automatically determined for standard periods.

#### `ends_at`

Optional timestamp representing when the goal period ends.

```text
ends_at
```

For time-limited goals:

```text
ends_at >= starts_at
```

when both values exist.

#### `completed_at`

Timestamp representing successful goal completion.

```text
completed_at
```

Should normally exist only when:

```text
status = completed
```

#### `created_at`

Timestamp representing goal creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent meaningful goal update.

```text
updated_at
```

Should be non-null.

### Relationships

Conceptually:

```text
users
  │
  └── goals

goals
  │
  └── tasks

focus_sessions
      ↓
goal progress

tasks
  ↓
goal progress
```

A goal may have multiple tasks.

Goal progress may also depend directly on focus-session activity without requiring task associations.

### Progress Sources

Progress should depend on goal type.

```text
focus_time
→ qualifying completed focus-session duration

session_count
→ qualifying completed focus-session count

task_completion
→ qualifying completed tasks
```

The database should not accept arbitrary trusted progress values from the client when progress can be calculated from verified backend-managed records.

### Goal Completion

A goal may transition automatically to:

```text
completed
```

when:

```text
current_value >= target_value
```

When this occurs:

```text
status = completed
completed_at = completion timestamp
```

Completion may trigger reward processing.

Duplicate completion processing should be prevented.

### Goal Expiration

Time-limited goals may transition to:

```text
expired
```

when:

- The tracking period ends
- The target was not reached
- The product rules do not renew the same record

New recurring periods should normally create new goal records rather than overwrite historical completed or expired records.

### Goal Constraints

Recommended constraints include:

```text
target_value > 0

current_value >= 0
```

Where supported:

```text
type IN (
  'focus_time',
  'session_count',
  'task_completion'
)

period IN (
  'daily',
  'weekly',
  'monthly',
  'custom'
)

status IN (
  'active',
  'completed',
  'cancelled',
  'expired'
)
```

Lifecycle consistency should also be validated.

For example:

```text
status = completed
→ completed_at should exist
```

### Recommended Indexes

Recommended indexes include:

```text
goals_user_id_idx
goals_user_status_idx
goals_user_period_idx
goals_user_ends_at_idx
```

Conceptually:

```text
INDEX (user_id)

INDEX (user_id, status)

INDEX (user_id, period)

INDEX (user_id, ends_at)
```

These indexes support:

- Active goal queries
- Daily, weekly, or monthly goal views
- Expiration processing
- Goal history

### Historical Integrity

Completed, expired, or cancelled goals should normally remain historical records.

A new recurring goal period should not overwrite the previous goal record.

Historical goal records help support:

- Analytics
- Reward verification
- Progress history
- Future comparisons

### Goal Table Principles

The `goals` table should:

- Support measurable V1 productivity targets
- Preserve user ownership
- Use consistent progress units
- Support automatic completion
- Preserve historical goal records
- Avoid arbitrary client-controlled progress
- Support efficient status and period queries
- Integrate with tasks, sessions, analytics, and rewards
- Remain simple enough for reliable V1 implementation

---

## 9. Streaks Table

---

The `streaks` table stores the user's current consistency streak and longest achieved streak.

The table should support efficient streak presentation while keeping completed focus-session history as the authoritative source of qualifying productivity activity.

### Table: `streaks`

```text
streaks
```

Recommended columns:

```text
id
user_id
current_streak
longest_streak
last_qualifying_date
current_streak_started_at
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the streak record.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

A user should normally have one primary V1 streak record.

#### `user_id`

References the owning user.

```text
user_id
```

Relationship:

```text
streaks.user_id
   ↓
users.id
```

Requirements:

- Non-null for authenticated persisted users
- Unique when one streak record per user is enforced

#### `current_streak`

Represents the current number of consecutive qualifying calendar days.

```text
current_streak
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative

#### `longest_streak`

Represents the highest streak achieved by the user.

```text
longest_streak
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative
- Should not be lower than `current_streak`

#### `last_qualifying_date`

Stores the most recent calendar date on which qualifying focus activity occurred.

```text
last_qualifying_date
```

This value should represent a calendar date rather than a full timestamp where practical.

Example:

```text
2026-08-19
```

The application should calculate the qualifying date using consistent user-local calendar rules.

#### `current_streak_started_at`

Represents when the current streak began.

```text
current_streak_started_at
```

This field may remain nullable when no active streak exists.

#### `created_at`

Timestamp representing streak-record creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent streak update.

```text
updated_at
```

Should be non-null.

### Constraints

Recommended constraints include:

```text
PRIMARY KEY (id)

UNIQUE (user_id)

current_streak >= 0

longest_streak >= 0

longest_streak >= current_streak
```

The exact syntax depends on the selected database.

### Streak Update Rules

Qualifying focus activity should update the streak according to calendar-day rules.

Conceptually:

```text
No previous qualifying date
→ current_streak = 1

Same qualifying date
→ no streak increment

Next consecutive date
→ current_streak += 1

Gap greater than one day
→ current_streak = 1
```

After an update:

```text
if current_streak > longest_streak
→ longest_streak = current_streak
```

Multiple completed focus sessions on the same qualifying day must not increase the streak more than once.

### Focus Session Relationship

Streak calculations should consume qualifying `focus_sessions` records.

Conceptually:

```text
focus_sessions
      ↓
qualifying completed activity
      ↓
streaks
```

The streak table should not become the authoritative historical record of productivity activity.

Historical focus sessions should remain available to recalculate streak values if necessary.

### Recommended Indexes

Because `user_id` should normally be unique, the unique constraint itself may provide the primary lookup index.

An additional date-related index may only be introduced if real query patterns require it.

V1 should avoid unnecessary streak indexes.

### Streak Table Principles

The `streaks` table should:

- Maintain one primary streak record per user
- Count qualifying calendar days rather than sessions
- Preserve longest streak history
- Prevent duplicate same-day increments
- Use consistent time-zone-aware date logic
- Remain recoverable from focus-session history
- Avoid unnecessary historical duplication
- Support efficient dashboard and rewards access

---

## 10. Reward Progress Table

---

The `reward_progress` table stores the user's current Deep Focus progression state.

It should contain summarized reward progress while verified productivity records remain the source of qualifying reward events.

### Table: `reward_progress`

```text
reward_progress
```

Recommended columns:

```text
id
user_id
total_xp
level
created_at
updated_at
```

Unlocked achievements should be stored separately when relational storage provides better integrity and duplicate prevention.

### Column Definitions

#### `id`

Primary key for the reward-progress record.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

#### `user_id`

References the user who owns the reward progress.

```text
user_id
```

Relationship:

```text
reward_progress.user_id
        ↓
users.id
```

A user should normally have one V1 reward-progress record.

#### `total_xp`

Total confirmed XP earned by the user.

```text
total_xp
```

Requirements:

- Non-null
- Default to `0`
- Must not be negative

XP should only be updated through verified reward-processing logic.

#### `level`

Current progression level.

```text
level
```

Requirements:

- Non-null
- Valid progression value
- Should remain consistent with `total_xp`

Where practical, level should be derived from centralized XP thresholds.

If stored for efficient access, it must remain synchronized with `total_xp`.

#### `created_at`

Timestamp representing reward-progress creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent reward-progress update.

```text
updated_at
```

Should be non-null.

### Constraints

Recommended constraints include:

```text
PRIMARY KEY (id)

UNIQUE (user_id)

total_xp >= 0

level >= 1
```

The initial level may be adjusted if the approved reward system uses a different starting convention.

### Reward Progress Relationships

Reward progress may be influenced by verified events from:

```text
focus_sessions
goals
streaks
```

Conceptually:

```text
Verified Productivity Event
        ↓
Reward Processing
        ↓
reward_progress
```

The client should not directly control trusted XP values.

### Achievement Storage

Unlocked achievements should preferably use a supporting relational table rather than an array column when the selected database supports this cleanly.

Recommended table:

```text
user_achievements
```

Possible columns:

```text
id
user_id
achievement_id
unlocked_at
```

Conceptually:

```text
users
  │
  └── user_achievements
```

A unique constraint should prevent the same achievement from being unlocked multiple times for the same user.

Recommended constraint:

```text
UNIQUE (user_id, achievement_id)
```

### Achievement Definitions

Static achievement definitions may remain in application or backend configuration.

If database-managed achievement definitions become necessary, a supporting table may be introduced:

```text
achievement_definitions
```

Possible fields:

```text
id
title
description
xp_reward
```

This table is optional for V1.

It should only be introduced if remotely managed achievement definitions provide a clear implementation benefit.

### Reward Event Deduplication

Important reward-producing events must not be processed repeatedly.

If application architecture requires durable deduplication, a supporting table may be introduced:

```text
reward_events
```

Possible columns:

```text
id
user_id
source_type
source_id
reward_type
xp_amount
created_at
```

Example source values:

```text
focus_session
goal
streak_milestone
achievement
```

A uniqueness rule may prevent duplicate processing.

Conceptually:

```text
UNIQUE (
  user_id,
  source_type,
  source_id,
  reward_type
)
```

The exact structure should depend on actual V1 reward-processing requirements.

A reward-events table should not be introduced merely for theoretical future use if simpler server-side state checks provide sufficient reliability.

### Recommended Indexes

For `reward_progress`:

```text
UNIQUE (user_id)
```

For `user_achievements` where implemented:

```text
INDEX (user_id)

UNIQUE (user_id, achievement_id)
```

For `reward_events` where implemented:

```text
INDEX (user_id, created_at)
```

Additional indexes should be based on actual query requirements.

### Reward Integrity

The database and backend should ensure that:

- Cancelled sessions do not grant completion rewards
- The same achievement is not unlocked repeatedly
- Duplicate completion processing does not grant duplicate XP
- Reward progress belongs to the correct user
- Level remains consistent with XP
- Historical productivity records are not modified by reward processing

### Reward Progress Table Principles

The reward schema should:

- Keep current progression simple
- Prevent duplicate reward grants
- Keep achievement definitions separate from user progress
- Use supporting tables only when required
- Preserve clear user ownership
- Consume verified productivity events
- Avoid client-controlled trusted XP
- Avoid unnecessary game-economy complexity
- Remain extensible without overengineering V1

---

## 11. User Settings Table

---

The `user_settings` table stores configurable preferences for each Deep Focus user.

Settings should remain separate from the primary `users` table so application preferences can evolve without unnecessarily changing account identity data.

### Table: `user_settings`

```text
user_settings
```

Recommended columns:

```text
id
user_id
theme
default_focus_duration_minutes
default_break_duration_minutes
notifications_enabled
focus_reminders_enabled
break_reminders_enabled
achievement_notifications_enabled
sound_enabled
haptics_enabled
reduced_motion
ai_features_enabled
ai_coaching_notifications_enabled
created_at
updated_at
```

### Column Definitions

#### `id`

Primary key for the settings record.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

#### `user_id`

References the user who owns the settings.

```text
user_id
```

Relationship:

```text
user_settings.user_id
        ↓
users.id
```

A user should normally have one primary settings record.

Requirements:

- Non-null for authenticated persisted settings
- Unique when one settings record per user is enforced

#### `theme`

Stores the user's preferred application appearance.

```text
theme
```

Supported V1 values:

```text
light
dark
system
```

The default should normally be:

```text
system
```

#### `default_focus_duration_minutes`

Stores the default duration suggested for new focus sessions.

```text
default_focus_duration_minutes
```

Requirements:

- Non-null
- Greater than zero
- Default according to approved V1 behavior

A reasonable initial default may be:

```text
25
```

Changing this value should not modify historical focus sessions.

#### `default_break_duration_minutes`

Stores the default break duration.

```text
default_break_duration_minutes
```

Requirements:

- Non-null
- Greater than zero

A reasonable initial default may be:

```text
5
```

#### `notifications_enabled`

Controls the application's general notification preference.

```text
notifications_enabled
```

Recommended type:

```text
boolean
```

This preference does not override operating-system notification permissions.

#### `focus_reminders_enabled`

Controls supported focus reminders.

```text
focus_reminders_enabled
```

Recommended type:

```text
boolean
```

#### `break_reminders_enabled`

Controls supported break reminders.

```text
break_reminders_enabled
```

Recommended type:

```text
boolean
```

#### `achievement_notifications_enabled`

Controls achievement and milestone notifications.

```text
achievement_notifications_enabled
```

Recommended type:

```text
boolean
```

Disabling notifications should not prevent achievements from being earned.

#### `sound_enabled`

Controls supported application sound effects.

```text
sound_enabled
```

Recommended type:

```text
boolean
```

#### `haptics_enabled`

Controls supported haptic feedback.

```text
haptics_enabled
```

Recommended type:

```text
boolean
```

#### `reduced_motion`

Stores the application-level reduced-motion preference.

```text
reduced_motion
```

Recommended type:

```text
boolean
```

The application should also respect relevant operating-system accessibility settings.

#### `ai_features_enabled`

Controls optional AI-assisted functionality.

```text
ai_features_enabled
```

Recommended type:

```text
boolean
```

Core focus functionality should not depend unnecessarily on this value being enabled.

#### `ai_coaching_notifications_enabled`

Controls supported AI-assisted coaching notifications.

```text
ai_coaching_notifications_enabled
```

Recommended type:

```text
boolean
```

This preference should only have an effect when relevant AI and notification functionality is available.

#### `created_at`

Timestamp representing settings-record creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent settings update.

```text
updated_at
```

Should be non-null.

### Constraints

Recommended constraints include:

```text
PRIMARY KEY (id)

UNIQUE (user_id)

default_focus_duration_minutes > 0

default_break_duration_minutes > 0
```

Where supported:

```text
theme IN (
  'light',
  'dark',
  'system'
)
```

Reasonable maximum duration limits should also be enforced by application validation.

### Default Values

The database or application initialization layer should provide consistent defaults.

Conceptually:

```text
theme = system

default_focus_duration_minutes = 25
default_break_duration_minutes = 5

notifications_enabled = true
focus_reminders_enabled = true
break_reminders_enabled = true
achievement_notifications_enabled = true

sound_enabled = true
haptics_enabled = true

reduced_motion = false

ai_features_enabled = true
ai_coaching_notifications_enabled = false
```

Final defaults should remain aligned with approved product behavior.

### Local and Cloud Settings

Not every device-level preference necessarily needs cloud synchronization.

For example, operating-system permission state should not be stored as if it were a global user preference.

Conceptually:

```text
User Preference
→ may synchronize

OS Permission State
→ remains device-specific
```

The application should distinguish these responsibilities clearly.

### Recommended Indexes

Because `user_id` should normally be unique:

```text
UNIQUE (user_id)
```

should provide the primary settings lookup path.

Additional indexes are not required for ordinary V1 settings access.

### User Settings Table Principles

The `user_settings` table should:

- Maintain one primary settings record per user
- Keep preferences separate from account identity
- Provide safe defaults
- Support partial updates
- Avoid modifying historical productivity records
- Respect device-level permissions
- Support future settings migration
- Avoid unnecessary indexes and complexity

---

## 12. Assessments Table

---

The `assessments` table stores individual Deep Focus assessment attempts.

Assessment attempts should preserve the assessment version used so historical answers remain interpretable after assessment definitions change.

### Table: `assessments`

```text
assessments
```

Recommended columns:

```text
id
user_id
version
status
result
started_at
completed_at
created_at
updated_at
```

Assessment answers may be stored in a supporting relational table to preserve validation and maintainability.

### Column Definitions

#### `id`

Primary key for the assessment attempt.

```text
id
```

Requirements:

- Unique
- Stable
- Non-null

Each assessment attempt should receive its own identifier.

#### `user_id`

References the user who owns the assessment.

```text
user_id
```

Relationship:

```text
assessments.user_id
        ↓
users.id
```

Ownership should be enforced by the backend.

#### `version`

Identifies the assessment definition used by this attempt.

```text
version
```

Requirements:

- Non-null
- Must reference or correspond to a valid supported assessment version

Example:

```text
1.0
```

Historical attempts should preserve their original version.

#### `status`

Represents the assessment lifecycle state.

```text
status
```

Supported V1 values:

```text
in_progress
completed
cancelled
```

#### `result`

Stores the structured assessment result where required.

```text
result
```

Depending on the selected database, this may use an appropriate structured JSON-capable type.

Possible result data may include:

```json
{
  "recommendedFocusDurationMinutes": 25,
  "recommendedBreakDurationMinutes": 5,
  "productivityProfile": "balanced",
  "primaryChallenges": [
    "notifications"
  ]
}
```

The result should contain only structured information required by supported application behavior.

Sensitive or unnecessary personal information should not be added.

#### `started_at`

Timestamp representing when the assessment attempt began.

```text
started_at
```

Should be non-null.

#### `completed_at`

Timestamp representing successful assessment completion.

```text
completed_at
```

Should normally exist only when:

```text
status = completed
```

#### `created_at`

Timestamp representing record creation.

```text
created_at
```

Should be non-null.

#### `updated_at`

Timestamp representing the most recent assessment update.

```text
updated_at
```

Should be non-null.

### Assessment Answers Table

A supporting table is recommended for individual assessment answers.

### Table: `assessment_answers`

```text
assessment_answers
```

Recommended columns:

```text
id
assessment_id
question_id
value
created_at
updated_at
```

#### `id`

Primary key for the answer record.

```text
id
```

#### `assessment_id`

References the owning assessment attempt.

```text
assessment_id
```

Relationship:

```text
assessment_answers.assessment_id
            ↓
assessments.id
```

#### `question_id`

Stores the stable identifier of the assessment question.

```text
question_id
```

The full user-facing question text should not be duplicated in every answer record.

#### `value`

Stores the user's answer.

```text
value
```

Because supported answers may include:

```text
string
number
boolean
string array
```

an appropriate structured database type may be used.

The application should validate the value against the expected question type before persistence.

#### `created_at`

Timestamp representing answer creation.

```text
created_at
```

#### `updated_at`

Timestamp representing the most recent answer update.

```text
updated_at
```

### Assessment Answer Constraints

A single assessment should normally contain only one answer per question.

Recommended constraint:

```text
UNIQUE (
  assessment_id,
  question_id
)
```

This prevents accidental duplicate answers.

### Assessment Definition Storage

Assessment question definitions do not need to be stored in the primary user-data schema when V1 uses static application or backend configuration.

Conceptually:

```text
Assessment Definition
├── Version
├── Questions
└── Validation Rules
```

User data then stores:

```text
Assessment Attempt
├── Version
├── Answers
└── Result
```

If remotely managed assessment definitions become necessary later, dedicated definition tables may be introduced.

### Assessment Completion

Before an assessment becomes completed, application or backend logic should verify:

- Required questions are answered
- Question identifiers are valid
- Answer types are valid
- The assessment is still eligible for completion

When successfully completed:

```text
status = completed
completed_at = completion timestamp
```

A completed assessment should not be silently rewritten by a later assessment attempt.

### Assessment History

If a user retakes the assessment:

```text
Assessment Attempt 1
→ completed

Assessment Attempt 2
→ completed
```

both may remain separate historical records.

V1 does not require complex assessment-history presentation.

### AI-Generated Results

If AI contributes to assessment recommendations, the database should not treat arbitrary AI output as trusted structured data without validation.

Where AI-generated text must be stored, it should remain clearly separated from deterministic application-critical values where practical.

AI failures should not corrupt the assessment attempt or its answers.

### Privacy

Assessment storage should follow data-minimization principles.

The schema should avoid collecting unrelated information such as:

- Unnecessary demographic data
- Unrelated personal history
- Sensitive personal information without a clear product requirement

Assessment data should remain focused on supported productivity and focus functionality.

### Recommended Indexes

For `assessments`:

```text
assessments_user_id_idx
assessments_user_created_at_idx
assessments_user_status_idx
```

Conceptually:

```text
INDEX (user_id)

INDEX (user_id, created_at)

INDEX (user_id, status)
```

For `assessment_answers`:

```text
INDEX (assessment_id)

UNIQUE (assessment_id, question_id)
```

These indexes support:

- Assessment history
- Current assessment lookup
- Answer retrieval
- Completion validation

### Assessment Deletion

Deleting an assessment should also remove its dependent answer records where appropriate.

An appropriate relationship may use:

```text
assessment deletion
→ delete assessment_answers belonging to that assessment
```

Unlike historical focus-session relationships, assessment answers have no useful independent meaning without their owning assessment.

### Assessment Table Principles

The assessment schema should:

- Preserve assessment attempts separately
- Preserve assessment versions
- Keep question definitions separate from user answers
- Prevent duplicate answers
- Validate structured results
- Support assessment history
- Protect user ownership
- Minimize unnecessary personal information
- Support AI-assisted functionality without trusting arbitrary AI output
- Remain flexible enough for future assessment improvements

---

## 13. Relationship Summary

---

The Deep Focus V1 database uses clear ownership and optional feature relationships.

The primary relationships are:

```text
users
 ├── focus_sessions
 ├── tasks
 ├── goals
 ├── streaks
 ├── reward_progress
 ├── user_settings
 └── assessments

goals
 └── tasks

tasks
 └── focus_sessions

assessments
 └── assessment_answers

users
 └── user_achievements
```

Where implemented:

```text
users
 └── reward_events
```

### Relationship Cardinality

Conceptually:

```text
User
→ many FocusSessions

User
→ many Tasks

User
→ many Goals

User
→ one Streak

User
→ one RewardProgress

User
→ one UserSettings

User
→ many Assessments

Goal
→ many Tasks

Task
→ many FocusSessions

Assessment
→ many AssessmentAnswers

User
→ many UserAchievements
```

Relationships should preserve user ownership boundaries.

A record owned by one user should never reference another user's private resource unless a future feature explicitly introduces supported shared data.

---

## 14. Foreign Key and Deletion Rules

---

Deletion behavior should protect historical integrity while removing dependent data when that data has no independent meaning.

Recommended behavior includes:

```text
User deleted
→ Account-deletion process handles owned user data

Goal deleted
→ Related tasks remain valid where appropriate
→ tasks.goal_id becomes null

Task deleted
→ Historical focus sessions remain valid
→ focus_sessions.task_id becomes null

Assessment deleted
→ Related assessment answers are deleted

Achievement definition removed
→ Existing user achievement history should be handled carefully
```

### Historical Records

Important historical productivity records should not disappear because an optional related record was removed.

For example:

```text
Task
  ↓
FocusSession
```

If the task is deleted:

```text
FocusSession remains
task_id becomes null
```

This preserves:

- Focus history
- Analytics
- Streak calculations
- Reward verification

### Cascading Deletes

Cascade deletion should be used only where dependent data has no useful meaning without its parent.

A suitable example is:

```text
Assessment
    ↓
AssessmentAnswers
```

If the assessment is deleted, its answers may also be deleted.

Cascade deletion should not be applied broadly to historical productivity data without a clear requirement.

---

## 15. Index Strategy

---

Indexes should support common V1 queries without creating unnecessary write or storage overhead.

Important query patterns include:

- User focus-session history
- Active-session recovery
- Completed-session analytics
- Task filtering
- Goal filtering
- Goal expiration
- Assessment history
- User achievement lookup

### Recommended Index Summary

Conceptually:

```text
users
→ email where required

focus_sessions
→ user_id
→ user_id + created_at
→ user_id + status
→ task_id

tasks
→ user_id
→ user_id + status
→ goal_id
→ user_id + due_at

goals
→ user_id
→ user_id + status
→ user_id + period
→ user_id + ends_at

streaks
→ unique user_id

reward_progress
→ unique user_id

user_settings
→ unique user_id

assessments
→ user_id
→ user_id + created_at
→ user_id + status

assessment_answers
→ assessment_id
→ unique assessment_id + question_id

user_achievements
→ user_id
→ unique user_id + achievement_id
```

Indexes should be reviewed against real application query patterns during implementation.

V1 should avoid speculative indexes that are not required by actual queries.

---

## 16. Data Integrity

---

Database and application logic should work together to protect important invariants.

Examples include:

```text
planned_duration_seconds > 0

focused_duration_seconds >= 0

paused_duration_seconds >= 0

target_value > 0

current_value >= 0

current_streak >= 0

longest_streak >= current_streak

total_xp >= 0
```

The system should also protect lifecycle consistency.

Examples:

```text
Completed FocusSession
→ completed_at exists

Cancelled FocusSession
→ cancelled_at exists

Completed Task
→ completed_at exists

Completed Goal
→ completed_at exists

Completed Assessment
→ completed_at exists
```

Not every business rule needs to become a complex database constraint.

Rules that are easier and safer to maintain in transactional service logic may remain in the backend.

Critical integrity should not rely solely on client-side behavior.

---

## 17. Transactions and Atomic Updates

---

Operations that update multiple related records should use transactional behavior where required.

Important examples may include:

```text
Complete FocusSession
        ↓
Update Session
Update Goal Progress
Update Streak
Process Reward
```

These operations should avoid leaving the database in a partially updated state.

Another example:

```text
Complete Task
      ↓
Update Task
Update Goal Progress
Process Reward
```

Where the selected database supports transactions, critical multi-record operations should use them appropriately.

If a service architecture processes some updates asynchronously, duplicate processing and recovery behavior should remain reliable.

---

## 18. Duplicate Prevention

---

The database should help prevent duplicate records and duplicate side effects.

Important uniqueness rules may include:

```text
One Streak per User

One RewardProgress per User

One UserSettings per User

One Achievement Unlock per User + Achievement

One Assessment Answer per Assessment + Question
```

Where only one active or paused focus session per user is supported, that rule should also be protected through the strongest practical mechanism available.

Reward-producing events should not generate duplicate XP or achievements when requests are retried.

Database uniqueness constraints should be preferred where they provide a simple and reliable protection mechanism.

---

## 19. Analytics Data

---

V1 should avoid creating unnecessary analytics tables when metrics can be calculated efficiently from authoritative records.

Primary analytics sources include:

```text
focus_sessions
tasks
goals
streaks
reward_progress
```

Examples of derived metrics include:

```text
Total Focus Time
Completed Sessions
Average Session Duration
Completed Tasks
Completed Goals
Daily Focus Time
Weekly Focus Time
Current Streak
```

Precomputed analytics tables or materialized summaries may be introduced later if real performance requirements justify them.

They should not be introduced solely for theoretical future scale.

Authoritative historical records should remain the source from which derived analytics can be rebuilt.

---

## 20. Synchronization Support

---

The database should support reliable synchronization between local application state and backend persistence where cloud synchronization is implemented.

Important records should use stable identifiers so the same logical record is not recreated during synchronization.

Synchronization should account for:

- Temporary network loss
- Retried requests
- Duplicate submissions
- Conflicting updates
- Application restarts
- Offline focus sessions

`updated_at` may assist conflict detection but should not automatically determine every conflict-resolution decision.

Historical completed records should generally require stricter modification rules than ordinary preferences.

Synchronization logic should avoid creating duplicate:

- Focus sessions
- Rewards
- Achievements
- Assessment answers

The exact synchronization implementation should follow `ARCHITECTURE.md` and `API_SPEC.md`.

---

## 21. Database Migrations

---

Database schema changes should be managed through controlled migrations.

Migrations may be required when:

- Adding columns
- Adding tables
- Adding constraints
- Adding indexes
- Changing relationships
- Migrating existing data

Migration files should:

- Be version-controlled
- Be reviewable
- Preserve compatible user data
- Avoid unnecessary destructive operations
- Be tested before production deployment

Existing production migrations should not normally be rewritten after they have been applied.

New changes should use new migration files.

### Data Migration

When a new required field is introduced, the migration should define how existing records receive a valid value.

Possible approaches include:

- Safe defaults
- Derived values
- Temporary nullability followed by backfilling

Schema changes should not assume that every existing record already contains newly introduced data.

---

## 22. Backup and Recovery

---

Production database infrastructure should support appropriate backup and recovery mechanisms.

Backup strategy depends on the selected database provider and deployment architecture.

Important user data may include:

- Focus-session history
- Tasks
- Goals
- Assessments
- Settings
- Reward progression

Recovery procedures should prioritize data integrity and avoid restoring inconsistent partial state where practical.

V1 application code should not attempt to build a custom database backup system when the selected managed database platform already provides reliable backup capabilities.

---

## 23. Security and Privacy

---

Database access should occur through trusted application infrastructure.

The mobile client should not receive unrestricted database credentials.

Database security should enforce:

- Authentication
- User ownership
- Authorization
- Least-privilege access
- Protected credentials
- Safe administrative access

Sensitive credentials should never be stored in:

- Mobile application source code
- Public repositories
- Client-visible configuration
- Documentation examples containing real secrets

The database should collect and retain only information required by supported Deep Focus functionality.

Detailed security requirements should be defined in `SECURITY.md`.

---

## 24. V1 Schema Summary

---

The primary Deep Focus V1 schema consists of:

```text
users
focus_sessions
tasks
goals
streaks
reward_progress
user_settings
assessments
```

Supporting tables may include:

```text
assessment_answers
user_achievements
```

A supporting table such as:

```text
reward_events
```

may be introduced when durable reward-event deduplication is required by the implementation.

The schema can be summarized conceptually as:

```text
users
 │
 ├── focus_sessions
 │       ↑
 │       │
 │     tasks
 │       ↑
 │       │
 │     goals
 │
 ├── streaks
 │
 ├── reward_progress
 │
 ├── user_achievements
 │
 ├── user_settings
 │
 └── assessments
          │
          └── assessment_answers
```

The database should keep authoritative productivity history separate from derived summaries.

---

# Conclusion

---

This Database Schema defines the persistent data structure required for Deep Focus V1.

The schema should prioritize:

- Data integrity
- Reliable focus-session history
- Clear user ownership
- Predictable relationships
- Historical preservation
- Duplicate prevention
- Efficient V1 queries
- Safe synchronization
- Controlled migrations
- Security and privacy
- Maintainable implementation

The schema should remain intentionally focused on the first usable version of Deep Focus.

Logical entities and their responsibilities are defined in `DATA_MODEL.md`.

Client and backend communication is defined in `API_SPEC.md`.

Authentication, authorization, data protection, credentials, privacy, and other security requirements should be defined in `SECURITY.md`.

Additional tables, indexes, and infrastructure should be introduced only when they solve a concrete implementation requirement.

---

## 25. V1 AI Usage Tables

The approved five-action introduction and rewarded-unlock behavior require
server-authoritative usage records.

### Task and Reminder Schema Extensions

Add nullable `parent_task_id` to `tasks` when `Break Down This Task` is enabled.

```text
tasks.parent_task_id
        ↓
tasks.id
```

Required rules include:

- parent and child ownership must match;
- `parent_task_id != id`;
- application and trusted-service validation must prevent cycles;
- deleting a parent uses `ON DELETE SET NULL` so child tasks remain available.

Add the lightweight `task_reminders` table:

| Column | Type | Null | Responsibility |
| --- | --- | --- | --- |
| `id` | UUID | No | Stable reminder identifier |
| `user_id` | UUID | No | Authenticated owner |
| `task_id` | UUID | No | Related user-owned task |
| `scheduled_for` | TIMESTAMP | No | Timezone-aware reminder time |
| `source` | ENUM/TEXT | No | `manual` or `plan_my_day` |
| `status` | ENUM/TEXT | No | `scheduled` or `cancelled` |
| `created_at` | TIMESTAMP | No | Creation time |
| `updated_at` | TIMESTAMP | No | Last update time |

Required rules include:

- same-user ownership for reminder and task;
- unique logical reminder protection, such as `(user_id, task_id,
  scheduled_for)` where compatible with the final lifecycle rules;
- `ON DELETE CASCADE` or equivalent trusted cleanup for future reminders when a
  task is deleted;
- an index on `(user_id, status, scheduled_for)` for upcoming reminder queries.

### Table: `ai_action_grants`

| Column | Type | Null | Responsibility |
| --- | --- | --- | --- |
| `id` | UUID | No | Stable grant identifier |
| `user_id` | UUID | No | Owner derived from authenticated identity |
| `source` | ENUM/TEXT | No | `introductory`, `rewarded_ad`, or approved adjustment |
| `granted_actions` | INTEGER | No | Positive number of actions granted |
| `consumed_actions` | INTEGER | No | Number consumed from this grant |
| `verification_reference_hash` | TEXT | Yes | Non-reversible replay-protection reference for verified grants |
| `expires_at` | TIMESTAMP | Yes | Optional server-configured expiration |
| `created_at` | TIMESTAMP | No | Creation time |
| `updated_at` | TIMESTAMP | No | Last trusted update time |

Required constraints include:

- `granted_actions > 0`;
- `consumed_actions >= 0`;
- `consumed_actions <= granted_actions`;
- one introductory grant per user;
- unique non-null rewarded verification reference hash;
- foreign key ownership to `users` with approved account-deletion behavior.

Recommended indexes include:

- `(user_id, expires_at)` for available-grant lookup;
- `(user_id, source)` for entitlement management;
- unique partial index for introductory source per user where supported;
- unique partial index for non-null `verification_reference_hash` where supported.

### Table: `ai_action_requests`

| Column | Type | Null | Responsibility |
| --- | --- | --- | --- |
| `id` | UUID | No | Stable request identifier |
| `user_id` | UUID | No | Authenticated owner |
| `action_type` | ENUM/TEXT | No | Approved V1 AI action type |
| `status` | ENUM/TEXT | No | `pending`, `completed`, `failed`, or `cancelled` |
| `grant_id` | UUID | Yes | Grant consumed by a successful request |
| `idempotency_key` | TEXT | Yes | Duplicate-request protection |
| `created_at` | TIMESTAMP | No | Request creation time |
| `completed_at` | TIMESTAMP | Yes | Terminal completion time |

Required constraints include:

- supported action and status values only;
- unique `(user_id, idempotency_key)` when a key is present;
- a completed request consumes no more than one action;
- full prompts and AI responses are not stored in these usage tables;
- grant consumption and completed-request transition occur atomically.

Recommended indexes include:

- `(user_id, created_at DESC)`;
- `(user_id, action_type, created_at DESC)`;
- `(grant_id)`;
- `(status, created_at)` for safe recovery of interrupted requests where required.

### Proposal Storage

Persisting full AI proposals is not required by default. If secure confirmation or
retry requires server-side proposal state, use a short-lived store containing only
the validated structured actions and minimum ownership metadata. Do not add a
long-term prompt/response archive without a separately approved privacy and
retention requirement.

### Deletion and Retention

AI usage metadata should follow approved account-deletion and retention rules.
Provider verification secrets or raw tokens should not be retained in these
tables. Any retained hash or reference must exist only for entitlement integrity,
fraud prevention, and replay protection.

---
