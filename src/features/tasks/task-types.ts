export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  goalId?: string;
  dueAt?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
};
