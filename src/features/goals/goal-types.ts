export type GoalType = 'focus_time' | 'session_count';
export type GoalPeriod = 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export type Goal = {
  id: string;
  title: string;
  type: GoalType;
  period: GoalPeriod;
  status: GoalStatus;
  targetValue: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
