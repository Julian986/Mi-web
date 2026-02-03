import crypto from "crypto";
import { getMongoClient } from "@/app/lib/mongoClient";

const TOKEN_EXPIRY_MINUTES = 15;

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

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection("magic_link_tokens");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  await col.insertOne({ token, email, expiresAt, createdAt: new Date() });
  return token;
}

export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  const client = await getMongoClient();
  const db = client.db(getDbName());
  const col = db.collection("magic_link_tokens");
  const doc = await col.findOneAndDelete({
    token,
    expiresAt: { $gt: new Date() },
  });
  return doc?.email ?? null;
}
