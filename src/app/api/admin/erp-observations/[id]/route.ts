import { NextRequest, NextResponse } from "next/server";
import {
  deleteErpObservation,
  updateErpObservation,
} from "@/app/lib/erpObservationsMongo";
import { parseErpObservationInput } from "@/app/admin92/erp/lib/erpObservations";

export const runtime = "nodejs";

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

    const body: unknown = await req.json();
    const parsed = parseErpObservationInput(body, "patch");
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const observation = await updateErpObservation(id, parsed.value);
    if (!observation) {
      return NextResponse.json({ error: "Observación no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, observation });
  } catch (error) {
    console.error("[admin:erp-observations] update failed", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la observación" },
      { status: 500 },
    );
  }
}

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

    const ok = await deleteErpObservation(id);
    if (!ok) {
      return NextResponse.json({ error: "Observación no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin:erp-observations] delete failed", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la observación" },
      { status: 500 },
    );
  }
}
