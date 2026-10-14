import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { ToastHostComponent } from '../../components/toast-host.component';
import { PanelSearchComponent, PanelSearchDialogComponent } from './panel-search.component';
import { AuthService } from '../../data/auth.service';
import { AppraisalsStore } from '../../data/appraisals-store';
import { VisitsStore } from '../../data/crm-stores';
import { InquiriesStore } from '../../data/inquiries-store';
import { ROLE_LABELS, type Permission } from '../../data/permissions';
import { CONTACT } from '../../data/properties';
import { AssetUrlPipe } from '../../utils/asset-url';

type NavItem = {
  path: string;
  /** Encabezado de la sección donde empieza este grupo. */
  group?: string;
  label: string;
  /** Trazos de un ícono 24x24 (stroke). */
  icon: string;
  exact?: boolean;
  permission?: Permission;
  badge?: 'consultas' | 'tasaciones' | 'visitas';
};

const COLLAPSE_KEY = 'mer.panel.sidebar.collapsed';

/** Marco del panel: barra lateral (en el celular, un menú desplegable), usuario actual y aviso de demo. */
@Component({
  selector: 'app-panel-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PanelSearchComponent, PanelSearchDialogComponent, ToastHostComponent, AssetUrlPipe],
  template: `
    <div class="min-h-screen bg-mist/60 lg:flex">
      <!-- Barra superior (celular) -->
      <header class="sticky top-0 z-30 flex items-center justify-between gap-3 bg-forest-deep px-4 py-3 text-white lg:hidden">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20"
          (click)="drawerOpen.set(true)"
          aria-label="Abrir el menú"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <a routerLink="/panel" class="flex items-center gap-2" [attr.aria-label]="'Panel de ' + contact.brand"><img [src]="'/about/logo-watermark.png' | assetUrl" alt="" class="h-6 w-auto" /><span class="text-xs tracking-[0.14em] text-stone-warm uppercase">Panel</span></a>
        <span class="w-10"></span>
      </header>

      <!-- Fondo del menú desplegable (celular) -->
      @if (drawerOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          (click)="drawerOpen.set(false)"
          aria-label="Cerrar el menú"
        ></button>
      }

      <!-- Barra lateral -->
      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-forest-deep text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:transition-[width]"
        [class.-translate-x-full]="!drawerOpen()"
        [class]="collapsed() ? 'lg:w-[4.5rem]' : 'lg:w-64'"
        aria-label="Menú del panel"
      >
        <div class="flex items-center justify-between gap-2 px-4 py-5">
          <a routerLink="/panel" class="min-w-0" [class.lg:hidden]="collapsed()">
            <img [src]="'/about/logo-watermark.png' | assetUrl" [alt]="contact.brand" class="block h-8 w-auto max-w-full" />
            <span class="mt-1 block text-xs tracking-[0.14em] text-stone-warm uppercase">Panel</span>
          </a>
          <button
            type="button"
            class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white/80 transition hover:bg-white/10 lg:flex"
            [class.mx-auto]="collapsed()"
            (click)="toggleCollapsed()"
            [attr.aria-label]="collapsed() ? 'Expandir la barra lateral' : 'Contraer la barra lateral'"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 transition" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 lg:hidden"
            (click)="drawerOpen.set(false)"
            aria-label="Cerrar el menú"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div class="px-3 pb-2">
          <app-panel-search [compact]="collapsed()" />
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Secciones del panel">
          @for (item of items(); track item.path) {
            @if (item.header) {
              <button
                type="button"
                class="flex w-full items-center justify-between px-3 pt-4 pb-1 text-left text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase transition hover:text-white/75"
                [class.lg:hidden]="collapsed()"
                [attr.aria-expanded]="isOpen(item.groupName)"
                (click)="toggleGroup(item.groupName)"
              >
                {{ item.header }}
                <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 transition" [class.-rotate-90]="!isOpen(item.groupName)" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            }
            @if (shown(item)) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-white/15 text-stone-warm"
              [routerLinkActiveOptions]="{ exact: !!item.exact }"
              class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              [class.lg:justify-center]="collapsed()"
              [attr.title]="collapsed() ? item.label : null"
              (click)="drawerOpen.set(false)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="item.icon" />
              </svg>
              <span class="min-w-0 flex-1 truncate" [class.lg:hidden]="collapsed()">{{ item.label }}</span>
              @if (item.badge === 'visitas' && visitsToConfirm() > 0) {
                <span
                  class="rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white"
                  [class.lg:hidden]="collapsed()"
                >
                  {{ visitsToConfirm() }}
                </span>
              }
              @if (item.badge === 'tasaciones' && appraisals.newCount() > 0) {
                <span
                  class="rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white"
                  [class.lg:hidden]="collapsed()"
                >
                  {{ appraisals.newCount() }}
                </span>
              }
              @if (item.badge === 'consultas' && inquiries.newCount() > 0) {
                <span
                  class="rounded-full bg-forest px-1.5 py-0.5 text-[11px] font-semibold text-white"
                  [class.lg:hidden]="collapsed()"
                >
                  {{ inquiries.newCount() }}
                </span>
              }
            </a>
            }
          }
        </nav>

        <div class="border-t border-white/10 p-3">
          @if (auth.user(); as user) {
            <div class="flex items-center gap-3 rounded-lg px-2 py-2" [class.lg:justify-center]="collapsed()">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-warm text-sm font-semibold text-forest-deep"
                [attr.title]="collapsed() ? user.name : null"
              >
                {{ initials(user.name) }}
              </span>
              <span class="min-w-0" [class.lg:hidden]="collapsed()">
                <span class="block truncate text-sm font-medium">{{ user.name }}</span>
                <span class="block text-xs text-white/60">{{ roleLabels[user.role] }}</span>
              </span>
            </div>
          }
          <div class="mt-2 grid gap-1" [class.lg:hidden]="collapsed()">
            <a routerLink="/" class="rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white">
              Ver el sitio →
            </a>
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              (click)="auth.logout()"
            >
              Salir
            </button>
          </div>
          @if (collapsed()) {
            <button
              type="button"
              class="mt-2 hidden h-9 w-full items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white lg:flex"
              (click)="auth.logout()"
              aria-label="Salir"
              title="Salir"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" /></svg>
            </button>
          }
        </div>
      </aside>

      <!-- Buscador global (fuera de la barra para que ocupe toda la pantalla) -->
      <app-panel-search-dialog />
      <app-toast-host />

      <!-- Contenido -->
      <div class="min-w-0 flex-1">
        <div class="border-b border-stone-warm/40 bg-stone-warm/20">
          <p class="px-5 py-2 text-xs text-forest-deep md:px-8">
            <strong>Versión de demostración:</strong> los cambios se guardan solo en este navegador. Con el servidor real,
            se guardan en la base de datos y se ven en el sitio desde cualquier dispositivo.
          </p>
        </div>
        <main class="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <h1 class="font-display text-2xl font-medium text-forest-deep md:text-3xl">{{ title() }}</h1>
          <div class="mt-6">
            <ng-content />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class PanelShellComponent {
  readonly title = input.required<string>();
  readonly contact = CONTACT;
  readonly auth = inject(AuthService);
  readonly inquiries = inject(InquiriesStore);
  readonly appraisals = inject(AppraisalsStore);
  private readonly visitsStore = inject(VisitsStore);
  /** Visitas que pidieron desde el sitio y todavía hay que confirmar. */
  readonly visitsToConfirm = computed(() => this.visitsStore.all().filter((v) => v.status === 'solicitada').length);
  readonly roleLabels = ROLE_LABELS;

  readonly drawerOpen = signal(false);
  readonly collapsed = signal(this.readCollapsed());

  private readonly allItems: NavItem[] = [
    { path: '/panel', label: 'Resumen', exact: true, icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },

    { path: '/panel/propiedades', group: 'Inmuebles', label: 'Propiedades', icon: 'M3 11l9-8 9 8 M5 10v10h14V10' },
    { path: '/panel/mapa', label: 'Mapa', icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4' },
    {
      path: '/panel/destacadas',
      label: 'Destacadas',
      icon: 'M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z',
    },

    {
      path: '/panel/consultas',
      group: 'Clientes',
      label: 'Consultas',
      badge: 'consultas',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    },
    {
      path: '/panel/tasaciones',
      label: 'Tasaciones',
      badge: 'tasaciones',
      icon: 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9',
    },
    {
      path: '/panel/contactos',
      label: 'Contactos',
      permission: 'contactos.gestionar',
      icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.9',
    },
    {
      path: '/panel/visitas',
      label: 'Visitas',
      badge: 'visitas',
      permission: 'contactos.gestionar',
      icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    },
    {
      path: '/panel/busquedas',
      label: 'Búsquedas',
      permission: 'contactos.gestionar',
      icon: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
    },

    {
      path: '/panel/contratos',
      group: 'Gestión',
      label: 'Contratos',
      permission: 'contratos.gestionar',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5',
    },
    {
      path: '/panel/documentos',
      label: 'Documentos',
      permission: 'documentos.generar',
      icon: 'M4 4h12l4 4v12H4z M8 12h8 M8 16h8 M8 8h4',
    },
    {
      path: '/panel/expedientes',
      label: 'Expedientes',
      permission: 'expedientes.gestionar',
      icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    },
    {
      path: '/calculadoras',
      label: 'Calculadoras',
      icon: 'M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M8 6h8 M8 11h2 M14 11h2 M8 15h2 M14 15h2 M8 19h2 M14 19h2',
    },

    {
      path: '/panel/estadisticas',
      group: 'Sistema',
      label: 'Estadísticas',
      icon: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
    },
    {
      path: '/panel/usuarios',
      label: 'Usuarios',
      permission: 'usuarios.gestionar',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
    },
    {
      path: '/panel/ajustes',
      label: 'Copias y ajustes',
      permission: 'datos.respaldo',
      icon: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
    },
  ];

  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0])
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] }
  );

  /** Secciones del menú abiertas. Gestión y Sistema arrancan cerradas para que el menú sea corto. */
  private readonly groupState = signal<Record<string, boolean>>(this.readGroups());

  isOpen(group: string | undefined): boolean {
    return !!group && this.groupState()[group] !== false;
  }

  toggleGroup(group: string | undefined) {
    if (!group) return;
    const next = { ...this.groupState(), [group]: !this.isOpen(group) };
    this.groupState.set(next);
    try {
      localStorage.setItem('mer.panel.groups', JSON.stringify(next));
    } catch {
      /* se recuerda solo en esta sesión */
    }
  }

  /** Un ítem se muestra si su sección está abierta, si es donde estás parado, o con la barra contraída. */
  shown(item: NavItem & { groupName?: string }): boolean {
    if (this.collapsed() || this.isOpen(item.groupName)) return true;
    const url = this.currentUrl();
    return item.exact ? url === item.path : url === item.path || url.startsWith(item.path + '/');
  }

  private readGroups(): Record<string, boolean> {
    const defaults: Record<string, boolean> = { Inmuebles: true, Clientes: true, Gestión: false, Sistema: false };
    try {
      const saved = JSON.parse(localStorage.getItem('mer.panel.groups') ?? 'null');
      return saved && typeof saved === 'object' ? { ...defaults, ...saved } : defaults;
    } catch {
      return defaults;
    }
  }

  /** Ítems visibles según el usuario; cada sección muestra su título en su primer ítem visible. */
  readonly items = computed(() => {
    const result: (NavItem & { header?: string; groupName?: string })[] = [];
    let currentGroup = '';
    let headerPending = false;
    for (const item of this.allItems) {
      if (item.group) {
        currentGroup = item.group;
        headerPending = true;
      }
      if (item.permission && !this.auth.can(item.permission)) continue;
      result.push({ ...item, header: headerPending ? currentGroup : undefined, groupName: currentGroup || undefined });
      headerPending = false;
    }
    return result;
  });

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  toggleCollapsed() {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      /* se recuerda solo en esta sesión */
    }
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
