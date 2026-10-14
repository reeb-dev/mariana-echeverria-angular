import { listingQuality } from './listing-quality';
import type { Property } from './properties';

function property(extra: Partial<Property> = {}): Property {
  return {
    id: 'x',
    slug: 'x',
    title: 'Casa',
    location: 'Mitre 2000, Coronel Suárez',
    zone: 'coronel-suarez',
    operation: 'venta',
    type: 'casa',
    priceLabel: 'USD 54.000',
    areaLabel: '180 m²',
    description: 'a'.repeat(520),
    amenities: ['Patio', 'Garage', 'Cocina', 'Barrio', 'Centro'],
    photos: Array.from({ length: 8 }, (_, i) => ({ src: `/f${i}.jpg`, alt: 'f', caption: 'f' })),
    beds: 3,
    baths: 2,
    highlight: 'Casa familiar',
    ...extra,
  };
}

describe('listingQuality', () => {
  it('un aviso completo llega a 100', () => {
    const q = listingQuality(property());
    expect(q.score).toBe(100);
    expect(q.level).toBe('muy-bueno');
    expect(q.checks.every((c) => c.hint === '')).toBeTrue();
  });

  it('un aviso casi vacío queda «a mejorar» y dice qué falta', () => {
    const q = listingQuality(
      property({
        priceLabel: 'Consultar',
        areaLabel: 'Consultar',
        description: 'corta',
        amenities: [],
        photos: [{ src: '/a.jpg', alt: 'a', caption: 'a' }],
        beds: undefined,
        baths: undefined,
        highlight: undefined,
        location: 'CS',
      })
    );
    expect(q.score).toBeLessThan(30);
    expect(q.level).toBe('a-mejorar');
    expect(q.checks.filter((c) => c.hint !== '').length).toBeGreaterThanOrEqual(6);
  });

  it('en un lote no exige dormitorios ni baños', () => {
    const q = listingQuality(property({ type: 'lote', beds: undefined, baths: undefined }));
    expect(q.checks.find((c) => c.id === 'ambientes')?.points).toBe(10);
  });

  it('el puntaje sube con más fotos', () => {
    const few = listingQuality(property({ photos: property().photos.slice(0, 2) }));
    const many = listingQuality(property());
    expect(many.score).toBeGreaterThan(few.score);
  });
});
