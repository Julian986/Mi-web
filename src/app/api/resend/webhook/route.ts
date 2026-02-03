import { NextRequest, NextResponse } from "next/server";
import { insertResendWebhookEvent } from "@/app/lib/resendWebhookMongo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      headers[k] = v;
    });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = { _raw: await req.text() };
    }

    const evt = {
      receivedAt: new Date().toISOString(),
      path: url.pathname,
      provider: "resend" as const,
      type: (body as { type?: string })?.type ?? "unknown",
      body,
      headers,
    };

    if (process.env.MONGODB_URI) {
      await insertResendWebhookEvent(evt);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("[resend:webhook] error", e);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
