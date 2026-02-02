"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const base = isHome ? "" : "/";

  const footerLinks = {
    servicios: [
      { label: "Desarrollo Web", href: "#services" },
      { label: "Tienda Online", href: "#services" },
      { label: "Aplicaciones", href: "#services" },
      { label: "Consultoría", href: "#services" },
    ],
    soporte: [
      { label: "Contacto", href: "#contact" },
      { label: "Documentación", href: "#" },
      { label: "Guías", href: "#" },
    ],
    empresa: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Trabajos", href: "#" },
      { label: "Prensa", href: "#" },
    ],
    legal: [
      { label: "Términos de servicio", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Licencia", href: "#" },
    ],
  };

  return (
    <footer className="bg-white border-t border-black/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Top Section: Logo + Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <a href={`${base}#top`} className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8 flex items-center justify-center">
                <Image
                  src="https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp"
                  alt="Glomun"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-slate-900 leading-none">Glomun</span>
            </a>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Servicios */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Servicios</h3>
              <ul className="space-y-3">
                {footerLinks.servicios.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.length > 1 ? `${base}${link.href}` : link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Soporte</h3>
              <ul className="space-y-3">
                {footerLinks.soporte.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.length > 1 ? `${base}${link.href}` : link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.length > 1 ? `${base}${link.href}` : link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.length > 1 ? `${base}${link.href}` : link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-black/10 my-8"></div>

        {/* Bottom Section: Copyright */}
        <div className="flex items-center justify-center md:justify-start">
          <p className="text-sm text-slate-600">
            © {currentYear} Glomun, Inc. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
