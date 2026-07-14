"use client";

import { useEffect, useState } from "react";

/**
 * El panel administrativo se monta en cliente para evitar falsos errores de
 * hidratación causados por extensiones que alteran SVG y colores (p. ej. Dark Reader).
 * El sitio público conserva su renderizado en servidor.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-500">Cargando...</p>
      </main>
    );
  }

  return children;
}
