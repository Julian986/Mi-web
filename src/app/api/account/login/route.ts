import { NextRequest, NextResponse } from "next/server";
import { findAuthorizedSubscriptionByEmail } from "@/app/lib/subscriptionsMongo";
import { createMagicLinkToken } from "@/app/lib/magicLinkTokens";
import { sendMagicLinkEmail } from "@/app/lib/sendEmail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Ingresá tu email." }, { status: 400 });
    }

    const sub = await findAuthorizedSubscriptionByEmail(email);
    if (!sub) {
      return NextResponse.json(
        { error: "No encontramos una suscripción activa con ese email." },
        { status: 404 }
      );
    }

    const token = await createMagicLinkToken(sub.email);
    const sent = await sendMagicLinkEmail(sub.email, token);

    if (!sent) {
      return NextResponse.json(
        { error: "No pudimos enviar el email. Probá de nuevo más tarde." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Te enviamos un enlace a tu email. Revisá tu bandeja de entrada (y spam).",
    });
  } catch (e) {
    console.error("[account/login] error", e);
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
