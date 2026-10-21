export type GoalType = 'focus_time' | 'session_count';
export type GoalPeriod = 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export type Goal = {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  period: GoalPeriod;
  status: GoalStatus;
  /** Integer seconds for focus_time; integer count for session_count. */
  targetValue: number;
  startsAt: string;
  endsAt: string | null;
  periodTimeZone: string | null;
  /** Only for source JSON goals whose prior interval had no period end. */
  legacyOpenPeriod?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
