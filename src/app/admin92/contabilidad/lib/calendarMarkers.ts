import type { AccountingType } from "@/app/admin92/contabilidad/types";
import { getRecordDateStr } from "@/app/admin92/contabilidad/lib/utils";
import { getCuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";

export type DayMarkerTypes = {
  ingreso: boolean;
  gasto: boolean;
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
  _id?: string;
  type: AccountingType;
  date: string;
};

type CobroLike = {
  dueDate: string;
  paid: boolean;
  recordatorioEnviado?: boolean;
  accountingRecordId?: string;
};

function emptyDayMarkers(): DayMarkerTypes {
  return {
    ingreso: false,
    gasto: false,
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
  const cuotaAccountingRecordIds = new Set(
    cobrosDelMes
      .map((c) => c.accountingRecordId)
      .filter((id): id is string => Boolean(id)),
  );
  for (const r of records) {
    // Si el ingreso está vinculado a una cuota, no agregamos punto celeste
    // para evitar duplicar el marcador de esa misma cuota en el calendario.
    if (r._id && cuotaAccountingRecordIds.has(r._id)) continue;
    const day = getRecordDateStr(r.date);
    if (!markers[day]) markers[day] = emptyDayMarkers();
    markers[day][r.type] = true;
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
