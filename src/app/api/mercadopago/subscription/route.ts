import { NextRequest, NextResponse } from "next/server";

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
        { error: "Software a medida es 'Consultar' y no tiene suscripción automática por ahora." },
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

    // Mercado Pago - Preapproval (pago recurrente)
    // Nota: esto es un esqueleto funcional. En producción, conviene:
    // - guardar `external_reference`/`id` en DB
    // - validar webhooks
    // - configurar back_url real y pantallas de éxito/error
    const payload = {
      reason: `Suscripción mensual - ${serviceType.toUpperCase()} - Glomun`,
      payer_email: payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: price.ars,
        currency_id: "ARS",
      },
      back_url: `${baseUrl}/services/${serviceType}?mp=return`,
      external_reference: upgradeFromPreapprovalId
        ? `glomun-upgrade-${serviceType}-${Date.now()}|from:${upgradeFromPreapprovalId}`
        : `glomun-${serviceType}-${Date.now()}`,
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
      // Log útil para Vercel logs
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
        // Devolvemos el mismo status de MP para debug (p.ej. 400)
        { status: mpRes.status },
      );
    }

    // MP suele devolver init_point y sandbox_init_point
    return NextResponse.json({
      id: (mpData as any)?.id,
      init_point: (mpData as any)?.init_point,
      sandbox_init_point: (mpData as any)?.sandbox_init_point,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado creando la suscripción." }, { status: 500 });
  }
}

