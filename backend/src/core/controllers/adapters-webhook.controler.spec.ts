import { describe, expect, it, vi } from 'vitest';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { FirestoreRepository } from '../services/firestore/firestore.repository.js';
import { AdaptersWebhookController } from './adapters-webhook.controler.js';
import type { AdapterWebhookParams } from './adapters-webhook.controler.js';

describe('AdaptersWebhookController name normalization', () => {
  it.each([
    ['OPEN_MAIN_RESERVOIR_ADPTER', 'OPEN_MAIN_RESERVOIR'],
    ['OPEN_MAIN_RESERVOIR', 'OPEN_MAIN_RESERVOIR'],
    ['MAIN_ADPTER_RESERVOIR', 'MAIN_ADPTER_RESERVOIR'],
  ])('normalizes %s to %s before writing', async (name, expectedName) => {
    const write = vi.fn().mockResolvedValue(undefined);
    const service = { write } as unknown as FirestoreRepository<{ name: string; state: boolean }>;
    const controller = new AdaptersWebhookController(service);
    const request = { params: { name, state: 'on' } } as FastifyRequest<{ Params: AdapterWebhookParams }>;

    await controller.handle(request, {} as FastifyReply);

    expect(write).toHaveBeenCalledWith(
      expectedName,
      { name: expectedName, state: true },
      { merge: true },
    );
  });
});