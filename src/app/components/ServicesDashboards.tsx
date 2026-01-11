"use client";

import React, { useMemo, useState, useEffect, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ServiceCard = {
  id: "web" | "ecommerce" | "custom";
  title: string;
  result: string;
  bullets: string[];
  delivery: string;
  ctaLabel: string;
  accent: "blue" | "cyan";
};

const DashboardCard = memo(function DashboardCard({
  data,
  floatDelay,
  floatDuration,
  offsetClassName,
  isScrolling,
}: {
  data: ServiceCard;
  floatDelay: number;
  floatDuration: number;
  offsetClassName?: string;
  isScrolling: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const dot = data.accent === "cyan" ? "bg-[rgba(34,211,238,0.60)]" : "bg-[rgba(59,130,246,0.55)]";
  const halo = data.accent === "cyan" ? "rgba(34,211,238,0.10)" : "rgba(59,130,246,0.10)";
  const halo2 = data.accent === "cyan" ? "rgba(34,211,238,0.06)" : "rgba(59,130,246,0.06)";
  const topLine = data.accent === "cyan" ? "rgba(34,211,238,0.55)" : "rgba(59,130,246,0.55)";

  return (
    <motion.div
      className={["relative will-change-transform", offsetClassName ?? ""].join(" ")}
      initial={false}
      animate={
        reduceMotion || isScrolling
          ? undefined
          : {
              y: [0, -22, 0],
              rotate: [0, 0.35, 0],
            }
      }
      transition={
        reduceMotion || isScrolling
          ? undefined
          : {
              duration: floatDuration,
              repeat: Infinity,
              ease: [0.45, 0, 0.55, 1],
              repeatType: "mirror",
              delay: floatDelay,
            }
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${halo}, transparent 55%), radial-gradient(circle at 80% 60%, ${halo2}, transparent 52%)`,
        }}
      />

      {/* Sombras comentadas para pruebas de rendimiento */}
      {/* <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_55px_rgba(2,6,23,0.10)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(2,6,23,0.14)]"> */}
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-transform duration-200 hover:-translate-y-1">
        {/* Top accent line (minimal premium) */}
        <div aria-hidden className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${topLine}, transparent)` }} />

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className={["h-2 w-2 rounded-full", dot].join(" ")} aria-hidden />
            <div className="text-base font-semibold tracking-tight text-slate-900">{data.title}</div>
          </div>
          <div className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            3 semanas
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-balance text-[22px] font-semibold tracking-tight text-slate-900">{data.result}</div>
          <ul className="mt-5 space-y-3 text-slate-600">
            {data.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-white"
                >
                  <span className={["h-2 w-2 rounded-full", dot].join(" ")} />
                </span>
                <span className="text-base leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(2,6,23,0.14)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
            >
              {data.ctaLabel}
            </button>
            <div className="text-xs text-slate-500">Sin compromiso</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function ServicesDashboards() {
  const [isScrolling, setIsScrolling] = useState(false);

  // Pausar animaciones durante el scroll
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

  const cards = useMemo<ServiceCard[]>(
    () => [
      {
        id: "web",
        title: "Sitio web",
        result: "Más consultas con un sitio rápido y claro",
        bullets: ["Diseño que guía al cliente a contactarte", "SEO técnico y performance reales", "Medición y mejoras iterativas"],
        delivery: "3 semanas",
        accent: "blue",
        ctaLabel: "Quiero una web",
      },
      {
        id: "ecommerce",
        title: "Tienda online",
        result: "Vendé más con un checkout sin fricción",
        bullets: ["Checkout optimizado para convertir", "Pagos e integraciones listos", "Panel de pedidos, stock y envíos"],
        delivery: "3 semanas",
        accent: "cyan",
        ctaLabel: "Quiero una tienda",
      },
      {
        id: "custom",
        title: "Aplicación a medida",
        result: "Automatizá procesos y ganá control operativo",
        bullets: ["Dashboards y permisos por rol", "Integraciones con tus sistemas", "Workflows que ahorran horas cada semana"],
        delivery: "3 semanas",
        accent: "blue",
        ctaLabel: "Quiero una app",
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
        <DashboardCard data={cards[0]} floatDelay={0.0} floatDuration={10.5} isScrolling={isScrolling} />
        <DashboardCard data={cards[1]} floatDelay={0.7} floatDuration={11.4} isScrolling={isScrolling} />
        <DashboardCard data={cards[2]} floatDelay={0.3} floatDuration={10.9} isScrolling={isScrolling} />
      </div>
    </div>
  );
}

