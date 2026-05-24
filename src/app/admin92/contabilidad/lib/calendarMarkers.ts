import type { AccountingType } from "@/app/admin92/contabilidad/types";
import { getRecordDateStr } from "@/app/admin92/contabilidad/lib/utils";

export type DayMarkerTypes = {
  ingreso: boolean;
  gasto: boolean;
  inversion: boolean;
  /** Cuota pendiente con vencimiento ese día */
  esperado: boolean;
};

export type CalendarMarkers = Record<string, DayMarkerTypes>;

type RecordLike = {
  type: AccountingType;
  date: string;
};

type CobroLike = {
  dueDate: string;
  paid: boolean;
};

function emptyDayMarkers(): DayMarkerTypes {
  return { ingreso: false, gasto: false, inversion: false, esperado: false };
}

export function buildCalendarMarkers(
  records: RecordLike[],
  cobrosPendientes: CobroLike[] = [],
): CalendarMarkers {
  const markers: CalendarMarkers = {};
  for (const r of records) {
    const day = getRecordDateStr(r.date);
    if (!markers[day]) markers[day] = emptyDayMarkers();
    markers[day][r.type] = true;
  }
  for (const c of cobrosPendientes) {
    if (c.paid) continue;
    const day = c.dueDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    if (!markers[day]) markers[day] = emptyDayMarkers();
    markers[day].esperado = true;
  }
  return markers;
}
