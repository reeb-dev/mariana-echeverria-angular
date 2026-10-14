import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'mer.activity.v1';
const MAX_ENTRIES = 300;

export type ActivityEntry = {
  at: string;
  user: string;
  action: string;
  /** Id de la propiedad a la que se refiere (para su historial). */
  ref?: string;
};

/** Registro de quién hizo qué en el panel (últimos 100 movimientos). */
@Injectable({ providedIn: 'root' })
export class ActivityLog {
  private readonly state = signal<ActivityEntry[]>(this.load());
  readonly entries = this.state.asReadonly();

  log(user: string, action: string, ref?: string): void {
    const next = [{ at: new Date().toISOString(), user, action, ref }, ...this.state()].slice(0, MAX_ENTRIES);
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio: queda en memoria */
    }
  }

  private load(): ActivityEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as ActivityEntry[];
      }
    } catch {
      /* sin historial previo */
    }
    return [];
  }
}
