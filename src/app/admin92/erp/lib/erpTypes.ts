export type ErpWorkHours = {
  software: number;
  saas: number;
  planificacion: number;
  branding: number;
};

/** Sesión de entrenamiento: done + minutos opcionales + notas (series, etc.) */
export type ErpTrainingSession = {
  done: boolean;
  /** Duración en minutos; null = no registrada */
  minutes: number | null;
  /** Ej. "3 series bíceps, 2 abs" */
  notes?: string;
};

export type ErpTraining = {
  gimnasio: ErpTrainingSession;
  natacion: ErpTrainingSession;
  casa: ErpTrainingSession;
};

/** @deprecated preferir ErpTraining */
export type ErpTrainingFlags = ErpTraining;

export type ErpAlarm = {
  rangAt: string; // HH:MM
  snoozedTimes: number;
  startedWorkAt: string; // HH:MM
};

export type ErpDayLog = {
  date: string; // YYYY-MM-DD
  alarm: ErpAlarm;
  work: ErpWorkHours;
  training: ErpTraining;
  /** Práctica de inglés, separada del entrenamiento físico */
  english: ErpTrainingSession;
  /** Tomó creatina ese día */
  creatine: boolean;
  /** null = no registrado ese día */
  sleepHours: number | null;
  /** null = no registrado ese día; 1-10 si hay valor */
  foodScore: number | null;
  notes?: string;
};

/** Pago mensual de un servicio (gimnasio / pileta) */
export type ErpServicePayment = {
  paid: boolean;
  amount: number | null;
};

/** Estado de cuotas del mes YYYY-MM */
export type ErpMembershipMonth = {
  month: string;
  gimnasio: ErpServicePayment;
  natacion: ErpServicePayment;
};

export function emptyServicePayment(): ErpServicePayment {
  return { paid: false, amount: null };
}

export function emptyMembershipMonth(month: string): ErpMembershipMonth {
  return {
    month,
    gimnasio: emptyServicePayment(),
    natacion: emptyServicePayment(),
  };
}

export function validateErpMembershipMonth(
  raw: unknown,
  expectedMonth?: string,
): { ok: true; membership: ErpMembershipMonth } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "El registro de cuotas es inválido" };
  }
  const value = raw as Record<string, unknown>;
  const month =
    typeof value.month === "string" ? value.month : expectedMonth ?? "";
  if (!/^\d{4}-\d{2}$/.test(month) || (expectedMonth && month !== expectedMonth)) {
    return { ok: false, error: "El mes es inválido" };
  }

  const parseService = (
    key: "gimnasio" | "natacion",
  ): ErpServicePayment | { error: string } => {
    const service = value[key];
    if (!service || typeof service !== "object") {
      return { error: `Los datos de ${key} son inválidos` };
    }
    const entry = service as Record<string, unknown>;
    if (typeof entry.paid !== "boolean") {
      return { error: `El estado de pago de ${key} es inválido` };
    }
    if (entry.amount === null || entry.amount === undefined || entry.amount === "") {
      return { paid: entry.paid, amount: null };
    }
    const amount = Number(entry.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: `El monto de ${key} es inválido` };
    }
    return { paid: entry.paid, amount };
  };

  const gimnasio = parseService("gimnasio");
  if ("error" in gimnasio) return { ok: false, error: gimnasio.error };
  const natacion = parseService("natacion");
  if ("error" in natacion) return { ok: false, error: natacion.error };

  return {
    ok: true,
    membership: { month, gimnasio, natacion },
  };
}

export type WorkCategoryKey = keyof ErpWorkHours;
export type TrainingCategoryKey = keyof ErpTraining;

export const WORK_CATEGORY_META: {
  key: WorkCategoryKey;
  name: string;
  shortLabel: string;
  color: string;
}[] = [
  { key: "software", name: "Software development", shortLabel: "Software", color: "#2563eb" },
  { key: "saas", name: "SaaS", shortLabel: "SaaS", color: "#7c3aed" },
  { key: "planificacion", name: "Planificación", shortLabel: "Planificación", color: "#0891b2" },
  { key: "branding", name: "Branding / Marketing", shortLabel: "Branding", color: "#ea580c" },
];

export const TRAINING_CATEGORY_META: {
  key: TrainingCategoryKey;
  name: string;
  color: string;
}[] = [
  { key: "gimnasio", name: "Gimnasio", color: "#7c3aed" },
  { key: "natacion", name: "Natación", color: "#0284c7" },
  { key: "casa", name: "Entrenamiento en casa", color: "#059669" },
];

export const EMPTY_WORK: ErpWorkHours = {
  software: 0,
  saas: 0,
  planificacion: 0,
  branding: 0,
};

export function emptyTrainingSession(done = false): ErpTrainingSession {
  return { done, minutes: null, notes: "" };
}

export const EMPTY_TRAINING: ErpTraining = {
  gimnasio: emptyTrainingSession(),
  natacion: emptyTrainingSession(),
  casa: emptyTrainingSession(),
};

export function emptyDayLog(date: string): ErpDayLog {
  return {
    date,
    alarm: { rangAt: "07:00", snoozedTimes: 0, startedWorkAt: "08:00" },
    work: { ...EMPTY_WORK },
    training: {
      gimnasio: emptyTrainingSession(),
      natacion: emptyTrainingSession(),
      casa: emptyTrainingSession(),
    },
    english: emptyTrainingSession(),
    creatine: false,
    sleepHours: null,
    foodScore: null,
    notes: "",
  };
}

export function sumWorkHours(work: ErpWorkHours): number {
  return work.software + work.saas + work.planificacion + work.branding;
}

/** Minutos entre HH:MM y HH:MM (mismo día; si end < start asume end al día siguiente) */
export function minutesBetweenTimes(start: string, end: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

/**
 * Parsea duración a horas decimales.
 * Acepta: "4:52", "4:5", "4", "4.5", "4,5".
 */
export function parseDurationToHours(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(",", ".");
  if (!s) return 0;

  if (s.includes(":")) {
    const [hPart, mPart = "0"] = s.split(":");
    const h = parseInt(hPart, 10);
    const m = parseInt(mPart.padStart(2, "0").slice(0, 2), 10);
    if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59) return null;
    return Math.max(0, h + m / 60);
  }

  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

/** Formatea horas decimales como "4:52" */
export function formatHoursAsHm(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0:00";
  const totalMins = Math.round(hours * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** Parsea solo minutos enteros ("45", "45m", "45min") */
export function parseMinutes(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  const m = /^(\d+)\s*(m|min|mins|minutos)?$/.exec(s);
  if (!m) return null;
  return Math.max(0, parseInt(m[1], 10));
}

export function isTrainingDone(session: ErpTrainingSession | boolean | undefined): boolean {
  if (session == null) return false;
  if (typeof session === "boolean") return session;
  return Boolean(session.done);
}

/** Normaliza mocks viejos (boolean) al shape nuevo */
export function normalizeTraining(raw: unknown): ErpTraining {
  const asRecord = (raw ?? {}) as Record<string, unknown>;
  const one = (key: TrainingCategoryKey): ErpTrainingSession => {
    const v = asRecord[key];
    if (typeof v === "boolean") return emptyTrainingSession(v);
    if (v && typeof v === "object") {
      const o = v as Partial<ErpTrainingSession>;
      return {
        done: Boolean(o.done),
        minutes: typeof o.minutes === "number" ? o.minutes : null,
        notes: typeof o.notes === "string" ? o.notes : "",
      };
    }
    return emptyTrainingSession();
  };
  return {
    gimnasio: one("gimnasio"),
    natacion: one("natacion"),
    casa: one("casa"),
  };
}

function isValidYmd(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export type ErpDayLogValidation =
  | { ok: true; log: ErpDayLog }
  | { ok: false; error: string };

/**
 * Valida y normaliza un log recibido desde una fuente externa (API/Mongo).
 * Mantiene la fecha como YYYY-MM-DD para evitar desfases por zona horaria.
 */
export function validateErpDayLog(
  raw: unknown,
  expectedDate?: string,
): ErpDayLogValidation {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "El registro del día es inválido" };
  }

  const value = raw as Record<string, unknown>;
  const date = typeof value.date === "string" ? value.date : expectedDate ?? "";
  if (!isValidYmd(date) || (expectedDate !== undefined && date !== expectedDate)) {
    return { ok: false, error: "La fecha es inválida" };
  }

  const alarm = value.alarm as Record<string, unknown> | undefined;
  const rangAt = typeof alarm?.rangAt === "string" ? alarm.rangAt : "";
  const startedWorkAt =
    typeof alarm?.startedWorkAt === "string" ? alarm.startedWorkAt : "";
  const snoozedTimes = Number(alarm?.snoozedTimes);
  if (
    !isValidTime(rangAt) ||
    !isValidTime(startedWorkAt) ||
    !Number.isInteger(snoozedTimes) ||
    snoozedTimes < 0
  ) {
    return { ok: false, error: "Los datos de la alarma son inválidos" };
  }

  const rawWork = value.work as Record<string, unknown> | undefined;
  const work = { ...EMPTY_WORK };
  for (const key of Object.keys(work) as WorkCategoryKey[]) {
    const hours = Number(rawWork?.[key]);
    if (!Number.isFinite(hours) || hours < 0) {
      return { ok: false, error: `Las horas de ${key} son inválidas` };
    }
    work[key] = hours;
  }

  if (!value.training || typeof value.training !== "object") {
    return { ok: false, error: "Los datos de entrenamiento son inválidos" };
  }
  const rawTraining = value.training as Record<string, unknown>;
  for (const key of ["gimnasio", "natacion", "casa"] as TrainingCategoryKey[]) {
    const rawSession = rawTraining[key];
    if (!rawSession || typeof rawSession !== "object") {
      return { ok: false, error: `El entrenamiento de ${key} es inválido` };
    }
    const session = rawSession as Record<string, unknown>;
    if (typeof session.done !== "boolean") {
      return { ok: false, error: `El estado de ${key} es inválido` };
    }
    if (
      session.minutes !== null &&
      session.minutes !== undefined &&
      (typeof session.minutes !== "number" ||
        !Number.isInteger(session.minutes) ||
        session.minutes < 0)
    ) {
      return { ok: false, error: `Los minutos de ${key} son inválidos` };
    }
    if (session.notes !== undefined && typeof session.notes !== "string") {
      return { ok: false, error: `El detalle de ${key} es inválido` };
    }
  }

  const training = normalizeTraining(rawTraining);
  for (const key of Object.keys(training) as TrainingCategoryKey[]) {
    const session = training[key];
    if (
      session.minutes !== null &&
      (!Number.isInteger(session.minutes) || session.minutes < 0)
    ) {
      return { ok: false, error: `Los minutos de ${key} son inválidos` };
    }
    session.notes = (session.notes ?? "").trim().slice(0, 1000);
  }

  const rawEnglish = value.english;
  let english = emptyTrainingSession();
  if (rawEnglish !== undefined) {
    if (!rawEnglish || typeof rawEnglish !== "object") {
      return { ok: false, error: "Los datos de inglés son inválidos" };
    }
    const session = rawEnglish as Record<string, unknown>;
    if (typeof session.done !== "boolean") {
      return { ok: false, error: "El estado de inglés es inválido" };
    }
    if (
      session.minutes !== null &&
      session.minutes !== undefined &&
      (typeof session.minutes !== "number" ||
        !Number.isInteger(session.minutes) ||
        session.minutes < 0)
    ) {
      return { ok: false, error: "Los minutos de inglés son inválidos" };
    }
    if (session.notes !== undefined && typeof session.notes !== "string") {
      return { ok: false, error: "El detalle de inglés es inválido" };
    }
    english = {
      done: session.done,
      minutes: typeof session.minutes === "number" ? session.minutes : null,
      notes: typeof session.notes === "string" ? session.notes.trim().slice(0, 1000) : "",
    };
  }

  let creatine = false;
  if (value.creatine !== undefined) {
    if (typeof value.creatine !== "boolean") {
      return { ok: false, error: "El estado de creatina es inválido" };
    }
    creatine = value.creatine;
  }

  const nullableNumber = (
    input: unknown,
    min: number,
    max: number,
  ): number | null | undefined => {
    if (input === null || input === undefined || input === "") return null;
    const number = Number(input);
    if (!Number.isFinite(number) || number < min || number > max) return undefined;
    return number;
  };

  const sleepHours = nullableNumber(value.sleepHours, 0, 24);
  if (sleepHours === undefined) {
    return { ok: false, error: "Las horas de sueño son inválidas" };
  }
  const foodScore = nullableNumber(value.foodScore, 1, 10);
  if (foodScore === undefined || (foodScore !== null && !Number.isInteger(foodScore))) {
    return { ok: false, error: "La puntuación de alimentación es inválida" };
  }

  return {
    ok: true,
    log: {
      date,
      alarm: { rangAt, snoozedTimes, startedWorkAt },
      work,
      training,
      english,
      creatine,
      sleepHours,
      foodScore,
      notes: typeof value.notes === "string" ? value.notes.trim().slice(0, 5000) : "",
    },
  };
}
