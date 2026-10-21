export type SavedPlanItem = {
  taskId: string;
  position: number;
  focusDurationSeconds: number;
  breakDurationSeconds: number;
};

export type SavedPlan = {
  id: string;
  provider: 'mock';
  model: string;
  createdAt: string;
  confirmedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  items: SavedPlanItem[];
};
