"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChartNoAxesCombined, Wrench } from "lucide-react";
import { getAllDevelopments, type Development } from "@/app/lib/developmentsCatalog";

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
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Restaurar estado de expansión desde sessionStorage
  const [showAll, setShowAll] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("projects-showAll");
      return saved === "true";
    }
    return false;
  });
  
  const reduceMotion = useReducedMotion();

  // Datos de desarrollos desde el catálogo
  const developments: Development[] = useMemo(() => getAllDevelopments(), []);

  // Guardar estado de expansión en sessionStorage cuando cambia
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("projects-showAll", showAll.toString());
    }
  }, [showAll]);

  // Al montar, verificar si hay un projectId guardado y restaurar showAll si es necesario
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastViewedProjectId = sessionStorage.getItem("last-viewed-project-id");
      if (lastViewedProjectId) {
        const peliculasIndex = developments.findIndex((d) => d.id === "dev-peliculas");
        const initialVisibleCount = peliculasIndex !== -1 ? peliculasIndex + 1 : developments.length;
        const projectIndex = developments.findIndex((d) => d.id === lastViewedProjectId);
        
        // Si el proyecto está en la parte expandida, restaurar showAll
        if (projectIndex >= initialVisibleCount) {
          setShowAll(true);
        }
        
        // Limpiar el projectId guardado después de usarlo
        sessionStorage.removeItem("last-viewed-project-id");
      }
    }
  }, [developments]);

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

  // Calcular las cards visibles (hasta "Tienda de Películas" si showAll es false)
  const visibleDevelopments = useMemo(() => {
    if (showAll) return developments;
    const peliculasIndex = developments.findIndex((d) => d.id === "dev-peliculas");
    if (peliculasIndex === -1) return developments;
    // Incluir "Tienda de Películas" (peliculasIndex + 1)
    return developments.slice(0, peliculasIndex + 1);
  }, [developments, showAll]);

  // Verificar si hay cards ocultas
  const hasMoreCards = useMemo(() => {
    if (showAll) return false;
    const peliculasIndex = developments.findIndex((d) => d.id === "dev-peliculas");
    return peliculasIndex !== -1 && peliculasIndex + 1 < developments.length;
  }, [developments, showAll]);

  // Calcular el índice inicial (cards que ya estaban visibles)
  const initialVisibleCount = useMemo(() => {
    const peliculasIndex = developments.findIndex((d) => d.id === "dev-peliculas");
    return peliculasIndex !== -1 ? peliculasIndex + 1 : developments.length;
  }, [developments]);

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-4xl mx-auto">
        {visibleDevelopments.map((dev, index) => {
          const isActive = activeId === dev.id;
          // Para las nuevas cards que aparecen después de "Ver más", usar delay relativo desde 0
          const isNewCard = showAll && index >= initialVisibleCount;
          // Si es una nueva card, usar delay relativo desde 0. Si no, usar el delay basado en su índice
          const animationDelay = isNewCard ? (index - initialVisibleCount) * 0.1 : index * 0.1;

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
                delay: animationDelay,
                duration: 0.4,
              }}
            >
              <motion.div
                onClick={() => {
                  // Guardar el projectId antes de navegar
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("last-viewed-project-id", dev.id);
                  }
                  router.push(`/projects/${dev.id}`);
                }}
                className="relative flex items-center cursor-pointer overflow-hidden rounded-xl bg-white border border-black/10 hover:border-black/20 transition-all will-change-transform"
                animate={
                  reduceMotion || isScrolling
                    ? {
                        scale: isActive ? 1.01 : 1,
                      }
                    : {
                        y: isActive ? -2 : 0,
                        scale: isActive ? 1.01 : 1,
                      }
                }
                transition={
                  reduceMotion || isScrolling
                    ? { scale: { duration: 0.2 } }
                    : {
                        y: { duration: 0.2 },
                        scale: { duration: 0.2 },
                      }
                }
                style={{
                  boxShadow: isActive
                    ? `0 4px 12px rgba(${dev.accentRgb}, 0.15)`
                    : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {/* Thumbnail Image */}
                <div 
                  className="relative w-36 h-24 md:w-40 md:h-24 flex-shrink-0 overflow-hidden rounded-xl border flex items-center justify-center transition-colors ml-4"
                  style={{
                    backgroundColor: dev.id === "dev-3" ? "rgb(12, 16, 21)" : `rgba(${dev.accentRgb}, 0.08)`,
                    borderColor: `rgba(${dev.accentRgb}, 0.15)`,
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center p-3">
                    <Image
                      src={dev.image}
                      alt={dev.title}
                      fill
                      loading="lazy"
                      className="object-contain object-center transition-transform duration-300 group-hover:scale-110"
                      sizes="160px"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 pr-6 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Type badge */}
                    <div className="mb-1.5 flex items-center gap-2">
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
                    <h3 className="mb-2 text-base font-bold text-slate-900 text-left">{dev.title}</h3>

                    {/* Technology and Domain */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-slate-400" />
                        <span>{dev.technology}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5 text-slate-400"
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
                          className="font-medium transition-colors"
                          style={{
                            color: isActive ? `rgb(${dev.accentRgb})` : undefined,
                          }}
                        >
                          {dev.domain}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2">
                    <span>Ver desarrollo</span>
                    <motion.svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: isActive ? 3 : 0 }}
                      transition={{ duration: 0.2 }}
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

                {/* Statistics Icon */}
                <div className="absolute bottom-3 right-3 opacity-50 md:opacity-40 md:group-hover:opacity-60 transition-opacity">
                  <ChartNoAxesCombined 
                    className="h-4 w-4" 
                    style={{ color: "lab(33 -1.89 -15.95)" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Texto Ver más / Más de 200 desarrollos */}
      {hasMoreCards && (
        <div className="mt-8 max-w-4xl mx-auto flex justify-end">
          <span
            onClick={() => setShowAll(true)}
            className="text-sm text-slate-400 cursor-pointer hover:text-slate-500 transition-colors"
          >
            Ver más
          </span>
        </div>
      )}
      {showAll && (
        <div className="mt-8 max-w-4xl mx-auto flex justify-end">
          <span className="text-sm text-slate-400">
            Más de 200 desarrollos
          </span>
        </div>
      )}

      {/* Cita al final */}
      <div className="mt-12 text-center">
        <motion.p
          className="text-lg md:text-xl text-slate-600 italic font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: developments.length * 0.1 + 0.2,
            duration: 0.5,
          }}
        >
          {/* En Glomun los mantenemos, actualizamos y aseguramos de forma continua. */}
          Todos los desarrollos cuentan con mantenimiento, actualizaciones y medidas de seguridad continuas.
        </motion.p>
      </div>
    </div>
  );
}
