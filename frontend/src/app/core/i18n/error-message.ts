import { HttpErrorResponse } from '@angular/common/http';

export type ErrorTranslator = (key: string, params?: Record<string, unknown>) => string;

const LOCAL_ERROR_KEYS: Record<string, string> = {
  'Firebase nao configurado.': 'errors.firebaseNotConfigured',
  'Caminho de colecao invalido.': 'errors.invalidCollectionPath',
  'ID de documento invalido.': 'errors.invalidDocumentId',
};

export function formatUserError(error: unknown, translate: ErrorTranslator): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return translate('errors.connection');
    if (error.status === 502 || error.status === 503) return translate('errors.gameApiUnavailable');
    const responseMessage = extractMessage(error.error);
    if (responseMessage) return responseMessage;
    if (error.status) return translate('errors.httpStatus', { status: error.status });
  }

  const message = extractMessage(error);
  if (!message) return translate('errors.unexpected');
  const key = LOCAL_ERROR_KEYS[message];
  return key ? translate(key) : message;
}

function extractMessage(value: unknown, depth = 0): string | null {
  if (depth > 3) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (value instanceof Error) return value.message.trim() || null;
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  for (const key of ['message', 'detail', 'title', 'error']) {
    const message = extractMessage(record[key], depth + 1);
    if (message) return message;
  }
  return null;
}