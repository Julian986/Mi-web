"use client";

import type { CuotaEstado } from "@/app/admin92/contabilidad/lib/cuotaEstilos";
import type { CuotaOperativaBorder } from "@/app/admin92/contabilidad/lib/cuotaOperativa";
import { BORDER_COLORS, MARKER_COLORS } from "@/app/admin92/contabilidad/types";

const ESTADO_COLOR: Record<CuotaEstado, string> = {
  pendiente: MARKER_COLORS.cuotaPendiente,
  recordada: MARKER_COLORS.cuotaRecordada,
  pagada: MARKER_COLORS.cuotaPagada,
};

type Props = {
  estado: CuotaEstado;
  border: CuotaOperativaBorder;
  size?: "sm" | "md";
};

/** Solo borde punteado (leyenda del calendario, sin relleno) */
export function CalendarLegendBorder({
  border,
  size = "md",
}: {
  border: "cambio" | "stats";
  size?: "sm" | "md";
}) {
  const outer = size === "sm" ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]";
  const ringWidth = size === "sm" ? 1.5 : 2;
  const color = border === "cambio" ? BORDER_COLORS.cambio : BORDER_COLORS.stats;

  return (
    <span
      className={`${outer} shrink-0 rounded-full border-dashed bg-transparent`}
      style={{ borderWidth: ringWidth, borderColor: color }}
      aria-hidden
    />
  );
}

export default function CuotaCalendarDot({ estado, border, size = "sm" }: Props) {
  const fill = ESTADO_COLOR[estado];
  const hasCambio = border === "cambio" || border === "both";
  const hasStats = border === "stats" || border === "both";
  const hasBorder = border !== "none";

  const outer = size === "sm" ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]";
  const inner = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const ringWidth = size === "sm" ? 1.5 : 2;

  if (!hasBorder) {
    return (
      <span
        className={`${inner} shrink-0 rounded-full`}
        style={{ backgroundColor: fill }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={`relative flex ${outer} shrink-0 items-center justify-center`}
      title={
        border === "both"
          ? "Cambio y estadísticas pendientes"
          : hasCambio
            ? "Cambio pendiente"
            : "Estadísticas pendientes"
      }
      aria-hidden
    >
      <span className={`${inner} rounded-full`} style={{ backgroundColor: fill }} />
      {hasCambio && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full border-dashed"
          style={{
            borderWidth: ringWidth,
            borderColor: BORDER_COLORS.cambio,
            boxShadow: `0 0 0 0.5px ${BORDER_COLORS.cambio}33`,
          }}
        />
      )}
      {hasStats && (
        <span
          className={`pointer-events-none absolute rounded-full border-dashed ${
            hasCambio ? "-inset-0.5" : "inset-0"
          }`}
          style={{
            borderWidth: ringWidth,
            borderColor: BORDER_COLORS.stats,
            boxShadow: `0 0 0 0.5px ${BORDER_COLORS.stats}40`,
          }}
        />
      )}
    </span>
  );
}
