// @ts-expect-error The mobile bundler and test runtime resolve source TypeScript modules directly.
import { installSnapshotMirror, type SnapshotEntity, type SnapshotPage } from './snapshot-mirror.ts';

export type SnapshotApplyStore = {
  /** Must replace only the remote mirror inside one transaction. */
  applySnapshotAtomically: (input: {
    ownerId: string;
    snapshotId: string;
    highWater: string;
    resumeCursor: string;
    entities: SnapshotEntity[];
    preserveOutbox: true;
    preserveLocalOverlay: true;
  }) => Promise<void>;
};

/**
 * Validates a complete snapshot, then hands one explicit transaction request
 * to the store. This helper never deletes local pending work itself.
 */
export async function applyValidatedSnapshotAtomically(input: {
  ownerId: string;
  snapshotId: string;
  highWater: string;
  pages: unknown;
  resumeCursor: string;
  digestPage: (page: SnapshotPage) => Promise<string>;
  store: SnapshotApplyStore;
}): Promise<{ installedPages: number; entityCount: number; highWater: string }> {
  return installSnapshotMirror({
    ...input,
    store: {
      installStagedSnapshot: async (validated) => {
        await input.store.applySnapshotAtomically({
          ownerId: validated.ownerId,
          snapshotId: validated.snapshotId,
          highWater: validated.highWater,
          resumeCursor: validated.resumeCursor,
          entities: validated.pages.flatMap((page) => page.data),
          preserveOutbox: true,
          preserveLocalOverlay: true,
        });
      },
    },
  });
}
