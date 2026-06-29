import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-brand">
        <span class="logo">💳 BadWallet</span>
      </div>

      @if (auth.isLoggedIn()) {
        <nav class="nav">
          @if (auth.isAgent()) {
            <a routerLink="/admin/wallets" routerLinkActive="active">Portefeuilles</a>
          } @else {
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/transfer" routerLinkActive="active">Transfert</a>
            <a routerLink="/bills" routerLinkActive="active">Factures</a>
            <a routerLink="/transactions" routerLinkActive="active">Historique</a>
          }
        </nav>
        <div class="header-right">
          @if (!auth.isAgent()) {
            <span class="balance">{{ walletService.currentBalance() | number:'1.0-0' }} XOF</span>
          }
          <span class="phone">{{ auth.getPhone() }}</span>
          <button class="btn-logout" (click)="auth.logout()">Déconnexion</button>
        </div>
      }
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: #1a237e;
      color: white;
    }
    .logo { font-size: 1.2rem; font-weight: bold; }
    .nav { display: flex; gap: 1.5rem; }
    .nav a { color: #ccc; text-decoration: none; font-size: 0.95rem; }
    .nav a.active, .nav a:hover { color: white; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .balance { font-weight: bold; color: #a5d6a7; }
    .phone { font-size: 0.85rem; color: #ccc; }
    .btn-logout {
      background: transparent;
      border: 1px solid #ccc;
      color: white;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-logout:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class HeaderComponent {
  walletService = inject(WalletApiService);
  auth = inject(AuthService);
}
