"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Subscription = {
  preapprovalId: string;
  email: string;
  name?: string;
  plan: string;
  status: string;
  ga4PropertyId: string | null;
  performanceMetrics: {
    siteUrl?: string;
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    fcp?: number;
    lcp?: number;
    tbt?: number;
    cls?: number;
    si?: number;
  } | null;
};

type PerformanceMetricsForm = NonNullable<Subscription["performanceMetrics"]>;

export default function MetricasPage() {
  const params = useParams();
  const router = useRouter();
  const preapprovalId = params.preapprovalId as string;
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<PerformanceMetricsForm>>({});

  useEffect(() => {
    if (!preapprovalId) return;
    fetch(`/api/admin/subscriptions/${encodeURIComponent(preapprovalId)}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSub(data.subscription);
        setForm(data.subscription?.performanceMetrics || {});
      })
      .catch((e) => setError(e?.message || "Error al cargar"))
      .finally(() => setLoading(false));
  }, [preapprovalId]);

  const hasAnyValue = Boolean(
    (form.siteUrl && form.siteUrl.trim()) ||
    form.performance != null ||
    form.accessibility != null ||
    form.bestPractices != null ||
    form.seo != null ||
    form.fcp != null ||
    form.lcp != null ||
    form.tbt != null ||
    form.cls != null ||
    form.si != null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preapprovalId) return;
    if (!hasAnyValue) {
      setError("Completá al menos un campo para guardar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/subscriptions/${encodeURIComponent(preapprovalId)}/metrics`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUrl: form.siteUrl || undefined,
          performance: form.performance != null ? Number(form.performance) : undefined,
          accessibility: form.accessibility != null ? Number(form.accessibility) : undefined,
          bestPractices: form.bestPractices != null ? Number(form.bestPractices) : undefined,
          seo: form.seo != null ? Number(form.seo) : undefined,
          fcp: form.fcp != null ? Number(form.fcp) : undefined,
          lcp: form.lcp != null ? Number(form.lcp) : undefined,
          tbt: form.tbt != null ? Number(form.tbt) : undefined,
          cls: form.cls != null ? Number(form.cls) : undefined,
          si: form.si != null ? Number(form.si) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      router.push("/admin92?tab=suscripciones");
    } catch (e: unknown) {
      setError((e as Error)?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <p className="text-slate-500">Cargando...</p>
        </div>
      </main>
    );
  }

  if (error && !sub) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <p className="text-red-600">{error}</p>
          <Link href="/admin92" className="mt-4 inline-flex items-center gap-2 text-[#84b9ed] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Volver a Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          href="/admin92"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Admin
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Métricas de performance</h1>
          <p className="text-slate-600 mt-1">
            {sub?.email} — {sub?.plan}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">URL del sitio</h2>
            <input
              type="url"
              value={form.siteUrl || ""}
              onChange={(e) => setForm((f) => ({ ...f, siteUrl: e.target.value }))}
              placeholder="https://ejemplo.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Scores principales (0-100)</h2>
            <p className="text-xs text-slate-500 mb-4">Obtenelos de PageSpeed Insights / Lighthouse</p>
            <div className="grid grid-cols-2 gap-4">
              {(["performance", "accessibility", "bestPractices", "seo"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {key === "performance" && "Rendimiento"}
                    {key === "accessibility" && "Accesibilidad"}
                    {key === "bestPractices" && "Buenas prácticas"}
                    {key === "seo" && "SEO"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form[key] ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        [key]: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                    placeholder="—"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Métricas técnicas (opcional)</h2>
            <p className="text-xs text-slate-500 mb-4">FCP, LCP en segundos. TBT en ms. CLS sin unidad.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">FCP (s)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={form.fcp ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fcp: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">LCP (s)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={form.lcp ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      lcp: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">TBT (ms)</label>
                <input
                  type="number"
                  min={0}
                  value={form.tbt ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tbt: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CLS</label>
                <input
                  type="number"
                  step={0.001}
                  min={0}
                  value={form.cls ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cls: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">SI (s)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={form.si ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      si: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !hasAnyValue}
              className="rounded-lg bg-[#84b9ed] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6ba3d9] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <Link
              href="/admin92"
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
