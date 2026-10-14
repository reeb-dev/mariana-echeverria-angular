import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InquiriesStore } from '../../data/inquiries-store';
import { listingQuality } from '../../data/listing-quality';
import { PropertyStore } from '../../data/property-store';
import { StatsStore } from '../../data/stats-store';
import { PanelShellComponent } from './panel-shell.component';

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  views: number;
  favorites: number;
  whatsapp: number;
  qr: number;
  inquiries: number;
  conversion: number | null;
  quality: number;
  insight: string;
};

@Component({
  selector: 'app-panel-stats',
  standalone: true,
  imports: [RouterLink, PanelShellComponent],
  template: `
    <app-panel-shell title="Estadísticas">
      <p class="max-w-3xl text-sm text-muted-foreground">
        Qué hace el público con cada propiedad: cuántas veces abrió la ficha, la guardó en favoritas, tocó WhatsApp o
        consultó. En esta demostración se cuenta lo que pasa en este navegador; con el servidor real suma a todos los visitantes.
      </p>

      <dl class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        @for (card of totals(); track card.label) {
          <div class="mer-card p-4">
            <dt class="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{{ card.label }}</dt>
            <dd class="mt-1 text-3xl font-semibold text-forest-deep tabular-nums">{{ card.value }}</dd>
          </div>
        }
      </dl>

      <div class="mt-8 flex items-center justify-between gap-3">
        <h2 class="font-display text-xl font-medium text-forest-deep">Por propiedad</h2>
        <select
          class="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          [value]="sortBy()"
          (change)="sortBy.set($any($event.target).value)"
          aria-label="Ordenar estadísticas"
        >
          <option value="views">Más vistas</option>
          <option value="inquiries">Más consultas</option>
          <option value="favorites">Más favoritas</option>
          <option value="quality">Menor calidad primero</option>
        </select>
      </div>

      <ul class="mt-4 space-y-3">
        @for (row of rows(); track row.id) {
          <li class="mer-card p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-medium text-forest-deep">{{ row.title }}</p>
                @if (!row.published) {
                  <p class="text-xs text-muted-foreground">No está publicada: no suma vistas del público.</p>
                }
              </div>
              <a [routerLink]="['/panel/propiedad', row.id]" class="text-sm text-forest underline underline-offset-2">
                Abrir
              </a>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-6">
              <div>
                <dt class="text-xs text-muted-foreground">Vistas</dt>
                <dd class="font-semibold tabular-nums">{{ row.views }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Favoritas</dt>
                <dd class="font-semibold tabular-nums">{{ row.favorites }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Clics a WhatsApp</dt>
                <dd class="font-semibold tabular-nums">{{ row.whatsapp }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Escaneos de cartel</dt>
                <dd class="font-semibold tabular-nums">{{ row.qr }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Consultas</dt>
                <dd class="font-semibold tabular-nums">{{ row.inquiries }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Calidad del aviso</dt>
                <dd class="font-semibold tabular-nums">{{ row.quality }}/100</dd>
              </div>
            </dl>
            @if (row.insight) {
              <p class="mt-3 rounded-lg bg-stone-warm/15 px-3 py-2 text-sm text-forest-deep">{{ row.insight }}</p>
            }
          </li>
        }
      </ul>
    </app-panel-shell>
  `,
})
export class PanelStatsComponent {
  private readonly properties = inject(PropertyStore);
  private readonly stats = inject(StatsStore);
  private readonly inquiries = inject(InquiriesStore);

  readonly sortBy = signal<'views' | 'inquiries' | 'favorites' | 'quality'>('views');

  private readonly baseRows = computed<Row[]>(() => {
    const allInquiries = this.inquiries.all();
    return this.properties.all().map((p) => {
      const s = this.stats.get(p.slug);
      const inquiries = allInquiries.filter((q) => q.propertySlug === p.slug).length;
      const quality = listingQuality(p).score;
      const conversion = s.views > 0 ? Math.round((inquiries / s.views) * 100) : null;
      let insight = '';
      if (s.views >= 5 && inquiries === 0) {
        insight = 'Tiene vistas pero ninguna consulta: revisá el precio, las fotos y la descripción.';
      } else if (s.views >= 5 && quality < 60) {
        insight = 'La calidad del aviso es baja para lo que se mira: completá lo que falta.';
      } else if (s.favorites >= 3 && inquiries === 0) {
        insight = 'Guardan la propiedad pero no consultan: probá destacarla o revisar el precio.';
      }
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        published: this.properties.statusOf(p) === 'publicada',
        views: s.views,
        favorites: s.favorites,
        whatsapp: s.whatsapp,
        qr: s.qr,
        inquiries,
        conversion,
        quality,
        insight,
      };
    });
  });

  readonly rows = computed(() => {
    const key = this.sortBy();
    return [...this.baseRows()].sort((a, b) => (key === 'quality' ? a.quality - b.quality : b[key] - a[key]));
  });

  readonly totals = computed(() => {
    const rows = this.baseRows();
    const sum = (k: 'views' | 'favorites' | 'whatsapp' | 'qr' | 'inquiries') => rows.reduce((n, r) => n + r[k], 0);
    return [
      { label: 'Vistas de fichas', value: sum('views') },
      { label: 'Favoritas', value: sum('favorites') },
      { label: 'Clics a WhatsApp', value: sum('whatsapp') },
      { label: 'Escaneos de cartel', value: sum('qr') },
      { label: 'Consultas', value: sum('inquiries') },
    ];
  });
}
