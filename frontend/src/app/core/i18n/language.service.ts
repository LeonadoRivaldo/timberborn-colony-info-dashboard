import { computed, inject, Injectable, signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localePt from '@angular/common/locales/pt';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map, switchMap, tap } from 'rxjs';
import { APP_LANGUAGES, LANGUAGE_LOCALES, TRANSLATIONS } from './translations';
import type { AppLanguage } from './translations';

const LANGUAGE_STORAGE_KEY = 'colony-info.language';

registerLocaleData(localePt, 'pt-BR');
registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeFr, 'fr-FR');

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translations = inject(TranslateService);
  readonly currentLanguage = signal<AppLanguage>('en');
  readonly locale = computed(() => LANGUAGE_LOCALES[this.currentLanguage()]);

  constructor() {
    this.translations.addLangs([...APP_LANGUAGES]);
    for (const language of APP_LANGUAGES) {
      this.translations.setTranslation(language, TRANSLATIONS[language]);
    }
  }

  initialize(): Promise<void> {
    const language = this.readSavedLanguage();
    return firstValueFrom(this.translations.setFallbackLang('en').pipe(
      switchMap(() => this.translations.use(language)),
      tap(() => this.activate(language)),
      map(() => undefined),
    ));
  }

  async setLanguage(value: string): Promise<void> {
    if (!APP_LANGUAGES.includes(value as AppLanguage)) return;
    const language = value as AppLanguage;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The selected language remains active for this session.
    }
    await firstValueFrom(this.translations.use(language));
    this.activate(language);
  }

  text(key: string, parameters?: Record<string, unknown>): string {
    return this.translations.instant(key, parameters, this.currentLanguage()) as string;
  }

  formatNumber(value: number, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat(this.locale(), { maximumFractionDigits }).format(value);
  }

  private readSavedLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved && APP_LANGUAGES.includes(saved as AppLanguage) ? saved as AppLanguage : 'en';
    } catch {
      return 'en';
    }
  }

  private activate(language: AppLanguage): void {
    this.currentLanguage.set(language);
    document.documentElement.lang = language;
    document.title = this.text('common.documentTitle');
    document.querySelector('meta[name="description"]')?.setAttribute('content', this.text('common.metaDescription'));
  }
}