/** Validates the EX-18 projection envelope without inventing reward policy. */

const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export type RewardProjectionStatus = 'current' | 'pending' | 'stale' | 'unavailable';

export type RewardSummary = {
  totalXp: number;
  level: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastQualifyingDate: string | null;
  timeZone: string;
  achievementCount: number;
};

export type RewardProjection = {
  meta: {
    status: RewardProjectionStatus;
    asOf: string | null;
    sourceSequence: string | null;
    ruleVersion: string | null;
  };
  summary: RewardSummary | null;
};

function invalid(message: string): never {
  throw new RangeError(`INVALID_REWARD_PROJECTION: ${message}`);
}

function safeCount(value: unknown, field: string, minimum = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) invalid(`${field} must be a safe nonnegative integer`);
  return value as number;
}

function validInstant(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 100 && Number.isFinite(Date.parse(value));
}

function validTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 100) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(); return true; } catch { return false; }
}

function validDateOnly(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === value;
}

function validateMeta(value: unknown): RewardProjection['meta'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('meta must be an object');
  const meta = value as Record<string, unknown>;
  const status = meta.status;
  if (!['current', 'pending', 'stale', 'unavailable'].includes(String(status))) invalid('meta status is unsupported');
  if (status === 'unavailable') {
    if (meta.asOf !== null || meta.sourceSequence !== null || meta.ruleVersion !== null) invalid('unavailable meta must not claim freshness or policy');
    return { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null };
  }
  if (!validInstant(meta.asOf) || typeof meta.sourceSequence !== 'string' || !DECIMAL.test(meta.sourceSequence)
    || typeof meta.ruleVersion !== 'string' || meta.ruleVersion.length < 1 || meta.ruleVersion.length > 100 || !/\S/.test(meta.ruleVersion)) invalid('available meta is malformed');
  return { status: status as Exclude<RewardProjectionStatus, 'unavailable'>, asOf: meta.asOf, sourceSequence: meta.sourceSequence, ruleVersion: meta.ruleVersion };
}

function validateSummary(value: unknown): RewardSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('summary must be an object when available');
  const summary = value as Record<string, unknown>;
  const totalXp = safeCount(summary.totalXp, 'totalXp');
  const level = safeCount(summary.level, 'level', 1);
  const currentStreakDays = safeCount(summary.currentStreakDays, 'currentStreakDays');
  const longestStreakDays = safeCount(summary.longestStreakDays, 'longestStreakDays');
  if (currentStreakDays > longestStreakDays) invalid('current streak cannot exceed longest streak');
  if (!validDateOnly(summary.lastQualifyingDate)) invalid('lastQualifyingDate must be a valid calendar date or null');
  if (!validTimeZone(summary.timeZone)) invalid('timeZone must be a valid IANA timezone');
  const achievementCount = safeCount(summary.achievementCount, 'achievementCount');
  return { totalXp, level, currentStreakDays, longestStreakDays, lastQualifyingDate: summary.lastQualifyingDate, timeZone: summary.timeZone, achievementCount };
}

export function validateRewardProjection(value: unknown): RewardProjection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('projection must be an object');
  const projection = value as Record<string, unknown>;
  const meta = validateMeta(projection.meta);
  if (meta.status === 'unavailable') {
    if (projection.summary !== null) invalid('unavailable projection must have a null summary');
    return { meta, summary: null };
  }
  return { meta, summary: validateSummary(projection.summary) };
}
