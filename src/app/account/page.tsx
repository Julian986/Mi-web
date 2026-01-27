"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import VisitorsChart from "@/app/components/VisitorsChart";
import { ArrowLeft, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

type PlanType = "web" | "ecommerce";

const planLabels: Record<PlanType, string> = {
  web: "Sitio Web",
  ecommerce: "E-commerce",
};

export default function AccountPage() {
  // Mock “sesión” / datos del cliente (por ahora)
  const [plan, setPlan] = useState<PlanType>("web");
  const [status] = useState<"active" | "pending">("active");
  const [language, setLanguage] = useState<"es" | "en" | "fr">("es");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Flujo “Actualizar mensualidad”
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFromId, setUpgradeFromId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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

  const canUpgrade = !!(upgradeFromId.trim() && email.trim() && name.trim() && phone.trim());

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/#top"
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mi cuenta</h1>
          </div>
        </div>

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
                    status === "active"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {status === "active" ? "Activa" : "Pendiente"}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Plan</p>
                  <p className="text-base font-semibold text-slate-900">{planLabels[plan]}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Mensualidad actual</p>
                  <p className="text-base font-semibold text-slate-900">
                    ${prices.baseARS.toLocaleString("es-AR")} ARS
                  </p>
                  <p className="text-xs text-slate-500">${prices.baseUSD} USD / mes</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Próximo cobro</p>
                  <p className="text-base font-semibold text-slate-900">{nextPaymentDate}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  Pagos procesados por Mercado Pago.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => alert("Próximamente: historial de pagos.")}
                  >
                    <CreditCard className="w-4 h-4" />
                    Historial
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#84b9ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors cursor-pointer"
                    onClick={() => setShowUpgrade((v) => !v)}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar mensualidad
                  </button>
                </div>
              </div>

              {showUpgrade && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Actualizar mensualidad</h3>
                      <p className="text-sm text-slate-600">
                        Esto crea una nueva suscripción con el precio vigente. Cuando quede autorizada, cancelaremos la anterior.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                      <select
                        value={plan}
                        onChange={(e) => setPlan(e.target.value as PlanType)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                      >
                        <option value="web">Sitio Web</option>
                        <option value="ecommerce">E-commerce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID de suscripción anterior <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={upgradeFromId}
                        onChange={(e) => setUpgradeFromId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        placeholder="Ej: 2c9380847a... (preapproval id)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                        placeholder="cliente@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Se abrirá Mercado Pago para autorizar el nuevo monto. Luego, el sistema cancelará la suscripción anterior.
                    </p>
                    <button
                      type="button"
                      disabled={!canUpgrade || loading}
                      onClick={async () => {
                        if (!canUpgrade) return;
                        setLoading(true);
                        try {
                          const res = await fetch("/api/mercadopago/subscription", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              serviceType: plan,
                              customerEmail: email,
                              customerName: name,
                              customerPhone: phone,
                              upgradeFromPreapprovalId: upgradeFromId.trim(),
                            }),
                          });

                          const raw = await res.text();
                          let data: any = {};
                          try {
                            data = raw ? JSON.parse(raw) : {};
                          } catch {
                            data = { raw };
                          }

                          if (!res.ok) {
                            console.error("Mercado Pago error:", { status: res.status, data });
                            alert((typeof data?.error === "string" && data.error) || "No pudimos iniciar Mercado Pago.");
                            return;
                          }

                          const redirectUrl: string | undefined = data.init_point || data.sandbox_init_point;
                          if (!redirectUrl) {
                            console.error("Mercado Pago missing init_point:", data);
                            alert("No pudimos iniciar Mercado Pago. Falta el enlace de pago.");
                            return;
                          }

                          window.location.href = redirectUrl;
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                        canUpgrade && !loading
                          ? "bg-[#84b9ed] text-white hover:bg-[#6ba3d9] cursor-pointer"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Abriendo Mercado Pago..." : "Autorizar nueva mensualidad"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Atajos */}
          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-5 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
              <p className="text-sm text-slate-600">Acciones frecuentes del cliente</p>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">Preferencias</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Idioma</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "es" | "en" | "fr")}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Por ahora es visual (próximamente lo aplicamos a toda la web).
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Tema</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          theme === "light"
                            ? "bg-[#84b9ed] text-white"
                            : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          theme === "dark"
                            ? "bg-[#84b9ed] text-white"
                            : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        Oscuro
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Próximamente: modo oscuro real con toggle en toda la app.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => alert("Próximamente: soporte 24/7.")}
              >
                <p className="text-sm font-semibold text-slate-900">Soporte 24/7</p>
                <p className="text-xs text-slate-500">Abrí un ticket o escribinos por WhatsApp</p>
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => alert("Próximamente: administrar dominio.")}
              >
                <p className="text-sm font-semibold text-slate-900">Dominio</p>
                <p className="text-xs text-slate-500">Gestioná tu dominio y DNS</p>
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => alert("Próximamente: integrar Analytics.")}
              >
                <p className="text-sm font-semibold text-slate-900">Analytics</p>
                <p className="text-xs text-slate-500">Conectá tu medición de tráfico</p>
              </button>
            </div>
          </aside>
        </div>

        {/* Estadísticas */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Estadísticas de tu producto</h2>
            <p className="text-sm text-slate-600">Datos de ejemplo (próximamente reales)</p>
          </div>
          <VisitorsChart projectId={`account-${plan}`} />
        </section>
      </div>
    </main>
  );
}

