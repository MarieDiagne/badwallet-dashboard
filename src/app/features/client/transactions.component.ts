import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/wallet.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Historique des transactions</h1>

      <!-- Filtres -->
      <div class="filters">
        <input
          type="date"
          [value]="dateFrom()"
          (change)="dateFrom.set(getVal($event))"
          class="input"
          placeholder="Date début"
        />
        <input
          type="date"
          [value]="dateTo()"
          (change)="dateTo.set(getVal($event))"
          class="input"
        />
        <select (change)="typeFilter.set(getVal($event))" class="select">
          <option value="">Tous les types</option>
          <option value="DEPOSIT">Dépôt</option>
          <option value="WITHDRAWAL">Retrait</option>
          <option value="TRANSFER_SENT">Transfert envoyé</option>
          <option value="TRANSFER_RECEIVED">Transfert reçu</option>
          <option value="PAYMENT_ISM">Paiement ISM</option>
          <option value="PAYMENT_WOYAFAL">Paiement WOYAFAL</option>
        </select>
        <button (click)="resetFilters()" class="btn btn-outline">Réinitialiser</button>
      </div>

      <app-loader [visible]="loading()" />

      @if (!loading()) {
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Frais</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of filtered(); track tx.id) {
                <tr>
                  <td>{{ tx.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <span class="badge" [class]="badgeClass(tx.type)">
                      {{ tx.type | titlecase }}
                    </span>
                  </td>
                  <td>{{ tx.description }}</td>
                  <td class="fees">{{ tx.fees > 0 ? (tx.fees | xof) : '—' }}</td>
                  <td [class]="amountClass(tx.type)">{{ tx.amount | xof }}</td>
                </tr>
              }
            </tbody>
          </table>

          @if (filtered().length === 0) {
            <div class="empty">Aucune transaction pour ces critères.</div>
          }
        </div>

        <div class="summary">
          <span>{{ filtered().length }} transaction(s)</span>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
    .input, .select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; }
    .table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.7rem 1rem; border-bottom: 1px solid #f0f0f0; text-align: left; font-size: 0.9rem; }
    .table thead { background: #f8f9fa; font-weight: 600; }
    .table tbody tr:hover { background: #fafafa; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600; }
    .badge-deposit { background: #d4edda; color: #155724; }
    .badge-withdrawal { background: #f8d7da; color: #721c24; }
    .badge-transfer { background: #d1ecf1; color: #0c5460; }
    .badge-payment { background: #fff3cd; color: #856404; }
    .amount-credit { color: #28a745; font-weight: 600; }
    .amount-debit { color: #dc3545; font-weight: 600; }
    .fees { color: #999; font-size: 0.85rem; }
    .empty { text-align: center; padding: 2rem; color: #666; }
    .summary { text-align: right; margin-top: 0.75rem; font-size: 0.85rem; color: #666; }
    .btn { padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
    .btn-outline { background: white; border: 1px solid #ccc; }
  `]
})
export class TransactionsComponent implements OnInit {
  private walletService = inject(WalletApiService);
  private auth = inject(AuthService);

  loading = signal(false);
  allTx = signal<Transaction[]>([]);
  dateFrom = signal('');
  dateTo = signal('');
  typeFilter = signal('');

  filtered = computed(() => {
    return this.allTx().filter(tx => {
      const txDate = tx.createdAt.substring(0, 10);
      if (this.dateFrom() && txDate < this.dateFrom()) return false;
      if (this.dateTo() && txDate > this.dateTo()) return false;
      if (this.typeFilter() && tx.type !== this.typeFilter()) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.walletService.getTransactions(this.auth.getPhone()).subscribe({
      next: txs => { this.allTx.set(txs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  resetFilters(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
    this.typeFilter.set('');
  }

  badgeClass(type: string): string {
    if (type === 'DEPOSIT') return 'badge badge-deposit';
    if (type === 'WITHDRAWAL') return 'badge badge-withdrawal';
    if (type.startsWith('TRANSFER')) return 'badge badge-transfer';
    return 'badge badge-payment';
  }

  amountClass(type: string): string {
    return type === 'DEPOSIT' || type === 'TRANSFER_RECEIVED' ? 'amount-credit' : 'amount-debit';
  }
}
