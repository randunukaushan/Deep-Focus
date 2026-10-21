import type { FocusSession } from '@/features/focus/session-types';

export type StreakSummary = {
  currentStreakDays: number;
  longestStreakDays: number;
  qualifyingDates: string[];
  lastQualifyingDate: string | null;
};

function localDateKey(timestamp: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function previousDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Derives streaks from durable terminal sessions. Completed sessions qualify;
 * cancelled sessions do not, and a local calendar date is counted once.
 */
export function calculateStreak(
  sessions: FocusSession[],
  options: { now: number; timeZone: string },
): StreakSummary {
  if (!Number.isFinite(options.now) || !Number.isFinite(new Date(options.now).getTime())) {
    throw new RangeError('INVALID_TIME: streak reference instant is invalid');
  }
  const unique = new Map<string, FocusSession>();
  for (const session of sessions) {
    const previous = unique.get(session.id);
    if (previous && canonicalJson(previous) !== canonicalJson(session)) {
      throw new RangeError('CONFLICTING_SESSION_ID: streak has conflicting duplicate records');
    }
    unique.set(session.id, session);
  }
  const dates = new Set<string>();
  for (const session of unique.values()) {
    if (session.status !== 'completed' || !session.completedAt) continue;
    const instant = Date.parse(session.completedAt);
    if (!Number.isFinite(instant)) throw new RangeError('INVALID_SESSION: completion timestamp is invalid');
    if (instant > options.now) continue;
    dates.add(localDateKey(session.completedAt, options.timeZone));
  }
  const qualifyingDates = [...dates].sort();
  if (qualifyingDates.length === 0) return { currentStreakDays: 0, longestStreakDays: 0, qualifyingDates, lastQualifyingDate: null };

  let longestStreakDays = 1;
  let run = 1;
  for (let index = 1; index < qualifyingDates.length; index += 1) {
    run = previousDate(qualifyingDates[index]) === qualifyingDates[index - 1] ? run + 1 : 1;
    longestStreakDays = Math.max(longestStreakDays, run);
  }

  const today = localDateKey(new Date(options.now).toISOString(), options.timeZone);
  const currentAnchor = dates.has(today) ? today : dates.has(previousDate(today)) ? previousDate(today) : null;
  let currentStreakDays = 0;
  if (currentAnchor) {
    let cursor = currentAnchor;
    while (dates.has(cursor)) {
      currentStreakDays += 1;
      cursor = previousDate(cursor);
    }
  }
  return { currentStreakDays, longestStreakDays, qualifyingDates, lastQualifyingDate: qualifyingDates.at(-1) ?? null };
}
