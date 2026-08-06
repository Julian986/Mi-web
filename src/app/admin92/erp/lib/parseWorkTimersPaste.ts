import {
  EMPTY_WORK,
  WORK_CATEGORY_META,
  emptyWorkTimers,
  sumWorkTimerSeconds,
  type ErpWorkHours,
  type ErpWorkTimer,
  type ErpWorkTimers,
  type WorkCategoryKey,
} from "@/app/admin92/erp/lib/erpTypes";

export type ParseWorkTimersPasteResult = {
  ok: boolean;
  workTimers: ErpWorkTimers;
  /** Horas derivadas solo de las categorías presentes en el paste */
  workHoursDerived: Partial<ErpWorkHours>;
  /** Categorías que aparecieron en el paste (para merge, no borrar las demás) */
  touchedKeys: WorkCategoryKey[];
  warnings: string[];
  error?: string;
  summary: { categories: number; timers: number };
};

const ARROW_RE = /\s*(?:→|->|—|–)\s*/;

function normalizeLabel(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const CATEGORY_BY_LABEL = new Map(
  WORK_CATEGORY_META.map((c) => [normalizeLabel(c.name), c.key]),
);

/** Parsea H:MM:SS, H:MM o M:SS-ish → segundos */
export function parseClockDurationToSeconds(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const hours = Number(s);
    if (!Number.isFinite(hours) || hours < 0) return null;
    return Math.round(hours * 3600);
  }
  const parts = s.split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some((n) => Number.isNaN(n) || n < 0)) return null;
  if (parts.length === 3) {
    const [h, m, sec] = nums;
    if (m > 59 || sec > 59) return null;
    return h * 3600 + m * 60 + sec;
  }
  const [h, m] = nums;
  if (m > 59) return null;
  return h * 3600 + m * 60;
}

function matchCategoryHeader(
  line: string,
): { key: WorkCategoryKey; headerSeconds: number | null } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const paren = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const namePart = (paren ? paren[1] : trimmed).trim();
  const headerRaw = paren ? paren[2].trim() : null;
  const key = CATEGORY_BY_LABEL.get(normalizeLabel(namePart));
  if (!key) return null;

  let headerSeconds: number | null = null;
  if (headerRaw) {
    headerSeconds = parseClockDurationToSeconds(headerRaw);
  }
  return { key, headerSeconds };
}

function parseTimerLine(line: string): ErpWorkTimer | { error: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const split = trimmed.split(ARROW_RE);
  if (split.length < 2) {
    return { error: `Línea sin duración (falta →): “${trimmed.slice(0, 60)}”` };
  }
  const durationRaw = split[split.length - 1].trim();
  const name = split.slice(0, -1).join(" → ").trim();
  if (!name) return { error: `Timer sin nombre: “${trimmed.slice(0, 60)}”` };
  const seconds = parseClockDurationToSeconds(durationRaw);
  if (seconds === null) {
    return { error: `Duración inválida “${durationRaw}” en “${name}”` };
  }
  return { name: name.slice(0, 200), seconds };
}

/**
 * Parsea un bloque pegado:
 *
 * Software development (1:19)
 *
 * ERP mejora view services → 0:38:00
 * Ani → 0:06:33
 */
export function parseWorkTimersPaste(text: string): ParseWorkTimersPasteResult {
  const workTimers = emptyWorkTimers();
  const workHoursDerived: Partial<ErpWorkHours> = {};
  const touchedKeys: WorkCategoryKey[] = [];
  const warnings: string[] = [];
  const touched = new Set<WorkCategoryKey>();

  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (!lines.some((l) => l.trim())) {
    return {
      ok: false,
      workTimers,
      workHoursDerived,
      touchedKeys,
      warnings,
      error: "El texto está vacío",
      summary: { categories: 0, timers: 0 },
    };
  }

  let currentKey: WorkCategoryKey | null = null;
  let currentHeaderSeconds: number | null = null;
  let totalTimers = 0;

  const flushCategory = () => {
    if (!currentKey) return;
    const timers = workTimers[currentKey];
    const sumSec = sumWorkTimerSeconds(timers);
    workHoursDerived[currentKey] = sumSec / 3600;
    if (timers.length === 0) {
      const meta = WORK_CATEGORY_META.find((c) => c.key === currentKey)?.name ?? currentKey;
      warnings.push(`“${meta}” sin timers.`);
    }
    if (currentHeaderSeconds !== null && timers.length > 0) {
      const diff = Math.abs(sumSec - currentHeaderSeconds);
      if (diff > 2) {
        const meta = WORK_CATEGORY_META.find((c) => c.key === currentKey)?.name ?? currentKey;
        warnings.push(
          `${meta}: la suma de timers (${formatSecondsAsClock(sumSec)}) no coincide con el total del encabezado (${formatSecondsAsClock(currentHeaderSeconds)}).`,
        );
      }
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const header = matchCategoryHeader(line);
    if (header) {
      flushCategory();
      currentKey = header.key;
      currentHeaderSeconds = header.headerSeconds;
      if (!touched.has(header.key)) {
        touched.add(header.key);
        touchedKeys.push(header.key);
      }
      workTimers[header.key] = [];
      continue;
    }

    const parsed = parseTimerLine(line);
    if (parsed && "error" in parsed) {
      warnings.push(parsed.error);
      continue;
    }
    if (parsed) {
      if (!currentKey) {
        warnings.push(`Timer sin categoría previa: “${parsed.name}”`);
        continue;
      }
      workTimers[currentKey].push(parsed);
      totalTimers += 1;
      continue;
    }

    warnings.push(
      `Línea no reconocida: “${line.slice(0, 80)}”. Usá “Categoría (total)” o “Nombre → H:MM:SS”.`,
    );
  }
  flushCategory();

  if (touchedKeys.length === 0) {
    return {
      ok: false,
      workTimers: emptyWorkTimers(),
      workHoursDerived: {},
      touchedKeys: [],
      warnings,
      error: "No se reconoció ninguna categoría de trabajo",
      summary: { categories: 0, timers: 0 },
    };
  }

  return {
    ok: true,
    workTimers,
    workHoursDerived,
    touchedKeys,
    warnings,
    summary: { categories: touchedKeys.length, timers: totalTimers },
  };
}

/** Aplica el paste sobre work/workTimers existentes (solo overwrite de categorías tocadas). */
export function mergeWorkTimersPaste(
  currentWork: ErpWorkHours,
  currentTimers: ErpWorkTimers,
  parsed: ParseWorkTimersPasteResult,
): { work: ErpWorkHours; workTimers: ErpWorkTimers } {
  const work = { ...currentWork };
  const workTimers = { ...emptyWorkTimers(), ...currentTimers };
  for (const key of Object.keys(EMPTY_WORK) as WorkCategoryKey[]) {
    workTimers[key] = [...(currentTimers[key] ?? [])];
  }
  for (const key of parsed.touchedKeys) {
    workTimers[key] = parsed.workTimers[key];
    work[key] = parsed.workHoursDerived[key] ?? 0;
  }
  return { work, workTimers };
}

export function formatSecondsAsClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
