import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { provideI18n } from './i18n.providers';
import { LanguageService } from './language.service';
import { APP_LANGUAGES, TRANSLATIONS } from './translations';

describe('LanguageService', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('defaults to English and falls back to English for an unsupported saved value', async () => {
    localStorage.setItem('colony-info.language', 'de');
    TestBed.configureTestingModule({ providers: [...provideI18n()] });
    const language = TestBed.inject(LanguageService);
    await language.initialize();

    expect(language.currentLanguage()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(language.text('dashboard.production')).toBe('Production');
  });

  it('restores a supported language and persists runtime changes', async () => {
    localStorage.setItem('colony-info.language', 'pt-BR');
    TestBed.configureTestingModule({ providers: [...provideI18n()] });
    const language = TestBed.inject(LanguageService);
    await language.initialize();

    expect(language.currentLanguage()).toBe('pt-BR');
    expect(language.text('dashboard.production')).toBe('Produção');

    await language.setLanguage('fr');
    expect(localStorage.getItem('colony-info.language')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(language.text('dashboard.production')).toBe('Production');
  });

  it('provides the same translation keys for all requested languages', () => {
    const flattenKeys = (value: object, prefix = ''): string[] => Object.entries(value).flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return child && typeof child === 'object' ? flattenKeys(child, path) : [path];
    }).sort();
    const englishKeys = flattenKeys(TRANSLATIONS.en);

    expect(APP_LANGUAGES).toEqual(['en', 'pt-BR', 'es', 'fr']);
    for (const language of APP_LANGUAGES.slice(1)) {
      expect(flattenKeys(TRANSLATIONS[language])).toEqual(englishKeys);
    }
  });
});