import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { timberbornDashboardRoutes } from './features/dashboard/timberborn-dashboard.routes';

export const timberbornAppConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(timberbornDashboardRoutes),
  ],
};