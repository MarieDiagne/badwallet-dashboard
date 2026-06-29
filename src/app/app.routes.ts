import { Routes } from '@angular/router';
import { clientGuard, agentGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/client/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'transfer',
    loadComponent: () => import('./features/client/transfer.component').then(m => m.TransferComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'bills',
    loadComponent: () => import('./features/client/bills.component').then(m => m.BillsComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'bills/current',
    loadComponent: () => import('./features/client/bills.component').then(m => m.BillsComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/client/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'admin/wallets',
    loadComponent: () => import('./features/agent/wallet-list.component').then(m => m.WalletListComponent),
    canActivate: [agentGuard]
  },
  {
    path: 'admin/wallets/new',
    loadComponent: () => import('./features/agent/create-wallet.component').then(m => m.CreateWalletComponent),
    canActivate: [agentGuard]
  },
  {
    path: 'admin/wallets/search',
    loadComponent: () => import('./features/agent/search-wallet.component').then(m => m.SearchWalletComponent),
    canActivate: [agentGuard]
  },
  {
    path: 'admin/depot-retrait',
    loadComponent: () => import('./features/agent/depot-retrait.component').then(m => m.DepotRetraitComponent),
    canActivate: [agentGuard]
  },
  { path: '**', redirectTo: 'login' }
];
