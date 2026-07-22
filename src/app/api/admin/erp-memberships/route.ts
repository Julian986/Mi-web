import { NextRequest, NextResponse } from "next/server";
import { listErpMembershipMonths } from "@/app/lib/erpMembershipsMongo";

export const runtime = "nodejs";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export async function GET(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const from = req.nextUrl.searchParams.get("from") ?? "";
    const to = req.nextUrl.searchParams.get("to") ?? "";
    if (!MONTH_PATTERN.test(from) || !MONTH_PATTERN.test(to) || from > to) {
      return NextResponse.json({ error: "El rango de meses es inválido" }, { status: 400 });
    }

    const memberships = await listErpMembershipMonths(from, to);
    return NextResponse.json({ memberships });
  } catch (error) {
    console.error("[admin:erp-memberships] list failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las cuotas" },
      { status: 500 },
    );
  }
}
