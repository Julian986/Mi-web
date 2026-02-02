import { NextRequest, NextResponse } from "next/server";
import {
  insertAccountingRecord,
  listAccountingRecords,
  type AccountingType,
} from "@/app/lib/accountingMongo";

export const runtime = "nodejs";

/** GET: listar registros de contabilidad */
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const records = await listAccountingRecords();
    return NextResponse.json({ records });
  } catch (e) {
    console.error("[admin:accounting] list failed", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los registros" },
      { status: 500 }
    );
  }
}

/** POST: crear registro (ingreso, gasto o inversión) */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const body = await req.json();
    const { type, amount, description, category, date } = body;

    if (
      !type ||
      !["ingreso", "gasto", "inversion"].includes(type as AccountingType)
    ) {
      return NextResponse.json(
        { error: "Tipo inválido (ingreso, gasto, inversion)" },
        { status: 400 }
      );
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Monto debe ser un número positivo" },
        { status: 400 }
      );
    }
    const desc = String(description || "").trim();
    if (!desc) {
      return NextResponse.json(
        { error: "La descripción es requerida" },
        { status: 400 }
      );
    }

    // "YYYY-MM-DD" sin hora se interpreta como UTC medianoche → día anterior en Argentina.
    // Usamos noon UTC para que la fecha sea correcta en cualquier timezone.
    const recordDate = date
      ? new Date(date.includes("T") ? date : `${date}T12:00:00.000Z`)
      : new Date();
    const doc = {
      type: type as AccountingType,
      amount: numAmount,
      description: desc,
      category: category ? String(category).trim() : undefined,
      date: recordDate,
    };

    await insertAccountingRecord(doc);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:accounting] insert failed", e);
    return NextResponse.json(
      { error: "No se pudo guardar el registro" },
      { status: 500 }
    );
  }
}
