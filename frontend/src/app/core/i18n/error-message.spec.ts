import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { formatUserError } from './error-message';

describe('formatUserError', () => {
  const translate = (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${params['status']}` : key;

  it('uses localized messages for network and unavailable API failures', () => {
    expect(formatUserError(new HttpErrorResponse({ status: 0 }), translate)).toBe('errors.connection');
    expect(formatUserError(new HttpErrorResponse({ status: 502 }), translate)).toBe('errors.gameApiUnavailable');
  });

  it('extracts nested server messages and formats HTTP status fallbacks', () => {
    expect(formatUserError(new HttpErrorResponse({ status: 400, error: { error: { message: 'Invalid request' } } }), translate)).toBe('Invalid request');
    expect(formatUserError(new HttpErrorResponse({ status: 404 }), translate)).toBe('errors.httpStatus:404');
  });

  it('never renders a plain object as [object Object]', () => {
    expect(formatUserError({ response: { status: 500 } }, translate)).toBe('errors.unexpected');
    expect(formatUserError(new Error('Readable failure'), translate)).toBe('Readable failure');
  });

  it('localizes known repository validation failures', () => {
    expect(formatUserError(new Error('ID de documento invalido.'), translate)).toBe('errors.invalidDocumentId');
  });
});