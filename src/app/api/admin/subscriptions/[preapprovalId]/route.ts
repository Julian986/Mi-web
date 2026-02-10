import { NextRequest, NextResponse } from "next/server";
import { findSubscriptionByPreapprovalId, updateSubscriptionGa4PropertyId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ preapprovalId: string }> }
) {
  const { preapprovalId } = await params;
  if (!preapprovalId) {
    return NextResponse.json({ error: "preapprovalId requerido" }, { status: 400 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
  }
  try {
    const sub = await findSubscriptionByPreapprovalId(preapprovalId);
    if (!sub) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
    }
    return NextResponse.json({
      subscription: {
        preapprovalId: sub.preapprovalId,
        email: sub.email,
        name: sub.name,
        plan: sub.plan,
        status: sub.status,
        ga4PropertyId: sub.ga4PropertyId ?? null,
        performanceMetrics: sub.performanceMetrics ?? null,
      },
    });
  } catch (e) {
    console.error("[admin/subscriptions] get failed", e);
    return NextResponse.json({ error: "Error al obtener" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ preapprovalId: string }> }
) {
  const { preapprovalId } = await params;
  if (!preapprovalId) {
    return NextResponse.json({ error: "preapprovalId requerido" }, { status: 400 });
  }
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB no configurado" }, { status: 503 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const ga4PropertyId = typeof body.ga4PropertyId === "string" ? body.ga4PropertyId.trim() || null : null;
    await updateSubscriptionGa4PropertyId(preapprovalId, ga4PropertyId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/subscriptions] update ga4PropertyId failed", e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
