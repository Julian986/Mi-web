import { NextRequest, NextResponse } from "next/server";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

/** Permite al admin iniciar sesión como un suscriptor (impersonación). Protegido por Basic Auth. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const preapprovalId = url.searchParams.get("preapprovalId")?.trim();

  const getRedirectUrl = (q: string) => {
    const u = new URL(req.url);
    let origin = u.origin;
    if (origin.includes("0.0.0.0")) origin = origin.replace("0.0.0.0", "localhost");
    return `${origin}/admin92?${q}`;
  };

  if (!preapprovalId) {
    return NextResponse.redirect(getRedirectUrl("impersonate=error"));
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.redirect(getRedirectUrl("impersonate=error"));
  }

  try {
    const sub = await findSubscriptionByPreapprovalId(preapprovalId);
    if (!sub || sub.status === "cancelled") {
      return NextResponse.redirect(getRedirectUrl("impersonate=notfound"));
    }

    let baseUrl = new URL(req.url).origin;
    if (baseUrl.includes("0.0.0.0")) {
      baseUrl = baseUrl.replace("0.0.0.0", "localhost");
    }
    const res = NextResponse.redirect(`${baseUrl}/account`);
    res.cookies.set(COOKIE_NAME, preapprovalId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[admin/impersonate] error", e);
    return NextResponse.redirect(getRedirectUrl("impersonate=error"));
  }
}
