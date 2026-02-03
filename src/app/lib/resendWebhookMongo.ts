import { getMongoClient } from "@/app/lib/mongoClient";

export type ResendWebhookEvent = {
  receivedAt: string;
  path: string;
  provider: "resend";
  type: string;
  body: unknown;
  headers: Record<string, string>;
};

function getDbName() {
  const uri = process.env.MONGODB_URI || "";
  try {
    const u = new URL(uri);
    const p = u.pathname?.replace(/^\//, "");
    return p || process.env.MONGODB_DB || "glomun-panel";
  } catch {
    return process.env.MONGODB_DB || "glomun-panel";
  }
}

const COLLECTION = "resend-webhooks";

export async function insertResendWebhookEvent(evt: ResendWebhookEvent) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  await col.insertOne({
    ...evt,
    receivedAtTs: new Date(evt.receivedAt),
  });
}

export async function listResendWebhookEvents(limit = 200): Promise<ResendWebhookEvent[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const docs = await col
    .find({}, { projection: { _id: 0, receivedAtTs: 0 } })
    .sort({ receivedAtTs: -1 })
    .limit(limit)
    .toArray();
  return docs as unknown as ResendWebhookEvent[];
}
