import { ObjectId, type WithId } from "mongodb";
import { getMongoClient } from "@/app/lib/mongoClient";
import {
  sortErpObservations,
  type ErpObservation,
  type ErpObservationInput,
} from "@/app/admin92/erp/lib/erpObservations";

export type ErpObservationDoc = {
  _id?: ObjectId;
  text: string;
  notedOn: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "erp_observations";
let indexPromise: Promise<string> | null = null;

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

async function getCollection() {
  const client = await getMongoClient();
  const collection = client.db(getDbName()).collection<ErpObservationDoc>(COLLECTION);
  if (!indexPromise) {
    indexPromise = collection.createIndex({ notedOn: -1, createdAt: -1 });
  }
  await indexPromise;
  return collection;
}

function toObservation(doc: WithId<ErpObservationDoc>): ErpObservation {
  return {
    _id: doc._id.toString(),
    text: doc.text,
    notedOn: doc.notedOn ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listErpObservations(): Promise<ErpObservation[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({})
    .sort({ notedOn: -1, createdAt: -1 })
    .limit(500)
    .toArray();
  return sortErpObservations(docs.map(toObservation));
}

export async function insertErpObservation(
  input: ErpObservationInput,
): Promise<ErpObservation> {
  const collection = await getCollection();
  const now = new Date();
  const doc: ErpObservationDoc = {
    text: input.text,
    notedOn: input.notedOn,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc);
  return toObservation({ ...doc, _id: result.insertedId });
}

export async function updateErpObservation(
  id: string,
  input: Partial<ErpObservationInput>,
): Promise<ErpObservation | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const updates: Partial<ErpObservationDoc> = { updatedAt: new Date() };
  if (input.text !== undefined) updates.text = input.text;
  if (input.notedOn !== undefined) updates.notedOn = input.notedOn;

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  if (!result) return null;
  return toObservation(result);
}

export async function deleteErpObservation(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
