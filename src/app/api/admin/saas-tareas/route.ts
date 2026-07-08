import { NextRequest, NextResponse } from "next/server";
import { insertSaasTarea, listSaasTareas } from "@/app/lib/saasTareasMongo";

export const runtime = "nodejs";

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** GET: listar tareas SaaS */
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const tareas = await listSaasTareas();
    return NextResponse.json({ tareas });
  } catch (e) {
    console.error("[admin:saas-tareas] list failed", e);
    return NextResponse.json({ error: "No se pudieron cargar las tareas" }, { status: 500 });
  }
}

/** POST: crear tarea SaaS */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const body = await req.json();
    const trimmed = String(body.text || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "El texto es requerido" }, { status: 400 });
    }
    const createdAt =
      typeof body.createdAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.createdAt)
        ? body.createdAt
        : todayYmd();
    const doc: {
      text: string;
      done: boolean;
      createdAt: string;
      prioridad?: number;
    } = {
      text: trimmed,
      done: false,
      createdAt,
    };
    if (body.prioridad !== undefined && body.prioridad !== null && body.prioridad !== "") {
      const n = parseInt(String(body.prioridad), 10);
      if (!Number.isNaN(n) && n >= 0) {
        doc.prioridad = n;
      }
    }
    const id = await insertSaasTarea(doc);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[admin:saas-tareas] insert failed", e);
    return NextResponse.json({ error: "No se pudo guardar la tarea" }, { status: 500 });
  }
}
