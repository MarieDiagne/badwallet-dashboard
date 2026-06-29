import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

function differentPhoneValidator(senderPhone: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value === senderPhone ? { samePhone: true } : null;
  };
}

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Transfert d'argent</h1>

      <div class="balance-info">
        Solde disponible : <strong>{{ walletService.currentBalance() | xof }}</strong>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">

        <div class="form-group">
          <label>Numéro destinataire *</label>
          <input formControlName="receiverPhone" placeholder="+221XXXXXXXXX" />
          @if (form.get('receiverPhone')?.errors?.['required'] && form.get('receiverPhone')?.touched) {
            <span class="error">Numéro requis</span>
          }
          @if (form.get('receiverPhone')?.errors?.['pattern'] && form.get('receiverPhone')?.touched) {
            <span class="error">Format invalide (+221XXXXXXXXX)</span>
          }
          @if (form.get('receiverPhone')?.errors?.['samePhone']) {
            <span class="error">Le destinataire doit être différent de l'expéditeur</span>
          }
        </div>

        <div class="form-group">
          <label>Montant (XOF) *</label>
          <input formControlName="amount" type="number" min="1" placeholder="2000" />
          @if (form.get('amount')?.invalid && form.get('amount')?.touched) {
            <span class="error">Montant invalide (minimum 1 XOF)</span>
          }
        </div>

        <app-loader [visible]="loading()" />

        @if (successMsg()) {
          <div class="alert-success">{{ successMsg() }}</div>
        }

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
            Envoyer
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1rem; }
    .balance-info { background: #e8eaf6; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
    .form-card { max-width: 480px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
    label { font-weight: 500; font-size: 0.9rem; }
    input { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    input:focus { outline: none; border-color: #1a237e; }
    .error { color: #dc3545; font-size: 0.8rem; }
    .alert-success { background: #d4edda; color: #155724; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .btn { padding: 0.6rem 1.5rem; border-radius: 4px; border: none; cursor: pointer; font-size: 0.95rem; }
    .btn-primary { background: #1a237e; color: white; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class TransferComponent {
  private fb = inject(FormBuilder);
  walletService = inject(WalletApiService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);

  loading = signal(false);
  successMsg = signal('');

  form = this.fb.group({
    receiverPhone: ['', [
      Validators.required,
      Validators.pattern(/^\+[0-9]{10,15}$/),
      differentPhoneValidator(this.auth.getPhone())
    ]],
    amount: [null, [Validators.required, Validators.min(1)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.successMsg.set('');

    this.walletService.transfer({
      senderPhone: this.auth.getPhone(),
      receiverPhone: this.form.value.receiverPhone!,
      amount: this.form.value.amount!
    }).subscribe({
      next: res => {
        this.successMsg.set(res.message);
        this.notification.success(res.message);
        this.walletService.getBalance(this.auth.getPhone()).subscribe();
        this.form.reset();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
