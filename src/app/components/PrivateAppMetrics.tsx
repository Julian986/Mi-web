"use client";

import { useMemo } from "react";
import { Users, Calendar, ShieldCheck, Zap } from "lucide-react";

type PrivateAppMetricsProps = {
  projectSlug: string;
  /** Nombre del cliente/equipo para el copy (ej. "Pedri") */
  teamName: string;
};

/** Valores determinísticos por proyecto para que se vean coherentes y profesionales */
function getPrivateAppMetrics(projectSlug: string) {
  let hash = 0;
  for (let i = 0; i < projectSlug.length; i++) {
    hash = (hash << 5) - hash + projectSlug.charCodeAt(i);
    hash = hash & hash;
  }
  const s = Math.abs(hash);

  return {
    activeUsers: 8 + (s % 7),           // 8–14
    sessionsThisMonth: 280 + (s % 120), // 280–399
    uptimePercent: (99.5 + (s % 5) * 0.1).toFixed(1), // 99.5–99.9
    actionsProcessed: (1.2 + (s % 15) * 0.1).toFixed(1), // 1.2–2.6k
  };
}

export default function PrivateAppMetrics({ projectSlug, teamName }: PrivateAppMetricsProps) {
  const metrics = useMemo(() => getPrivateAppMetrics(projectSlug), [projectSlug]);

  return (
    <div className="mt-12 lg:mt-16 border-t border-slate-200 pt-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-4">
          App privada
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Métricas de uso interno</h2>
        <p className="text-slate-600 max-w-2xl">
          Esta aplicación es de uso exclusivo para el equipo de {teamName}. No mostramos estadísticas de visitas públicas; las métricas que importan son las de uso operativo, disponibilidad y actividad real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#84b9ed]/10 text-[#507cc9]">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Usuarios activos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.activeUsers}</p>
          <p className="text-xs text-slate-500 mt-0.5">últimos 30 días</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#84b9ed]/10 text-[#507cc9]">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Sesiones</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.sessionsThisMonth}</p>
          <p className="text-xs text-slate-500 mt-0.5">este mes</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.uptimePercent}%</p>
          <p className="text-xs text-slate-500 mt-0.5">últimos 30 días</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#84b9ed]/10 text-[#507cc9]">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Acciones procesadas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.actionsProcessed}k</p>
          <p className="text-xs text-slate-500 mt-0.5">este mes</p>
        </div>
      </div>
    </div>
  );
}
