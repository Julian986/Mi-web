"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useSidebar } from "./sidebar/SidebarProvider";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSidebar } = useSidebar();
  const navItemClassName =
    "inline-flex cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-normal !leading-none text-center text-black transition-colors duration-200 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-black/10";

  return (
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
                <button
                  type="button"
                  onClick={openSidebar}
                  className="mr-1 inline-flex h-10 w-10 items-center justify-center rounded-md border-none cursor-pointer bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  aria-label="Abrir sidebar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
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
              <a href="#top" className={navItemClassName}>
                Inicio
              </a>
              <a href="#services" className={navItemClassName}>
                Servicios
              </a>
              <a href="#work" className={navItemClassName}>
                Casos
              </a>
              <a href="#contact" className={navItemClassName}>
                Contacto
              </a>
            </nav>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#contact"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Agendar llamada
              </a>
              <a
                href="#services"
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                Ver servicios
              </a>
              <button className="text-slate-500 hover:text-slate-900 p-2" aria-label="Buscar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-slate-500 hover:text-slate-900 p-2" aria-label="Tema">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-black/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#top" className="block px-3 py-2 text-slate-700 hover:text-slate-900">
                Inicio
              </a>
              <a href="#services" className="block px-3 py-2 text-slate-700 hover:text-slate-900">
                Servicios
              </a>
              <a href="#work" className="block px-3 py-2 text-slate-700 hover:text-slate-900">
                Casos
              </a>
              <a href="#contact" className="block px-3 py-2 text-slate-700 hover:text-slate-900">
                Contacto
              </a>
              <div className="px-3 py-2">
                <a
                  href="#contact"
                  className="mb-2 block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Agendar llamada
                </a>
                <a
                  href="#services"
                  className="block w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-center text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                >
                  Ver servicios
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
