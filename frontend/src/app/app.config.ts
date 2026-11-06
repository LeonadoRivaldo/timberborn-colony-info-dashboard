import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FIREBASE_CLIENT, FirebaseConfiguration } from './core/services/firebase/firebase-client';
import { provideI18n } from './core/i18n/i18n.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    ...provideI18n(),
    provideAppInitializer(() => inject(FirebaseConfiguration).initialize()),
    { provide: FIREBASE_CLIENT, useFactory: () => inject(FirebaseConfiguration).client },
    provideRouter(routes)
  ]
};
