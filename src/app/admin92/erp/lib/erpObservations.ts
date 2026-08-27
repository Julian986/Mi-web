export type ErpObservation = {
  _id: string;
  text: string;
  notedOn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ErpObservationInput = {
  text: string;
  notedOn: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TEXT_MAX = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalNotedOn(value: unknown): string | null | { error: string } {
  if (value === null || value === undefined || value === "") return null;
  const notedOn = String(value).trim();
  if (!notedOn) return null;
  if (!DATE_PATTERN.test(notedOn)) {
    return { error: "La fecha debe ser YYYY-MM-DD" };
  }
  return notedOn;
}

export function parseErpObservationInput(
  body: unknown,
  mode: "create" | "patch",
): { ok: true; value: Partial<ErpObservationInput> } | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "Cuerpo inválido" };
  }

  const value: Partial<ErpObservationInput> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (mode === "create" || has("text")) {
    const text = String(body.text ?? "").trim();
    if (!text) return { ok: false, error: "El texto es requerido" };
    if (text.length > TEXT_MAX) {
      return { ok: false, error: `El texto no puede superar ${TEXT_MAX} caracteres` };
    }
    value.text = text;
  }

  if (mode === "create" || has("notedOn")) {
    const notedOn = parseOptionalNotedOn(body.notedOn);
    if (typeof notedOn === "object" && notedOn !== null && "error" in notedOn) {
      return { ok: false, error: notedOn.error };
    }
    value.notedOn = notedOn;
  }

  if (mode === "patch" && Object.keys(value).length === 0) {
    return { ok: false, error: "Nada que actualizar" };
  }

  return { ok: true, value };
}

export function sortErpObservations(items: ErpObservation[]): ErpObservation[] {
  return [...items].sort((a, b) => {
    if (a.notedOn && b.notedOn) {
      const byDate = b.notedOn.localeCompare(a.notedOn);
      if (byDate !== 0) return byDate;
    } else if (a.notedOn && !b.notedOn) {
      return -1;
    } else if (!a.notedOn && b.notedOn) {
      return 1;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}
