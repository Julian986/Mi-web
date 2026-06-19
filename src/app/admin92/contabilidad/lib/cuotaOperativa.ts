import type { CuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";
import { shiftDate } from "@/app/admin92/contabilidad/lib/utils";

export type SolicitudTask = {
  id: string;
  text: string;
  done: boolean;
};

export type ProyectoOperativo = {
  id: string;
  clientName: string;
  status?: string;
  requiereEstadisticas?: boolean;
  cambioPendiente?: boolean;
  solicitudTasks?: SolicitudTask[];
  ultimaSolicitud?: string;
};

export type CuotaOperativaBorder = "none" | "cambio" | "stats" | "both";

export type CuotaDotMarker = {
  estado: CuotaEstado;
  border: CuotaOperativaBorder;
};

const STATS_OFFSET_DAYS = 5;

export function normalizeClientName(name: string): string {
  return String(name || "").trim().toLowerCase();
}

export function buildProyectoByClientMap(
  proyectos: ProyectoOperativo[],
): Map<string, ProyectoOperativo> {
  const map = new Map<string, ProyectoOperativo>();
  for (const p of proyectos) {
    const key = normalizeClientName(p.clientName);
    const cur = map.get(key);
    if (!cur) {
      map.set(key, p);
      continue;
    }
    if (cur.status === "archivado" && p.status !== "archivado") {
      map.set(key, p);
    }
  }
  return map;
}

export function getProyectoForClient(
  clientName: string,
  map: Map<string, ProyectoOperativo>,
): ProyectoOperativo | null {
  return map.get(normalizeClientName(clientName)) ?? null;
}

export function getStatsObjectiveDate(cobro: {
  paid: boolean;
  fechaCobro?: string;
  dueDate: string;
}): string | null {
  if (!cobro.paid) return null;
  const base = cobro.fechaCobro || cobro.dueDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) return null;
  return shiftDate(base, STATS_OFFSET_DAYS);
}

export function hasCambioPendiente(cobro: { cambioPendiente?: boolean }): boolean {
  return Boolean(cobro.cambioPendiente);
}

export function hasStatsPendientes(
  cobro: {
    paid: boolean;
    fechaCobro?: string;
    dueDate: string;
    estadisticasEnviadas?: boolean;
  },
  proyecto: ProyectoOperativo | null | undefined,
  today: string,
): boolean {
  if (!proyecto?.requiereEstadisticas) return false;
  if (!cobro.paid || cobro.estadisticasEnviadas) return false;
  const objetivo = getStatsObjectiveDate(cobro);
  if (!objetivo) return false;
  return today >= objetivo;
}

export function getCuotaOperativaBorder(
  cobro: {
    paid: boolean;
    fechaCobro?: string;
    dueDate: string;
    estadisticasEnviadas?: boolean;
    cambioPendiente?: boolean;
  },
  proyecto: ProyectoOperativo | null | undefined,
  today: string,
): CuotaOperativaBorder {
  const cambio = hasCambioPendiente(cobro);
  const stats = hasStatsPendientes(cobro, proyecto, today);
  if (cambio && stats) return "both";
  if (cambio) return "cambio";
  if (stats) return "stats";
  return "none";
}

export function newSolicitudTaskId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
