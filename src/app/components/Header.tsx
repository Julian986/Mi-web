"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSidebar } from "./sidebar/SidebarProvider";
import Link from "next/link";
import { User } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { openSidebar } = useSidebar();

  // Detectar la sección activa basada en el hash de la URL
  useEffect(() => {
    const updateActiveSection = () => {
      const hash = window.location.hash;
      setActiveSection(hash || "#top");
    };

    updateActiveSection();
    window.addEventListener("hashchange", updateActiveSection);
    return () => window.removeEventListener("hashchange", updateActiveSection);
  }, []);

  // Bloquear scroll cuando el menú mobile está abierto
  useEffect(() => {
    if (!isMenuOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/75 backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-black/15 to-transparent opacity-80"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Navigation (juntos, más a la izquierda) */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex items-center gap-0">
                  {/* <button
                    type="button"
                    onClick={openSidebar}
                    className="mr-1 inline-flex h-10 w-10 items-center justify-center rounded-md border-none cursor-pointer bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                    aria-label="Abrir sidebar"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button> */}
                  <div className="relative flex items-center">
                    <Image
                      /* src="/Glomun_logo.png" */
                      src="https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp"
                      alt="Glomun"
                      width={40}
                      height={40}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xl font-semibold text-slate-900">Glomun</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <a
                  href="#top"
                  className={`group relative inline-flex cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap px-3 py-2 text-sm/6 font-semibold text-slate-900 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${
                    activeSection === "#top" || activeSection === ""
                      ? ""
                      : "hover:text-slate-700"
                  }`}
                >
                  Inicio
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 h-0.5 w-4/5 transition-all duration-200 z-10 ${
                      activeSection === "#top" || activeSection === ""
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{
                      bottom: "-12px",
                      backgroundColor: activeSection === "#top" || activeSection === "" ? "#3b59a3" : "#9ca3af",
                    }}
                  />
                </a>
                <a
                  href="#services"
                  className={`group relative inline-flex cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap px-3 py-2 text-sm/6 font-semibold text-slate-900 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${
                    activeSection === "#services"
                      ? ""
                      : "hover:text-slate-700"
                  }`}
                >
                  Servicios
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 h-0.5 w-4/5 transition-all duration-200 z-10 ${
                      activeSection === "#services"
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{
                      bottom: "-12px",
                      backgroundColor: activeSection === "#services" ? "#3b59a3" : "#9ca3af",
                    }}
                  />
                </a>
                <a
                  href="#work"
                  className={`group relative inline-flex cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap px-3 py-2 text-sm/6 font-semibold text-slate-900 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${
                    activeSection === "#work"
                      ? ""
                      : "hover:text-slate-700"
                  }`}
                >
                Desarrollos
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 h-0.5 w-4/5 transition-all duration-200 z-10 ${
                      activeSection === "#work"
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{
                      bottom: "-12px",
                      backgroundColor: activeSection === "#work" ? "#3b59a3" : "#9ca3af",
                    }}
                  />
                </a>
                <a
                  href="#contact"
                  className={`group relative inline-flex cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap px-3 py-2 text-sm/6 font-semibold text-slate-900 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${
                    activeSection === "#contact"
                      ? ""
                      : "hover:text-slate-700"
                  }`}
                >
                  Contacto
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 h-0.5 w-4/5 transition-all duration-200 z-10 ${
                      activeSection === "#contact"
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{
                      bottom: "-12px",
                      backgroundColor: activeSection === "#contact" ? "#3b59a3" : "#9ca3af",
                    }}
                  />
                </a>
              </nav>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/account"
                  aria-label="Mi cuenta"
                  title="Mi cuenta"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <User className="h-5 w-5" />
                </Link>
                <a
                  href="#services"
                  className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
                  Ver servicios
                </a>
                <a
                  href="#contact"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Agendar llamada
                </a>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-slate-600 hover:text-slate-900 p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu (full-screen) - fuera del header para quedar por encima de todo */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white">
          {/* Top bar para cerrar */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-black/10">
            <div className="flex items-center">
              <div className="flex items-center gap-0">
                <div className="relative flex items-center">
                  <Image
                    src="https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp"
                    alt="Glomun"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-semibold text-slate-900">Glomun</span>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="px-4 py-6">
            <div className="space-y-2">
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5 text-slate-700" />
                Mi cuenta
              </Link>

              <div className="pt-3">
                <a
                  href="#top"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Inicio
                </a>
                <a
                  href="#services"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Servicios
                </a>
                <a
                  href="#work"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Desarrollos
                </a>
                <a
                  href="#contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
