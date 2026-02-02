import { getMongoClient } from "@/app/lib/mongoClient";

export type SubscriptionDoc = {
  tempId: string;
  preapprovalId: string;
  email: string;
  name?: string;
  phone?: string;
  plan: "web" | "ecommerce";
  status: "pending" | "authorized" | "cancelled";
  createdAt: Date;
  updatedAt?: Date;
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

const COLLECTION = "subscriptions";

export async function saveSubscription(doc: Omit<SubscriptionDoc, "createdAt">) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const now = new Date();
  await col.insertOne({
    ...doc,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateSubscriptionPreapprovalId(
  tempId: string,
  preapprovalId: string
) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  await col.updateOne(
    { tempId },
    { $set: { preapprovalId, updatedAt: new Date() } }
  );
}

export async function updateSubscriptionStatus(
  preapprovalId: string,
  status: SubscriptionDoc["status"]
) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  await col.updateOne(
    { preapprovalId },
    { $set: { status, updatedAt: new Date() } }
  );
}

export async function findSubscriptionByTempId(
  tempId: string
): Promise<SubscriptionDoc | null> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const doc = await col.findOne({ tempId });
  return doc;
}

export async function findSubscriptionByPreapprovalId(
  preapprovalId: string
): Promise<SubscriptionDoc | null> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const doc = await col.findOne({ preapprovalId });
  return doc;
}

