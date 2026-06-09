"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, todayYmd } from "@/app/admin92/contabilidad/lib/utils";
import type { CalendarMarkers } from "@/app/admin92/contabilidad/lib/calendarMarkers";
import { CALENDAR_LEGEND, MARKER_COLORS } from "@/app/admin92/contabilidad/types";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

type Props = {
  month: string;
  selectedDate: string | null;
  markers: CalendarMarkers;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function getDaysInMonth(ym: string): { date: string; inMonth: boolean }[] {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const daysInMonth = last.getDate();

  let startPad = first.getDay() - 1;
  if (startPad < 0) startPad = 6;

  const cells: { date: string; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i);
    cells.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const lastCell = cells[cells.length - 1];
    const [ly, lm, ld] = lastCell.date.split("-").map(Number);
    const d = new Date(ly, lm - 1, ld + 1);
    cells.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      inMonth: false,
    });
  }

  return cells;
}

export default function MonthCalendar({
  month,
  selectedDate,
  markers,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [clientToday, setClientToday] = useState<string | null>(null);
  useEffect(() => {
    setClientToday(todayYmd());
  }, []);

  const cells = getDaysInMonth(month);
  const renderDots = (color: string, count: number, keyPrefix: string) =>
    Array.from({ length: count }).map((_, idx) => (
      <span
        key={`${keyPrefix}-${idx}`}
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    ));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold text-slate-900">{formatMonthLabel(month)}</h3>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-slate-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date, inMonth }) => {
          const dayMarkers = markers[date];
          const isSelected = selectedDate === date;
          const isToday = clientToday !== null && date === clientToday;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex min-h-[44px] sm:min-h-[52px] flex-col items-center justify-center rounded-lg border text-sm transition-colors cursor-pointer ${
                isSelected
                  ? "border-[#84b9ed] bg-[#84b9ed]/10 font-semibold text-slate-900"
                  : isToday
                    ? "border-[#84b9ed]/50 bg-slate-50 text-slate-900"
                    : inMonth
                      ? "border-transparent text-slate-900 hover:bg-slate-50"
                      : "border-transparent text-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <span>{parseInt(date.slice(8, 10), 10)}</span>
              {dayMarkers && (
                <span className="mt-0.5 flex items-center gap-0.5">
                  {dayMarkers.inversion && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: MARKER_COLORS.inversion }}
                    />
                  )}
                  {renderDots(MARKER_COLORS.cuotaPagada, dayMarkers.cuotaPagadaCount, "pagada")}
                  {renderDots(MARKER_COLORS.cuotaRecordada, dayMarkers.cuotaRecordadaCount, "recordada")}
                  {renderDots(MARKER_COLORS.cuotaPendiente, dayMarkers.cuotaPendienteCount, "pendiente")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        {CALENDAR_LEGEND.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
