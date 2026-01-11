"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Development = {
  id: string;
  title: string;
  domain: string;
  url: string;
  type: "web" | "ecommerce" | "app";
  technology: string;
  image: string;
  /** Posición relativa para el cable (porcentaje del contenedor) */
  cableX: number;
  cableY: number;
  /** Color RGB "r,g,b" para acento */
  accentRgb: string;
};

const STACK_X = 50; // Porcentaje (centro)
const STACK_Y = 20; // Porcentaje (arriba)

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ViewBox fijo para SVG responsive
const VB_W = 1000;
const VB_H = 600;

function makeCablePath(sx: number, sy: number, cx: number, cy: number) {
  // Convertir porcentajes a coordenadas del viewBox
  const stackX = (sx / 100) * VB_W;
  const stackY = (sy / 100) * VB_H;
  const cardX = (cx / 100) * VB_W;
  const cardY = (cy / 100) * VB_H;

  const dx = cardX - stackX;
  const dy = cardY - stackY;
  const dist = Math.hypot(dx, dy) || 1;

  // Curvatura: más distancia => curva más amplia (pero limitada)
  const k = clamp(dist / 3.2, 100, 200);

  // Vector normalizado
  const nx = dx / dist;
  const ny = dy / dist;
  
  // Vector perpendicular para curvar
  const perpX = -ny;
  const perpY = nx;
  const bend = clamp(dist / 12, 25, 60);

  // Puntos de control para curva cúbica suave
  const c1x = stackX + nx * k + perpX * bend;
  const c1y = stackY + ny * k + perpY * bend;
  const c2x = cardX - nx * k + perpX * (bend * 0.7);
  const c2y = cardY - ny * k + perpY * (bend * 0.7);

  return `M ${stackX} ${stackY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cardX} ${cardY}`;
}

export default function ProjectsShowcase() {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Datos de desarrollos reales (placeholder por ahora, se pueden agregar más)
  const developments: Development[] = useMemo(
    () => [
      {
        id: "dev-1",
        title: "E-commerce Premium",
        domain: "tienda-ejemplo.com",
        url: "https://tienda-ejemplo.com",
        type: "ecommerce",
        technology: "Next.js",
        image: "/next.svg", // Placeholder, cambiar por imagen real
        cableX: 20,
        cableY: 85,
        accentRgb: "88,101,242",
      },
      {
        id: "dev-2",
        title: "Sitio Corporativo",
        domain: "empresa-ejemplo.com",
        url: "https://empresa-ejemplo.com",
        type: "web",
        technology: "React",
        image: "/vercel.svg", // Placeholder, cambiar por imagen real
        cableX: 50,
        cableY: 90,
        accentRgb: "124,58,237",
      },
      {
        id: "dev-3",
        title: "App Web Progresiva",
        domain: "app-ejemplo.com",
        url: "https://app-ejemplo.com",
        type: "app",
        technology: "Next.js",
        image: "/next.svg", // Placeholder, cambiar por imagen real
        cableX: 80,
        cableY: 85,
        accentRgb: "34,211,238",
      },
    ],
    []
  );

  const anyActive = activeId !== null;
  const activeDevelopment = activeId ? developments.find((d) => d.id === activeId) : null;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-6 py-12">
      {/* Stack/Pila arriba */}
      <div className="relative mb-16 flex justify-center">
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: `radial-gradient(circle, rgba(${anyActive && activeDevelopment ? activeDevelopment.accentRgb : "59,130,246"}, 0.3) 0%, transparent 70%)`,
            }}
            animate={{
              scale: anyActive ? [1, 1.2, 1] : 1,
              opacity: anyActive ? [0.4, 0.6, 0.4] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: anyActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          {/* Stack core */}
          <motion.div
            className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            animate={{
              scale: anyActive ? 1.05 : 1,
              boxShadow: anyActive
                ? `0 12px 48px rgba(${activeDevelopment?.accentRgb || "59,130,246"}, 0.25)`
                : "0 8px 32px rgba(0,0,0,0.12)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-full items-center justify-center">
              <div className="grid grid-cols-3 gap-1 p-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-white/40"
                    style={{
                      opacity: anyActive && i % 2 === 0 ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SVG Container para cables */}
      <div className="relative mb-8 h-[400px] w-full md:h-[500px]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {developments.map((dev) => (
              <linearGradient key={dev.id} id={`cable-gradient-${dev.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={`rgb(${dev.accentRgb})`}
                  stopOpacity={activeId === dev.id ? 1 : 0.2}
                />
                <stop
                  offset="100%"
                  stopColor={`rgb(${dev.accentRgb})`}
                  stopOpacity={activeId === dev.id ? 0.8 : 0.1}
                />
              </linearGradient>
            ))}
          </defs>

          {/* Cables */}
          {developments.map((dev) => {
            const path = makeCablePath(STACK_X, STACK_Y, dev.cableX, dev.cableY);
            const isActive = activeId === dev.id;

            return (
              <motion.path
                key={dev.id}
                d={path}
                fill="none"
                stroke={`url(#cable-gradient-${dev.id})`}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: isActive ? 1 : 0.4,
                  strokeWidth: isActive ? 2.5 : 1.5,
                }}
                transition={{
                  pathLength: { duration: 1.2, delay: developments.indexOf(dev) * 0.2, ease: "easeInOut" },
                  opacity: { duration: 0.3 },
                  strokeWidth: { duration: 0.3 },
                }}
              />
            );
          })}

          {/* Glow effect en el punto de conexión del cable activo */}
          {activeDevelopment && (
            <motion.circle
              cx={(activeDevelopment.cableX / 100) * VB_W}
              cy={(activeDevelopment.cableY / 100) * VB_H}
              r="8"
              fill={`rgb(${activeDevelopment.accentRgb})`}
              initial={{ opacity: 0, r: 4 }}
              animate={{
                opacity: [0.3, 1, 0.3],
                r: [6, 10, 6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </svg>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {developments.map((dev, index) => {
          const isActive = activeId === dev.id;

          return (
            <motion.div
              key={dev.id}
              className="group relative"
              onMouseEnter={() => setActiveId(dev.id)}
              onMouseLeave={() => setActiveId(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
              }}
            >
              <motion.div
                onClick={() => window.open(dev.url, "_blank", "noopener,noreferrer")}
                className="relative block cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)]"
                animate={{
                  y: isActive ? -8 : [0, -4, 0],
                  scale: isActive ? 1.02 : 1,
                  boxShadow: isActive
                    ? `0 16px 64px rgba(${dev.accentRgb}, 0.25)`
                    : "0 4px 24px rgba(0,0,0,0.08)",
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror" as const,
                    ease: "easeInOut",
                  },
                  scale: { duration: 0.3 },
                  boxShadow: { duration: 0.3 },
                }}
              >
                {/* Top accent line */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, rgb(${dev.accentRgb}) 0%, rgba(${dev.accentRgb}, 0.3) 100%)`,
                  }}
                />

                {/* Imagen */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <Image
                    src={dev.image}
                    alt={dev.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay sutil en hover */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{
                      background: `linear-gradient(135deg, rgb(${dev.accentRgb}) 0%, transparent 100%)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Type badge */}
                  <div className="mb-3">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
                      style={{
                        backgroundColor: `rgba(${dev.accentRgb}, 0.1)`,
                        color: `rgb(${dev.accentRgb})`,
                      }}
                    >
                      {dev.type === "web" ? "Sitio Web" : dev.type === "ecommerce" ? "E-commerce" : "App"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{dev.title}</h3>

                  {/* Technology */}
                  <div className="mb-4 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">{dev.technology}</span>
                  </div>

                  {/* Domain and Stats */}
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span
                        className="text-sm font-medium text-slate-700 transition-colors"
                        style={{
                          color: isActive ? `rgb(${dev.accentRgb})` : undefined,
                        }}
                      >
                        {dev.domain}
                      </span>
                    </div>
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span>Ver desarrollo</span>
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: isActive ? 4 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </motion.svg>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
