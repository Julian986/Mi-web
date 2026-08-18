import { ObjectId, type WithId } from "mongodb";
import { getMongoClient } from "@/app/lib/mongoClient";
import type {
  CarteraCurrency,
  CarteraHolding,
  CarteraHoldingInput,
  CarteraKind,
  CarteraQuoteSource,
} from "@/app/admin92/contabilidad/cartera/lib/carteraTypes";

export type CarteraHoldingDoc = {
  _id?: ObjectId;
  name: string;
  ticker: string | null;
  kind: CarteraKind;
  quantity: number;
  avgCost: number;
  currency: CarteraCurrency;
  currentPrice: number | null;
  quoteSource: CarteraQuoteSource;
  quotedAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "cartera_holdings";
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
  const collection = client.db(getDbName()).collection<CarteraHoldingDoc>(COLLECTION);
  if (!indexPromise) {
    indexPromise = collection.createIndex({ ticker: 1 });
  }
  await indexPromise;
  return collection;
}

function toIso(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString();
}

function toHolding(doc: WithId<CarteraHoldingDoc>): CarteraHolding {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    ticker: doc.ticker ?? null,
    kind: doc.kind,
    quantity: doc.quantity,
    avgCost: doc.avgCost,
    currency: doc.currency,
    currentPrice: doc.currentPrice ?? null,
    quoteSource: doc.quoteSource ?? "manual",
    quotedAt: toIso(doc.quotedAt),
    notes: doc.notes ?? "",
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listCarteraHoldings(): Promise<CarteraHolding[]> {
  const collection = await getCollection();
  const docs = await collection.find({}).sort({ name: 1 }).limit(500).toArray();
  return docs.map(toHolding);
}

export async function insertCarteraHolding(
  input: CarteraHoldingInput,
): Promise<CarteraHolding> {
  const collection = await getCollection();
  const now = new Date();
  const doc: CarteraHoldingDoc = {
    name: input.name,
    ticker: input.ticker,
    kind: input.kind,
    quantity: input.quantity,
    avgCost: input.avgCost,
    currency: input.currency,
    currentPrice: input.currentPrice,
    quoteSource: "manual",
    quotedAt: input.currentPrice === null ? null : now,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(doc);
  return toHolding({ ...doc, _id: result.insertedId });
}

export async function updateCarteraHolding(
  id: string,
  input: Partial<CarteraHoldingInput>,
): Promise<CarteraHolding | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const now = new Date();
  const updates: Partial<CarteraHoldingDoc> = { updatedAt: now };

  if (input.name !== undefined) updates.name = input.name;
  if (input.ticker !== undefined) updates.ticker = input.ticker;
  if (input.kind !== undefined) updates.kind = input.kind;
  if (input.quantity !== undefined) updates.quantity = input.quantity;
  if (input.avgCost !== undefined) updates.avgCost = input.avgCost;
  if (input.currency !== undefined) updates.currency = input.currency;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.currentPrice !== undefined) {
    updates.currentPrice = input.currentPrice;
    updates.quoteSource = "manual";
    updates.quotedAt = input.currentPrice === null ? null : now;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  if (!result) return null;
  return toHolding(result);
}

export async function deleteCarteraHolding(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
