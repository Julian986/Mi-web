/**
 * Utilidad para el flujo del Cuaderno de cobros.
 * Ver COBROS_WORKFLOW.md para la documentación completa.
 *
 * Día 0: vence el pago
 * Día +2 o +3: recordatorio de pago
 * Día +5: estadísticas (solo si pagado)
 */

const REMINDER_DAYS = [2, 3] as const;
const STATS_DAY = 5;

/** Clientes que reciben recordatorio la semana anterior (vencimiento en 7 días). Solo nombres. */
export const CLIENTES_RECORDATORIO_SEMANA_ANTERIOR = ["Florencia"] as const;
const DIAS_SEMANA_ANTERIOR = 7;

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

/** Indica si hoy es día de estadísticas para esta cuota (día +5, solo si pagado) */
export function isStatsDay(dueDate: string, paid: boolean, today?: string): boolean {
  if (!paid) return false;
  const todayStr = today ?? getTodayStr();
  return addDays(dueDate, STATS_DAY) === todayStr;
}

export type CobroForWorkflow = {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  servicio?: string;
  estadisticasEnviadas?: boolean;
};

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

/** Cobros que requieren envío de estadísticas hoy (pagados, día +5, no enviadas aún) */
export function getStatsToday(cobros: CobroForWorkflow[], today?: string): CobroForWorkflow[] {
  const todayStr = today ?? getTodayStr();
  return cobros
    .filter((c) => c.paid && !c.estadisticasEnviadas && isStatsDay(c.dueDate, true, todayStr))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
