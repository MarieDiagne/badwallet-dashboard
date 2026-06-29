import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Role } from '../../core/services/auth.service';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="logo">💳</span>
          <h1>BadWallet</h1>
          <p>Connectez-vous pour continuer</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Numéro de téléphone</label>
            <input formControlName="phone" placeholder="+221770000001" />
            @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
              <span class="error">Numéro requis</span>
            }
          </div>

          <div class="form-group">
            <label>Rôle</label>
            <div class="role-selector">
              <label class="role-option" [class.active]="form.value.role === 'client'">
                <input type="radio" formControlName="role" value="client" />
                <span>👤 Client</span>
              </label>
              <label class="role-option" [class.active]="form.value.role === 'agent'">
                <input type="radio" formControlName="role" value="agent" />
                <span>🏦 Agent</span>
              </label>
            </div>
          </div>

          <app-loader [visible]="loading()" />

          <button type="submit" class="btn-login" [disabled]="form.invalid || loading()">
            Se connecter
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e, #3949ab);
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .logo { font-size: 2.5rem; }
    h1 { margin: 0.5rem 0 0.25rem; font-size: 1.5rem; color: #1a237e; }
    .login-header p { color: #666; font-size: 0.9rem; margin: 0; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1.25rem; }
    label { font-weight: 500; font-size: 0.9rem; color: #333; }
    input[type="text"], input:not([type="radio"]) {
      padding: 0.6rem 0.9rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.95rem;
      width: 100%;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #1a237e; }
    .error { color: #dc3545; font-size: 0.8rem; }
    .role-selector { display: flex; gap: 0.75rem; }
    .role-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: border-color 0.15s;
    }
    .role-option input { display: none; }
    .role-option.active { border-color: #1a237e; background: #e8eaf6; }
    .btn-login {
      width: 100%;
      padding: 0.75rem;
      background: #1a237e;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .btn-login:hover { background: #283593; }
    .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private walletService = inject(WalletApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    phone: ['', Validators.required],
    role: ['client', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { phone, role } = this.form.value;
    this.loading.set(true);

    if (role === 'agent') {
      this.auth.login(phone!, role as Role);
      this.router.navigate(['/admin/wallets']);
      this.loading.set(false);
      return;
    }

    this.walletService.getBalance(phone!).subscribe({
      next: () => {
        this.auth.login(phone!, role as Role);
        this.router.navigate(['/dashboard']);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Portefeuille introuvable pour ce numéro');
        this.loading.set(false);
      }
    });
  }
}
