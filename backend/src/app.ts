import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { adaptersRoutes } from './core/routes/adapters.routes.js';
import type { AdaptersRoutesOptions } from './core/routes/adapters.routes.js';

export function createApp(dependencies: AdaptersRoutesOptions) {
  const app = Fastify({ logger: true });
  const endpoints = new Map<string, { method: string; path: string }>();

  app.addHook('onRoute', (route) => {
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    for (const method of methods) {
      endpoints.set(`${method} ${route.url}`, { method, path: route.url });
    }
  });

  app.get('/endpoints', async (request) =>
    [...endpoints.values()].sort((first, second) =>
      first.path.localeCompare(second.path) || first.method.localeCompare(second.method),
    ).map((endpoint) => ({
      ...endpoint,
      path: `${request.protocol}://${request.host}${endpoint.path}`,
    })),
  );
  app.get('/health', async () => ({ status: 'ok' }));
  app.register(adaptersRoutes, dependencies);

  const webRoot = process.env['WEB_ROOT']?.trim();
  if (webRoot) {
    const root = resolve(webRoot);
    app.register(fastifyStatic, { root, prefix: '/', wildcard: false });
    app.get('/*', async (request, reply) => {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (pathname === '/health' || pathname === '/endpoints' || pathname.startsWith('/adapters/')) {
        return reply.code(404).send({ message: 'Not found' });
      }

      let relativePath: string;
      try {
        relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
      } catch {
        return reply.code(400).send({ message: 'Invalid path' });
      }

      const target = resolve(root, relativePath);
      const fromRoot = relative(root, target);
      if (fromRoot && (fromRoot.startsWith('..') || isAbsolute(fromRoot))) {
        return reply.code(404).send({ message: 'Not found' });
      }
      if (existsSync(target)) return reply.sendFile(relativePath);
      if (request.headers.accept?.includes('text/html')) return reply.sendFile('index.html');
      return reply.code(404).send({ message: 'Not found' });
    });
  }

  return app;
}