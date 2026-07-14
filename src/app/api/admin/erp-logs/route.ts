import { NextRequest, NextResponse } from "next/server";
import { listErpDayLogs } from "@/app/lib/erpDayLogsMongo";

export const runtime = "nodejs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";
    if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to) || from > to) {
      return NextResponse.json(
        { error: "El rango de fechas es inválido" },
        { status: 400 },
      );
    }

    const rangeDays = Math.floor(
      (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000,
    );
    if (!Number.isFinite(rangeDays) || rangeDays > 370) {
      return NextResponse.json(
        { error: "El rango no puede superar 370 días" },
        { status: 400 },
      );
    }

    const logs = await listErpDayLogs(from, to);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[admin:erp-logs] list failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los registros del ERP" },
      { status: 500 },
    );
  }
}
