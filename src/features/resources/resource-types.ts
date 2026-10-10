export type LocalResourceKind = 'reference' | 'external_link';
export type LocalResourceLifecycle = 'active' | 'missing';

export type LocalResource = {
  id: string;
  kind: LocalResourceKind;
  title: string;
  reference: string;
  revision: number;
  lifecycle: LocalResourceLifecycle;
  createdAt: string;
  updatedAt: string;
};

export type TaskResourceLink = {
  taskId: string;
  resourceId: string;
  resourceRevision: number;
  workSlice?: string;
  position: number;
};

const MAX_TITLE = 120;
const MAX_REFERENCE = 4_096;
const MAX_WORK_SLICE = 500;

function cleanText(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string') throw new RangeError(`INVALID_RESOURCE: ${label} must be text`);
  const result = value.trim();
  if (!result || result.length > max || /[\u0000-\u001f\u007f]/.test(result)) {
    throw new RangeError(`INVALID_RESOURCE: ${label} is invalid`);
  }
  return result;
}

export function validateResourceInput(input: { kind: LocalResourceKind; title: string; reference: string }): Pick<LocalResource, 'kind' | 'title' | 'reference'> {
  if (!input || (input.kind !== 'reference' && input.kind !== 'external_link')) throw new RangeError('INVALID_RESOURCE: unsupported kind');
  const title = cleanText(input.title, 'title', MAX_TITLE);
  const reference = cleanText(input.reference, 'reference', MAX_REFERENCE);
  if (input.kind === 'external_link') {
    let url: URL;
    try { url = new URL(reference); } catch { throw new RangeError('INVALID_RESOURCE: link must be a valid HTTPS URL'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.href.length > MAX_REFERENCE) {
      throw new RangeError('INVALID_RESOURCE: link must be a valid HTTPS URL without credentials');
    }
  }
  return { kind: input.kind, title, reference };
}

export function validateResourceId(id: unknown): string {
  return cleanText(id, 'id', 128);
}

export function validateWorkSlice(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return cleanText(value, 'work slice', MAX_WORK_SLICE);
}

export function validateResourceRevision(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) throw new RangeError('INVALID_RESOURCE: revision must be positive');
  return value as number;
}

export function validateLinkPosition(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new RangeError('INVALID_RESOURCE: position must be non-negative');
  return value as number;
}
