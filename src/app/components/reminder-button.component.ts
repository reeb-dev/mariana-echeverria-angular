import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../data/auth.service';
import { localIsoDate } from '../data/calculators';
import { RemindersStore } from '../data/crm-stores';

/** Botón «Recordar»: agrega un recordatorio con fecha, ligado a una consulta, tasación o contacto. */
@Component({
  selector: 'app-reminder-button',
  standalone: true,
  imports: [FormsModule],
  template: `
    <span class="relative inline-block">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition hover:border-forest"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-forest" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2 M5 3L2 6 M19 3l3 3" />
        </svg>
        {{ saved() ? 'Recordatorio creado' : 'Recordar' }}
      </button>
      @if (open()) {
        <form
          class="mer-card absolute left-0 z-30 mt-2 w-72 space-y-3 p-4"
          (submit)="save($event)"
          aria-label="Nuevo recordatorio"
        >
          <p class="text-sm font-semibold text-forest-deep">¿Cuándo querés que te lo recordemos?</p>
          <input
            class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
            name="rem-note"
            placeholder="Qué hay que hacer"
            [(ngModel)]="note"
            aria-label="Qué hay que hacer"
          />
          <input
            class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-forest"
            type="date"
            name="rem-date"
            [(ngModel)]="due"
            aria-label="Fecha"
          />
          <div class="flex gap-2">
            <button type="submit" class="h-10 flex-1 rounded-lg bg-forest-deep text-sm font-semibold text-stone-warm transition hover:bg-forest hover:text-white">
              Guardar
            </button>
            <button type="button" class="h-10 rounded-lg border border-border px-3 text-sm" (click)="open.set(false)">Cancelar</button>
          </div>
        </form>
      }
    </span>
  `,
})
export class ReminderButtonComponent {
  private readonly reminders = inject(RemindersStore);
  private readonly auth = inject(AuthService);

  /** A qué se refiere («Consulta de Carolina Pérez»); se muestra en el recordatorio. */
  readonly context = input.required<string>();
  /** Texto sugerido para el recordatorio. */
  readonly suggestion = input('Llamar y hacer seguimiento');

  readonly open = signal(false);
  readonly saved = signal(false);
  note = '';
  due = '';

  toggle() {
    if (!this.open()) {
      this.note = this.suggestion();
      this.due = localIsoDate(new Date(Date.now() + 86_400_000));
      this.saved.set(false);
    }
    this.open.set(!this.open());
  }

  save(event: Event) {
    event.preventDefault();
    if (!this.note.trim() || !this.due) return;
    this.reminders.save({
      id: this.reminders.newId('t'),
      text: this.note.trim(),
      due: this.due,
      done: false,
      context: this.context(),
      userId: this.auth.user()?.id,
      createdAt: new Date().toISOString(),
    });
    this.open.set(false);
    this.saved.set(true);
  }
}
