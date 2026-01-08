"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Metric = { label: string; value: string; delta?: string };
type Row = { label: string; value: string };

type Service = {
  id: "web" | "ecommerce" | "custom";
  tabLabel: string;
  title: string;
  headline: string;
  bullets: string[];
  ctaLabel: string;
  metrics: Metric[];
  chart: number[];
  rows: Row[];
};

const fadeSwap = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

function Sparkline({ values }: { values: number[] }) {
  const w = 560;
  const h = 120;
  const pad = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const pts = values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[120px] w-full" aria-hidden>
      <defs>
        <linearGradient id="sparkStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(59,130,246,0.20)" />
          <stop offset="50%" stopColor="rgba(59,130,246,0.65)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.20)" />
        </linearGradient>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.18)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.00)" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g stroke="rgba(15,23,42,0.08)" strokeWidth="1">
        <path d={`M ${pad} ${h / 2} H ${w - pad}`} />
        <path d={`M ${pad} ${pad} H ${w - pad}`} />
        <path d={`M ${pad} ${h - pad} H ${w - pad}`} />
      </g>

      {/* Area */}
      <path
        d={`M ${pad} ${h - pad} L ${pts} L ${w - pad} ${h - pad} Z`}
        fill="url(#sparkFill)"
        opacity={0.9}
      />
      {/* Line */}
      <polyline fill="none" stroke="url(#sparkStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export default function ServicesShowcase() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<Service["id"]>("web");

  const services = useMemo<Service[]>(
    () => [
      {
        id: "web",
        tabLabel: "Sitios web",
        title: "Sitios web",
        headline: "Más consultas con un sitio rápido y claro",
        bullets: ["Diseño que guía al cliente a contactarte", "SEO técnico y performance reales", "Medición y mejoras iterativas"],
        ctaLabel: "Quiero una web",
        metrics: [
          { label: "Visitas", value: "48k", delta: "+18%" },
          { label: "Leads", value: "1,240", delta: "+22%" },
          { label: "Velocidad", value: "92/100", delta: "+14" },
        ],
        chart: [12, 14, 13, 16, 18, 17, 21, 24, 23, 26, 29, 31],
        rows: [
          { label: "Landing", value: "optimizada" },
          { label: "SEO", value: "técnico" },
          { label: "Analytics", value: "medición" },
        ],
      },
      {
        id: "ecommerce",
        tabLabel: "E‑commerce",
        title: "Tienda online (e‑commerce)",
        headline: "Vendé más con un checkout sin fricción",
        bullets: ["Checkout optimizado para convertir", "Pagos e integraciones listos", "Panel de pedidos, stock y envíos"],
        ctaLabel: "Quiero una tienda",
        metrics: [
          { label: "Pedidos", value: "860", delta: "+11%" },
          { label: "Conversión", value: "2.9%", delta: "+0.6" },
          { label: "Ticket", value: "$42", delta: "+9%" },
        ],
        chart: [18, 16, 17, 20, 22, 21, 19, 23, 26, 25, 27, 30],
        rows: [
          { label: "Checkout", value: "rápido" },
          { label: "Pagos", value: "integrados" },
          { label: "Operación", value: "simple" },
        ],
      },
      {
        id: "custom",
        tabLabel: "A medida",
        title: "Software a medida",
        headline: "Automatizá procesos y ganá control operativo",
        bullets: ["Dashboards y permisos por rol", "Integraciones con tus sistemas", "Workflows que ahorran horas cada semana"],
        ctaLabel: "Quiero software a medida",
        metrics: [
          { label: "Horas/sem", value: "–28h", delta: "↓" },
          { label: "Errores", value: "–34%", delta: "↓" },
          { label: "Operaciones", value: "12.4k", delta: "+7%" },
        ],
        chart: [10, 11, 12, 14, 13, 15, 16, 18, 19, 21, 22, 24],
        rows: [
          { label: "Automatización", value: "activa" },
          { label: "Integraciones", value: "APIs" },
          { label: "Permisos", value: "roles" },
        ],
      },
    ],
    []
  );

  const active = services.find((s) => s.id === activeId) ?? services[0];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Left: selector + venta */}
        <div className="text-left">
          <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-slate-50 p-1">
            {services.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={[
                    "inline-flex items-center justify-center rounded-full px-4 py-2 text-[15px] !leading-none transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
                    isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                  ].join(" ")}
                >
                  {s.tabLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : fadeSwap.initial}
                animate={reduceMotion ? undefined : fadeSwap.animate}
                exit={reduceMotion ? undefined : fadeSwap.exit}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="text-sm font-medium text-slate-500">{active.title}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{active.headline}</div>

                <ul className="mt-5 space-y-3 text-slate-600">
                  {active.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-white"
                      >
                        <span className="h-2 w-2 rounded-full bg-[rgba(59,130,246,0.55)]" />
                      </span>
                      <span className="text-base leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(2,6,23,0.16)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
                  >
                    {active.ctaLabel}
                  </button>
                  <div className="text-sm text-slate-500">Estimación en 48h · próximos pasos por escrito</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: preview dashboard */}
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.10),transparent_55%)]"
          />

          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_55px_rgba(2,6,23,0.10)]">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[rgba(59,130,246,0.55)]" aria-hidden />
                <div className="text-sm font-semibold text-slate-900">Dashboard</div>
              </div>
              <div className="rounded-full border border-black/10 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                B2B preview
              </div>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {active.metrics.map((m) => (
                      <div key={m.label} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                        <div className="text-xs font-medium text-slate-500">{m.label}</div>
                        <div className="mt-1 flex items-baseline justify-between gap-2">
                          <div className="text-lg font-semibold text-slate-900">{m.value}</div>
                          {m.delta ? (
                            <div className="rounded-full bg-[rgba(59,130,246,0.10)] px-2 py-0.5 text-xs font-medium text-slate-700">
                              {m.delta}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-black/10 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <div className="text-xs font-medium text-slate-500">Tendencia (últimos 30 días)</div>
                      <div className="text-xs text-slate-500">Actualizado hoy</div>
                    </div>
                    <Sparkline values={active.chart} />
                  </div>

                  <div className="mt-4 rounded-xl border border-black/10 bg-white">
                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                      <div className="text-xs font-medium text-slate-500">Resumen</div>
                      <div className="text-xs text-slate-500">Estado</div>
                    </div>
                    <div className="divide-y divide-black/10">
                      {active.rows.map((r) => (
                        <div key={r.label} className="flex items-center justify-between px-4 py-3">
                          <div className="text-sm text-slate-700">{r.label}</div>
                          <div className="text-sm font-medium text-slate-900">{r.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

