import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'mer.stats.v1';
const SESSION_KEY = 'mer.stats.viewed';

export type StatKind = 'views' | 'favorites' | 'whatsapp' | 'shares' | 'qr';

export type PropertyStats = Record<StatKind, number>;

const EMPTY: PropertyStats = { views: 0, favorites: 0, whatsapp: 0, shares: 0, qr: 0 };

/**
 * Interacciones del público con cada propiedad (vistas de la ficha, favoritas, clics a WhatsApp y compartidas).
 * En la demo se cuentan en este navegador; con el servidor real se registran en la base y suman a todos los visitantes.
 */
@Injectable({ providedIn: 'root' })
export class StatsStore {
  private readonly state = signal<Record<string, PropertyStats>>(this.load());
  readonly all = this.state.asReadonly();

  get(slug: string): PropertyStats {
    return { ...EMPTY, ...(this.state()[slug] ?? {}) };
  }

  record(slug: string, kind: StatKind): void {
    const current = this.get(slug);
    const next = { ...this.state(), [slug]: { ...current, [kind]: current[kind] + 1 } };
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio: se cuenta mientras dure la visita */
    }
  }

  /** Cuenta una vista por pestaña y propiedad (recargar no la duplica). */
  recordView(slug: string): void {
    this.recordOnce(slug, 'views');
  }

  /** Cuenta un evento una sola vez por pestaña y propiedad. */
  recordOnce(slug: string, kind: StatKind): void {
    const key = `${kind}:${slug}`;
    try {
      const seen: string[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '[]');
      if (seen.includes(key)) return;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen, key]));
    } catch {
      /* sin sessionStorage: se cuenta igual */
    }
    this.record(slug, kind);
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin acceso */
    }
    this.state.set({});
  }

  private load(): Record<string, PropertyStats> {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
}
