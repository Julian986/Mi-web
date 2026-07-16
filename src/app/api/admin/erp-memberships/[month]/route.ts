import { NextRequest, NextResponse } from "next/server";
import {
  getErpMembershipMonth,
  upsertErpMembershipMonth,
} from "@/app/lib/erpMembershipsMongo";
import { validateErpMembershipMonth } from "@/app/admin92/erp/lib/erpTypes";

export const runtime = "nodejs";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ month: string }> },
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const { month } = await params;
    if (!MONTH_PATTERN.test(month)) {
      return NextResponse.json({ error: "El mes es inválido" }, { status: 400 });
    }

    const membership = await getErpMembershipMonth(month);
    return NextResponse.json({ membership });
  } catch (error) {
    console.error("[admin:erp-memberships] get failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las cuotas" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> },
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const { month } = await params;
    if (!MONTH_PATTERN.test(month)) {
      return NextResponse.json({ error: "El mes es inválido" }, { status: 400 });
    }

    const validation = validateErpMembershipMonth(await req.json(), month);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const membership = await upsertErpMembershipMonth(validation.membership);
    return NextResponse.json({ ok: true, membership });
  } catch (error) {
    console.error("[admin:erp-memberships] upsert failed", error);
    return NextResponse.json(
      { error: "No se pudieron guardar las cuotas" },
      { status: 500 },
    );
  }
}
