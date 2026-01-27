"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "./SidebarProvider";
import Image from "next/image";
import { 
  Home, 
  Briefcase, 
  FolderKanban, 
  Mail, 
  MoreVertical,
  Github,
  User
} from "lucide-react";
import Link from "next/link";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
type NavSection = { title: string; items: NavItem[] };

function getFocusable(container: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export default function DrawerSidebar() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { open, closeSidebar } = useSidebar();

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

  // Check for reduced motion preference only on client
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const sections = useMemo<NavSection[]>(
    () => [
      {
        title: "Navigation",
        items: [
          { label: "Inicio", href: "#top", icon: Home },
          { label: "Servicios", href: "#services", icon: Briefcase },
          { label: "Casos", href: "#work", icon: FolderKanban },
          { label: "Contacto", href: "#contact", icon: Mail },
        ],
      },
      {
        title: "Cuenta",
        items: [{ label: "Mi cuenta", href: "/account", icon: User }],
      },
    ],
    []
  );

  // Lock scroll + restore focus
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;

    // Guardar los valores originales
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyWidth = document.body.style.width;
    
    // Calcular el ancho del scrollbar para evitar el shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Bloquear scroll en body y html
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = `calc(100% - ${scrollbarWidth}px)`;

    // Focus first interactive element inside panel
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusable(panel);
      (focusables[0] ?? panel).focus?.();
    }, 0);

    return () => {
      window.clearTimeout(t);
      // Restaurar valores originales
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.width = prevBodyWidth;
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    };
  }, [open]);

  // Close on ESC + basic focus trap
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSidebar();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = getFocusable(panel);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSidebar]);

  const panelMotion = reduceMotion
    ? { initial: { x: 0 }, animate: { x: 0 }, exit: { x: 0 } }
    : { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          aria-hidden={!open}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 cursor-default bg-black/25"
            onClick={closeSidebar}
          />

          {/* Panel */}
          <motion.aside
            {...panelMotion}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 340,
                    damping: 34,
                    mass: 0.9,
                  }
            }
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            ref={panelRef}
            tabIndex={-1}
            className={[
              "absolute left-0 top-0 h-full",
              "w-[min(85vw,280px)] md:w-[280px]",
              "bg-[#0f172a] border-r border-slate-800",
              "outline-none",
            ].join(" ")}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 flex items-center justify-center">
                    <Image
                      src="https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/gotita_loca_iskndh.webp"
                      alt="Glomun"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-base font-semibold text-white leading-none">Glomun</div>
                </div>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                  aria-label="Cerrar"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Sections */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {sections.map((section) => (
                  <div key={section.title} className="mb-6">
                    <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.href || (item.href === "#top" && (activeSection === "" || activeSection === "#top"));
                        const isInternalRoute = item.href.startsWith("/");
                        return (
                          isInternalRoute ? (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => closeSidebar()}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm/6 font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 ${
                                isActive
                                  ? "bg-slate-800"
                                  : "hover:bg-slate-800/50"
                              }`}
                            >
                              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                              {item.label}
                            </Link>
                          ) : (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={() => closeSidebar()}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm/6 font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 ${
                                isActive
                                  ? "bg-slate-800"
                                  : "hover:bg-slate-800/50"
                              }`}
                            >
                              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                              {item.label}
                            </a>
                          )
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer - User Profile */}
              <div className="border-t border-slate-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
                    GB
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">Glomun</span>
                      <svg className="h-4 w-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Github className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-400 truncate">@glomun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

