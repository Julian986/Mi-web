import { NextRequest, NextResponse } from "next/server";
import { getMpWebhookEvents } from "@/app/lib/mpWebhookStore";
import { listMpWebhookEvents } from "@/app/lib/mpWebhookMongo";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Protegido por Basic Auth en middleware.ts
  try {
    if (process.env.MONGODB_URI) {
      const events = await listMpWebhookEvents(200);
      return NextResponse.json({ events, source: "mongo" });
    }
  } catch (e) {
    console.error("[admin:webhooks] mongo read failed", e);
  }

  return NextResponse.json({ events: getMpWebhookEvents(), source: "memory" });
}

