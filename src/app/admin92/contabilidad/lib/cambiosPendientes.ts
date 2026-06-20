import type { CuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";
import type { CuotaOperativaBorder } from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import { getTaskSortDate, type SolicitudTask } from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import { getMonthKeySafe } from "@/app/admin92/contabilidad/lib/utils";

export type CambiosSortMode = "fecha" | "prioridad" | "tareas";

export type CuotaCambioItem = {
  id: string;
  clientName: string;
  dueDate: string;
  servicio?: string;
  prioridad?: number;
  estado: CuotaEstado;
  border: CuotaOperativaBorder;
};

export type CambioTaskListItem = {
  taskId: string;
  text: string;
  done: boolean;
  fecha: string;
  cobroId: string;
  clientName: string;
  dueDate: string;
  servicio?: string;
  estado: CuotaEstado;
  border: CuotaOperativaBorder;
};

type CobroConTareas = {
  id: string;
  clientName: string;
  dueDate: string;
  servicio?: string;
  paid: boolean;
  fechaCobro?: string;
  recordatorioEnviado?: boolean;
  estadisticasEnviadas?: boolean;
  cambioPendiente?: boolean;
  solicitudTasks?: SolicitudTask[];
};

type CobroCambioLike = {
  dueDate: string;
  cambioPendiente?: boolean;
};

export function buildTareasCambioDelMes(
  cobros: CobroConTareas[],
  metaFor: (c: CobroConTareas) => { estado: CuotaEstado; border: CuotaOperativaBorder },
): CambioTaskListItem[] {
  const items: CambioTaskListItem[] = [];
  for (const c of cobros) {
    if (!c.cambioPendiente) continue;
    const tasks = c.solicitudTasks ?? [];
    if (tasks.length === 0) continue;
    const { estado, border } = metaFor(c);
    for (const t of tasks) {
      if (t.fueraColaActiva) continue;
      items.push({
        taskId: t.id,
        text: t.text,
        done: t.done,
        fecha: getTaskSortDate(t, c.dueDate),
        cobroId: c.id,
        clientName: c.clientName,
        dueDate: c.dueDate,
        servicio: c.servicio,
        estado,
        border,
      });
    }
  }
  return sortTareasCambioPorFecha(items);
}

export function sortTareasCambioPorFecha(items: CambioTaskListItem[]): CambioTaskListItem[] {
  return [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const byFecha = a.fecha.localeCompare(b.fecha);
    if (byFecha !== 0) return byFecha;
    const byCuota = a.dueDate.localeCompare(b.dueDate);
    if (byCuota !== 0) return byCuota;
    return a.text.localeCompare(b.text);
  });
}

/** Cuotas con cambio abierto en meses anteriores al mes visible del calendario */
export function countCambiosAtrasados(cobros: CobroCambioLike[], monthKey: string): number {
  return cobros.filter(
    (c) => Boolean(c.cambioPendiente) && getMonthKeySafe(c.dueDate) < monthKey,
  ).length;
}

export type MesCambiosAtrasados = {
  monthKey: string;
  count: number;
};

/** Meses (anteriores al visible) con al menos una cuota con cambio pendiente */
export function getMesesConCambiosAtrasados(
  cobros: CobroCambioLike[],
  monthKey: string,
): MesCambiosAtrasados[] {
  const byMonth = new Map<string, number>();
  for (const c of cobros) {
    if (!c.cambioPendiente) continue;
    const mk = getMonthKeySafe(c.dueDate);
    if (mk >= monthKey) continue;
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + 1);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mk, count]) => ({ monthKey: mk, count }));
}

const PRIORIDAD_SIN_ASIGNAR = 9999;

export function sortCuotasCambiosPendientes<T extends CuotaCambioItem>(
  cuotas: T[],
  mode: CambiosSortMode,
): T[] {
  const copy = [...cuotas];
  if (mode === "fecha") {
    return copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }
  if (mode === "prioridad") {
    return copy.sort((a, b) => {
      const pa = a.prioridad ?? PRIORIDAD_SIN_ASIGNAR;
      const pb = b.prioridad ?? PRIORIDAD_SIN_ASIGNAR;
      if (pa !== pb) return pa - pb;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return copy;
}
