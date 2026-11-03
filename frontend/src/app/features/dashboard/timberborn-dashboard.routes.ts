import type { Routes } from '@angular/router';

export const timberbornDashboardRoutes: Routes = [
  { path: '', loadComponent: () => import('./timberborn-dashboard').then((module) => module.TimberbornDashboard) },
  { path: '**', redirectTo: '' },
];