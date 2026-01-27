import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __glomunMongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!global.__glomunMongoClientPromise) {
    const client = new MongoClient(uri, {
      // Buenas prácticas para serverless
      maxPoolSize: 10,
    });
    global.__glomunMongoClientPromise = client.connect();
  }

  return global.__glomunMongoClientPromise;
}

