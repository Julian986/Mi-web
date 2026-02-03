"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, X } from "lucide-react";

export default function SettingsPage() {
  const [language, setLanguage] = useState<"es" | "en" | "fr">("es");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const applySession = (value: boolean) => {
      if (!mounted) return;
      setHasSession(value);
      setSessionLoading(false);
    };

    if (typeof window !== "undefined") {
      const devPreview = localStorage.getItem("dev-subscription-preview");
      if (devPreview === "active") {
        applySession(true);
        return () => {
          mounted = false;
        };
      }
      if (devPreview === "inactive") {
        applySession(false);
        return () => {
          mounted = false;
        };
      }
    }

    fetch("/api/account/subscription", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setHasSession(Boolean(data?.subscription));
      })
      .catch(() => {
        if (!mounted) return;
        setHasSession(false);
      })
      .finally(() => {
        if (!mounted) return;
        setSessionLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/account/logout", { method: "POST", credentials: "include" });
      window.location.href = "/account";
    } catch {
      window.location.href = "/account";
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header estilo WhatsApp: flecha + título */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/account"
            className="flex items-center gap-3 text-slate-900 hover:text-slate-600 transition-colors"
            aria-label="Volver a Mi cuenta"
          >
            <ArrowLeft className="w-6 h-6 shrink-0" />
            <span className="text-lg font-medium">Configuración</span>
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <p className="text-sm text-slate-600 mb-6">
            Idioma, tema y otras preferencias
          </p>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Idioma</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "es" | "en" | "fr")}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#84b9ed] focus:border-transparent"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    Por ahora es visual (próximamente lo aplicamos a toda la web).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tema</label>
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
                  <p className="text-xs text-slate-500 mt-2">
                    Próximamente: modo oscuro real con toggle en toda la app.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    disabled={logoutLoading || sessionLoading || !hasSession}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:hover:bg-slate-100"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                    {logoutLoading ? "Cerrando..." : "Cerrar sesión"}
                  </button>
                </div>
              </div>
            </div>
          {showLogoutModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-modal-title"
            >
              <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => setShowLogoutModal(false)}
                aria-hidden
              />
              <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="pr-10">
                  <h2 id="logout-modal-title" className="text-xl font-bold text-slate-900">
                    ¿Cerrar sesión?
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Vas a salir de tu cuenta en este dispositivo.
                  </p>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={logoutLoading}
                    onClick={() => {
                      setShowLogoutModal(false);
                      handleLogout();
                    }}
                    className="inline-flex justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {logoutLoading ? "Cerrando..." : "Cerrar sesión"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
