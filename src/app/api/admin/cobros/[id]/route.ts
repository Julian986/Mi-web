import { NextRequest, NextResponse } from "next/server";
import {
  getCobroById,
  updateCobro,
  updateCobrosByClient,
  deleteCobro,
} from "@/app/lib/cobrosMongo";
import { insertAccountingRecord } from "@/app/lib/accountingMongo";

export const runtime = "nodejs";

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

    const existing = await getCobroById(id);
    if (!existing) {
      return NextResponse.json({ error: "Cobro no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const {
      amount,
      servicio,
      paid,
      paidAt,
      dueDate,
      dueDateFrom,
      fechaIngreso,
      estadisticasEnviadas,
      fechaEnvioEstadisticas,
      recordatorioEnviado,
      updateFuture,
      origen,
      notes,
    } = body;

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
        updates.paidAt = todayYmd();
      } else {
        unsetFields.push("paidAt", "accountingRecordId", "fechaCobro");
      }
    }
    if (paidAt !== undefined && paidAt !== null) {
      updates.paidAt = /^\d{4}-\d{2}-\d{2}$/.test(String(paidAt)) ? String(paidAt) : undefined;
    }
    if (dueDate !== undefined && dueDate !== null) {
      const dueDateStr = String(dueDate).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)) {
        return NextResponse.json(
          { error: "La fecha de cobro debe tener formato YYYY-MM-DD" },
          { status: 400 }
        );
      }
      updates.dueDate = dueDateStr;
    }
    if (estadisticasEnviadas !== undefined) {
      updates.estadisticasEnviadas = Boolean(estadisticasEnviadas);
      if (estadisticasEnviadas) {
        const fechaStr =
          fechaEnvioEstadisticas &&
          /^\d{4}-\d{2}-\d{2}$/.test(String(fechaEnvioEstadisticas))
            ? String(fechaEnvioEstadisticas)
            : todayYmd();
        updates.fechaEnvioEstadisticas = fechaStr;
      } else {
        unsetFields.push("fechaEnvioEstadisticas");
      }
    } else if (
      fechaEnvioEstadisticas !== undefined &&
      fechaEnvioEstadisticas !== null &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(fechaEnvioEstadisticas)) &&
      existing.estadisticasEnviadas
    ) {
      updates.fechaEnvioEstadisticas = String(fechaEnvioEstadisticas);
    }
    if (recordatorioEnviado !== undefined) {
      updates.recordatorioEnviado = Boolean(recordatorioEnviado);
    }
    if (origen !== undefined) {
      updates.origen = String(origen) === "suscripcion_mp" ? "suscripcion_mp" : "manual";
    }
    if (notes !== undefined) {
      const notesStr = String(notes).trim();
      if (notesStr) {
        updates.notes = notesStr;
      } else {
        unsetFields.push("notes");
      }
    }

    if (updateFuture && amount !== undefined && body.clientName) {
      const numAmount = Number(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        await updateCobrosByClient(
          String(body.clientName).trim(),
          String(dueDateFrom || dueDate || existing.dueDate || ""),
          { amount: numAmount }
        );
      }
    }

  // Sync cuota pagada → ingreso contable
    if (paid === true && !existing.accountingRecordId) {
      const fechaStr =
        fechaIngreso && /^\d{4}-\d{2}-\d{2}$/.test(String(fechaIngreso))
          ? String(fechaIngreso)
          : todayYmd();
      updates.fechaCobro = fechaStr;
      const clientName = existing.clientName;
      const servicioLabel = existing.servicio || (updates.servicio as string | undefined);
      const monto = (updates.amount as number | undefined) ?? existing.amount;
      const description = servicioLabel
        ? `${clientName} (${servicioLabel}) - Cuota`
        : `${clientName} - Cuota`;

      const insertedId = await insertAccountingRecord({
        type: "ingreso",
        amount: monto,
        description,
        category: servicioLabel || "Cuota cliente",
        date: new Date(`${fechaStr}T12:00:00.000Z`),
      });
      updates.accountingRecordId = insertedId.toString();
    }

    if (Object.keys(updates).length > 0 || unsetFields.length > 0) {
      const ok = await updateCobro(id, updates, unsetFields.length > 0 ? unsetFields : undefined);
      return NextResponse.json({ ok, accountingRecordId: updates.accountingRecordId ?? existing.accountingRecordId });
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
