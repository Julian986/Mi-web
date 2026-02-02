"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-105 shrink-0 cursor-pointer"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
