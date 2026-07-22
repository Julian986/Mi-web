import {
  formatLocalDate,
  formatMonthLabel,
  getMonthKeySafe,
  shiftDate,
  shiftMonth,
} from "@/app/admin92/contabilidad/lib/utils";
import {
  formatHoursAsHm,
  isTrainingDone,
  countMealsDone,
  avgMealQuality,
  emptyFood,
  minutesBetweenTimes,
  sumWorkHours,
  WORK_CATEGORY_META,
  TRAINING_CATEGORY_META,
  type ErpDayLog,
  type ErpWorkHours,
  type WorkCategoryKey,
} from "@/app/admin92/erp/lib/erpTypes";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

export type ErpPeriod = "day" | "week" | "month";

export function mondayOfWeek(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  return shiftDate(ymd, mondayOffset);
}

export function weekDates(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}

export function monthDates(ymd: string): string[] {
  const [y, m] = ymd.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const prefix = `${y}-${String(m).padStart(2, "0")}`;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return `${prefix}-${day}`;
  });
}

export function periodDates(anchor: string, period: ErpPeriod): string[] {
  if (period === "day") return [anchor];
  if (period === "week") return weekDates(mondayOfWeek(anchor));
  return monthDates(anchor);
}

/** Ancla del período anterior comparable (mismo size relativo). */
export function previousPeriodAnchor(anchor: string, period: ErpPeriod): string {
  if (period === "day") return shiftDate(anchor, -1);
  if (period === "week") return shiftDate(mondayOfWeek(anchor), -7);
  const prevYm = shiftMonth(getMonthKeySafe(anchor), -1);
  return `${prevYm}-01`;
}

export function shiftPeriodAnchor(anchor: string, period: ErpPeriod, delta: number): string {
  if (period === "day") return shiftDate(anchor, delta);
  if (period === "week") return shiftDate(mondayOfWeek(anchor), delta * 7);
  const nextYm = shiftMonth(getMonthKeySafe(anchor), delta);
  return `${nextYm}-01`;
}

export function formatWeekRangeLabel(monday: string): string {
  const sunday = shiftDate(monday, 6);
  const fmt = (ymd: string) => {
    const [, m, d] = ymd.split("-");
    return `${Number(d)}/${Number(m)}`;
  };
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function formatPeriodLabel(anchor: string, period: ErpPeriod): string {
  if (period === "day") return formatLocalDate(anchor);
  if (period === "week") return formatWeekRangeLabel(mondayOfWeek(anchor));
  return formatMonthLabel(getMonthKeySafe(anchor));
}

export function periodCompareLabel(period: ErpPeriod): string {
  if (period === "day") return "vs. día anterior";
  if (period === "week") return "vs. semana anterior";
  return "vs. mes anterior";
}

export function periodTitle(period: ErpPeriod): string {
  if (period === "day") return "Resumen del día";
  if (period === "week") return "Resumen de la semana";
  return "Resumen del mes";
}

export function dayShortLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return DAY_SHORT[new Date(y, m - 1, d).getDay()];
}

function chartDayLabel(ymd: string, period: ErpPeriod): string {
  if (period === "month") {
    const day = Number(ymd.split("-")[2]);
    return String(day);
  }
  if (period === "day") {
    const [, m, d] = ymd.split("-");
    return `${Number(d)}/${Number(m)}`;
  }
  return dayShortLabel(ymd);
}

export function logsByDateMap(logs: ErpDayLog[]): Map<string, ErpDayLog> {
  const map = new Map<string, ErpDayLog>();
  for (const log of logs) map.set(log.date, log);
  return map;
}

export function logsInWeek(logs: ErpDayLog[], monday: string): ErpDayLog[] {
  const dates = new Set(weekDates(monday));
  return logs.filter((l) => dates.has(l.date));
}

export function logsInDates(logs: ErpDayLog[], dates: string[]): ErpDayLog[] {
  const set = new Set(dates);
  return logs.filter((l) => set.has(l.date));
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function periodGoals(period: ErpPeriod, dayCount: number) {
  if (period === "day") return { workGoal: 8, trainingGoal: 1 };
  if (period === "week") return { workGoal: 40, trainingGoal: 5 };
  // ~5.7 hs/día de trabajo · ~20 días entrenando al mes
  const workGoal = Math.round(40 * (dayCount / 7));
  const trainingGoal = Math.max(1, Math.round(5 * (dayCount / 7)));
  return { workGoal, trainingGoal };
}

export type PeriodStats = {
  workHours: number;
  dailyAvg: number;
  trainingDays: number;
  englishDays: number;
  englishMinutes: number;
  creatineDays: number;
  /** null si ningún día del período registró sueño */
  sleepAvg: number | null;
  /** Promedio de comidas hechas por día (0–4); null si no hay logs */
  foodMealsAvg: number | null;
  /** Promedio de calidad (1–5) entre comidas calificadas; null si no hay */
  foodQualityAvg: number | null;
  workByCategory: Record<WorkCategoryKey, number>;
  trainingByCategory: Record<"gimnasio" | "natacion" | "casa", number>;
  workByDay: Array<ErpWorkHours & { day: string; date: string }>;
  distribution: Array<{ name: string; value: number; color: string; hours: number }>;
  goals: Array<{
    label: string;
    current: string;
    progress: number;
    color: string;
    track: string;
  }>;
  score: number;
  topWorkFocus: { name: string; pct: number } | null;
};

/** @deprecated usar PeriodStats */
export type WeekStats = PeriodStats;

export function computePeriodStats(
  periodLogs: ErpDayLog[],
  dates: string[],
  period: ErpPeriod,
): PeriodStats {
  const byDate = logsByDateMap(periodLogs);
  const { workGoal, trainingGoal } = periodGoals(period, dates.length);

  const workByCategory: Record<WorkCategoryKey, number> = {
    software: 0,
    saas: 0,
    planificacion: 0,
    branding: 0,
  };
  const trainingByCategory = { gimnasio: 0, natacion: 0, casa: 0 };

  let workHours = 0;
  let trainingDays = 0;
  let englishDays = 0;
  let englishMinutes = 0;
  let creatineDays = 0;
  const sleepVals: number[] = [];
  const mealCountVals: number[] = [];
  const qualityDayVals: number[] = [];

  const workByDay = dates.map((date) => {
    const log = byDate.get(date);
    const work = log?.work ?? { software: 0, saas: 0, planificacion: 0, branding: 0 };
    workHours += sumWorkHours(work);
    workByCategory.software += work.software;
    workByCategory.saas += work.saas;
    workByCategory.planificacion += work.planificacion;
    workByCategory.branding += work.branding;

    if (log) {
      if (log.sleepHours !== null && log.sleepHours !== undefined) {
        sleepVals.push(log.sleepHours);
      }
      const food = log.food ?? emptyFood();
      mealCountVals.push(countMealsDone(food));
      const dayQuality = avgMealQuality(food);
      if (dayQuality !== null) qualityDayVals.push(dayQuality);
      const trained =
        isTrainingDone(log.training.gimnasio) ||
        isTrainingDone(log.training.natacion) ||
        isTrainingDone(log.training.casa);
      if (trained) trainingDays += 1;
      if (isTrainingDone(log.training.gimnasio)) trainingByCategory.gimnasio += 1;
      if (isTrainingDone(log.training.natacion)) trainingByCategory.natacion += 1;
      if (isTrainingDone(log.training.casa)) trainingByCategory.casa += 1;
      if (isTrainingDone(log.english)) {
        englishDays += 1;
        englishMinutes += log.english.minutes ?? 0;
      }
      if (log.creatine) creatineDays += 1;
    }

    return { day: chartDayLabel(date, period), date, ...work };
  });

  const daysWithWork = periodLogs.filter((l) => sumWorkHours(l.work) > 0).length || 1;
  const dailyAvg = workHours / Math.max(daysWithWork, 1);

  const trainingHours = trainingDays * 1.25;
  const restPool = Math.max(workHours + trainingHours, 1);
  const descansoHours = Math.max(restPool * 0.3, 0);
  const totalPie = workHours + trainingHours + descansoHours;
  const pieSlice = (hours: number) =>
    totalPie > 0 ? Math.round((hours / totalPie) * 100) : 0;

  const distribution = [
    { name: "Trabajo", hours: workHours, value: pieSlice(workHours), color: "#2563eb" },
    {
      name: "Entrenamiento",
      hours: trainingHours,
      value: pieSlice(trainingHours),
      color: "#8b5cf6",
    },
    {
      name: "Descanso",
      hours: descansoHours,
      value: pieSlice(descansoHours),
      color: "#10b981",
    },
  ];
  const pieSum = distribution.reduce((s, d) => s + d.value, 0);
  if (pieSum !== 100 && distribution[0]) {
    distribution[0].value += 100 - pieSum;
  }

  const workProgress = Math.min(100, Math.round((workHours / workGoal) * 100));
  const trainingProgress = Math.min(100, Math.round((trainingDays / trainingGoal) * 100));

  const goals = [
    {
      label: "Trabajo",
      current: `${formatHoursAsHm(workHours)} / ${workGoal} hs`,
      progress: workProgress,
      color: "bg-blue-500",
      track: "bg-blue-100",
    },
    {
      label: "Entrenamiento",
      current: `${trainingDays} / ${trainingGoal} ${trainingGoal === 1 ? "día" : "días"}`,
      progress: trainingProgress,
      color: "bg-violet-500",
      track: "bg-violet-100",
    },
  ];

  const sleepAvg = sleepVals.length > 0 ? avg(sleepVals) : null;
  const foodMealsAvg = mealCountVals.length > 0 ? avg(mealCountVals) : null;
  const foodQualityAvg = qualityDayVals.length > 0 ? avg(qualityDayVals) : null;

  const sleepScore =
    sleepAvg !== null ? Math.min(100, (sleepAvg / 8) * 100) : workProgress;
  const foodCompletion =
    foodMealsAvg !== null ? (foodMealsAvg / 4) * 100 : workProgress;
  const foodQualityPart =
    foodQualityAvg !== null ? (foodQualityAvg / 5) * 100 : foodCompletion;
  const foodScorePart = foodCompletion * 0.7 + foodQualityPart * 0.3;

  const score = Math.round(
    workProgress * 0.45 +
      trainingProgress * 0.3 +
      sleepScore * 0.15 +
      foodScorePart * 0.1,
  );

  let topWorkFocus: PeriodStats["topWorkFocus"] = null;
  if (workHours > 0) {
    const top = WORK_CATEGORY_META.map((c) => ({
      name: c.name,
      hours: workByCategory[c.key],
    })).sort((a, b) => b.hours - a.hours)[0];
    if (top && top.hours > 0) {
      topWorkFocus = {
        name: top.name.toLowerCase(),
        pct: Math.round((top.hours / workHours) * 100),
      };
    }
  }

  return {
    workHours,
    dailyAvg,
    trainingDays,
    englishDays,
    englishMinutes,
    creatineDays,
    sleepAvg,
    foodMealsAvg,
    foodQualityAvg,
    workByCategory,
    trainingByCategory,
    workByDay,
    distribution,
    goals,
    score: Math.min(100, Math.max(0, score)),
    topWorkFocus,
  };
}

export function computeWeekStats(weekLogs: ErpDayLog[], monday: string): PeriodStats {
  return computePeriodStats(weekLogs, weekDates(monday), "week");
}

export function formatHours(n: number): string {
  return Number(n.toFixed(1)).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export type KpiView = {
  label: string;
  value: string;
  unit: string;
  change: number | null;
  color: "blue" | "cyan" | "violet" | "emerald" | "indigo" | "amber";
  kind: "work" | "daily" | "training" | "english" | "creatine" | "sleep" | "food";
};

export function buildKpis(
  current: PeriodStats,
  previous: PeriodStats | null,
  period: ErpPeriod = "week",
): KpiView[] {
  const sleepChange =
    current.sleepAvg !== null && previous?.sleepAvg != null
      ? pctChange(current.sleepAvg, previous.sleepAvg)
      : null;
  const foodChange =
    current.foodMealsAvg !== null && previous?.foodMealsAvg != null
      ? pctChange(current.foodMealsAvg, previous.foodMealsAvg)
      : null;

  const dailyKpi =
    period === "day"
      ? {
          label: "Foco principal",
          value: current.topWorkFocus?.name ?? "—",
          unit: current.topWorkFocus ? `${current.topWorkFocus.pct}%` : "",
          change: null as number | null,
          color: "cyan" as const,
          kind: "daily" as const,
        }
      : {
          label: "Promedio diario",
          value: formatHoursAsHm(current.dailyAvg),
          unit: "hs",
          change: previous ? pctChange(current.dailyAvg, previous.dailyAvg) : null,
          color: "cyan" as const,
          kind: "daily" as const,
        };

  return [
    {
      label: "Horas trabajadas",
      value: formatHoursAsHm(current.workHours),
      unit: "hs",
      change: previous ? pctChange(current.workHours, previous.workHours) : null,
      color: "blue",
      kind: "work",
    },
    dailyKpi,
    {
      label: period === "day" ? "Entrenamiento" : "Días de entrenamiento",
      value:
        period === "day"
          ? current.trainingDays > 0
            ? "Sí"
            : "No"
          : String(current.trainingDays),
      unit: period === "day" ? "" : "días",
      change: previous ? pctChange(current.trainingDays, previous.trainingDays) : null,
      color: "violet",
      kind: "training",
    },
    {
      label: "Inglés",
      value:
        period === "day"
          ? current.englishDays > 0
            ? "Sí"
            : "No"
          : String(current.englishDays),
      unit:
        period === "day"
          ? current.englishMinutes > 0
            ? `${current.englishMinutes} min`
            : ""
          : current.englishMinutes > 0
            ? `días · ${current.englishMinutes} min`
            : "días",
      change: previous ? pctChange(current.englishDays, previous.englishDays) : null,
      color: "emerald",
      kind: "english",
    },
    {
      label: "Creatina",
      value:
        period === "day"
          ? current.creatineDays > 0
            ? "Sí"
            : "No"
          : String(current.creatineDays),
      unit: period === "day" ? "" : "días",
      change: previous ? pctChange(current.creatineDays, previous.creatineDays) : null,
      color: "cyan",
      kind: "creatine",
    },
    {
      label: period === "day" ? "Sueño" : "Promedio sueño",
      value: current.sleepAvg !== null ? formatHours(current.sleepAvg) : "—",
      unit: current.sleepAvg !== null ? "hs" : "",
      change: sleepChange,
      color: "indigo",
      kind: "sleep",
    },
    {
      label: period === "day" ? "Alimentación" : "Comidas / día",
      value:
        current.foodMealsAvg !== null
          ? period === "day"
            ? `${Math.round(current.foodMealsAvg)}/4`
            : formatHours(current.foodMealsAvg)
          : "—",
      unit:
        current.foodMealsAvg === null
          ? ""
          : current.foodQualityAvg !== null
            ? `cal. ${formatHours(current.foodQualityAvg)}`
            : period === "day"
              ? "comidas"
              : "prom.",
      change: foodChange,
      color: "amber",
      kind: "food",
    },
  ];
}

export function overallChangePct(
  current: PeriodStats,
  previous: PeriodStats | null,
): number | null {
  if (!previous) return null;
  return pctChange(current.score, previous.score);
}

export function alarmFromLog(log: ErpDayLog | undefined) {
  if (!log) return null;
  const rangAt = log.alarm.rangAt;
  const startedWorkAt = log.alarm.startedWorkAt;
  const snoozedTimes = log.alarm.snoozedTimes;
  const delay = minutesBetweenTimes(rangAt, startedWorkAt);
  return {
    rangAt,
    snoozedTimes,
    startedWorkAt,
    delayMinutes: delay,
  };
}

export function workCategoryBars(stats: PeriodStats) {
  return WORK_CATEGORY_META.map((c) => ({
    key: c.key,
    name: c.name,
    color: c.color,
    hours: stats.workByCategory[c.key],
  }));
}

export function trainingCategoryCards(stats: PeriodStats) {
  return TRAINING_CATEGORY_META.map((c) => ({
    key: c.key,
    name: c.name,
    color: c.color,
    days: stats.trainingByCategory[c.key],
  }));
}

export { WORK_CATEGORY_META, TRAINING_CATEGORY_META };
