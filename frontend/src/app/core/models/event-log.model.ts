export interface EventLog {
  colonyId: string;
  method: string;
  endpoint: string;
  timestamp: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  error?: string;
}