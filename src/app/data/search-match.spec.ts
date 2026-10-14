import type { SavedSearch } from './crm-stores';
import type { Property } from './properties';
import { matchesSearch } from './search-match';

const base: Property = {
  id: '1',
  slug: 'casa',
  title: 'Casa',
  location: 'CS',
  zone: 'coronel-suarez',
  operation: 'venta',
  type: 'casa',
  priceLabel: 'USD 54.000',
  areaLabel: '180 m²',
  description: '',
  amenities: [],
  photos: [{ src: '/a.jpg', alt: 'a', caption: 'a' }],
};

function search(extra: Partial<SavedSearch> = {}): SavedSearch {
  return { id: 's', currency: 'USD', active: true, createdAt: '2026-10-14T00:00:00.000Z', ...extra };
}

describe('matchesSearch', () => {
  it('sin filtros coincide con todo', () => {
    expect(matchesSearch(search(), base)).toBeTrue();
  });

  it('filtra por operación, tipo y zona', () => {
    expect(matchesSearch(search({ operation: 'venta', type: 'casa', zone: 'coronel-suarez' }), base)).toBeTrue();
    expect(matchesSearch(search({ operation: 'alquiler' }), base)).toBeFalse();
    expect(matchesSearch(search({ type: 'lote' }), base)).toBeFalse();
    expect(matchesSearch(search({ zone: 'zona-norte' }), base)).toBeFalse();
  });

  it('el precio máximo respeta la moneda', () => {
    expect(matchesSearch(search({ maxPrice: 60000, currency: 'USD' }), base)).toBeTrue();
    expect(matchesSearch(search({ maxPrice: 50000, currency: 'USD' }), base)).toBeFalse();
    expect(matchesSearch(search({ maxPrice: 60000, currency: 'ARS' }), base)).toBeFalse();
  });

  it('una propiedad sin precio publicado no entra si hay tope', () => {
    expect(matchesSearch(search({ maxPrice: 100000 }), { ...base, priceLabel: 'Consultar' })).toBeFalse();
  });
});
