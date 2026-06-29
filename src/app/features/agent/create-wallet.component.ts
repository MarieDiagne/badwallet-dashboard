import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-create-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent],
  template: `
    <div class="page">
      <h1>Créer un portefeuille</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">

        <div class="form-group">
          <label>Numéro de téléphone *</label>
          <input formControlName="phoneNumber" placeholder="+221770000000" />
          @if (form.get('phoneNumber')?.invalid && form.get('phoneNumber')?.touched) {
            <span class="error">Numéro requis (format: +221XXXXXXXXX)</span>
          }
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input formControlName="email" type="email" placeholder="client@example.com" />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <span class="error">Email invalide</span>
          }
        </div>

        <div class="form-group">
          <label>Code portefeuille *</label>
          <input formControlName="code" placeholder="WLT-XXXXXX" />
          @if (form.get('code')?.invalid && form.get('code')?.touched) {
            <span class="error">Code requis</span>
          }
        </div>

        <div class="form-group">
          <label>Solde initial (XOF)</label>
          <input formControlName="initialBalance" type="number" min="0" />
        </div>

        <div class="form-group">
          <label>Devise</label>
          <select formControlName="currency">
            <option value="XOF">XOF</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <app-loader [visible]="loading()" />

        <div class="form-actions">
          <button type="button" class="btn" (click)="router.navigate(['/admin/wallets'])">Annuler</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
            Créer le portefeuille
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; }
    .form-card { max-width: 500px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
    label { font-weight: 500; font-size: 0.9rem; }
    input, select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    input:focus, select:focus { outline: none; border-color: #1a237e; }
    .error { color: #dc3545; font-size: 0.8rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn { padding: 0.5rem 1.2rem; border-radius: 4px; border: 1px solid #ccc; background: white; cursor: pointer; }
    .btn-primary { background: #1a237e; color: white; border-color: #1a237e; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CreateWalletComponent {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletApiService);
  private notification = inject(NotificationService);
  router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+221[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    code: ['', Validators.required],
    initialBalance: [0, [Validators.required, Validators.min(0)]],
    currency: ['XOF']
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.walletService.createWallet(this.form.value as any).subscribe({
      next: () => {
        this.notification.success('Portefeuille créé avec succès');
        this.router.navigate(['/admin/wallets']);
      },
      error: () => this.loading.set(false)
    });
  }
}
