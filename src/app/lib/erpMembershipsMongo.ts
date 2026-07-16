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
  return {
    paid: Boolean(raw?.paid),
    amount: typeof raw?.amount === "number" ? raw.amount : null,
  };
}

function toMembership(doc: ErpMembershipDoc | null, month: string): ErpMembershipMonth {
  if (!doc) return emptyMembershipMonth(month);
  return {
    month: doc.month,
    gimnasio: normalizeService(doc.gimnasio),
    natacion: normalizeService(doc.natacion),
  };
}

export async function getErpMembershipMonth(month: string): Promise<ErpMembershipMonth> {
  const collection = await getCollection();
  const doc = await collection.findOne({ month });
  return toMembership(doc, month);
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
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  return membership;
}
