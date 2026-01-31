"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [language, setLanguage] = useState<"es" | "en" | "fr">("es");
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
