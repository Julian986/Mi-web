import { NextRequest, NextResponse } from "next/server";
import { deleteSaasTarea, updateSaasTarea } from "@/app/lib/saasTareasMongo";

export const runtime = "nodejs";

/** PATCH: actualizar tarea SaaS */
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
    const unset: ("fechaRealizada" | "prioridad")[] = [];

    if (body.text !== undefined) {
      const trimmed = String(body.text || "").trim();
      if (!trimmed) {
        return NextResponse.json({ error: "El texto es requerido" }, { status: 400 });
      }
      patch.text = trimmed;
    }
    if (body.done !== undefined) patch.done = Boolean(body.done);
    if (body.createdAt !== undefined) {
      const v = String(body.createdAt);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return NextResponse.json({ error: "Fecha pedido inválida" }, { status: 400 });
      }
      patch.createdAt = v;
    }
    if (body.fechaRealizada !== undefined) {
      if (body.fechaRealizada === null || body.fechaRealizada === "") {
        unset.push("fechaRealizada");
      } else {
        const v = String(body.fechaRealizada);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          return NextResponse.json({ error: "Fecha realizada inválida" }, { status: 400 });
        }
        patch.fechaRealizada = v;
      }
    }
    if (body.prioridad !== undefined) {
      if (body.prioridad === null || body.prioridad === "") {
        unset.push("prioridad");
      } else {
        const n = parseInt(String(body.prioridad), 10);
        if (Number.isNaN(n) || n < 0) {
          return NextResponse.json({ error: "Prioridad inválida" }, { status: 400 });
        }
        patch.prioridad = n;
      }
    }

    if (Object.keys(patch).length === 0 && unset.length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const ok = await updateSaasTarea(id, patch, unset.length ? unset : undefined);
    if (!ok) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:saas-tareas] update failed", e);
    return NextResponse.json({ error: "No se pudo actualizar la tarea" }, { status: 500 });
  }
}

/** DELETE: eliminar tarea SaaS */
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
    const ok = await deleteSaasTarea(id);
    if (!ok) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:saas-tareas] delete failed", e);
    return NextResponse.json({ error: "No se pudo eliminar la tarea" }, { status: 500 });
  }
}
