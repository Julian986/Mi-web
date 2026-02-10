import { getMongoClient } from "@/app/lib/mongoClient";
import type { MpWebhookEvent } from "@/app/lib/mpWebhookStore";
import type { Filter } from "mongodb";

function getDbNameFromUri(uri: string) {
  try {
    const u = new URL(uri);
    const p = u.pathname?.replace(/^\//, "");
    return p || undefined;
  } catch {
    return undefined;
  }
}

function getDbName() {
  return (
    process.env.MONGODB_DB ||
    getDbNameFromUri(process.env.MONGODB_URI || "") ||
    "glomun-panel"
  );
}

function getCollectionName() {
  return process.env.MP_WEBHOOKS_COLLECTION || "my-panel";
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function insertMpWebhookEvent(evt: MpWebhookEvent) {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());
  await col.insertOne({
    ...evt,
    // para querys rápidas
    receivedAtTs: new Date(evt.receivedAt),
  });
}

export async function listMpWebhookEvents(limit = 200): Promise<MpWebhookEvent[]> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());

  const docs = await col
    .find({}, { projection: { _id: 0, receivedAtTs: 0 } })
    .sort({ receivedAtTs: -1, receivedAt: -1 })
    .limit(limit)
    .toArray();

  return docs as unknown as MpWebhookEvent[];
}

/**
 * Lista eventos de MP filtrados por el email del pagador (match exacto case-insensitive).
 * Nota: se filtra por `summary.payerEmail`, que se completa cuando el webhook logra
 * enriquecer datos desde la API de Mercado Pago.
 */
export async function listMpWebhookEventsByPayerEmail(
  payerEmail: string,
  limit = 500
): Promise<MpWebhookEvent[]> {
  const email = String(payerEmail || "").trim();
  if (!email) return [];

  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());

  const regex = new RegExp(`^${escapeRegex(email)}$`, "i");

  const query: Filter<Record<string, unknown>> = {
    "summary.payerEmail": { $regex: regex },
  };

  const docs = await col
    .find(query, { projection: { _id: 0, receivedAtTs: 0 } })
    .sort({ receivedAtTs: -1, receivedAt: -1 })
    .limit(limit)
    .toArray();

  return docs as unknown as MpWebhookEvent[];
}

/**
 * Lista eventos de MP asociados a una suscripción:
 * - por email del pagador (si existe summary)
 * - o por preapprovalId (cuando el webhook trae body { data: { id } } o { id })
 */
export async function listMpWebhookEventsForSubscription(params: {
  payerEmail?: string | null;
  preapprovalId?: string | null;
  limit?: number;
}): Promise<MpWebhookEvent[]> {
  const email = String(params.payerEmail || "").trim();
  const preapprovalId = String(params.preapprovalId || "").trim();
  const limit = params.limit ?? 500;

  if (!email && !preapprovalId) return [];

  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection(getCollectionName());

  const ors: Filter<Record<string, unknown>>[] = [];

  if (email) {
    const regex = new RegExp(`^${escapeRegex(email)}$`, "i");
    ors.push({ "summary.payerEmail": { $regex: regex } });
  }

  if (preapprovalId) {
    // Para eventos de suscripción/preapproval, MP suele mandar body.data.id = preapprovalId
    // o body.id = preapprovalId.
    const maybeNum = Number(preapprovalId);
    const idCandidates: Array<string | number> = [preapprovalId];
    // A veces MP manda IDs numéricos (sin comillas) y Mongo los guarda como number.
    if (Number.isFinite(maybeNum) && String(maybeNum) === preapprovalId) {
      idCandidates.push(maybeNum);
    }

    ors.push({ "body.data.id": { $in: idCandidates } });
    ors.push({ "body.id": { $in: idCandidates } });
  }

  const query: Filter<Record<string, unknown>> =
    ors.length === 1 ? ors[0] : { $or: ors };

  const docs = await col
    .find(query, { projection: { _id: 0, receivedAtTs: 0 } })
    .sort({ receivedAtTs: -1, receivedAt: -1 })
    .limit(limit)
    .toArray();

  return docs as unknown as MpWebhookEvent[];
}

