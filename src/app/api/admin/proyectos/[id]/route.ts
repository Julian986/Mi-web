import { NextRequest, NextResponse } from "next/server";
import {
  updateProyecto,
  deleteProyecto,
  findProyectoByClient,
} from "@/app/lib/proyectosMongo";

export const runtime = "nodejs";

const STATUSES = ["en_desarrollo", "en_revision", "en_produccion", "archivado"] as const;
const TIPOS = ["App", "Tienda", "Web", "Mantenimiento", "Otro"];

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** PATCH: actualizar proyecto */
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
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const nameStr = String(body.name || "").trim();
      if (!nameStr) {
        return NextResponse.json(
          { error: "El nombre del desarrollo no puede estar vacío" },
          { status: 400 }
        );
      }
      updates.name = nameStr;
    }
    if (body.clientName !== undefined) {
      const clientStr = String(body.clientName || "").trim();
      if (!clientStr) {
        return NextResponse.json(
          { error: "El nombre del cliente no puede estar vacío" },
          { status: 400 }
        );
      }
      // Un solo proyecto activo por cliente (excluir el actual)
      const existing = await findProyectoByClient(clientStr, true, id);
      if (existing) {
        return NextResponse.json(
          { error: `Ya existe un proyecto activo para el cliente "${clientStr}". Archivá el existente o usá otro cliente.` },
          { status: 400 }
        );
      }
      updates.clientName = clientStr;
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Estado inválido" },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }
    if (body.type !== undefined) {
      const typeVal = body.type && TIPOS.includes(String(body.type))
        ? String(body.type)
        : "Web";
      updates.type = typeVal;
    }
    if (body.fechaInicio !== undefined) {
      if (!isValidDate(String(body.fechaInicio))) {
        return NextResponse.json(
          { error: "Fecha de inicio inválida (formato YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      updates.fechaInicio = String(body.fechaInicio).trim();
    }
    if (body.ultimaActualizacion !== undefined) {
      if (!isValidDate(String(body.ultimaActualizacion))) {
        return NextResponse.json(
          { error: "Última actualización inválida (formato YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      updates.ultimaActualizacion = String(body.ultimaActualizacion).trim();
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes ? String(body.notes).trim() : undefined;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const ok = await updateProyecto(id, updates);
    return NextResponse.json({ ok });
  } catch (e) {
    console.error("[admin:proyectos] update failed", e);
    return NextResponse.json(
      { error: "No se pudo actualizar el proyecto" },
      { status: 500 }
    );
  }
}

/** DELETE: eliminar proyecto */
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

    const ok = await deleteProyecto(id);
    if (!ok) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin:proyectos] delete failed", e);
    return NextResponse.json(
      { error: "No se pudo eliminar el proyecto" },
      { status: 500 }
    );
  }
}
