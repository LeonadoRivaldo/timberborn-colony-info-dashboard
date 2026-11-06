import { inject, provideAppInitializer } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

export function provideI18n() {
  return [
    ...provideTranslateService({ fallbackLang: 'en' }),
    provideAppInitializer(() => inject(LanguageService).initialize()),
  ];
}