"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";

type VisitorsData = {
  date: string;
  visitors: number;
};

// Generador de números pseudoaleatorios determinístico (seeded)
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convertir string a número usando hash simple
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    this.seed = Math.abs(hash) || 1;
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }
}

type Period = "day" | "week" | "month";

// Generar datos mock realistas por día (últimos 30 días)
function generateDailyData(projectId: string): VisitorsData[] {
  const data: VisitorsData[] = [];
  const today = new Date();
  const baseVisitors = 1200;
  let trend = 0;
  const rng = new SeededRandom(projectId + "-day");

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trend += rng.next() * 2 - 0.5;
    const dayOfWeek = date.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    const randomVariation = 0.7 + rng.next() * 0.6;
    
    const visitors = Math.round((baseVisitors + trend * 10) * weekendBoost * randomVariation);
    
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const dateStr = `${day} ${month}`;

    data.push({
      date: dateStr,
      visitors: Math.max(800, visitors),
    });
  }

  return data;
}

// Generar datos mock por semana (últimas 12 semanas)
function generateWeeklyData(projectId: string): VisitorsData[] {
  const data: VisitorsData[] = [];
  const today = new Date();
  const baseVisitors = 8400; // ~1200 diarios * 7 días
  let trend = 0;
  const rng = new SeededRandom(projectId + "-week");

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
    
    trend += rng.next() * 14 - 3.5; // Variación semanal más amplia
    const randomVariation = 0.75 + rng.next() * 0.5;
    
    const visitors = Math.round((baseVisitors + trend * 70) * randomVariation);
    
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = monthNames[weekStart.getMonth()];
    const day = weekStart.getDate();
    const dateStr = `Sem ${i + 1} (${day} ${month})`;

    data.push({
      date: dateStr,
      visitors: Math.max(5600, visitors),
    });
  }

  return data;
}

// Generar datos mock por mes (últimos 12 meses)
function generateMonthlyData(projectId: string): VisitorsData[] {
  const data: VisitorsData[] = [];
  const today = new Date();
  const baseVisitors = 36000; // ~1200 diarios * 30 días
  let trend = 0;
  const rng = new SeededRandom(projectId + "-month");

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    
    trend += rng.next() * 60 - 15; // Variación mensual más amplia
    const randomVariation = 0.8 + rng.next() * 0.4;
    
    const visitors = Math.round((baseVisitors + trend * 300) * randomVariation);
    
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    const month = monthNames[monthDate.getMonth()];
    const year = monthDate.getFullYear();
    const dateStr = `${month} ${year}`;

    data.push({
      date: dateStr,
      visitors: Math.max(24000, visitors),
    });
  }

  return data;
}

type VisitorsChartProps = {
  projectId: string;
};

export default function VisitorsChart({ projectId }: VisitorsChartProps) {
  const [period, setPeriod] = useState<Period>("day");

  const data = useMemo(() => {
    switch (period) {
      case "day":
        return generateDailyData(projectId);
      case "week":
        return generateWeeklyData(projectId);
      case "month":
        return generateMonthlyData(projectId);
      default:
        return generateDailyData(projectId);
    }
  }, [projectId, period]);
  
  // Calcular estadísticas
  const totalVisitors = data.reduce((sum, d) => sum + d.visitors, 0);
  const avgVisitors = Math.round(totalVisitors / data.length);
  const maxVisitors = Math.max(...data.map((d) => d.visitors));
  const minVisitors = Math.min(...data.map((d) => d.visitors));

  // Formatear número con separador de miles
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-AR");
  };

  // Labels dinámicos según el período
  const periodLabels = {
    day: { title: "Visitantes (últimos 30 días)", subtitle: "Tendencia de visitas diarias", total: "Total (30 días)", avg: "Promedio diario" },
    week: { title: "Visitantes (últimas 12 semanas)", subtitle: "Tendencia de visitas semanales", total: "Total (12 semanas)", avg: "Promedio semanal" },
    month: { title: "Visitantes (últimos 12 meses)", subtitle: "Tendencia de visitas mensuales", total: "Total (12 meses)", avg: "Promedio mensual" },
  };

  const labels = periodLabels[period];

  return (
    <div className="w-full space-y-4">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">{labels.avg}</p>
          <p className="text-lg font-semibold text-slate-900">{formatNumber(avgVisitors)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">{labels.total}</p>
          <p className="text-lg font-semibold text-slate-900">{formatNumber(totalVisitors)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Máximo</p>
          <p className="text-lg font-semibold text-slate-900">{formatNumber(maxVisitors)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Mínimo</p>
          <p className="text-lg font-semibold text-slate-900">{formatNumber(minVisitors)}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{labels.title}</h3>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setPeriod("day")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  period === "day"
                    ? "bg-[#84b9ed] text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setPeriod("week")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  period === "week"
                    ? "bg-[#84b9ed] text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  period === "month"
                    ? "bg-[#84b9ed] text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Mes
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1e293b", fontWeight: 600, marginBottom: "4px" }}
              formatter={(value: number | undefined) => {
                if (value === undefined) return ["0", "Visitantes"];
                return [formatNumber(value), "Visitantes"];
              }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#84b9ed"
              strokeWidth={2.5}
              dot={{ fill: "#84b9ed", r: 3 }}
              activeDot={{ r: 5, fill: "#84b9ed" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
