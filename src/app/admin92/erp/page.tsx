"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutDashboard, PenLine } from "lucide-react";
import ErpDashboard from "@/app/admin92/erp/components/ErpDashboard";
import ErpDayForm from "@/app/admin92/erp/components/ErpDayForm";
import {
  buildKpis,
  computePeriodStats,
  formatPeriodLabel,
  logsInDates,
  mondayOfWeek,
  periodDates,
  previousPeriodAnchor,
  shiftPeriodAnchor,
  weekDates,
  type ErpPeriod,
} from "@/app/admin92/erp/lib/erpAggregates";
import type { ErpDayLog } from "@/app/admin92/erp/lib/erpTypes";
import { getMonthKeySafe, todayYmd } from "@/app/admin92/contabilidad/lib/utils";

type ViewTab = "dashboard" | "cargar";

const PERIOD_OPTIONS: { key: ErpPeriod; label: string }[] = [
  { key: "day", label: "Día" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
];

export default function ErpPage() {
  const [view, setView] = useState<ViewTab>("dashboard");
  const [dayLogs, setDayLogs] = useState<ErpDayLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => todayYmd());
  const [period, setPeriod] = useState<ErpPeriod>("week");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dates = useMemo(() => periodDates(selectedDate, period), [selectedDate, period]);
  const prevAnchor = useMemo(
    () => previousPeriodAnchor(selectedDate, period),
    [selectedDate, period],
  );
  const prevDates = useMemo(() => periodDates(prevAnchor, period), [prevAnchor, period]);

  const currentLogs = useMemo(() => logsInDates(dayLogs, dates), [dayLogs, dates]);
  const previousLogs = useMemo(() => logsInDates(dayLogs, prevDates), [dayLogs, prevDates]);

  const currentStats = useMemo(
    () => computePeriodStats(currentLogs, dates, period),
    [currentLogs, dates, period],
  );
  const previousStats = useMemo(() => {
    if (previousLogs.length === 0) return null;
    return computePeriodStats(previousLogs, prevDates, period);
  }, [previousLogs, prevDates, period]);

  const kpis = useMemo(
    () => buildKpis(currentStats, previousStats, period),
    [currentStats, previousStats, period],
  );

  const focusLog = useMemo(() => {
    if (period === "day") return dayLogs.find((l) => l.date === selectedDate);
    const today = todayYmd();
    if (dates.includes(today)) return dayLogs.find((l) => l.date === today);
    return dayLogs.find((l) => l.date === selectedDate);
  }, [dayLogs, dates, period, selectedDate]);

  const rangeLabel = formatPeriodLabel(selectedDate, period);

  const requestedDates = useMemo(() => {
    if (view === "cargar") return weekDates(mondayOfWeek(selectedDate));
    return [...prevDates, ...dates].sort();
  }, [dates, prevDates, selectedDate, view]);

  const requestFrom = requestedDates[0];
  const requestTo = requestedDates[requestedDates.length - 1];

  useEffect(() => {
    if (!requestFrom || !requestTo) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    void fetch(`/api/admin/erp-logs?from=${requestFrom}&to=${requestTo}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json()) as { logs?: ErpDayLog[]; error?: string };
        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar los registros.");
        }
        const incoming = data.logs ?? [];
        setDayLogs((previous) => {
          const outsideRange = previous.filter(
            (log) => log.date < requestFrom || log.date > requestTo,
          );
          return [...outsideRange, ...incoming].sort((a, b) => a.date.localeCompare(b.date));
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(
          error instanceof Error ? error.message : "No se pudieron cargar los registros.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestFrom, requestTo]);

  const upsertLocalLog = (log: ErpDayLog) => {
    setDayLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date);
      if (idx === -1) return [...prev, log].sort((a, b) => a.date.localeCompare(b.date));
      const next = [...prev];
      next[idx] = log;
      return next;
    });
  };

  const handleSaveDay = async (log: ErpDayLog): Promise<ErpDayLog> => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/admin/erp-logs/${log.date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });
      const data = (await response.json()) as {
        log?: ErpDayLog;
        error?: string;
      };
      if (!response.ok || !data.log) {
        throw new Error(data.error || "No se pudo guardar el día.");
      }
      upsertLocalLog(data.log);
      return data.log;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el día.";
      setSaveError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDay = async (date: string): Promise<void> => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/admin/erp-logs/${date}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el día.");
      }
      setDayLogs((previous) => previous.filter((log) => log.date !== date));
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el día.";
      setSaveError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const goPrev = () => setSelectedDate(shiftPeriodAnchor(selectedDate, period, -1));
  const goNext = () => setSelectedDate(shiftPeriodAnchor(selectedDate, period, 1));

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin92/contabilidad"
              aria-label="Volver a contabilidad"
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  ERP Personal
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Filtrá por día, semana o mes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setView("dashboard")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  view === "dashboard"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setView("cargar")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer ${
                  view === "cargar"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <PenLine className="h-4 w-4" />
                Cargar día
              </button>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {loadError}
          </div>
        )}

        {view === "dashboard" ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPeriod(opt.key)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium transition cursor-pointer ${
                      period === opt.key
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Período anterior"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {period === "month" ? (
                  <input
                    type="month"
                    value={getMonthKeySafe(selectedDate)}
                    onChange={(e) => {
                      const ym = e.target.value;
                      if (ym) setSelectedDate(`${ym}-01`);
                    }}
                    className="rounded-lg border-0 bg-transparent px-2 py-1 text-sm font-medium text-slate-700 outline-none"
                  />
                ) : (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-lg border-0 bg-transparent px-2 py-1 text-sm font-medium text-slate-700 outline-none"
                  />
                )}

                <span className="hidden text-sm text-slate-400 sm:inline">{rangeLabel}</span>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Período siguiente"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ErpDashboard
              period={period}
              rangeLabel={rangeLabel}
              current={currentStats}
              previous={previousStats}
              kpis={kpis}
              focusLog={focusLog}
              loading={loading}
              hasData={currentLogs.length > 0}
            />
          </>
        ) : (
          <ErpDayForm
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            dayLogs={dayLogs}
            onSave={handleSaveDay}
            onDelete={handleDeleteDay}
            loading={loading}
            saving={saving}
            saveError={saveError}
          />
        )}
      </div>
    </main>
  );
}
