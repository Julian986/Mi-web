import { NextRequest, NextResponse } from "next/server";
import { deleteErpDayLog, upsertErpDayLog } from "@/app/lib/erpDayLogsMongo";
import { validateErpDayLog } from "@/app/admin92/erp/lib/erpTypes";

export const runtime = "nodejs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const { date } = await params;
    if (!DATE_PATTERN.test(date)) {
      return NextResponse.json({ error: "La fecha es inválida" }, { status: 400 });
    }

    const validation = validateErpDayLog(await req.json(), date);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const log = await upsertErpDayLog(validation.log);
    return NextResponse.json({ ok: true, log });
  } catch (error) {
    console.error("[admin:erp-logs] upsert failed", error);
    return NextResponse.json(
      { error: "No se pudo guardar el registro del ERP" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }

    const { date } = await params;
    if (!DATE_PATTERN.test(date)) {
      return NextResponse.json({ error: "La fecha es inválida" }, { status: 400 });
    }

    const deleted = await deleteErpDayLog(date);
    if (!deleted) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin:erp-logs] delete failed", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro del ERP" },
      { status: 500 },
    );
  }
}
