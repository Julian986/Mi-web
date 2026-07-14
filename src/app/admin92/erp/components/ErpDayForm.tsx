"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  Check,
  Dumbbell,
  Home,
  LoaderCircle,
  Trash2,
  Waves,
} from "lucide-react";
import {
  dayShortLabel,
  mondayOfWeek,
  weekDates,
} from "@/app/admin92/erp/lib/erpAggregates";
import {
  emptyDayLog,
  emptyTrainingSession,
  formatHoursAsHm,
  minutesBetweenTimes,
  normalizeTraining,
  parseDurationToHours,
  parseMinutes,
  sumWorkHours,
  WORK_CATEGORY_META,
  type ErpDayLog,
  type ErpTrainingSession,
  type TrainingCategoryKey,
  type WorkCategoryKey,
} from "@/app/admin92/erp/lib/erpTypes";
import { formatLocalDate } from "@/app/admin92/contabilidad/lib/utils";

type Props = {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  dayLogs: ErpDayLog[];
  onSave: (log: ErpDayLog) => Promise<ErpDayLog>;
  onDelete: (date: string) => Promise<void>;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
};

const trainingMeta: {
  key: TrainingCategoryKey;
  label: string;
  icon: typeof Dumbbell;
}[] = [
  { key: "gimnasio", label: "Gimnasio", icon: Dumbbell },
  { key: "natacion", label: "Natación", icon: Waves },
  { key: "casa", label: "En casa", icon: Home },
];

function cloneLog(log: ErpDayLog): ErpDayLog {
  const training = normalizeTraining(log.training);
  return {
    ...log,
    alarm: { ...log.alarm },
    work: { ...log.work },
    training: {
      gimnasio: { ...training.gimnasio },
      natacion: { ...training.natacion },
      casa: { ...training.casa },
    },
  };
}

function workTextsFromLog(log: ErpDayLog): Record<WorkCategoryKey, string> {
  return {
    software: formatHoursAsHm(log.work.software),
    saas: formatHoursAsHm(log.work.saas),
    planificacion: formatHoursAsHm(log.work.planificacion),
    branding: formatHoursAsHm(log.work.branding),
  };
}

export default function ErpDayForm({
  selectedDate,
  onSelectedDateChange,
  dayLogs,
  onSave,
  onDelete,
  loading,
  saving,
  saveError,
}: Props) {
  const monday = mondayOfWeek(selectedDate);
  const week = weekDates(monday);
  const existing = useMemo(
    () => dayLogs.find((l) => l.date === selectedDate),
    [dayLogs, selectedDate],
  );

  const [draft, setDraft] = useState<ErpDayLog>(() =>
    existing ? cloneLog(existing) : emptyDayLog(selectedDate),
  );
  const [workText, setWorkText] = useState<Record<WorkCategoryKey, string>>(() =>
    workTextsFromLog(existing ? cloneLog(existing) : emptyDayLog(selectedDate)),
  );
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const next = existing ? cloneLog(existing) : emptyDayLog(selectedDate);
    setDraft(next);
    setWorkText(workTextsFromLog(next));
    setSavedFlash(false);
  }, [selectedDate, existing]);

  const workTotal = sumWorkHours(draft.work);
  const delay = minutesBetweenTimes(draft.alarm.rangAt, draft.alarm.startedWorkAt);

  const commitWorkField = (key: WorkCategoryKey, raw: string) => {
    const parsed = parseDurationToHours(raw);
    if (parsed === null) {
      setWorkText((prev) => ({ ...prev, [key]: formatHoursAsHm(draft.work[key]) }));
      return;
    }
    setDraft((prev) => ({ ...prev, work: { ...prev.work, [key]: parsed } }));
    setWorkText((prev) => ({ ...prev, [key]: formatHoursAsHm(parsed) }));
  };

  const patchTraining = (
    key: TrainingCategoryKey,
    patch: Partial<ErpTrainingSession>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      training: {
        ...prev.training,
        [key]: { ...prev.training[key], ...patch },
      },
    }));
  };

  const toggleTraining = (key: TrainingCategoryKey) => {
    setDraft((prev) => {
      const cur = prev.training[key];
      const nextDone = !cur.done;
      return {
        ...prev,
        training: {
          ...prev.training,
          [key]: nextDone
            ? { ...cur, done: true }
            : emptyTrainingSession(false),
        },
      };
    });
  };

  const handleSave = async () => {
    // Commit any pending text fields before save
    const nextWork = { ...draft.work };
    (Object.keys(workText) as WorkCategoryKey[]).forEach((key) => {
      const parsed = parseDurationToHours(workText[key]);
      if (parsed !== null) nextWork[key] = parsed;
    });
    const log: ErpDayLog = {
      ...draft,
      date: selectedDate,
      work: nextWork,
      training: normalizeTraining(draft.training),
    };
    try {
      const savedLog = await onSave(log);
      setDraft(savedLog);
      setWorkText(workTextsFromLog(savedLog));
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1800);
    } catch {
      setSavedFlash(false);
    }
  };

  const handleDelete = async () => {
    if (!existing || !window.confirm(`¿Eliminar el registro del ${formatLocalDate(selectedDate)}?`)) {
      return;
    }
    try {
      await onDelete(selectedDate);
      const empty = emptyDayLog(selectedDate);
      setDraft(empty);
      setWorkText(workTextsFromLog(empty));
      setSavedFlash(false);
    } catch {
      // El mensaje de error lo muestra el contenedor.
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Cargar día</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatLocalDate(selectedDate)} · guardado en MongoDB
          </p>
        </div>
        <label className="text-xs font-medium text-slate-600">
          Fecha
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectedDateChange(e.target.value)}
            className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {week.map((date) => {
          const active = date === selectedDate;
          const hasData = dayLogs.some((l) => l.date === date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectedDateChange(date)}
              className={`min-w-[64px] rounded-xl border px-3 py-2 text-center transition cursor-pointer ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide">
                {dayShortLabel(date)}
              </span>
              <span className="block text-sm font-bold">{Number(date.slice(8))}</span>
              {hasData ? (
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-slate-200" />
              )}
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlarmClock className="h-5 w-5 text-amber-700" />
          <h3 className="text-sm font-bold text-slate-950">Alarma</h3>
          {delay !== null && (
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
              Retraso {delay} min
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium text-slate-600">
            Sonó
            <input
              type="time"
              value={draft.alarm.rangAt}
              onChange={(e) =>
                setDraft((p) => ({ ...p, alarm: { ...p.alarm, rangAt: e.target.value } }))
              }
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Veces pospuesta
            <input
              type="number"
              min={0}
              step={1}
              value={draft.alarm.snoozedTimes}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  alarm: {
                    ...p.alarm,
                    snoozedTimes: Math.max(0, parseInt(e.target.value, 10) || 0),
                  },
                }))
              }
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Empecé a trabajar
            <input
              type="time"
              value={draft.alarm.startedWorkAt}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  alarm: { ...p.alarm, startedWorkAt: e.target.value },
                }))
              }
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-950">Trabajo</h3>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Total {formatHoursAsHm(workTotal)} hs
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-400">
          Escribí como <strong className="font-semibold text-slate-600">4:52</strong> (horas:minutos).
          También acepta decimal (4.5).
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WORK_CATEGORY_META.map((cat) => (
            <label key={cat.key} className="text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0:00"
                value={workText[cat.key]}
                onChange={(e) =>
                  setWorkText((prev) => ({ ...prev, [cat.key]: e.target.value }))
                }
                onBlur={(e) => commitWorkField(cat.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-950">Entrenamiento</h3>
        <div className="space-y-3">
          {trainingMeta.map(({ key, label, icon: Icon }) => {
            const session = draft.training[key];
            const on = session.done;
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 transition ${
                  on
                    ? "border-violet-300 bg-violet-50/70"
                    : "border-slate-200 bg-slate-50/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTraining(key)}
                  className={`flex w-full items-center gap-3 text-left cursor-pointer ${
                    on ? "text-violet-900" : "text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                  {on && <Check className="ml-auto h-4 w-4 text-violet-600" />}
                </button>

                {on && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
                    <label className="text-[11px] font-medium text-slate-600">
                      Minutos
                      <span className="font-normal text-slate-400"> · opcional</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="—"
                        value={session.minutes ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          if (raw === "") {
                            patchTraining(key, { minutes: null });
                            return;
                          }
                          const mins = parseMinutes(raw);
                          if (mins !== null) patchTraining(key, { minutes: mins });
                          else if (/^\d+$/.test(raw)) {
                            patchTraining(key, { minutes: parseInt(raw, 10) });
                          }
                        }}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-[11px] font-medium text-slate-600">
                      {key === "casa" ? "Detalle / series" : "Detalle"}
                      <input
                        type="text"
                        placeholder={
                          key === "casa"
                            ? "3 series bíceps, 2 abs"
                            : "Ej. piernas, espalda…"
                        }
                        value={session.notes ?? ""}
                        onChange={(e) => patchTraining(key, { notes: e.target.value })}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="rounded-2xl border border-slate-200/80 bg-white p-5 text-xs font-medium text-slate-600 shadow-sm">
          Sueño (hs)
          <span className="ml-1 font-normal text-slate-400">· opcional</span>
          <input
            type="number"
            min={0}
            max={24}
            step={0.1}
            value={draft.sleepHours ?? ""}
            placeholder="Sin dato"
            onChange={(e) => {
              const raw = e.target.value.trim();
              setDraft((p) => ({
                ...p,
                sleepHours: raw === "" ? null : Math.max(0, parseFloat(raw) || 0),
              }));
            }}
            className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-300"
          />
        </label>
        <label className="rounded-2xl border border-slate-200/80 bg-white p-5 text-xs font-medium text-slate-600 shadow-sm">
          Alimentación (1–10)
          <span className="ml-1 font-normal text-slate-400">· opcional</span>
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            value={draft.foodScore ?? ""}
            placeholder="Sin dato"
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === "") {
                setDraft((p) => ({ ...p, foodScore: null }));
                return;
              }
              const n = parseInt(raw, 10);
              if (Number.isNaN(n)) {
                setDraft((p) => ({ ...p, foodScore: null }));
                return;
              }
              setDraft((p) => ({
                ...p,
                foodScore: Math.min(10, Math.max(1, n)),
              }));
            }}
            className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-300"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <label className="text-xs font-medium text-slate-600">
          Notas (opcional)
          <textarea
            value={draft.notes ?? ""}
            onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            placeholder="Detalle libre del día…"
            className="mt-2 block w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {saving ? "Guardando…" : "Guardar día"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar día
          </button>
        )}
        {savedFlash && (
          <span className="text-sm font-medium text-emerald-700">Guardado ✓</span>
        )}
        {saveError && (
          <span className="text-sm font-medium text-rose-700">{saveError}</span>
        )}
      </div>
    </div>
  );
}
