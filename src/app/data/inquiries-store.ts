import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'mer.inquiries.v1';

export type InquiryStatus = 'nueva' | 'contestada' | 'cerrada';

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  nueva: 'Nueva',
  contestada: 'Contestada',
  cerrada: 'Cerrada',
};

export type Inquiry = {
  id: string;
  at: string;
  name: string;
  email: string;
  phone: string;
  propertyType?: string;
  operation?: string;
  message?: string;
  /** Si consultó desde la ficha de una propiedad. */
  propertyTitle?: string;
  propertySlug?: string;
  status: InquiryStatus;
  /** Id del usuario del panel que la atiende. */
  assignedTo?: string;
  /** Notas internas (no las ve quien consultó). */
  notes?: string;
};

const SEED: Inquiry[] = [
  {
    id: 'q-1',
    at: '2026-10-12T14:20:00.000Z',
    name: 'Carolina Pérez',
    email: 'carolina@example.com',
    phone: '2926 555 0101',
    propertyType: 'casa',
    operation: 'venta',
    message: 'Hola, me interesa la casa de Mitre. ¿Se puede visitar esta semana?',
    status: 'nueva',
  },
  {
    id: 'q-2',
    at: '2026-10-10T09:05:00.000Z',
    name: 'Martín Gómez',
    email: 'martin@example.com',
    phone: '11 5555 0102',
    propertyType: 'local',
    operation: 'alquiler',
    message: 'Busco un local céntrico para alquilar. ¿Qué opciones tienen?',
    status: 'contestada',
  },
];

/** Consultas que llegan por el formulario del sitio. */
@Injectable({ providedIn: 'root' })
export class InquiriesStore {
  private readonly state = signal<Inquiry[]>(this.load());
  readonly all = this.state.asReadonly();
  readonly newCount = computed(() => this.state().filter((q) => q.status === 'nueva').length);

  add(input: Omit<Inquiry, 'id' | 'at' | 'status'>): void {
    const inquiry: Inquiry = {
      ...input,
      id: globalThis.crypto?.randomUUID?.() ?? `q-${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      status: 'nueva',
    };
    this.commit([inquiry, ...this.state()]);
  }

  setStatus(id: string, status: InquiryStatus): void {
    this.commit(this.state().map((q) => (q.id === id ? { ...q, status } : q)));
  }

  assign(id: string, userId: string | undefined): void {
    this.commit(this.state().map((q) => (q.id === id ? { ...q, assignedTo: userId } : q)));
  }

  setNotes(id: string, notes: string): void {
    this.commit(this.state().map((q) => (q.id === id ? { ...q, notes: notes.trim() || undefined } : q)));
  }

  remove(id: string): void {
    this.commit(this.state().filter((q) => q.id !== id));
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin acceso al almacenamiento */
    }
    this.state.set(SEED.map((q) => ({ ...q })));
  }

  private load(): Inquiry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Inquiry[];
      }
    } catch {
      /* se usa el ejemplo */
    }
    return SEED.map((q) => ({ ...q }));
  }

  private commit(next: Inquiry[]): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin espacio: queda en memoria */
    }
  }
}
