import { NextRequest, NextResponse } from "next/server";
import {
  insertErpObservation,
  listErpObservations,
} from "@/app/lib/erpObservationsMongo";
import {
  parseErpObservationInput,
} from "@/app/admin92/erp/lib/erpObservations";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const observations = await listErpObservations();
    return NextResponse.json({ observations });
  } catch (error) {
    console.error("[admin:erp-observations] list failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las observaciones" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const body: unknown = await req.json();
    const parsed = parseErpObservationInput(body, "create");
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const observation = await insertErpObservation({
      text: parsed.value.text ?? "",
      notedOn: parsed.value.notedOn ?? null,
    });
    return NextResponse.json({ ok: true, observation });
  } catch (error) {
    console.error("[admin:erp-observations] create failed", error);
    return NextResponse.json(
      { error: "No se pudo crear la observación" },
      { status: 500 },
    );
  }
}
