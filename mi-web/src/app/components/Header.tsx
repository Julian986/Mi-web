"use client";

import React, { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-white shadow-[0_10px_30px_rgba(0,112,243,0.18)]" />
              <span className="text-xl font-semibold text-white">Nexus</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#top" className="text-white/70 hover:text-white transition-colors">
              Inicio
            </a>
            <a href="#services" className="text-white/70 hover:text-white transition-colors">
              Servicios
            </a>
            <a href="#work" className="text-white/70 hover:text-white transition-colors">
              Casos
            </a>
            <a href="#contact" className="text-white/70 hover:text-white transition-colors">
              Contacto
            </a>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#contact"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                Agendar llamada
              </a>
              <a
                href="#services"
                className="rounded-lg border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
              >
                Ver servicios
              </a>
              <button className="text-white/60 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-white/60 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/70 hover:text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#top" className="block px-3 py-2 text-white/80 hover:text-white">
                Inicio
              </a>
              <a href="#services" className="block px-3 py-2 text-white/80 hover:text-white">
                Servicios
              </a>
              <a href="#work" className="block px-3 py-2 text-white/80 hover:text-white">
                Casos
              </a>
              <a href="#contact" className="block px-3 py-2 text-white/80 hover:text-white">
                Contacto
              </a>
              <div className="px-3 py-2">
                <a
                  href="#contact"
                  className="mb-2 block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-black transition-colors hover:bg-white/90"
                >
                  Agendar llamada
                </a>
                <a
                  href="#services"
                  className="block w-full rounded-lg border border-white/15 bg-transparent px-4 py-2 text-center text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
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
