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
  /** ID numérico de la propiedad GA4 del sitio del cliente (ej. "432109876"). Si no está, se muestran datos mock. */
  ga4PropertyId?: string;
  /** Métricas de performance (PageSpeed/Lighthouse) ingresadas manualmente por admin */
  performanceMetrics?: {
    siteUrl?: string;
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    fcp?: number;
    lcp?: number;
    tbt?: number;
    cls?: number;
    si?: number;
  };
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

export async function findAuthorizedSubscriptionByEmail(
  email: string
): Promise<SubscriptionDoc | null> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const normalized = email.trim().toLowerCase();
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const doc = await col.findOne(
    { status: "authorized", email: { $regex: new RegExp(`^${escaped}$`, "i") } },
    { sort: { createdAt: -1 } }
  );
  return doc;
}

export async function listAllSubscriptions(): Promise<SubscriptionDoc[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs;
}

export async function updateSubscriptionGa4PropertyId(
  preapprovalId: string,
  ga4PropertyId: string | null
) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const update: Partial<SubscriptionDoc> = { updatedAt: new Date() };
  if (ga4PropertyId === null || ga4PropertyId.trim() === "") {
    await col.updateOne({ preapprovalId }, { $unset: { ga4PropertyId: "" }, $set: update });
  } else {
    await col.updateOne(
      { preapprovalId },
      { $set: { ga4PropertyId: ga4PropertyId.trim(), ...update } }
    );
  }
}

export async function updateSubscriptionPerformanceMetrics(
  preapprovalId: string,
  metrics: {
    siteUrl?: string;
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    fcp?: number;
    lcp?: number;
    tbt?: number;
    cls?: number;
    si?: number;
  }
) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SubscriptionDoc>(COLLECTION);
  const existing = await col.findOne({ preapprovalId });
  const current = (existing?.performanceMetrics || {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...current };
  if (metrics.siteUrl !== undefined) merged.siteUrl = metrics.siteUrl?.trim() || null;
  if (metrics.performance !== undefined) merged.performance = metrics.performance;
  if (metrics.accessibility !== undefined) merged.accessibility = metrics.accessibility;
  if (metrics.bestPractices !== undefined) merged.bestPractices = metrics.bestPractices;
  if (metrics.seo !== undefined) merged.seo = metrics.seo;
  if (metrics.fcp !== undefined) merged.fcp = metrics.fcp;
  if (metrics.lcp !== undefined) merged.lcp = metrics.lcp;
  if (metrics.tbt !== undefined) merged.tbt = metrics.tbt;
  if (metrics.cls !== undefined) merged.cls = metrics.cls;
  if (metrics.si !== undefined) merged.si = metrics.si;

  await col.updateOne(
    { preapprovalId },
    { $set: { performanceMetrics: merged, updatedAt: new Date() } }
  );
}
