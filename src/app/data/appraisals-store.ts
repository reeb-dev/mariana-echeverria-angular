import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'mer.appraisals.v1';

export type AppraisalStatus = 'nueva' | 'relevamiento' | 'entregada' | 'cerrada';

export const APPRAISAL_STATUS_LABELS: Record<AppraisalStatus, string> = {
  nueva: 'Nueva',
  relevamiento: 'En relevamiento',
  entregada: 'Entregada',
  cerrada: 'Cerrada',
};

export type AppraisalReason = 'venta' | 'alquiler' | 'sucesion' | 'garantia' | 'refinanciacion' | 'otro';

export const APPRAISAL_REASON_LABELS: Record<AppraisalReason, string> = {
  venta: 'Quiero vender',
  alquiler: 'Quiero alquilar o arrendar',
  sucesion: 'Sucesión',
  garantia: 'Garantía o crédito',
  refinanciacion: 'Refinanciación',
  otro: 'Otro motivo',
};

export type AppraisalPropertyType = 'casa' | 'departamento' | 'local' | 'lote' | 'campo' | 'otro';

export type Appraisal = {
  id: string;
  at: string;
  name: string;
  phone: string;
  email: string;
  propertyType: AppraisalPropertyType;
  reason: AppraisalReason;
  /** Dirección o ubicación del inmueble. */
  address: string;
  /** Superficie en m² (o hectáreas, según el tipo; se aclara en los detalles). */
  area?: string;
  details?: string;
  status: AppraisalStatus;
  assignedTo?: string;
  /** Valor o rango entregado, como texto libre (por ejemplo «USD 48.000 a 52.000»). */
  valueDelivered?: string;
  notes?: string;
  deliveredAt?: string;
};

const SEED: Appraisal[] = [
  {
    id: 'a-1',
    at: '2026-10-12T16:40:00.000Z',
    name: 'Roberto Aguirre',
    phone: '2926 555 0120',
    email: 'roberto@example.com',
    propertyType: 'casa',
    reason: 'sucesion',
    address: 'Belgrano 840, Coronel Suárez',
    area: '210 m²',
    details: 'Casa de mis padres, necesitamos el valor para la sucesión.',
    status: 'nueva',
  },
];

/** Pedidos de tasación que llegan por el sitio. */
@Injectable({ providedIn: 'root' })
export class AppraisalsStore {
  private readonly state = signal<Appraisal[]>(this.load());
  readonly all = this.state.asReadonly();
  readonly newCount = computed(() => this.state().filter((a) => a.status === 'nueva').length);

  add(input: Omit<Appraisal, 'id' | 'at' | 'status'>): void {
    const appraisal: Appraisal = {
      ...input,
      id: globalThis.crypto?.randomUUID?.() ?? `a-${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      status: 'nueva',
    };
    this.commit([appraisal, ...this.state()]);
  }

  update(id: string, changes: Partial<Appraisal>): void {
    this.commit(this.state().map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }

  setStatus(id: string, status: AppraisalStatus): void {
    const deliveredAt =
      status === 'entregada' ? new Date().toISOString() : undefined;
    this.update(id, { status, ...(status === 'entregada' ? { deliveredAt } : {}) });
  }

  remove(id: string): void {
    this.commit(this.state().filter((a) => a.id !== id));
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin acceso al almacenamiento */
    }
    this.state.set(SEED.map((a) => ({ ...a })));
  }

  private load(): Appraisal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Appraisal[];
      }
    } catch {
      /* se usa el ejemplo */
    }
    return SEED.map((a) => ({ ...a }));
  }

  private commit(next: Appraisal[]): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio: queda en memoria */
    }
  }
}
