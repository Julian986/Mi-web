import { NextRequest, NextResponse } from "next/server";
import {
  deleteCarteraHolding,
  updateCarteraHolding,
} from "@/app/lib/carteraHoldingsMongo";
import { parseCarteraHoldingInput } from "@/app/admin92/contabilidad/cartera/lib/carteraTypes";

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
    const parsed = parseCarteraHoldingInput(body, "patch");
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const holding = await updateCarteraHolding(id, parsed.value);
    if (!holding) {
      return NextResponse.json({ error: "Holding no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, holding });
  } catch (error) {
    console.error("[admin:cartera-holdings] update failed", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el holding" },
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

    const ok = await deleteCarteraHolding(id);
    if (!ok) {
      return NextResponse.json({ error: "Holding no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin:cartera-holdings] delete failed", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el holding" },
      { status: 500 },
    );
  }
}
