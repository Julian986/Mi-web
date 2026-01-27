"use client";

import { useEffect, useState } from "react";

type MpWebhookEvent = {
  receivedAt: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  signatureVerified: boolean;
};

export default function Admin92Page() {
  const [events, setEvents] = useState<MpWebhookEvent[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "GET",
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }
      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el panel.");
        return;
      }
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (e: any) {
      setError(e?.message || "Error de red.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Webhooks</h1>
            <p className="text-sm text-slate-600">Eventos recibidos de Mercado Pago (debug).</p>
          </div>
          <button
            type="button"
            onClick={fetchEvents}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              loading
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
            }`}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm font-semibold">Atención</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              No hay eventos aún. Probá el simulador o realizá una suscripción real.
            </div>
          ) : (
            events.map((evt, idx) => (
              <details
                key={`${evt.receivedAt}-${idx}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {evt.path}{" "}
                        <span className="text-slate-500 font-normal">
                          • {new Date(evt.receivedAt).toLocaleString("es-AR")}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        Firma:{" "}
                        <span className={evt.signatureVerified ? "text-green-600" : "text-amber-700"}>
                          {evt.signatureVerified ? "verificada" : "no verificada"}
                        </span>
                        {" • "}
                        data.id:{" "}
                        <span className="font-mono">
                          {evt.query["data.id"] || evt.query["id"] || "—"}
                        </span>
                        {" • "}
                        type:{" "}
                        <span className="font-mono">
                          {(evt.body as any)?.type || (evt.body as any)?.topic || "—"}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 group-open:hidden">Ver</span>
                    <span className="text-xs text-slate-500 hidden group-open:inline">Cerrar</span>
                  </div>
                </summary>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Query</p>
                    <pre className="text-xs overflow-auto text-slate-800">
                      {JSON.stringify(evt.query, null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Headers</p>
                    <pre className="text-xs overflow-auto text-slate-800">
                      {JSON.stringify(evt.headers, null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Body</p>
                    <pre className="text-xs overflow-auto text-slate-800">
                      {JSON.stringify(evt.body, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

