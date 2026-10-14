import { Injectable, computed, inject, signal } from '@angular/core';
import { StatsStore } from './stats-store';

const STORAGE_KEY = 'mer.favorites.v1';

/** Propiedades que la persona marcó con el corazón (se guardan en su navegador). */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly stats = inject(StatsStore);
  private readonly slugs = signal<string[]>(this.load());
  readonly all = this.slugs.asReadonly();
  readonly count = computed(() => this.slugs().length);

  has(slug: string): boolean {
    return this.slugs().includes(slug);
  }

  toggle(slug: string): void {
    const adding = !this.has(slug);
    if (adding) this.stats.record(slug, 'favorites');
    const next = adding ? [...this.slugs(), slug] : this.slugs().filter((s) => s !== slug);
    this.slugs.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio o bloqueado: queda mientras dure la visita */
    }
  }

  private load(): string[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }
}
