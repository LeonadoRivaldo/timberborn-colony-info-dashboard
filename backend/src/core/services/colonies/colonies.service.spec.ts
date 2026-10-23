import { describe, expect, it, vi } from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';
import { ColoniesService } from './colonies.service.js';
import { AdptersService } from '../adapters/adapters.service.js';
import { LeversService } from '../levers/levers.service.js';

describe('Colony automation scope', () => {
  it('blocks writes before discovery and switches collection paths when the colony changes', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const collection = vi.fn().mockReturnValue({
      withConverter: () => ({ doc: () => ({ set }) }),
    });
    const firestore = { collection } as unknown as Firestore;
    const colonies = new ColoniesService(firestore);
    const adapters = new AdptersService(firestore, colonies.requireActiveId);
    const levers = new LeversService(firestore, colonies.requireActiveId);

    await expect(adapters.write('pump', { name: 'pump', state: true })).rejects.toMatchObject({ statusCode: 503 });
    expect(collection).not.toHaveBeenCalled();

    colonies.activate('first');
    await adapters.write('pump', { name: 'pump', state: true });
    expect(collection).toHaveBeenLastCalledWith('colonies/first/adapters');
    expect(levers.collectionPath).toBe('colonies/first/levers');

    colonies.activate('second');
    await adapters.write('pump', { name: 'pump', state: false });
    expect(collection).toHaveBeenLastCalledWith('colonies/second/adapters');
    expect(levers.collectionPath).toBe('colonies/second/levers');

    colonies.deactivate();
    expect(() => levers.collectionPath).toThrow('indisponivel');
  });
});