"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

export default function ProjectDetailHeader() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
    setTimeout(() => {
      const workSection = document.getElementById("work");
      if (workSection) {
        const yOffset = -65;
        const y = workSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Atrás"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Desarrollo
        </h2>
      </div>
      <Link
        href="/#work"
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5 text-slate-600" />
      </Link>
    </header>
  );
}
