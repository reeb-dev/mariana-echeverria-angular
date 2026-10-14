import { Component, inject } from '@angular/core';
import { ToastService } from '../data/toast.service';

/** Zona de avisos: abajo en el centro, sobre cualquier pantalla (sitio y panel). */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-[95] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border-l-4 bg-forest-deep px-4 py-3 text-sm text-white shadow-card"
          [class.border-emerald-400]="toast.kind === 'success'"
          [class.border-red-400]="toast.kind === 'error'"
          [class.border-stone-warm]="toast.kind === 'info'"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        >
          @if (toast.kind === 'success') {
            <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-emerald-300" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          } @else if (toast.kind === 'error') {
            <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-red-300" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
          }
          <span class="min-w-0 flex-1">{{ toast.message }}</span>
          @if (toast.actionLabel) {
            <button
              type="button"
              class="shrink-0 rounded-lg border border-stone-warm/60 px-3 py-1.5 font-semibold text-stone-warm transition hover:bg-stone-warm/15"
              (click)="toasts.runAction(toast.id)"
            >
              {{ toast.actionLabel }}
            </button>
          }
          <button
            type="button"
            class="shrink-0 text-white/60 transition hover:text-white"
            (click)="toasts.dismiss(toast.id)"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  readonly toasts = inject(ToastService);
}
