import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/wallet.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Bonjour, {{ auth.getPhone() }}</h1>

      <app-loader [visible]="loading()" />

      @if (!loading()) {
        <!-- Solde -->
        <div class="balance-card">
          <span class="balance-label">Solde disponible</span>
          <span class="balance-amount">{{ walletService.currentBalance() | xof }}</span>
        </div>

        <!-- Raccourcis -->
        <div class="shortcuts">
          <a routerLink="/transfer" class="shortcut-card">
            <span class="icon">↗</span>
            <span>Transfert</span>
          </a>
          <a routerLink="/bills/current" class="shortcut-card">
            <span class="icon">📄</span>
            <span>Factures</span>
          </a>
          <a routerLink="/transactions" class="shortcut-card">
            <span class="icon">📋</span>
            <span>Historique</span>
          </a>
        </div>

        <!-- Dernières transactions -->
        <div class="section">
          <h2>Dernières transactions</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of recentTx(); track tx.id) {
                <tr>
                  <td>{{ tx.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><span class="badge badge-{{ tx.type | lowercase }}">{{ tx.type }}</span></td>
                  <td>{{ tx.description }}</td>
                  <td [class]="tx.type === 'DEPOSIT' ? 'amount-positive' : 'amount-negative'">
                    {{ tx.amount | xof }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <a routerLink="/transactions" class="link-more">Voir tout l'historique →</a>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #333; }
    .balance-card {
      background: linear-gradient(135deg, #1a237e, #3949ab);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .balance-label { font-size: 0.9rem; opacity: 0.8; }
    .balance-amount { font-size: 2rem; font-weight: bold; }
    .shortcuts { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .shortcut-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      text-decoration: none;
      color: #333;
      transition: transform 0.1s;
    }
    .shortcut-card:hover { transform: translateY(-2px); }
    .icon { font-size: 1.5rem; }
    .section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    h2 { margin-bottom: 1rem; font-size: 1rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f0f0f0; text-align: left; font-size: 0.9rem; }
    .table thead { background: #f8f9fa; }
    .amount-positive { color: #28a745; font-weight: 500; }
    .amount-negative { color: #dc3545; font-weight: 500; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: #e9ecef; }
    .link-more { display: block; text-align: right; margin-top: 1rem; color: #1a237e; font-size: 0.9rem; }
  `]
})
export class DashboardComponent implements OnInit {
  walletService = inject(WalletApiService);
  auth = inject(AuthService);

  loading = signal(false);
  recentTx = signal<Transaction[]>([]);

  ngOnInit(): void {
    const phone = this.auth.getPhone();
    if (!phone) return;
    this.loading.set(true);
    this.walletService.getBalance(phone).subscribe(() => {
      this.walletService.getTransactions(phone).subscribe({
        next: txs => {
          this.recentTx.set(txs.slice(0, 5));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }
}
