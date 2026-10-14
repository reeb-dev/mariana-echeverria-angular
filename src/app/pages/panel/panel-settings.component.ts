import { ConfirmService } from '../../data/confirm.service';
import { ZonesStore } from '../../data/zones-store';
import { ToastService } from '../../data/toast.service';
import { Component, inject, signal } from '@angular/core';
import { AppraisalsStore } from '../../data/appraisals-store';
import { InquiriesStore } from '../../data/inquiries-store';
import {
  CasesStore,
  ContactsStore,
  LeasesStore,
  RemindersStore,
  SavedSearchesStore,
  VisitsStore,
} from '../../data/crm-stores';
import { PropertyStore } from '../../data/property-store';
import { StatsStore } from '../../data/stats-store';
import { UsersStore } from '../../data/users-store';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-settings',
  standalone: true,
  imports: [PanelShellComponent],
  template: `
    <app-panel-shell title="Copias y ajustes">
      @if (notice(); as text) {
        <p class="mb-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-forest-deep" role="status">{{ text }}</p>
      }
      @if (store.storageError(); as error) {
        <p class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{{ error }}</p>
      }

      <section class="mer-card p-5">
        <h2 class="font-display text-lg font-medium text-forest-deep">Copia de seguridad de propiedades</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Descargá un archivo con todas las propiedades y sus fotos, o cargá una copia anterior. Cargar una copia reemplaza
          todo lo actual.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:border-forest"
            (click)="exportCopy()"
          >
            Descargar copia
          </button>
          <label
            class="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition hover:border-forest"
          >
            Cargar copia
            <input type="file" accept="application/json" class="sr-only" (change)="importCopy($event)" />
          </label>
        </div>
      </section>

      <section class="mt-6 rounded-xl border border-red-200 bg-background p-5">
        <h2 class="font-display text-lg font-medium text-red-800">Zona de cuidado</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Vuelve las propiedades, usuarios y consultas a los datos de ejemplo. Los cambios hechos se pierden.
        </p>
        <button
          type="button"
          class="mt-4 h-10 rounded-lg border border-red-300 bg-background px-4 text-sm font-medium text-red-700 transition hover:border-red-500"
          (click)="resetDemo()"
        >
          Volver a los datos de ejemplo
        </button>
      </section>
    </app-panel-shell>
  `,
})
export class PanelSettingsComponent {
  protected readonly dialog = inject(ConfirmService);
  protected readonly toast = inject(ToastService);
  readonly store = inject(PropertyStore);
  private readonly users = inject(UsersStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly stats = inject(StatsStore);
  private readonly appraisals = inject(AppraisalsStore);
  private readonly crm = [
    inject(ContactsStore),
    inject(VisitsStore),
    inject(SavedSearchesStore),
    inject(LeasesStore),
    inject(CasesStore),
    inject(RemindersStore),
    inject(ZonesStore),
  ];
  readonly notice = signal<string | null>(null);

  exportCopy() {
    const blob = new Blob([this.store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `propiedades-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('Copia de seguridad descargada.');
  }

  async importCopy(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!(await this.dialog.confirm({ title: '¿Cargar esta copia?', message: 'Reemplaza todas las propiedades actuales.', confirmLabel: 'Cargar copia', danger: true }))) return;
    const error = this.store.importJson(await file.text());
    this.notice.set(error ?? 'Copia cargada correctamente.');
    if (error) this.toast.error(error);
    else this.toast.success('Copia cargada correctamente.');
  }

  async resetDemo() {
    if (!(await this.dialog.confirm({ title: '¿Volver a los datos de ejemplo?', message: 'Se pierden los cambios que hiciste.', confirmLabel: 'Restaurar', danger: true }))) return;
    this.store.reset();
    this.users.reset();
    this.inquiries.reset();
    this.stats.reset();
    this.appraisals.reset();
    this.crm.forEach((store) => store.reset());
    this.notice.set('Datos de ejemplo restaurados.');
    this.toast.success('Datos de ejemplo restaurados.');
  }
}
