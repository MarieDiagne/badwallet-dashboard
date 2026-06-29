import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="loader-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoaderComponent {
  visible = input<boolean>(false);
}
