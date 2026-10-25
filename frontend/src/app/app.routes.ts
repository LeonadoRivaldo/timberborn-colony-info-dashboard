import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth/auth.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./features/login/login').then((module) => module.Login) },
	{ path: 'manage', canActivate: [authGuard], loadComponent: () => import('./features/management/management').then((module) => module.Management) },
	{ path: '', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard').then((module) => module.Dashboard) },
	{ path: '**', redirectTo: '' },
];
