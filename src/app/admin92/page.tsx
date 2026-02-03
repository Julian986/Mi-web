"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getMonthKey(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

type MpWebhookEvent = {
  receivedAt: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  signatureVerified: boolean;
  summary?: { amount?: number; currency?: string; payerEmail?: string; status?: string };
};

type AccountingType = "ingreso" | "gasto" | "inversion";

type AccountingRecord = {
  _id?: string;
  type: AccountingType;
  amount: number;
  description: string;
  category?: string;
  date: string;
  createdAt: string;
};

const typeLabels: Record<AccountingType, string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
  inversion: "Inversión",
};

const typeColors: Record<AccountingType, string> = {
  ingreso: "bg-green-100 text-green-800",
  gasto: "bg-red-100 text-red-800",
  inversion: "bg-blue-100 text-blue-800",
};

export default function Admin92Page() {
  const [activeTab, setActiveTab] = useState<"webhooks" | "contabilidad">("webhooks");

  // Webhooks state
  const [events, setEvents] = useState<MpWebhookEvent[]>([]);
  const [webhookTypeFilter, setWebhookTypeFilter] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"mongo" | "memory" | "unknown">("unknown");

  // Contabilidad state
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [accLoading, setAccLoading] = useState(false);
  const [accError, setAccError] = useState<string>("");
  const [formType, setFormType] = useState<AccountingType>("ingreso");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountingRecord | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(""); // "" = Todos, "YYYY-MM" = mes específico

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/webhooks", { method: "GET" });
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
      setSource(data?.source === "mongo" || data?.source === "memory" ? data.source : "unknown");
    } catch (e: any) {
      setError(e?.message || "Error de red.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setAccLoading(true);
    setAccError("");
    try {
      const res = await fetch("/api/admin/accounting", { method: "GET" });
      const data = await res.json();
      if (!res.ok) {
        setAccError(data?.error || "No se pudieron cargar los registros.");
        return;
      }
      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch (e: any) {
      setAccError(e?.message || "Error de red.");
    } finally {
      setAccLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeTab === "contabilidad") {
      fetchRecords();
    }
  }, [activeTab]);

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setAccError("El monto debe ser un número positivo.");
      return;
    }
    if (!formDescription.trim()) {
      setAccError("La descripción es requerida.");
      return;
    }
    setSubmitting(true);
    setAccError("");
    try {
      if (editingRecord?._id) {
        const res = await fetch(`/api/admin/accounting/${editingRecord._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formType,
            amount,
            description: formDescription.trim(),
            category: formCategory.trim() || undefined,
            date: formDate || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAccError(data?.error || "No se pudo actualizar.");
          return;
        }
        setEditingRecord(null);
      } else {
        const res = await fetch("/api/admin/accounting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formType,
            amount,
            description: formDescription.trim(),
            category: formCategory.trim() || undefined,
            date: formDate || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAccError(data?.error || "No se pudo guardar.");
          return;
        }
      }
      setFormAmount("");
      setFormDescription("");
      setFormCategory("");
      setFormDate(new Date().toISOString().slice(0, 10));
      fetchRecords();
    } catch (e: any) {
      setAccError(e?.message || "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (r: AccountingRecord) => {
    setEditingRecord(r);
    setFormType(r.type);
    setFormAmount(String(r.amount));
    setFormDescription(r.description);
    setFormCategory(r.category || "");
    setFormDate(
      typeof r.date === "string" && r.date.length >= 10
        ? r.date.slice(0, 10)
        : new Date(r.date).toISOString().slice(0, 10)
    );
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setFormType("ingreso");
    setFormAmount("");
    setFormDescription("");
    setFormCategory("");
    setFormDate(new Date().toISOString().slice(0, 10));
  };

  const handleDelete = async (r: AccountingRecord) => {
    if (!r._id) return;
    if (!window.confirm(`¿Eliminar este registro?\n${r.description} - ${r.amount} ARS`)) return;
    try {
      const res = await fetch(`/api/admin/accounting/${r._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setAccError(data?.error || "No se pudo eliminar.");
        return;
      }
      fetchRecords();
    } catch (e: any) {
      setAccError(e?.message || "Error al eliminar.");
    }
  };

  const filteredRecords = useMemo(() => {
    if (!filterMonth) return records;
    return records.filter((r) => getMonthKey(r.date) === filterMonth);
  }, [records, filterMonth]);

  const monthOptions = useMemo(() => {
    const START_MONTH = "2026-02"; // Empresa inicia en febrero 2026
    const now = new Date();
    const options: string[] = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = getMonthKey(d);
      if (ym < START_MONTH) break;
      options.push(ym);
    }
    return ["", ...options];
  }, []);

  const totalIngresos = filteredRecords
    .filter((r) => r.type === "ingreso")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalGastos = filteredRecords
    .filter((r) => r.type === "gasto")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalInversion = filteredRecords
    .filter((r) => r.type === "inversion")
    .reduce((sum, r) => sum + r.amount, 0);
  const resultado = totalIngresos - totalGastos - totalInversion;

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString("es-AR")} ARS`;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin</h1>
          <div className="flex rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("webhooks")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "webhooks"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Webhooks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contabilidad")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "contabilidad"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Contabilidad
            </button>
          </div>
        </div>

        {activeTab === "webhooks" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-600">
                  Eventos de Mercado Pago. Fuente:{" "}
                  <span className="font-semibold text-slate-900">{source}</span>
                </p>
                <select
                  value={webhookTypeFilter}
                  onChange={(e) => setWebhookTypeFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent cursor-pointer"
                >
                  <option value="">Todos los tipos</option>
                  <option value="payment">Solo pagos (payment)</option>
                  <option value="subscription_preapproval">Solo preapproval</option>
                  <option value="subscription_authorized_payment">Solo pago autorizado suscripción</option>
                </select>
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
              ) : (() => {
                const filtered = events.filter((evt) => {
                  if (!webhookTypeFilter) return true;
                  const t = (evt.body as any)?.type || (evt.body as any)?.topic || evt.query?.type || "";
                  return t === webhookTypeFilter;
                });
                return filtered.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
                    No hay eventos con el filtro seleccionado. Probá otro tipo o "Todos los tipos".
                  </div>
                ) : (
                filtered.map((evt, idx) => (
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
                            type:{" "}
                            <span className="font-mono">
                              {(evt.body as any)?.type || (evt.body as any)?.topic || "—"}
                            </span>
                            {evt.summary?.amount != null && (
                              <>
                                {" • "}
                                <span className="font-semibold text-slate-900">
                                  ${evt.summary.amount.toLocaleString("es-AR")} {evt.summary.currency || "ARS"}
                                </span>
                              </>
                            )}
                            {evt.summary?.payerEmail && (
                              <>
                                {" • "}
                                <span className="text-slate-500 truncate max-w-[120px] inline-block align-bottom" title={evt.summary.payerEmail}>
                                  {evt.summary.payerEmail}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 group-open:hidden">Ver</span>
                        <span className="text-xs text-slate-500 hidden group-open:inline">Cerrar</span>
                      </div>
                    </summary>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {evt.summary && (evt.summary.amount != null || evt.summary.payerEmail || evt.summary.status) && (
                        <div className="rounded-xl border border-[#84b9ed]/30 bg-[#84b9ed]/5 p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Resumen</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {evt.summary.amount != null && (
                              <span>
                                <strong>Monto:</strong> ${evt.summary.amount.toLocaleString("es-AR")} {evt.summary.currency || "ARS"}
                              </span>
                            )}
                            {evt.summary.payerEmail && (
                              <span>
                                <strong>Email:</strong> {evt.summary.payerEmail}
                              </span>
                            )}
                            {evt.summary.status && (
                              <span>
                                <strong>Estado:</strong> {evt.summary.status}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
                );
              })()}
            </div>
          </>
        )}

        {activeTab === "contabilidad" && (
          <div className="space-y-8">
            {/* Filtro por mes */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Ver por mes:</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent min-w-[180px] cursor-pointer"
              >
                <option value="">Todos</option>
                {monthOptions.filter(Boolean).map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthLabel(ym)}
                  </option>
                ))}
              </select>
              {filterMonth && (
                <span className="text-sm text-slate-500">
                  Mostrando {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-green-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Ingresos</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalIngresos)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-red-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Gastos</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalGastos)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-blue-50/50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Inversión</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(totalInversion)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Resultado</p>
                <p className={`text-xl font-bold ${resultado >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(resultado)}
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingRecord ? "Editar registro" : "Nuevo registro"}
                </h2>
                {editingRecord && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmitRecord} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AccountingType)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                    <option value="inversion">Inversión</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto (ARS)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Suscripción cliente X"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría (opcional)</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Hosting, dominio, etc."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
                      submitting
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                    }`}
                  >
                    {submitting
                      ? "Guardando..."
                      : editingRecord
                        ? "Guardar cambios"
                        : "Agregar"}
                  </button>
                </div>
              </form>
              {accError && (
                <p className="mt-3 text-sm text-red-600">{accError}</p>
              )}
            </div>

            {/* Listado */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Registros</h2>
                <button
                  type="button"
                  onClick={fetchRecords}
                  disabled={accLoading}
                  className="text-sm font-medium text-[#84b9ed] hover:text-[#6ba3d9] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {accLoading ? "Cargando..." : "Actualizar"}
                </button>
              </div>

              {accLoading && records.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">Cargando...</p>
              ) : records.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">
                  No hay registros. Agregá el primero con el formulario de arriba.
                </p>
              ) : filteredRecords.length === 0 ? (
                <p className="text-slate-600 py-8 text-center">
                  No hay registros para {formatMonthLabel(filterMonth)}. Cambiá el filtro o agregá registros.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Fecha</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Tipo</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Descripción</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Categoría</th>
                        <th className="text-right py-3 px-2 font-semibold text-slate-700">Monto</th>
                        <th className="text-right py-3 px-2 font-semibold text-slate-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => (
                        <tr key={r._id || r.createdAt} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 px-2 text-slate-600">
                            {new Date(r.date).toLocaleDateString("es-AR")}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[r.type]}`}>
                              {typeLabels[r.type]}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-900">{r.description}</td>
                          <td className="py-3 px-2 text-slate-500">{r.category || "—"}</td>
                          <td className="py-3 px-2 text-right font-medium">
                            <span className={r.type === "gasto" || r.type === "inversion" ? "text-red-600" : "text-green-600"}>
                              {r.type === "gasto" || r.type === "inversion" ? "-" : "+"}
                              {formatCurrency(r.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(r)}
                                title="Editar"
                                aria-label="Editar"
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#84b9ed] transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r)}
                                title="Eliminar"
                                aria-label="Eliminar"
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
