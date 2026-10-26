import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { AdaptersWebhookController } from './core/controllers/adapters-webhook.controler.js';
import type { Firestore } from 'firebase-admin/firestore';
import { ColoniesService } from './core/services/colonies/colonies.service.js';

function createTestApp() {
  const firestore = {} as Firestore;
  return createApp({ firestore, colonies: new ColoniesService(firestore) });
}

describe('local application', () => {
  it('lists registered routes dynamically, including prefixed plugins and multiple methods', async () => {
    const app = createTestApp();
    app.register(async (plugin) => {
      plugin.route({ method: ['POST', 'PUT'], url: '/example', handler: async () => ({ ok: true }) });
    }, { prefix: '/test' });
    try {
      const response = await app.inject({ method: 'GET', url: 'http://localhost:7778/endpoints' });
      expect(response.statusCode).toBe(200);
      const endpoints = response.json<{ method: string; path: string }[]>();
      expect(endpoints).toEqual(expect.arrayContaining([
        { method: 'GET', path: 'http://localhost:7778/endpoints' },
        { method: 'GET', path: 'http://localhost:7778/health' },
        { method: 'HEAD', path: 'http://localhost:7778/health' },
        { method: 'POST', path: 'http://localhost:7778/adapters/:state/:name' },
        { method: 'POST', path: 'http://localhost:7778/test/example' },
        { method: 'PUT', path: 'http://localhost:7778/test/example' },
      ]));
      expect(new Set(endpoints.map(({ method, path }) => `${method} ${path}`)).size).toBe(endpoints.length);
    } finally {
      await app.close();
    }
  });

  it('exposes a health check without goods routes', async () => {
    const app = createTestApp();
    try {
      const response = await app.inject({ method: 'GET', url: '/health' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect((await app.inject({ method: 'GET', url: '/goods' })).statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });

  it('serves frontend assets and falls back to the Angular app routes', async () => {
    const webRoot = await mkdtemp(join(tmpdir(), 'colony-info-web-'));
    const previousWebRoot = process.env['WEB_ROOT'];
    await mkdir(join(webRoot, 'assets'));
    await writeFile(join(webRoot, 'index.html'), '<main>Angular app</main>');
    await writeFile(join(webRoot, 'assets', 'app.js'), 'globalThis.appLoaded = true;');
    process.env['WEB_ROOT'] = webRoot;
    const app = createTestApp();

    try {
      const home = await app.inject({ method: 'GET', url: '/', headers: { accept: 'text/html' } });
      expect(home.statusCode).toBe(200);
      expect(home.body).toContain('Angular app');

      const route = await app.inject({ method: 'GET', url: '/login', headers: { accept: 'text/html' } });
      expect(route.statusCode).toBe(200);
      expect(route.body).toContain('Angular app');

      const asset = await app.inject({ method: 'GET', url: '/assets/app.js' });
      expect(asset.statusCode).toBe(200);
      expect(asset.body).toContain('appLoaded');

      const missingApi = await app.inject({ method: 'GET', url: '/adapters/unknown', headers: { accept: 'text/html' } });
      expect(missingApi.statusCode).toBe(404);
    } finally {
      await app.close();
      if (previousWebRoot === undefined) delete process.env['WEB_ROOT'];
      else process.env['WEB_ROOT'] = previousWebRoot;
      await rm(webRoot, { recursive: true, force: true });
    }
  });

  it('routes adapter POST requests to the controller with state and name', async () => {
    const handle = vi.spyOn(AdaptersWebhookController.prototype, 'handle')
      .mockImplementation(async (_request, reply) => {
        reply.code(204).send();
      });
    const app = createTestApp();
    try {
      const response = await app.inject({ method: 'POST', url: '/adapters/on/test-adapter' });
      expect(response.statusCode).toBe(204);
      expect(handle).toHaveBeenCalledOnce();
      expect(handle.mock.calls[0]?.[0].params).toEqual({ state: 'on', name: 'test-adapter' });
      expect((await app.inject({ method: 'GET', url: '/adapters/on/test-adapter' })).statusCode).toBe(404);
    } finally {
      await app.close();
      handle.mockRestore();
    }
  });
});