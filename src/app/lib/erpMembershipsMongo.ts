import { getMongoClient } from "@/app/lib/mongoClient";
import {
  emptyMembershipMonth,
  type ErpMembershipMonth,
  type ErpServicePayment,
} from "@/app/admin92/erp/lib/erpTypes";

type ErpMembershipDoc = ErpMembershipMonth & {
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "erp_memberships";
let indexPromise: Promise<string> | null = null;

function getDbName() {
  const uri = process.env.MONGODB_URI || "";
  try {
    const url = new URL(uri);
    const pathname = url.pathname?.replace(/^\//, "");
    return pathname || process.env.MONGODB_DB || "glomun-panel";
  } catch {
    return process.env.MONGODB_DB || "glomun-panel";
  }
}

async function getCollection() {
  const client = await getMongoClient();
  const collection = client.db(getDbName()).collection<ErpMembershipDoc>(COLLECTION);
  if (!indexPromise) {
    indexPromise = collection.createIndex({ month: 1 }, { unique: true });
  }
  await indexPromise;
  return collection;
}

function normalizeService(raw: ErpServicePayment | undefined): ErpServicePayment {
  const paid = Boolean(raw?.paid);
  const amount = typeof raw?.amount === "number" ? raw.amount : null;
  const paidOn =
    paid && typeof raw?.paidOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.paidOn)
      ? raw.paidOn
      : null;
  return { paid, amount, paidOn };
}

function toMembership(doc: ErpMembershipDoc | null, month: string): ErpMembershipMonth {
  if (!doc) return emptyMembershipMonth(month);
  return {
    month: doc.month,
    gimnasio: normalizeService(doc.gimnasio),
    natacion: normalizeService(doc.natacion),
    cursor: normalizeService(doc.cursor),
  };
}

export async function getErpMembershipMonth(month: string): Promise<ErpMembershipMonth> {
  const collection = await getCollection();
  const doc = await collection.findOne({ month });
  return toMembership(doc, month);
}

/** Lista cuotas en un rango inclusivo de meses YYYY-MM (rellena vacíos). */
export async function listErpMembershipMonths(
  from: string,
  to: string,
): Promise<ErpMembershipMonth[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ month: { $gte: from, $lte: to } })
    .sort({ month: 1 })
    .limit(36)
    .toArray();
  const byMonth = new Map(docs.map((doc) => [doc.month, toMembership(doc, doc.month)]));

  const months: string[] = [];
  let cursor = from;
  while (cursor <= to && months.length < 36) {
    months.push(cursor);
    const [y, m] = cursor.split("-").map(Number);
    const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    cursor = next;
  }

  return months.map((month) => byMonth.get(month) ?? emptyMembershipMonth(month));
}

export async function upsertErpMembershipMonth(
  membership: ErpMembershipMonth,
): Promise<ErpMembershipMonth> {
  const collection = await getCollection();
  const now = new Date();
  await collection.updateOne(
    { month: membership.month },
    {
      $set: {
        month: membership.month,
        gimnasio: membership.gimnasio,
        natacion: membership.natacion,
        cursor: membership.cursor,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  return membership;
}
