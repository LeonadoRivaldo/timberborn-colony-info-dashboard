import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';
import type { StoredDocument } from '../../models/stored-document.js';
import type { Lever } from '../../models/lever.model.js';
import { LeversService } from './levers.service.js';

function setup() {
  const service = new LeversService({} as Firestore, () => 'test-colony');
  let emit!: (documents: StoredDocument<Lever>[]) => void;
  const unsubscribe = vi.fn();
  vi.spyOn(service, 'watchList').mockImplementation((onNext) => {
    emit = onNext;
    return unsubscribe;
  });
  const request = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', request);
  const onError = vi.fn();
  const stop = service.start('http://localhost:7778/api/', onError);
  const document = (state: boolean, name = 'MAIN RESERVOIR'): StoredDocument<Lever> => ({
    id: 'main', data: { name, state, springReturn: false },
  });
  return { emit, request, onError, stop, unsubscribe, document };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('LeversService', () => {
  it('ignores initial data and unchanged states', async () => {
    const fixture = setup();
    fixture.emit([fixture.document(false)]);
    fixture.emit([fixture.document(false)]);
    await fixture.stop();
    expect(fixture.request).not.toHaveBeenCalled();
  });

  it('sends changes in order using encoded names and the API base path', async () => {
    const fixture = setup();
    fixture.emit([fixture.document(false)]);
    fixture.emit([fixture.document(true)]);
    fixture.emit([fixture.document(false)]);
    await vi.waitFor(() => expect(fixture.request).toHaveBeenCalledTimes(2));
    expect(String(fixture.request.mock.calls[0]?.[0])).toBe('http://localhost:7778/api/switch-on/MAIN%20RESERVOIR');
    expect(String(fixture.request.mock.calls[1]?.[0])).toBe('http://localhost:7778/api/switch-off/MAIN%20RESERVOIR');
    await fixture.stop();
    expect(fixture.unsubscribe).toHaveBeenCalledOnce();
  });

  it('reacts to documents added after the initial snapshot, not deletions', async () => {
    const fixture = setup();
    fixture.emit([]);
    fixture.emit([fixture.document(true)]);
    await vi.waitFor(() => expect(fixture.request).toHaveBeenCalledOnce());
    fixture.emit([]);
    await fixture.stop();
    expect(fixture.request).toHaveBeenCalledOnce();
  });

  it('logs failed requests and continues processing subsequent states', async () => {
    const fixture = setup();
    fixture.request.mockResolvedValueOnce({ ok: false, status: 503 });
    fixture.emit([fixture.document(false)]);
    fixture.emit([fixture.document(true)]);
    fixture.emit([fixture.document(false)]);
    await vi.waitFor(() => expect(fixture.request).toHaveBeenCalledTimes(2));
    expect(fixture.onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('503') }));
    await fixture.stop();
  });

  it('does not run queued commands after shutdown', async () => {
    const fixture = setup();
    fixture.emit([]);
    fixture.emit([fixture.document(true)]);
    await fixture.stop();
    expect(fixture.request).not.toHaveBeenCalled();
  });
});