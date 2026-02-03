import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLinkToken } from "@/app/lib/magicLinkTokens";
import { findAuthorizedSubscriptionByEmail } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

function getBaseUrl(req: NextRequest): string {
  const origin = new URL(req.url).origin;
  return origin;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const baseUrl = getBaseUrl(req);

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/account?error=token_invalido`);
  }

  try {
    const email = await consumeMagicLinkToken(token);
    if (!email) {
      return NextResponse.redirect(`${baseUrl}/account?error=link_expirado`);
    }

    const sub = await findAuthorizedSubscriptionByEmail(email);
    if (!sub) {
      return NextResponse.redirect(`${baseUrl}/account?error=sin_suscripcion`);
    }

    const res = NextResponse.redirect(`${baseUrl}/account`);
    res.cookies.set(COOKIE_NAME, sub.preapprovalId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[account/login/verify] error", e);
    return NextResponse.redirect(`${baseUrl}/account?error=error`);
  }
}
