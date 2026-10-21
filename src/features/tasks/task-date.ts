export type TaskDueDateParseResult =
  | { valid: true; dueAt?: string | null }
  | { valid: false };

/** Keep calendar deadlines stable between devices by storing date-only input at UTC midnight. */
export function parseTaskDueDate(input: string, existingDueAt?: string): TaskDueDateParseResult {
  const value = input.trim();
  if (existingDueAt && value === existingDueAt.slice(0, 10)) return { valid: true };
  if (!value) return { valid: true, ...(existingDueAt ? { dueAt: null } : {}) };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { valid: false };
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return { valid: false };
  return { valid: true, dueAt: date.toISOString() };
}

export function formatTaskDueDate(dueAt: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(dueAt));
}
