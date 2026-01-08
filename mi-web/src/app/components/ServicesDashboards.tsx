"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Metric = { label: string; value: string; delta?: string };
type Row = { label: string; value: string };

type ServiceCard = {
  id: "web" | "ecommerce" | "custom";
  title: string;
  subtitle: string;
  accent: "blue" | "cyan";
  metrics: Metric[];
  chart: number[];
  rows: Row[];
  ctaLabel: string;
};

function Sparkline({ values, accent }: { values: number[]; accent: ServiceCard["accent"] }) {
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

  const strokeMid = accent === "cyan" ? "rgba(34,211,238,0.60)" : "rgba(59,130,246,0.65)";
  const fillTop = accent === "cyan" ? "rgba(34,211,238,0.14)" : "rgba(59,130,246,0.16)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[120px] w-full" aria-hidden>
      <defs>
        <linearGradient id={`sparkStroke-${accent}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(15,23,42,0.10)" />
          <stop offset="50%" stopColor={strokeMid} />
          <stop offset="100%" stopColor="rgba(15,23,42,0.10)" />
        </linearGradient>
        <linearGradient id={`sparkFill-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </linearGradient>
      </defs>

      <g stroke="rgba(15,23,42,0.08)" strokeWidth="1">
        <path d={`M ${pad} ${h / 2} H ${w - pad}`} />
        <path d={`M ${pad} ${pad} H ${w - pad}`} />
        <path d={`M ${pad} ${h - pad} H ${w - pad}`} />
      </g>

      <path d={`M ${pad} ${h - pad} L ${pts} L ${w - pad} ${h - pad} Z`} fill={`url(#sparkFill-${accent})`} opacity={0.95} />
      <polyline
        fill="none"
        stroke={`url(#sparkStroke-${accent})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function DashboardCard({
  data,
  floatDelay,
  floatDuration,
  offsetClassName,
}: {
  data: ServiceCard;
  floatDelay: number;
  floatDuration: number;
  offsetClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const dot = data.accent === "cyan" ? "bg-[rgba(34,211,238,0.60)]" : "bg-[rgba(59,130,246,0.55)]";
  const badge = data.accent === "cyan" ? "bg-[rgba(34,211,238,0.10)]" : "bg-[rgba(59,130,246,0.10)]";
  const halo = data.accent === "cyan" ? "rgba(34,211,238,0.10)" : "rgba(59,130,246,0.10)";

  return (
    <motion.div
      className={["relative", offsetClassName ?? ""].join(" ")}
      initial={false}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -10, 0],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: floatDelay,
            }
      }
    >
      <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl" style={{ background: `radial-gradient(circle at 30% 20%, ${halo}, transparent 55%)` }} />

      <div className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_55px_rgba(2,6,23,0.10)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(2,6,23,0.14)]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className={["h-2 w-2 rounded-full", dot].join(" ")} aria-hidden />
            <div className="text-sm font-semibold text-slate-900">{data.title}</div>
          </div>
          <div className={["rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-slate-700", badge].join(" ")}>
            {data.subtitle}
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {data.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                <div className="text-xs font-medium text-slate-500">{m.label}</div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <div className="text-lg font-semibold text-slate-900">{m.value}</div>
                  {m.delta ? (
                    <div className={["rounded-full px-2 py-0.5 text-xs font-medium text-slate-700", badge].join(" ")}>
                      {m.delta}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-xs font-medium text-slate-500">Tendencia</div>
              <div className="text-xs text-slate-500">Últimos 30 días</div>
            </div>
            <Sparkline values={data.chart} accent={data.accent} />
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <div className="text-xs font-medium text-slate-500">Resumen</div>
              <div className="text-xs text-slate-500">Estado</div>
            </div>
            <div className="divide-y divide-black/10">
              {data.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-slate-700">{r.label}</div>
                  <div className="text-sm font-medium text-slate-900">{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {}}
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(2,6,23,0.14)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
            >
              {data.ctaLabel}
            </button>
            <div className="text-xs text-slate-500">Estimación en 48h</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesDashboards() {
  const cards = useMemo<ServiceCard[]>(
    () => [
      {
        id: "web",
        title: "Sitios web",
        subtitle: "Web",
        accent: "blue",
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
        ctaLabel: "Quiero una web",
      },
      {
        id: "ecommerce",
        title: "Tienda online",
        subtitle: "E‑commerce",
        accent: "cyan",
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
        ctaLabel: "Quiero una tienda",
      },
      {
        id: "custom",
        title: "Aplicación a medida",
        subtitle: "A medida",
        accent: "blue",
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
        ctaLabel: "Quiero una app",
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
        <DashboardCard data={cards[0]} floatDelay={0.0} floatDuration={6.4} offsetClassName="lg:translate-y-6" />
        <DashboardCard data={cards[1]} floatDelay={0.4} floatDuration={7.2} offsetClassName="lg:-translate-y-2" />
        <DashboardCard data={cards[2]} floatDelay={0.2} floatDuration={6.8} offsetClassName="lg:translate-y-10" />
      </div>
    </div>
  );
}

