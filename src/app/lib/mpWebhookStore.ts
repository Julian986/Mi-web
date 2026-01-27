export type MpWebhookEvent = {
  receivedAt: string; // ISO
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  signatureVerified: boolean;
};

type Store = {
  events: MpWebhookEvent[];
};

const GLOBAL_KEY = "__glomun_mp_webhooks_store__";

function getStore(): Store {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { events: [] } satisfies Store;
  }
  return g[GLOBAL_KEY] as Store;
}

export function addMpWebhookEvent(evt: MpWebhookEvent, maxEvents = 200) {
  const store = getStore();
  store.events.unshift(evt);
  if (store.events.length > maxEvents) {
    store.events.length = maxEvents;
  }
}

export function getMpWebhookEvents() {
  return getStore().events;
}

