import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { Wallet } from '../../core/models/wallet.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-search-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Rechercher un client</h1>

      <form [formGroup]="form" (ngSubmit)="onSearch()" class="search-bar">
        <input
          formControlName="phone"
          placeholder="Entrez le numéro de téléphone (+221XXXXXXXXX)"
          class="search-input"
        />
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
          Rechercher
        </button>
      </form>

      <app-loader [visible]="loading()" />

      @if (wallet()) {
        <div class="wallet-card">
          <h2>Détails du portefeuille</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Code</span>
              <span class="value">{{ wallet()!.code }}</span>
            </div>
            <div class="info-item">
              <span class="label">Téléphone</span>
              <span class="value">{{ wallet()!.phoneNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email</span>
              <span class="value">{{ wallet()!.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">Solde</span>
              <span class="value balance">{{ wallet()!.balance | xof }}</span>
            </div>
            <div class="info-item">
              <span class="label">Devise</span>
              <span class="value">{{ wallet()!.currency }}</span>
            </div>
            <div class="info-item">
              <span class="label">Créé le</span>
              <span class="value">{{ wallet()!.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>
      }

      @if (notFound()) {
        <div class="alert-error">Aucun portefeuille trouvé pour ce numéro.</div>
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; }
    .search-bar { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .search-input { flex: 1; padding: 0.6rem 1rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; }
    .search-input:focus { outline: none; border-color: #1a237e; }
    .btn { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; }
    .btn-primary { background: #1a237e; color: white; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .wallet-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .wallet-card h2 { margin-bottom: 1.5rem; color: #1a237e; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .label { font-size: 0.8rem; color: #666; text-transform: uppercase; }
    .value { font-size: 1rem; font-weight: 500; }
    .balance { color: #1a237e; font-size: 1.2rem; }
    .alert-error { background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 6px; }
  `]
})
export class SearchWalletComponent {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletApiService);

  loading = signal(false);
  wallet = signal<Wallet | null>(null);
  notFound = signal(false);

  form = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+[0-9]{10,15}$/)]]
  });

  onSearch(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.wallet.set(null);
    this.notFound.set(false);

    const phone = this.form.value.phone!;
    this.walletService.getWalletByPhone(phone).subscribe({
      next: w => {
        this.wallet.set(w);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }
}
