import { NextRequest, NextResponse } from "next/server";
import {
  deleteHerramientaNota,
  updateHerramientaNota,
} from "@/app/lib/contabilidadHerramientasMongo";

export const runtime = "nodejs";

/** PATCH: editar texto de una nota */
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
    const trimmed = String(body.text || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "El texto es requerido" }, { status: 400 });
    }
    const ok = await updateHerramientaNota(id, trimmed);
    if (!ok) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:contabilidad-herramientas] update failed", e);
    return NextResponse.json({ error: "No se pudo actualizar la nota" }, { status: 500 });
  }
}

/** DELETE: eliminar nota */
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
    const ok = await deleteHerramientaNota(id);
    if (!ok) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:contabilidad-herramientas] delete failed", e);
    return NextResponse.json({ error: "No se pudo eliminar la nota" }, { status: 500 });
  }
}
