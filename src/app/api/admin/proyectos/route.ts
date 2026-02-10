import { NextRequest, NextResponse } from "next/server";
import {
  insertProyecto,
  listProyectos,
  findProyectoByClient,
} from "@/app/lib/proyectosMongo";

export const runtime = "nodejs";

const STATUSES = ["en_desarrollo", "en_revision", "en_produccion", "archivado"] as const;
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
    const { name, clientName, status, type, fechaInicio, ultimaActualizacion, notes } = body;

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

    const ultimaActualizacionStr = String(ultimaActualizacion || fechaInicioStr).trim();
    if (!ultimaActualizacionStr || !isValidDate(ultimaActualizacionStr)) {
      return NextResponse.json(
        { error: "La fecha de última actualización es requerida (formato YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const doc = {
      name: nameStr,
      clientName: clientStr,
      status: statusVal,
      type: typeVal,
      fechaInicio: fechaInicioStr,
      ultimaActualizacion: ultimaActualizacionStr,
      notes: notes ? String(notes).trim() : undefined,
    };

    const id = await insertProyecto(doc);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[admin:proyectos] insert failed", e);
    const msg = e instanceof Error ? e.message : "No se pudo guardar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
