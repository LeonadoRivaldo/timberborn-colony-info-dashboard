import type { Firestore } from 'firebase-admin/firestore';

export interface RequestEvent {
  colonyId: string;
  method: string;
  endpoint: string;
  timestamp: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

export class EventsService {
  constructor(private readonly firestore: Firestore) {}

  async record(event: RequestEvent): Promise<void> {
    await this.firestore.collection('colonies').doc(event.colonyId).collection('events').add(event);
  }
}