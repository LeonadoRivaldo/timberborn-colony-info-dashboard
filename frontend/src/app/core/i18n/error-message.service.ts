import { inject, Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { formatUserError } from './error-message';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  private readonly language = inject(LanguageService);

  format(error: unknown): string {
    return formatUserError(error, (key, parameters) => this.language.text(key, parameters));
  }

  text(key: string, parameters?: Record<string, unknown>): string {
    return this.language.text(key, parameters);
  }
}