import { describe, expect, it } from 'vitest';
import { readEnvironment } from './environment.js';

describe('readEnvironment', () => {
  it('requires an explicit Firebase project', () => {
    expect(() => readEnvironment({})).toThrow('FIREBASE_PROJECT_ID');
  });

  it('uses the default local port', () => {
    expect(readEnvironment({ FIREBASE_PROJECT_ID: 'test-project' })).toEqual({ firebaseProjectId: 'test-project', port: 7778 });
  });

  it('rejects invalid ports', () => {
    for (const port of ['0', '-1', '65536', 'text', '2.5']) {
      expect(() => readEnvironment({ FIREBASE_PROJECT_ID: 'test-project', PORT: port })).toThrow('PORT');
    }
  });
});