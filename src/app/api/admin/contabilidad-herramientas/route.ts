import { NextRequest, NextResponse } from "next/server";
import {
  insertHerramientaNota,
  isHerramientaSection,
  listHerramientaNotas,
  type HerramientaSection,
} from "@/app/lib/contabilidadHerramientasMongo";

export const runtime = "nodejs";

/** GET: listar notas de una sección (?section=objetivos&month=2026-05) */
export async function GET(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const section = req.nextUrl.searchParams.get("section") || "";
    if (!isHerramientaSection(section)) {
      return NextResponse.json(
        { error: "Sección inválida (objetivos, mantenimientos, buscar-clientes)" },
        { status: 400 },
      );
    }
    const monthKey = req.nextUrl.searchParams.get("month") || undefined;
    if (section === "objetivos" && (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey))) {
      return NextResponse.json({ error: "Mes requerido para objetivos (YYYY-MM)" }, { status: 400 });
    }
    const notas = await listHerramientaNotas(section as HerramientaSection, monthKey);
    return NextResponse.json({ notas });
  } catch (e) {
    console.error("[admin:contabilidad-herramientas] list failed", e);
    return NextResponse.json({ error: "No se pudieron cargar las notas" }, { status: 500 });
  }
}

/** POST: crear nota */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const body = await req.json();
    const { section, text, monthKey } = body;

    if (!isHerramientaSection(String(section))) {
      return NextResponse.json(
        { error: "Sección inválida (objetivos, mantenimientos, buscar-clientes)" },
        { status: 400 },
      );
    }
    const trimmed = String(text || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "El texto es requerido" }, { status: 400 });
    }

    const sec = section as HerramientaSection;
    let month: string | undefined;
    if (sec === "objetivos") {
      const mk = String(monthKey || "").trim();
      if (!/^\d{4}-\d{2}$/.test(mk)) {
        return NextResponse.json({ error: "Mes requerido para objetivos (YYYY-MM)" }, { status: 400 });
      }
      month = mk;
    }

    const id = await insertHerramientaNota({
      section: sec,
      monthKey: month,
      text: trimmed,
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[admin:contabilidad-herramientas] insert failed", e);
    return NextResponse.json({ error: "No se pudo guardar la nota" }, { status: 500 });
  }
}
