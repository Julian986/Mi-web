export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function getMonthKey(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

/** Formatea YYYY-MM-DD como fecha local (evita bug de timezone) */
export function formatLocalDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR");
}

/** Obtiene YYYY-MM para filtros (usa componentes locales si es YYYY-MM-DD) */
export function getMonthKeySafe(dateStr: string | Date): string {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.slice(0, 7);
  }
  return getMonthKey(dateStr);
}

/** Normaliza fecha de registro contable a YYYY-MM-DD */
export function getRecordDateStr(date: string | Date): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString("es-AR")} ARS`;
}

export function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function contabilidadMonthOptions(): string[] {
  const START_MONTH = "2026-02";
  const now = new Date();
  const options: string[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = getMonthKey(d);
    if (ym < START_MONTH) break;
    options.push(ym);
  }
  return options;
}

export function cobroMonthOptions(): string[] {
  const now = new Date();
  const options: string[] = [];
  for (let i = -12; i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push(getMonthKey(d));
  }
  return options;
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return getMonthKey(d);
}

/** Suma o resta días a YYYY-MM-DD (calendario local) */
export function shiftDate(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(y, m - 1, d + deltaDays);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
}
