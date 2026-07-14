import { getMongoClient } from "@/app/lib/mongoClient";
import {
  emptyTrainingSession,
  type ErpDayLog,
} from "@/app/admin92/erp/lib/erpTypes";

type ErpDayLogDoc = ErpDayLog & {
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "erp_day_logs";
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
  const collection = client.db(getDbName()).collection<ErpDayLogDoc>(COLLECTION);
  if (!indexPromise) {
    indexPromise = collection.createIndex({ date: 1 }, { unique: true });
  }
  await indexPromise;
  return collection;
}

function toErpDayLog(doc: ErpDayLogDoc): ErpDayLog {
  return {
    date: doc.date,
    alarm: doc.alarm,
    work: doc.work,
    training: doc.training,
    english: doc.english ?? emptyTrainingSession(),
    sleepHours: doc.sleepHours,
    foodScore: doc.foodScore,
    notes: doc.notes ?? "",
  };
}

export async function listErpDayLogs(from: string, to: string): Promise<ErpDayLog[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ date: { $gte: from, $lte: to } })
    .sort({ date: 1 })
    .limit(370)
    .toArray();
  return docs.map(toErpDayLog);
}

export async function upsertErpDayLog(log: ErpDayLog): Promise<ErpDayLog> {
  const collection = await getCollection();
  const now = new Date();
  await collection.updateOne(
    { date: log.date },
    {
      $set: { ...log, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  return log;
}

export async function deleteErpDayLog(date: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ date });
  return result.deletedCount > 0;
}
