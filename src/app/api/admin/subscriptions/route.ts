import { NextResponse } from "next/server";
import { listAllSubscriptions } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ subscriptions: [] });
  }
  try {
    const subs = await listAllSubscriptions();
    return NextResponse.json({
      subscriptions: subs.map((s) => ({
        preapprovalId: s.preapprovalId,
        email: s.email,
        name: s.name,
        plan: s.plan,
        status: s.status,
        createdAt: s.createdAt?.toISOString(),
        ga4PropertyId: s.ga4PropertyId ?? null,
      })),
    });
  } catch (e) {
    console.error("[admin/subscriptions] list failed", e);
    return NextResponse.json({ error: "Error al listar suscripciones", subscriptions: [] }, { status: 500 });
  }
}
