import type { GoalPeriod } from './goal-types';

type CalendarDate = { year: number; month: number; day: number };
type ZonedParts = CalendarDate & { hour: number; minute: number; second: number };

function formatter(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
  } catch {
    throw new RangeError('INVALID_TIME_ZONE: expected a supported IANA timezone');
  }
}

function partsAt(instant: number, timeZone: string): ZonedParts {
  const parts = formatter(timeZone).formatToParts(instant);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(value.year), month: Number(value.month), day: Number(value.day),
    hour: Number(value.hour), minute: Number(value.minute), second: Number(value.second),
  };
}

function sameDate(left: CalendarDate, right: CalendarDate) {
  return left.year === right.year && left.month === right.month && left.day === right.day;
}

function startOfLocalDate(date: CalendarDate, timeZone: string): number {
  const desiredUtc = Date.UTC(date.year, date.month - 1, date.day);
  let candidate = desiredUtc;
  for (let attempt = 0; attempt < 5; attempt++) {
    const local = partsAt(candidate, timeZone);
    const representedAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
    const next = desiredUtc - (representedAsUtc - candidate);
    if (next === candidate) break;
    candidate = next;
  }

  const exact = partsAt(candidate, timeZone);
  if (sameDate(exact, date) && exact.hour === 0 && exact.minute === 0 && exact.second === 0) return candidate;

  // A few IANA zones move their clocks at midnight. Use the first real minute
  // of that local date; never shift to a different calendar date silently.
  const earliest = candidate - 3 * 60 * 60 * 1000;
  for (let instant = earliest; instant <= candidate + 3 * 60 * 60 * 1000; instant += 60_000) {
    if (sameDate(partsAt(instant, timeZone), date)) return instant;
  }
  throw new RangeError('INVALID_TIME_ZONE_BOUNDARY: could not resolve local calendar start');
}

function periodStart(date: CalendarDate, period: GoalPeriod): CalendarDate {
  if (period === 'monthly') return { year: date.year, month: date.month, day: 1 };
  const dayOfWeek = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  const mondayOffset = (dayOfWeek + 6) % 7;
  const monday = new Date(Date.UTC(date.year, date.month - 1, date.day - mondayOffset));
  return { year: monday.getUTCFullYear(), month: monday.getUTCMonth() + 1, day: monday.getUTCDate() };
}

function nextPeriodStart(date: CalendarDate, period: GoalPeriod): CalendarDate {
  if (period === 'monthly') {
    const nextMonth = new Date(Date.UTC(date.year, date.month, 1));
    return { year: nextMonth.getUTCFullYear(), month: nextMonth.getUTCMonth() + 1, day: 1 };
  }
  const nextWeek = new Date(Date.UTC(date.year, date.month - 1, date.day + 7));
  return { year: nextWeek.getUTCFullYear(), month: nextWeek.getUTCMonth() + 1, day: nextWeek.getUTCDate() };
}

export function getDeviceTimeZone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timeZone) throw new RangeError('TIME_ZONE_UNAVAILABLE: choose a supported timezone before creating a goal');
  formatter(timeZone);
  return timeZone;
}

/** Builds stable UTC boundaries from local calendar periods (Monday-start weeks). */
export function getGoalPeriodRange(period: GoalPeriod, now = Date.now(), timeZone = getDeviceTimeZone()) {
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) {
    throw new RangeError('INVALID_TIME: expected a valid period reference instant');
  }
  const current = partsAt(now, timeZone);
  const start = periodStart(current, period);
  const end = nextPeriodStart(start, period);
  const startsAt = startOfLocalDate(start, timeZone);
  const endsAt = startOfLocalDate(end, timeZone);
  if (startsAt >= endsAt) throw new RangeError('INVALID_TIME_ZONE_BOUNDARY: period end must follow its start');
  return { startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), periodTimeZone: timeZone };
}
