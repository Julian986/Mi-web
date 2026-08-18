import { NextRequest, NextResponse } from "next/server";
import {
  insertCarteraHolding,
  listCarteraHoldings,
} from "@/app/lib/carteraHoldingsMongo";
import {
  parseCarteraHoldingInput,
  type CarteraHoldingInput,
} from "@/app/admin92/contabilidad/cartera/lib/carteraTypes";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
    }
    const holdings = await listCarteraHoldings();
    return NextResponse.json({ holdings });
  } catch (error) {
    console.error("[admin:cartera-holdings] list failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los holdings" },
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
    const parsed = parseCarteraHoldingInput(body, "create");
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const holding = await insertCarteraHolding(parsed.value as CarteraHoldingInput);
    return NextResponse.json({ ok: true, holding });
  } catch (error) {
    console.error("[admin:cartera-holdings] create failed", error);
    return NextResponse.json(
      { error: "No se pudo crear el holding" },
      { status: 500 },
    );
  }
}
