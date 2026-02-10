"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <Link
      href="/#work"
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver a desarrollos
    </Link>
  );
}
