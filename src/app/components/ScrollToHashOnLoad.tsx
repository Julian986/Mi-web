"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Corrige el scroll a secciones por hash cuando se navega desde otra página
 * (ej. desde Mi cuenta a /#work). El scroll nativo ocurre antes de que los
 * componentes lazy terminen de cargar, generando mal posicionamiento.
 */
export default function ScrollToHashOnLoad() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || hash === "#top") return;

    const scrollToSection = () => {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      // scrollIntoView respeta scroll-margin-top (scroll-mt-*) igual que el enlace nativo
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Esperar a que el contenido lazy (ServicesDashboards, ProjectsShowcase) termine de renderizar
    const t1 = setTimeout(scrollToSection, 100);
    const t2 = setTimeout(scrollToSection, 400);
    const t3 = setTimeout(scrollToSection, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
