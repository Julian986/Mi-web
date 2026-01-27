import { getMongoClient } from "@/app/lib/mongoClient";
import type { MpWebhookEvent } from "@/app/lib/mpWebhookStore";

function getDbNameFromUri(uri: string) {
  try {
    const u = new URL(uri);
    const p = u.pathname?.replace(/^\//, "");
    return p || undefined;
  } catch {
    return undefined;
  }
}

function getDbName() {
  return (
    process.env.MONGODB_DB ||
    getDbNameFromUri(process.env.MONGODB_URI || "") ||
    "glomun-panel"
  );
}

function getCollectionName() {
  return process.env.MP_WEBHOOKS_COLLECTION || "my-panel";
}

export async function insertMpWebhookEvent(evt: MpWebhookEvent) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());
  await col.insertOne({
    ...evt,
    // para querys rápidas
    receivedAtTs: new Date(evt.receivedAt),
  });
}

export async function listMpWebhookEvents(limit = 200): Promise<MpWebhookEvent[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());

  const docs = await col
    .find({}, { projection: { _id: 0, receivedAtTs: 0 } })
    .sort({ receivedAtTs: -1, receivedAt: -1 })
    .limit(limit)
    .toArray();

  return docs as unknown as MpWebhookEvent[];
}

