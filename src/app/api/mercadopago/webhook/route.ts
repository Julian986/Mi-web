import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractId(query: Record<string, string>, body: any): string | undefined {
  // MP puede enviar:
  // - ?id=...
  // - ?data.id=...
  // - body: { data: { id: "..." } }
  // - body: { id: "..." }
  if (query.id) return query.id;
  if ((query as any)["data.id"]) return (query as any)["data.id"];
  if (body?.data?.id) return body.data.id;
  if (body?.id) return body.id;
  return undefined;
}

function parseUpgradeFrom(externalReference: string | undefined): string | undefined {
  if (!externalReference) return undefined;
  const match = externalReference.match(/\|from:([^|]+)$/);
  return match?.[1];
}

export async function POST(req: NextRequest) {
  // Mercado Pago puede mandar query params (topic, id, type, data.id, etc.)
  // y/o body. En este esqueleto lo registramos para validar que llegue.
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    const rawBody = await req.text();
    let body: unknown = rawBody;
    try {
      body = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      // ignore parse
    }

    console.log("[mercadopago:webhook] received", { query, body });

    // Si tenemos token, consultamos el preapproval para saber estado real
    const id = extractId(query, body as any);
    if (!token || !id) {
      return NextResponse.json({ received: true });
    }

    const detailsRes = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const details = await detailsRes.json().catch(() => ({}));
    if (!detailsRes.ok) {
      console.log("[mercadopago:webhook] preapproval fetch failed", {
        status: detailsRes.status,
        details,
      });
      return NextResponse.json({ received: true });
    }

    const status = (details as any)?.status as string | undefined;
    const externalReference = (details as any)?.external_reference as string | undefined;
    const upgradeFrom = parseUpgradeFrom(externalReference);

    // Cuando la nueva suscripción queda autorizada, cancelamos la anterior (si aplica)
    if (status === "authorized" && upgradeFrom && upgradeFrom !== id) {
      console.log("[mercadopago:webhook] upgrade authorized, cancelling previous", {
        newId: id,
        upgradeFrom,
      });

      const cancelRes = await fetch(
        `https://api.mercadopago.com/preapproval/${encodeURIComponent(upgradeFrom)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        },
      );

      const cancelData = await cancelRes.json().catch(() => ({}));
      console.log("[mercadopago:webhook] cancel previous result", {
        ok: cancelRes.ok,
        status: cancelRes.status,
        cancelData,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ received: false }, { status: 200 });
  }
}

