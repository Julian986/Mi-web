import { NextRequest, NextResponse } from "next/server";
import {
  findSubscriptionByTempId,
  findSubscriptionByPreapprovalId,
} from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");
  const preapprovalId = url.searchParams.get("preapproval_id") || url.searchParams.get("preapproval-id");
  const baseUrl = url.origin;

  let cookieValue: string | null = null;

  if (preapprovalId) {
    // MP puede enviar preapproval_id al volver (p.ej. tras upgrade)
    if (process.env.MONGODB_URI) {
      try {
        const sub = await findSubscriptionByPreapprovalId(preapprovalId);
        if (sub && sub.status !== "cancelled") {
          cookieValue = preapprovalId;
        }
      } catch {
        // ignorar
      }
    }
  } else if (ref && process.env.MONGODB_URI) {
    try {
      const sub = await findSubscriptionByTempId(ref);
      if (sub) {
        cookieValue = sub.preapprovalId;
      }
    } catch (e) {
      console.error("[account/return] error", e);
    }
  }

  const res = NextResponse.redirect(`${baseUrl}/account`);
  if (cookieValue) {
    res.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }
  return res;
}
