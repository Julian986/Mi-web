import { getMongoClient } from "@/app/lib/mongoClient";

export type SaasTareaDoc = {
  _id?: string;
  text: string;
  done: boolean;
  /** Fecha pedido YYYY-MM-DD */
  createdAt: string;
  fechaRealizada?: string;
  prioridad?: number;
  updatedAt?: Date;
};

const COLLECTION = "saas_tareas";

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

export async function listSaasTareas(): Promise<SaasTareaDoc[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SaasTareaDoc>(COLLECTION);
  const docs = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray();
  return docs.map((d) => ({
    ...d,
    _id: d._id?.toString(),
  }));
}

export async function insertSaasTarea(
  doc: Omit<SaasTareaDoc, "_id" | "updatedAt">,
): Promise<string> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<SaasTareaDoc>(COLLECTION);
  const result = await col.insertOne({
    ...doc,
    updatedAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function updateSaasTarea(
  id: string,
  patch: Partial<Pick<SaasTareaDoc, "text" | "done" | "createdAt" | "fechaRealizada" | "prioridad">>,
  unset?: (keyof Pick<SaasTareaDoc, "fechaRealizada" | "prioridad">)[],
): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const update: Record<string, unknown> = {
    $set: { ...patch, updatedAt: new Date() },
  };
  if (unset?.length) {
    update.$unset = Object.fromEntries(unset.map((k) => [k, ""]));
  }
  const result = await col.updateOne({ _id: new ObjectId(id) }, update);
  return result.modifiedCount > 0;
}

export async function deleteSaasTarea(id: string): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
