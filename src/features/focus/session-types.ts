export type FocusSessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type FocusSession = {
  id: string;
  status: FocusSessionStatus;
  taskName?: string;
  plannedDurationSeconds: number;
  focusedDurationSeconds: number;
  pausedDurationSeconds: number;
  createdAt: string;
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  lastPausedAt?: string;
  lastResumedAt?: string;
};

export type SessionProjection = {
  focusedSeconds: number;
  pausedSeconds: number;
  remainingSeconds: number;
  progress: number;
};
