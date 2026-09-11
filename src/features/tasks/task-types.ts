export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
