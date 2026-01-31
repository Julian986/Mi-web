"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import VisitorsChart from "@/app/components/VisitorsChart";
import { SidebarProvider } from "@/app/components/sidebar/SidebarProvider";
import Link from "next/link";
import { CreditCard, RefreshCw, Settings, ShieldCheck, X } from "lucide-react";

type PlanType = "web" | "ecommerce";

const planLabels: Record<PlanType, string> = {
  web: "Sitio Web",
  ecommerce: "Tienda Online",
};

// Toggle dev: simular suscripción activa/inactiva para evaluar UI. Quitar en producción.
const DEV_SUBSCRIPTION_KEY = "dev-subscription-preview";

export default function AccountPage() {
  // Mock “sesión” / datos del cliente (por ahora)
  const [subscription, setSubscription] = useState<{ preapprovalId: string; email: string; plan: PlanType; status: string } | null>(null);
  // Flujo “Actualizar mensualidad”
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [devPreviewActive, setDevPreviewActive] = useState<boolean | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(DEV_SUBSCRIPTION_KEY);
    if (stored === "active") setDevPreviewActive(true);
    else if (stored === "inactive") setDevPreviewActive(false);
  }, []);

  const effectiveSubscription = devPreviewActive !== null
    ? (devPreviewActive ? { preapprovalId: "dev", email: "", plan: "web" as PlanType, status: "authorized" } : null)
    : subscription;

  const plan: PlanType = effectiveSubscription?.plan || "web";
  const status = effectiveSubscription?.status === "authorized" ? "active" : "pending";

  const handleDevToggle = (value: boolean) => {
    setDevPreviewActive(value);
    localStorage.setItem(DEV_SUBSCRIPTION_KEY, value ? "active" : "inactive");
  };

  const handleDevReset = () => {
    setDevPreviewActive(null);
    localStorage.removeItem(DEV_SUBSCRIPTION_KEY);
  };
  const prices = useMemo(() => {
    const baseARS = plan === "web" ? 25000 : 35000;
    const baseUSD = plan === "web" ? 21 : 29;
    return { baseARS, baseUSD };
  }, [plan]);

  const nextPaymentDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  }, []);

  useEffect(() => {
    fetch("/api/account/subscription", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSubscription(data.subscription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch("/api/mercadopago/subscription/upgrade", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No pudimos iniciar la actualización.");
        return;
      }
      const url = data.init_point;
      if (url) window.location.href = url;
      else alert("No pudimos redirigir a Mercado Pago.");
    } catch (e) {
      alert("Error de red. Intentá de nuevo.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            {/* Toggle dev: evaluar UI activa/inactiva. Quitar en producción. */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <span className="font-medium text-amber-800">Dev:</span>
              <button
                type="button"
                onClick={() => handleDevToggle(true)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  devPreviewActive === true ? "bg-green-600 text-white" : "bg-white text-slate-600 hover:bg-green-50"
                }`}
              >
                Activa
              </button>
              <button
                type="button"
                onClick={() => handleDevToggle(false)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  devPreviewActive === false ? "bg-slate-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Inactiva
              </button>
              {devPreviewActive !== null && (
                <button
                  type="button"
                  onClick={handleDevReset}
                  className="ml-2 rounded px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Usar datos reales
                </button>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mi cuenta</h1>
                <Link
                  href="/account/settings"
                  className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Configuración"
                >
                  <Settings className="h-6 w-6" />
                </Link>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Tu panel, tu plan y tus estadísticas en un solo lugar
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 h-64 bg-slate-50 rounded-2xl animate-pulse" />
                <aside className="h-64 bg-slate-50 rounded-2xl animate-pulse" />
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Suscripción */}
              <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Tu suscripción</h2>
                  <p className="text-sm text-slate-600">Estado, plan y próximos cobros</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    effectiveSubscription
                      ? status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {effectiveSubscription ? (status === "active" ? "Activa" : "Pendiente") : "Inactiva"}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Plan</p>
                  <p className="text-base font-semibold text-slate-900">
                    {effectiveSubscription ? planLabels[plan] : "..."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Mensualidad actual</p>
                  <p className="text-base font-semibold text-slate-900">
                    {effectiveSubscription ? `$${prices.baseARS.toLocaleString("es-AR")} ARS` : "..."}
                  </p>
                  <p className="text-xs text-slate-500">
                    {effectiveSubscription ? `$${prices.baseUSD} USD / mes` : "..."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Próximo cobro</p>
                  <p className="text-base font-semibold text-slate-900">
                    {effectiveSubscription ? nextPaymentDate : "..."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  Pagos procesados por Mercado Pago.
                </div>
                <div className="flex items-center gap-2">
                  {effectiveSubscription && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => alert("Próximamente: historial de pagos.")}
                  >
                    <CreditCard className="w-4 h-4" />
                    Historial
                  </button>
                  )}
                  {effectiveSubscription ? (
                    <button
                      type="button"
                      disabled={upgradeLoading || (devPreviewActive === true && !subscription)}
                      title={devPreviewActive === true && !subscription ? "Modo preview: usar datos reales para probar" : undefined}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleUpgrade}
                    >
                      <RefreshCw className={`w-4 h-4 ${upgradeLoading ? "animate-spin" : ""}`} />
                      {upgradeLoading ? "Abriendo Mercado Pago..." : "Actualizar al precio vigente"}
                    </button>
                  ) : (
                    <Link
                      href="/#services"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors"
                    >
                      Ver planes y suscribirse
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Atajos */}
          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
              <p className="text-sm text-slate-600">Acciones frecuentes del cliente</p>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => effectiveSubscription ? alert("Próximamente: soporte 24/7.") : setShowSubscribeModal(true)}
              >
                <p className="text-sm font-semibold text-slate-900">Soporte 24/7</p>
                <p className="text-xs text-slate-500">Abrí un ticket o escribinos por WhatsApp</p>
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => effectiveSubscription ? alert("Próximamente: administrar dominio.") : setShowSubscribeModal(true)}
              >
                <p className="text-sm font-semibold text-slate-900">Dominio</p>
                <p className="text-xs text-slate-500">Gestioná tu dominio y DNS</p>
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => effectiveSubscription ? alert("Próximamente: solicitar cambios.") : setShowSubscribeModal(true)}
              >
                <p className="text-sm font-semibold text-slate-900">Solicitar cambios</p>
                <p className="text-xs text-slate-500">Pedinos modificaciones en tu sitio o tienda</p>
              </button>
            </div>
          </aside>
            </div>
            )}

            {!loading && (
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                {effectiveSubscription
                  ? `Estadísticas de tu ${planLabels[plan]}`
                  : "Estadísticas de tu servicio"}
              </h2>
                <p className="text-sm text-slate-600">
                  {effectiveSubscription ? "Datos de ejemplo (próximamente reales)" : "..."}
                </p>
              </div>
              <VisitorsChart projectId={`account-${plan}`} hideValues={!effectiveSubscription} />
            </section>
            )}
          </div>

            {/* Modal: suscripción requerida (solo cuando inactiva) */}
            {showSubscribeModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="subscribe-modal-title"
              >
                <div
                  className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                  onClick={() => setShowSubscribeModal(false)}
                  aria-hidden
                />
                <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                  <button
                    type="button"
                    onClick={() => setShowSubscribeModal(false)}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="pr-10">
                    <h2 id="subscribe-modal-title" className="text-xl font-bold text-slate-900">
                      Suscripción requerida
                    </h2>
                    <p className="mt-3 text-slate-600">
                      Para acceder a esta función necesitás una suscripción activa. Suscribite a un plan para disfrutar de todos los beneficios de Glomun.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowSubscribeModal(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Cerrar
                    </button>
                    <Link
                      href="/#services"
                      onClick={() => setShowSubscribeModal(false)}
                      className="inline-flex justify-center rounded-lg bg-[#84b9ed] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6ba3d9]"
                    >
                      Ver planes y suscribirse
                    </Link>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </SidebarProvider>
  );
}

