import type { FastifyReply, FastifyRequest } from "fastify";
import type { FirestoreRepository } from "../services/firestore/firestore.repository.js";

export interface AdapterWebhookParams {
  state: string;
  name: string;
}
export class AdaptersWebhookController {
  constructor(private readonly service: FirestoreRepository<any>) {}

  async handle(
    _request: FastifyRequest<{ Params: AdapterWebhookParams }>,
    _reply: FastifyReply,
  ): Promise<void> {
    const { params } = _request;
    const { name, state } = params;
    const active = state === "on";

    let normalizedName = name.replace(/(_ADAPTER|_ADPTER)$/, "");
    normalizedName = normalizedName.replace(/(_INDICATOR)$/, "");
    normalizedName = normalizedName.replace(/(_LEVER)$/, "");

    await this.service.write(
      normalizedName,
      { name: normalizedName, state: active },
      { merge: true },
    );
  }
}
