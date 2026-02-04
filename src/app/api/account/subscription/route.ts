import { NextRequest, NextResponse } from "next/server";
import { findSubscriptionByPreapprovalId } from "@/app/lib/subscriptionsMongo";

export const runtime = "nodejs";

const COOKIE_NAME = "glomun_sub";

export async function GET(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ subscription: null });
  }

  const preapprovalId = req.cookies.get(COOKIE_NAME)?.value;
  if (!preapprovalId) {
    return NextResponse.json({ subscription: null });
  }

  try {
    const sub = await findSubscriptionByPreapprovalId(preapprovalId);
    if (!sub || sub.status === "cancelled") {
      return NextResponse.json({ subscription: null });
    }
    return NextResponse.json({
      subscription: {
        preapprovalId: sub.preapprovalId,
        email: sub.email,
        name: sub.name,
        phone: sub.phone,
        plan: sub.plan,
        status: sub.status,
        createdAt: sub.createdAt ? sub.createdAt.toISOString() : null,
      },
    });
  } catch (e) {
    console.error("[account/subscription] error", e);
    return NextResponse.json({ subscription: null });
  }
}
