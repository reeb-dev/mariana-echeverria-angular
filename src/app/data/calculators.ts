/**
 * Cálculos de las herramientas para clientes. Los porcentajes que figuran por defecto son supuestos de referencia
 * y se pueden cambiar: dependen de la jurisdicción y de cada operación, y se tienen que confirmar con escribanía.
 */

export type PurchaseCostsInput = {
  price: number;
  /** Honorarios inmobiliarios a cargo del comprador (%). */
  agencyPct: number;
  /** Impuesto de sellos a cargo del comprador (%). */
  stampPct: number;
  /** Honorarios y gastos de escribanía (%). */
  notaryPct: number;
  /** Otros gastos de inscripción y certificados (% estimado). */
  otherPct: number;
};

export type PurchaseCostsResult = {
  lines: { label: string; pct: number; amount: number }[];
  total: number;
  /** Cuánto hay que tener además del precio. */
  totalWithPrice: number;
};

export function purchaseCosts(input: PurchaseCostsInput): PurchaseCostsResult {
  const rows: [string, number][] = [
    ['Honorarios de la inmobiliaria', input.agencyPct],
    ['Impuesto de sellos', input.stampPct],
    ['Escribanía', input.notaryPct],
    ['Inscripciones y certificados', input.otherPct],
  ];
  const lines = rows.map(([label, pct]) => ({ label, pct, amount: Math.round((input.price * pct) / 100) }));
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total, totalWithPrice: input.price + total };
}

export type RentInput = {
  monthlyRent: number;
  /** Variación pactada del índice en el período (%), por ejemplo la del trimestre. */
  adjustmentPct: number;
  /** Meses del contrato, para estimar los honorarios por única vez. */
  months: number;
  /** Cantidad de alquileres que se piden como depósito. */
  depositMonths: number;
  /** Honorarios del inquilino (en alquileres mensuales). */
  agencyMonths: number;
};

export type RentResult = {
  adjustedRent: number;
  increase: number;
  deposit: number;
  agency: number;
  /** Lo que se paga para entrar: primer mes + depósito + honorarios. */
  moveInTotal: number;
};

export function rentCosts(input: RentInput): RentResult {
  const adjustedRent = Math.round(input.monthlyRent * (1 + input.adjustmentPct / 100));
  const deposit = Math.round(input.monthlyRent * input.depositMonths);
  const agency = Math.round(input.monthlyRent * input.agencyMonths);
  return {
    adjustedRent,
    increase: adjustedRent - input.monthlyRent,
    deposit,
    agency,
    moveInTotal: input.monthlyRent + deposit + agency,
  };
}

/** Fecha local en formato AAAA-MM-DD. `toISOString()` usa UTC y de noche, en Argentina, ya devuelve el día siguiente. */
export function localIsoDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Suma meses a una fecha AAAA-MM-DD (si el día no existe en el mes destino, queda en el último día del mes). */
export function addMonths(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, lastDay));
  return localIsoDate(target);
}

export function daysUntil(isoDate: string, from = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`).getTime();
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((target - base) / 86_400_000);
}

/** Próxima fecha de ajuste a partir del inicio y la frecuencia; null si no hay ajuste o ya venció el contrato. */
export function nextAdjustment(startDate: string, everyMonths: number, endDate: string, from = new Date()): string | null {
  if (everyMonths <= 0) return null;
  let candidate = addMonths(startDate, everyMonths);
  let guard = 0;
  while (daysUntil(candidate, from) < 0 && guard++ < 240) {
    candidate = addMonths(candidate, everyMonths);
  }
  return candidate <= endDate ? candidate : null;
}
