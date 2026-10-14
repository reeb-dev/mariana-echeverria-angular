import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmService } from '../data/confirm.service';

/** Ventana de confirmación de la aplicación (se monta una sola vez, en la raíz). */
@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (service.current(); as dialog) {
      <div class="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center" (keydown.escape)="cancel()">
        <button type="button" class="absolute inset-0 bg-[#1c1612]/55 backdrop-blur-[2px]" aria-label="Cancelar" (click)="cancel()"></button>
        <form
          class="relative w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-card"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="'dlg-title-' + dialog.id"
          (submit)="accept($event)"
        >
          <h2 [id]="'dlg-title-' + dialog.id" class="font-display text-xl font-medium text-forest-deep">{{ dialog.title }}</h2>
          @if (dialog.message) {
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ dialog.message }}</p>
          }
          @if (dialog.input; as input) {
            <label class="mt-4 block">
              <span class="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">{{ input.label }}</span>
              <input
                #field
                class="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-forest"
                [type]="input.type ?? 'text'"
                name="dialog-value"
                [placeholder]="input.placeholder ?? ''"
                autocomplete="off"
                [ngModel]="value()"
                (ngModelChange)="value.set($event)"
              />
            </label>
            @if (error()) {
              <p class="mt-2 text-sm text-red-700" role="alert">{{ error() }}</p>
            }
          }
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="h-11 rounded-lg border border-border px-5 text-sm font-medium transition hover:border-forest"
              (click)="cancel()"
            >
              {{ dialog.cancelLabel ?? 'Cancelar' }}
            </button>
            <button
              #primary
              type="submit"
              class="h-11 rounded-lg px-5 text-sm font-semibold text-white transition"
              [class.bg-red-700]="dialog.danger"
              [class.hover:bg-red-800]="dialog.danger"
              [class.bg-forest-deep]="!dialog.danger"
              [class.hover:bg-forest]="!dialog.danger"
            >
              {{ dialog.confirmLabel ?? 'Aceptar' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ConfirmHostComponent {
  readonly service = inject(ConfirmService);
  readonly value = signal('');
  readonly error = signal<string | null>(null);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly primary = viewChild<ElementRef<HTMLButtonElement>>('primary');

  constructor() {
    // Al abrir: limpia el texto y deja el foco en el campo o, si no hay, en el botón principal.
    effect(() => {
      const dialog = this.service.current();
      if (!dialog) return;
      this.value.set('');
      this.error.set(null);
      setTimeout(() => (this.field() ?? this.primary())?.nativeElement.focus(), 0);
    });
  }

  accept(event: Event) {
    event.preventDefault();
    const dialog = this.service.current();
    if (!dialog) return;
    if (dialog.input) {
      const text = this.value();
      if (dialog.input.minLength && text.length < dialog.input.minLength) {
        this.error.set(`Tienen que ser ${dialog.input.minLength} caracteres o más.`);
        return;
      }
      this.service.close(text);
    } else {
      this.service.close(true);
    }
  }

  cancel() {
    this.service.close(dialog_cancel_value(this.service));
  }
}

function dialog_cancel_value(service: ConfirmService): boolean | null {
  return service.current()?.input ? null : false;
}
