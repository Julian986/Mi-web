import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "glomun_sub";

type Period = "day" | "week" | "month";

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "day":
      start.setDate(start.getDate() - 30);
      break;
    case "week":
      start.setDate(start.getDate() - 12 * 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 12);
      break;
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
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
    const property = `properties/${ga4PropertyId}`;

    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
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

    let data: { date: string; visitors: number }[];

    if (period === "day") {
      data = rawRows.map(({ dateStr, visitors }) => {
        const m = parseInt(dateStr.slice(4, 6), 10) - 1;
        const d = dateStr.slice(6, 8);
        return { date: `${d} ${monthNames[m]}`, visitors };
      });
    } else if (period === "week") {
      const byWeek = new Map<string, number>();
      for (const { dateStr, visitors } of rawRows) {
        const d = new Date(
          parseInt(dateStr.slice(0, 4), 10),
          parseInt(dateStr.slice(4, 6), 10) - 1,
          parseInt(dateStr.slice(6, 8), 10)
        );
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        byWeek.set(key, (byWeek.get(key) || 0) + visitors);
      }
      const sorted = Array.from(byWeek.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      data = sorted.slice(-12).map(([key, visitors]) => {
        const [y, m, day] = key.split("-").map(Number);
        return {
          date: `Sem (${day} ${monthNames[m - 1]})`,
          visitors,
        };
      });
    } else {
      const byMonth = new Map<string, number>();
      for (const { dateStr, visitors } of rawRows) {
        const key = dateStr.slice(0, 6);
        byMonth.set(key, (byMonth.get(key) || 0) + visitors);
      }
      const sorted = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      data = sorted.slice(-12).map(([key, visitors]) => {
        const m = parseInt(key.slice(4, 6), 10) - 1;
        const y = key.slice(0, 4);
        return { date: `${monthNames[m]} ${y}`, visitors };
      });
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
