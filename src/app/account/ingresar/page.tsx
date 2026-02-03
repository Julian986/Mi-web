"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function IngresarPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess(false);
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Error al enviar el enlace.");
        return;
      }
      setLoginSuccess(true);
    } catch {
      setLoginError("Error de red. Intentá de nuevo.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/account"
            className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
            aria-label="Volver a Mi cuenta"
          >
            <ArrowLeft className="w-6 h-6 shrink-0" />
            <span className="text-lg font-medium">Ingresar</span>
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">Ingresar a Mi cuenta</h1>
            <p className="mt-1 text-sm text-slate-600">
              Ingresá el email de tu suscripción y te enviaremos un enlace para acceder.
            </p>
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                required
              />
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              {loginSuccess && (
                <p className="text-sm text-green-600">
                  ¡Listo! Revisá tu email (y carpeta de spam).
                </p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-[#84b9ed] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6ba3d9] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loginLoading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              ¿No tenés suscripción?{" "}
              <Link href="/#services" className="font-medium text-[#84b9ed] hover:text-[#6ba3d9] underline">
                Ver planes
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
