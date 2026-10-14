import { Component, inject } from '@angular/core';
import { ToastService } from '../data/toast.service';

/** Zona de avisos del panel: abajo en el centro, sobre cualquier pantalla. */
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
          class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-forest-deep px-4 py-3 text-sm text-white shadow-card"
          role="status"
        >
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
