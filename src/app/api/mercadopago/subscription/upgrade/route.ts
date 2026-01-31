import { NextRequest, NextResponse } from "next/server";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";

function getBaseUrl(req: NextRequest) {
  const fromEnv =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;
  const origin = new URL(req.url).origin;
  if (!fromEnv) return origin;
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://"))
    return fromEnv;
  return `https://${fromEnv}`;
}

const PRICE_BY_SERVICE: Record<"web" | "ecommerce", { ars: number; usd: number }> = {
  web: { ars: 25000, usd: 21 },
  ecommerce: { ars: 35000, usd: 29 },
};

export async function POST(req: NextRequest) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Falta MERCADO_PAGO_ACCESS_TOKEN." },
      { status: 500 }
    );
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "Base de datos no configurada." },
      { status: 500 }
    );
  }

  const preapprovalId = req.cookies.get(COOKIE_NAME)?.value;
  if (!preapprovalId) {
    return NextResponse.json(
      { error: "No hay sesión de suscripción. Iniciá sesión o suscribite primero." },
      { status: 401 }
    );
  }

  const sub = await findSubscriptionByPreapprovalId(preapprovalId);
  if (!sub || sub.status === "cancelled") {
    return NextResponse.json(
      { error: "Suscripción no encontrada o cancelada." },
      { status: 404 }
    );
  }

  const baseUrl = getBaseUrl(req);
  if (baseUrl.includes("localhost") || baseUrl.startsWith("http://")) {
    return NextResponse.json(
      { error: "Para actualizar suscripciones necesitás una URL pública HTTPS." },
      { status: 400 }
    );
  }

  const serviceType = sub.plan;
  const price = PRICE_BY_SERVICE[serviceType];
  const notificationUrl = `${baseUrl}/api/mercadopago/webhook`;

  const payload = {
    reason: `Suscripción mensual - ${serviceType.toUpperCase()} - Glomun (actualización)`,
    payer_email: sub.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: price.ars,
      currency_id: "ARS",
    },
    back_url: `${baseUrl}/account`,
    external_reference: `glomun-upgrade-${serviceType}-${Date.now()}|from:${preapprovalId}`,
    notification_url: notificationUrl,
    status: "pending",
  };

  const mpRes = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const mpRaw = await mpRes.text();
  let mpData: any = {};
  try {
    mpData = mpRaw ? JSON.parse(mpRaw) : {};
  } catch {
    mpData = { raw: mpRaw };
  }

  if (!mpRes.ok) {
    console.error("[mercadopago:upgrade] error", { status: mpRes.status, mpData });
    return NextResponse.json(
      { error: "Mercado Pago respondió con error." },
      { status: mpRes.status }
    );
  }

  const redirectUrl = mpData.init_point || mpData.sandbox_init_point;
  if (!redirectUrl) {
    return NextResponse.json(
      { error: "No pudimos iniciar Mercado Pago." },
      { status: 500 }
    );
  }

  return NextResponse.json({ init_point: redirectUrl });
}
