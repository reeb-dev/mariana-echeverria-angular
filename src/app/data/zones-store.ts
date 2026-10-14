import { Injectable, computed, inject } from '@angular/core';
import { CollectionStore } from './collection-store';
import { PropertyStore, slugify } from './property-store';
import { ZONE_LABELS, labelForZone } from './properties';

export type ZoneEntry = {
  id: string;
  name: string;
  /** Muestra una sección con sus propiedades en la página principal. */
  homeSection?: boolean;
  /** Posición entre las secciones de la home. */
  homeOrder?: number;
};

/** Tope de secciones por zona en la home, para que la página no se sature. */
export const MAX_HOME_SECTIONS = 3;
/** La sección de una zona aparece desde esta cantidad de propiedades publicadas. */
export const MIN_HOME_SECTION_ITEMS = 3;

const SEED = (): ZoneEntry[] => Object.entries(ZONE_LABELS).map(([id, name]) => ({ id, name }));

/** Zonas disponibles para cargar propiedades. Las que agrega el panel se suman a las de siempre. */
@Injectable({ providedIn: 'root' })
export class ZonesStore extends CollectionStore<ZoneEntry> {
  private readonly properties = inject(PropertyStore);

  constructor() {
    super('mer.panel.zones', SEED);
    this.sync();
  }

  /** Todas las zonas (las cargadas y las que ya usan las propiedades), de la A a la Z. */
  readonly options = computed(() => {
    const byId = new Map<string, string>();
    for (const z of this.all()) byId.set(z.id, z.name);
    for (const p of this.properties.all()) if (p.zone && !byId.has(p.zone)) byId.set(p.zone, labelForZone(p.zone));
    return [...byId]
      .map(([id, name]) => ({ id, name, homeSection: !!this.get(id)?.homeSection, homeOrder: this.get(id)?.homeOrder ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  });

  /** Zonas con sección propia en la home, de la A a la Z. */
  readonly homeSections = computed(() =>
    this.options()
      .filter((z) => z.homeSection)
      .sort((a, b) => a.homeOrder - b.homeOrder || a.name.localeCompare(b.name, 'es'))
  );

  /** Activa o desactiva la sección de la zona en la home. */
  toggleHomeSection(id: string, name: string): boolean {
    const current = this.get(id);
    const next = !current?.homeSection;
    const last = Math.max(0, ...this.homeSections().map((z) => z.homeOrder));
    this.save({ ...(current ?? { id, name }), homeSection: next, homeOrder: next ? last + 1 : undefined });
    return next;
  }

  /** Sube o baja una sección entre las de la home. */
  moveHomeSection(id: string, direction: -1 | 1): void {
    const list = this.homeSections();
    const i = list.findIndex((z) => z.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((z, index) => {
      const entry = this.get(z.id) ?? { id: z.id, name: z.name };
      this.save({ ...entry, homeSection: true, homeOrder: index + 1 });
    });
  }

  /** Cuántas propiedades hay en cada zona. */
  usage(id: string): number {
    return this.properties.all().filter((p) => p.zone === id).length;
  }

  /** Agrega una zona. Devuelve un mensaje si no se pudo. */
  add(name: string): string | null {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2) return 'Escribí el nombre de la zona.';
    const id = slugify(clean);
    if (!id) return 'El nombre no es válido.';
    if (this.options().some((z) => z.id === id || z.name.toLowerCase() === clean.toLowerCase())) {
      return 'Esa zona ya existe.';
    }
    this.save({ id, name: clean });
    this.sync();
    return null;
  }

  /** Quita una zona sin propiedades. */
  delete(id: string): string | null {
    if (this.usage(id) > 0) return 'Tiene propiedades cargadas: movelas de zona antes de quitarla.';
    this.remove(id);
    return null;
  }

  /** Para que `labelForZone` conozca los nombres con tildes de las zonas agregadas. */
  private sync() {
    for (const z of this.all()) ZONE_LABELS[z.id] = z.name;
  }
}
