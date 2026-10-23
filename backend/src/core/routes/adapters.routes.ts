import type { FastifyPluginAsync } from 'fastify';
import { AdaptersWebhookController } from '../controllers/adapters-webhook.controler.js';
import type { AdapterWebhookParams } from '../controllers/adapters-webhook.controler.js';
import { AdptersService } from '../services/adapters/adapters.service.js';
import { LeversService } from '../services/levers/levers.service.js';
import type { Firestore } from 'firebase-admin/firestore';
import type { ColoniesService } from '../services/colonies/colonies.service.js';

export interface AdaptersRoutesOptions {
  firestore: Firestore;
  colonies: ColoniesService;
}

export const adaptersRoutes: FastifyPluginAsync<AdaptersRoutesOptions> = async (app, options) => {
  const adptersService = new AdptersService(options.firestore, options.colonies.requireActiveId);
  const adaptersController = new AdaptersWebhookController(adptersService);

  const leverService = new LeversService(options.firestore, options.colonies.requireActiveId);
  const adaptersLeversControlers = new AdaptersWebhookController(leverService);

  app.post<{ Params: AdapterWebhookParams }>('/adapters/:state/:name', (request, reply) => adaptersController.handle(request, reply));
  app.post<{ Params: AdapterWebhookParams }>('/adapters/levers/:state/:name', (request, reply) => adaptersLeversControlers.handle(request, reply));

};