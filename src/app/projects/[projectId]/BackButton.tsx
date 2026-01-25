"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Guardar que estamos volviendo para restaurar el estado
    if (typeof window !== "undefined") {
      // El estado de showAll ya está guardado en sessionStorage
      // Solo necesitamos volver atrás
      router.back();
      // Hacer scroll a la sección de proyectos después de un pequeño delay
      setTimeout(() => {
        const workSection = document.getElementById("work");
        if (workSection) {
          const yOffset = -65; // Offset para enfocar un poco más arriba
          const y = workSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      router.back();
    }
  };

  return (
    <a
      href="#"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver a desarrollos
    </a>
  );
}
