import { NextRequest, NextResponse } from "next/server";
import { updateSubscriptionPerformanceMetrics } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

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
    const metrics: {
      siteUrl?: string;
      performance?: number;
      accessibility?: number;
      bestPractices?: number;
      seo?: number;
      fcp?: number;
      lcp?: number;
      tbt?: number;
      cls?: number;
      si?: number;
    } = {};

    if (typeof body.siteUrl === "string") metrics.siteUrl = body.siteUrl.trim() || undefined;
    if (typeof body.performance === "number" && !isNaN(body.performance)) metrics.performance = Math.min(100, Math.max(0, body.performance));
    if (typeof body.accessibility === "number" && !isNaN(body.accessibility)) metrics.accessibility = Math.min(100, Math.max(0, body.accessibility));
    if (typeof body.bestPractices === "number" && !isNaN(body.bestPractices)) metrics.bestPractices = Math.min(100, Math.max(0, body.bestPractices));
    if (typeof body.seo === "number" && !isNaN(body.seo)) metrics.seo = Math.min(100, Math.max(0, body.seo));
    if (typeof body.fcp === "number" && !isNaN(body.fcp)) metrics.fcp = body.fcp;
    if (typeof body.lcp === "number" && !isNaN(body.lcp)) metrics.lcp = body.lcp;
    if (typeof body.tbt === "number" && !isNaN(body.tbt)) metrics.tbt = body.tbt;
    if (typeof body.cls === "number" && !isNaN(body.cls)) metrics.cls = body.cls;
    if (typeof body.si === "number" && !isNaN(body.si)) metrics.si = body.si;

    await updateSubscriptionPerformanceMetrics(preapprovalId, metrics);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/subscriptions/metrics] update failed", e);
    return NextResponse.json({ error: "Error al actualizar métricas" }, { status: 500 });
  }
}
