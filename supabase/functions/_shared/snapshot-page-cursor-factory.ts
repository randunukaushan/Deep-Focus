/** Binds materialization pages to server-signed opaque cursors. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { signSnapshotPageCursor } from './snapshot-page-cursor.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createSnapshotPageCursorFactory(input: {
  ownerId: string;
  snapshotId: string;
  expiresAt: string;
  secret: string;
}): (pageIndex: number, pageCount: number) => Promise<string | null> {
  if (!UUID.test(input.ownerId) || !UUID.test(input.snapshotId)
    || !Number.isFinite(Date.parse(input.expiresAt)) || typeof input.secret !== 'string' || input.secret.length < 32) {
    throw new Error('SNAPSHOT_CURSOR_FACTORY_INVALID');
  }
  return async (pageIndex, pageCount) => {
    if (!Number.isInteger(pageIndex) || pageIndex < 0 || !Number.isInteger(pageCount)
      || pageCount < 1 || pageIndex >= pageCount) throw new Error('SNAPSHOT_CURSOR_FACTORY_INVALID');
    if (pageIndex === pageCount - 1) return null;
    return signSnapshotPageCursor({
      version: 1,
      ownerId: input.ownerId,
      endpoint: 'snapshot-pages',
      snapshotId: input.snapshotId,
      pageIndex: pageIndex + 1,
      pageCount,
      expiresAt: input.expiresAt,
    }, input.secret);
  };
}
