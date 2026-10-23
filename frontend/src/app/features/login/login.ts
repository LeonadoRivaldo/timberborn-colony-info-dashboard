import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { FirebaseConfiguration } from '../../core/services/firebase/firebase-client';

@Component({ selector: 'app-login', imports: [FormsModule], templateUrl: './login.html', styleUrl: './login.scss' })
export class Login {
  readonly auth = inject(AuthService);
  readonly configuration = inject(FirebaseConfiguration);
  private readonly router = inject(Router);
  readonly email = signal('');
  readonly password = signal('');

  constructor() {
    void this.auth.ready().then(() => {
      if (this.auth.authenticated()) void this.router.navigateByUrl('/');
    });
  }

  async login(): Promise<void> {
    if (!this.email().trim() || !this.password() || this.auth.busy() || !this.auth.configured) return;
    try {
      if (await this.auth.login(this.email(), this.password())) await this.router.navigateByUrl('/');
    } finally {
      this.password.set('');
    }
  }
}