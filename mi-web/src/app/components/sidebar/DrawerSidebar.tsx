"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "./SidebarProvider";

type NavItem = { label: string; href: string };
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
  const { open, closeSidebar } = useSidebar();

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
        title: "Navegación",
        items: [
          { label: "Inicio", href: "#top" },
          { label: "Servicios", href: "#services" },
          { label: "Casos", href: "#work" },
          { label: "Contacto", href: "#contact" },
        ],
      },
      {
        title: "Recursos",
        items: [{ label: "Cómo trabajamos", href: "#process" }],
      },
    ],
    []
  );

  // Lock scroll + restore focus
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first interactive element inside panel
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusable(panel);
      (focusables[0] ?? panel).focus?.();
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
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
              "w-[min(85vw,340px)] md:w-[320px]",
              "border-r border-black/10 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.18)]",
              "outline-none",
            ].join(" ")}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-900" aria-hidden />
                  <div className="text-base font-semibold text-slate-900">Glomun</div>
                </div>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  aria-label="Cerrar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6l-12 12" />
                  </svg>
                </button>
              </div>

              {/* Sections */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {sections.map((section) => (
                  <div key={section.title} className="mb-5">
                    <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => closeSidebar()}
                          className="flex items-center rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-black/10 p-4">
                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(2,6,23,0.14)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                >
                  Agendar llamada
                </button>
                <div className="mt-3 text-center text-xs text-slate-500">Atajos: ESC para cerrar</div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

