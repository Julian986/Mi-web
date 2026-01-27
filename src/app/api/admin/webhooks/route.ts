import { NextRequest, NextResponse } from "next/server";
import { getMpWebhookEvents } from "@/app/lib/mpWebhookStore";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Protegido por Basic Auth en middleware.ts
  return NextResponse.json({ events: getMpWebhookEvents() });
}

