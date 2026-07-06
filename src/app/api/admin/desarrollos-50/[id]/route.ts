import { NextRequest, NextResponse } from "next/server";
import { deleteAccountingRecord } from "@/app/lib/accountingMongo";
import {
  deleteDesarrollo50,
  getDesarrollo50ById,
  updateDesarrollo50,
} from "@/app/lib/desarrollos50Mongo";

export const runtime = "nodejs";

/** PATCH: actualizar desarrollo 50% */
export async function PATCH(
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
    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (body.clientName !== undefined) {
      const v = String(body.clientName || "").trim();
      if (!v) {
        return NextResponse.json({ error: "El cliente es requerido" }, { status: 400 });
      }
      patch.clientName = v;
    }
    if (body.name !== undefined) {
      const v = String(body.name || "").trim();
      if (!v) {
        return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
      }
      patch.name = v;
    }
    if (body.servicio !== undefined) {
      patch.servicio = body.servicio ? String(body.servicio).trim() : undefined;
    }
    if (body.fechaCobro50 !== undefined) {
      const v = String(body.fechaCobro50);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
      }
      patch.fechaCobro50 = v;
    }
    if (body.activo !== undefined) {
      patch.activo = Boolean(body.activo);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const ok = await updateDesarrollo50(id, patch);
    if (!ok) {
      return NextResponse.json({ error: "Desarrollo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:desarrollos-50] update failed", e);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

/** DELETE: eliminar desarrollo 50% y sus ingresos vinculados */
export async function DELETE(
  _req: NextRequest,
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

    if (existing.accountingRecordId) {
      await deleteAccountingRecord(existing.accountingRecordId);
    }
    if (existing.accountingRecordIdFinal) {
      await deleteAccountingRecord(existing.accountingRecordIdFinal);
    }

    const ok = await deleteDesarrollo50(id);
    if (!ok) {
      return NextResponse.json({ error: "Desarrollo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:desarrollos-50] delete failed", e);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
