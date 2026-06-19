import type { CuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";
import type { CuotaOperativaBorder } from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import { getMonthKeySafe } from "@/app/admin92/contabilidad/lib/utils";

export type CambiosSortMode = "fecha" | "prioridad";

export type CuotaCambioItem = {
  id: string;
  clientName: string;
  dueDate: string;
  servicio?: string;
  prioridad?: number;
  estado: CuotaEstado;
  border: CuotaOperativaBorder;
};

type CobroCambioLike = {
  dueDate: string;
  cambioPendiente?: boolean;
};

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
  return copy.sort((a, b) => {
    const pa = a.prioridad ?? PRIORIDAD_SIN_ASIGNAR;
    const pb = b.prioridad ?? PRIORIDAD_SIN_ASIGNAR;
    if (pa !== pb) return pa - pb;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
