"use client";

import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Project = {
  id: string;
  title: string;
  tag: string;
  description: string;
  /** Posición dentro del viewBox */
  x: number;
  y: number;
  /** Colores RGB "r,g,b" para acento */
  accentRgb: string;
};

const VB_W = 1000;
const VB_H = 600;
const CORE_X = 500;
const CORE_Y = 300;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function makeCablePath(cx: number, cy: number, px: number, py: number) {
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy) || 1;

  // Curvatura: más distancia => curva más amplia (pero limitada)
  const k = clamp(dist / 3.2, 140, 260);

  // Control points a lo largo del vector, con un offset perpendicular sutil
  const nx = dx / dist;
  const ny = dy / dist;
  const perpX = -ny;
  const perpY = nx;
  const bend = clamp(dist / 10, 18, 44);

  const c1x = cx + nx * k + perpX * bend;
  const c1y = cy + ny * k + perpY * bend;
  const c2x = px - nx * k + perpX * (bend * 0.75);
  const c2y = py - ny * k + perpY * (bend * 0.75);

  return `M ${cx} ${cy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${px} ${py}`;
}

export default function CompanyCore() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const projects: Project[] = useMemo(
    () => [
      {
        id: "webs",
        title: "Webs de alto rendimiento",
        tag: "Marketing + SEO",
        description: "Landings, sitios corporativos y performance budgets para escalar adquisición.",
        x: 220,
        y: 175,
        accentRgb: "88,101,242",
      },
      {
        id: "ecommerce",
        title: "Tienda online y pagos",
        tag: "Plataforma",
        description: "Checkout, catálogo, inventario, integraciones y analítica orientada a conversión.",
        x: 780,
        y: 165,
        accentRgb: "124,58,237",
      },
      {
        id: "apps",
        title: "Apps & producto",
        tag: "Mobile / Web app",
        description: "Interfaces rápidas, estados complejos, offline-first y entregas continuas.",
        x: 810,
        y: 435,
        accentRgb: "34,211,238",
      },
      {
        id: "dashboards",
        title: "Dashboards & backoffice",
        tag: "Operaciones",
        description: "Herramientas internas, métricas, permisos y flujos que ahorran horas cada semana.",
        x: 220,
        y: 430,
        accentRgb: "16,185,129",
      },
      {
        id: "apis",
        title: "APIs & automatizaciones",
        tag: "Integraciones",
        description: "Sistemas conectados, colas/eventos, webhooks y arquitectura lista para crecer.",
        x: 500,
        y: 510,
        accentRgb: "244,63,94",
      },
    ],
    []
  );

  const anyActive = activeId !== null;
  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Marco + brillo sutil */}
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_55px_rgba(2,6,23,0.10)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-[0.32] [mask-image:radial-gradient(560px_circle_at_50%_40%,black,transparent_74%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(88,101,242,0.16),transparent_64%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-44 right-[-160px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_62%)] blur-3xl"
        />

        {/* Contenedor con ratio responsivo */}
        <div className="relative aspect-[16/10] w-full">
          {/* SVG: core + conexiones (sin interacción directa; las cards manejan el hover) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            role="img"
            aria-label="Núcleo tecnológico conectado a proyectos"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="coreGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.85 0"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="coreFill" cx="50%" cy="42%" r="62%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.92)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.66)" />
              </radialGradient>

              <linearGradient id="cableBase" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(15,23,42,0.06)" />
                <stop offset="50%" stopColor="rgba(15,23,42,0.18)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.06)" />
              </linearGradient>
            </defs>

            {/* Conexiones */}
            <g opacity={0.98}>
              {projects.map((p, idx) => {
                const d = makeCablePath(CORE_X, CORE_Y, p.x, p.y);
                const isActive = activeId === p.id;
                const dimOthers = anyActive && !isActive;

                // Un pequeño "delay" escalonado para el draw-in inicial
                const enterDelay = 0.15 + idx * 0.07;
                const dashCycle = 28;

                return (
                  <g key={p.id}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="url(#cableBase)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: dimOthers ? 0.14 : isActive ? 0.55 : 0.32,
                      }}
                      transition={{
                        duration: reduceMotion ? 0 : 1.25,
                        ease: [0.22, 1, 0.36, 1],
                        delay: reduceMotion ? 0 : enterDelay,
                      }}
                    />

                    {/* Pulso: misma ruta con patrón dashed y dashoffset animado */}
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={`rgba(${p.accentRgb}, ${isActive ? 0.9 : 0.6})`}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray={`2 ${dashCycle}`}
                      initial={{ strokeDashoffset: 0, opacity: 0 }}
                      animate={{
                        opacity: dimOthers ? 0.0 : isActive ? 0.95 : 0.55,
                        strokeDashoffset: reduceMotion ? 0 : [-dashCycle, -dashCycle * 9],
                      }}
                      transition={{
                        opacity: { duration: 0.18 },
                        strokeDashoffset: reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 2.6 + idx * 0.25,
                              ease: "linear",
                              repeat: Infinity,
                            },
                      }}
                    />

                    {/* Nodo del proyecto */}
                    <circle cx={p.x} cy={p.y} r={4.5} fill={`rgba(${p.accentRgb}, 0.95)`} opacity={dimOthers ? 0.25 : 0.95} />
                    <circle cx={p.x} cy={p.y} r={11} fill="transparent" stroke={`rgba(${p.accentRgb}, ${isActive ? 0.55 : 0.22})`} strokeWidth={1} />
                  </g>
                );
              })}
            </g>

            {/* Core central */}
            <g filter="url(#coreGlow)">
              <motion.circle
                cx={CORE_X}
                cy={CORE_Y}
                r={56}
                fill={activeProject ? `rgba(${activeProject.accentRgb}, 0.10)` : "rgba(88,101,242,0.08)"}
                animate={{
                  opacity: anyActive ? 0.85 : 0.65,
                  scale: anyActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                cx={CORE_X}
                cy={CORE_Y}
                r={42}
                fill="url(#coreFill)"
                animate={{
                  opacity: anyActive ? 1 : 0.92,
                  scale: anyActive ? 1.04 : 1,
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                cx={CORE_X}
                cy={CORE_Y}
                r={72}
                fill="transparent"
                stroke={activeProject ? `rgba(${activeProject.accentRgb}, 0.40)` : "rgba(15,23,42,0.14)"}
                strokeWidth={1.5}
                animate={{
                  opacity: anyActive ? 0.9 : 0.55,
                  scale: anyActive ? 1.03 : 1,
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Ring sutil “energía” */}
              <motion.circle
                cx={CORE_X}
                cy={CORE_Y}
                r={92}
                fill="transparent"
                stroke={activeProject ? `rgba(${activeProject.accentRgb}, 0.22)` : "rgba(15,23,42,0.09)"}
                strokeWidth={1}
                strokeDasharray="6 14"
                animate={{
                  rotate: reduceMotion ? 0 : 360,
                  opacity: anyActive ? 0.95 : 0.55,
                }}
                transform={`rotate(0 ${CORE_X} ${CORE_Y})`}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        rotate: { duration: 18, ease: "linear", repeat: Infinity },
                        opacity: { duration: 0.2 },
                      }
                }
              />
            </g>
          </svg>

          {/* Cards HTML: data-driven, accesibles y con hover/focus */}
          <div className="absolute inset-0">
            {projects.map((p) => {
              const leftPct = (p.x / VB_W) * 100;
              const topPct = (p.y / VB_H) * 100;
              const isActive = activeId === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setActiveId(p.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(p.id)}
                  onBlur={() => setActiveId(null)}
                  className={[
                    "group absolute -translate-x-1/2 -translate-y-1/2 text-left",
                    "w-[190px] sm:w-[260px] md:w-[280px]",
                    "rounded-xl border bg-white/85 backdrop-blur",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-black/10",
                    isActive
                      ? "border-black/20 shadow-[0_18px_45px_rgba(2,6,23,0.14)]"
                      : "border-black/10 hover:border-black/20 hover:bg-white",
                  ].join(" ")}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  aria-label={`${p.title}. ${p.tag}. ${p.description}`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: `rgba(${p.accentRgb}, 0.95)`,
                          boxShadow: `0 0 0 4px rgba(${p.accentRgb}, 0.12), 0 0 28px rgba(${p.accentRgb}, 0.35)`,
                        }}
                      />
                      <span className="text-xs font-medium text-slate-600">{p.tag}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{p.title}</div>
                    <div className="mt-1 hidden text-xs leading-relaxed text-slate-600 sm:block">{p.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pie de sección */}
      <div className="mt-6 flex flex-col gap-2 text-center">
        <div className="text-sm text-slate-600">
          <span className="text-slate-900">Glomun Core</span> conecta producto, diseño y sistemas para entregar software sólido y escalable.
        </div>
        <div className="text-xs text-slate-500">
          Tip: pasá el mouse (o usá tab) sobre un proyecto para ver la energía recorriendo su conexión.
        </div>
      </div>
    </div>
  );
}


