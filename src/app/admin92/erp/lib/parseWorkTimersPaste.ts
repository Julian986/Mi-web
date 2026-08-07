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

/** Flechas de timer (no incluir — : se usa en encabezados “SaaS — 0:56 hs”) */
const TIMER_ARROW_RE = /\s*(?:→|->)\s*/;

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

/** Quita markdown, bullets y ruido típico del pegado */
export function cleanPasteLine(line: string): string {
  let s = line.trim();
  if (!s) return "";
  // **bold** envolviendo toda la línea
  if (s.startsWith("**") && s.endsWith("**") && s.length > 4) {
    s = s.slice(2, -2).trim();
  }
  s = s.replace(/^#+\s*/, "");
  s = s.replace(/^[-*•]\s+/, "");
  return s.trim();
}

function stripDurationSuffix(raw: string): string {
  return raw.replace(/\s*hs\.?\s*$/i, "").trim();
}

/** Parsea H:MM:SS, H:MM o decimal → segundos */
export function parseClockDurationToSeconds(raw: string): number | null {
  const s = stripDurationSuffix(raw).replace(",", ".");
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

function lookupCategory(namePart: string): WorkCategoryKey | null {
  return CATEGORY_BY_LABEL.get(normalizeLabel(namePart)) ?? null;
}

/**
 * Encabezados soportados:
 * - Software development (1:19)
 * - SaaS — 0:56 hs
 * - **Planificación — 0:26 hs**
 * - Branding / Marketing
 */
function matchCategoryHeader(
  line: string,
): { key: WorkCategoryKey; headerSeconds: number | null } | null {
  const trimmed = cleanPasteLine(line);
  if (!trimmed) return null;

  // Name (0:56) / Name (0:56 hs)
  const paren = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    const key = lookupCategory(paren[1]);
    if (key) {
      return {
        key,
        headerSeconds: parseClockDurationToSeconds(paren[2]),
      };
    }
  }

  // Name — 0:56 hs  /  Name – 0:56
  const emDash = trimmed.match(/^(.*?)\s*[—–]\s*(.+)$/);
  if (emDash) {
    const key = lookupCategory(emDash[1]);
    if (key) {
      return {
        key,
        headerSeconds: parseClockDurationToSeconds(emDash[2]),
      };
    }
  }

  // Name - 0:56  (guión solo si la derecha parece duración)
  const hyphen = trimmed.match(/^(.*?)\s+-\s+(\d+:\d{1,2}(?::\d{1,2})?(?:\s*hs\.?)?)\s*$/i);
  if (hyphen) {
    const key = lookupCategory(hyphen[1]);
    if (key) {
      return {
        key,
        headerSeconds: parseClockDurationToSeconds(hyphen[2]),
      };
    }
  }

  // Solo el nombre de la categoría
  const keyAlone = lookupCategory(trimmed);
  if (keyAlone) {
    return { key: keyAlone, headerSeconds: null };
  }

  return null;
}

/**
 * Timers: "Nombre → 0:22:23" (también ->).
 * Acepta bullet "- nombre → …".
 */
function parseTimerLine(line: string): ErpWorkTimer | { error: string } | null {
  const trimmed = cleanPasteLine(line);
  if (!trimmed) return null;

  // Si parece encabezado de categoría, no es timer
  if (matchCategoryHeader(trimmed)) return null;

  const split = trimmed.split(TIMER_ARROW_RE);
  if (split.length < 2) {
    // Fallback: em dash solo si la derecha es claramente H:MM(:SS)
    const em = trimmed.match(/^(.*?)\s*[—–]\s*(\d+:\d{1,2}(?::\d{1,2})?)\s*$/);
    if (!em) return null;
    const name = em[1].trim();
    const seconds = parseClockDurationToSeconds(em[2]);
    if (!name || seconds === null) return null;
    // No tratar como timer si el nombre es una categoría del ERP
    if (lookupCategory(name)) return null;
    return { name: name.slice(0, 200), seconds };
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
 * Parsea un bloque pegado (formato clásico o markdown del día a día).
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
      `Línea no reconocida: “${cleanPasteLine(line).slice(0, 80)}”. Usá “Categoría — 0:56 hs” o “Nombre → H:MM:SS”.`,
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
