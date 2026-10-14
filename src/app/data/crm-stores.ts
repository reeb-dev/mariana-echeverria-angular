import { Injectable } from '@angular/core';
import { localIsoDate } from './calculators';
import { CollectionStore } from './collection-store';

/* ------------------------------------------------------------------ Contactos */

export type ContactKind = 'comprador' | 'propietario' | 'inquilino' | 'otro';

export const CONTACT_KIND_LABELS: Record<ContactKind, string> = {
  comprador: 'Comprador',
  propietario: 'Propietario',
  inquilino: 'Inquilino o arrendatario',
  otro: 'Otro',
};

export type CrmContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  kind: ContactKind;
  notes?: string;
  /** Usuario del panel que lo atiende. */
  assignedTo?: string;
  createdAt: string;
  /** El contacto aceptó la política de privacidad (viene de un formulario del sitio). */
  consent?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ContactsStore extends CollectionStore<CrmContact> {
  constructor() {
    super('mer.contacts.v1', () => [
      {
        id: 'c-1',
        name: 'Familia Rossi',
        phone: '2926 444555',
        email: '',
        kind: 'propietario',
        notes: 'Propietarios de la casa de Mitre 2000.',
        createdAt: '2026-09-20T12:00:00.000Z',
      },
      {
        id: 'c-2',
        name: 'Carolina Pérez',
        phone: '2926 555 0101',
        email: 'carolina@example.com',
        kind: 'comprador',
        notes: 'Busca casa de 3 dormitorios en Coronel Suárez, hasta USD 60.000.',
        createdAt: '2026-10-12T14:20:00.000Z',
      },
    ]);
  }
}

/* --------------------------------------------------------------------- Visitas */

export type VisitStatus = 'solicitada' | 'programada' | 'realizada' | 'cancelada';

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  solicitada: 'Para confirmar',
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};

export type Visit = {
  id: string;
  /** Slug de la propiedad visitada. */
  propertySlug: string;
  contactId?: string;
  /** Nombre libre, si todavía no es un contacto. */
  visitorName?: string;
  /** Teléfono de quien pidió la visita desde el sitio. */
  visitorPhone?: string;
  /** Lo que pidió la persona («viernes 17/10, por la tarde»), mientras no se confirme. */
  preferred?: string;
  /** Pidió la visita desde el sitio (y aceptó la política de privacidad). */
  consent?: boolean;
  /** Fecha y hora ISO. */
  at: string;
  status: VisitStatus;
  agentId?: string;
  /** Devolución de quien visitó, para el informe al propietario. */
  feedback?: string;
  /** Interés de 1 a 5. */
  interest?: number;
};

@Injectable({ providedIn: 'root' })
export class VisitsStore extends CollectionStore<Visit> {
  constructor() {
    super('mer.visits.v1', () => []);
  }
}

/* ---------------------------------------------------------- Búsquedas guardadas */

export type SavedSearch = {
  id: string;
  contactId?: string;
  /** Nombre y teléfono, cuando viene del sitio y todavía no es un contacto. */
  name?: string;
  phone?: string;
  operation?: 'venta' | 'alquiler';
  type?: string;
  zone?: string;
  maxPrice?: number;
  currency: 'USD' | 'ARS';
  notes?: string;
  active: boolean;
  createdAt: string;
  consent?: boolean;
};

@Injectable({ providedIn: 'root' })
export class SavedSearchesStore extends CollectionStore<SavedSearch> {
  constructor() {
    super('mer.searches.v1', () => [
      {
        id: 's-1',
        contactId: 'c-2',
        operation: 'venta',
        type: 'casa',
        zone: 'coronel-suarez',
        maxPrice: 60000,
        currency: 'USD',
        active: true,
        createdAt: '2026-10-12T14:25:00.000Z',
      },
    ]);
  }
}

/* ------------------------------------------------------------------- Contratos */

export type LeaseKind = 'urbano' | 'rural';

export type Lease = {
  id: string;
  kind: LeaseKind;
  propertySlug?: string;
  /** Descripción libre del inmueble o campo. */
  propertyLabel: string;
  ownerName: string;
  tenantName: string;
  tenantContactId?: string;
  guarantor?: string;
  /** Fechas ISO (solo día). */
  startDate: string;
  endDate: string;
  rent: number;
  currency: 'USD' | 'ARS' | 'QUINTALES';
  /** Cada cuántos meses se ajusta (0 = sin ajuste). */
  adjustEveryMonths: number;
  /** Cómo se ajusta: índice o regla pactada, en texto libre. */
  adjustmentRule?: string;
  deposit?: number;
  notes?: string;
  status: 'vigente' | 'finalizado';
};

@Injectable({ providedIn: 'root' })
export class LeasesStore extends CollectionStore<Lease> {
  constructor() {
    super('mer.leases.v1', () => {
      const today = new Date();
      const iso = (d: Date) => localIsoDate(d);
      const add = (days: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return iso(d);
      };
      return [
        {
          id: 'l-1',
          kind: 'urbano',
          propertySlug: 'departamento-rivas-alquiler',
          propertyLabel: 'Departamento en Rivas 200',
          ownerName: 'Propietario de ejemplo',
          tenantName: 'Inquilino de ejemplo',
          startDate: add(-300),
          endDate: add(55),
          rent: 1200000,
          currency: 'ARS',
          adjustEveryMonths: 4,
          adjustmentRule: 'Según el índice pactado en el contrato',
          deposit: 1200000,
          status: 'vigente',
        },
      ] satisfies Lease[];
    });
  }
}

/* ----------------------------------------------------------------- Expedientes */

export type CaseKind = 'sucesion' | 'desalojo' | 'divorcio' | 'escrituracion' | 'otro';

export const CASE_KIND_LABELS: Record<CaseKind, string> = {
  sucesion: 'Sucesión',
  desalojo: 'Desalojo',
  divorcio: 'División de bienes',
  escrituracion: 'Escrituración',
  otro: 'Otro',
};

/** Documentación que suele pedirse según el tipo de trámite (punto de partida, se edita en cada expediente). */
export const CASE_CHECKLISTS: Record<CaseKind, string[]> = {
  sucesion: [
    'Partida de defunción',
    'Partidas de nacimiento y matrimonio de los herederos',
    'Título de propiedad o escritura',
    'Certificado de dominio e inhibiciones',
    'Valuación fiscal y libre deuda de impuestos',
    'Declaratoria de herederos',
  ],
  desalojo: [
    'Contrato de locación',
    'Intimación fehaciente de pago o entrega',
    'Constancia de deuda',
    'Título del inmueble',
    'Poder o personería',
  ],
  divorcio: [
    'Acta de matrimonio',
    'Convenio regulador',
    'Inventario de bienes',
    'Títulos de propiedad',
    'Valuaciones',
  ],
  escrituracion: [
    'Título de propiedad',
    'Certificado de dominio e inhibiciones',
    'Libre deuda de impuestos y servicios',
    'DNI y estado civil de las partes',
    'Boleto de compraventa o reserva',
  ],
  otro: [],
};

export type CaseDeadline = { id: string; label: string; date: string; done: boolean };
export type CaseCheckItem = { id: string; label: string; done: boolean };

export type LegalCase = {
  id: string;
  title: string;
  kind: CaseKind;
  contactId?: string;
  /** Carátula o número de expediente. */
  reference?: string;
  status: 'abierto' | 'en_tramite' | 'cerrado';
  openedAt: string;
  deadlines: CaseDeadline[];
  checklist: CaseCheckItem[];
  notes?: string;
};

@Injectable({ providedIn: 'root' })
export class CasesStore extends CollectionStore<LegalCase> {
  constructor() {
    super('mer.cases.v1', () => []);
  }
}

/* -------------------------------------------------------------- Recordatorios */

export type Reminder = {
  id: string;
  text: string;
  /** Fecha ISO (solo día) en la que hay que hacerlo. */
  due: string;
  done: boolean;
  /** A qué se refiere, para llegar rápido: «contacto», «consulta», «tasacion»… */
  context?: string;
  /** Usuario del panel que lo creó o a quien le toca. */
  userId?: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class RemindersStore extends CollectionStore<Reminder> {
  constructor() {
    super('mer.reminders.v1', () => []);
  }
}
