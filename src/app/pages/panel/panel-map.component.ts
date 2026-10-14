import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertiesMapComponent } from '../../components/properties-map.component';
import { PropertyStore } from '../../data/property-store';
import { STATUS_LABELS, type PropertyStatus } from '../../data/properties';
import { PanelShellComponent } from './panel-shell.component';

@Component({
  selector: 'app-panel-map',
  standalone: true,
  imports: [FormsModule, PropertiesMapComponent, PanelShellComponent],
  template: `
    <app-panel-shell title="Mapa de la cartera">
      <div class="flex flex-wrap items-center gap-3">
        <select
          class="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          [ngModel]="status()"
          (ngModelChange)="status.set($event)"
          aria-label="Filtrar por estado"
        >
          <option value="todas">Todos los estados</option>
          @for (s of statuses; track s.id) {
            <option [value]="s.id">{{ s.label }}</option>
          }
        </select>
        <p class="text-sm text-muted-foreground">
          {{ located().length }} en el mapa
          @if (missing() > 0) { · <strong>{{ missing() }} sin ubicación</strong>: se carga en cada propiedad }
        </p>
        <p class="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-forest"></span>Venta</span>
          <span><span class="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-forest-deep"></span>Alquiler</span>
        </p>
      </div>
      <div class="mt-4 h-[32rem] overflow-hidden rounded-xl border border-border">
        <app-properties-map [properties]="located()" target="panel" />
      </div>
    </app-panel-shell>
  `,
})
export class PanelMapComponent {
  private readonly store = inject(PropertyStore);
  readonly statuses = (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((id) => ({ id, label: STATUS_LABELS[id] }));
  readonly status = signal<'todas' | PropertyStatus>('todas');

  private readonly filtered = computed(() =>
    this.store.all().filter((p) => this.status() === 'todas' || this.store.statusOf(p) === this.status())
  );
  readonly located = computed(() => this.filtered().filter((p) => p.lat != null && p.lng != null));
  readonly missing = computed(() => this.filtered().length - this.located().length);
}
