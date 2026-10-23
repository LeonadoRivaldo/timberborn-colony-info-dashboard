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

    const normalizedName = name.replace(/_ADAPTER$/, "");
    console.log("HERE!", { normalizedName });
    await this.service.write(
      normalizedName,
      { name: normalizedName, state: active },
      { merge: true },
    );
  }
}
