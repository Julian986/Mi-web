import { getMongoClient } from "@/app/lib/mongoClient";

export type HerramientaSection = "objetivos" | "mantenimientos" | "buscar-clientes";

export type HerramientaNotaDoc = {
  _id?: string;
  section: HerramientaSection;
  /** Solo para objetivos: mes YYYY-MM */
  monthKey?: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
};

const COLLECTION = "contabilidad_herramientas";

const SECTIONS: HerramientaSection[] = ["objetivos", "mantenimientos", "buscar-clientes"];

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

export function isHerramientaSection(s: string): s is HerramientaSection {
  return SECTIONS.includes(s as HerramientaSection);
}

export async function listHerramientaNotas(
  section: HerramientaSection,
  monthKey?: string,
): Promise<HerramientaNotaDoc[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<HerramientaNotaDoc>(COLLECTION);

  const filter: Record<string, unknown> = { section };
  if (section === "objetivos") {
    if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return [];
    }
    filter.monthKey = monthKey;
  }

  const docs = await col.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
  return docs.map((d) => ({
    ...d,
    _id: d._id?.toString(),
  }));
}

export async function insertHerramientaNota(
  doc: Omit<HerramientaNotaDoc, "_id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection<HerramientaNotaDoc>(COLLECTION);
  const now = new Date();
  const result = await col.insertOne({
    ...doc,
    createdAt: now,
  });
  return result.insertedId.toString();
}

export async function updateHerramientaNota(id: string, text: string): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { text, updatedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export async function deleteHerramientaNota(id: string): Promise<boolean> {
  const { ObjectId } = await import("mongodb");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(COLLECTION);
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
