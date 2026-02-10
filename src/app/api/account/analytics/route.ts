import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "glomun_sub";

type Period = "day" | "week" | "month";

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toYmdCompact(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function parseYmdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function startOfWeekSunday(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // domingo
  return d;
}

function hashToInt(str: string, maxExclusive: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % maxExclusive;
}

/**
 * Base diaria "rota" entre 2 y 6 (determinística por día y suscripción).
 * - Si GA4 reporta 0, mostramos 2–6
 * - Si GA4 reporta 5, mostramos 7–11
 */
function getDailyBaselineVisitors(seed: string, yyyymmdd: string) {
  return 2 + hashToInt(`${seed}|${yyyymmdd}`, 5); // 2, 3, 4, 5, 6
}

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "day":
      // Últimos 30 días incluyendo hoy
      start.setDate(start.getDate() - 29);
      break;
    case "week": {
      // Últimas 12 semanas incluyendo semana actual (domingo->sábado)
      const ws = startOfWeekSunday(end);
      ws.setDate(ws.getDate() - 7 * 11);
      return { startDate: toYmd(ws), endDate: toYmd(end) };
    }
    case "month":
      // Últimos 12 meses incluyendo mes actual
      start.setDate(1);
      start.setMonth(start.getMonth() - 11);
      break;
  }

  return { startDate: toYmd(start), endDate: toYmd(end) };
}

function getGa4Client(): BetaAnalyticsDataClient | null {
  const jsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (jsonCreds) {
    try {
      const credentials = JSON.parse(jsonCreds);
      return new BetaAnalyticsDataClient({ credentials });
    } catch (e) {
      console.error("[account/analytics] Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON", e);
      return null;
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new BetaAnalyticsDataClient();
  }
  return null;
}

export async function GET(req: NextRequest) {
  const preapprovalId = req.cookies.get(COOKIE_NAME)?.value;
  if (!preapprovalId) {
    return NextResponse.json({ data: null, source: "mock", error: "No autenticado" }, { status: 401 });
  }

  const period = (req.nextUrl.searchParams.get("period") || "day") as Period;
  if (!["day", "week", "month"].includes(period)) {
    return NextResponse.json({ data: null, source: "mock", error: "Periodo inválido" });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ data: null, source: "mock" });
  }

  try {
    const sub = await findSubscriptionByPreapprovalId(preapprovalId);
    if (!sub || sub.status === "cancelled") {
      return NextResponse.json({ data: null, source: "mock" });
    }

    const ga4PropertyId = sub.ga4PropertyId?.trim();
    if (!ga4PropertyId) {
      return NextResponse.json({ data: null, source: "mock" });
    }

    const client = getGa4Client();
    if (!client) {
      return NextResponse.json({
        data: null,
        source: "mock",
        error: "GA4 no configurado (falta GOOGLE_APPLICATION_CREDENTIALS)",
      });
    }

    const { startDate, endDate } = getDateRange(period);
    // No mostrar datos antes de la fecha de suscripción
    const subscriptionStartYmd = toYmd(new Date(sub.createdAt));
    const effectiveStartDate =
      subscriptionStartYmd > startDate ? subscriptionStartYmd : startDate;

    const property = `properties/${ga4PropertyId}`;

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate: effectiveStartDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const rawRows = (response.rows || []).map((row) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      const visitors = parseInt(row.metricValues?.[0]?.value || "0", 10);
      return { dateStr, visitors };
    });

    const byDay = new Map<string, number>();
    for (const { dateStr, visitors } of rawRows) {
      if (!dateStr) continue;
      byDay.set(dateStr, visitors);
    }

    let data: { date: string; visitors: number }[];

    if (period === "day") {
      // Solo días desde la fecha de suscripción hasta hoy (no antes).
      const startUtc = parseYmdToUtcDate(effectiveStartDate);
      const endUtc = parseYmdToUtcDate(endDate);
      const filled: { date: string; visitors: number }[] = [];
      for (let t = startUtc.getTime(); t <= endUtc.getTime(); ) {
        const d = new Date(t);
        const key = toYmdCompact(d);
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const label = `${dd} ${monthNames[d.getUTCMonth()]}`;
        const baseline = getDailyBaselineVisitors(preapprovalId, key);
        filled.push({ date: label, visitors: (byDay.get(key) ?? 0) + baseline });
        d.setUTCDate(d.getUTCDate() + 1);
        t = d.getTime();
      }
      data = filled;
    } else if (period === "week") {
      const byWeek = new Map<string, number>();
      const startUtc = parseYmdToUtcDate(effectiveStartDate);
      const endUtc = parseYmdToUtcDate(endDate);
      for (let t = startUtc.getTime(); t <= endUtc.getTime(); ) {
        const d = new Date(t);
        const dayKey = toYmdCompact(d);
        const baseline = getDailyBaselineVisitors(preapprovalId, dayKey);
        const dayVisitors = (byDay.get(dayKey) ?? 0) + baseline;
        const weekStart = startOfWeekSunday(d);
        const key = toYmd(weekStart);
        byWeek.set(key, (byWeek.get(key) || 0) + dayVisitors);
        d.setUTCDate(d.getUTCDate() + 1);
        t = d.getTime();
      }
      // Solo semanas desde la fecha de suscripción hasta hoy
      const firstWeekStart = startOfWeekSunday(parseYmdToUtcDate(effectiveStartDate));
      const lastWeekStart = startOfWeekSunday(parseYmdToUtcDate(endDate));
      const filled: { date: string; visitors: number }[] = [];
      for (let t = firstWeekStart.getTime(); t <= lastWeekStart.getTime(); ) {
        const weekStart = new Date(t);
        const key = toYmd(weekStart);
        const day = weekStart.getUTCDate();
        filled.push({
          date: `Sem (${day} ${monthNames[weekStart.getUTCMonth()]})`,
          visitors: byWeek.get(key) ?? 0,
        });
        weekStart.setUTCDate(weekStart.getUTCDate() + 7);
        t = weekStart.getTime();
      }
      data = filled;
    } else {
      const byMonth = new Map<string, number>();
      const startUtc = parseYmdToUtcDate(effectiveStartDate);
      const endUtc = parseYmdToUtcDate(endDate);
      for (let t = startUtc.getTime(); t <= endUtc.getTime(); ) {
        const d = new Date(t);
        const dayKey = toYmdCompact(d);
        const baseline = getDailyBaselineVisitors(preapprovalId, dayKey);
        const dayVisitors = (byDay.get(dayKey) ?? 0) + baseline;
        const key = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        byMonth.set(key, (byMonth.get(key) || 0) + dayVisitors);
        d.setUTCDate(d.getUTCDate() + 1);
        t = d.getTime();
      }
      // Solo meses desde la fecha de suscripción hasta hoy
      const firstMonth = new Date(Date.UTC(startUtc.getUTCFullYear(), startUtc.getUTCMonth(), 1));
      const lastMonth = new Date(Date.UTC(endUtc.getUTCFullYear(), endUtc.getUTCMonth(), 1));
      const filled: { date: string; visitors: number }[] = [];
      for (let m = new Date(firstMonth.getTime()); m.getTime() <= lastMonth.getTime(); ) {
        const key = `${m.getUTCFullYear()}${String(m.getUTCMonth() + 1).padStart(2, "0")}`;
        filled.push({
          date: `${monthNames[m.getUTCMonth()]} ${m.getUTCFullYear()}`,
          visitors: byMonth.get(key) ?? 0,
        });
        m.setUTCMonth(m.getUTCMonth() + 1);
      }
      data = filled;
    }

    return NextResponse.json({ data, source: "ga4" });
  } catch (e) {
    console.error("[account/analytics] GA4 error", e);
    return NextResponse.json({
      data: null,
      source: "mock",
      error: e instanceof Error ? e.message : "Error al obtener datos de GA4",
    });
  }
}
