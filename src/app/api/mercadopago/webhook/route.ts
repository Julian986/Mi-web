import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function parseXSignature(xSignature: string | null): { ts?: string; v1?: string } {
  if (!xSignature) return {};
  const parts = xSignature.split(",").map((p) => p.trim());
  const out: { ts?: string; v1?: string } = {};
  for (const part of parts) {
    const [k, v] = part.split("=", 2).map((s) => s?.trim());
    if (!k || !v) continue;
    if (k === "ts") out.ts = v;
    if (k === "v1") out.v1 = v;
  }
  return out;
}

function buildManifest(params: { dataId?: string; requestId?: string; ts?: string }) {
  // Docs MP: `id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];`
  // Si falta algún valor, debe eliminarse del template.
  let manifest = "";
  if (params.dataId) manifest += `id:${params.dataId};`;
  if (params.requestId) manifest += `request-id:${params.requestId};`;
  if (params.ts) manifest += `ts:${params.ts};`;
  return manifest;
}

function safeEqualHex(a: string, b: string) {
  try {
    const ab = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

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
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    // Validar firma (si hay secret configurado)
    if (webhookSecret) {
      const xSignature = req.headers.get("x-signature");
      const xRequestId = req.headers.get("x-request-id");
      const { ts, v1 } = parseXSignature(xSignature);

      // data.id_url viene por query param "data.id" (puede ser alfanum y debe ir en lower)
      const dataIdUrl = (url.searchParams.get("data.id") || url.searchParams.get("id") || undefined)?.toLowerCase();
      const manifest = buildManifest({ dataId: dataIdUrl, requestId: xRequestId || undefined, ts });
      const expected = crypto.createHmac("sha256", webhookSecret).update(manifest).digest("hex");

      if (!v1 || !manifest || !safeEqualHex(expected, v1)) {
        console.log("[mercadopago:webhook] invalid signature", {
          hasSecret: true,
          hasXSignature: !!xSignature,
          hasXRequestId: !!xRequestId,
          dataIdUrl,
          manifest,
        });
        return NextResponse.json({ received: false }, { status: 401 });
      }
    }

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

