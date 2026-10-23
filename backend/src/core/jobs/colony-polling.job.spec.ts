import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';
import { ColoniesService } from '../services/colonies/colonies.service.js';
import { ColonyPollingJob } from './colony-polling.job.js';

function setup() {
  vi.useFakeTimers();
  const colonies = new ColoniesService({} as Firestore);
  const write = vi.spyOn(colonies, 'write').mockResolvedValue();
  const snapshot = (id: string) => ({
    timestamp: '2026-10-23T00:00:00Z',
    colonyInfo: { settlementId: id, settlementName: 'Example' },
    resources: { count: 1, goods: [] },
  });
  const request = vi.fn().mockResolvedValue({ ok: true, json: async () => snapshot('first') });
  vi.stubGlobal('fetch', request);
  const onColonyChanged = vi.fn().mockResolvedValue(undefined);
  const onError = vi.fn();
  const job = new ColonyPollingJob({ url: 'http://localhost:7777/api/colony-info', colonies, onColonyChanged, onError });
  return { job, colonies, write, request, onColonyChanged, onError, snapshot };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('ColonyPollingJob', () => {
  it('reads immediately, saves the snapshot and polls every 120 seconds', async () => {
    const fixture = setup();
    fixture.job.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(fixture.write).toHaveBeenCalledWith('first', fixture.snapshot('first'));
    expect(fixture.colonies.requireActiveId()).toBe('first');
    await vi.advanceTimersByTimeAsync(119_999);
    expect(fixture.request).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(fixture.request).toHaveBeenCalledTimes(2);
    expect(fixture.onColonyChanged.mock.calls.filter(([id]) => id === 'first')).toHaveLength(1);
    await fixture.job.stop();
    await vi.advanceTimersByTimeAsync(240_000);
    expect(fixture.request).toHaveBeenCalledTimes(2);
  });

  it('stops the previous colony listener before activating a different colony', async () => {
    const fixture = setup();
    fixture.job.start();
    await vi.advanceTimersByTimeAsync(0);
    fixture.onColonyChanged.mockClear();
    fixture.request.mockResolvedValueOnce({ ok: true, json: async () => fixture.snapshot('second') });
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fixture.onColonyChanged.mock.calls).toEqual([[undefined], ['second']]);
    expect(fixture.colonies.requireActiveId()).toBe('second');
    await fixture.job.stop();
  });

  it('deactivates on failure and recovers on the next interval', async () => {
    const fixture = setup();
    fixture.job.start();
    await vi.advanceTimersByTimeAsync(0);
    fixture.request.mockRejectedValueOnce(new Error('offline'));
    await vi.advanceTimersByTimeAsync(120_000);
    expect(() => fixture.colonies.requireActiveId()).toThrow('indisponivel');
    expect(fixture.onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'offline' }));
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fixture.colonies.requireActiveId()).toBe('first');
    await fixture.job.stop();
  });

  it('does not overlap a pending request', async () => {
    const fixture = setup();
    let resolveResponse!: (response: unknown) => void;
    fixture.request.mockReturnValueOnce(new Promise((resolve) => { resolveResponse = resolve; }));
    fixture.job.start();
    await vi.advanceTimersByTimeAsync(360_000);
    expect(fixture.request).toHaveBeenCalledOnce();
    resolveResponse({ ok: true, json: async () => fixture.snapshot('first') });
    await vi.advanceTimersByTimeAsync(0);
    await fixture.job.stop();
  });

  it('rejects invalid identity without writing to Firestore', async () => {
    const fixture = setup();
    fixture.request.mockResolvedValueOnce({ ok: true, json: async () => fixture.snapshot('invalid/id') });
    fixture.job.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(fixture.write).not.toHaveBeenCalled();
    expect(fixture.onError).toHaveBeenCalledOnce();
    await fixture.job.stop();
  });
});