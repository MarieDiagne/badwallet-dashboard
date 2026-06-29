import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Facture } from '../models/facture.model';

@Injectable({ providedIn: 'root' })
export class BillingApiService {

  private readonly BASE = `${environment.apiUrl}/api/external/factures`;

  constructor(private http: HttpClient) {}

  getCurrentUnpaid(walletCode: string, unite?: string): Observable<Facture[]> {
    const url = unite
      ? `${this.BASE}/${walletCode}/current?unite=${unite}`
      : `${this.BASE}/${walletCode}/current`;
    return this.http.get<Facture[]>(url);
  }

  getByPeriod(walletCode: string, debut: string, fin: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(
      `${this.BASE}/${walletCode}/periode?debut=${debut}&fin=${fin}`
    );
  }
}
