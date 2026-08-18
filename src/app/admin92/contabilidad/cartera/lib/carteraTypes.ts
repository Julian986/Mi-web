export const CARTERA_KINDS = [
  "cedear",
  "accion",
  "fci",
  "bono",
  "crypto",
  "otro",
] as const;

export type CarteraKind = (typeof CARTERA_KINDS)[number];

export const CARTERA_CURRENCIES = ["ARS", "USD"] as const;
export type CarteraCurrency = (typeof CARTERA_CURRENCIES)[number];

export type CarteraQuoteSource = "manual";

export const CARTERA_KIND_LABELS: Record<CarteraKind, string> = {
  cedear: "CEDEAR",
  accion: "Acción",
  fci: "FCI",
  bono: "Bono",
  crypto: "Crypto",
  otro: "Otro",
};

export type CarteraHolding = {
  _id: string;
  name: string;
  ticker: string | null;
  kind: CarteraKind;
  quantity: number;
  avgCost: number;
  currency: CarteraCurrency;
  currentPrice: number | null;
  quoteSource: CarteraQuoteSource;
  quotedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CarteraHoldingInput = {
  name: string;
  ticker: string | null;
  kind: CarteraKind;
  quantity: number;
  avgCost: number;
  currency: CarteraCurrency;
  currentPrice: number | null;
  notes: string;
};

export type CarteraCurrencyTotals = {
  currency: CarteraCurrency;
  invested: number;
  market: number;
  investedPriced: number;
  pnl: number;
  holdings: number;
  unpriced: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function parsePositiveNumber(value: unknown, label: string): number | { error: string } {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return { error: `${label} debe ser un número positivo` };
  }
  return num;
}

function parseNonNegativeNumber(value: unknown, label: string): number | { error: string } {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return { error: `${label} debe ser un número mayor o igual a 0` };
  }
  return num;
}

export function parseCarteraHoldingInput(
  body: unknown,
  mode: "create" | "patch",
): { ok: true; value: Partial<CarteraHoldingInput> } | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "Cuerpo inválido" };
  }

  const value: Partial<CarteraHoldingInput> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (mode === "create" || has("name")) {
    const name = String(body.name ?? "").trim();
    if (!name) return { ok: false, error: "El nombre es requerido" };
    value.name = name;
  }

  if (mode === "create" || has("ticker")) {
    value.ticker = parseOptionalString(body.ticker);
  }

  if (mode === "create" || has("kind")) {
    const kind = String(body.kind ?? "");
    if (!CARTERA_KINDS.includes(kind as CarteraKind)) {
      return { ok: false, error: "Tipo de activo inválido" };
    }
    value.kind = kind as CarteraKind;
  }

  if (mode === "create" || has("quantity")) {
    const quantity = parsePositiveNumber(body.quantity, "La cantidad");
    if (typeof quantity === "object") return { ok: false, error: quantity.error };
    value.quantity = quantity;
  }

  if (mode === "create" || has("avgCost")) {
    const avgCost = parseNonNegativeNumber(body.avgCost, "El costo promedio");
    if (typeof avgCost === "object") return { ok: false, error: avgCost.error };
    value.avgCost = avgCost;
  }

  if (mode === "create" || has("currency")) {
    const currency = String(body.currency ?? "");
    if (!CARTERA_CURRENCIES.includes(currency as CarteraCurrency)) {
      return { ok: false, error: "Moneda inválida (ARS o USD)" };
    }
    value.currency = currency as CarteraCurrency;
  }

  if (mode === "create" || has("currentPrice")) {
    if (body.currentPrice === null || body.currentPrice === "" || body.currentPrice === undefined) {
      value.currentPrice = null;
    } else {
      const currentPrice = parseNonNegativeNumber(body.currentPrice, "El precio actual");
      if (typeof currentPrice === "object") return { ok: false, error: currentPrice.error };
      value.currentPrice = currentPrice;
    }
  }

  if (mode === "create" || has("notes")) {
    value.notes = String(body.notes ?? "").trim();
  }

  if (mode === "patch" && Object.keys(value).length === 0) {
    return { ok: false, error: "Nada que actualizar" };
  }

  return { ok: true, value };
}

export function holdingCost(holding: Pick<CarteraHolding, "quantity" | "avgCost">): number {
  return holding.quantity * holding.avgCost;
}

export function holdingMarketValue(
  holding: Pick<CarteraHolding, "quantity" | "currentPrice">,
): number | null {
  if (holding.currentPrice === null) return null;
  return holding.quantity * holding.currentPrice;
}

export function holdingPnlPct(holding: Pick<CarteraHolding, "avgCost" | "currentPrice">): number | null {
  if (holding.currentPrice === null || holding.avgCost <= 0) return null;
  return ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
}

export function summarizeCartera(holdings: CarteraHolding[]): CarteraCurrencyTotals[] {
  const empty = (currency: CarteraCurrency): CarteraCurrencyTotals => ({
    currency,
    invested: 0,
    market: 0,
    investedPriced: 0,
    pnl: 0,
    holdings: 0,
    unpriced: 0,
  });
  const byCurrency: Record<CarteraCurrency, CarteraCurrencyTotals> = {
    ARS: empty("ARS"),
    USD: empty("USD"),
  };

  for (const holding of holdings) {
    const bucket = byCurrency[holding.currency];
    bucket.holdings += 1;
    bucket.invested += holdingCost(holding);
    const market = holdingMarketValue(holding);
    if (market === null) {
      bucket.unpriced += 1;
    } else {
      bucket.market += market;
      bucket.investedPriced += holdingCost(holding);
    }
  }

  return CARTERA_CURRENCIES.map((currency) => {
    const bucket = byCurrency[currency];
    return { ...bucket, pnl: bucket.market - bucket.investedPriced };
  }).filter((bucket) => bucket.holdings > 0);
}

export function formatCarteraMoney(n: number, currency: CarteraCurrency): string {
  const formatted = n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted} ${currency}`;
}

export function formatCarteraQty(n: number): string {
  return n.toLocaleString("es-AR", {
    maximumFractionDigits: 8,
  });
}

export function formatPnlPct(n: number | null): string {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toLocaleString("es-AR", {
    maximumFractionDigits: 1,
  })}%`;
}
