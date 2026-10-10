/** Server-only canonical hash for idempotent gateway mutation receipts. */

const HEX = /^[a-f0-9]{64}$/;

function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!value || typeof value !== 'object') throw new Error('MUTATION_UNHASHABLE');
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
