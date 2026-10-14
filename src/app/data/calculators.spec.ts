import { addMonths, daysUntil, localIsoDate, nextAdjustment, purchaseCosts, rentCosts } from './calculators';

describe('calculadoras', () => {
  describe('purchaseCosts', () => {
    it('suma los gastos sobre el precio', () => {
      const r = purchaseCosts({ price: 54000, agencyPct: 3, stampPct: 1.5, notaryPct: 2, otherPct: 1 });
      expect(r.lines.map((l) => l.amount)).toEqual([1620, 810, 1080, 540]);
      expect(r.total).toBe(4050);
      expect(r.totalWithPrice).toBe(58050);
    });

    it('con precio cero no da gastos', () => {
      const r = purchaseCosts({ price: 0, agencyPct: 3, stampPct: 1.5, notaryPct: 2, otherPct: 1 });
      expect(r.total).toBe(0);
    });
  });

  describe('rentCosts', () => {
    it('ajusta el alquiler y calcula lo que hay que pagar para entrar', () => {
      const r = rentCosts({ monthlyRent: 300000, adjustmentPct: 10, months: 24, depositMonths: 1, agencyMonths: 1 });
      expect(r.adjustedRent).toBe(330000);
      expect(r.increase).toBe(30000);
      expect(r.deposit).toBe(300000);
      expect(r.agency).toBe(300000);
      expect(r.moveInTotal).toBe(900000);
    });
  });

  describe('fechas', () => {
    it('localIsoDate usa la fecha local y no la UTC', () => {
      expect(localIsoDate(new Date(2026, 9, 14, 23, 30))).toBe('2026-10-14');
      expect(localIsoDate(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    });

    it('addMonths suma meses y respeta el fin de mes', () => {
      expect(addMonths('2026-01-15', 4)).toBe('2026-05-15');
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
      expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
    });

    it('daysUntil cuenta días corridos', () => {
      const from = new Date(2026, 9, 14, 18, 0);
      expect(daysUntil('2026-10-14', from)).toBe(0);
      expect(daysUntil('2026-10-24', from)).toBe(10);
      expect(daysUntil('2026-10-10', from)).toBe(-4);
    });

    it('nextAdjustment devuelve el próximo ajuste dentro del contrato', () => {
      const from = new Date(2026, 9, 14);
      // empezó el 15/1 y se ajusta cada 4 meses: 15/5, 15/9, 15/1
      expect(nextAdjustment('2026-01-15', 4, '2027-01-15', from)).toBe('2027-01-15');
      // empezó el 1/6 y se ajusta cada 4 meses: 1/10 ya pasó a esta fecha (14/10), el siguiente es 1/2
      expect(nextAdjustment('2026-06-01', 4, '2027-06-01', from)).toBe('2027-02-01');
    });

    it('nextAdjustment es null si no hay ajuste o ya terminó', () => {
      const from = new Date(2026, 9, 14);
      expect(nextAdjustment('2026-01-15', 0, '2027-01-15', from)).toBeNull();
      expect(nextAdjustment('2025-01-15', 4, '2025-12-15', from)).toBeNull();
    });
  });
});
