import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideI18n } from './core/i18n/i18n.providers';
import { timberbornDashboardRoutes } from './features/dashboard/timberborn-dashboard.routes';

export const timberbornAppConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    ...provideI18n(),
    provideRouter(timberbornDashboardRoutes),
  ],
};