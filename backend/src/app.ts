import Fastify from 'fastify';
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

  return app;
}