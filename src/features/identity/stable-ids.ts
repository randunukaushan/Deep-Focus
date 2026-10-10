/**
 * Creates an opaque UUID-shaped identifier for new locally-created records.
 * Existing legacy IDs remain readable and are never rewritten by this helper.
 */
export function createStableId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;
  if (typeof randomUuid === 'function') return randomUuid.call(globalThis.crypto);

  const time = Date.now().toString(16).padStart(12, '0').slice(-12);
  const random = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${time.slice(0, 8)}-${time.slice(8)}-4${random().slice(1)}-8${random().slice(1)}-${random()}${random()}${random()}`;
}
