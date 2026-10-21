# Progression Rules — V1

## Authority and version

This is the canonical V1 contract for XP, levels, achievements and reward
history. It records the owner-approved rules dated 2026-10-15. It supersedes
older draft wording that left XP amounts, level thresholds or the achievement
catalogue undecided. It does not waive the separate security, device, backend or
independent-review gates in `SECURITY.md` and `TESTING_STRATEGY.md`.

`rules_version` is `v1`. A future rule change must use a new version and must
not silently reprice already recorded ledger events.

## Trusted inputs and eligibility

Only an authoritative, owner-scoped, persisted terminal focus-session record can
enter progression processing. The stable source operation key is
`terminal:<sessionId>` and the consumer is `rewards:v1`.

An XP award is eligible only when the source session:

- has a non-empty stable ID and belongs to the processing owner;
- is terminal with status `completed`;
- has a finite, non-negative integer focused duration in seconds; and
- satisfies the existing focus-session integrity constraints.

Cancelled sessions award zero XP and do not count toward completed-session or
completed-focus-minute achievements. Their separately approved contribution to a
`focus_time` goal is unchanged. A completed session shorter than sixty seconds
can award zero XP but still counts toward completed-session achievements.

Tasks, goals, streak advancement, achievement unlocks, opening the application
and UI taps award zero XP. AI output cannot grant or modify progression.

## XP and levels

```ts
export const XP_RULES_V1 = {
  version: 'v1',
  xpPerWholeFocusedMinute: 1,
  xpPerTaskCompletion: 0,
  xpPerGoalCompletion: 0,
  xpPerStreakMilestone: 0,
  xpPerAchievementUnlock: 0,
  xpPerLevel: 500,
  dailyProductCap: null,
} as const;

xpEarned = Math.floor(focusedDurationSeconds / 60);
level = 1 + Math.floor(totalXp / 500);
xpIntoLevel = totalXp % 500;
xpToNextLevel = 500 - xpIntoLevel;
```

XP is non-negative, has no decay, expiry, multiplier, daily product cap,
leaderboard, ranking, random reward or missed-work penalty. Level is a derived
display value from persisted total XP; UI components must not define another
formula.

## Achievement catalogue

Each ID is permanent and may unlock once per owner:

| ID | Verified condition |
| --- | --- |
| `first_focus_session` | At least one completed focus session |
| `focus_sessions_5` | At least five completed focus sessions |
| `focus_minutes_60` | At least 3,600 cumulative completed focus seconds |
| `focus_sessions_25` | At least 25 completed focus sessions |
| `focus_minutes_600` | At least 36,000 cumulative completed focus seconds |
| `streak_3_days` | Canonical longest streak is at least three days |
| `streak_7_days` | Canonical longest streak is at least seven days |
| `first_goal_completed` | At least one persisted, verified completed goal |

Completed-focus-minute criteria use summed authoritative seconds, never a sum of
individually floored XP. Streak criteria reuse the existing deterministic
user-local-day streak engine. Goal completion is read from persisted goal state;
reopening, retrying or repeatedly tapping a goal cannot create another unlock.

## Durable model and atomicity

The local and future cloud model use these owner-scoped entities:

- `reward_progress`: one summary row per owner (`total_xp`, `rules_version`,
  revision and timestamps); level remains derivable from `total_xp`.
- `progression_events`: the immutable operation ledger, unique on
  `(user_id, consumer, source_operation_key)`, with source identity, XP delta,
  rules version and timestamps.
- `user_achievements`: one durable unlock row per `(user_id, achievement_id)`,
  with unlock time, optional source operation, rule version and backfill marker.

Where transactions are available, inserting the event, applying XP, updating the
summary and inserting newly qualified achievement rows happen in one transaction.
An existing operation returns its persisted result without applying XP again.
`ON CONFLICT DO NOTHING` must never be followed by an unconditional summary
increment. A write failure reports failure; no UI may claim a persisted award
before the transaction commits.

## Offline, retry and reconciliation

SQLite is the authoritative offline continuity layer for its active owner
namespace. Retrying a terminal operation is safe because the operation key is
unique. Interrupted work before commit is retried; work after commit is read
back without a second grant. Account namespaces remain isolated.

When cloud synchronization is enabled, the server must verify owner and terminal
state and recompute eligibility from the persisted session; it must not trust
client-supplied XP, total XP, level or achievement claims. Remote retry uses the
same consumer and source-operation key. Live Supabase/RLS proof remains a
separate review and integration requirement.

The local-only migration candidate
`supabase/migrations/20261016041647_reward_progression_v1.sql` mirrors the V1
owner-bound summary, ledger and achievement entities. It creates no client
grants, has not been applied to a remote project, and does not itself install a
trusted reward-processing gateway. Its remote execution, server transaction,
RLS/Auth and reconciliation evidence remain `REVIEW_PENDING`.

## Historical migration and backfill

Backfill is owner-scoped, deterministic and rerunnable. It creates the same
`rewards:v1` event for each eligible historical completed session only when that
operation is absent. Cancelled and unknown-owner records are excluded. Historical
achievement rows use `backfill_marker = 1` and are not new-unlock celebrations.

Existing reward totals and unlocks must be inspected before migration. If their
relationship to historical sessions cannot be reconciled without double-awarding
or overwriting valid data, that migration path is blocked pending an explicit
owner decision; totals are never reset silently.

## UX, privacy and non-goals

Progression feedback is calm, accessible and optional in emphasis. Session
Summary can display only the persisted XP result, actual level change and newly
persisted (non-backfill) unlocks. Do not celebrate `+0 XP`. Analytics and Home
are consumers of the durable state; Home remains focused on Today → Focus → Done.

There are no cash rewards, gambling, focus betting, public rankings, pressure
messaging, XP penalties, AI-controlled rewards or real-money incentives in V1.
