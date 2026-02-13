import { NextRequest, NextResponse } from "next/server";
import {
  updateCobro,
  updateCobrosByClient,
  deleteCobro,
} from "@/app/lib/cobrosMongo";

export const runtime = "nodejs";

/** PATCH: actualizar cobro (amount, servicio, paid, paidAt) o actualizar cuotas futuras */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const body = await req.json();
    const { amount, servicio, paid, paidAt, estadisticasEnviadas, recordatorioEnviado, updateFuture } = body;

    const updates: Record<string, unknown> = {};
    let unsetFields: string[] = [];

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json(
          { error: "El monto debe ser un número positivo" },
          { status: 400 }
        );
      }
      updates.amount = numAmount;
    }
    if (servicio !== undefined) {
      updates.servicio = servicio ? String(servicio).trim() : undefined;
    }
    if (paid !== undefined) {
      updates.paid = Boolean(paid);
      if (paid) {
        const d = new Date();
        updates.paidAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } else {
        unsetFields.push("paidAt");
      }
    }
    if (paidAt !== undefined && paidAt !== null) {
      updates.paidAt = /^\d{4}-\d{2}-\d{2}$/.test(String(paidAt)) ? String(paidAt) : undefined;
    }
    if (estadisticasEnviadas !== undefined) {
      updates.estadisticasEnviadas = Boolean(estadisticasEnviadas);
    }
    if (recordatorioEnviado !== undefined) {
      updates.recordatorioEnviado = Boolean(recordatorioEnviado);
    }

    // Si updateFuture: actualizar cuotas futuras pendientes del mismo cliente
    if (updateFuture && amount !== undefined && body.clientName) {
      const numAmount = Number(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        await updateCobrosByClient(
          String(body.clientName).trim(),
          body.dueDate || "",
          { amount: numAmount }
        );
      }
    }

    if (Object.keys(updates).length > 0 || unsetFields.length > 0) {
      const ok = await updateCobro(id, updates, unsetFields.length > 0 ? unsetFields : undefined);
      return NextResponse.json({ ok });
    }

    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  } catch (e) {
    console.error("[admin:cobros] update failed", e);
    return NextResponse.json(
      { error: "No se pudo actualizar el cobro" },
      { status: 500 }
    );
  }
}

/** DELETE: eliminar cobro */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const ok = await deleteCobro(id);
    if (!ok) {
      return NextResponse.json({ error: "Cobro no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:cobros] delete failed", e);
    return NextResponse.json(
      { error: "No se pudo eliminar el cobro" },
      { status: 500 }
    );
  }
}
