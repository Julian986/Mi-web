import type { AccountingType } from "@/app/admin92/contabilidad/types";
import { getRecordDateStr } from "@/app/admin92/contabilidad/lib/utils";
import { getCuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";

export type DayMarkerTypes = {
  ingreso: boolean;
  gasto: boolean;
  inversion: boolean;
  /** Cuota pendiente (sin recordatorio) */
  cuotaPendiente: boolean;
  /** Cuota con recordatorio enviado */
  cuotaRecordada: boolean;
  /** Cuota pagada (por vencimiento) */
  cuotaPagada: boolean;
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
    ingreso: false,
    gasto: false,
    inversion: false,
    cuotaPendiente: false,
    cuotaRecordada: false,
    cuotaPagada: false,
  };
}

export function buildCalendarMarkers(
  records: RecordLike[],
  cobrosDelMes: CobroLike[] = [],
): CalendarMarkers {
  const markers: CalendarMarkers = {};
  for (const r of records) {
    const day = getRecordDateStr(r.date);
    if (!markers[day]) markers[day] = emptyDayMarkers();
    markers[day][r.type] = true;
  }
  for (const c of cobrosDelMes) {
    const day = c.dueDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    if (!markers[day]) markers[day] = emptyDayMarkers();
    const estado = getCuotaEstado(c);
    if (estado === "pagada") markers[day].cuotaPagada = true;
    else if (estado === "recordada") markers[day].cuotaRecordada = true;
    else markers[day].cuotaPendiente = true;
  }
  return markers;
}
