import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Wallet, WalletPage, BalanceResponse, Transaction,
  CreateWalletDto, DepositDto, WithdrawDto, TransferDto,
  PayBillDto, PayFacturesDto
} from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletApiService {

  private readonly BASE = `${environment.apiUrl}/api/wallets`;

  readonly currentBalance = signal<number>(0);
  readonly currentPhone = signal<string>('');

  constructor(private http: HttpClient) {}

  getWallets(page = 0, size = 10): Observable<WalletPage> {
    return this.http.get<WalletPage>(`${this.BASE}?page=${page}&size=${size}`);
  }

  getWalletByPhone(phone: string): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.BASE}/${phone}`);
  }

  getBalance(phone: string): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.BASE}/${phone}/balance`).pipe(
      tap(res => this.currentBalance.set(res.balance))
    );
  }

  getTransactions(phone: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.BASE}/${phone}/transactions`);
  }

  createWallet(dto: CreateWalletDto): Observable<Wallet> {
    return this.http.post<Wallet>(this.BASE, dto);
  }

  deposit(walletId: number, dto: DepositDto): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.BASE}/${walletId}/deposit`, dto).pipe(
      tap(w => this.currentBalance.set(w.balance))
    );
  }

  withdraw(dto: WithdrawDto): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.BASE}/withdraw`, dto).pipe(
      tap(w => this.currentBalance.set(w.balance))
    );
  }

  transfer(dto: TransferDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/transfer`, dto);
  }

  payCurrentBill(dto: PayBillDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/pay`, dto);
  }

  paySpecificFactures(dto: PayFacturesDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/pay-factures`, dto);
  }
}
