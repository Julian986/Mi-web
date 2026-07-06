import { NextRequest, NextResponse } from "next/server";
import { insertAccountingRecord } from "@/app/lib/accountingMongo";
import { getDesarrollo50ById, updateDesarrollo50 } from "@/app/lib/desarrollos50Mongo";
import { ingresoDescripcionDesarrollo50 } from "@/app/admin92/contabilidad/lib/desarrollos50Labels";

export const runtime = "nodejs";

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** POST: registrar cobro del 50% final y cerrar desarrollo */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const existing = await getDesarrollo50ById(id);
    if (!existing) {
      return NextResponse.json({ error: "Desarrollo no encontrado" }, { status: 404 });
    }
    if (existing.activo === false || existing.accountingRecordIdFinal) {
      return NextResponse.json({ error: "Este desarrollo ya está cerrado" }, { status: 400 });
    }

    const body = await req.json();
    const fechaCobro50Final =
      typeof body.fechaCobro50Final === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.fechaCobro50Final)
        ? body.fechaCobro50Final
        : todayYmd();

    const montoRaw =
      body.montoCobrado50Final !== undefined
        ? Number(body.montoCobrado50Final)
        : existing.montoCobrado50;
    if (montoRaw === undefined || Number.isNaN(montoRaw) || montoRaw <= 0) {
      return NextResponse.json({ error: "El monto del 50% final es requerido" }, { status: 400 });
    }

    const description = ingresoDescripcionDesarrollo50(
      existing.clientName,
      existing.name,
      "final",
    );
    const accountingId = await insertAccountingRecord({
      type: "ingreso",
      amount: montoRaw,
      description,
      category: existing.servicio || "Desarrollo",
      date: new Date(`${fechaCobro50Final}T12:00:00.000Z`),
    });

    const ok = await updateDesarrollo50(id, {
      fechaCobro50Final,
      montoCobrado50Final: montoRaw,
      accountingRecordIdFinal: accountingId.toString(),
      activo: false,
    });
    if (!ok) {
      return NextResponse.json({ error: "No se pudo cerrar el desarrollo" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      accountingRecordId: accountingId.toString(),
    });
  } catch (e) {
    console.error("[admin:desarrollos-50] cobrar-final failed", e);
    return NextResponse.json({ error: "No se pudo registrar el cobro final" }, { status: 500 });
  }
}
