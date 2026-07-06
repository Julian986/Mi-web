export const DESARROLLO50_SERVICIOS = ["App", "Tienda", "Web", "Mantenimiento", "Otro"] as const;

export function ingresoDescripcionDesarrollo50(
  clientName: string,
  name: string,
  etapa: "inicio" | "final",
): string {
  const etapaLabel = etapa === "inicio" ? "50% inicio" : "50% final";
  return `${clientName} - ${name} (${etapaLabel})`;
}
