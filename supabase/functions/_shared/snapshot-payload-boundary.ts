/** Shared snapshot-page payload bound for materialization, storage and reads. */

export const MAX_SNAPSHOT_PAGE_PAYLOAD_BYTES = 262144;

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
      for (let index = 0; index < value.length; index += 1) {
        if (!isPlainJsonValue(value[index], active)) return false;
      }
      return Object.getOwnPropertySymbols(value).length === 0;
    }
    const object = value as Record<string, unknown>;
    if (Object.getOwnPropertySymbols(object).length > 0) return false;
    return Object.keys(object).every((key) => isPlainJsonValue(object[key], active));
  } finally {
    active.delete(value);
  }
}

export function boundedSnapshotPagePayloadJson(value: unknown): string | null {
  try {
    if (!isPlainJsonValue(value, new WeakSet<object>())) return null;
    const json = JSON.stringify(value);
    if (typeof json !== 'string') return null;
    return new TextEncoder().encode(json).byteLength <= MAX_SNAPSHOT_PAGE_PAYLOAD_BYTES ? json : null;
  } catch {
    return null;
  }
}
