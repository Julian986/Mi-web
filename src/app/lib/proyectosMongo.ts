import { getMongoClient } from "@/app/lib/mongoClient";

export type ProyectoStatus =
  | "en_desarrollo"
  | "en_revision"
  | "en_produccion"
  | "archivado";

export type ProyectoDoc = {
  _id?: string;
  /** Alias conveniente del _id como string */
  id?: string;
  name: string;
  clientName: string;
  status: ProyectoStatus;
  type: string;
  fechaInicio: string; // YYYY-MM-DD
  ultimaActualizacion: string; // YYYY-MM-DD
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

const COLLECTION = "proyectos";

export async function insertProyecto(
  doc: Omit<ProyectoDoc, "createdAt" | "_id">
): Promise<string> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<ProyectoDoc>(COLLECTION);
  const now = new Date();
  const result = await col.insertOne({
    ...doc,
    createdAt: now,
  });
  return result.insertedId!.toString();
}

export async function listProyectos(limit = 500): Promise<ProyectoDoc[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<ProyectoDoc>(COLLECTION);
  const docs = await col
    .find({})
    .sort({ ultimaActualizacion: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => {
    const id = d._id?.toString() ?? "";
    return { ...d, _id: id, id, createdAt: d.createdAt };
  });
}

export async function findProyectoByClient(
  clientName: string,
  excludeArchived = true,
  excludeId?: string
): Promise<ProyectoDoc | null> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<ProyectoDoc>(COLLECTION);
  const query: Record<string, unknown> = { clientName };
  if (excludeArchived) {
    query.status = { $ne: "archivado" };
  }
  if (excludeId) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const doc = await col.findOne(query);
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id?.toString() ?? "",
    id: doc._id?.toString() ?? "",
    createdAt: doc.createdAt,
  };
}

export async function updateProyecto(
  id: string,
  doc: Partial<Omit<ProyectoDoc, "_id" | "createdAt">>
): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const setDoc = { ...doc };
  const updateOp = { $set: setDoc };
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    updateOp
  );
  return result.modifiedCount > 0;
}

export async function deleteProyecto(id: string): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
