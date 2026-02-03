import { NextRequest, NextResponse } from "next/server";
import { getMpWebhookEvents } from "@/app/lib/mpWebhookStore";
import { listMpWebhookEvents } from "@/app/lib/mpWebhookMongo";
import { listResendWebhookEvents } from "@/app/lib/resendWebhookMongo";

export const runtime = "nodejs";

type WebhookEvent = {
  receivedAt: string;
  path: string;
  provider: "mp" | "resend";
  type?: string;
  body?: unknown;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  signatureVerified?: boolean;
  summary?: { amount?: number; currency?: string; payerEmail?: string; status?: string };
};

export async function GET(req: NextRequest) {
  // Protegido por Basic Auth en middleware.ts
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") || "all"; // all | mp | resend

  const mpEvents: WebhookEvent[] = [];
  const resendEvents: WebhookEvent[] = [];
  let source: "mongo" | "memory" = "memory";

  try {
    if (process.env.MONGODB_URI) {
      if (provider === "all" || provider === "mp") {
        const mp = await listMpWebhookEvents(200);
        mpEvents.push(
          ...mp.map((e) => ({
            ...e,
            provider: "mp" as const,
            type: (e.body as { type?: string; topic?: string })?.type ?? (e.body as { topic?: string })?.topic ?? "",
          }))
        );
      }
      if (provider === "all" || provider === "resend") {
        const resend = await listResendWebhookEvents(200);
        resendEvents.push(...resend.map((e) => ({ ...e, provider: "resend" as const })));
      }
      source = "mongo";
    } else if (provider === "all" || provider === "mp") {
      const mem = getMpWebhookEvents();
      mpEvents.push(
        ...mem.map((e) => ({
          ...e,
          provider: "mp" as const,
          type: (e.body as { type?: string; topic?: string })?.type ?? (e.body as { topic?: string })?.topic ?? "",
        }))
      );
    }
  } catch (e) {
    console.error("[admin:webhooks] read failed", e);
  }

  const events = [...mpEvents, ...resendEvents].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  return NextResponse.json({ events, source });
}

