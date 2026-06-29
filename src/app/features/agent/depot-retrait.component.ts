import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Wallet } from '../../core/models/wallet.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-depot-retrait',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Dépôt & Retrait</h1>

      <!-- Recherche du client -->
      <div class="section">
        <h2>1. Rechercher le client</h2>
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-bar">
          <input formControlName="phone" placeholder="+221XXXXXXXXX" class="search-input" />
          <button type="submit" class="btn btn-primary" [disabled]="searchForm.invalid || loading()">
            Rechercher
          </button>
        </form>
      </div>

      <app-loader [visible]="loading()" />

      @if (wallet()) {
        <div class="wallet-info">
          <span>{{ wallet()!.code }} — {{ wallet()!.phoneNumber }}</span>
          <span class="balance">Solde : {{ wallet()!.balance | xof }}</span>
        </div>

        <!-- Dépôt -->
        <div class="section">
          <h2>2. Effectuer un Dépôt</h2>
          <form [formGroup]="depositForm" (ngSubmit)="onDeposit()" class="operation-form">
            <div class="form-group">
              <label>Montant (XOF) *</label>
              <input formControlName="amount" type="number" min="1" placeholder="50000" />
              @if (depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched) {
                <span class="error">Montant invalide</span>
              }
            </div>
            <div class="form-group">
              <label>Méthode de paiement</label>
              <select formControlName="paymentMethod">
                <option value="CREDIT_CARD">Carte bancaire</option>
                <option value="CASH">Espèces</option>
              </select>
            </div>
            <button type="submit" class="btn btn-success" [disabled]="depositForm.invalid || loading()">
              Effectuer le dépôt
            </button>
          </form>
        </div>

        <!-- Retrait -->
        <div class="section">
          <h2>3. Effectuer un Retrait</h2>
          <form [formGroup]="withdrawForm" (ngSubmit)="onWithdraw()" class="operation-form">
            <div class="form-group">
              <label>Montant (XOF) *</label>
              <input formControlName="amount" type="number" min="1" placeholder="10000" />
              @if (withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched) {
                <span class="error">Montant invalide</span>
              }
            </div>
            <p class="hint">Frais : 1% du montant (plafonnés à 5 000 XOF)</p>
            <button type="submit" class="btn btn-danger" [disabled]="withdrawForm.invalid || loading()">
              Effectuer le retrait
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; }
    .section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    h2 { margin-bottom: 1rem; font-size: 1rem; color: #333; }
    .search-bar { display: flex; gap: 1rem; }
    .search-input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    .wallet-info { display: flex; justify-content: space-between; background: #e8eaf6; padding: 1rem 1.5rem; border-radius: 6px; margin-bottom: 1.5rem; font-weight: 500; }
    .balance { color: #1a237e; font-size: 1.1rem; }
    .operation-form { max-width: 400px; }
    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
    label { font-weight: 500; font-size: 0.9rem; }
    input, select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    .error { color: #dc3545; font-size: 0.8rem; }
    .hint { font-size: 0.8rem; color: #666; margin-bottom: 1rem; }
    .btn { padding: 0.5rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-size: 0.9rem; }
    .btn-primary { background: #1a237e; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class DepotRetraitComponent {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletApiService);
  private notification = inject(NotificationService);

  loading = signal(false);
  wallet = signal<Wallet | null>(null);

  searchForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+[0-9]{10,15}$/)]]
  });

  depositForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    paymentMethod: ['CREDIT_CARD']
  });

  withdrawForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]]
  });

  onSearch(): void {
    if (this.searchForm.invalid) return;
    this.loading.set(true);
    this.wallet.set(null);
    this.walletService.getWalletByPhone(this.searchForm.value.phone!).subscribe({
      next: w => { this.wallet.set(w); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onDeposit(): void {
    if (this.depositForm.invalid || !this.wallet()) return;
    this.loading.set(true);
    this.walletService.deposit(this.wallet()!.id, this.depositForm.value as any).subscribe({
      next: w => {
        this.wallet.set(w);
        this.notification.success(`Dépôt effectué. Nouveau solde : ${w.balance} XOF`);
        this.depositForm.reset({ paymentMethod: 'CREDIT_CARD' });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onWithdraw(): void {
    if (this.withdrawForm.invalid || !this.wallet()) return;
    this.loading.set(true);
    this.walletService.withdraw({
      phoneNumber: this.wallet()!.phoneNumber,
      amount: this.withdrawForm.value.amount!
    }).subscribe({
      next: w => {
        this.wallet.set(w);
        this.notification.success(`Retrait effectué. Nouveau solde : ${w.balance} XOF`);
        this.withdrawForm.reset();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
