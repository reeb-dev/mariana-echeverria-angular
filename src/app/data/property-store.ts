import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivityLog } from './activity-log';
import { AuthService } from './auth.service';
import { PROPERTIES, type Property, type PropertyStatus } from './properties';

const STORAGE_KEY = 'mer.properties.v1';

/** Máximo de propiedades visibles en la sección «Destacadas» de la home. */
export const MAX_FEATURED = 6;

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function statusOf(p: Property): PropertyStatus {
  return p.status ?? 'publicada';
}

function byFeaturedOrder(a: Property, b: Property): number {
  return (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999);
}

/**
 * Fuente de datos de las propiedades para el sitio y el panel.
 *
 * Hoy persiste en el navegador (localStorage) a partir del inventario de ejemplo de `properties.ts`.
 * Cuando exista el backend, solo cambia `load()` y `commit()`: el resto de la app no se entera.
 */
@Injectable({ providedIn: 'root' })
export class PropertyStore {
  private readonly auth = inject(AuthService);
  private readonly activity = inject(ActivityLog);
  private readonly state = signal<Property[]>(this.load());

  /** Todas las propiedades, sin importar el estado (lo que ve el panel). */
  readonly all = this.state.asReadonly();

  /** Lo que ve el público: solo las publicadas. */
  readonly published = computed(() => this.state().filter((p) => statusOf(p) === 'publicada'));

  /** Destacadas publicadas, en el orden elegido en el panel. */
  readonly featured = computed(() =>
    this.published()
      .filter((p) => p.featured)
      .sort(byFeaturedOrder)
      .slice(0, MAX_FEATURED)
  );

  /** Todas las marcadas como destacadas (incluye pausadas, para ordenarlas en el panel). */
  readonly featuredAll = computed(() =>
    this.state()
      .filter((p) => p.featured)
      .sort(byFeaturedOrder)
  );

  /** Mensaje si el navegador no pudo guardar (por ejemplo, espacio lleno por las fotos). */
  readonly storageError = signal<string | null>(null);

  statusOf = statusOf;

  getById(id: string): Property | undefined {
    return this.state().find((p) => p.id === id);
  }

  getBySlug(slug: string): Property | undefined {
    return this.state().find((p) => p.slug === slug);
  }

  newId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `p-${Date.now().toString(36)}`;
  }

  /** Slug único a partir del título (agrega -2, -3… si ya existe). */
  uniqueSlug(base: string, ownId?: string): string {
    const root = slugify(base) || 'propiedad';
    const taken = new Set(this.state().filter((p) => p.id !== ownId).map((p) => p.slug));
    let candidate = root;
    let n = 2;
    while (taken.has(candidate)) {
      candidate = `${root}-${n++}`;
    }
    return candidate;
  }

  upsert(property: Property): boolean {
    const list = this.state();
    const current = list.find((p) => p.id === property.id);
    if (current ? !this.auth.canEdit(current) : !this.auth.can('propiedades.crear')) {
      return false;
    }
    // Lo que el rol no puede cambiar se conserva del original.
    const now = new Date().toISOString();
    const next: Property = {
      ...property,
      createdAt: current?.createdAt ?? property.createdAt ?? now,
      updatedAt: now,
    };
    if (!this.auth.can('propiedades.destacar')) {
      next.featured = current?.featured ?? false;
      next.featuredOrder = current?.featuredOrder;
    }
    if (!this.auth.can('propiedades.editar.todas')) {
      next.agentId = current?.agentId ?? this.auth.user()?.id;
    }
    const saved = current
      ? list.map((p) => (p.id === next.id ? next : p))
      : [next, ...list];
    this.record(
      current
        ? `Editó «${next.title}»${this.describeChanges(current, next)}`
        : `Creó la propiedad «${next.title}»`,
      next.id
    );
    return this.commit(saved);
  }

  /** Copia una propiedad como pausada y sin destacar. Devuelve el id de la copia o null. */
  duplicate(id: string): string | null {
    const source = this.getById(id);
    if (!source || !this.auth.can('propiedades.crear')) return null;
    const copyId = this.newId();
    const now = new Date().toISOString();
    const title = `Copia de ${source.title}`;
    const copy: Property = {
      ...source,
      id: copyId,
      title,
      slug: this.uniqueSlug(title),
      status: 'pausada',
      featured: false,
      featuredOrder: undefined,
      agentId: this.auth.user()?.id ?? source.agentId,
      photos: source.photos.map((p) => ({ ...p })),
      amenities: [...source.amenities],
      createdAt: now,
      updatedAt: now,
    };
    this.record(`Duplicó la propiedad «${source.title}»`, copyId);
    return this.commit([copy, ...this.state()]) ? copyId : null;
  }

  remove(id: string): boolean {
    const target = this.getById(id);
    if (!target || !this.auth.can('propiedades.eliminar')) return false;
    this.record(`Eliminó la propiedad «${target.title}»`, target.id);
    return this.commit(this.state().filter((p) => p.id !== id));
  }

  setStatus(id: string, status: PropertyStatus): boolean {
    const target = this.getById(id);
    if (!target || !this.auth.canEdit(target)) return false;
    this.record(`Cambió el estado de «${target.title}» a ${status}`, target.id);
    return this.commit(this.state().map((p) => (p.id === id ? { ...p, status } : p)));
  }

  /** Marca o desmarca como destacada. Devuelve false si se llegó al máximo. */
  toggleFeatured(id: string): boolean {
    const target = this.getById(id);
    if (!target || !this.auth.can('propiedades.destacar')) return false;
    if (target.featured) {
      this.record(`Quitó de destacadas «${target.title}»`, target.id);
      return this.commit(
        this.state().map((p) =>
          p.id === id ? { ...p, featured: false, featuredOrder: undefined } : p
        )
      );
    }
    if (this.featuredAll().length >= MAX_FEATURED) {
      return false;
    }
    const nextOrder = Math.max(0, ...this.featuredAll().map((p) => p.featuredOrder ?? 0)) + 1;
    this.record(`Destacó «${target.title}»`, target.id);
    return this.commit(
      this.state().map((p) => (p.id === id ? { ...p, featured: true, featuredOrder: nextOrder } : p))
    );
  }

  /** Sube (-1) o baja (+1) una destacada en el orden. */
  moveFeatured(id: string, direction: -1 | 1): void {
    if (!this.auth.can('propiedades.destacar')) return;
    const list = this.featuredAll();
    const index = list.findIndex((p) => p.id === id);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    const orderById = new Map(reordered.map((p, i) => [p.id, i + 1]));
    this.commit(
      this.state().map((p) => (orderById.has(p.id) ? { ...p, featuredOrder: orderById.get(p.id) } : p))
    );
  }

  /** Vuelve al inventario de ejemplo. */
  reset(): void {
    if (!this.auth.can('datos.respaldo')) return;
    this.record('Restauró los datos de ejemplo');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin acceso al almacenamiento: se resetea solo en memoria */
    }
    this.storageError.set(null);
    this.state.set(this.seed());
  }

  exportJson(): string {
    return JSON.stringify(this.state(), null, 2);
  }

  /** Reemplaza todo el inventario con un JSON exportado antes. Devuelve un mensaje de error o null. */
  importJson(text: string): string | null {
    if (!this.auth.can('datos.respaldo')) return 'No tenés permiso para cargar copias.';
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return 'El archivo no es un JSON válido.';
    }
    if (!Array.isArray(data)) {
      return 'El archivo no tiene el formato esperado (se esperaba una lista de propiedades).';
    }
    const valid = data.every(
      (p) =>
        p &&
        typeof p === 'object' &&
        typeof (p as Property).id === 'string' &&
        typeof (p as Property).slug === 'string' &&
        typeof (p as Property).title === 'string' &&
        Array.isArray((p as Property).photos) &&
        (p as Property).photos.length > 0
    );
    if (!valid) {
      return 'Alguna propiedad no tiene id, slug, título o fotos.';
    }
    this.record('Cargó una copia de seguridad');
    this.commit(data as Property[]);
    return null;
  }

  /** Texto corto con lo que cambió entre dos versiones (precio, estado, título…). */
  private describeChanges(before: Property, after: Property): string {
    const diffs: string[] = [];
    const check = (label: string, a: unknown, b: unknown) => {
      if ((a ?? '') !== (b ?? '')) diffs.push(`${label}: ${String(a ?? '—')} → ${String(b ?? '—')}`);
    };
    check('precio', before.priceLabel, after.priceLabel);
    check('estado', statusOf(before), statusOf(after));
    check('título', before.title, after.title);
    check('ubicación', before.location, after.location);
    check('superficie', before.areaLabel, after.areaLabel);
    if (before.photos.length !== after.photos.length) {
      diffs.push(`fotos: ${before.photos.length} → ${after.photos.length}`);
    }
    if (!!before.featured !== !!after.featured) diffs.push(after.featured ? 'pasó a destacada' : 'dejó de ser destacada');
    if (before.description !== after.description) diffs.push('cambió la descripción');
    return diffs.length > 0 ? ` (${diffs.join('; ')})` : '';
  }

  /**
   * Aplica el mismo cambio a varias propiedades a la vez (estado, responsable o sucursal).
   * Devuelve cuántas se modificaron; las que el usuario no puede editar se saltean.
   */
  bulkUpdate(
    ids: string[],
    changes: Partial<Pick<Property, 'status' | 'agentId' | 'branch'>>
  ): number {
    const canAssign = this.auth.can('propiedades.editar.todas');
    const now = new Date().toISOString();
    const touched: Property[] = [];
    const next = this.state().map((p) => {
      if (!ids.includes(p.id) || !this.auth.canEdit(p)) return p;
      const patch: Partial<Property> = {};
      if (changes.status !== undefined) patch.status = changes.status;
      if (canAssign && changes.agentId !== undefined) patch.agentId = changes.agentId || undefined;
      if (canAssign && changes.branch !== undefined) patch.branch = changes.branch || undefined;
      if (Object.keys(patch).length === 0) return p;
      const updated = { ...p, ...patch, updatedAt: now };
      touched.push(updated);
      return updated;
    });
    if (touched.length === 0) return 0;
    const what = [
      changes.status !== undefined ? `estado → ${changes.status}` : '',
      canAssign && changes.agentId !== undefined ? 'responsable' : '',
      canAssign && changes.branch !== undefined ? 'sucursal' : '',
    ]
      .filter(Boolean)
      .join(', ');
    this.record(`Cambió en lote ${touched.length} propiedades (${what})`);
    touched.forEach((p) =>
      this.activity.log(this.auth.user()?.name ?? 'Sistema', `Cambio en lote (${what}) en «${p.title}»`, p.id)
    );
    this.commit(next);
    return touched.length;
  }

  /**
   * Vuelve a poner propiedades tal como estaban (se usa para «Deshacer»): reemplaza las que existen y repone las eliminadas.
   * Cada una se restaura solo si el usuario tiene permiso para editarla (o para eliminarla, si ya no existe).
   */
  restore(items: Property[]): number {
    const current = this.state();
    const allowed = items.filter((item) => {
      const existing = current.find((p) => p.id === item.id);
      return existing ? this.auth.canEdit(existing) : this.auth.can('propiedades.eliminar');
    });
    if (allowed.length === 0) return 0;
    const byId = new Map(allowed.map((p) => [p.id, p]));
    const replaced = current.map((p) => byId.get(p.id) ?? p);
    const known = new Set(current.map((p) => p.id));
    const brought = allowed.filter((p) => !known.has(p.id));
    this.record(`Deshizo un cambio en ${allowed.length} ${allowed.length === 1 ? 'propiedad' : 'propiedades'}`);
    this.commit([...brought, ...replaced]);
    return allowed.length;
  }

  /** Elimina varias propiedades; solo el titular. Devuelve cuántas se borraron. */
  removeMany(ids: string[]): number {
    if (!this.auth.can('propiedades.eliminar')) return 0;
    const targets = this.state().filter((p) => ids.includes(p.id));
    if (targets.length === 0) return 0;
    this.record(`Eliminó en lote ${targets.length} propiedades`);
    this.commit(this.state().filter((p) => !ids.includes(p.id)));
    return targets.length;
  }

  private record(action: string, ref?: string): void {
    this.activity.log(this.auth.user()?.name ?? 'Sistema', action, ref);
  }

  private seed(): Property[] {
    return PROPERTIES.map((p) => ({ ...p }));
  }

  private load(): Property[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Property[];
        }
      }
    } catch {
      /* storage bloqueado o JSON dañado: se usa el inventario de ejemplo */
    }
    return this.seed();
  }

  private commit(next: Property[]): boolean {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      this.storageError.set(null);
      return true;
    } catch {
      this.storageError.set(
        'No se pudo guardar en este navegador (espacio lleno). Exportá una copia o usá fotos más chicas.'
      );
      return false;
    }
  }
}
