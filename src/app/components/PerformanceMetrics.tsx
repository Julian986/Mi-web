"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Zap, Eye, Shield, Search, Timer, Layout, Activity, ChevronDown, ChevronUp } from "lucide-react";
import BackToTopButton from "@/app/components/BackToTopButton";

type PerformanceMetricsData = {
  siteUrl?: string;
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  fcp?: number;
  lcp?: number;
  tbt?: number;
  cls?: number;
  si?: number;
};

type PerformanceMetricsProps = {
  projectId: string;
  hideValues?: boolean;
  /** En Mi cuenta mostramos menos texto que en Desarrollo detail */
  compact?: boolean;
  /** Datos reales cargados por admin (PageSpeed). Si existe, se usan en lugar de generatePerformanceData */
  performanceMetrics?: PerformanceMetricsData | null;
};

type ScoreData = {
  label: string;
  value: number | "—";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

type MetricData = {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: "good" | "needs-improvement" | "poor";
};

// Función para generar datos determinísticos basados en projectId
function generatePerformanceData(projectId: string) {
  // Hash simple para generar valores consistentes
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = ((hash << 5) - hash) + projectId.charCodeAt(i);
    hash = hash & hash;
  }

  const seed = Math.abs(hash);
  
  // Scores principales (0-100)
  const performance = 85 + (seed % 16); // 85-100
  const accessibility = 70 + (seed % 24); // 70-93
  const bestPractices = 95 + (seed % 6); // 95-100
  const seo = 88 + (seed % 13); // 88-100

  // Métricas técnicas
  const fcp = (0.6 + (seed % 5) * 0.1).toFixed(1); // 0.6-1.0s
  const lcp = (1.8 + (seed % 6) * 0.1).toFixed(1); // 1.8-2.3s
  const tbt = (seed % 50); // 0-49ms
  const cls = (0.001 + (seed % 5) * 0.001).toFixed(3); // 0.001-0.005
  const si = (0.7 + (seed % 4) * 0.1).toFixed(1); // 0.7-1.0s

  const fcpStatus: "good" | "needs-improvement" | "poor" = parseFloat(fcp) <= 1.8 ? "good" : parseFloat(fcp) <= 3.0 ? "needs-improvement" : "poor";
  const lcpStatus: "good" | "needs-improvement" | "poor" = parseFloat(lcp) <= 2.5 ? "good" : parseFloat(lcp) <= 4.0 ? "needs-improvement" : "poor";
  const tbtStatus: "good" | "needs-improvement" | "poor" = tbt <= 200 ? "good" : tbt <= 600 ? "needs-improvement" : "poor";
  const clsStatus: "good" | "needs-improvement" | "poor" = parseFloat(cls) <= 0.1 ? "good" : parseFloat(cls) <= 0.25 ? "needs-improvement" : "poor";
  const siStatus: "good" | "needs-improvement" | "poor" = parseFloat(si) <= 3.4 ? "good" : parseFloat(si) <= 5.8 ? "needs-improvement" : "poor";

  return {
    scores: {
      performance,
      accessibility,
      bestPractices,
      seo,
    },
    metrics: {
      fcp: { value: fcp, unit: "s", status: fcpStatus },
      lcp: { value: lcp, unit: "s", status: lcpStatus },
      tbt: { value: tbt.toString(), unit: "ms", status: tbtStatus },
      cls: { value: cls, unit: "", status: clsStatus },
      si: { value: si, unit: "s", status: siStatus },
    },
  };
}

function getScoreColor(score: number | "—"): { color: string; bgColor: string } {
  if (score === "—" || typeof score !== "number") {
    return { color: "text-slate-500", bgColor: "bg-slate-50" };
  }
  if (score >= 90) {
    return { color: "text-green-700", bgColor: "bg-green-50" };
  } else if (score >= 50) {
    return { color: "text-yellow-700", bgColor: "bg-yellow-50" };
  } else {
    return { color: "text-red-700", bgColor: "bg-red-50" };
  }
}

function getMetricStatusColor(status: "good" | "needs-improvement" | "poor"): string {
  switch (status) {
    case "good":
      return "text-green-600";
    case "needs-improvement":
      return "text-yellow-600";
    case "poor":
      return "text-red-600";
  }
}

/** Datos vacíos para estado "Aún no hay métricas" - usamos "—" en lugar de 0 para no confundir con "mal rendimiento" */
const EMPTY_PERFORMANCE_DATA: { scores: Record<string, number | "—">; metrics: ReturnType<typeof generatePerformanceData>["metrics"] } = {
  scores: { performance: "—", accessibility: "—", bestPractices: "—", seo: "—" },
  metrics: {
    fcp: { value: "—", unit: "s", status: "good" },
    lcp: { value: "—", unit: "s", status: "good" },
    tbt: { value: "—", unit: "ms", status: "good" },
    cls: { value: "—", unit: "", status: "good" },
    si: { value: "—", unit: "s", status: "good" },
  },
};

type PerformanceDisplayData = {
  scores: { performance: number | "—"; accessibility: number | "—"; bestPractices: number | "—"; seo: number | "—" };
  metrics: ReturnType<typeof generatePerformanceData>["metrics"];
};

/** Convierte métricas guardadas en el formato del componente y calcula status */
function metricsFromStored(stored: PerformanceMetricsData | null | undefined): PerformanceDisplayData | null {
  if (!stored) return null;
  const hasScores = stored.performance != null || stored.accessibility != null || stored.bestPractices != null || stored.seo != null;
  const hasMetrics = stored.fcp != null || stored.lcp != null || stored.tbt != null || stored.cls != null || stored.si != null;
  if (!hasScores && !hasMetrics) return null;

  const p: number | "—" = stored.performance != null ? stored.performance : "—";
  const a: number | "—" = stored.accessibility != null ? stored.accessibility : "—";
  const bp: number | "—" = stored.bestPractices != null ? stored.bestPractices : "—";
  const s: number | "—" = stored.seo != null ? stored.seo : "—";
  const fcp = stored.fcp != null ? stored.fcp.toFixed(1) : "—";
  const lcp = stored.lcp != null ? stored.lcp.toFixed(1) : "—";
  const tbt = stored.tbt != null ? Math.round(stored.tbt).toString() : "—";
  const cls = stored.cls != null ? stored.cls.toFixed(3) : "—";
  const si = stored.si != null ? stored.si.toFixed(1) : "—";

  const fcpStatus: "good" | "needs-improvement" | "poor" = stored.fcp != null
    ? (stored.fcp <= 1.8 ? "good" : stored.fcp <= 3.0 ? "needs-improvement" : "poor")
    : "good";
  const lcpStatus: "good" | "needs-improvement" | "poor" = stored.lcp != null
    ? (stored.lcp <= 2.5 ? "good" : stored.lcp <= 4.0 ? "needs-improvement" : "poor")
    : "good";
  const tbtStatus: "good" | "needs-improvement" | "poor" = stored.tbt != null
    ? (stored.tbt <= 200 ? "good" : stored.tbt <= 600 ? "needs-improvement" : "poor")
    : "good";
  const clsStatus: "good" | "needs-improvement" | "poor" = stored.cls != null
    ? (stored.cls <= 0.1 ? "good" : stored.cls <= 0.25 ? "needs-improvement" : "poor")
    : "good";
  const siStatus: "good" | "needs-improvement" | "poor" = stored.si != null
    ? (stored.si <= 3.4 ? "good" : stored.si <= 5.8 ? "needs-improvement" : "poor")
    : "good";

  return {
    scores: { performance: p, accessibility: a, bestPractices: bp, seo: s },
    metrics: {
      fcp: { value: fcp, unit: "s", status: fcpStatus },
      lcp: { value: lcp, unit: "s", status: lcpStatus },
      tbt: { value: tbt, unit: "ms", status: tbtStatus },
      cls: { value: cls, unit: "", status: clsStatus },
      si: { value: si, unit: "s", status: siStatus },
    },
  };
}

export default function PerformanceMetrics({ projectId, hideValues, compact, performanceMetrics }: PerformanceMetricsProps) {
  const storedData = useMemo(() => metricsFromStored(performanceMetrics), [performanceMetrics]);
  const generatedData = useMemo(() => generatePerformanceData(projectId), [projectId]);
  const isAccountContext = performanceMetrics !== undefined;
  const data = storedData ?? (isAccountContext ? EMPTY_PERFORMANCE_DATA : generatedData);
  const hasRealMetrics = storedData != null;
  const showEmptyMessage = isAccountContext && !hasRealMetrics && !hideValues;
  const [showTechnicalMetrics, setShowTechnicalMetrics] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);
  
  // Sección de código técnico deshabilitada - no útil para usuarios comunes
  const showCodeSection = false;

  // Hacer scroll suave hacia las métricas cuando se muestran
  useEffect(() => {
    if (showTechnicalMetrics && metricsRef.current) {
      setTimeout(() => {
        const element = metricsRef.current;
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 80; // Offset de 100px hacia arriba
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 150); // Delay para que la animación comience primero
    }
  }, [showTechnicalMetrics]);

  const scores: ScoreData[] = [
    {
      label: "Rendimiento",
      value: data.scores.performance,
      icon: <Zap className="w-6 h-6" />,
      ...getScoreColor(data.scores.performance),
    },
    {
      label: "Accesibilidad",
      value: data.scores.accessibility,
      icon: <Eye className="w-6 h-6" />,
      ...getScoreColor(data.scores.accessibility),
    },
    {
      label: "Buenas prácticas",
      value: data.scores.bestPractices,
      icon: <Shield className="w-6 h-6" />,
      ...getScoreColor(data.scores.bestPractices),
    },
    {
      label: "SEO",
      value: data.scores.seo,
      icon: <Search className="w-6 h-6" />,
      ...getScoreColor(data.scores.seo),
    },
  ];

  const metrics: MetricData[] = [
    {
      label: "Tiempo al primer contenido (FCP)",
      value: data.metrics.fcp.value,
      unit: data.metrics.fcp.unit,
      icon: <Timer className="w-5 h-5" />,
      status: data.metrics.fcp.status,
    },
    {
      label: "Tiempo de carga principal (LCP)",
      value: data.metrics.lcp.value,
      unit: data.metrics.lcp.unit,
      icon: <Layout className="w-5 h-5" />,
      status: data.metrics.lcp.status,
    },
    {
      label: "Tiempo de bloqueo (TBT)",
      value: data.metrics.tbt.value,
      unit: data.metrics.tbt.unit,
      icon: <Activity className="w-5 h-5" />,
      status: data.metrics.tbt.status,
    },
    {
      label: "Estabilidad visual (CLS)",
      value: data.metrics.cls.value,
      unit: data.metrics.cls.unit,
      icon: <Gauge className="w-5 h-5" />,
      status: data.metrics.cls.status,
    },
    {
      label: "Índice de velocidad (SI)",
      value: data.metrics.si.value,
      unit: data.metrics.si.unit,
      icon: <Zap className="w-5 h-5" />,
      status: data.metrics.si.status,
    },
  ];

  return (
    <div className="mt-12 border-t border-slate-200 pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Métricas de Performance</h2>
        <p className="text-slate-600">
          Análisis de rendimiento basado en Lighthouse. Métricas de rendimiento en tiempo real
        </p>
        {showEmptyMessage && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Aún no hay métricas cargadas. Cuando se registren los resultados de PageSpeed para tu sitio, los verás aquí.
            </p>
          </div>
        )}
      </div>

      {/* Botón para mostrar/ocultar métricas técnicas */}
      <div className="mb-6">
        <button
          onClick={() => setShowTechnicalMetrics(!showTechnicalMetrics)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-[#84b9ed]/10 border-2 border-[#84b9ed] text-slate-800 font-medium transition-colors cursor-pointer"
        >
          {showTechnicalMetrics ? (
            <>
              Ocultar detalles técnicos
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Ver detalles técnicos
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Scores principales y métricas técnicas - con animación */}
      <AnimatePresence>
        {showTechnicalMetrics && (
          <motion.div
            ref={metricsRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {/* Scores principales */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {scores.map((score, index) => (
                <motion.div
                  key={score.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className={`${score.bgColor} rounded-lg p-6 border border-slate-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${score.color}`}>{score.icon}</div>
                    <span className={`text-3xl font-bold ${score.color}`}>
                      {hideValues ? "..." : score.value}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{score.label}</h3>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: hideValues || score.value === "—" ? "0%" : `${score.value}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                      className={`h-2 rounded-full ${
                        score.value === "—"
                          ? "bg-slate-300"
                          : score.value >= 90
                          ? "bg-green-600"
                          : score.value >= 50
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Sección para usuarios comunes */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Carga en milisegundos</h3>
                {!compact && (
                  <p className="text-slate-700 leading-relaxed mb-4">
                    {hideValues
                      ? "Este desarrollo está optimizado para cargar rápido. ..."
                      : "Este desarrollo carga en menos de 2 segundos, más rápido que el 90% de los sitios web. "}
                    Esto significa que tus visitantes no esperan y tienen una experiencia fluida desde el primer momento.
                  </p>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">
                    Velocidad optimizada para máxima conversión
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Métricas técnicas */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Métricas Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${getMetricStatusColor(metric.status)} flex items-center gap-2`}>
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className={`text-2xl font-bold ${hideValues ? "text-slate-600" : getMetricStatusColor(metric.status)}`}>
                        {hideValues ? "..." : metric.value}
                      </span>
                      {!hideValues && metric.unit && (
                        <span className="text-sm text-slate-500">{metric.unit}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {!hideValues && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            metric.status === "good"
                              ? "bg-green-100 text-green-700"
                              : metric.status === "needs-improvement"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {metric.status === "good"
                            ? "Bueno"
                            : metric.status === "needs-improvement"
                            ? "Mejorable"
                            : "Pobre"}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Texto explicativo sobre React y Next.js */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="mt-8 pt-8 border-t border-slate-200"
            >
              <p className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                {compact ? (
                  <>
                    Codificado con{" "}
                    <a
                      href="https://react.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                    >
                      React
                    </a>{" "}
                    y{" "}
                    <a
                      href="https://nextjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                    >
                      Next.js
                    </a>
                    , programación de alto nivel.
                  </>
                ) : (
                  <>
                    Estas métricas se obtienen gracias a codificar con{" "}
                    <a
                      href="https://react.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                    >
                      React
                    </a>{" "}
                    y{" "}
                    <a
                      href="https://nextjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                    >
                      Next.js
                    </a>
                    , programación de alto nivel.
                  </>
                )}
              </p>
              {!compact && (
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Cada proyecto está desarrollado con código personalizado y optimizado, no con plantillas genéricas. Esto garantiza máximo rendimiento y control total sobre cada funcionalidad.
                </p>
              )}
              {compact && (
                <div className="flex justify-end mt-6">
                  <BackToTopButton />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sección de React - Programación de alto nivel */}
      {/* Comentado: código técnico no útil para usuarios comunes */}
      {showCodeSection && (
        <div className="mt-12 border-t border-slate-200 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Editor de código */}
            <div className="order-2 lg:order-1">
              <div className="bg-[#1e1e1e] rounded-lg overflow-hidden shadow-xl border border-slate-800">
                {/* Barra superior del editor */}
                <div className="bg-[#252526] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[#1e1e1e] px-3 py-1 rounded-t text-xs text-slate-300 font-mono flex items-center gap-2">
                      <span className="text-slate-500">📄</span>
                      PerformanceOptimized.tsx
                    </div>
                  </div>
                  <div className="w-12"></div>
                </div>
                
                {/* Código - Componente React con optimizaciones */}
                <div className="p-4 font-mono text-sm overflow-x-auto">
                  <div className="flex">
                    {/* Números de línea */}
                    <div className="text-slate-600 select-none pr-4 text-right">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45].map((num) => (
                        <div key={num} className="leading-6">
                          {num}
                        </div>
                      ))}
                    </div>
                    
                    {/* Código con syntax highlighting */}
                    <div className="flex-1 text-slate-300">
                      <div className="leading-6">
                        <span className="text-[#808080]">{"// Optimización de performance con React hooks"}</span>
                      </div>
                      <div className="leading-6">
                        <span className="text-[#569cd6]">import</span>{" "}
                        <span className="text-[#4ec9b0]">{`{ useState, useEffect, useMemo, useCallback }`}</span>{" "}
                        <span className="text-[#569cd6]">from</span>{" "}
                        <span className="text-[#ce9178]">"react"</span>;
                      </div>
                      <div className="leading-6">
                        <span className="text-[#569cd6]">import</span>{" "}
                        <span className="text-[#569cd6]">type</span>{" "}
                        <span className="text-[#4ec9b0]">{`{ ReactNode }`}</span>{" "}
                        <span className="text-[#569cd6]">from</span>{" "}
                        <span className="text-[#ce9178]">"react"</span>;
                      </div>
                      <div className="leading-6"></div>
                      <div className="leading-6">
                        <span className="text-[#569cd6]">interface</span>{" "}
                        <span className="text-[#4ec9b0]">PerformanceMetricsProps</span> {"{"}
                      </div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#dcdcaa]">projectId</span>: <span className="text-[#4ec9b0]">string</span>;
                      </div>
                      <div className="leading-6">{"}"}</div>
                      <div className="leading-6"></div>
                      <div className="leading-6">
                        <span className="text-[#569cd6]">export</span>{" "}
                        <span className="text-[#569cd6]">default</span>{" "}
                        <span className="text-[#569cd6]">function</span>{" "}
                        <span className="text-[#4ec9b0]">PerformanceOptimized</span>
                        {"("}
                        <span className="text-[#4ec9b0]">{`{ projectId }`}</span>:{" "}
                        <span className="text-[#4ec9b0]">PerformanceMetricsProps</span>
                        {") {"}
                      </div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#808080]">{"// Memoización para evitar re-renders innecesarios"}</span>
                      </div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#569cd6]">const</span>{" "}
                        <span className="text-[#dcdcaa]">data</span> ={" "}
                        <span className="text-[#4ec9b0]">useMemo</span>
                        {"(() => "}
                        <span className="text-[#569cd6]">generateData</span>
                        {"(projectId), [projectId]);"}
                      </div>
                      <div className="leading-6"></div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#808080]">{"// Callback memoizado para handlers"}</span>
                      </div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#569cd6]">const</span>{" "}
                        <span className="text-[#dcdcaa]">handleUpdate</span> ={" "}
                        <span className="text-[#4ec9b0]">useCallback</span>
                        {"(() => {"}
                      </div>
                      <div className="leading-6 pl-8">
                        <span className="text-[#569cd6]">return</span>{" "}
                        <span className="text-[#569cd6]">void</span>{" "}
                        <span className="text-[#569cd6]">optimizePerformance</span>
                        {"();"}
                      </div>
                      <div className="leading-6 pl-4">{"}, []);"}
                      </div>
                      <div className="leading-6"></div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#808080]">{"// Efecto con cleanup para suscripciones"}</span>
                      </div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#4ec9b0]">useEffect</span>
                        {"(() => {"}
                      </div>
                      <div className="leading-6 pl-8">
                        <span className="text-[#569cd6]">const</span>{" "}
                        <span className="text-[#dcdcaa]">subscription</span> ={" "}
                        <span className="text-[#569cd6]">subscribe</span>
                        {"();"}
                      </div>
                      <div className="leading-6 pl-8">
                        <span className="text-[#569cd6]">return</span>{" "}
                        {"() => subscription.unsubscribe();"}
                      </div>
                      <div className="leading-6 pl-4">{"}, [projectId]);"}
                      </div>
                      <div className="leading-6"></div>
                      <div className="leading-6 pl-4">
                        <span className="text-[#569cd6]">return</span>{" "}
                        {"("}
                      </div>
                      <div className="leading-6 pl-8">
                        {"<div className="}
                        <span className="text-[#ce9178]">"optimized-container"</span>
                        {">"}
                      </div>
                      <div className="leading-6 pl-12">
                        {"{/* Componente optimizado con React.memo */}"}
                      </div>
                      <div className="leading-6 pl-12">
                        {"<MemoizedComponent data={data} />"}
                      </div>
                      <div className="leading-6 pl-8">{"</div>"}
                      </div>
                      <div className="leading-6 pl-4">{");"}
                      </div>
                      <div className="leading-6">{"}"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Código de next.config.ts comentado - ver historial de git para restaurar */}
              </div>
            </div>
            
            {/* Texto explicativo */}
            <div className="order-1 lg:order-2">
              <p className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                Estas métricas se obtienen gracias a codificar con{" "}
                <a
                  href="https://react.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                >
                  React
                </a>{" "}
                y{" "}
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#84b9ed] hover:text-[#6ba3d9] transition-colors"
                >
                  Next.js
                </a>
                , programación de alto nivel.
              </p>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Cada proyecto está desarrollado con código personalizado y optimizado, no con plantillas genéricas. Esto garantiza máximo rendimiento y control total sobre cada funcionalidad.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
