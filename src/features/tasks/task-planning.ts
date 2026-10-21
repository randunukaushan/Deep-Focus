import type { Task } from './task-types';

export type PlanPeriod = 'today' | 'upcoming';

export function isPlanningDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function validTaskPlanning(task: { plannedDate?: unknown; estimatedMinutes?: unknown }): boolean {
  return (task.plannedDate === undefined || isPlanningDate(task.plannedDate))
    && (task.estimatedMinutes === undefined || (typeof task.estimatedMinutes === 'number'
      && Number.isSafeInteger(task.estimatedMinutes) && task.estimatedMinutes >= 1 && task.estimatedMinutes <= 480));
}

export function localPlanningDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function nextPlanningDate(today: string): string {
  if (!isPlanningDate(today)) throw new RangeError('INVALID_PLAN_DATE');
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function summarizeTaskPlan(tasks: Task[], period: PlanPeriod, today: string) {
  if (!isPlanningDate(today)) throw new RangeError('INVALID_PLAN_DATE');
  const visible = tasks.filter(task => !task.archivedAt && task.status !== 'cancelled'
    && (period === 'upcoming' ? Boolean(task.plannedDate && task.plannedDate > today) : !task.plannedDate || task.plannedDate <= today));
  const pending = visible.filter(task => task.status !== 'completed');
  return {
    tasks: visible,
    pendingCount: pending.length,
    completedCount: visible.length - pending.length,
    estimatedMinutes: pending.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0),
    unestimatedCount: pending.filter(task => task.estimatedMinutes === undefined).length,
  };
}
