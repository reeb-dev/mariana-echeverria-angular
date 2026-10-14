import { computed, signal } from '@angular/core';

/**
 * Base de los almacenes del panel que guardan una lista de registros en el navegador (demo).
 * Cuando exista el backend, solo cambian `load()` y `commit()`.
 */
export abstract class CollectionStore<T extends { id: string }> {
  private readonly state = signal<T[]>([]);
  readonly all = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  protected constructor(
    private readonly storageKey: string,
    private readonly seed: () => T[]
  ) {
    this.state.set(this.load());
  }

  get(id: string): T | undefined {
    return this.state().find((item) => item.id === id);
  }

  newId(prefix = 'r'): string {
    return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  /** Alta si no existe el id, o reemplazo si existe. */
  save(item: T): void {
    const exists = this.state().some((i) => i.id === item.id);
    this.commit(exists ? this.state().map((i) => (i.id === item.id ? item : i)) : [item, ...this.state()]);
  }

  patch(id: string, changes: Partial<T>): void {
    this.commit(this.state().map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  remove(id: string): void {
    this.commit(this.state().filter((i) => i.id !== id));
  }

  reset(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* sin acceso al almacenamiento */
    }
    this.state.set(this.seed());
  }

  private load(): T[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as T[];
      }
    } catch {
      /* se usa el ejemplo */
    }
    return this.seed();
  }

  private commit(next: T[]): void {
    this.state.set(next);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(next));
    } catch {
      /* sin espacio: queda en memoria */
    }
  }
}

/** Solo dígitos: sirve para comparar teléfonos escritos de distinta forma. */
export function digits(value: string | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Dos teléfonos son «el mismo» si coinciden en sus últimos 8 dígitos. */
export function samePhone(a: string | undefined, b: string | undefined): boolean {
  const x = digits(a);
  const y = digits(b);
  return x.length >= 8 && y.length >= 8 && x.slice(-8) === y.slice(-8);
}
