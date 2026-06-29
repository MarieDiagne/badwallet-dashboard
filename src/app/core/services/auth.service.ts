import { Injectable, signal } from '@angular/core';

export type Role = 'client' | 'agent' | null;

export interface CurrentUser {
  phone: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<CurrentUser | null>(null);

  login(phone: string, role: Role): void {
    this.user.set({ phone, role });
  }

  logout(): void {
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  isAgent(): boolean {
    return this.user()?.role === 'agent';
  }

  getPhone(): string {
    return this.user()?.phone ?? '';
  }

  getRole(): Role {
    return this.user()?.role ?? null;
  }
}
