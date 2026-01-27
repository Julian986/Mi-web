import { NextResponse } from "next/server";
import { getMongoClient } from "@/app/lib/mongoClient";

export const runtime = "nodejs";

function getDbNameFromUri(uri: string) {
  try {
    const u = new URL(uri);
    const p = u.pathname?.replace(/^\//, "");
    return p || undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  // Protegido por Basic Auth en middleware.ts
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      return NextResponse.json({ ok: false, error: "Missing MONGODB_URI" }, { status: 500 });
    }

    const dbName =
      process.env.MONGODB_DB ||
      getDbNameFromUri(uri) ||
      "glomun-panel";
    const collection = process.env.MP_WEBHOOKS_COLLECTION || "my-panel";

    const client = await getMongoClient();
    const db = client.db(dbName);
    await db.command({ ping: 1 });

    const col = db.collection(collection);
    const count = await col.estimatedDocumentCount();
    const latest = await col
      .find({}, { projection: { _id: 0 } })
      .sort({ receivedAtTs: -1, receivedAt: -1 })
      .limit(1)
      .toArray();

    return NextResponse.json({
      ok: true,
      dbName,
      collection,
      count,
      latest: latest[0] || null,
    });
  } catch (e: any) {
    console.error("[admin:mongo] ping failed", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Mongo error" },
      { status: 500 },
    );
  }
}

