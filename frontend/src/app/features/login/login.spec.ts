import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../core/services/auth/auth.service';
import { FirebaseConfiguration } from '../../core/services/firebase/firebase-client';
import { provideI18n } from '../../core/i18n/i18n.providers';
import { Login } from './login';

describe('Login', () => {
  it('submits credentials, navigates on success and clears the password', async () => {
    const login = vi.fn().mockResolvedValue(true);
    const navigateByUrl = vi.fn();
    await TestBed.configureTestingModule({ imports: [Login], providers: [
      ...provideI18n(),
      { provide: AuthService, useValue: {
        configured: true, busy: signal(false), error: signal(null),
        ready: async () => {}, authenticated: () => false, login,
      } },
      { provide: FirebaseConfiguration, useValue: { state: signal('ready') } },
      { provide: Router, useValue: { navigateByUrl } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeTruthy();
    fixture.componentInstance.email.set('owner@example.com');
    fixture.componentInstance.password.set('test-password');
    await fixture.componentInstance.login();
    expect(login).toHaveBeenCalledWith('owner@example.com', 'test-password');
    expect(navigateByUrl).toHaveBeenCalledWith('/');
    expect(fixture.componentInstance.password()).toBe('');
  });
});