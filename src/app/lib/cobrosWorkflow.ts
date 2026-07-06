/**
 * Utilidad para el flujo del Cuaderno de cobros.
 * Ver COBROS_WORKFLOW.md para la documentación completa.
 *
 * Día 0: vence el pago
 * Día +2 o +3: recordatorio de pago
 * Día +5 desde cobro: estadísticas (solo si pagado y la cuota requiere)
 */

const REMINDER_DAYS = [2, 3] as const;
const STATS_DAY = 5;

/** Clientes que reciben recordatorio la semana anterior (vencimiento en 7 días). Solo nombres. */
export const CLIENTES_RECORDATORIO_SEMANA_ANTERIOR = ["Florencia"] as const;
const DIAS_SEMANA_ANTERIOR = 7;

function normalizeClient(name: string): string {
  return String(name || "").trim().toLowerCase();
}

/** Suma días a una fecha YYYY-MM-DD */
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Obtiene la fecha de hoy en YYYY-MM-DD (zona local) */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Indica si hoy es día de recordatorio para esta cuota (día +2 o +3) */
export function isReminderDay(dueDate: string, today?: string): boolean {
  const todayStr = today ?? getTodayStr();
  return REMINDER_DAYS.some((d) => addDays(dueDate, d) === todayStr);
}

/** Fecha objetivo de estadísticas (cobro + 5) */
export function getStatsObjectiveDate(cobro: {
  paid: boolean;
  fechaCobro?: string;
  dueDate: string;
}): string | null {
  if (!cobro.paid) return null;
  const base = cobro.fechaCobro || cobro.dueDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) return null;
  return addDays(base, STATS_DAY);
}

/** Indica si hoy es el día objetivo de estadísticas */
export function isStatsObjectiveDay(
  cobro: { paid: boolean; fechaCobro?: string; dueDate: string },
  today?: string,
): boolean {
  const todayStr = today ?? getTodayStr();
  const objetivo = getStatsObjectiveDate(cobro);
  return objetivo === todayStr;
}

export type CobroForWorkflow = {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  fechaCobro?: string;
  servicio?: string;
  origen?: "manual" | "suscripcion_mp";
  estadisticasEnviadas?: boolean;
  requiereEstadisticas?: boolean;
};

function cobroRequiresStats(
  c: CobroForWorkflow,
  requiereByClient?: Map<string, boolean>,
): boolean {
  if (c.requiereEstadisticas !== undefined) {
    return Boolean(c.requiereEstadisticas);
  }
  return clientRequiresStats(c.clientName, requiereByClient);
}

function clientRequiresStats(
  clientName: string,
  requiereByClient?: Map<string, boolean>,
): boolean {
  if (!requiereByClient) return false;
  return Boolean(requiereByClient.get(normalizeClient(clientName)));
}

/** Cobros que requieren recordatorio hoy (día +2 o +3) */
export function getRemindersToday(cobros: CobroForWorkflow[], today?: string): CobroForWorkflow[] {
  const todayStr = today ?? getTodayStr();
  return cobros
    .filter((c) => !c.paid && isReminderDay(c.dueDate, todayStr))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Cobros que requieren recordatorio "semana anterior" (vencen en 7 días). Solo clientes en CLIENTES_RECORDATORIO_SEMANA_ANTERIOR. */
export function getRemindersWeekBefore(cobros: CobroForWorkflow[], today?: string): CobroForWorkflow[] {
  const todayStr = today ?? getTodayStr();
  const dueIn7 = addDays(todayStr, DIAS_SEMANA_ANTERIOR);
  return cobros
    .filter(
      (c) =>
        !c.paid &&
        c.dueDate === dueIn7 &&
        CLIENTES_RECORDATORIO_SEMANA_ANTERIOR.some((name) => name === c.clientName)
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Cobros con estadísticas en el día objetivo (cobro + 5) */
export function getStatsToday(
  cobros: CobroForWorkflow[],
  today?: string,
  requiereByClient?: Map<string, boolean>,
): CobroForWorkflow[] {
  const todayStr = today ?? getTodayStr();
  return cobros
    .filter(
      (c) =>
        c.paid &&
        !c.estadisticasEnviadas &&
        cobroRequiresStats(c, requiereByClient) &&
        isStatsObjectiveDay(c, todayStr),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** Cobros con estadísticas atrasadas (pasó el día objetivo) */
export function getStatsOverdue(
  cobros: CobroForWorkflow[],
  today?: string,
  requiereByClient?: Map<string, boolean>,
): CobroForWorkflow[] {
  const todayStr = today ?? getTodayStr();
  return cobros
    .filter((c) => {
      if (!c.paid || c.estadisticasEnviadas) return false;
      if (!cobroRequiresStats(c, requiereByClient)) return false;
      const objetivo = getStatsObjectiveDate(c);
      return objetivo !== null && todayStr > objetivo;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** @deprecated Usar isStatsObjectiveDay — mantiene compatibilidad con dueDate + 5 */
export function isStatsDay(dueDate: string, paid: boolean, today?: string): boolean {
  if (!paid) return false;
  const todayStr = today ?? getTodayStr();
  return addDays(dueDate, STATS_DAY) === todayStr;
}
