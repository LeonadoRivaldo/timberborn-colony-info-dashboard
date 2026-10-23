import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { FIREBASE_CLIENT, FirebaseConfiguration } from './core/services/firebase/firebase-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(FirebaseConfiguration).initialize()),
    { provide: FIREBASE_CLIENT, useFactory: () => inject(FirebaseConfiguration).client },
    provideRouter(routes)
  ]
};
