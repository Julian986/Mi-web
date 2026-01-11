"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChartNoAxesCombined, Wrench } from "lucide-react";

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

// Código comentado para stack y cables (desactivado para pruebas de rendimiento)
// const STACK_X = 50; // Porcentaje (centro)
// const STACK_Y = 20; // Porcentaje (arriba)

// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n));
// }

// // ViewBox fijo para SVG responsive
// const VB_W = 1000;
// const VB_H = 600;

// function makeCablePath(sx: number, sy: number, cx: number, cy: number) {
//   // Convertir porcentajes a coordenadas del viewBox
//   const stackX = (sx / 100) * VB_W;
//   const stackY = (sy / 100) * VB_H;
//   const cardX = (cx / 100) * VB_W;
//   const cardY = (cy / 100) * VB_H;

//   const dx = cardX - stackX;
//   const dy = cardY - stackY;
//   const dist = Math.hypot(dx, dy) || 1;

//   // Curvatura: más distancia => curva más amplia (pero limitada)
//   const k = clamp(dist / 3.2, 100, 200);

//   // Vector normalizado
//   const nx = dx / dist;
//   const ny = dy / dist;
  
//   // Vector perpendicular para curvar
//   const perpX = -ny;
//   const perpY = nx;
//   const bend = clamp(dist / 12, 25, 60);

//   // Puntos de control para curva cúbica suave
//   const c1x = stackX + nx * k + perpX * bend;
//   const c1y = stackY + ny * k + perpY * bend;
//   const c2x = cardX - nx * k + perpX * (bend * 0.7);
//   const c2y = cardY - ny * k + perpY * (bend * 0.7);

//   return `M ${stackX} ${stackY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cardX} ${cardY}`;
// }

export default function ProjectsShowcase() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const reduceMotion = useReducedMotion();

  // Pausar animaciones durante el scroll para mejorar rendimiento
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Memoizar callbacks para evitar re-renders
  const handleMouseEnter = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveId(null);
  }, []);

  // Datos de desarrollos reales (placeholder por ahora, se pueden agregar más)
  const developments: Development[] = useMemo(
    () => [
      {
        id: "dev-1",
        title: "Amo mi casa",
        domain: "amomicasahome.com",
        url: "https://amomicasahome.com",
        type: "ecommerce",
        technology: "Next.js",
        image: "https://res.cloudinary.com/dzoupwn0e/image/upload/v1768140895/amo-mi-casa_qwg5tb.webp",
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

  // Variables comentadas (usadas solo en código de stack/cables desactivado)
  // const anyActive = activeId !== null;
  // const activeDevelopment = activeId ? developments.find((d) => d.id === activeId) : null;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-6 py-12 overflow-x-hidden">
      {/* Stack/Pila arriba - COMENTADO PARA PRUEBAS DE RENDIMIENTO */}
      {/* <div className="relative mb-16 flex justify-center">
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full blur-2xl will-change-transform"
            style={{
              background: `radial-gradient(circle, rgba(${anyActive && activeDevelopment ? activeDevelopment.accentRgb : "59,130,246"}, 0.3) 0%, transparent 70%)`,
            }}
            animate={
              reduceMotion || isScrolling
                ? {}
                : {
                    scale: anyActive ? [1, 1.2, 1] : 1,
                    opacity: anyActive ? [0.4, 0.6, 0.4] : 0.2,
                  }
            }
            transition={{
              duration: 2,
              repeat: anyActive && !isScrolling ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)] will-change-transform"
            animate={
              reduceMotion
                ? {}
                : {
                    scale: anyActive ? 1.05 : 1,
                  }
            }
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: anyActive
                ? `0 12px 48px rgba(${activeDevelopment?.accentRgb || "59,130,246"}, 0.25)`
                : "0 8px 32px rgba(0,0,0,0.12)",
            }}
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
                  pathLength: reduceMotion ? 1 : 1,
                  opacity: isActive ? 1 : 0.4,
                  strokeWidth: isActive ? 2.5 : 1.5,
                }}
                transition={{
                  pathLength: {
                    duration: reduceMotion ? 0 : 1.2,
                    delay: reduceMotion ? 0 : developments.indexOf(dev) * 0.2,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 0.3 },
                  strokeWidth: { duration: 0.3 },
                }}
              />
            );
          })}

          {activeDevelopment && !isScrolling && (
            <motion.circle
              cx={(activeDevelopment.cableX / 100) * VB_W}
              cy={(activeDevelopment.cableY / 100) * VB_H}
              r="8"
              fill={`rgb(${activeDevelopment.accentRgb})`}
              initial={{ opacity: 0, r: 4 }}
              animate={
                reduceMotion
                  ? { opacity: 0.7, r: 8 }
                  : {
                      opacity: [0.3, 1, 0.3],
                      r: [6, 10, 6],
                    }
              }
              transition={
                reduceMotion
                  ? {}
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          )}
        </svg>
      </div> */}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {developments.map((dev, index) => {
          const isActive = activeId === dev.id;

          return (
              <motion.div
              key={dev.id}
              className="group relative"
              onMouseEnter={() => handleMouseEnter(dev.id)}
              onMouseLeave={handleMouseLeave}
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
                className="relative block cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] will-change-transform"
                animate={
                  reduceMotion || isScrolling
                    ? {
                        scale: isActive ? 1.02 : 1,
                      }
                    : {
                        y: isActive ? -8 : [0, -4, 0],
                        scale: isActive ? 1.02 : 1,
                      }
                }
                transition={
                  reduceMotion || isScrolling
                    ? { scale: { duration: 0.3 } }
                    : {
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "mirror" as const,
                          ease: "easeInOut",
                        },
                        scale: { duration: 0.3 },
                      }
                }
                style={{
                  boxShadow: isActive
                    ? `0 16px 64px rgba(${dev.accentRgb}, 0.25)`
                    : "0 4px 24px rgba(0,0,0,0.08)",
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
                    loading="lazy"
                    className="object-cover object-[center_top] transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+"
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
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: `rgb(${dev.accentRgb})`,
                      }}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {dev.type === "web" ? "Sitio Web" : dev.type === "ecommerce" ? "E-commerce" : "App"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{dev.title}</h3>

                  {/* Technology */}
                  <div className="mb-4 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-slate-500" />
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
                    <ChartNoAxesCombined className="h-4 w-4 text-slate-400" />
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
