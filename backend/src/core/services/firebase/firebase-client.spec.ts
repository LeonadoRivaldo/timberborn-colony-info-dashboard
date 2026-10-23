import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { createFirebaseClient } from './firebase-client.js';

vi.mock('firebase-admin/app', () => ({
  applicationDefault: vi.fn(() => ({})),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

describe('createFirebaseClient', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('initializes once and reuses the default app on subsequent calls', () => {
    const app = { name: '[DEFAULT]', options: { projectId: 'test-project' } };
    vi.mocked(getApps).mockReturnValueOnce([]).mockReturnValue([app] as never);
    vi.mocked(initializeApp).mockReturnValue(app as never);

    const first = createFirebaseClient('test-project');
    const second = createFirebaseClient('test-project');

    expect(first.app).toBe(app);
    expect(second.app).toBe(app);
    expect(initializeApp).toHaveBeenCalledOnce();
    expect(applicationDefault).toHaveBeenCalledOnce();
  });

  it('rejects reusing an app configured for a different project', () => {
    vi.mocked(getApps).mockReturnValue([
      { name: '[DEFAULT]', options: { projectId: 'another-project' } },
    ] as never);

    expect(() => createFirebaseClient('test-project')).toThrow('outro projeto');
    expect(initializeApp).not.toHaveBeenCalled();
  });
});