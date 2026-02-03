import { getMongoClient } from "@/app/lib/mongoClient";

export type CobroDoc = {
  _id?: string;
  clientName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  paidAt?: string; // YYYY-MM-DD
  servicio?: string;
  notes?: string;
  createdAt: Date;
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

const COLLECTION = "cobros";

export async function insertCobro(
  doc: Omit<CobroDoc, "createdAt" | "_id">
): Promise<string> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<CobroDoc>(COLLECTION);
  const now = new Date();
  const result = await col.insertOne({
    ...doc,
    createdAt: now,
  });
  return result.insertedId!.toString();
}

export async function insertCobrosBulk(
  docs: Omit<CobroDoc, "createdAt" | "_id">[]
): Promise<string[]> {
  if (docs.length === 0) return [];
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<CobroDoc>(COLLECTION);
  const now = new Date();
  const toInsert = docs.map((d) => ({ ...d, createdAt: now }));
  const result = await col.insertMany(toInsert);
  return Object.values(result.insertedIds).map((id) => id.toString());
}

export async function listCobros(limit = 1000): Promise<CobroDoc[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<CobroDoc>(COLLECTION);
  const docs = await col
    .find({})
    .sort({ dueDate: 1, createdAt: 1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => {
    const id = d._id?.toString() ?? "";
    return { ...d, _id: id, id, createdAt: d.createdAt };
  });
}

export async function updateCobro(
  id: string,
  doc: Partial<Omit<CobroDoc, "_id" | "createdAt">>,
  unsetFields?: string[]
): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const setDoc = { ...doc };
  if (unsetFields) {
    unsetFields.forEach((f) => delete setDoc[f as keyof typeof setDoc]);
  }
  const updateOp: Record<string, unknown> = {};
  if (Object.keys(setDoc).length > 0) updateOp.$set = setDoc;
  if (unsetFields && unsetFields.length > 0) {
    updateOp.$unset = Object.fromEntries(unsetFields.map((f) => [f, ""]));
  }
  if (Object.keys(updateOp).length === 0) return false;
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    updateOp
  );
  return result.modifiedCount > 0;
}

export async function updateCobrosByClient(
  clientName: string,
  dueDateAfter: string,
  updates: Partial<Pick<CobroDoc, "amount">>
): Promise<number> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.updateMany(
    {
      clientName,
      dueDate: { $gt: dueDateAfter },
      paid: false,
    },
    { $set: updates }
  );
  return result.modifiedCount;
}

export async function deleteCobro(id: string): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function deleteCobrosByClient(clientName: string): Promise<number> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.deleteMany({ clientName });
  return result.deletedCount;
}
