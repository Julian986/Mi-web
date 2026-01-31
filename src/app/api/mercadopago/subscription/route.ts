import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

type SubscriptionBody = {
  serviceType?: "web" | "ecommerce" | "custom";
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  upgradeFromPreapprovalId?: string;
};

const PRICE_BY_SERVICE: Record<Exclude<SubscriptionBody["serviceType"], undefined>, { ars: number; usd: number }> = {
  web: { ars: 25000, usd: 21 },
  ecommerce: { ars: 35000, usd: 29 },
  custom: { ars: 0, usd: 0 },
};

function generateTempId() {
  return crypto.randomBytes(8).toString("hex");
}

function getOrigin(req: NextRequest) {
  return new URL(req.url).origin;
}

function getBaseUrl(req: NextRequest) {
  const fromEnv =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;

  if (!fromEnv) return getOrigin(req);

  // VERCEL_URL suele venir sin protocolo
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) return fromEnv;
  return `https://${fromEnv}`;
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Falta MERCADO_PAGO_ACCESS_TOKEN en variables de entorno." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as SubscriptionBody;
    const serviceType = body.serviceType;
    const payerEmail = body.customerEmail?.trim();
    const upgradeFromPreapprovalId = body.upgradeFromPreapprovalId?.trim();

    if (!serviceType || !["web", "ecommerce", "custom"].includes(serviceType)) {
      return NextResponse.json({ error: "serviceType inválido." }, { status: 400 });
    }

    if (serviceType === "custom") {
      return NextResponse.json(
        { error: "Aplicación a medida es 'Consultar' y no tiene suscripción automática por ahora." },
        { status: 400 },
      );
    }

    if (!payerEmail) {
      return NextResponse.json({ error: "Falta customerEmail." }, { status: 400 });
    }

    const origin = getOrigin(req);
    const baseUrl = getBaseUrl(req);
    // Mercado Pago suele requerir URLs públicas (y en la práctica HTTPS) para suscripciones/webhooks.
    // En local, usá APP_BASE_URL con tu dominio público (ej. Vercel) o un túnel HTTPS (ngrok).
    if (baseUrl.includes("localhost") || baseUrl.startsWith("http://")) {
      return NextResponse.json(
        {
          error:
            "Para crear suscripciones con Mercado Pago necesitás una URL pública HTTPS. Configurá APP_BASE_URL (ej: https://tu-app.vercel.app) o usá un túnel HTTPS (ngrok).",
          baseUrl,
        },
        { status: 400 },
      );
    }
    const price = PRICE_BY_SERVICE[serviceType];
    const notificationUrl = `${baseUrl}/api/mercadopago/webhook`;

    const tempId = upgradeFromPreapprovalId ? undefined : generateTempId();
    const externalRef = upgradeFromPreapprovalId
      ? `glomun-upgrade-${serviceType}-${Date.now()}|from:${upgradeFromPreapprovalId}`
      : `glomun-${tempId}`;
    const backUrl = `${baseUrl}/api/account/return${tempId ? `?ref=${tempId}` : ""}`;

    const payload = {
      reason: `Suscripción mensual - ${serviceType.toUpperCase()} - Glomun`,
      payer_email: payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: price.ars,
        currency_id: "ARS",
      },
      back_url: backUrl || `${baseUrl}/account`,
      external_reference: externalRef,
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
      console.log("[mercadopago:preapproval] error", {
        status: mpRes.status,
        payload,
        mpData,
      });
      return NextResponse.json(
        {
          error: "Mercado Pago respondió con error.",
          mp_status: mpRes.status,
          details: mpData,
        },
        { status: mpRes.status },
      );
    }

    const mpId = (mpData as any)?.id as string | undefined;

    // Guardar en DB para suscripciones nuevas (no upgrade)
    if (tempId && mpId && process.env.MONGODB_URI) {
      try {
        await saveSubscription({
          tempId,
          preapprovalId: mpId,
          email: payerEmail,
          name: body.customerName?.trim(),
          phone: body.customerPhone?.trim(),
          plan: serviceType as "web" | "ecommerce",
          status: "pending",
        });
      } catch (e) {
        console.error("[mercadopago:subscription] mongo save failed", e);
      }
    }

    return NextResponse.json({
      id: mpId,
      init_point: (mpData as any)?.init_point,
      sandbox_init_point: (mpData as any)?.sandbox_init_point,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado creando la suscripción." }, { status: 500 });
  }
}

