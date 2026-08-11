"use client";

import { useMemo, useState, type ComponentType } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  formatHoursAsHm,
  normalizeWork,
  normalizeWorkTimers,
  sumWorkHours,
  WORK_CATEGORY_META,
  type ErpActiveWorkTimer,
  type ErpDayLog,
  type WorkCategoryKey,
} from "@/app/admin92/erp/lib/erpTypes";
import { formatSecondsAsClock } from "@/app/admin92/erp/lib/parseWorkTimersPaste";
import { formatLocalDate } from "@/app/admin92/contabilidad/lib/utils";
import LiveTimerPlayButton from "@/app/admin92/erp/components/LiveTimerPlayButton";

type Props = {
  logs: ErpDayLog[];
  icons: Record<WorkCategoryKey, ComponentType<{ className?: string }>>;
  activeWorkTimer?: ErpActiveWorkTimer | null;
  onStartLiveTimer?: (category: WorkCategoryKey, name: string) => Promise<void>;
  timerSaving?: boolean;
};

function dayHasWork(log: ErpDayLog): boolean {
  const work = normalizeWork(log.work);
  if (sumWorkHours(work) > 0) return true;
  const timers = normalizeWorkTimers(log.workTimers);
  return WORK_CATEGORY_META.some((c) => (timers[c.key] ?? []).length > 0);
}

export default function WorkCategoriesHistory({
  logs,
  icons,
  activeWorkTimer = null,
  onStartLiveTimer,
  timerSaving = false,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const days = useMemo(() => {
    return [...logs]
      .filter(dayHasWork)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((log) => {
        const work = normalizeWork(log.work);
        const workTimers = normalizeWorkTimers(log.workTimers);
        const total = sumWorkHours(work);
        const categories = WORK_CATEGORY_META.map((c) => ({
          ...c,
          hours: work[c.key] ?? 0,
          timers: workTimers[c.key] ?? [],
        })).filter((c) => c.hours > 0 || c.timers.length > 0);
        return { log, total, categories };
      });
  }, [logs]);

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (days.length === 0) {
    return (
      <p className="py-6 text-center text-sm font-medium text-slate-400">
        Sin historial de trabajo en este período
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-slate-500">
        Más reciente → más antiguo · Play inicia el timer de hoy
      </p>

      {days.map(({ log, total, categories }) => (
        <div key={log.date} className="space-y-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <p className="text-sm font-bold text-slate-950">
              {formatLocalDate(log.date)}
            </p>
            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {formatHoursAsHm(total)} hs
            </span>
          </div>

          {categories.map((cat) => {
            const Icon = icons[cat.key];
            const pct = total > 0 ? Math.round((cat.hours / total) * 100) : 0;
            const expandKey = `${log.date}:${cat.key}`;
            const open = Boolean(expanded[expandKey]);

            return (
              <div key={expandKey}>
                <div className="flex items-start gap-1.5">
                  {onStartLiveTimer && (
                    <div className="pt-0.5">
                      <LiveTimerPlayButton
                        category={cat.key}
                        name=""
                        activeWorkTimer={activeWorkTimer}
                        onToggle={onStartLiveTimer}
                        disabled={timerSaving}
                        label={`Iniciar ${cat.name}`}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggle(expandKey)}
                    aria-expanded={open}
                    className="group min-w-0 flex-1 cursor-pointer rounded-lg text-left transition hover:bg-slate-50/80"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2 px-1 py-0.5">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                        {open ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        )}
                        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-slate-950">
                        {formatHoursAsHm(cat.hours)} hs
                        <span
                          className="ml-2 text-sm font-bold tabular-nums"
                          style={{ color: "#1571d4" }}
                        >
                          {pct}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </button>
                </div>

                <div
                  className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <ul className="mt-2 ml-2 space-y-1.5 border-l-2 border-slate-100 pl-3">
                      {cat.timers.length === 0 ? (
                        (() => {
                          const orphanSeconds = Math.round(cat.hours * 3600);
                          if (orphanSeconds <= 0) {
                            return (
                              <li className="text-xs font-medium text-slate-500">
                                Sin desglose de timers
                              </li>
                            );
                          }
                          return (
                            <li className="flex items-start gap-1.5 rounded-lg px-1.5 py-1">
                              {onStartLiveTimer && (
                                <LiveTimerPlayButton
                                  category={cat.key}
                                  name=""
                                  activeWorkTimer={activeWorkTimer}
                                  onToggle={onStartLiveTimer}
                                  disabled={timerSaving}
                                  label={`Iniciar ${cat.name} sin nombre`}
                                />
                              )}
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                <span className="min-w-0 truncate text-xs font-semibold text-amber-800">
                                  Horas sin desglose
                                </span>
                                <span className="shrink-0 font-mono text-xs font-semibold text-slate-950">
                                  {formatSecondsAsClock(orphanSeconds)}
                                </span>
                              </div>
                            </li>
                          );
                        })()
                      ) : (
                        cat.timers.map((timer, index) => (
                          <li
                            key={`${log.date}-${cat.key}-${index}-${timer.name}`}
                            className="flex items-start gap-1.5 rounded-lg px-1.5 py-1"
                          >
                            {onStartLiveTimer && (
                              <LiveTimerPlayButton
                                category={cat.key}
                                name={timer.name}
                                activeWorkTimer={activeWorkTimer}
                                onToggle={onStartLiveTimer}
                                disabled={timerSaving}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="min-w-0 truncate text-xs font-semibold text-slate-800">
                                  {timer.name}
                                </span>
                                <span className="shrink-0 font-mono text-xs font-semibold text-slate-950">
                                  {formatSecondsAsClock(timer.seconds)}
                                </span>
                              </div>
                              {(timer.items ?? []).length > 0 && (
                                <ul className="mt-1 space-y-0.5 pl-2">
                                  {(timer.items ?? []).map((item) => (
                                    <li
                                      key={item.id}
                                      className={`truncate text-[11px] ${
                                        item.done
                                          ? "text-slate-400 line-through"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      · {item.text}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
