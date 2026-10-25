import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { AdaptersWebhookController } from '../controllers/adapters-webhook.controler.js';
import type { AdapterWebhookParams } from '../controllers/adapters-webhook.controler.js';
import { AdptersService } from '../services/adapters/adapters.service.js';
import { LeversService } from '../services/levers/levers.service.js';
import type { Firestore } from 'firebase-admin/firestore';
import type { ColoniesService } from '../services/colonies/colonies.service.js';
import { AdptersIndicatorsService } from '../services/adapters/adapters-indicators.service.js';
import { EventsService } from '../services/events/events.service.js';

export interface AdaptersRoutesOptions {
  firestore: Firestore;
  colonies: ColoniesService;
}

export const adaptersRoutes: FastifyPluginAsync<AdaptersRoutesOptions> = async (app, options) => {
  const events = new EventsService(options.firestore);
  const requests = new WeakMap<FastifyRequest, { colonyId: string | undefined; timestamp: string; startedAt: number; error?: string }>();

  app.addHook('onRequest', (request, _reply, done) => {
    const context = { timestamp: new Date().toISOString(), startedAt: performance.now(), colonyId: undefined as string | undefined };
    try {
      context.colonyId = options.colonies.requireActiveId();
    } catch {
      request.log.warn('Evento sem colonia ativa; nao sera persistido no Firestore.');
    }
    requests.set(request, context);
    done();
  });

  app.addHook('onError', (request, _reply, error, done) => {
    const context = requests.get(request);
    if (context) context.error = error.message.slice(0, 1000);
    done();
  });

  app.addHook('onResponse', (request, reply, done) => {
    const context = requests.get(request);
    requests.delete(request);
    if (context?.colonyId) {
      void events.record({
        colonyId: context.colonyId,
        method: request.method,
        endpoint: request.url.split('?')[0]!,
        timestamp: context.timestamp,
        statusCode: reply.statusCode,
        durationMs: Math.round(performance.now() - context.startedAt),
        success: reply.statusCode < 400,
        ...(context.error ? { error: context.error } : {}),
      }).catch((error: unknown) => {
        request.log.error({ err: error, colonyId: context.colonyId, requestId: request.id }, 'Falha ao persistir event log; resposta do endpoint ja enviada.');
      });
    }
    done();
  });

  const adptersService = new AdptersService(options.firestore, options.colonies.requireActiveId);
  const adaptersController = new AdaptersWebhookController(adptersService);

  const leverService = new LeversService(options.firestore, options.colonies.requireActiveId);
  const adaptersLeversControlers = new AdaptersWebhookController(leverService);

  const indicatorsService = new AdptersIndicatorsService(options.firestore, options.colonies.requireActiveId)
  const adaptersIndicatorsControlers = new AdaptersWebhookController(indicatorsService);

  app.post<{ Params: AdapterWebhookParams }>('/adapters/:state/:name', (request, reply) => adaptersController.handle(request, reply));
  app.post<{ Params: AdapterWebhookParams }>('/adapters/levers/:state/:name', (request, reply) => adaptersLeversControlers.handle(request, reply));
  app.post<{ Params: AdapterWebhookParams }>('/adapters/indicators/:state/:name', (request, reply) => adaptersIndicatorsControlers.handle(request, reply));

};