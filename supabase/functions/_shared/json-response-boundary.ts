/** Shared fail-closed boundary for bounded server JSON response objects. */

export const MAX_JSON_RESPONSE_BYTES = 262144;

function isPlainJsonValue(value: unknown, active: WeakSet<object>): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  if (active.has(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null && !Array.isArray(value)) return false;
  active.add(value);
  try {
    if (Array.isArray(value)) {
      const keys = Object.keys(value);
      return Object.getOwnPropertySymbols(value).length === 0
        && keys.length === value.length
        && keys.every((key) => /^(?:0|[1-9][0-9]*)$/.test(key) && Number(key) < value.length)
        && value.every((item) => isPlainJsonValue(item, active));
    }
    const object = value as Record<string, unknown>;
    return Object.getOwnPropertySymbols(object).length === 0
      && Object.keys(object).every((key) => isPlainJsonValue(object[key], active));
  } finally {
    active.delete(value);
  }
}

/** Validates JSON shape without applying the larger response-size limit. */
export function isPlainJsonValueForBoundary(value: unknown): boolean {
  return isPlainJsonValue(value, new WeakSet<object>());
}

export function stringifyBoundedJsonResponse(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || !isPlainJsonValue(value, new WeakSet<object>())) return null;
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== 'string'
      || new TextEncoder().encode(serialized).byteLength > MAX_JSON_RESPONSE_BYTES) return null;
    return serialized;
  } catch {
    return null;
  }
}

export function isBoundedJsonResponse(value: unknown): value is Record<string, unknown> {
  return stringifyBoundedJsonResponse(value) !== null;
}
