import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'mer.compare.v1';
export const MAX_COMPARE = 3;

/** Propiedades que la persona eligió para comparar lado a lado (hasta 3, se guardan en su navegador). */
@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly slugs = signal<string[]>(this.load());
  readonly all = this.slugs.asReadonly();

  has(slug: string): boolean {
    return this.slugs().includes(slug);
  }

  /** Suma o saca una propiedad. Devuelve `false` si no entra porque ya hay {@link MAX_COMPARE}. */
  toggle(slug: string): boolean {
    if (this.has(slug)) {
      this.set(this.slugs().filter((s) => s !== slug));
      return true;
    }
    if (this.slugs().length >= MAX_COMPARE) return false;
    this.set([...this.slugs(), slug]);
    return true;
  }

  clear(): void {
    this.set([]);
  }

  private set(next: string[]) {
    this.slugs.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* queda mientras dure la visita */
    }
  }

  private load(): string[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string').slice(0, MAX_COMPARE) : [];
    } catch {
      return [];
    }
  }
}
