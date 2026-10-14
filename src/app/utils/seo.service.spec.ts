import { parsePrice } from './seo.service';

describe('parsePrice', () => {
  it('entiende dólares con punto de miles', () => {
    expect(parsePrice('USD 54.000')).toEqual({ price: 54000, currency: 'USD' });
  });

  it('entiende pesos mensuales', () => {
    expect(parsePrice('$ 1.200.000 / mes')).toEqual({ price: 1200000, currency: 'ARS' });
  });

  it('«Consultar» no tiene precio', () => {
    expect(parsePrice('Consultar')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});
