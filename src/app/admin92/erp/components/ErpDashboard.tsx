"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  AlarmClock,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  BriefcaseBusiness,
  Code2,
  Dumbbell,
  Home,
  Layers,
  Megaphone,
  Moon,
  Play,
  Salad,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  alarmFromLog,
  overallChangePct,
  periodCompareLabel,
  periodTitle,
  trainingCategoryCards,
  workCategoryBars,
  WORK_CATEGORY_META,
  type ErpPeriod,
  type KpiView,
  type PeriodStats,
} from "@/app/admin92/erp/lib/erpAggregates";
import { formatHoursAsHm, type ErpDayLog } from "@/app/admin92/erp/lib/erpTypes";

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
} as const;

const kpiIcons: Record<KpiView["kind"], ComponentType<{ className?: string }>> = {
  work: BriefcaseBusiness,
  daily: Activity,
  training: Dumbbell,
  sleep: Moon,
  food: Salad,
};

const workIcons = {
  software: Code2,
  saas: Layers,
  planificacion: Target,
  branding: Megaphone,
} as const;

const trainingIcons = {
  gimnasio: Dumbbell,
  natacion: Waves,
  casa: Home,
} as const;

const goalIcons = {
  Trabajo: BriefcaseBusiness,
  Entrenamiento: Dumbbell,
} as const;

type Props = {
  period: ErpPeriod;
  rangeLabel: string;
  current: PeriodStats;
  previous: PeriodStats | null;
  kpis: KpiView[];
  focusLog: ErpDayLog | undefined;
  loading: boolean;
  hasData: boolean;
};

function KpiCard({ item, compareLabel }: { item: KpiView; compareLabel: string }) {
  const Icon = kpiIcons[item.kind];
  const change = item.change;
  const improved = change !== null && change >= 0;

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl p-2.5 ring-1 ${colorClasses[item.color]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {change === null ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-400">
            —
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${
              improved ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {improved ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{item.label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <strong className="text-3xl font-bold tracking-tight text-slate-950">{item.value}</strong>
        <span className="text-sm font-semibold text-slate-400">{item.unit}</span>
      </div>
      <p className="mt-3 text-xs text-slate-400">{compareLabel}</p>
    </article>
  );
}

export default function ErpDashboard({
  period,
  rangeLabel,
  current,
  previous,
  kpis,
  focusLog,
  loading,
  hasData,
}: Props) {
  const [chartsReady, setChartsReady] = useState(false);
  const workCats = workCategoryBars(current);
  const trainingCats = trainingCategoryCards(current);
  const workTotal = current.workHours;
  const trainingTotal = current.trainingDays;
  const alarm = alarmFromLog(focusLog);
  const overall = overallChangePct(current, previous);
  const compareLabel = periodCompareLabel(period);
  const title = periodTitle(period);
  const pieTotalHours =
    current.distribution.reduce((s, d) => s + d.hours, 0) || current.workHours;
  const emptyPreviousLabel =
    period === "day"
      ? "Sin día previo"
      : period === "week"
        ? "Sin semana previa"
        : "Sin mes previo";
  const scoreLabel =
    period === "day" ? "Puntaje del día" : period === "week" ? "Puntaje semanal" : "Puntaje mensual";
  const progressLabel =
    period === "day"
      ? "Progreso del día"
      : period === "week"
        ? "Progreso semanal"
        : "Progreso mensual";
  const distributionLabel =
    period === "day"
      ? "Distribución del día"
      : period === "week"
        ? "Distribución de mi semana"
        : "Distribución del mes";
  const barSubtitle =
    period === "month"
      ? "Días del mes · apilado por categoría"
      : period === "day"
        ? "Desglose del día por categoría"
        : "Apilado por categoría · software · saas · planificación · branding";
  const alarmTitle = period === "day" ? "Alarma del día" : "Alarma";

  useEffect(() => {
    setChartsReady(true);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando métricas">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <Activity className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Sin datos en este período</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Elegí “Cargar día” para registrar tu actividad. Las métricas aparecerán acá
          automáticamente.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Rendimiento
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{title}</h2>
            <p className="mt-1 text-xs text-slate-400">{rangeLabel}</p>
          </div>
          {overall === null ? (
            <div className="text-sm font-medium text-slate-400">{emptyPreviousLabel}</div>
          ) : (
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                overall >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {overall >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              Rendimiento general {overall >= 0 ? "+" : ""}
              {overall}%
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpis.map((item) => (
            <KpiCard key={item.label} item={item} compareLabel={compareLabel} />
          ))}
        </div>
      </section>

      {alarm && (
        <section>
          <article className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700 ring-1 ring-amber-200">
                  <AlarmClock className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">{alarmTitle}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Despertar → posponer → inicio de trabajo
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Retraso {alarm.delayMinutes} min
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-100 bg-white/90 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <BellRing className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Sonó</span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {alarm.rangAt}
                </p>
                <p className="mt-1 text-xs text-slate-400">Hora de la alarma</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white/90 p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlarmClock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Pospuesta</span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {alarm.snoozedTimes}
                  <span className="ml-1 text-base font-semibold text-slate-400">veces</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {alarm.snoozedTimes === 0 ? "Sin snooze" : "Snooze activado"}
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white/90 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Play className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Empecé a trabajar
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {alarm.startedWorkAt}
                </p>
                <p className="mt-1 text-xs text-slate-400">Primer bloque de trabajo</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 overflow-x-auto">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white">
                  {alarm.rangAt}
                </span>
                <div className="h-1.5 min-w-8 flex-1 rounded-full bg-amber-200" />
                <span className="shrink-0 rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  ×{alarm.snoozedTimes} snooze
                </span>
                <div className="h-1.5 min-w-8 flex-1 rounded-full bg-emerald-200" />
                <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                  {alarm.startedWorkAt}
                </span>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Categorías de trabajo</h2>
              <p className="mt-1 text-xs text-slate-400">Desglose de horas trabajadas</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {formatHoursAsHm(workTotal)} hs
            </span>
          </div>
          <div className="space-y-3">
            {workCats.map((cat) => {
              const Icon = workIcons[cat.key];
              const pct = workTotal > 0 ? Math.round((cat.hours / workTotal) * 100) : 0;
              return (
                <div key={cat.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {cat.name}
                    </span>
                    <span className="text-sm font-bold text-slate-950">
                      {formatHoursAsHm(cat.hours)} hs
                      <span className="ml-1.5 text-xs font-semibold text-slate-400">{pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">Categorías de entrenamiento</h2>
              <p className="mt-1 text-xs text-slate-400">Desglose de días activos</p>
            </div>
            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
              {trainingTotal} {trainingTotal === 1 ? "día" : "días"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {trainingCats.map((cat) => {
              const Icon = trainingIcons[cat.key];
              return (
                <div
                  key={cat.key}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-center"
                >
                  <div
                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">{cat.name}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    {cat.days}
                    <span className="ml-1 text-sm font-semibold text-slate-400">d</span>
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-950">{distributionLabel}</h2>
            <p className="mt-1 text-xs text-slate-400">Porcentaje del tiempo registrado</p>
          </div>
          <div className="relative h-64">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={current.distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {current.distribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Porcentaje"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px rgba(15,23,42,.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-full bg-slate-100" />
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-950">
                {formatHoursAsHm(pieTotalHours)}h
              </span>
              <span className="text-xs text-slate-400">registradas</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {current.distribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <strong className="text-sm text-slate-900">{item.value}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] xl:col-span-3">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {period === "day" ? "Horas por categoría" : "Horas trabajadas por día"}
              </h2>
              <p className="mt-1 text-xs text-slate-400">{barSubtitle}</p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {formatHoursAsHm(workTotal)} hs total
            </div>
          </div>
          <div className="h-[330px]">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={current.workByDay}
                  margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    interval={period === "month" ? 2 : 0}
                    tick={{ fill: "#64748b", fontSize: period === "month" ? 10 : 12 }}
                    dy={8}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#eff6ff", radius: 8 }}
                    formatter={(value, name) => [
                      formatHoursAsHm(Number(value)),
                      WORK_CATEGORY_META.find((k) => k.key === name)?.shortLabel ??
                        String(name),
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #dbeafe",
                      boxShadow: "0 10px 25px rgba(15,23,42,.08)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    formatter={(value) =>
                      WORK_CATEGORY_META.find((k) => k.key === value)?.shortLabel ?? value
                    }
                  />
                  {WORK_CATEGORY_META.map((item, idx) => (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      stackId="work"
                      fill={item.color}
                      radius={
                        idx === WORK_CATEGORY_META.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]
                      }
                      maxBarSize={period === "month" ? 28 : 48}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-xl bg-slate-100" />
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">{progressLabel}</h2>
              <p className="mt-1 text-xs text-slate-400">Avance sobre tus objetivos principales</p>
            </div>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-6">
            {current.goals.map((goal) => {
              const Icon = goalIcons[goal.label as keyof typeof goalIcons] ?? Target;
              return (
                <div key={goal.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {goal.label}
                    </span>
                    <span className="text-sm font-bold text-slate-950">{goal.current}</span>
                  </div>
                  <div className={`h-3 overflow-hidden rounded-full ${goal.track}`}>
                    <div
                      className={`h-full rounded-full ${goal.color} transition-all duration-700`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-xs font-semibold text-slate-400">
                    {goal.progress}%
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-violet-500/20 blur-2xl" />
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-5 w-5 text-blue-300" />
            </div>
            <p className="mt-6 text-sm font-medium text-slate-400">{scoreLabel}</p>
            <div className="mt-1 flex items-end gap-2">
              <strong className="text-5xl font-bold tracking-tight">{current.score}</strong>
              <span className="pb-1 text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
                style={{ width: `${current.score}%` }}
              />
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
              <ArrowUpRight className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-xs leading-5 text-slate-300">
                {current.topWorkFocus ? (
                  <>
                    Tu mayor foco fue{" "}
                    <strong className="text-white">{current.topWorkFocus.name}</strong> (
                    {current.topWorkFocus.pct}% del trabajo).
                  </>
                ) : (
                  <>Cargá horas de trabajo para ver el foco principal.</>
                )}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
