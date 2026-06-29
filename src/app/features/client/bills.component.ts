import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BillingApiService } from '../../core/services/billing-api.service';
import { WalletApiService } from '../../core/services/wallet-api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Facture } from '../../core/models/facture.model';
import { LoaderComponent } from '../../shared/components/loader.component';
import { XofPipe } from '../../shared/pipes/xof.pipe';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, XofPipe],
  template: `
    <div class="page">
      <h1>Mes Factures</h1>

      <!-- Filtres -->
      <div class="filters">
        <select (change)="onFilterChange($event)" class="select">
          <option value="">Tous les services</option>
          <option value="ISM">ISM</option>
          <option value="WOYAFAL">WOYAFAL</option>
        </select>
        <button (click)="loadBills()" class="btn btn-outline">Actualiser</button>
      </div>

      <app-loader [visible]="loading()" />

      @if (!loading()) {
        @if (factures().length === 0) {
          <div class="empty">Aucune facture impayée ce mois-ci.</div>
        } @else {
          <div class="bills-header">
            <label class="check-all">
              <input type="checkbox" (change)="toggleAll($event)" /> Tout sélectionner
            </label>
            <span class="total-selected">
              {{ selected().length }} facture(s) — Total : {{ totalSelected() | xof }}
            </span>
          </div>

          <div class="bills-list">
            @for (facture of factures(); track facture.id) {
              <div class="bill-card" [class.selected]="isSelected(facture.reference)">
                <label class="bill-check">
                  <input
                    type="checkbox"
                    [checked]="isSelected(facture.reference)"
                    (change)="toggleSelect(facture)"
                  />
                </label>
                <div class="bill-info">
                  <span class="bill-ref">{{ facture.reference }}</span>
                  <span class="bill-service badge-{{ facture.serviceName | lowercase }}">
                    {{ facture.serviceName }}
                  </span>
                  <span class="bill-month">{{ facture.mois | date:'MMMM yyyy' }}</span>
                </div>
                <div class="bill-amount">{{ facture.montant | xof }}</div>
              </div>
            }
          </div>

          <div class="pay-actions">
            <button
              class="btn btn-primary"
              [disabled]="selected().length === 0 || paying()"
              (click)="paySelected()"
            >
              Payer {{ selected().length }} facture(s) — {{ totalSelected() | xof }}
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; }
    .select { padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; }
    .empty { text-align: center; color: #666; padding: 3rem; background: white; border-radius: 8px; }
    .bills-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .check-all { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 500; }
    .total-selected { font-size: 0.9rem; color: #666; }
    .bills-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .bill-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 2px solid transparent;
      transition: border-color 0.15s;
    }
    .bill-card.selected { border-color: #1a237e; }
    .bill-info { flex: 1; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .bill-ref { font-weight: 500; font-size: 0.95rem; }
    .bill-service { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .badge-ism { background: #e3f2fd; color: #1565c0; }
    .badge-woyafal { background: #fff3e0; color: #e65100; }
    .bill-month { font-size: 0.85rem; color: #666; }
    .bill-amount { font-weight: bold; color: #1a237e; font-size: 1rem; }
    .pay-actions { display: flex; justify-content: flex-end; }
    .btn { padding: 0.6rem 1.5rem; border-radius: 4px; border: none; cursor: pointer; font-size: 0.9rem; }
    .btn-primary { background: #1a237e; color: white; }
    .btn-outline { background: white; border: 1px solid #ccc; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class BillsComponent implements OnInit {
  private billingService = inject(BillingApiService);
  private walletService = inject(WalletApiService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);

  loading = signal(false);
  paying = signal(false);
  factures = signal<Facture[]>([]);
  selected = signal<string[]>([]);
  currentFilter = signal('');

  walletCode = signal('');

  ngOnInit(): void {
    this.walletService.getWalletByPhone(this.auth.getPhone()).subscribe(w => {
      this.walletCode.set(w.code);
      this.loadBills();
    });
  }

  loadBills(): void {
    this.loading.set(true);
    this.selected.set([]);
    const unite = this.currentFilter() || undefined;
    this.billingService.getCurrentUnpaid(this.walletCode(), unite).subscribe({
      next: f => { this.factures.set(f); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(event: Event): void {
    this.currentFilter.set((event.target as HTMLSelectElement).value);
    this.loadBills();
  }

  isSelected(ref: string): boolean {
    return this.selected().includes(ref);
  }

  toggleSelect(facture: Facture): void {
    this.selected.update(list =>
      list.includes(facture.reference)
        ? list.filter(r => r !== facture.reference)
        : [...list, facture.reference]
    );
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected.set(checked ? this.factures().map(f => f.reference) : []);
  }

  totalSelected(): number {
    return this.factures()
      .filter(f => this.selected().includes(f.reference))
      .reduce((sum, f) => sum + f.montant, 0);
  }

  paySelected(): void {
    if (this.selected().length === 0) return;
    this.paying.set(true);

    const serviceName = this.factures()
      .find(f => this.selected().includes(f.reference))?.serviceName ?? 'ISM';

    this.walletService.paySpecificFactures({
      phoneNumber: this.auth.getPhone(),
      serviceName,
      factureReferences: this.selected()
    }).subscribe({
      next: res => {
        this.notification.success(res.message);
        this.walletService.getBalance(this.auth.getPhone()).subscribe();
        this.paying.set(false);
        this.loadBills();
      },
      error: () => this.paying.set(false)
    });
  }
}
