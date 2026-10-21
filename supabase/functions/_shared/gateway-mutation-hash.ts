/** Server-only canonical hash for idempotent gateway mutation receipts. */

const HEX = /^[a-f0-9]{64}$/;

function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('MUTATION_UNHASHABLE');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (Object.getOwnPropertySymbols(value).length > 0
      || keys.length !== value.length
      || keys.some((key) => !/^(?:0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new Error('MUTATION_UNHASHABLE');
    return `[${value.map(canonical).join(',')}]`;
  }
  if (!value || typeof value !== 'object') throw new Error('MUTATION_UNHASHABLE');
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error('MUTATION_UNHASHABLE');
  if (Object.getOwnPropertySymbols(value).length > 0) throw new Error('MUTATION_UNHASHABLE');
  return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}

export async function hashGatewayMutation(input: { operation: string; path: string; body: Record<string, unknown> | null }): Promise<string> {
  if (!/^[a-z][A-Za-z0-9.]{0,79}$/.test(input.operation) || !/^\/v1\//.test(input.path)) throw new Error('MUTATION_INPUT_INVALID');
  const bytes = new TextEncoder().encode(canonical({ operation: input.operation, path: input.path, body: input.body }));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const result = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!HEX.test(result)) throw new Error('MUTATION_HASH_INVALID');
  return result;
}
