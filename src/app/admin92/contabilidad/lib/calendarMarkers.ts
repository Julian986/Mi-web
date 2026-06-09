import type { AccountingType } from "@/app/admin92/contabilidad/types";
import { getRecordDateStr } from "@/app/admin92/contabilidad/lib/utils";
import { getCuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";

export type DayMarkerTypes = {
  /** Registro contable de inversión ese día */
  inversion: boolean;
  /** Cantidad de cuotas pendientes (sin recordatorio) */
  cuotaPendienteCount: number;
  /** Cantidad de cuotas con recordatorio enviado */
  cuotaRecordadaCount: number;
  /** Cantidad de cuotas pagadas (por vencimiento) */
  cuotaPagadaCount: number;
};

export type CalendarMarkers = Record<string, DayMarkerTypes>;

type RecordLike = {
  type: AccountingType;
  date: string;
};

type CobroLike = {
  dueDate: string;
  paid: boolean;
  recordatorioEnviado?: boolean;
};

function emptyDayMarkers(): DayMarkerTypes {
  return {
    inversion: false,
    cuotaPendienteCount: 0,
    cuotaRecordadaCount: 0,
    cuotaPagadaCount: 0,
  };
}

export function buildCalendarMarkers(
  records: RecordLike[],
  cobrosDelMes: CobroLike[] = [],
): CalendarMarkers {
  const markers: CalendarMarkers = {};
  for (const r of records) {
    if (r.type !== "inversion") continue;
    const day = getRecordDateStr(r.date);
    if (!markers[day]) markers[day] = emptyDayMarkers();
    markers[day].inversion = true;
  }
  for (const c of cobrosDelMes) {
    const day = c.dueDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    if (!markers[day]) markers[day] = emptyDayMarkers();
    const estado = getCuotaEstado(c);
    if (estado === "pagada") markers[day].cuotaPagadaCount += 1;
    else if (estado === "recordada") markers[day].cuotaRecordadaCount += 1;
    else markers[day].cuotaPendienteCount += 1;
  }
  return markers;
}
