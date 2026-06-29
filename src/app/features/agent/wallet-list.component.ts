import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { Wallet } from '../../core/models/wallet.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Portefeuilles</h1>
        <a routerLink="/admin/wallets/new" class="btn btn-primary">+ Nouveau portefeuille</a>
      </div>

      <app-loader [visible]="loading()" />

      @if (!loading()) {
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Solde</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (wallet of wallets(); track wallet.id) {
              <tr>
                <td>{{ wallet.code }}</td>
                <td>{{ wallet.phoneNumber }}</td>
                <td>{{ wallet.email }}</td>
                <td>{{ wallet.balance | xof }}</td>
                <td>
                  <a [routerLink]="['/admin/wallets', wallet.phoneNumber]" class="btn btn-sm">
                    Voir
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pagination">
          <button (click)="prevPage()" [disabled]="page() === 0" class="btn">← Précédent</button>
          <span>Page {{ page() + 1 }} / {{ totalPages() }}</span>
          <button (click)="nextPage()" [disabled]="page() + 1 >= totalPages()" class="btn">Suivant →</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { margin: 0; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem 1rem; border-bottom: 1px solid #dee2e6; text-align: left; }
    .table thead { background: #f8f9fa; }
    .table tbody tr:hover { background: #f1f3f5; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .btn { padding: 0.4rem 0.9rem; border-radius: 4px; border: 1px solid #ccc; background: white; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
    .btn-primary { background: #1a237e; color: white; border-color: #1a237e; }
    .btn-sm { padding: 0.25rem 0.6rem; font-size: 0.8rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class WalletListComponent implements OnInit {
  private walletService = inject(WalletApiService);

  wallets = signal<Wallet[]>([]);
  loading = signal(false);
  page = signal(0);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.loading.set(true);
    this.walletService.getWallets(this.page(), 10).subscribe({
      next: res => {
        this.wallets.set(res.content);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  prevPage(): void {
    this.page.update(p => p - 1);
    this.loadWallets();
  }

  nextPage(): void {
    this.page.update(p => p + 1);
    this.loadWallets();
  }
}
