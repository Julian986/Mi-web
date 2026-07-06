import { NextRequest, NextResponse } from "next/server";
import {
  insertProyecto,
  listProyectos,
  findProyectoByClient,
} from "@/app/lib/proyectosMongo";

export const runtime = "nodejs";

const STATUSES = ["en_desarrollo", "en_revision", "desarrollo_50", "en_produccion", "archivado"] as const;
const TIPOS = ["App", "Tienda", "Web", "Mantenimiento", "Otro"];

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** GET: listar proyectos */
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const proyectos = await listProyectos();
    return NextResponse.json({ proyectos });
  } catch (e) {
    console.error("[admin:proyectos] list failed", e);
    return NextResponse.json(
      { error: "No se pudieron cargar los proyectos" },
      { status: 500 }
    );
  }
}

/** POST: crear proyecto */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB no configurado" },
        { status: 503 }
      );
    }
    const body = await req.json();
    const {
      name,
      clientName,
      status,
      type,
      fechaInicio,
      ultimaActualizacion,
      ultimaSolicitud,
      fechaCobro50,
      prioridad,
      notes,
      requiereEstadisticas,
      cambioPendiente,
      solicitudTasks,
    } = body;

    const nameStr = String(name || "").trim();
    if (!nameStr) {
      return NextResponse.json(
        { error: "El nombre del desarrollo es requerido" },
        { status: 400 }
      );
    }

    const clientStr = String(clientName || "").trim();
    if (!clientStr) {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }

    // Un solo proyecto activo por cliente
    const existing = await findProyectoByClient(clientStr);
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un proyecto activo para el cliente "${clientStr}". Archivá el existente o editá ese proyecto.` },
        { status: 400 }
      );
    }

    const statusVal = status && STATUSES.includes(status) ? status : "en_desarrollo";
    const typeVal = type && TIPOS.includes(String(type)) ? String(type) : "Web";

    const fechaInicioStr = String(fechaInicio || "").trim();
    if (!fechaInicioStr || !isValidDate(fechaInicioStr)) {
      return NextResponse.json(
        { error: "La fecha de inicio es requerida (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const ultimaActualizacionStr = String(ultimaActualizacion || "").trim();
    if (ultimaActualizacionStr && !isValidDate(ultimaActualizacionStr)) {
      return NextResponse.json(
        { error: "La fecha de última actualización es inválida (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const ultimaSolicitudStr = String(ultimaSolicitud || "").trim();
    if (ultimaSolicitudStr && !isValidDate(ultimaSolicitudStr)) {
      return NextResponse.json(
        { error: "La fecha de última solicitud es inválida (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const fechaCobro50Str = String(fechaCobro50 || "").trim();
    if (fechaCobro50Str && !isValidDate(fechaCobro50Str)) {
      return NextResponse.json(
        { error: "La fecha de cobro 50% es inválida (formato YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const prioridadVal = prioridad === undefined ? undefined : Number(prioridad);
    if (prioridadVal !== undefined) {
      if (!Number.isFinite(prioridadVal) || !Number.isInteger(prioridadVal) || prioridadVal < 0) {
        return NextResponse.json(
          { error: "La prioridad debe ser un entero >= 0" },
          { status: 400 }
        );
      }
    }

    const doc: any = {
      name: nameStr,
      clientName: clientStr,
      status: statusVal,
      type: typeVal,
      fechaInicio: fechaInicioStr,
      notes: notes ? String(notes).trim() : undefined,
    };

    if (ultimaActualizacionStr) {
      doc.ultimaActualizacion = ultimaActualizacionStr;
    }

    if (ultimaSolicitudStr) {
      doc.ultimaSolicitud = ultimaSolicitudStr;
    }

    if (fechaCobro50Str) {
      doc.fechaCobro50 = fechaCobro50Str;
    }

    if (prioridadVal !== undefined) {
      doc.prioridad = prioridadVal;
    }
    if (requiereEstadisticas !== undefined) {
      doc.requiereEstadisticas = Boolean(requiereEstadisticas);
    }
    if (cambioPendiente !== undefined) {
      doc.cambioPendiente = Boolean(cambioPendiente);
    }
    if (Array.isArray(solicitudTasks)) {
      doc.solicitudTasks = solicitudTasks
        .map((t: { id?: string; text?: string; done?: boolean }) => ({
          id: String(t.id || "").trim() || `t_${Date.now()}`,
          text: String(t.text || "").trim(),
          done: Boolean(t.done),
        }))
        .filter((t: { text: string }) => t.text.length > 0);
    }

    const id = await insertProyecto(doc);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[admin:proyectos] insert failed", e);
    const msg = e instanceof Error ? e.message : "No se pudo guardar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
