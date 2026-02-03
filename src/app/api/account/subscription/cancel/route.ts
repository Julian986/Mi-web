import { NextRequest, NextResponse } from "next/server";
import { findSubscriptionByPreapprovalId, updateSubscriptionStatus } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Configuración incompleta." }, { status: 500 });
    }

    const preapprovalId = req.cookies.get(COOKIE_NAME)?.value;
    if (!preapprovalId) {
      return NextResponse.json({ error: "No estás iniciado sesión." }, { status: 401 });
    }

    const sub = await findSubscriptionByPreapprovalId(preapprovalId);
    if (!sub || sub.status === "cancelled") {
      return NextResponse.json({ error: "Suscripción no encontrada o ya cancelada." }, { status: 404 });
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${encodeURIComponent(preapprovalId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      }
    );

    if (!mpRes.ok) {
      const errData = await mpRes.json().catch(() => ({}));
      console.error("[account/subscription/cancel] MP error", mpRes.status, errData);
      return NextResponse.json(
        { error: "No pudimos cancelar en Mercado Pago. Intentá de nuevo o contactanos." },
        { status: 502 }
      );
    }

    await updateSubscriptionStatus(preapprovalId, "cancelled");

    const res = NextResponse.json({ ok: true, message: "Suscripción cancelada." });
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[account/subscription/cancel] error", e);
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
