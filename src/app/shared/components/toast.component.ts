import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notification.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <span>{{ toast.message }}</span>
          <button (click)="notification.remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      min-width: 280px;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .toast button {
      background: none;
      border: none;
      cursor: pointer;
      margin-left: 1rem;
      font-size: 1rem;
    }
    .toast-success { background: #d4edda; color: #155724; }
    .toast-error   { background: #f8d7da; color: #721c24; }
    .toast-info    { background: #d1ecf1; color: #0c5460; }
  `]
})
export class ToastComponent {
  notification = inject(NotificationService);
}
