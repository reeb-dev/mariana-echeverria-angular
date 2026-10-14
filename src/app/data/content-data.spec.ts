import { GUIDES } from './guides';
import { PROPERTIES } from './properties';
import { ZONE_PAGES } from './zone-pages';

describe('datos de contenido', () => {
  it('las guías tienen slug único y contenido', () => {
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const g of GUIDES) {
      expect(g.title).toBeTruthy();
      expect(g.description.length).toBeGreaterThan(40);
      expect(g.sections.length).toBeGreaterThan(0);
    }
  });

  it('las zonas tienen slug único y apuntan a una zona real de propiedades', () => {
    const slugs = ZONE_PAGES.map((z) => z.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const known = new Set(PROPERTIES.map((p) => p.zone));
    for (const z of ZONE_PAGES) {
      expect(z.zoneId).toBeTruthy();
      expect(z.description).toBeTruthy();
    }
    expect(ZONE_PAGES.some((z) => known.has(z.zoneId))).toBeTrue();
  });

  it('las propiedades tienen slug único', () => {
    const slugs = PROPERTIES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
