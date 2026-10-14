import { Component, ElementRef, HostListener, Injectable, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppraisalsStore } from '../../data/appraisals-store';
import { AuthService } from '../../data/auth.service';
import { CasesStore, ContactsStore, LeasesStore } from '../../data/crm-stores';
import { InquiriesStore } from '../../data/inquiries-store';
import { PropertyStore } from '../../data/property-store';
import { ZonesStore } from '../../data/zones-store';

type Hit = { group: string; title: string; detail: string; url: string; query?: Record<string, string> };

/** Sin tildes y en minúsculas, para que «tasacion» encuentre «Tasación». */
function norm(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Buscador global del panel: se abre con Ctrl+K (o Cmd+K) y encuentra propiedades, contactos, consultas y más. */
/** Estado compartido del buscador: lo abre el botón de la barra lateral y lo muestra la ventana. */
@Injectable({ providedIn: 'root' })
export class PanelSearchService {
  readonly open = signal(false);

  show() {
    this.open.set(true);
  }

  hide() {
    this.open.set(false);
  }
}

/** Botón de la barra lateral que abre el buscador (también con Ctrl+K). */
@Component({
  selector: 'app-panel-search',
  standalone: true,
  template: `
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
      [class.lg:justify-center]="compact()"
      (click)="search.show()"
      aria-label="Buscar en el panel"
      aria-keyshortcuts="Control+K Meta+K"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" />
      </svg>
      <span class="min-w-0 flex-1 text-left" [class.lg:hidden]="compact()">Buscar…</span>
      <kbd class="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/60" [class.lg:hidden]="compact()">Ctrl K</kbd>
    </button>
  `,
})
export class PanelSearchComponent {
  readonly search = inject(PanelSearchService);
  readonly compact = input(false);
}

@Component({
  selector: 'app-panel-search-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[90] flex items-start justify-center bg-black/55 px-4 pt-[12vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el panel"
        (click)="hide()"
      >
        <div class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-card" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 border-b border-border px-4">
            <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3" />
            </svg>
            <input
              #input
              class="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Propiedad, contacto, consulta, expediente…"
              autocomplete="off"
              [ngModel]="query()"
              (ngModelChange)="query.set($event); active.set(0)"
              (keydown)="onKey($event)"
              aria-label="Texto a buscar"
            />
            <kbd class="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
          </div>

          <ul class="max-h-[50vh] overflow-y-auto p-2" role="listbox">
            @for (hit of results(); track hit.url + hit.title + $index; let i = $index) {
              @if (i === 0 || results()[i - 1].group !== hit.group) {
                <li class="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase" role="presentation">
                  {{ hit.group }}
                </li>
              }
              <li role="option" [attr.aria-selected]="i === active()">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition"
                  [class]="i === active() ? 'bg-mist' : 'hover:bg-mist/70'"
                  (mouseenter)="active.set(i)"
                  (click)="go(hit)"
                >
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-forest-deep">{{ hit.title }}</span>
                    <span class="block truncate text-xs text-muted-foreground">{{ hit.detail }}</span>
                  </span>
                  @if (i === active()) {
                    <span class="shrink-0 text-xs text-muted-foreground">Enter ↵</span>
                  }
                </button>
              </li>
            } @empty {
              <li class="px-3 py-8 text-center text-sm text-muted-foreground">No encontramos nada para «{{ query() }}».</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class PanelSearchDialogComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly properties = inject(PropertyStore);
  private readonly contacts = inject(ContactsStore);
  private readonly inquiries = inject(InquiriesStore);
  private readonly appraisals = inject(AppraisalsStore);
  private readonly leases = inject(LeasesStore);
  private readonly cases = inject(CasesStore);
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  private readonly service = inject(PanelSearchService);
  readonly open = this.service.open;
  readonly query = signal('');
  readonly active = signal(0);

  /** Atajos y accesos que siempre están disponibles (según permisos). */
  private readonly zonesStore = inject(ZonesStore);

  private readonly shortcuts = computed<Hit[]>(() => {
    const items: Hit[] = [];
    if (this.auth.can('propiedades.crear')) {
      items.push({ group: 'Ir a', title: 'Nueva propiedad', detail: 'Cargar una propiedad', url: '/panel/propiedad/nueva' });
    }
    const sections: [string, string, string, boolean][] = [
      ['Resumen', '/panel', 'Inicio del panel', true],
      ['Propiedades', '/panel/propiedades', 'Listado y estados', true],
      ['Mapa de la cartera', '/panel/mapa', 'Propiedades en el mapa', true],
      ['Consultas', '/panel/consultas', 'Consultas del sitio', true],
      ['Tasaciones', '/panel/tasaciones', 'Pedidos de tasación', true],
      ['Visitas', '/panel/visitas', 'Agenda y pedidos de visita', this.auth.can('contactos.gestionar')],
      ['Contactos', '/panel/contactos', 'Compradores y propietarios', this.auth.can('contactos.gestionar')],
      ['Contratos', '/panel/contratos', 'Alquileres y arrendamientos', this.auth.can('contratos.gestionar')],
      ['Expedientes', '/panel/expedientes', 'Trámites legales', this.auth.can('expedientes.gestionar')],
      ['Documentos', '/panel/documentos', 'Modelos de contratos', this.auth.can('documentos.generar')],
      ['Zonas', '/panel/zonas', 'Agregar zonas y armar la home por zona', true],
      ['Destacadas', '/panel/destacadas', 'Las que se ven primero en la web', true],
      ['Búsquedas guardadas', '/panel/busquedas', 'Alertas de compradores', this.auth.can('contactos.gestionar')],
      ['Nueva visita', '/panel/visitas', 'Agendar una visita', this.auth.can('contactos.gestionar')],
      ['Nuevo contacto', '/panel/contactos', 'Cargar un comprador, propietario o inquilino', this.auth.can('contactos.gestionar')],
      ['Estadísticas', '/panel/estadisticas', 'Vistas, favoritas y consultas', true],
    ];
    for (const [title, url, detail, allowed] of sections) {
      if (allowed) items.push({ group: 'Ir a', title, detail, url });
    }
    return items;
  });

  /** Todo lo que se puede encontrar, armado con lo que el usuario puede ver. */
  private readonly index = computed<{ hit: Hit; text: string }[]>(() => {
    const rows: { hit: Hit; text: string }[] = [];
    for (const p of this.properties.all()) {
      rows.push({
        hit: { group: 'Propiedades', title: p.title, detail: `${p.location} · ${p.priceLabel}`, url: `/panel/propiedad/${p.id}` },
        text: `${p.title} ${p.location} ${p.type} ${p.operation} ${p.priceLabel}`,
      });
    }
    for (const z of this.zonesStore.options()) {
      rows.push({
        hit: { group: 'Zonas', title: z.name, detail: `${this.zonesStore.usage(z.id)} propiedades`, url: '/panel/zonas' },
        text: `${z.name} zona`,
      });
    }
    if (this.auth.can('contactos.gestionar')) {
      for (const c of this.contacts.all()) {
        rows.push({
          hit: { group: 'Contactos', title: c.name, detail: [c.phone, c.email].filter(Boolean).join(' · '), url: '/panel/contactos', query: { id: c.id } },
          text: `${c.name} ${c.phone} ${c.email}`,
        });
      }
    }
    for (const q of this.inquiries.all()) {
      rows.push({
        hit: { group: 'Consultas', title: q.name, detail: q.message ?? q.propertyTitle ?? q.phone, url: '/panel/consultas' },
        text: `${q.name} ${q.phone} ${q.email} ${q.message ?? ''} ${q.propertyTitle ?? ''}`,
      });
    }
    for (const a of this.appraisals.all()) {
      rows.push({
        hit: { group: 'Tasaciones', title: a.name, detail: `${a.propertyType} en ${a.address}`, url: '/panel/tasaciones' },
        text: `${a.name} ${a.phone} ${a.address} ${a.propertyType}`,
      });
    }
    if (this.auth.can('contratos.gestionar')) {
      for (const l of this.leases.all()) {
        rows.push({
          hit: { group: 'Contratos', title: l.propertyLabel, detail: `${l.tenantName} · vence ${l.endDate}`, url: '/panel/contratos' },
          text: `${l.propertyLabel} ${l.tenantName} ${l.ownerName}`,
        });
      }
    }
    if (this.auth.can('expedientes.gestionar')) {
      for (const c of this.cases.all()) {
        rows.push({
          hit: { group: 'Expedientes', title: c.title, detail: c.reference ?? c.kind, url: '/panel/expedientes' },
          text: `${c.title} ${c.reference ?? ''} ${c.kind}`,
        });
      }
    }
    return rows;
  });

  readonly results = computed<Hit[]>(() => {
    const tokens = norm(this.query()).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return this.shortcuts().slice(0, 8);
    const found = this.index()
      .filter((row) => {
        const text = norm(row.text);
        return tokens.every((t) => text.includes(t));
      })
      .map((row) => row.hit);
    const shortcuts = this.shortcuts().filter((s) => {
      const text = norm(`${s.title} ${s.detail}`);
      return tokens.every((t) => text.includes(t));
    });
    return [...found, ...shortcuts].slice(0, 20);
  });

  @HostListener('window:keydown', ['$event'])
  onGlobalKey(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.open()) this.hide();
      else this.show();
    }
  }

  show() {
    this.query.set('');
    this.active.set(0);
    this.open.set(true);
    setTimeout(() => this.inputEl()?.nativeElement.focus(), 0);
  }

  hide() {
    this.open.set(false);
  }

  onKey(event: KeyboardEvent) {
    const count = this.results().length;
    if (event.key === 'Escape') {
      this.hide();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.set(count === 0 ? 0 : (this.active() + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.set(count === 0 ? 0 : (this.active() - 1 + count) % count);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const hit = this.results()[this.active()];
      if (hit) this.go(hit);
    }
  }

  go(hit: Hit) {
    this.hide();
    void this.router.navigate([hit.url], hit.query ? { queryParams: hit.query } : undefined);
  }
}
