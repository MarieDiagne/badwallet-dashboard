import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastComponent],
  template: `
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-toast />
  `,
  styles: [`
    .main-content {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
  `]
})
export class App {}
